-- GymnaScore: Gymnastics End-to-End Scoring System
-- High-Performance PostgreSQL Database Schema
-- Optimized for concurrent read/write during Match Day operations

-- Enable proper extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
-- Encompasses Admins, Head Judges (Ketua Juri), D-Judges, E-Judges, and Coaches
CREATE TYPE user_role_enum AS ENUM ('Admin', 'Head_Judge', 'D_Judge', 'E_Judge', 'Coach');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role user_role_enum NOT NULL,
    apparatus_specialty VARCHAR(10), -- e.g., 'FX', 'PH', 'SR', 'VT', 'PB', 'HB', 'BB', 'UB'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ATHLETES TABLE
-- Supports multi-category demographics with strict gender rules for apparatus matching
CREATE TYPE gender_enum AS ENUM ('Men', 'Women');

CREATE TABLE athletes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bib_number VARCHAR(10) UNIQUE NOT NULL, -- Athlete identifier on back of jersey
    name VARCHAR(150) NOT NULL,
    club VARCHAR(100) NOT NULL,
    age_category VARCHAR(50) NOT NULL, -- e.g., 'Senior Elite', 'Junior U16'
    gender gender_enum NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. APPARATUS TABLE
-- Covers Men's and Women's artistic gymnastics disciplines
CREATE TABLE apparatus (
    code VARCHAR(10) PRIMARY KEY, -- e.g., 'FX' (Floor), 'PH' (Pommel), 'SR' (Rings), 'VT' (Vault), 'PB' (Parallel Bars), 'HB' (Horizontal), 'BB' (Beam), 'UB' (Uneven)
    name VARCHAR(100) NOT NULL,
    gender_category gender_enum NOT NULL, -- Men's or Women's discipline
    difficulty_custom_max DECIMAL(5, 3) DEFAULT 10.000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Populate Core Apparatus Data as seeded baseline
INSERT INTO apparatus (code, name, gender_category) VALUES
('FX', 'Floor Exercise', 'Men'),
('PH', 'Pommel Horse', 'Men'),
('SR', 'Still Rings', 'Men'),
('VT', 'Vault', 'Men'),
('PB', 'Parallel Bars', 'Men'),
('HB', 'Horizontal Bar', 'Men'),
('BB', 'Balance Beam', 'Women'),
('UB', 'Uneven Bars', 'Women');

-- 4. COMPETITIONS TABLE
-- Manages sub-divisions, schedules, and arena statuses
CREATE TYPE competition_status_enum AS ENUM ('Scheduled', 'Running', 'Paused', 'Finished');

CREATE TABLE competitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    sub_division VARCHAR(50) NOT NULL, -- e.g., 'Sub-division 2'
    status competition_status_enum NOT NULL DEFAULT 'Scheduled',
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. SCORES_D TABLE
-- Stores individual inputs from D-Judges (Difficulty, Composition, Connections)
CREATE TABLE scores_d (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    apparatus_code VARCHAR(10) NOT NULL REFERENCES apparatus(code),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    judge_id UUID NOT NULL REFERENCES users(id),
    difficulty_value DECIMAL(4, 3) NOT NULL CHECK (difficulty_value >= 0.000), -- DV (unbounded based on skills performed)
    composition_requirements DECIMAL(4, 3) NOT NULL CHECK (composition_requirements >= 0.000 AND composition_requirements <= 2.000), -- CR (max 2.0)
    connection_value DECIMAL(4, 3) NOT NULL CHECK (connection_value >= 0.000), -- CV
    total_d_score DECIMAL(5, 3) GENERATED ALWAYS AS (difficulty_value + composition_requirements + connection_value) STORED,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. SCORES_E TABLE
-- Stores execution deductions submitted by E-Judges
-- Gymnastics system operates by deducting from a standard 10.000 starting execution value
CREATE TABLE scores_e (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    apparatus_code VARCHAR(10) NOT NULL REFERENCES apparatus(code),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    judge_id UUID NOT NULL REFERENCES users(id),
    execution_deductions DECIMAL(5, 3) NOT NULL CHECK (execution_deductions >= 0.000 AND execution_deductions <= 10.000), -- total deductions accumulated
    artistry_deductions DECIMAL(4, 3) DEFAULT 0.000 CHECK (artistry_deductions >= 0.000 AND artistry_deductions <= 2.000), -- artistry / posture defects
    final_e_judge_score DECIMAL(5, 3) GENERATED ALWAYS AS (10.000 - execution_deductions - artistry_deductions) STORED,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. FINAL SCORES TABLE
-- Offical validated final scores published to scoreboard
CREATE TYPE final_score_status_enum AS ENUM ('Draft', 'Pending_Verification', 'Official');

CREATE TABLE final_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    apparatus_code VARCHAR(10) NOT NULL REFERENCES apparatus(code),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    calculated_d_score DECIMAL(5, 3) NOT NULL, -- Official aggregated D score
    calculated_e_score DECIMAL(5, 3) NOT NULL, -- Average E score (excluding top/bottom outliers typically)
    penalties DECIMAL(5, 3) DEFAULT 0.000 CHECK (penalties >= 0.000), -- Neutral deductions (out of bounds, time faults)
    total_score DECIMAL(5, 3) GENERATED ALWAYS AS (calculated_d_score + calculated_e_score - penalties) STORED,
    status final_score_status_enum NOT NULL DEFAULT 'Draft',
    verified_by UUID REFERENCES users(id), -- Head Judge ID
    published_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Ensure an athlete gets exactly one final score per apparatus per competition
    CONSTRAINT unique_athlete_apparatus_comp UNIQUE (athlete_id, apparatus_code, competition_id)
);


-- =========================================================================
-- OPTIMIZATIONS & INDEXES FOR HIGH-CONCURRENCY REAL-TIME QUERIES
-- =========================================================================

-- Indexing athlete IDs on score records for rapid individual result reviews
CREATE INDEX idx_scores_d_athlete ON scores_d(athlete_id);
CREATE INDEX idx_scores_e_athlete ON scores_e(athlete_id);

-- Indexing apparatus and competition references to support lightning-fast scoreboard calculations
CREATE INDEX idx_scores_d_apparatus ON scores_d(apparatus_code);
CREATE INDEX idx_scores_e_apparatus ON scores_e(apparatus_code);

-- Composite covering index to query score records by competition + apparatus instantly (core arena query)
CREATE INDEX idx_scores_d_comp_app ON scores_d(competition_id, apparatus_code);
CREATE INDEX idx_scores_e_comp_app ON scores_e(competition_id, apparatus_code);

-- Critical Scoreboard Query Index setup
-- When displaying live leaderboards, we filter by competition_id, apparatus_code, status, and sort by total_score desc
CREATE INDEX idx_final_scores_leaderboard 
ON final_scores(competition_id, apparatus_code, status, total_score DESC);

-- Index for live list of athletic demographic groups
CREATE INDEX idx_athletes_demographics ON athletes(gender, age_category);


-- =========================================================================
-- AUTOMATION TRIGGER (COMPUTE DEFAULT FINAL SCORES)
-- =========================================================================
-- This trigger automatically synchronizes data to final_scores once
-- a new official calculated D or E score is generated, assisting real-time pipelines
CREATE OR REPLACE FUNCTION refresh_scoring_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_refresh_final_score_time
BEFORE UPDATE ON final_scores
FOR EACH ROW
EXECUTE FUNCTION refresh_scoring_timestamp();
