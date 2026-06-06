import React, { useState } from 'react';
import { motion } from 'motion/react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { navigateTo } from '../lib/navigation';
import { 
  ArrowLeft, 
  Search, 
  ChevronRight, 
  Trophy, 
  Layers, 
  User, 
  Award, 
  Download, 
  TrendingUp, 
  Heart,
  Calendar,
  Club,
  Bookmark,
  FileCheck
} from 'lucide-react';
import { Athlete, LiveScoreboardEntry, CertificateTemplate, Competition } from '../types';
import LeadLeaderboard from '../components/LeadLeaderboard';
import { generateCertificatePDF } from '../lib/certificate';

interface PesertaPageProps {
  athletes: Athlete[];
  standings: LiveScoreboardEntry[];
  currentAthleteId: string | null;
  selectedApparatus: string;
  setSelectedApparatus: (code: string) => void;
  isLiveWsFeed: boolean;
  triggerRandomWSTrip: () => void;
  certificateTemplates: CertificateTemplate[];
  competitions: Competition[];
}

export default function PesertaPage({
  athletes,
  standings,
  currentAthleteId,
  selectedApparatus,
  setSelectedApparatus,
  isLiveWsFeed,
  triggerRandomWSTrip,
  certificateTemplates,
  competitions
}: PesertaPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClubFilter, setSelectedClubFilter] = useState('ALL');
  const [viewedAthleteId, setViewedAthleteId] = useState<string | null>(currentAthleteId);

  // Return to portal route
  const handleBackToPortal = () => {
    navigateTo('/');
  };

  const escapeCsvValue = (value: string | number) => {
    const text = String(value).replace(/"/g, '""');
    return `"${text}"`;
  };

  const buildAthleteRows = (athlete: Athlete, scoredAlat: LiveScoreboardEntry[]) => {
    const totalAccumulated = scoredAlat.reduce((sum, s) => sum + s.totalScore, 0);
    const headerRows = [
      ['Nama Atlet', athlete.name],
      ['NID', athlete.id],
      ['Daerah', athlete.club],
      ['Golongan', athlete.ageCategory],
      ['Jenis Kelamin', athlete.gender],
      ['Total Skor Akumulasi', totalAccumulated.toFixed(3)],
      [],
      ['Apparatus Code', 'Nama Alat', 'D-Score', 'E-Score', 'Penalti', 'Total Skor', 'Status', 'Peringkat']
    ];

    const bodyRows = scoredAlat.map((score) => {
      const ranksInApp = [...standings]
        .filter(s => s.apparatusCode === score.apparatusCode)
        .sort((a, b) => b.totalScore - a.totalScore);
      const rankIndex = ranksInApp.findIndex(s => s.athleteId === score.athleteId) + 1;

      return [
        score.apparatusCode,
        score.apparatusName,
        score.scoreD.toFixed(3),
        score.scoreE.toFixed(3),
        score.penalties.toFixed(3),
        score.totalScore.toFixed(3),
        score.status,
        rankIndex
      ];
    });

    return { totalAccumulated, headerRows, bodyRows };
  };

  const downloadAthleteXlsxReport = (athlete: Athlete, scoredAlat: LiveScoreboardEntry[]) => {
    const { totalAccumulated, headerRows, bodyRows } = buildAthleteRows(athlete, scoredAlat);
    const worksheetData = [
      ['Nama Atlet', athlete.name],
      ['NID', athlete.id],
      ['Daerah', athlete.club],
      ['Golongan', athlete.ageCategory],
      ['Jenis Kelamin', athlete.gender],
      ['Total Skor Akumulasi', totalAccumulated.toFixed(3)],
      [],
      ...headerRows,
      ...bodyRows
    ];

    const sheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Nilai Atlit');
    XLSX.writeFile(workbook, `Buku_Nilai_Digital_${athlete.name.replace(/\s+/g, '_')}.xlsx`);
  };

  const downloadFullLeaderboardXlsx = () => {
    const leaderboardData: any[] = [
      ['Klasemen Lengkap Kompetisi', 'Generated: ' + new Date().toLocaleString('id-ID')],
      []
    ];

    const apparatusGroups: Record<string, LiveScoreboardEntry[]> = {};
    standings.forEach(entry => {
      if (!apparatusGroups[entry.apparatusCode]) {
        apparatusGroups[entry.apparatusCode] = [];
      }
      apparatusGroups[entry.apparatusCode].push(entry);
    });

    Object.keys(apparatusGroups).sort().forEach(apparatusCode => {
      leaderboardData.push([apparatusCode + ' - ' + apparatusGroups[apparatusCode][0].apparatusName]);
      leaderboardData.push(['Rank', 'Nama Atlet', 'Daerah', 'Golongan', 'D-Score', 'E-Score', 'Penalti', 'Total Skor', 'Status']);

      apparatusGroups[apparatusCode]
        .sort((a, b) => a.rank - b.rank)
        .forEach(entry => {
          leaderboardData.push([
            entry.rank,
            entry.athleteName,
            entry.club,
            entry.ageCategory,
            entry.scoreD.toFixed(3),
            entry.scoreE.toFixed(3),
            entry.penalties.toFixed(3),
            entry.totalScore.toFixed(3),
            entry.status
          ]);
        });

      leaderboardData.push([]);
    });

    const sheet = XLSX.utils.aoa_to_sheet(leaderboardData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Klasemen Lengkap');
    XLSX.writeFile(workbook, `Klasemen_Lengkap_${new Date().getTime()}.xlsx`);
  };

  const downloadAthleteCsvReport = (athlete: Athlete, scoredAlat: LiveScoreboardEntry[]) => {
    const { headerRows, bodyRows } = buildAthleteRows(athlete, scoredAlat);
    const csvContent = [...headerRows, ...bodyRows]
      .map((row) => row.map(escapeCsvValue).join(','))
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `Buku_Nilai_Digital_${athlete.name.replace(/\s+/g, '_')}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const downloadAthletePdfReport = (athlete: Athlete, scoredAlat: LiveScoreboardEntry[]) => {
    const { totalAccumulated, bodyRows } = buildAthleteRows(athlete, scoredAlat);
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const leftMargin = 40;
    let cursorY = 40;

    doc.setFontSize(16);
    doc.text('Buku Nilai Digital Atlet', leftMargin, cursorY);
    cursorY += 28;

    doc.setFontSize(10);
    doc.text(`Nama Atlet: ${athlete.name}`, leftMargin, cursorY);
    cursorY += 16;
    doc.text(`NID: ${athlete.id}`, leftMargin, cursorY);
    cursorY += 16;
    doc.text(`Daerah: ${athlete.club}`, leftMargin, cursorY);
    cursorY += 16;
    doc.text(`Golongan: ${athlete.ageCategory}`, leftMargin, cursorY);
    cursorY += 16;
    doc.text(`Jenis Kelamin: ${athlete.gender}`, leftMargin, cursorY);
    cursorY += 16;
    doc.text(`Total Skor Akumulasi: ${totalAccumulated.toFixed(3)}`, leftMargin, cursorY);
    cursorY += 24;

    const columnLabels = ['Alat', 'Nama', 'D-Score', 'E-Score', 'Penalti', 'Total', 'Status', 'Rank'];
    const columnWidths = [55, 115, 55, 55, 55, 55, 80, 40];
    const startX = leftMargin;
    let currentX = startX;

    doc.setFontSize(9);
    columnLabels.forEach((label, index) => {
      doc.text(label, currentX, cursorY);
      currentX += columnWidths[index];
    });
    cursorY += 14;
    doc.setLineWidth(0.5);
    doc.line(leftMargin, cursorY, 555, cursorY);
    cursorY += 10;

    bodyRows.forEach((row) => {
      currentX = startX;
      const rowText = row.map(String);
      rowText.forEach((cell, index) => {
        doc.text(cell, currentX, cursorY, { maxWidth: columnWidths[index] - 4 });
        currentX += columnWidths[index];
      });
      cursorY += 14;
      if (cursorY > 760) {
        doc.addPage();
        cursorY = 40;
      }
    });

    doc.save(`Buku_Nilai_Digital_${athlete.name.replace(/\s+/g, '_')}.pdf`);
  };

  const downloadCertificate = (athlete: Athlete) => {
    const activeComp = competitions.find(c => c.status === 'Active') || competitions[0];
    const athleteTotalScore = standings
      .filter(s => s.athleteId === athlete.id)
      .reduce((sum, s) => sum + s.totalScore, 0) || null;
    
    const template = certificateTemplates[0] || {
      id: 'default',
      name: 'Default',
      title: 'E-CERTIFICATE OF PARTICIPATION',
      subtitle: activeComp.name,
      bodyText: 'This is to certify that',
      footerText: 'Official Gymnastics Scoring Center',
      backgroundColor: '#f0f9ff',
      borderColor: '#0369a1',
      accentColor: '#0284c7',
      includeScore: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const doc = generateCertificatePDF(
      athlete.name,
      athlete.club,
      activeComp.name,
      activeComp.date,
      athleteTotalScore,
      template
    );

    doc.save(`E-Certificate_${athlete.name.replace(/\s+/g, '_')}.pdf`);
  };

  // Filter standings shown in table based on selector
  const filteredStandings = standings
    .filter(s => selectedApparatus === 'ALL' || s.apparatusCode === selectedApparatus)
    .sort((a, b) => a.rank - b.rank);

  // Filter athletes - hanya tampilkan atlet yang login
  const matchedAthletes = athletes.filter(ath => {
    if (currentAthleteId && ath.id !== currentAthleteId) return false;
    const matchesSearch = ath.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClub = selectedClubFilter === 'ALL' || ath.club === selectedClubFilter;
    return matchesSearch && matchesClub;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-sky-500/20">
      
      {/* PAGE HEADER NAVIGATION */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Back Action & Brand */}
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
                <span className="font-display font-black text-xs sm:text-sm tracking-wider text-slate-900">PORTAL PESERTA</span>
                <span className="px-1.5 py-0.2 text-[8px] font-mono font-bold bg-sky-100 text-sky-700 rounded border border-sky-200">PUBLIC</span>
              </div>
              <p className="text-[9px] text-slate-400 font-mono">Buku Standings & Nilai Digital Atlit</p>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              SINKRONISASI GOR AKTIF
            </div>
            <div className="flex flex-col items-end text-right shrink-0">
              <span className="text-[9px] uppercase tracking-wider font-mono text-slate-450 font-bold">GOR Pertandingan</span>
              <span className="text-3xs font-black text-slate-500 uppercase tracking-widest">Divisi Utama</span>
            </div>
          </div>

        </div>
      </header>

      {/* COMPONENT BODY */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full space-y-8">
        
        {/* UPPER ANNOUNCEMENT HERO */}
        <div className="bg-gradient-to-r from-sky-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none translate-x-5 -translate-y-5">
            <Trophy className="w-72 h-72" />
          </div>
          <div className="max-w-2xl relative z-10 space-y-3">
            <span className="inline-flex px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-mono tracking-widest font-black uppercase">
              TRANSPARANSI SKOR FIG
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-black leading-tight">
              E-Certificate & Penilaian Terdistribusi Atlet Anda
            </h2>
            <p className="text-2xs sm:text-xs text-sky-100/95 leading-relaxed">
              Cari nama atlet Anda di bawah ini dan klik untuk memunculkan visualisasi grafik penilaian, rincian D-Score (DV + CR + CV) serta rincian E-Score (deduction/execution) yang diotorisasi secara sah oleh Juri.
            </p>
          </div>
        </div>

        {/* PAGE SECTION SPLITTER: LEFT SEARCH, RIGHT SELECTED ATHLETE PROFILE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUMN 1: ATHLETE FILES INDEX (8 COLS FOR MEDIUM UP, OTHERWISE FULL WIDTH) */}
          <section className="lg:col-span-12 space-y-6">
            
            <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xs space-y-6">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xs sm:text-sm font-display font-black text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                    <User className="w-4 h-4 text-sky-500" />
                    {currentAthleteId ? 'Data Nilai Pribadi Anda' : 'Direktori Atlit & Pencarian Sertifikat Digital'}
                  </h3>
                  <p className="text-3xs text-slate-400 font-mono mt-0.5">
                    {currentAthleteId 
                      ? 'Berikut adalah hasil penilaian yang telah dikurasi oleh juri resmi.'
                      : `Total ${matchedAthletes.length} Atlet terdaftar memenuhi filter saat ini.`
                    }
                  </p>
                </div>

                {!currentAthleteId && (
                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                    
                    {/* SEARCH BOX */}
                    <div className="relative w-full sm:w-60">
                      <Search className="w-3.5 h-3.5 text-slate-450 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama kontestan..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-9 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500 transition-all"
                      />
                    </div>

                    {/* PROVINCE SELECTED FILTER */}
                    <select
                      value={selectedClubFilter}
                      onChange={(e) => setSelectedClubFilter(e.target.value)}
                      className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-2xs font-bold text-slate-700 outline-none cursor-pointer focus:border-sky-500 transition-colors"
                    >
                      <option value="ALL">Semua Klub (Daerah)</option>
                      {Array.from(new Set(athletes.map(a => a.club))).map((club) => (
                        <option key={club} value={club}>{club}</option>
                      ))}
                    </select>

                  </div>
                )}
              </div>

              {/* ATHLETES CARDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {matchedAthletes.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-xs text-slate-450 italic bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                    Tidak menemukan nama atlet yang cocok dengan kriteria pencarian Anda.
                  </div>
                ) : (
                  matchedAthletes.map((athlete) => {
                    const isViewed = viewedAthleteId === athlete.id;
                    const athleteScores = standings.filter(s => s.athleteId === athlete.id);
                    const totalAccumulated = athleteScores.reduce((sum, s) => sum + s.totalScore, 0);

                    return (
                      <div
                        key={athlete.id}
                        id={`athlete-lookup-${athlete.id}`}
                        onClick={() => setViewedAthleteId(athlete.id)}
                        className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[140px] relative overflow-hidden ${
                          isViewed
                            ? 'bg-gradient-to-br from-sky-500/5 to-indigo-500/5 border-sky-500 ring-2 ring-sky-500/10 scale-[1.01] shadow-md shadow-sky-500/5'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-1 border-b border-slate-100 pb-1.5">
                            <span className="text-[9px] uppercase tracking-widest text-slate-455 font-mono font-bold truncate">
                              {athlete.club}
                            </span>
                            {athleteScores.length > 0 && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-250 text-[8px] font-mono font-black shrink-0">
                                {athleteScores.length} KATEGORI ALAT
                              </span>
                            )}
                          </div>
                          
                          <h4 className="font-display font-black text-xs text-slate-900 leading-tight block pt-1.5">
                            {athlete.name}
                          </h4>
                          
                          <div className="flex gap-1.5 pt-0.5">
                            <span className="px-1 py-0.2 rounded bg-slate-100 text-slate-600 text-[8px] font-mono font-bold uppercase">
                              {athlete.ageCategory}
                            </span>
                            <span className="px-1 py-0.2 rounded bg-slate-100 text-slate-600 text-[8px] font-mono font-bold uppercase">
                              {athlete.gender}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
                          <div className="text-[10px] font-mono text-slate-500">
                            {athleteScores.length > 0 ? (
                              <span>Total: <strong className="text-slate-900 font-extrabold">{totalAccumulated.toFixed(3)}</strong></span>
                            ) : (
                              <span className="text-rose-500 font-semibold font-mono text-[9px]">Belum Ada Nilai</span>
                            )}
                          </div>
                          <span className="text-[9px] font-black text-sky-600 flex items-center shrink-0">
                            Pilih Atlet <ChevronRight className="w-3 h-3 ml-0.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          </section>

          {/* COLUMN 2: ATHLETE REPORT CARD AND SCORE SHEETS */}
          <section className="lg:col-span-12">
            
            {viewedAthleteId ? (() => {
              const selectedAthleteObj = athletes.find(a => a.id === viewedAthleteId);
              if (!selectedAthleteObj) return null;

              const scoredAlat = standings.filter(s => s.athleteId === viewedAthleteId);
              const totalAccumulated = scoredAlat.reduce((sum, s) => sum + s.totalScore, 0);

              return (
                <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
                  
                  {/* CERTIFICATE BANNER HEADER style */}
                  <div className="border border-slate-150 p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/20 relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-indigo-600" />
                        <span className="text-3xs font-mono font-black text-indigo-600 uppercase tracking-widest leading-none">
                          KARTU HASIL HISTORIS RESMI ATLET (SAH)
                        </span>
                      </div>
                      
                      <h4 className="text-lg font-display font-black text-slate-900 uppercase">
                        {selectedAthleteObj.name}
                      </h4>
                      
                      <p className="text-3xs text-slate-500 font-semibold font-mono">
                        NID: {selectedAthleteObj.id} • DAERAH: {selectedAthleteObj.club} • GOLONGAN: {selectedAthleteObj.ageCategory} ({selectedAthleteObj.gender})
                      </p>
                    </div>

                    {scoredAlat.length > 0 ? (
                      <div className="p-3 bg-white border border-slate-200 rounded-xl text-center md:text-right w-full md:w-auto min-w-[150px]">
                        <span className="text-[8px] text-slate-400 font-mono font-bold block uppercase tracking-widest leading-none">
                          TOTAL SKOR AKUMULASI
                        </span>
                        <span className="text-xl font-display font-black text-emerald-600 tracking-tight leading-none block mt-1.5">
                          {totalAccumulated.toFixed(3)}
                        </span>
                        <span className="text-[8px] font-mono text-slate-400 font-bold block uppercase mt-1">
                          LULUS VERIFIKASI JURI
                        </span>
                      </div>
                    ) : (
                      <span className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-3xs font-mono font-bold text-red-700">
                        MARREDPOTENSI • PROFIL BELUM MEMILIKI SKOR TANDING
                      </span>
                    )}
                  </div>

                  {/* SCORES DETAILED SHEET LIST */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">
                      URAIAN NILAI JURI DARI TIP ALAT TAMPIL
                    </h5>
                    
                    {scoredAlat.length === 0 ? (
                      <div className="py-10 text-center text-xs text-slate-500 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        Atlit ini saat ini belum terdaftar di arena tanding manapun atau juri belum selesai memposting slip penilaian formal. Mohon tunggu.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {scoredAlat.map((score) => {
                          const ranksInApp = [...standings]
                            .filter(s => s.apparatusCode === score.apparatusCode)
                            .sort((a,b) => b.totalScore - a.totalScore);
                          const rankIndex = ranksInApp.findIndex(s => s.athleteId === score.athleteId) + 1;

                          return (
                            <div key={score.apparatusCode} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-200 gap-1.5">
                                  <span className="font-display font-black text-xs text-slate-900 truncate">
                                    {score.apparatusCode} — {score.apparatusName}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-black ${
                                    rankIndex === 1 ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                    rankIndex === 2 ? 'bg-slate-200 text-slate-700 border border-slate-300' :
                                    rankIndex === 3 ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                    'bg-white text-slate-500 border border-slate-200'
                                  }`}>
                                    {rankIndex === 1 ? '🥇 Rank 1' :
                                     rankIndex === 2 ? '🥈 Rank 2' :
                                     rankIndex === 3 ? '🥉 Rank 3' :
                                     `Rank ${rankIndex}`}
                                  </span>
                                </div>

                                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 py-1">
                                  <div className="bg-sky-50/50 p-1.5 sm:p-2 rounded-xl border border-sky-100 text-center min-w-0">
                                    <div className="text-[8px] sm:text-[9px] font-bold text-sky-700 font-mono truncate">D-Score</div>
                                    <div className="text-[7px] text-sky-500 font-mono hidden sm:block mt-0.5 leading-none">Kombinasi</div>
                                    <div className="text-[11px] sm:text-xs font-mono font-black text-sky-950 mt-0.5">{score.scoreD.toFixed(3)}</div>
                                  </div>
                                  <div className="bg-emerald-50/50 p-1.5 sm:p-2 rounded-xl border border-emerald-100 text-center min-w-0">
                                    <div className="text-[8px] sm:text-[9px] font-bold text-emerald-800 font-mono truncate">E-Score</div>
                                    <div className="text-[7px] text-emerald-500 font-mono hidden sm:block mt-0.5 leading-none">Eksekusi</div>
                                    <div className="text-[11px] sm:text-xs font-mono font-black text-emerald-950 mt-0.5">{score.scoreE.toFixed(3)}</div>
                                  </div>
                                  <div className="bg-rose-50/50 p-1.5 sm:p-2 rounded-xl border border-rose-100 text-center min-w-0">
                                    <div className="text-[8px] sm:text-[9px] font-bold text-rose-800 font-mono truncate">Penalti</div>
                                    <div className="text-[7px] text-rose-500 font-mono hidden sm:block mt-0.5 leading-none">Netral</div>
                                    <div className="text-[11px] sm:text-xs font-mono font-black text-rose-950 mt-0.5">-{score.penalties.toFixed(3)}</div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between border-t border-slate-200 pt-3 mt-3 text-3xs font-mono text-slate-500 uppercase">
                                <span>STATUS DOKUMEN: <strong className="text-emerald-500 font-extrabold">{score.status.toUpperCase()}</strong></span>
                                <span className="text-xs font-black text-slate-900">{score.totalScore.toFixed(3)} Pts</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Certificate print decorative button */}
                  {scoredAlat.length > 0 && (
                    <div className="pt-4 space-y-2">
                      <button
                        onClick={() => downloadCertificate(selectedAthleteObj)}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm py-3 px-5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border-none shadow-md"
                      >
                        <FileCheck className="w-4 h-4" />
                        DOWNLOAD E-CERTIFICATE
                      </button>
                      <div className="flex flex-col sm:flex-row justify-end gap-2">
                        <button
                          onClick={() => downloadFullLeaderboardXlsx()}
                          className="bg-sky-600 hover:bg-sky-500 text-white font-black text-2xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border-none shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          DOWNLOAD KLASEMEN LENGKAP
                        </button>
                        <button
                          onClick={() => downloadAthletePdfReport(selectedAthleteObj, scoredAlat)}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-black text-2xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border-none shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          DOWNLOAD NILAI PDF
                        </button>
                        <button
                          onClick={() => downloadAthleteXlsxReport(selectedAthleteObj, scoredAlat)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-2xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border-none shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          DOWNLOAD NILAI XLSX
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })() : (
              <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xs text-center space-y-4">
                <div className="w-14 h-14 bg-sky-50 rounded-full flex items-center justify-center mx-auto text-sky-600 text-xl font-display font-black">
                  👤
                </div>
                <h4 className="text-sm font-display font-black text-slate-900 uppercase">KOMPETITOR BELUM DIPILIH</h4>
                <p className="text-2xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Silakan tunjuk salah satu kartu atlit terdaftar di atas untuk menyalin laporan rincian nilai, bagan skor, dan mengunduh berkas tanding.
                </p>
                <div className="max-w-md mx-auto grid grid-cols-2 gap-2 pt-2">
                  {athletes.slice(0, 4).map(ath => (
                    <button
                      key={ath.id}
                      onClick={() => setViewedAthleteId(ath.id)}
                      className="p-3 bg-slate-50 border border-slate-200 hover:border-sky-500 rounded-xl text-center cursor-pointer transition-all"
                    >
                      <div className="text-[8px] font-mono text-slate-400 font-bold uppercase truncate">{ath.club}</div>
                      <div className="text-2xs font-display font-black text-slate-900 truncate mt-1">{ath.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </section>

        </div>

        {/* INTEGRATED BOARD: BROADCAST LEADERBOARD TAB */}
        <div id="integrated-board-tab" className="border-t border-slate-200 pt-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded bg-emerald-500 animate-pulse"></span>
            <span className="text-[9px] font-mono font-bold uppercase text-slate-450 tracking-wider">
              PANEL KLASEMEN TERPADU GOR
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
            Jakarta International Open Gymnastics • Official Scoring Center © 2026
          </div>
          <div className="flex gap-4">
            <span className="text-emerald-500">WebSocket Live Status: Connected (12ms)</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
