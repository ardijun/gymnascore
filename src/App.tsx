import React, { useState, useEffect } from 'react';
import { Athlete, LiveScoreboardEntry, ActiveApparatusEvent, Competition, Account, CertificateTemplate } from './types';
import PortalSelectorPage from './pages/PortalSelectorPage';
import PesertaPage from './pages/PesertaPage';
import PanitiaPage from './pages/PanitiaPage';
import JuriPage from './pages/JuriPage';
import SuperadminPage from './pages/SuperadminPage';
import Sidebar from './components/Sidebar';
import RoleLogin from './components/RoleLogin';
import { Menu } from 'lucide-react';
import { generateSalt, hashPassword } from './lib/crypto';
import { generateDefaultCertificateTemplate } from './lib/certificate';

// Seed Athletes according to Indonesian Elite National Gymnastic Teams & demographies
const SEED_ATHLETES: Athlete[] = [
  { id: 'ath-1', name: 'Abiyu Rafi', club: 'Jawa Timur', ageCategory: 'Senior Elite', gender: 'Men' },
  { id: 'ath-2', name: 'Rifda Irfanaluthfi', club: 'DKI Jakarta', ageCategory: 'Senior Elite', gender: 'Women' },
  { id: 'ath-3', name: 'Fajar Abdul Rohman', club: 'Jawa Barat', ageCategory: 'Senior Elite', gender: 'Men' },
  { id: 'ath-4', name: 'Ameera Rahmajanni', club: 'Sumatera Barat', ageCategory: 'Junior Elite U16', gender: 'Women' },
  { id: 'ath-5', name: 'Joseph Judah', club: 'DKI Jakarta', ageCategory: 'Senior Elite', gender: 'Men' },
  { id: 'ath-6', name: 'Muthia Nurida', club: 'Jawa Tengah', ageCategory: 'Senior Elite', gender: 'Women' },
  { id: 'ath-7', name: 'Salsabila Hadi', club: 'DKI Jakarta', ageCategory: 'Junior Elite U16', gender: 'Women' },
  { id: 'ath-8', name: 'Yofie Laksana', club: 'Lampung', ageCategory: 'Senior Elite', gender: 'Men' },
];

const INITIAL_COMPETITIONS: Competition[] = [
  {
    id: 'comp-1',
    name: 'Jakarta International Gymnastics Open 2026',
    location: 'GOR Senayan, Jakarta',
    date: '2026-06-15',
    status: 'Active'
  },
  {
    id: 'comp-2',
    name: 'Piala Presiden Gymnastics Championship',
    location: 'GOR Ragunan, Jakarta',
    date: '2026-08-20',
    status: 'Upcoming'
  },
  {
    id: 'comp-3',
    name: 'Kejuaraan Nasional Senam Artistik 2025',
    location: 'GOR Unesa, Surabaya',
    date: '2025-11-10',
    status: 'Completed'
  }
];

// Initial Live Standings
const INITIAL_STANDINGS: LiveScoreboardEntry[] = [
  // Floor Exercise (FX)
  {
    rank: 1,
    athleteId: 'ath-1',
    athleteName: 'Abiyu Rafi',
    club: 'Jawa Timur',
    ageCategory: 'Senior Elite',
    gender: 'Men',
    apparatusCode: 'FX',
    apparatusName: 'Floor Exercise',
    scoreD: 5.600,
    scoreE: 8.850,
    penalties: 0.100,
    totalScore: 14.350,
    status: 'Official',
    lastUpdated: new Date().toISOString()
  },
  {
    rank: 2,
    athleteId: 'ath-3',
    athleteName: 'Fajar Abdul Rohman',
    club: 'Jawa Barat',
    ageCategory: 'Senior Elite',
    gender: 'Men',
    apparatusCode: 'FX',
    apparatusName: 'Floor Exercise',
    scoreD: 5.400,
    scoreE: 8.700,
    penalties: 0.000,
    totalScore: 14.100,
    status: 'Official',
    lastUpdated: new Date().toISOString()
  },
  {
    rank: 3,
    athleteId: 'ath-8',
    athleteName: 'Yofie Laksana',
    club: 'Lampung',
    ageCategory: 'Senior Elite',
    gender: 'Men',
    apparatusCode: 'FX',
    apparatusName: 'Floor Exercise',
    scoreD: 5.200,
    scoreE: 8.450,
    penalties: 0.000,
    totalScore: 13.650,
    status: 'Official',
    lastUpdated: new Date().toISOString()
  },

  // Balance Beam (BB)
  {
    rank: 1,
    athleteId: 'ath-2',
    athleteName: 'Rifda Irfanaluthfi',
    club: 'DKI Jakarta',
    ageCategory: 'Senior Elite',
    gender: 'Women',
    apparatusCode: 'BB',
    apparatusName: 'Balance Beam',
    scoreD: 5.805,
    scoreE: 8.900,
    penalties: 0.000,
    totalScore: 14.705,
    status: 'Official',
    lastUpdated: new Date().toISOString()
  },
  {
    rank: 2,
    athleteId: 'ath-6',
    athleteName: 'Muthia Nurida',
    club: 'Jawa Tengah',
    ageCategory: 'Senior Elite',
    gender: 'Women',
    apparatusCode: 'BB',
    apparatusName: 'Balance Beam',
    scoreD: 5.300,
    scoreE: 8.600,
    penalties: 0.100,
    totalScore: 13.800,
    status: 'Official',
    lastUpdated: new Date().toISOString()
  },

  // Uneven Bars (UB)
  {
    rank: 1,
    athleteId: 'ath-4',
    athleteName: 'Ameera Rahmajanni',
    club: 'Sumatera Barat',
    ageCategory: 'Junior Elite U16',
    gender: 'Women',
    apparatusCode: 'UB',
    apparatusName: 'Uneven Bars',
    scoreD: 5.100,
    scoreE: 8.400,
    penalties: 0.000,
    totalScore: 13.500,
    status: 'Official',
    lastUpdated: new Date().toISOString()
  },
  {
    rank: 2,
    athleteId: 'ath-7',
    athleteName: 'Salsabila Hadi',
    club: 'DKI Jakarta',
    ageCategory: 'Junior Elite U16',
    gender: 'Women',
    apparatusCode: 'UB',
    apparatusName: 'Uneven Bars',
    scoreD: 4.800,
    scoreE: 8.250,
    penalties: 0.000,
    totalScore: 13.050,
    status: 'Official',
    lastUpdated: new Date().toISOString()
  },
  
  // Pommel Horse (PH)
  {
    rank: 1,
    athleteId: 'ath-5',
    athleteName: 'Joseph Judah',
    club: 'DKI Jakarta',
    ageCategory: 'Senior Elite',
    gender: 'Men',
    apparatusCode: 'PH',
    apparatusName: 'Pommel Horse',
    scoreD: 5.500,
    scoreE: 8.800,
    penalties: 0.000,
    totalScore: 14.300,
    status: 'Official',
    lastUpdated: new Date().toISOString()
  }
];

// Seed active app status monitor
const INITIAL_ARENAS: ActiveApparatusEvent[] = [
  {
    apparatusCode: 'FX',
    apparatusName: 'Floor Exercise',
    currentAthleteName: 'Abiyu Rafi',
    currentAthleteClub: 'Jawa Timur',
    status: 'Routine',
    activeJudgesCount: 5,
  },
  {
    apparatusCode: 'BB',
    apparatusName: 'Balance Beam',
    currentAthleteName: 'Rifda Irfanaluthfi',
    currentAthleteClub: 'DKI Jakarta',
    status: 'Scoring',
    activeJudgesCount: 5,
  },
  {
    apparatusCode: 'UB',
    apparatusName: 'Uneven Bars',
    currentAthleteName: 'Ameera Rahmajanni',
    currentAthleteClub: 'Sumatera Barat',
    status: 'Warm_up',
    activeJudgesCount: 4,
  },
  {
    apparatusCode: 'PH',
    apparatusName: 'Pommel Horse',
    currentAthleteName: 'Joseph Judah',
    currentAthleteClub: 'DKI Jakarta',
    status: 'Idle',
    activeJudgesCount: 5,
  }
];

export default function App() {
  const [path, setPath] = useState<string>(window.location.hash || '#/');
  const [selectedApparatus, setSelectedApparatus] = useState<string>('ALL');
  const [standings, setStandings] = useState<LiveScoreboardEntry[]>(INITIAL_STANDINGS);
  const [arenas, setArenas] = useState<ActiveApparatusEvent[]>(INITIAL_ARENAS);
  const [athletes, setAthletes] = useState<Athlete[]>(SEED_ATHLETES);
  const [isLiveWsFeed, setIsLiveWsFeed] = useState<boolean>(true);
  const [competitions, setCompetitions] = useState<Competition[]>(INITIAL_COMPETITIONS);
  const [certificateTemplates, setCertificateTemplates] = useState<CertificateTemplate[]>(() => {
    const stored = localStorage.getItem('gymnascore_cert_templates');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    return [generateDefaultCertificateTemplate()];
  });
  
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [authStates, setAuthStates] = useState<{
    peserta: boolean;
    juri: boolean;
    juriRole: 'D' | 'E' | 'Neutral' | null;
    panitia: boolean;
    superadmin: boolean;
    currentUserName?: string | null;
    currentUserUsername?: string | null;
    currentAthleteId?: string | null;
  }>(() => {
    try {
      const saved = localStorage.getItem('gymnascore_auth_states');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          peserta: !!parsed.peserta,
          juri: !!parsed.juri,
          juriRole: parsed.juriRole || null,
          panitia: !!parsed.panitia,
          superadmin: !!parsed.superadmin,
          currentUserName: parsed.currentUserName || null,
          currentUserUsername: parsed.currentUserUsername || null,
          currentAthleteId: parsed.currentAthleteId || null
        };
      }
      return { peserta: false, juri: false, juriRole: null, panitia: false, superadmin: false, currentUserName: null, currentUserUsername: null, currentAthleteId: null };
    } catch (e) {
      return { peserta: false, juri: false, juriRole: null, panitia: false, superadmin: false, currentUserName: null, currentUserUsername: null, currentAthleteId: null };
    }
  });

  useEffect(() => {
    localStorage.setItem('gymnascore_auth_states', JSON.stringify(authStates));
  }, [authStates]);

  useEffect(() => {
    localStorage.setItem('gymnascore_cert_templates', JSON.stringify(certificateTemplates));
  }, [certificateTemplates]);

  // ASYNC SEED ACCOUNTS ON SYSTEM LAUNCH (Exclusively created by Superadmin originally)
  useEffect(() => {
    const seedAccountsIfNeeded = async () => {
      const existing = localStorage.getItem('gymnascore_accounts');
      if (existing) return;

      const defaultUsers = [
        { username: 'superadmin', name: 'Super Administrator', password: 'superadmin123', role: 'superadmin' },
        { username: 'panitia', name: 'Staff Panitia Official', password: 'panitia123', role: 'panitia' },
        { username: 'abiyu.rafi', name: 'Abiyu Rafi', password: 'peserta123', role: 'peserta', athleteId: 'ath-1' },
        { username: 'rifda.irfanaluthfi', name: 'Rifda Irfanaluthfi', password: 'peserta123', role: 'peserta', athleteId: 'ath-2' },
        { username: 'fajar.abdul', name: 'Fajar Abdul Rohman', password: 'peserta123', role: 'peserta', athleteId: 'ath-3' },
        { username: 'ameera.rahmajanni', name: 'Ameera Rahmajanni', password: 'peserta123', role: 'peserta', athleteId: 'ath-4' },
        { username: 'joseph.judah', name: 'Joseph Judah', password: 'peserta123', role: 'peserta', athleteId: 'ath-5' },
        { username: 'muthia.nurida', name: 'Muthia Nurida', password: 'peserta123', role: 'peserta', athleteId: 'ath-6' },
        { username: 'salsabila.hadi', name: 'Salsabila Hadi', password: 'peserta123', role: 'peserta', athleteId: 'ath-7' },
        { username: 'yofie.laksana', name: 'Yofie Laksana', password: 'peserta123', role: 'peserta', athleteId: 'ath-8' },
        { username: 'jurid', name: 'Wasit Kesulitan (Panel D)', password: 'juriD123', role: 'juri', subRole: 'D' },
        { username: 'jurie', name: 'Wasit Eksekusi (Panel E)', password: 'juriE123', role: 'juri', subRole: 'E' },
        { username: 'jurin', name: 'Wasit Neutral (Panel Line)', password: 'juriN123', role: 'juri', subRole: 'Neutral' },
      ];

      const processed: Account[] = [];
      for (const u of defaultUsers) {
        const salt = generateSalt();
        const hash = await hashPassword(u.password, salt);
        processed.push({
          id: `acc-${u.username}`,
          username: u.username,
          passwordHash: hash,
          salt: salt,
          name: u.name,
          role: u.role as any,
          subRole: u.subRole as any,
          athleteId: (u as any).athleteId || undefined,
          createdAt: new Date().toISOString()
        });
      }

      localStorage.setItem('gymnascore_accounts', JSON.stringify(processed));
    };

    seedAccountsIfNeeded();
  }, []);

  // Monitor Navigation changes (using reactive URL hash hashes)
  useEffect(() => {
    const handleHashChange = () => {
      setPath(window.location.hash || '#/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Sort and re-rank logic for live updates
  const calculateRankings = (scoresList: LiveScoreboardEntry[]): LiveScoreboardEntry[] => {
    const grouped: Record<string, LiveScoreboardEntry[]> = {};
    
    scoresList.forEach(entry => {
      if (!grouped[entry.apparatusCode]) grouped[entry.apparatusCode] = [];
      grouped[entry.apparatusCode].push(entry);
    });

    const rankedList: LiveScoreboardEntry[] = [];
    Object.keys(grouped).forEach(code => {
      const sorted = [...grouped[code]].sort((a, b) => {
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        if (b.scoreE !== a.scoreE) return b.scoreE - a.scoreE;
        return b.scoreD - a.scoreD;
      });

      sorted.forEach((item, index) => {
        item.rank = index + 1;
        rankedList.push(item);
      });
    });

    return rankedList;
  };

  // Handler for judge score submission
  const handleNewScoreSubmitted = (newScore: Omit<LiveScoreboardEntry, 'rank'>) => {
    setStandings(prev => {
      const existsIdx = prev.findIndex(s => s.athleteId === newScore.athleteId && s.apparatusCode === newScore.apparatusCode);
      
      let updated = [...prev];
      if (existsIdx > -1) {
        updated[existsIdx] = { ...updated[existsIdx], ...newScore };
      } else {
        updated.push({
          ...newScore,
          rank: 99
        });
      }

      return calculateRankings(updated);
    });

    // Also update Arena condition
    setArenas(prev => 
      prev.map(item => {
        if (item.apparatusCode === newScore.apparatusCode) {
          return {
            ...item,
            status: 'Scoring',
            currentAthleteName: newScore.athleteName,
            currentAthleteClub: newScore.club,
            lastScoreSubmitted: newScore.totalScore
          };
        }
        return item;
      })
    );
  };

  // Core system restorer
  const handleResetScoringSystem = () => {
    setStandings(INITIAL_STANDINGS);
    setArenas(INITIAL_ARENAS);
    setAthletes(SEED_ATHLETES);
    setCompetitions(INITIAL_COMPETITIONS);
    setSelectedApparatus('ALL');
  };

  // Generate a random live score from other sub-sectors
  const triggerRandomWSTrip = () => {
    const randAth = athletes[Math.floor(Math.random() * athletes.length)];
    const randArena = INITIAL_ARENAS[Math.floor(Math.random() * INITIAL_ARENAS.length)];
    
    const dVal = parseFloat((4.5 + Math.random() * 2).toFixed(2));
    const eVal = parseFloat((8.0 + Math.random() * 1.5).toFixed(2));
    const penaltyVal = Math.random() > 0.8 ? 0.100 : 0.000;
    const finalScoreFloat = dVal + eVal - penaltyVal;

    handleNewScoreSubmitted({
      athleteId: randAth.id,
      athleteName: randAth.name,
      club: randAth.club,
      ageCategory: randAth.ageCategory,
      gender: randAth.gender,
      apparatusCode: randArena.apparatusCode,
      apparatusName: randArena.apparatusName,
      scoreD: dVal,
      scoreE: eVal,
      penalties: penaltyVal,
      totalScore: finalScoreFloat,
      status: 'Official',
      lastUpdated: new Date().toISOString()
    });
  };

  // ROUTE SWITCH RENDERER
  const renderPageContent = () => {
    if (path.startsWith('#/superadmin')) {
      if (!authStates.superadmin) {
        return (
          <RoleLogin
            role="superadmin"
            onLoginSuccess={(acc) => setAuthStates(prev => ({
              ...prev,
              superadmin: true,
              currentUserName: acc.name,
              currentUserUsername: acc.username
            }))}
          />
        );
      }
      return (
        <SuperadminPage 
          onResetSystem={() => {
            handleResetScoringSystem();
            localStorage.removeItem('gymnascore_accounts');
            setAuthStates({
              peserta: false,
              juri: false,
              juriRole: null,
              panitia: false,
              superadmin: false,
              currentUserName: null,
              currentUserUsername: null
            });
            window.location.hash = '#/';
            window.location.reload();
          }}
        />
      );
    }

    if (path.startsWith('#/peserta')) {
      if (!authStates.peserta) {
        return (
          <RoleLogin
            role="peserta"
            onLoginSuccess={(acc) => setAuthStates(prev => ({
              ...prev,
              peserta: true,
              currentUserName: acc.name,
              currentUserUsername: acc.username,
              currentAthleteId: acc.athleteId || null
            }))}
          />
        );
      }
      return (
        <PesertaPage 
          athletes={athletes} 
          standings={standings}
          currentAthleteId={authStates.currentAthleteId || null}
          selectedApparatus={selectedApparatus}
          setSelectedApparatus={setSelectedApparatus}
          isLiveWsFeed={isLiveWsFeed}
          triggerRandomWSTrip={triggerRandomWSTrip}
          certificateTemplates={certificateTemplates}
          competitions={competitions}
        />
      );
    }

    if (path.startsWith('#/panitia')) {
      if (!authStates.panitia) {
        return (
          <RoleLogin
            role="panitia"
            onLoginSuccess={(acc) => setAuthStates(prev => ({
              ...prev,
              panitia: true,
              currentUserName: acc.name,
              currentUserUsername: acc.username
            }))}
          />
        );
      }
      return (
        <PanitiaPage 
          athletes={athletes}
          setAthletes={setAthletes}
          arenas={arenas}
          setArenas={setArenas}
          competitions={competitions}
          setCompetitions={setCompetitions}
          certificateTemplates={certificateTemplates}
          setCertificateTemplates={setCertificateTemplates}
          handleResetScoringSystem={handleResetScoringSystem}
        />
      );
    }

    if (path.startsWith('#/juri')) {
      if (!authStates.juri) {
        return (
          <RoleLogin
            role="juri"
            onLoginSuccess={(acc) => setAuthStates(prev => ({
              ...prev,
              juri: true,
              juriRole: acc.subRole || 'D',
              currentUserName: acc.name,
              currentUserUsername: acc.username
            }))}
          />
        );
      }
      return (
        <JuriPage 
          athletes={athletes}
          standings={standings}
          arenas={arenas}
          selectedApparatus={selectedApparatus}
          setSelectedApparatus={setSelectedApparatus}
          handleNewScoreSubmitted={handleNewScoreSubmitted}
          isLiveWsFeed={isLiveWsFeed}
          juriRole={authStates.juriRole || 'D'}
        />
      );
    }

    // Default: Landing Page / Livescore Hub (Bebas akses)
    return (
      <PortalSelectorPage 
        athletes={athletes} 
        standings={standings} 
        arenas={arenas}
        selectedApparatus={selectedApparatus}
        setSelectedApparatus={setSelectedApparatus}
        isLiveWsFeed={isLiveWsFeed}
        triggerRandomWSTrip={triggerRandomWSTrip}
      />
    );
  };

  const isLandingPage = path === '#/' || path === '' || path === '#';
  const showSidebar = !isLandingPage && (
    (path.startsWith('#/peserta') && authStates.peserta) ||
    (path.startsWith('#/panitia') && authStates.panitia) ||
    (path.startsWith('#/juri') && authStates.juri) ||
    (path.startsWith('#/superadmin') && authStates.superadmin)
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500/10">
      
      {showSidebar ? (
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* PERSISTENT RESPONSIVE SIDEBAR */}
          <Sidebar 
            currentPath={path}
            onNavigate={(hash) => { window.location.hash = hash; }}
            isSidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            authStates={authStates}
            onLogout={(role) => {
              setAuthStates(prev => ({ ...prev, [role]: false, currentUserName: null, currentUserUsername: null }));
              window.location.hash = '#/';
            }}
          />

          {/* RIGHT CONTENT FRAME (EACH PAGE RENDERS ITS OWN WRAPPERS AND LAYOUTS) */}
          <div className="flex-1 flex flex-col min-w-0 relative">
            
            {/* Mobile Header to toggle Sidebar */}
            <header className="lg:hidden flex items-center justify-between px-6 h-16 bg-white border-b border-slate-200 sticky top-0 z-30 shrink-0 shadow-xs">
              <button 
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="p-1 px-3 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 text-3xs font-black font-mono flex items-center gap-1 cursor-pointer transition-all uppercase"
              >
                <Menu className="h-4 w-4 text-indigo-650" /> Buka Menu
              </button>
              
              <div className="flex items-center gap-2">
                <div className="relative flex h-7 w-7 items-center justify-center rounded bg-indigo-600 font-display font-black text-white text-xs">
                  G
                </div>
                <span className="font-display font-black text-3xs tracking-widest text-slate-800 uppercase">
                  GymnaScore
                </span>
              </div>
            </header>

            <div className="flex-grow flex flex-col justify-between p-4 sm:p-6 lg:p-8">
              {renderPageContent()}
            </div>

          </div>
        </div>
      ) : (
        <div className="min-h-screen w-full flex flex-col">
          {renderPageContent()}
        </div>
      )}

    </div>
  );
}
