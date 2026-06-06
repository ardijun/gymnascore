import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Award, 
  Tv, 
  Calculator, 
  HelpCircle, 
  Info, 
  ShieldAlert, 
  Sparkles,
  Layers
} from 'lucide-react';
import { Athlete, LiveScoreboardEntry, ActiveApparatusEvent } from '../types';
import ActiveApparatusMonitor from '../components/ActiveApparatusMonitor';
import JudgeScoringSimulator from '../components/JudgeScoringSimulator';
import LeadLeaderboard from '../components/LeadLeaderboard';
import { navigateTo } from '../lib/navigation';

interface JuriPageProps {
  athletes: Athlete[];
  standings: LiveScoreboardEntry[];
  arenas: ActiveApparatusEvent[];
  selectedApparatus: string;
  setSelectedApparatus: (code: string) => void;
  handleNewScoreSubmitted: (newScore: Omit<LiveScoreboardEntry, 'rank'>) => void;
  isLiveWsFeed: boolean;
  juriRole: 'D' | 'E' | 'Neutral';
}

export default function JuriPage({
  athletes,
  standings,
  arenas,
  selectedApparatus,
  setSelectedApparatus,
  handleNewScoreSubmitted,
  isLiveWsFeed,
  juriRole
}: JuriPageProps) {

  const [activeSubTab, setActiveSubTab] = useState<'monitor' | 'calculator'>('monitor');

  const handleBackToPortal = () => {
    navigateTo('/');
  };

  // Sort and display standings
  const filteredStandings = standings
    .filter(s => selectedApparatus === 'ALL' || s.apparatusCode === selectedApparatus)
    .sort((a, b) => a.rank - b.rank);

  // Score parameters linked to active judge form selection
  const currentAppCode = selectedApparatus === 'ALL' ? 'FX' : selectedApparatus;
  const currentAppName = arenas.find(a => a.apparatusCode === currentAppCode)?.apparatusName || 'Floor Exercise';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-rose-500/20">
      
      {/* PAGE HEADER NAVIGATION */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToPortal}
              className="p-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Portal Utama</span>
            </button>
            <div className="h-6 w-px bg-slate-200"></div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-xs sm:text-sm tracking-widest text-slate-900">MAJELIS ARBITRASI JURI</span>
                <span className="px-1.5 py-0.2 text-[8px] font-mono font-bold bg-rose-100 text-rose-700 rounded border border-rose-200 uppercase">OFFICIAL</span>
              </div>
              <p className="text-[9px] text-slate-400 font-mono">Input Skor Real-Time Konfederasi FIG</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] border px-3 py-1 rounded-full font-bold font-mono uppercase tracking-widest ${
              juriRole === 'D' 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                : juriRole === 'E' 
                  ? 'bg-rose-50 border-rose-200 text-rose-700' 
                  : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              ⚖️ JURI PANEL {juriRole === 'D' ? 'D (CES / KESULITAN)' : juriRole === 'E' ? 'E (EKSEKUSI)' : 'NEUTRAL / KEPALA'}
            </span>
          </div>

        </div>
      </header>

      {/* COMPONENT BODY */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full space-y-8">
        
        {/* UPPER ANNOUNCEMENT HERO SHARP CONTRAST */}
        <div className="bg-gradient-to-r from-rose-800 via-red-900 to-rose-950 text-white rounded-3xl p-6 sm:p-7 shadow-sm border border-rose-800/20 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[250px] h-[250px] bg-rose-500/10 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="max-w-3xl relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1 bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold text-rose-200 uppercase tracking-widest">
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              REFEREE ETHICS CODE 2025-2028
            </div>
            
            <h2 className="text-lg sm:text-xl md:text-2xl font-display font-black">
              Kalkulator Arbitrasi Resmi Federasi Gymnastics
            </h2>
            
            <p className="text-3xs sm:text-2xs text-rose-100/90 leading-relaxed font-mono">
              Sesuai ketetapan FIG, setiap penilaian yang diunggah harus mematuhi pembagian D-Score (Penilaian Kesulitan DV + CR + Connection Value) dan E-Score (Eksekusi dasar 10.0 dikurangi potongan deficit visual).
            </p>
          </div>
        </div>

        {/* SUBTAB TOGGLERS */}
        <div className="flex border-b border-slate-200 gap-1.5">
          <button
            onClick={() => setActiveSubTab('monitor')}
            className={`px-5 py-2.5 text-xs font-display font-black tracking-wide border-b-2 cursor-pointer transition-all ${
              activeSubTab === 'monitor'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Tv className="w-4 h-4 inline-block mr-1.5 shrink-0 align-sub" /> Terminal Monitor Arena Aktif
          </button>
          <button
            onClick={() => setActiveSubTab('calculator')}
            className={`px-5 py-2.5 text-xs font-display font-black tracking-wide border-b-2 cursor-pointer transition-all ${
              activeSubTab === 'calculator'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4 inline-block mr-1.5 shrink-0 align-sub" /> Kalkulator & Kirim Slip Nilai
          </button>
        </div>

        {/* 1. MONITOR TAB */}
        {activeSubTab === 'monitor' && (
          <div className="space-y-6">
            <ActiveApparatusMonitor 
              events={arenas} 
              activeFilter={selectedApparatus}
              onSelectApparatus={(code) => setSelectedApparatus(code)}
            />
          </div>
        )}

        {/* 2. CALCULATOR FORM TAB */}
        {activeSubTab === 'calculator' && (
          <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-3xl shadow-xs space-y-6">
            
            <div>
              <h4 className="text-sm font-display font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Calculator className="w-4.5 h-4.5 text-rose-500" />
                DRAF EVALUASI JURI — ALAT: {currentAppCode} ({currentAppName})
              </h4>
              <p className="text-2xs text-slate-500 mt-1">
                Silakan pilih nama atlet aktif yang saat ini sedang menempati arena, tumpuk nilai komponen dari kesulitan rutin gerakan serta potongan penalty. Rincian akan langsung terenkripsi ke database leaderboard.
              </p>
            </div>

            <JudgeScoringSimulator 
              athletes={athletes.filter(ath => selectedApparatus === 'ALL' || ath.gender === (selectedApparatus === 'BB' || selectedApparatus === 'UB' ? 'Women' : 'Men'))}
              apparatusCode={currentAppCode}
              apparatusName={currentAppName}
              juriRole={juriRole}
              onNewScoreSubmitted={(score) => {
                handleNewScoreSubmitted(score);
                // Switch smooth look to terminal
                setActiveSubTab('monitor');
              }}
            />
          </div>
        )}

        {/* INTEGRATED BOARD: BROADCAST LEADERBOARD TAB */}
        <div id="integrated-board-tab" className="border-t border-slate-200 pt-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded bg-rose-500 animate-pulse"></span>
            <span className="text-[9px] font-mono font-bold uppercase text-slate-450 tracking-wider">
              PANEL EVALUASI KLASEMEN JURI TERBARU
            </span>
          </div>
          <LeadLeaderboard 
            entries={filteredStandings}
            selectedApparatus={selectedApparatus}
            onFilterChange={(code) => setSelectedApparatus(code)}
            isSimulatingLive={isLiveWsFeed}
          />
        </div>

      </main>

      {/* STANDALONE FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-3xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Jakarta International Open Gymnastics • Official Arbitration Panel © 2026
          </div>
          <div>
            <span className="text-rose-600 font-bold">Judges Ledger: Synchronized</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
