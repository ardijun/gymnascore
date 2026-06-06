import React from 'react';
import { Play, Flame, Users, Timer, Sparkles, Radio } from 'lucide-react';
import { ActiveApparatusEvent } from '../types';

interface ActiveApparatusMonitorProps {
  events: ActiveApparatusEvent[];
  activeFilter: string;
  onSelectApparatus: (code: string) => void;
}

export default function ActiveApparatusMonitor({
  events,
  activeFilter,
  onSelectApparatus,
}: ActiveApparatusMonitorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-display font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
            Pemantauan Keaktifan Arena Alat
          </h3>
          <p className="text-2xs text-slate-500 mt-1">
            Status terkini dari sub-divisi pertandingan yang sedang tanding di sirkuit utama GOR.
          </p>
        </div>
        <span className="text-2xs font-mono text-sky-700 bg-sky-50 px-2.5 py-1 rounded border border-sky-100 font-bold">
          Sirkuit Lantai Utama
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {events.map((event) => {
          const isSelected = activeFilter === event.apparatusCode;
          const statusColors = {
            Warm_up: 'bg-amber-100 border-amber-300 text-amber-700',
            Routine: 'bg-rose-100 border-rose-300 text-rose-700 animate-pulse',
            Scoring: 'bg-sky-100 border-sky-300 text-sky-700',
            Idle: 'bg-slate-100 border-slate-300 text-slate-600',
          };

          const statusLabels = {
            Warm_up: 'PEMANASAN',
            Routine: 'SEDANG TANDING',
            Scoring: 'INPUT JURI',
            Idle: 'REHAT / JEDA',
          };

          return (
            <div
              key={event.apparatusCode}
              id={`apparatus-card-${event.apparatusCode}`}
              onClick={() => onSelectApparatus(event.apparatusCode)}
              className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[11rem] h-auto group ${
                isSelected
                  ? 'bg-white border-sky-500 shadow-md shadow-sky-500/10 scale-[1.02] ring-2 ring-sky-450/10 ring-sky-400/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
              }`}
            >
              {/* Top Row: Title Code & Live Indicator */}
              <div className="flex items-start justify-between gap-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="font-mono text-xs font-black text-slate-700">
                      {event.apparatusCode}
                    </span>
                    <span className="text-3xs text-slate-300">|</span>
                    <span className="text-3xs font-mono text-slate-400 uppercase">
                      Sub-Div 2
                    </span>
                  </div>
                  <h4 className="font-display font-black text-sm text-slate-900 mt-1 leading-snug group-hover:text-sky-600 transition-colors break-words">
                    {event.apparatusName}
                  </h4>
                </div>
                
                {/* Status Dot */}
                <div className={`px-2 py-0.5 rounded text-3xs font-mono font-bold border tracking-wider shrink-0 whitespace-nowrap ${statusColors[event.status]}`}>
                  {statusLabels[event.status]}
                </div>
              </div>

              {/* Middle Row: Athlete Details */}
              <div className="my-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100 min-w-0">
                <div className="text-3xs font-mono text-slate-400 flex items-center gap-1 font-bold">
                  <Flame className="w-3 h-3 text-amber-500" />
                  ATLIT DI ARENA
                </div>
                <div className="text-xs font-bold text-slate-800 truncate mt-0.5">
                  {event.currentAthleteName}
                </div>
                <div className="text-3xs font-mono text-slate-500 truncate mt-0.5 font-bold">
                  {event.currentAthleteClub}
                </div>
              </div>

              {/* Bottom Row: Referee Count and Quick selection indicator */}
              <div className="flex items-center justify-between text-3xs font-mono text-slate-500 mt-1 font-bold">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-slate-400" />
                  <span className="font-medium">{event.activeJudgesCount} Juri Aktif (1D, 4E)</span>
                </div>
                
                {isSelected ? (
                  <span className="text-sky-600 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Terpilih
                  </span>
                ) : (
                  <span className="text-slate-400 group-hover:text-slate-600 transition-colors flex items-center gap-1">
                    Pilih <Play className="w-2 h-2" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
