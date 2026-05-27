import React, { useState } from 'react';
import { Play, TrendingUp, Send, CheckCircle2, ShieldAlert, Award, FileSpreadsheet } from 'lucide-react';
import { Athlete, LiveScoreboardEntry } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface JudgeScoringSimulatorProps {
  athletes: Athlete[];
  apparatusCode: string;
  apparatusName: string;
  onNewScoreSubmitted: (score: Omit<LiveScoreboardEntry, 'rank'>) => void;
  juriRole?: 'D' | 'E' | 'Neutral';
}

export default function JudgeScoringSimulator({
  athletes,
  apparatusCode,
  apparatusName,
  onNewScoreSubmitted,
  juriRole = 'D',
}: JudgeScoringSimulatorProps) {
  // Simulator State variables
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(athletes[0]?.id || '');
  const [difficultyValue, setDifficultyValue] = useState<number>(5.200);
  const [compositionRequirements, setCompositionRequirements] = useState<number>(2.000);
  const [connectionValue, setConnectionValue] = useState<number>(0.300);
  
  const [executionDeduction, setExecutionDeduction] = useState<number>(1.250);
  const [artistryDeduction, setArtistryDeduction] = useState<number>(0.150);
  const [penalties, setPenalties] = useState<number>(0.000);

  const [scoreStatus, setScoreStatus] = useState<'In_Progress' | 'Pending_Verification' | 'Official'>('Official');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Universal Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'primary';
  }>({
    isOpen: false, title: '', message: '', onConfirm: () => {}, variant: 'primary'
  });
  const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

  // Calculations derived reactively
  const dScore = difficultyValue + compositionRequirements + connectionValue;
  const eScore = Math.max(0, 10.000 - executionDeduction - artistryDeduction);
  const totalScore = Math.max(0, dScore + eScore - penalties);
  
  // Real-time reactive checking of administrator's freeze-lock policy
  const isGlobalLockActive = localStorage.getItem('gymnascore_global_lock') === 'true';

  // Real-time reactive input validation rules
  const valRules = {
    difficultyValue: { min: 0, max: 15, label: "Nilai Kesulitan (DV)" },
    compositionRequirements: { min: 0, max: 5, label: "Persyaratan Komposisi (CR)" },
    connectionValue: { min: 0, max: 3, label: "Nilai Sambungan (CV)" },
    dScore: { min: 0, max: 15, label: "Total D-Score" },
    executionDeduction: { min: 0, max: 10, label: "Potongan Eksekusi" },
    artistryDeduction: { min: 0, max: 5, label: "Potongan Estetika (Artistry)" },
    totalDeductions: { min: 0, max: 10, label: "Total Potongan Juri E" },
    penalties: { min: 0, max: 5, label: "Penalti Netral" }
  };

  const isDvInvalid = difficultyValue < valRules.difficultyValue.min || difficultyValue > valRules.difficultyValue.max;
  const isCrInvalid = compositionRequirements < valRules.compositionRequirements.min || compositionRequirements > valRules.compositionRequirements.max;
  const isCvInvalid = connectionValue < valRules.connectionValue.min || connectionValue > valRules.connectionValue.max;
  const isDScoreInvalid = dScore < valRules.dScore.min || dScore > valRules.dScore.max;
  const isExecInvalid = executionDeduction < valRules.executionDeduction.min || executionDeduction > valRules.executionDeduction.max;
  const isArtInvalid = artistryDeduction < valRules.artistryDeduction.min || artistryDeduction > valRules.artistryDeduction.max;
  const isTotalDeductionsInvalid = (executionDeduction + artistryDeduction) > valRules.totalDeductions.max;
  const isPenaltyInvalid = penalties < valRules.penalties.min || penalties > valRules.penalties.max;

  const validationErrors: string[] = [];
  if (isDvInvalid) validationErrors.push(`${valRules.difficultyValue.label} harus antara ${valRules.difficultyValue.min} s/d ${valRules.difficultyValue.max}.`);
  if (isCrInvalid) validationErrors.push(`${valRules.compositionRequirements.label} harus antara ${valRules.compositionRequirements.min} s/d ${valRules.compositionRequirements.max}.`);
  if (isCvInvalid) validationErrors.push(`${valRules.connectionValue.label} harus antara ${valRules.connectionValue.min} s/d ${valRules.connectionValue.max}.`);
  if (isDScoreInvalid) validationErrors.push(`${valRules.dScore.label} (DV + CR + CV) harus antara ${valRules.dScore.min} s/d ${valRules.dScore.max}.`);
  if (isExecInvalid) validationErrors.push(`${valRules.executionDeduction.label} harus antara ${valRules.executionDeduction.min} s/d ${valRules.executionDeduction.max}.`);
  if (isArtInvalid) validationErrors.push(`${valRules.artistryDeduction.label} harus antara ${valRules.artistryDeduction.min} s/d ${valRules.artistryDeduction.max}.`);
  if (isTotalDeductionsInvalid) validationErrors.push(`${valRules.totalDeductions.label} tidak boleh melebihi ${valRules.totalDeductions.max}.`);
  if (isPenaltyInvalid) validationErrors.push(`${valRules.penalties.label} harus antara ${valRules.penalties.min} s/d ${valRules.penalties.max}.`);

  const hasErrors = validationErrors.length > 0;

  const isDDisabled = juriRole !== 'D';
  const isEDisabled = juriRole !== 'E';
  const isNeutralDisabled = juriRole !== 'Neutral';

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors) return;

    const targetAthlete = athletes.find(a => a.id === selectedAthleteId);
    if (!targetAthlete) return;

    setConfirmModal({
      isOpen: true,
      title: 'Kirim Skor',
      message: `Apakah Anda yakin ingin mengirim skor ${totalScore.toFixed(3)} untuk atlet ${targetAthlete.name}? Skor yang dikirim akan menimpa skor sebelumnya pada alat ini (jika ada).`,
      variant: 'primary',
      onConfirm: () => {
        closeConfirmModal();
        setSubmitting(true);
        setSuccessMsg('');

        // Simulate milliseconds latency (Redis input stream caching & Go channel broadcasting)
        setTimeout(() => {
          onNewScoreSubmitted({
            athleteId: targetAthlete.id,
            athleteName: targetAthlete.name,
            club: targetAthlete.club,
            ageCategory: targetAthlete.ageCategory,
            gender: targetAthlete.gender,
            apparatusCode,
            apparatusName,
            scoreD: dScore,
            scoreE: eScore,
            penalties: penalties,
            totalScore: totalScore,
            status: scoreStatus,
            lastUpdated: new Date().toISOString(),
          });

          setSubmitting(false);
          setSuccessMsg(`Berhasil mempublikasikan skor akhir untuk atlet ${targetAthlete.name}.`);
          
          // Auto-expire success message
          setTimeout(() => setSuccessMsg(''), 7000);
        }, 850);
      }
    });
  };

  return (
    <div id="judge-simulator-panel" className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all duration-300">
      
      {/* UNIVERSAL CONFIRM MODAL */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmModal}
        variant={confirmModal.variant}
      />
      
      {/* Panel title */}
      <div className="p-4 sm:p-5 border-b border-slate-250 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-xs sm:text-sm font-display font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
            Panel Input Skor Juri (Sirkuit Pertandingan Resmi)
          </h3>
          <p className="text-[10px] sm:text-2xs text-slate-500 mt-0.5 font-mono">
            Masukkan indikator penilaian di bawah ini sesuai dengan porsi penilaian Anda demi update skor real-time.
          </p>
        </div>
        <span className="text-[9px] sm:text-3xs font-mono font-bold px-2 py-1 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 uppercase tracking-widest self-start sm:self-center">
          Sirkuit FIG Aman 
        </span>
      </div>

      <form onSubmit={handleSimulateSubmit} className="p-4 sm:p-5 space-y-5 border-none">
        
        {/* Active Session Info - Professional Scoreboard Panel Banner */}
        <div id="beginner-juri-banner" className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
          juriRole === 'D' 
            ? 'bg-indigo-950 border-indigo-800 text-white shadow-md shadow-indigo-900/10' 
            : juriRole === 'E' 
              ? 'bg-rose-950 border-rose-800 text-white shadow-md shadow-rose-900/10' 
              : 'bg-amber-950 border-amber-800 text-white shadow-md shadow-amber-900/10'
        }`}>
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-display font-black text-[11px] sm:text-xs uppercase tracking-wider">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                juriRole === 'D' ? 'bg-indigo-400' : juriRole === 'E' ? 'bg-rose-400' : 'bg-amber-400'
              } animate-pulse`}></span>
              🔑 OTORITAS AKTIF: JURI PANEL {juriRole === 'D' ? 'D (KESULITAN / DIFFICULTY)' : juriRole === 'E' ? 'E (EKSEKUSI / EXECUTION)' : 'N (NEUTRAL PENALTY & KEPALA)'}
            </div>
            <p className="text-[11px] font-medium leading-relaxed text-slate-100">
              {juriRole === 'D' && "Sesi Anda terotorisasi khusus untuk menentukan D-Score atlet melalui Kesulitan Elemen (DV), Group Alat (CR), dan Nilai Sambungan (CV). Komponen nilai E-Score dan denda netral dikunci agar tidak bentrok, mematuhi prinsip pemisahan juri FIG secara transparan."}
              {juriRole === 'E' && "Sesi Anda terotorisasi khusus untuk menentukan E-Score atlet (mengurangi dari basis awal 10.000). Nilai kesulitan (D-Score) dan penalti tumpuk dikunci agar tidak bentrok, mematuhi prinsip pemisahan juri FIG secara transparan."}
              {juriRole === 'Neutral' && "Sesi Anda terotorisasi khusus untuk menetapkan Penalti Netral juri (waktu tanding, batas garis arena, atribut pakaian). Komponen D-Score dan E-Score dikunci agar tidak bentrok, mematuhi prinsip pemisahan juri FIG secara transparan."}
            </p>
          </div>
          <div className="shrink-0 text-3xs font-mono font-black bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl uppercase tracking-wider text-white">
            Role: Juri-{juriRole}
          </div>
        </div>

        {/* Row 1: Athlete & Category Select */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-2xs font-mono font-bold uppercase tracking-wider text-slate-500 block">
              ATLIT YANG BERTANDING
            </label>
            <select
              value={selectedAthleteId}
              onChange={(e) => setSelectedAthleteId(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 font-bold focus:border-sky-500 focus:outline-none transition-all cursor-pointer"
            >
              {athletes.map((ath) => (
                <option key={ath.id} value={ath.id}>
                  {ath.name} ({ath.club}) - {ath.gender === 'Men' ? 'Putra' : 'Putri'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-2xs font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              ALAT YANG AKTIF
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-sky-800 font-mono font-bold flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
              {apparatusCode} - {apparatusName}
            </div>
          </div>

          <div>
            <label className="text-2xs font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              STATUS VERIFIKASI NILAI
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['Official', 'Pending_Verification', 'Draft'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setScoreStatus(status)}
                  className={`px-1 py-1.5 text-3xs font-mono font-bold rounded border cursor-pointer text-center transition-all truncate ${
                    scoreStatus === status
                      ? 'bg-sky-100 text-sky-800 border-sky-300 shadow-3xs'
                      : 'bg-white text-slate-500 border-slate-200 hover:text-slate-700 hover:border-slate-300'
                  }`}
                  title={status === 'Official' ? 'RESMI' : status === 'Pending_Verification' ? 'DIKUNCI' : 'DRAFT'}
                >
                  {status === 'Official' ? 'RESMI' : status === 'Pending_Verification' ? 'DIKUNCI' : 'DRAFT'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Core Judging values Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
          
          {/* Difficulty Score (Juri D) */}
          <div className={`space-y-4 relative ${isDDisabled ? 'opacity-65 pointer-events-none select-none' : ''}`}>
            {isDDisabled && (
              <div className="absolute top-1 right-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-lg font-bold font-mono shadow-sm flex items-center gap-1 z-10">
                🔒 Terkunci (Peran Juri-D)
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2 gap-2">
              <h4 className="text-[10px] sm:text-xs font-display font-black text-indigo-700 flex items-center gap-1.5 uppercase tracking-wide">
                <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 shrink-0" />
                Panel Juri D - Nilai Kesulitan
              </h4>
              <span className="text-[10px] sm:text-xs font-mono font-extrabold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded self-start sm:self-auto">
                D-Score: {dScore.toFixed(3)}
              </span>
            </div>

            {/* Radio Button Groups & Manual Input Fields */}
            <div className="space-y-4">
              
              {/* Difficulty Value */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-2xs font-mono font-bold text-slate-600">
                  <span>Difficulty Value (DV)</span>
                  <span className={`px-2 py-0.5 rounded border font-black transition-colors ${
                    isDvInvalid 
                      ? 'border-rose-400 bg-rose-50 text-rose-700' 
                      : 'text-slate-900 bg-white border-slate-200'
                  }`}>{difficultyValue.toFixed(3)}</span>
                </div>
                
                {/* Radio Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {[3.0, 4.0, 5.0, 5.2, 5.5, 6.0, 6.5, 7.0].map((val) => (
                    <label 
                      key={val} 
                      className={`px-2 py-1 rounded-lg border text-3xs font-mono font-bold cursor-pointer transition-all flex items-center justify-center min-w-[42px] select-none ${
                        Math.abs(difficultyValue - val) < 0.001
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="difficultyValuePreset"
                        checked={Math.abs(difficultyValue - val) < 0.001}
                        onChange={() => setDifficultyValue(val)}
                        className="sr-only"
                      />
                      {val.toFixed(1)}
                    </label>
                  ))}
                  
                  {/* Manual Input Trigger */}
                  <div className="flex items-center gap-1 mt-1 sm:mt-0">
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">Manual:</span>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="15"
                      value={difficultyValue}
                      onChange={(e) => setDifficultyValue(parseFloat(e.target.value) || 0)}
                      className={`w-16 rounded-md py-0.5 px-1.5 text-2xs font-mono font-bold border transition-all ${
                        isDvInvalid 
                          ? 'border-rose-500 bg-rose-50 text-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-500' 
                          : 'bg-white border-slate-200 focus:border-indigo-600 focus:outline-none'
                      }`}
                    />
                  </div>
                </div>
                {isDvInvalid && (
                  <p className="text-[10px] font-mono font-bold text-rose-600">
                    ⚠️ Nilai Kesulitan (DV) harus berada dalam rentang {valRules.difficultyValue.min} s/d {valRules.difficultyValue.max}!
                  </p>
                )}
                <span className="text-[10px] text-slate-400 block font-semibold leading-relaxed">Nilai gabungan elemen tersulit (A s/d J) yang dirangkai atlet.</span>
              </div>

              {/* Composition Requirements */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-2xs font-mono font-bold text-slate-600">
                  <span>Composition Requirements (CR)</span>
                  <span className={`px-2 py-0.5 rounded border font-black transition-colors ${
                    isCrInvalid 
                      ? 'border-rose-400 bg-rose-50 text-rose-700' 
                      : 'text-slate-900 bg-white border-slate-200'
                  }`}>{compositionRequirements.toFixed(3)}</span>
                </div>

                {/* Radio Presets (Standard FIG: 0, 0.5, 1.0, 1.5, 2.0) */}
                <div className="flex flex-wrap gap-1.5">
                  {[0.0, 0.5, 1.0, 1.5, 2.0].map((val) => (
                    <label 
                      key={val} 
                      className={`px-2.5 py-1 rounded-lg border text-3xs font-mono font-black cursor-pointer transition-all flex items-center justify-center min-w-[45px] select-none ${
                        Math.abs(compositionRequirements - val) < 0.001
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="compReqPreset"
                        checked={Math.abs(compositionRequirements - val) < 0.001}
                        onChange={() => setCompositionRequirements(val)}
                        className="sr-only"
                      />
                      +{val.toFixed(1)}
                    </label>
                  ))}

                  {/* Manual Input Trigger */}
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">Lainnya:</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="5"
                      value={compositionRequirements}
                      onChange={(e) => setCompositionRequirements(parseFloat(e.target.value) || 0)}
                      className={`w-14 rounded-md py-0.5 px-1.5 text-2xs font-mono font-bold border transition-all ${
                        isCrInvalid 
                          ? 'border-rose-500 bg-rose-50 text-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-500' 
                          : 'bg-white border-slate-200 focus:border-indigo-600 focus:outline-none'
                      }`}
                    />
                  </div>
                </div>
                {isCrInvalid && (
                  <p className="text-[10px] font-mono font-bold text-rose-600">
                    ⚠️ Nilai CR harus berada dalam rentang {valRules.compositionRequirements.min} s/d {valRules.compositionRequirements.max}!
                  </p>
                )}
                <span className="text-[10px] text-slate-400 block font-semibold leading-relaxed">Persyaratan komposisi grup alat (maks 5 grup di nilai 0.50).</span>
              </div>

              {/* Connection Value */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-2xs font-mono font-bold text-slate-600">
                  <span>Connection Value (CV)</span>
                  <span className={`px-2 py-0.5 rounded border font-black transition-colors ${
                    isCvInvalid 
                      ? 'border-rose-400 bg-rose-50 text-rose-700' 
                      : 'text-slate-900 bg-white border-slate-200'
                  }`}>{connectionValue.toFixed(3)}</span>
                </div>

                {/* Radio Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {[0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8].map((val) => (
                    <label 
                      key={val} 
                      className={`px-2.5 py-1 rounded-lg border text-3xs font-mono font-bold cursor-pointer transition-all flex items-center justify-center min-w-[42px] select-none ${
                        Math.abs(connectionValue - val) < 0.001
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-3xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="connValPreset"
                        checked={Math.abs(connectionValue - val) < 0.001}
                        onChange={() => setConnectionValue(val)}
                        className="sr-only"
                      />
                      +{val.toFixed(1)}
                    </label>
                  ))}

                  {/* Manual Input Trigger */}
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">Custom:</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="3"
                      value={connectionValue}
                      onChange={(e) => setConnectionValue(parseFloat(e.target.value) || 0)}
                      className={`w-14 rounded-md py-0.5 px-1.5 text-2xs font-mono font-bold border transition-all ${
                        isCvInvalid 
                          ? 'border-rose-500 bg-rose-50 text-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-500' 
                          : 'bg-white border-slate-200 focus:border-indigo-600 focus:outline-none'
                      }`}
                    />
                  </div>
                </div>
                {isCvInvalid && (
                  <p className="text-[10px] font-mono font-bold text-rose-600">
                    ⚠️ Nilai CV harus berada dalam rentang {valRules.connectionValue.min} s/d {valRules.connectionValue.max}!
                  </p>
                )}
                <span className="text-[10px] text-slate-400 block font-semibold leading-relaxed">Nilai bonus sambungan rangkaian senam berisiko tinggi.</span>
              </div>

            </div>
          </div>

          {/* Execution Score (Juri E) */}
          <div className="space-y-4">
            
            {/* Nested wrapper for actual execution/artistry scoring (locked if not Juri E) */}
            <div className={`space-y-4 relative ${isEDisabled ? 'opacity-65 pointer-events-none select-none' : ''}`}>
              {isEDisabled && (
                <div className="absolute top-1 right-1 bg-rose-50 border border-rose-200 text-rose-700 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-lg font-bold font-mono shadow-3xs flex items-center gap-1 z-10">
                  🔒 Terkunci (Peran Juri-E)
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2 gap-2">
                <h4 className="text-[10px] sm:text-xs font-display font-black text-rose-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600 shrink-0" />
                  Panel Juri E - Nilai Eksekusi
                </h4>
                <span className="text-[10px] sm:text-xs font-mono font-extrabold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded self-start sm:self-auto">
                  E-Score: {eScore.toFixed(3)}
                </span>
              </div>

              {/* Steppers & Radio button matrix */}
              <div className="space-y-4">
              
              {/* Cumulative Deductions */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-2xs font-mono font-bold text-slate-600">
                  <span>Potongan Eksekusi Kumulatif (Execution Deductions)</span>
                  <span className={`font-black px-2 py-0.5 rounded font-mono border transition-colors ${
                    isExecInvalid 
                      ? 'border-rose-450 bg-rose-50 text-rose-750' 
                      : 'text-rose-600 bg-rose-50 border-rose-100'
                  }`}>-{executionDeduction.toFixed(3)}</span>
                </div>

                {/* Radio Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {[0.0, 0.5, 0.8, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0].map((val) => (
                    <label 
                      key={val} 
                      className={`px-2 py-1 rounded-lg border text-3xs font-mono font-bold cursor-pointer transition-all flex items-center justify-center min-w-[45px] select-none ${
                        Math.abs(executionDeduction - val) < 0.001
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="execDeductPreset"
                        checked={Math.abs(executionDeduction - val) < 0.001}
                        onChange={() => setExecutionDeduction(val)}
                        className="sr-only"
                      />
                      -{val.toFixed(2)}
                    </label>
                  ))}

                  {/* Manual input */}
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase font-sans">Pas:</span>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="10"
                      value={executionDeduction}
                      onChange={(e) => setExecutionDeduction(parseFloat(e.target.value) || 0)}
                      className={`w-16 rounded-md py-0.5 px-1.5 text-2xs font-mono font-bold border transition-all ${
                        isExecInvalid 
                          ? 'border-rose-500 bg-rose-50 text-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-500' 
                          : 'bg-white border-slate-200 focus:border-indigo-600 focus:outline-none'
                      }`}
                    />
                  </div>
                </div>
                {isExecInvalid && (
                  <p className="text-[10px] font-mono font-bold text-rose-600">
                    ⚠️ Potongan Eksekusi harus berada dalam rentang {valRules.executionDeduction.min} s/d {valRules.executionDeduction.max}!
                  </p>
                )}
                <span className="text-[10px] text-slate-400 block font-semibold leading-relaxed">Potongan akibat posisi mendarat tidak tepat, kaki terbuka, atau jatuh.</span>
              </div>

              {/* Artistry & Posture */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-2xs font-mono font-bold text-slate-600">
                  <span>Potongan Estetika / Artistry & Posture</span>
                  <span className={`font-bold px-2 py-0.5 rounded font-mono border transition-colors ${
                    isArtInvalid 
                      ? 'border-rose-450 bg-rose-50 text-rose-750' 
                      : 'text-rose-600 bg-rose-50 border-rose-100'
                  }`}>-{artistryDeduction.toFixed(3)}</span>
                </div>

                {/* Radio Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {[0.0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5].map((val) => (
                    <label 
                      key={val} 
                      className={`px-2.5 py-1 rounded-lg border text-3xs font-mono font-bold cursor-pointer transition-all flex items-center justify-center min-w-[42px] select-none ${
                        Math.abs(artistryDeduction - val) < 0.001
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="artistryPreset"
                        checked={Math.abs(artistryDeduction - val) < 0.001}
                        onChange={() => setArtistryDeduction(val)}
                        className="sr-only"
                      />
                      -{val.toFixed(2)}
                    </label>
                  ))}

                  {/* Manual input */}
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">Pas:</span>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="5"
                      value={artistryDeduction}
                      onChange={(e) => setArtistryDeduction(parseFloat(e.target.value) || 0)}
                      className={`w-14 rounded-md py-0.5 px-1.5 text-2xs font-mono font-bold border transition-all ${
                        isArtInvalid 
                          ? 'border-rose-500 bg-rose-50 text-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-500' 
                          : 'bg-white border-slate-200 focus:border-indigo-600 focus:outline-none'
                      }`}
                    />
                  </div>
                </div>
                {isArtInvalid && (
                  <p className="text-[10px] font-mono font-bold text-rose-600">
                    ⚠️ Potongan rincian harus berada dalam rentang {valRules.artistryDeduction.min} s/d {valRules.artistryDeduction.max}!
                  </p>
                )}
                <span className="text-[10px] text-slate-400 block font-semibold leading-relaxed">Ketidaksesuaian ekspresi koreografi, ritme tanding, atau postur tubuh.</span>
              </div>

            </div> {/* Closes Steppers & Radio button matrix */}
          </div> {/* Closes Juri E nested container */}

          {/* Nested wrapper for Neutral Penalties (locked if not Neutral role) */}
          <div className={`space-y-4 mt-6 pt-5 border-t border-dashed border-slate-200 relative ${isNeutralDisabled ? 'opacity-65 pointer-events-none select-none' : ''}`}>
            {isNeutralDisabled && (
              <div className="absolute top-1 right-1 bg-amber-50 border border-amber-200 text-amber-800 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-lg font-bold font-mono shadow-3xs flex items-center gap-1 z-10">
                🔒 Terkunci (Peran Juri-Neutral)
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
              <h4 className="text-[10px] sm:text-xs font-display font-black text-rose-800 flex items-center gap-1.5 uppercase tracking-wide">
                ⚖️ Panel Juri Neutral - Penalti Netral
              </h4>
            </div>

            {/* Neutral Penalties */}
            <div className="space-y-1.5">
                <div className="flex justify-between items-center text-2xs font-mono font-bold">
                  <span className="text-rose-600">Penalti Netral Juri / Neutral Penalties (Deductions)</span>
                  <span className={`font-bold px-2 py-0.5 rounded font-mono border transition-colors ${
                    isPenaltyInvalid 
                      ? 'border-rose-400 bg-rose-50 text-rose-800' 
                      : 'text-rose-600 bg-rose-100 border-rose-200'
                  }`}>-{penalties.toFixed(3)}</span>
                </div>

                {/* Radio Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {[0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.8].map((val) => (
                    <label 
                      key={val} 
                      className={`px-2.5 py-1 rounded-lg border text-3xs font-mono font-bold cursor-pointer transition-all flex items-center justify-center min-w-[42px] select-none ${
                        Math.abs(penalties - val) < 0.001
                          ? 'bg-rose-700 text-white border-rose-700 shadow-3xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="penaltyPreset"
                        checked={Math.abs(penalties - val) < 0.001}
                        onChange={() => setPenalties(val)}
                        className="sr-only"
                      />
                      -{val.toFixed(1)}
                    </label>
                  ))}

                  {/* Manual input */}
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">Pas:</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={penalties}
                      onChange={(e) => setPenalties(parseFloat(e.target.value) || 0)}
                      className={`w-14 rounded-md py-0.5 px-1.5 text-2xs font-mono font-bold border transition-all ${
                        isPenaltyInvalid 
                          ? 'border-rose-500 bg-rose-50 text-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-500' 
                          : 'bg-white border-slate-200 focus:border-indigo-600 focus:outline-none'
                      }`}
                    />
                  </div>
                </div>
                {isPenaltyInvalid && (
                  <p className="text-[10px] font-mono font-bold text-rose-600">
                    ⚠️ Penalti Netral harus berada dalam rentang {valRules.penalties.min} s/d {valRules.penalties.max}!
                  </p>
                )}
                <span className="text-[10px] text-slate-400 block font-semibold leading-relaxed">Kesalahan waktu (durasi), keluar garis arena, atau kecacatan atribut pakaian olahraga.</span>
              </div>

            </div>
          </div>

        </div>

        {/* Real-time Comprehensive Validation Feedback Panel */}
        {hasErrors && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-rose-900 shadow-xs transition-all duration-300">
            <h5 className="font-display font-black text-xs uppercase text-rose-800 flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
              Peringatan Validasi Masukan Juri:
            </h5>
            <ul className="list-disc list-inside space-y-1 text-2xs font-mono font-bold">
              {validationErrors.map((err, idx) => (
                <li key={idx} className="leading-snug text-rose-755">{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Real-time calculated telemetry summary */}
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between text-xs font-mono gap-3 transition-colors ${
          hasErrors 
            ? 'bg-rose-100 border-rose-300 text-rose-950' 
            : 'bg-slate-100 border-slate-250 text-slate-700'
        }`}>
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-slate-500 text-3xs uppercase tracking-wider font-extrabold">AGGREGATING LIVE CO-DECISIONS</div>
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-1 font-bold">
              <span>Formula:</span>
              <span className={isDScoreInvalid ? 'text-rose-600 line-through' : 'text-sky-700'}>{dScore.toFixed(3)} (D)</span>
              <span>+</span>
              <span className={isTotalDeductionsInvalid ? 'text-rose-600 line-through' : 'text-emerald-700'}>{eScore.toFixed(3)} (E)</span>
              {penalties > 0 && <span className={isPenaltyInvalid ? 'text-rose-500 line-through font-medium' : 'text-rose-600'}> - {penalties.toFixed(3)} (P)</span>}
            </div>
          </div>

          <div className="text-center sm:text-right">
            <div className="text-slate-500 text-3xs uppercase tracking-wider font-extrabold text-slate-500">CALCULATED TOTAL READY</div>
            <div className={`text-2xl font-black tabular-nums transition-colors ${
              hasErrors ? 'text-rose-600' : 'text-amber-600'
            }`}>
              {hasErrors ? 'ERR' : totalScore.toFixed(3)}
            </div>
          </div>
        </div>

        {/* Action Button & feedback banners */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          {successMsg ? (
            <div className="text-2xs font-semibold text-emerald-800 flex items-center gap-1.5 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              {successMsg}
            </div>
          ) : isGlobalLockActive ? (
            <div className="text-2xs font-semibold text-rose-800 flex items-center gap-1.5 p-2.5 bg-rose-50 border border-rose-250 rounded-lg flex-1 font-mono">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 animate-bounce" />
              <span>Sirkuit Penilaian Dikunci Global! Superadmin menonaktifkan penginputan nilai wasit.</span>
            </div>
          ) : (
            <p className="text-3xs font-mono text-slate-500 max-w-sm">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-500 inline mr-1 shrink-0" />
              Authorized security connection: Submission triggers dynamic broadcast instantly writing into live score views.
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || hasErrors || isGlobalLockActive}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-lg font-display font-medium text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 border-none select-none cursor-pointer ${
              (hasErrors || isGlobalLockActive)
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-80 shadow-none' 
                : 'bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-slate-950 shadow-sky-500/10 hover:shadow-sky-500/20'
            }`}
          >
            {submitting ? (
              <>
                <TrendingUp className="w-4 h-4 animate-spin" />
                Processing Redis...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Publish Live Broadcast
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
