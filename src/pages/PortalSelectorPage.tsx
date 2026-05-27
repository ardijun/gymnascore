import React from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Users, 
  Award, 
  Activity, 
  Sparkles,
  Zap,
  Radio,
  Clock,
  Shield,
  HelpCircle,
  TrendingUp,
  Globe2
} from 'lucide-react';
import { Athlete, LiveScoreboardEntry, ActiveApparatusEvent } from '../types';
import LeadLeaderboard from '../components/LeadLeaderboard';
import ActiveApparatusMonitor from '../components/ActiveApparatusMonitor';

interface PortalSelectorPageProps {
  athletes: Athlete[];
  standings: LiveScoreboardEntry[];
  arenas: ActiveApparatusEvent[];
  selectedApparatus: string;
  setSelectedApparatus: (code: string) => void;
  isLiveWsFeed: boolean;
  triggerRandomWSTrip: () => void;
}

export default function PortalSelectorPage({
  athletes,
  standings,
  arenas,
  selectedApparatus,
  setSelectedApparatus,
  isLiveWsFeed,
  triggerRandomWSTrip
}: PortalSelectorPageProps) {

  // General demographics
  const totalAthletes = athletes.length;
  const officialScoresCount = standings.filter(s => s.status === 'Official').length;
  const activeClubs = new Set(athletes.map(a => a.club)).size;
  const ongoingCompetitionsCount = arenas.filter(a => a.status === 'Routine' || a.status === 'Warm_up').length;

  // Render sorted scoreboard lists
  const processedStandings = standings
    .filter(s => selectedApparatus === 'ALL' || s.apparatusCode === selectedApparatus)
    .sort((a,b) => a.rank - b.rank);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-indigo-500/10">
      
      {/* PROFESSIONAL FLUID TOP HEADER */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 font-display font-black text-xl text-white shadow-sm">
              G
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div>
              <span className="block font-display font-black text-xs sm:text-sm tracking-wider uppercase text-slate-900 leading-none">GymnaScore</span>
              <span className="text-[9px] font-mono text-slate-500 font-bold uppercase leading-none mt-1 block">Live Scoreboard Hub</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              SINKRONISASI AKTIF
            </div>
            <button
              onClick={() => { window.location.hash = '#/peserta'; }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-mono font-black tracking-wider py-2 px-4 rounded-xl cursor-pointer border-none shadow-sm transition-all flex items-center gap-1.5"
            >
              👤 LOGIN PESERTA
            </button>
          </div>
        </div>
      </header>
      
      {/* MAIN CONTAINER CONTENDER */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-grow space-y-6 relative">
        
        {/* APP BACKDROP RADIAL DEKORASI */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* 1. COMPONENT HERO BANNER */}
      <div className="space-y-6 relative">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg relative overflow-hidden">
          {/* Decorative background vectors */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.15),transparent_60%)]"></div>
          <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
            <Trophy className="w-80 h-80" />
          </div>

          <div className="max-w-3xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-3xs font-mono font-extrabold tracking-widest uppercase text-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
              PORTAL UTAMA LIVESCORE TERPADU • TANPA LOGIN
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black leading-none tracking-tight">
              Papan Skor Live & Klasemen Senam <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-sky-400 to-indigo-300">FIG Gymnastics</span>
            </h1>
            
            <p className="text-2xs sm:text-xs text-slate-300 leading-relaxed max-w-2xl font-sans">
              Selamat datang di pusat pemantauan real-time kejuaraan senam artistik & ritmik. Seluruh nilai yang diunggah oleh Panel Juri di sirkuit tanding langsung termutakhirkan dalam hitungan milidetik secara transparan.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="text-[10px] font-mono font-bold text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                Sinyal Sinkronisasi Live dengan Server GOR Aktif
              </div>
            </div>
          </div>
        </div>

        {/* 2. SUMMARY COUNTER GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <Users className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="block text-[8px] sm:text-2xs font-mono text-slate-400 uppercase font-bold leading-none truncate">Total Atlet</span>
              <span className="block text-xs sm:text-lg font-display font-black text-slate-900 mt-1 truncate">{totalAthletes} Kontestan</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Award className="w-4.5 h-4.5 sm:w-5 sm:h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <span className="block text-[8px] sm:text-2xs font-mono text-slate-400 uppercase font-bold leading-none truncate">Skor Official</span>
              <span className="block text-xs sm:text-lg font-display font-black text-slate-900 mt-1 truncate">{officialScoresCount} Nilai Sah</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Globe2 className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="block text-[8px] sm:text-2xs font-mono text-slate-400 uppercase font-bold leading-none truncate">Kontingen Aktif</span>
              <span className="block text-xs sm:text-lg font-display font-black text-slate-900 mt-1 truncate">{activeClubs} Provinsi</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Activity className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="block text-[8px] sm:text-2xs font-mono text-slate-400 uppercase font-bold leading-none truncate">Arena Kompetisi</span>
              <span className="block text-xs sm:text-lg font-display font-black text-indigo-700 mt-1 truncate">{ongoingCompetitionsCount} Sirkuit</span>
            </div>
          </div>
        </div>

        {/* 3. ACTIVE ARENA MONITORING SECTION */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs">
          <ActiveApparatusMonitor
            events={arenas}
            activeFilter={selectedApparatus}
            onSelectApparatus={(code) => setSelectedApparatus(code)}
          />
        </div>

        {/* 4. MAIN LIVESCORE BOARD */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-amber-500 animate-pulse"></span>
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">
              Papan Skor & Finals Standings Resmi GOR
            </span>
          </div>
          <LeadLeaderboard
            entries={processedStandings}
            selectedApparatus={selectedApparatus}
            onFilterChange={(code) => setSelectedApparatus(code)}
            isSimulatingLive={isLiveWsFeed}
          />
        </div>

        {/* 5. USER FRIENDLY CARD EXPLAINING LOGIN TO OTHER SECTIONS */}
        <div className="bg-gradient-to-br from-slate-100 to-sky-50/25 border border-slate-200 p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-1">
            <h4 className="font-display font-black text-xs sm:text-sm text-slate-900 uppercase tracking-tight">
              Pernyataan Skor Sah & E-Sertifikat Kontestan
            </h4>
            <p className="text-2xs text-slate-500 leading-relaxed font-semibold">
              Bagi para atlet, pelatih, dan kontingen provinsi, silakan masuk ke Portal Peserta untuk memantau grafik perkembangan individu, mencari riwayat nilai gabungan, serta mengunduh E-Sertifikat resmi kejuaraan yang telah disahkan.
            </p>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => { window.location.hash = '#/peserta'; }}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-3xs font-mono font-black tracking-widest py-3 px-6 rounded-2xl cursor-pointer transition-all shadow-md shadow-indigo-600/10 uppercase flex items-center justify-center gap-2"
            >
              👤 MASUK PORTAL PESERTA
            </button>
          </div>
        </div>

        {/* 6. DISCREET SECURE STAFF ACCESS FOOTER */}
        <footer className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono font-bold text-slate-400">
          <div>
            GymnaScore v1.0.4 • Sistem Penjurian FIG Indonesia Terintegrasi
          </div>
          <div className="flex items-center gap-4">
            <span>Koneksi GOR: <span className="text-emerald-500 font-bold">1.2ms (Sangat Stabil)</span></span>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.location.hash = '#/juri'}
                className="text-slate-500 hover:text-indigo-700 transition-colors bg-slate-100 hover:bg-slate-200/60 p-1.5 px-3 rounded-xl border border-slate-200 flex items-center gap-1 cursor-pointer font-extrabold text-[10px]"
              >
                ⚖️ Akses Juri
              </button>
              <button
                onClick={() => window.location.hash = '#/panitia'}
                className="text-slate-500 hover:text-amber-700 transition-colors bg-slate-100 hover:bg-amber-100 p-1.5 px-3 rounded-xl border border-slate-200 flex items-center gap-1 cursor-pointer font-extrabold text-[10px]"
              >
                ⚙️ Akses Panitia
              </button>
              <button
                onClick={() => window.location.hash = '#/superadmin'}
                className="text-slate-500 hover:text-rose-700 transition-colors bg-slate-100 hover:bg-rose-100 p-1.5 px-3 rounded-xl border border-slate-200 flex items-center gap-1 cursor-pointer font-extrabold text-[10px]"
              >
                🛡️ Superadmin
              </button>
            </div>
          </div>
        </footer>

      </div>

    </div>

  </div>
  );
}
