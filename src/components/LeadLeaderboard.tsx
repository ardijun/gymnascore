import React, { useEffect, useState } from 'react';
import { Award, RefreshCw, Zap, TrendingUp, Filter } from 'lucide-react';
import { LiveScoreboardEntry } from '../types';

interface LeadLeaderboardProps {
  entries: LiveScoreboardEntry[];
  selectedApparatus: string;
  onFilterChange: (apparatus: string) => void;
  isSimulatingLive: boolean;
}

export default function LeadLeaderboard({
  entries,
  selectedApparatus,
  onFilterChange,
  isSimulatingLive,
}: LeadLeaderboardProps) {
  const [wsStatus, setWsStatus] = useState<'connected' | 'reconnecting' | 'disconnected'>('connected');
  const [lastUpdatedMessage, setLastUpdatedMessage] = useState<string>('Sistem Sinkronisasi Live: Terhubung ke GOR');

  // Simulated WebSocket connection setup
  useEffect(() => {
    let wsTimer: NodeJS.Timeout;
    let reconnectTimer: NodeJS.Timeout;

    if (isSimulatingLive) {
      setWsStatus('connected');
      setLastUpdatedMessage('Koneksi sinkronisasi otomatis: AKTIF (Terhubung dengan server GOR)');
      
      // Simulate micro fluctuations in connectivity to prove robustness
      wsTimer = setInterval(() => {
        const roll = Math.random();
        if (roll > 0.92) {
          setWsStatus('reconnecting');
          setLastUpdatedMessage('Menghubungkan kembali ke server GOR...');
          
          reconnectTimer = setTimeout(() => {
            setWsStatus('connected');
            setLastUpdatedMessage('Koneksi pulih. Sinkronisasi data nilai berhasil disegarkan.');
          }, 1500);
        }
      }, 15000);
    } else {
      setWsStatus('disconnected');
      setLastUpdatedMessage('Pembaruan otomatis tidak aktif. Data dibekukan sementara.');
    }

    return () => {
      clearInterval(wsTimer);
      clearTimeout(reconnectTimer);
    };
  }, [isSimulatingLive]);

  const apparatusFilters = [
    { code: 'ALL', label: 'Semua Alat' },
    { code: 'FX', label: 'Floor Exercise (FX)' },
    { code: 'PH', label: 'Pommel Horse (PH)' },
    { code: 'SR', label: 'Still Rings (SR)' },
    { code: 'VT', label: 'Vault (VT)' },
    { code: 'PB', label: 'Parallel Bars (PB)' },
    { code: 'HB', label: 'Horizontal Bar (HB)' },
    { code: 'BB', label: 'Balance Beam (BB)' },
    { code: 'UB', label: 'Uneven Bars (UB)' },
  ];

  return (
    <div id="live-scoreboard-container" className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 flex flex-col">
      
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-display font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Papan Skor Live & Klasemen Final Resmi
            </h3>
            {wsStatus === 'connected' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-3xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse">
                LIVE AKTIF
              </span>
            )}
            {wsStatus === 'reconnecting' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-3xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                REKONEKSI
              </span>
            )}
            {wsStatus === 'disconnected' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-3xs font-bold bg-rose-100 text-rose-800 border border-rose-200 block">
                OFFLINE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <Zap className={`w-3.5 h-3.5 ${wsStatus === 'connected' ? 'text-sky-500' : 'text-slate-400'}`} />
            <span className="font-mono text-3xs bg-white px-2 py-0.5 rounded border border-slate-200 text-sky-600">
              {lastUpdatedMessage}
            </span>
          </p>
        </div>

        {/* Caching/Stream metadata */}
        <div className="flex items-center gap-2 text-2xs font-mono text-slate-500 self-start md:self-auto">
          <TrendingUp className="w-3.5 h-3.5 text-sky-500" />
          <span>Sinyal Pertandingan: Stabil</span>
        </div>
      </div>

      {/* Apparatus Tabs */}
      <div className="px-5 py-3.5 bg-slate-50/50 border-b border-slate-200 flex gap-1.5 overflow-x-auto scrollbar-thin">
        <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 self-center mr-1.5 shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          Filter:
        </span>
        {apparatusFilters.map((tab) => (
          <button
            key={tab.code}
            onClick={() => onFilterChange(tab.code)}
            id={`btn-filter-${tab.code}`}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border duration-200 cursor-pointer shrink-0 ${
              selectedApparatus === tab.code
                ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-800 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="py-4 px-5 text-2xs font-mono tracking-wider text-slate-500 uppercase font-bold">Peringkat</th>
              <th className="py-4 px-5 text-2xs font-mono tracking-wider text-slate-500 uppercase font-bold">Atlit</th>
              <th className="py-4 px-4 text-2xs font-mono tracking-wider text-slate-500 uppercase font-bold">Provinsi / Kategori</th>
              <th className="py-4 px-4 text-2xs font-mono tracking-wider text-slate-500 uppercase font-bold">Alat</th>
              <th className="py-2 text-center text-2xs font-mono tracking-wider text-slate-500 uppercase font-bold bg-sky-50/50">D-Score</th>
              <th className="py-2 text-center text-2xs font-mono tracking-wider text-slate-500 uppercase font-bold bg-emerald-50/50">E-Score</th>
              <th className="py-4 px-4 text-center text-2xs font-mono tracking-wider text-slate-500 uppercase font-bold text-rose-500">Denda (N)</th>
              <th className="py-4 px-5 text-right text-2xs font-mono tracking-wider text-slate-500 uppercase font-bold text-emerald-600">Skor Akhir</th>
              <th className="py-4 px-5 text-center text-2xs font-mono tracking-wider text-slate-500 uppercase font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500 text-sm">
                  Belum ada nilai resmi yang dimasukkan untuk kategori alat ini.
                </td>
              </tr>
            ) : (
              entries.map((entry, index) => {
                const isTop1 = index === 0;
                const isTop2 = index === 1;
                const isTop3 = index === 2;

                return (
                  <tr
                    key={`${entry.athleteId}-${entry.apparatusCode}`}
                    className={`group transition-all duration-150 hover:bg-slate-50/50 ${
                      isTop1 ? 'bg-amber-500/5 text-slate-900 border-y border-amber-200/40' : 'text-slate-800'
                    }`}
                  >
                    {/* Rank Indicator */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      {isTop1 ? (
                        <div className="flex items-center justify-center w-7 h-7 font-mono font-black text-xs text-amber-700 bg-amber-100 border border-amber-300 rounded-lg">
                          01
                        </div>
                      ) : isTop2 ? (
                        <div className="flex items-center justify-center w-7 h-7 font-mono font-black text-xs text-slate-700 bg-slate-100 border border-slate-300 rounded-lg">
                          02
                        </div>
                      ) : isTop3 ? (
                        <div className="flex items-center justify-center w-7 h-7 font-mono font-black text-xs text-orange-700 bg-orange-100 border border-orange-300 rounded-lg">
                          03
                        </div>
                      ) : (
                        <span className="font-mono text-xs text-slate-400 pl-2.5">
                          {entry.rank < 10 ? `0${entry.rank}` : entry.rank}
                        </span>
                      )}
                    </td>

                    {/* Athlete Profile */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="font-display font-bold text-slate-900 group-hover:text-slate-950 transition-colors">
                        {entry.athleteName}
                      </div>
                      <div className="text-2xs font-mono text-sky-600 flex items-center gap-1.5 mt-0.5">
                        <span className="opacity-90">{entry.gender === 'Men' ? 'PUTRA' : 'PUTRI'}</span>
                      </div>
                    </td>

                    {/* Club Demographics */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="text-slate-700 text-xs font-medium">{entry.club}</div>
                      <div className="text-3xs text-slate-400 mt-0.5 uppercase tracking-wider">{entry.ageCategory}</div>
                    </td>

                    {/* Apparatus Code */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 text-3xs font-mono font-bold rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {entry.apparatusCode}
                      </span>
                      <span className="text-2xs text-slate-500 ml-1.5 font-medium hidden sm:inline">{entry.apparatusName}</span>
                    </td>

                    {/* D-Score (Gold Accented) */}
                    <td className="py-4 text-center whitespace-nowrap font-mono text-xs text-slate-700 font-semibold bg-sky-50/20 border-x border-slate-100">
                      {entry.scoreD.toFixed(3)}
                    </td>

                    {/* E-Score (Gold Accented) */}
                    <td className="py-4 text-center whitespace-nowrap font-mono text-xs text-slate-700 font-semibold bg-emerald-50/20 border-x border-slate-100">
                      {entry.scoreE.toFixed(3)}
                    </td>

                    {/* Deductions / Penalties */}
                    <td className={`py-4 px-4 text-center whitespace-nowrap font-mono text-xs ${
                      entry.penalties > 0 ? 'text-rose-500 font-bold' : 'text-slate-400'
                    }`}>
                      {entry.penalties > 0 ? `-${entry.penalties.toFixed(3)}` : '0.000'}
                    </td>

                    {/* Total Score */}
                    <td className="py-4 px-5 text-right whitespace-nowrap font-mono text-sm">
                      <span className={`font-black ${
                        isTop1 ? 'text-amber-600' : 'text-slate-800'
                      }`}>
                        {entry.totalScore.toFixed(3)}
                      </span>
                    </td>

                    {/* Verified Status Banner */}
                    <td className="py-4 px-5 text-center whitespace-nowrap">
                      {entry.status === 'Official' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-3xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          SAH / RESMI
                        </span>
                      ) : entry.status === 'Pending_Verification' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-3xs font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          VERIFIKASI
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-3xs font-mono font-medium bg-sky-100 text-sky-800 border border-sky-200">
                          DRAFT
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Stats Summary */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-2xs font-mono text-slate-500 gap-2">
        <div>
          Menampilkan <span className="text-slate-800 font-bold">{entries.length}</span> data nilai untuk filter <span className="text-sky-700 font-bold">{selectedApparatus === 'ALL' ? 'Semua Alat' : selectedApparatus}</span>.
        </div>
        <div>
          Perhitungan skor mengacu penuh pada pedoman FIG Gymnastics Code of Points 2025–2028.
        </div>
      </div>

    </div>
  );
}
