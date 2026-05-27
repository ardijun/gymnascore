import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Settings, 
  RotateCcw, 
  PlusCircle, 
  Plus, 
  Users, 
  Sliders, 
  Check, 
  Activity, 
  FolderLock,
  CalendarDays
} from 'lucide-react';
import { Athlete, ActiveApparatusEvent, Competition, CertificateTemplate } from '../types';
import { generateCertificatePDF } from '../lib/certificate';
import { ConfirmModal } from '../components/ConfirmModal';

interface PanitiaPageProps {
  athletes: Athlete[];
  setAthletes: React.Dispatch<React.SetStateAction<Athlete[]>>;
  arenas: ActiveApparatusEvent[];
  setArenas: React.Dispatch<React.SetStateAction<ActiveApparatusEvent[]>>;
  competitions: Competition[];
  setCompetitions: React.Dispatch<React.SetStateAction<Competition[]>>;
  certificateTemplates: CertificateTemplate[];
  setCertificateTemplates: React.Dispatch<React.SetStateAction<CertificateTemplate[]>>;
  handleResetScoringSystem: () => void;
}

export default function PanitiaPage({
  athletes,
  setAthletes,
  arenas,
  setArenas,
  competitions,
  setCompetitions,
  certificateTemplates,
  setCertificateTemplates,
  handleResetScoringSystem
}: PanitiaPageProps) {
  
  // Tab control inside Panitia
  const [activeSubTab, setActiveSubTab] = useState<'control' | 'register' | 'events' | 'certificates'>('control');

  // Universal Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'primary';
  }>({
    isOpen: false, title: '', message: '', onConfirm: () => {}, variant: 'danger'
  });
  const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

  // Input states for new registration
  const [newAthName, setNewAthName] = useState('');
  const [newAthClub, setNewAthClub] = useState('DKI Jakarta');
  const [newAthAge, setNewAthAge] = useState('Senior Elite');
  const [newAthGender, setNewAthGender] = useState<'Men' | 'Women'>('Men');
  const [feedMsg, setFeedMsg] = useState('');

  // SUNTING ATLET
  const [editingAthId, setEditingAthId] = useState<string | null>(null);
  const [editAthName, setEditAthName] = useState('');
  const [editAthClub, setEditAthClub] = useState('DKI Jakarta');
  const [editAthAge, setEditAthAge] = useState('Senior Elite');
  const [editAthGender, setEditAthGender] = useState<'Men' | 'Women'>('Men');

  // SUNTING & TAMBAH JADWAL EVENT / KOMPETISI
  const [editingCompId, setEditingCompId] = useState<string | null>(null);
  const [editCompName, setEditCompName] = useState('');
  const [editCompLoc, setEditCompLoc] = useState('');
  const [editCompDate, setEditCompDate] = useState('');
  const [editCompStatus, setEditCompStatus] = useState<'Upcoming' | 'Active' | 'Completed'>('Upcoming');

  const [isAddingComp, setIsAddingComp] = useState(false);
  const [newCompName, setNewCompName] = useState('');
  const [newCompLoc, setNewCompLoc] = useState('');
  const [newCompDate, setNewCompDate] = useState('');
  const [newCompStatus, setNewCompStatus] = useState<'Upcoming' | 'Active' | 'Completed'>('Upcoming');

  // SUNTING & TAMBAH APPARATUS (ALAT TANDING)
  const [editingAppCode, setEditingAppCode] = useState<string | null>(null);
  const [editAppName, setEditAppName] = useState('');
  const [editAppStatus, setEditAppStatus] = useState<'Warm_up' | 'Routine' | 'Scoring' | 'Idle'>('Idle');
  const [editAppJudges, setEditAppJudges] = useState(5);

  const [isAddingApp, setIsAddingApp] = useState(false);
  const [newAppCode, setNewAppCode] = useState('');
  const [newAppName, setNewAppName] = useState('');
  const [newAppStatus, setNewAppStatus] = useState<'Warm_up' | 'Routine' | 'Scoring' | 'Idle'>('Idle');
  const [newAppJudges, setNewAppJudges] = useState(5);

  const [selectedCertificateAthleteId, setSelectedCertificateAthleteId] = useState<string>(athletes[0]?.id || '');
  const [selectedCertificateCompetitionId, setSelectedCertificateCompetitionId] = useState<string>(competitions[0]?.id || '');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(certificateTemplates[0]?.id || 'template-default');
  const [templateDraft, setTemplateDraft] = useState<CertificateTemplate>(() => certificateTemplates[0] || {
    id: 'template-default',
    name: 'Default Elegant',
    title: 'E-CERTIFICATE OF PARTICIPATION',
    subtitle: 'Jakarta International Gymnastics Open 2026',
    bodyText: 'This is to certify that',
    footerText: 'Official Gymnastics Scoring Center',
    backgroundColor: '#f0f9ff',
    borderColor: '#0369a1',
    accentColor: '#0284c7',
    includeScore: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const [certificateScore, setCertificateScore] = useState<number | null>(null);

  const handleBackToPortal = () => {
    window.location.hash = '#/';
  };

  // Sinkronisasikan sub-tab aktif dengan URL hash (untuk navigasi sidebar pintar)
  React.useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.includes('/register')) {
        setActiveSubTab('register');
      } else if (hash.includes('/events')) {
        setActiveSubTab('events');
      } else if (hash.includes('/certificates')) {
        setActiveSubTab('certificates');
      } else {
        setActiveSubTab('control');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAthName.trim()) return;

    const newId = `ath-${Date.now()}`;
    const newAthlete: Athlete = {
      id: newId,
      name: newAthName.trim(),
      club: newAthClub,
      ageCategory: newAthAge,
      gender: newAthGender,
    };

    setAthletes(prev => [...prev, newAthlete]);
    setFeedMsg(`Berhasil mendaftarkan atlet: ${newAthName.trim()} (${newAthClub})`);
    setNewAthName('');
    
    // Smooth timing message display
    setTimeout(() => {
      setFeedMsg('');
    }, 4500);

    // Swap back to control
    window.location.hash = '#/panitia/control';
  };

  React.useEffect(() => {
    const found = certificateTemplates.find(t => t.id === selectedTemplateId);
    if (found) {
      setTemplateDraft(found);
    }
  }, [selectedTemplateId, certificateTemplates]);

  const handleCreateNewTemplate = () => {
    const nextTemplate: CertificateTemplate = {
      id: `template-${Date.now()}`,
      name: 'Template Baru',
      title: 'CERTIFICATE OF ACHIEVEMENT',
      subtitle: competitions[0]?.name || 'Jakarta International Gymnastics Open 2026',
      bodyText: 'This is to certify that',
      footerText: 'Official Gymnastics Scoring Center',
      backgroundColor: '#f7f3ff',
      borderColor: '#4338ca',
      accentColor: '#8b5cf6',
      includeScore: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCertificateTemplates(prev => [...prev, nextTemplate]);
    setSelectedTemplateId(nextTemplate.id);
    setTemplateDraft(nextTemplate);
    setFeedMsg(`Template sertifikat baru dibuat.`);
    setTimeout(() => setFeedMsg(''), 4000);
  };

  const handleSaveTemplateDraft = () => {
    setCertificateTemplates(prev => prev.map(template => template.id === templateDraft.id ? {
      ...templateDraft,
      updatedAt: new Date().toISOString()
    } : template));
    setFeedMsg(`Template sertifikat "${templateDraft.name}" telah disimpan.`);
    setTimeout(() => setFeedMsg(''), 4000);
  };

  const handleDownloadCertificate = () => {
    const athlete = athletes.find(a => a.id === selectedCertificateAthleteId);
    const competition = competitions.find(c => c.id === selectedCertificateCompetitionId);

    if (!athlete || !competition) {
      setFeedMsg('Pilih atlet dan kompetisi sebelum mengunduh sertifikat.');
      setTimeout(() => setFeedMsg(''), 4000);
      return;
    }

    const doc = generateCertificatePDF(
      athlete.name,
      athlete.club,
      competition.name,
      competition.date,
      certificateScore,
      templateDraft
    );

    doc.save(`Sertifikat_${athlete.name.replace(/\s+/g, '_')}.pdf`);
    setFeedMsg(`Sertifikat untuk ${athlete.name} berhasil diunduh.`);
    setTimeout(() => setFeedMsg(''), 4000);
  };

  return (
    <div id="panitia-panel-container" className="space-y-8 w-full max-w-7xl mx-auto select-none">
      
      {/* UNIVERSAL CONFIRM MODAL */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmModal}
        variant={confirmModal.variant}
      />

      {/* HEADER BANNER SECURE ZONE */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-slate-100 rounded-3xl p-6 sm:p-8 shadow-md border border-amber-500/20 relative overflow-hidden">
        <div className="absolute top-1/2 right-12 -translate-y-1/2 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[70px] pointer-events-none"></div>
        <div className="max-w-4xl relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-amber-500/30 text-amber-100 border border-amber-450/40">
                Pusat Pengaturan Arena & Perlombaan GOR
              </span>
              <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-slate-900/40 text-amber-250 border border-slate-900/60">
                Hak Akses: Panitia Pelaksana Staf
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-black tracking-tight flex items-center gap-2 uppercase">
              ⚙️ Deck Pengaturan & Panitia Pelaksana
            </h2>
            <p className="text-2xs sm:text-xs text-amber-100 font-medium leading-relaxed max-w-2xl">
              Melalui laman ini, Panitia Pelaksana bertanggung jawab penuh mengatur urutan atlet pada alat tanding (apparatus), mendaftarkan kontestan baru, memperbarui agenda jadwal event, serta menyetel panel pendamping juri di tiap-tiap divisi arena GOR.
            </p>
          </div>
        </div>
      </div>

      {/* COMPONENT BODY */}
      <div className="space-y-8">
        
        {/* UPPER DOCK CONTROL SUMMARY ACTION */}
        <div className="bg-amber-500/5 border border-amber-400/20 p-5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="text-2xs font-mono font-bold text-amber-800 uppercase tracking-widest flex items-center gap-1.5">
              <FolderLock className="w-4 h-4" /> PANEL SUPERVISI & SINKRONISASI CAWANG GOR
            </div>
            <h3 className="text-sm sm:text-base font-display font-black text-slate-900 uppercase">
              Kendali Rotasi Jadwal & Bersihkan Record
            </h3>
            <p className="text-3xs text-slate-500 font-semibold font-mono">
              Reset nilai kontestan atau seed ulang database kembali ke setelan default awal juri.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                setConfirmModal({
                  isOpen: true,
                  title: 'Reset Skor',
                  message: 'Apakah Anda yakin ingin mereset state putaran? Semua skor pada alat akan dikosongkan.',
                  variant: 'warning',
                  onConfirm: () => {
                    closeConfirmModal();
                    handleResetScoringSystem();
                  }
                });
              }}
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-2xs font-black font-display px-4 py-2.5 rounded-xl border-none cursor-pointer flex items-center justify-center gap-1 shadow-sm transition-colors"
            >
              <RotateCcw className="w-4.5 h-4.5" />
              RESET ULANG DATA SKOR GOR (WIPE CACHE)
            </button>
          </div>
        </div>

        {/* FEEDBACK STATUS POOL */}
        {feedMsg && (
          <div className="bg-emerald-50 border border-emerald-350 rounded-xl px-4 py-3 text-2xs text-emerald-800 font-bold font-mono">
            {feedMsg}
          </div>
        )}

        {/* 1. ARENA CONTROLS TAB */}
        {activeSubTab === 'control' && (
          <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-3xl shadow-xs space-y-6">
            <div>
              <h4 className="text-sm font-display font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-500" />
                MANAJEMEN GOR: ATUR ATLET & STATUS ALAT SAAT INI
              </h4>
              <p className="text-2xs text-slate-500 mt-1 max-w-xl">
                Ganti atlit yang sedang menduduki alat tanding, ganti ke mode Pemanasan (Warm-up), Routine (Sedang Tampil), Scoring (Penilaian Juri), atau Idle (Kosong).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {arenas.map((arena) => (
                <div key={arena.apparatusCode} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 flex flex-col justify-between hover:shadow-sm transition-all">
                  
                  {/* Status header indicator */}
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                      <div>
                        <span className="font-mono text-sm font-extrabold text-slate-900">{arena.apparatusCode}</span>
                        <h5 className="text-[10px] text-slate-400 font-bold block leading-thin">{arena.apparatusName}</h5>
                      </div>
                      <span className={`text-[8px] font-mono font-black px-2 py-0.5 rounded-lg border uppercase ${
                        arena.status === 'Warm_up' ? 'bg-amber-100 text-amber-800 border-amber-350' :
                        arena.status === 'Routine' ? 'bg-sky-100 text-sky-800 border-sky-305' :
                        arena.status === 'Scoring' ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse' :
                        'bg-slate-200 text-slate-600 border-slate-300'
                      }`}>
                        {arena.status}
                      </span>
                    </div>

                    {/* Quick setting conditions */}
                    <div className="mt-3.5 space-y-1.5">
                      <span className="text-[9px] font-mono text-slate-400 font-black block">UBAH KONDISI/STATUS LAPANGAN:</span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(['Warm_up', 'Routine', 'Scoring', 'Idle'] as const).map((st) => (
                          <button
                            key={st}
                            onClick={() => {
                              setArenas(prev => prev.map(item => item.apparatusCode === arena.apparatusCode ? { ...item, status: st } : item));
                            }}
                            className={`py-1.5 rounded-lg text-[8px] font-black font-mono text-center cursor-pointer transition-all ${
                              arena.status === st
                                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 border-none font-black shadow-xs'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {st === 'Warm_up' ? 'WARM' :
                             st === 'Routine' ? 'ROUTINE' :
                             st === 'Scoring' ? 'JUDGING' : 'IDLE'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Competing athlete allocation */}
                  <div className="space-y-1 mt-1 text-2xs">
                    <span className="text-[10px] font-mono text-slate-400 font-black block">ALOKASI KONTENSTAN TAMPIL:</span>
                    <select
                      value={athletes.find(a => a.name === arena.currentAthleteName)?.id || ''}
                      onChange={(e) => {
                        const matched = athletes.find(a => a.id === e.target.value);
                        if (matched) {
                          setArenas(prev => prev.map(item => item.apparatusCode === arena.apparatusCode ? {
                            ...item,
                            currentAthleteName: matched.name,
                            currentAthleteClub: matched.club
                          } : item));
                        }
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-2xs text-slate-800 font-bold outline-none cursor-pointer focus:border-amber-500"
                    >
                      <option value="">-- Letakkan Atlit Lain --</option>
                      {athletes
                        .filter(ath => ath.gender === (arena.apparatusCode === 'BB' || arena.apparatusCode === 'UB' ? 'Women' : 'Men'))
                        .map(a => (
                          <option key={a.id} value={a.id}>{a.name} ({a.club})</option>
                        ))}
                    </select>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. ATHLETE REGISTRATION TAB */}
        {activeSubTab === 'register' && (
          <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-3xl shadow-xs max-w-lg mx-auto space-y-6">
            <div>
              <h4 className="text-sm font-display font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-500" />
                PENDAFTARAN ATLET RESMI BARU
              </h4>
              <p className="text-2xs text-slate-500 mt-1 leading-snug">
                Tambahkan atlet kontingen baru ke sistem database GOR. Profil langsung sinkron di portal pencarian nilai dan dapat langsung ditunjuk oleh juri.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4 text-2xs">
              
              <div className="space-y-1">
                <label className="text-[9px] font-mono font-bold text-slate-450 uppercase block">NAMA LENGKAP KONTENSTAN</label>
                <input
                  type="text"
                  required
                  value={newAthName}
                  onChange={(e) => setNewAthName(e.target.value)}
                  placeholder="Contoh: Rifda Irfanaluthfi"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-550 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono font-bold text-slate-450 uppercase block">DAERAH ASAL (KONTINGEN / KLUB)</label>
                <select
                  value={newAthClub}
                  onChange={(e) => setNewAthClub(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:border-amber-500 transition-colors"
                >
                  <option value="DKI Jakarta">DKI Jakarta</option>
                  <option value="Jawa Timur">Jawa Timur</option>
                  <option value="Jawa Barat">Jawa Barat</option>
                  <option value="Jawa Tengah">Jawa Tengah</option>
                  <option value="Sumatera Barat">Sumatera Barat</option>
                  <option value="Lampung">Lampung</option>
                  <option value="Bali">Bali</option>
                  <option value="Sulawesi Selatan">Sulawesi Selatan</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono font-bold text-slate-450 uppercase block">KATEGORI UMUR (DIVISION)</label>
                <select
                  value={newAthAge}
                  onChange={(e) => setNewAthAge(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:border-amber-500 transition-colors"
                >
                  <option value="Senior Elite">Senior Elite</option>
                  <option value="Junior Elite U16">Junior Elite U16</option>
                  <option value="Novice U12">Novice U12</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono font-bold text-slate-455 uppercase block">GENDER (SINKRONISASI ALAT FIG)</label>
                <div className="flex gap-4 p-1">
                  <label className="flex items-center gap-1.5 text-slate-700 font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="gender-admin-reg"
                      checked={newAthGender === 'Men'}
                      onChange={() => setNewAthGender('Men')}
                      className="accent-amber-500"
                    />
                    Putera (MAG)
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-705 font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="gender-admin-reg"
                      checked={newAthGender === 'Women'}
                      onChange={() => setNewAthGender('Women')}
                      className="accent-amber-500"
                    />
                    Puteri (WAG)
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 py-3 rounded-xl text-xs font-black font-display tracking-wide border-none cursor-pointer flex items-center justify-center gap-1 shadow-sm hover:shadow transition-colors"
              >
                <Plus className="w-5 h-5" />
                SIMPAN DAN DAFTARKAN ATLET
              </button>

            </form>

            <div className="pt-6 border-t border-slate-200 space-y-4">
              <h5 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest text-center">
                Direktori Atlet ({athletes.length})
              </h5>
              <div className="space-y-3">
                {athletes.map(ath => {
                  if (editingAthId === ath.id) {
                    return (
                      <div key={ath.id} className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3 flex flex-col justify-between">
                        <div className="space-y-2 text-2xs">
                          <label className="text-[8px] font-mono font-bold uppercase block text-slate-450">Nama Lengkap</label>
                          <input type="text" value={editAthName} onChange={e => setEditAthName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs font-bold" />
                          
                          <label className="text-[8px] font-mono font-bold uppercase block text-slate-450 mt-1">Daerah Asal</label>
                          <select value={editAthClub} onChange={e => setEditAthClub(e.target.value)} className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs font-bold">
                            <option value="DKI Jakarta">DKI Jakarta</option>
                            <option value="Jawa Timur">Jawa Timur</option>
                            <option value="Jawa Barat">Jawa Barat</option>
                            <option value="Jawa Tengah">Jawa Tengah</option>
                            <option value="Sumatera Barat">Sumatera Barat</option>
                            <option value="Lampung">Lampung</option>
                            <option value="Bali">Bali</option>
                            <option value="Sulawesi Selatan">Sulawesi Selatan</option>
                          </select>

                          <label className="text-[8px] font-mono font-bold uppercase block text-slate-450 mt-1">Divisi (Kategori Umur)</label>
                          <select value={editAthAge} onChange={e => setEditAthAge(e.target.value)} className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs font-bold">
                            <option value="Senior Elite">Senior Elite</option>
                            <option value="Junior Elite U16">Junior Elite U16</option>
                            <option value="Novice U12">Novice U12</option>
                          </select>

                          <label className="text-[8px] font-mono font-bold uppercase block text-slate-450 mt-1">Gender</label>
                          <select value={editAthGender} onChange={e => setEditAthGender(e.target.value as any)} className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs font-bold">
                            <option value="Men">Putera (MAG)</option>
                            <option value="Women">Puteri (WAG)</option>
                          </select>
                        </div>
                        <div className="flex gap-1.5 pt-2 border-t border-slate-200 mt-2">
                          <button type="button" onClick={() => setEditingAthId(null)} className="w-1/2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-bold cursor-pointer text-[10px]">Batal</button>
                          <button type="button" onClick={() => {
                            if (!editAthName.trim()) return;
                            setConfirmModal({
                              isOpen: true,
                              title: 'Simpan Perubahan',
                              message: `Simpan perubahan pada data atlet ${editAthName}?`,
                              variant: 'warning',
                              onConfirm: () => {
                                closeConfirmModal();
                                setAthletes(prev => prev.map(a => a.id === ath.id ? { ...a, name: editAthName.trim(), club: editAthClub, ageCategory: editAthAge, gender: editAthGender } : a));
                                setEditingAthId(null);
                                setFeedMsg(`Berhasil mengedit atlet: ${editAthName.trim()}`);
                                setTimeout(() => setFeedMsg(''), 4000);
                              }
                            });
                          }} className="w-1/2 py-1.5 bg-amber-500 text-slate-900 border border-amber-500 rounded-lg font-bold cursor-pointer text-[10px]">Simpan</button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={ath.id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-display font-black text-xs text-slate-800">{ath.name}</div>
                        <div className="text-[9px] font-mono text-slate-500 font-semibold">{ath.club} • {ath.ageCategory} • {ath.gender === 'Men' ? 'MAG' : 'WAG'}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => {
                          setEditingAthId(ath.id);
                          setEditAthName(ath.name);
                          setEditAthClub(ath.club);
                          setEditAthAge(ath.ageCategory);
                          setEditAthGender(ath.gender);
                        }} className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">Sunting</button>
                        <button type="button" onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            title: 'Hapus Atlet',
                            message: `Apakah Anda yakin ingin menghapus atlet "${ath.name}"? Data yang dihapus tidak dapat dikembalikan.`,
                            variant: 'danger',
                            onConfirm: () => {
                              closeConfirmModal();
                              setAthletes(prev => prev.filter(a => a.id !== ath.id));
                              setFeedMsg(`Berhasil menghapus atlet: ${ath.name}`);
                              setTimeout(() => setFeedMsg(''), 4000);
                            }
                          });
                        }} className="px-2.5 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-[9px] font-bold text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer">Hapus</button>
                      </div>
                    </div>
                  );
                })}
                {athletes.length === 0 && (
                  <div className="text-center py-6 text-2xs text-slate-400 italic">Belum ada atlet yang terdaftar</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'certificates' && (
          <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-3xl shadow-xs space-y-6">
            <div>
              <h4 className="text-sm font-display font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-500" />
                BUILDER SERTIFIKAT PANITIA
              </h4>
              <p className="text-2xs text-slate-500 mt-1">
                Susun template sertifikat, pilih atlet dan kompetisi, lalu unduh dokumen PDF resmi untuk distribusi.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-widest text-slate-500 font-black">Template Sertifikat</p>
                      <p className="text-3xs text-slate-400">Pilih atau sunting template yang akan digunakan untuk atlet.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCreateNewTemplate}
                      className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-white text-2xs font-black px-3 py-2 rounded-xl transition-colors"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Template Baru
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold uppercase text-slate-500">Pilih Template</label>
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 outline-none cursor-pointer focus:border-amber-500 transition-colors"
                      >
                        {certificateTemplates.map((template) => (
                          <option key={template.id} value={template.id}>{template.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold uppercase text-slate-500">Nama Template</label>
                      <input
                        type="text"
                        value={templateDraft.name}
                        onChange={(e) => setTemplateDraft(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold uppercase text-slate-500">Judul Sertifikat</label>
                      <input
                        type="text"
                        value={templateDraft.title}
                        onChange={(e) => setTemplateDraft(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold uppercase text-slate-500">Subjudul Komp.</label>
                      <input
                        type="text"
                        value={templateDraft.subtitle}
                        onChange={(e) => setTemplateDraft(prev => ({ ...prev, subtitle: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold uppercase text-slate-500">Teks Utama</label>
                      <textarea
                        rows={3}
                        value={templateDraft.bodyText}
                        onChange={(e) => setTemplateDraft(prev => ({ ...prev, bodyText: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold uppercase text-slate-500">Teks Footer</label>
                      <textarea
                        rows={3}
                        value={templateDraft.footerText}
                        onChange={(e) => setTemplateDraft(prev => ({ ...prev, footerText: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <label className="space-y-1 text-[9px] font-mono font-bold uppercase text-slate-500">
                      Background
                      <input
                        type="color"
                        value={templateDraft.backgroundColor}
                        onChange={(e) => setTemplateDraft(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="w-full h-11 rounded-xl border border-slate-200 cursor-pointer"
                      />
                    </label>
                    <label className="space-y-1 text-[9px] font-mono font-bold uppercase text-slate-500">
                      Border
                      <input
                        type="color"
                        value={templateDraft.borderColor}
                        onChange={(e) => setTemplateDraft(prev => ({ ...prev, borderColor: e.target.value }))}
                        className="w-full h-11 rounded-xl border border-slate-200 cursor-pointer"
                      />
                    </label>
                    <label className="space-y-1 text-[9px] font-mono font-bold uppercase text-slate-500">
                      Accent
                      <input
                        type="color"
                        value={templateDraft.accentColor}
                        onChange={(e) => setTemplateDraft(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="w-full h-11 rounded-xl border border-slate-200 cursor-pointer"
                      />
                    </label>
                    <label className="space-y-1 text-[9px] font-mono font-bold uppercase text-slate-500">
                      Sertakan Skor
                      <input
                        type="checkbox"
                        checked={templateDraft.includeScore}
                        onChange={(e) => setTemplateDraft(prev => ({ ...prev, includeScore: e.target.checked }))}
                        className="accent-amber-500 mt-2"
                      />
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                    <span className="text-3xs text-slate-500 font-mono">Perubahan template dapat disimpan untuk digunakan kembali nanti.</span>
                    <button
                      type="button"
                      onClick={handleSaveTemplateDraft}
                      className="bg-amber-500 hover:bg-amber-400 text-white text-2xs font-black px-4 py-2 rounded-xl transition-colors"
                    >
                      Simpan Template
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
                  <div className="space-y-2">
                    <p className="text-[9px] font-mono uppercase tracking-widest text-slate-500 font-black">Terbitkan Sertifikat</p>
                    <p className="text-3xs text-slate-400">Pilih atlet, kompetisi, dan nomor skor untuk unduhan.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold uppercase text-slate-500">Atlet</label>
                      <select
                        value={selectedCertificateAthleteId}
                        onChange={(e) => setSelectedCertificateAthleteId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 outline-none cursor-pointer focus:border-amber-500 transition-colors"
                      >
                        {athletes.map((athlete) => (
                          <option key={athlete.id} value={athlete.id}>{athlete.name} ({athlete.club})</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold uppercase text-slate-500">Kompetisi</label>
                      <select
                        value={selectedCertificateCompetitionId}
                        onChange={(e) => setSelectedCertificateCompetitionId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 outline-none cursor-pointer focus:border-amber-500 transition-colors"
                      >
                        {competitions.map((comp) => (
                          <option key={comp.id} value={comp.id}>{comp.name} — {comp.date}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase text-slate-500">Total Skor (Opsional)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={certificateScore ?? ''}
                      onChange={(e) => setCertificateScore(e.target.value ? Number(e.target.value) : null)}
                      placeholder="Ex: 25.300"
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 transition-all"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleDownloadCertificate}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white text-2xs font-black py-3 rounded-xl transition-colors"
                    >
                      UNDANG SERTIFIKAT PDF
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-950 rounded-3xl p-5 text-white shadow-sm">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-300 mb-3">Pratinjau Template</div>
                  <div className="rounded-3xl border border-slate-800 p-4" style={{ backgroundColor: templateDraft.backgroundColor, borderColor: templateDraft.borderColor }}>
                    <div className="text-[8px] uppercase tracking-[0.3em] text-slate-500 font-bold mb-3">{templateDraft.title}</div>
                    <div className="text-xs font-black text-slate-950 mb-3" style={{ color: templateDraft.accentColor }}>{templateDraft.subtitle}</div>
                    <div className="text-[11px] leading-snug text-slate-700 mb-4">{templateDraft.bodyText}</div>
                    <div className="text-lg font-black text-slate-900 mb-2">Nama Atlit</div>
                    <div className="text-[9px] uppercase tracking-[0.35em] text-slate-500 mb-4">Club • Event • Skor</div>
                    <div className="text-[9px] text-slate-500">{templateDraft.footerText}</div>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-4 text-2xs text-slate-500 space-y-2">
                  <p className="font-bold text-slate-900 uppercase tracking-widest">Catatan Penggunaan</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Template akan tersimpan di browser dan dapat dipilih ulang.</li>
                    <li>Skor bersifat opsional, hanya akan ditampilkan jika diisi dan dinyalakan.</li>
                    <li>Gunakan sertifikat ini untuk distribusi digital atau cetak resmi setelah diverifikasi.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. EVENTS & APPARATUS MANAGEMENT TAB */}
        {activeSubTab === 'events' && (
          <div className="space-y-8">
            
            {/* INLINE COMPETITIONS MANAGEMENT CARD */}
            <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-3xl shadow-xs space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-sm font-display font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-indigo-600" />
                    MANAJEMEN ENTRYS EVENT / KEJUARAAN REGIONAL
                  </h4>
                  <p className="text-2xs text-slate-500 mt-1">
                    Kelola nama turnamen, tempat pelaksanaan GOR, tanggal pertandingan, serta status kejuaraan terdata.
                  </p>
                </div>
                
                {!isAddingComp && (
                  <button
                    onClick={() => {
                      setIsAddingComp(true);
                      setNewCompName('');
                      setNewCompLoc('');
                      setNewCompDate(new Date().toISOString().split('T')[0]);
                      setNewCompStatus('Upcoming');
                    }}
                    className="self-start sm:self-auto bg-indigo-600 hover:bg-indigo-505 font-black text-3xs font-mono text-white py-2 px-3.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors border-none"
                  >
                    <Plus className="w-4 h-4" /> TAMBAH EVENT BARU
                  </button>
                )}
              </div>

              {/* Form to Create a Competition */}
              {isAddingComp && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newCompName.trim()) return;
                    const created: Competition = {
                      id: `comp-${Date.now()}`,
                      name: newCompName.trim(),
                      location: newCompLoc.trim() || 'GOR Serbaguna',
                      date: newCompDate || new Date().toISOString().split('T')[0],
                      status: newCompStatus
                    };
                    setCompetitions(prev => [...prev, created]);
                    setFeedMsg(`Berhasil menambahkan kompetisi: ${created.name}`);
                    setIsAddingComp(false);
                    setTimeout(() => setFeedMsg(''), 4000);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 text-2xs"
                >
                  <div className="font-mono font-bold text-slate-700 text-[10px] uppercase border-b border-slate-200 pb-1.5 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span> PENDAFTARAN KOMPETISI / TURNAMEN SENAM BARU
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-slate-450 uppercase block">Nama Kejuaraan</label>
                      <input
                        type="text"
                        required
                        value={newCompName}
                        onChange={e => setNewCompName(e.target.value)}
                        placeholder="Contoh: Kejurnas Aerobic Gymnastics 2026"
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-slate-450 uppercase block">Pusat Lokasi (Venue)</label>
                      <input
                        type="text"
                        required
                        value={newCompLoc}
                        onChange={e => setNewCompLoc(e.target.value)}
                        placeholder="Contoh: GOR Ragunan Hall B, Jakarta"
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-slate-450 uppercase block">Tanggal Pertandingan</label>
                      <input
                        type="date"
                        required
                        value={newCompDate}
                        onChange={e => setNewCompDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-semibold font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-slate-450 uppercase block">Status Pelaksanaan</label>
                      <select
                        value={newCompStatus}
                        onChange={e => setNewCompStatus(e.target.value as any)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold outline-none focus:border-indigo-555"
                      >
                        <option value="Upcoming">Upcoming (Mendatang)</option>
                        <option value="Active">Active (Berlangsung)</option>
                        <option value="Completed">Completed (Selesai)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingComp(false)}
                      className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-250 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold border-none cursor-pointer transition-colors shadow-xs"
                    >
                      Simpan Kompetisi
                    </button>
                  </div>
                </form>
              )}

              {/* List of Competitions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {competitions.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-xs text-slate-400 italic font-mono bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                    Belum ada kejuaraan terdata di sistem. Silakan tambah baru.
                  </div>
                ) : (
                  competitions.map((comp) => {
                    const isEditing = editingCompId === comp.id;

                    if (isEditing) {
                      return (
                        <div key={comp.id} className="p-4 bg-amber-500/5 border border-amber-300 rounded-2xl space-y-3 flex flex-col justify-between">
                          <div className="space-y-2.5 text-3xs">
                            <span className="font-mono font-bold text-amber-800 uppercase block">SUNTING DATA KEJUARAAN</span>
                            
                            <div className="space-y-1">
                              <label className="text-[8px] font-mono font-bold uppercase block text-slate-450">Nama Turnamen</label>
                              <input
                                type="text"
                                value={editCompName}
                                onChange={e => setEditCompName(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-2xs font-bold"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[8px] font-mono font-bold uppercase block text-slate-450">Lokasi Venue</label>
                              <input
                                type="text"
                                value={editCompLoc}
                                onChange={e => setEditCompLoc(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-2xs font-bold"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[8px] font-mono font-bold uppercase block text-slate-450">Tanggal Kejuaraan</label>
                              <input
                                type="date"
                                value={editCompDate}
                                onChange={e => setEditCompDate(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-2xs font-mono font-bold"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[8px] font-mono font-bold uppercase block text-slate-450">Status</label>
                              <select
                                value={editCompStatus}
                                onChange={e => setEditCompStatus(e.target.value as any)}
                                className="w-full bg-white border border-slate-200 p-1.5 rounded-md text-2xs font-bold"
                              >
                                <option value="Upcoming">Upcoming</option>
                                <option value="Active">Active</option>
                                <option value="Completed">Completed</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex gap-1.5 pt-2 border-t border-slate-200 mt-2">
                            <button
                              type="button"
                              onClick={() => setEditingCompId(null)}
                              className="w-1/2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-bold cursor-pointer text-[10px]"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!editCompName.trim()) return;
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Simpan Perubahan',
                                  message: `Simpan perubahan pada kompetisi "${editCompName}"?`,
                                  variant: 'warning',
                                  onConfirm: () => {
                                    closeConfirmModal();
                                    setCompetitions(prev => prev.map(c => c.id === comp.id ? {
                                      ...c,
                                      name: editCompName.trim(),
                                      location: editCompLoc.trim(),
                                      date: editCompDate,
                                      status: editCompStatus
                                    } : c));
                                    setEditingCompId(null);
                                    setFeedMsg(`Berhasil mengedit kompetisi: ${editCompName}`);
                                    setTimeout(() => setFeedMsg(''), 4000);
                                  }
                                });
                              }}
                              className="w-1/2 py-1.5 bg-amber-500 text-slate-90 uppercase font-black rounded-lg cursor-pointer text-[10px] border-none"
                            >
                              Simpan
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={comp.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-between hover:border-indigo-200 transition-all">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <span className="text-[9px] font-mono font-bold text-slate-400">ID: {comp.id}</span>
                            <span className={`text-[8px] font-mono font-black px-2 py-0.5 rounded-md border uppercase ${
                              comp.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                              comp.status === 'Upcoming' ? 'bg-sky-50 text-sky-700 border-sky-300' :
                              'bg-slate-200 text-slate-500 border-slate-350'
                            }`}>
                              {comp.status}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h5 className="font-display font-black text-xs text-slate-900 leading-snug">{comp.name}</h5>
                            <p className="text-3xs font-semibold text-slate-500 font-mono">📍 {comp.location}</p>
                            <p className="text-3xs font-semibold text-indigo-650 font-mono">📅 {comp.date}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-1.5 border-t border-slate-200 pt-3 mt-4">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCompId(comp.id);
                              setEditCompName(comp.name);
                              setEditCompLoc(comp.location);
                              setEditCompDate(comp.date);
                              setEditCompStatus(comp.status);
                            }}
                            className="bg-white hover:bg-slate-100 p-1.5 px-3 rounded-lg border border-slate-200 text-3xs font-bold text-slate-600 transition-colors cursor-pointer"
                          >
                            Sunting
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: 'Hapus Kompetisi',
                                message: `Apakah Anda yakin ingin menghapus kompetisi "${comp.name}"? Data yang sudah dihapus tidak dapat dikembalikan.`,
                                variant: 'danger',
                                onConfirm: () => {
                                  closeConfirmModal();
                                  setCompetitions(prev => prev.filter(c => c.id !== comp.id));
                                  setFeedMsg(`Berhasil menghapus kompetisi: ${comp.name}`);
                                  setTimeout(() => setFeedMsg(''), 4000);
                                }
                              });
                            }}
                            className="bg-rose-50 hover:bg-rose-100 p-1.5 px-3 rounded-lg border border-rose-200 text-3xs font-bold text-rose-600 transition-colors cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* INLINE APPARATUS MANAGEMENT CARD */}
            <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-3xl shadow-xs space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-sm font-display font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-rose-605" />
                    MANAJEMEN ALAT TANDING AKTIF (APPARATUS EVENTS)
                  </h4>
                  <p className="text-2xs text-slate-500 mt-1">
                    Kelola arena alat pertandingan resmi FIG. Tambah sirkuit baru, ubah estimasi jumlah juri pendamping, atau nonaktifkan alat dari panggung utama.
                  </p>
                </div>

                {!isAddingApp && (
                  <button
                    onClick={() => {
                      setIsAddingApp(true);
                      setNewAppCode('');
                      setNewAppName('');
                      setNewAppStatus('Idle');
                      setNewAppJudges(5);
                    }}
                    className="self-start sm:self-auto bg-rose-600 hover:bg-rose-550 font-black text-3xs font-mono text-white py-2 px-3.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors border-none"
                  >
                    <Plus className="w-4 h-4" /> TAMBAH APPARATUS BARU
                  </button>
                )}
              </div>

              {/* Form to Create Apparatus */}
              {isAddingApp && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newAppCode.trim() || !newAppName.trim()) return;
                    
                    const normalizedCode = newAppCode.trim().toUpperCase();
                    
                    // Prevent duplicate code
                    if (arenas.some(a => a.apparatusCode === normalizedCode)) {
                      setFeedMsg(`Gagal: Kode alat "${normalizedCode}" sudah digunakan.`);
                      setTimeout(() => setFeedMsg(''), 5000);
                      return;
                    }

                    const created: ActiveApparatusEvent = {
                      apparatusCode: normalizedCode,
                      apparatusName: newAppName.trim(),
                      currentAthleteName: '',
                      currentAthleteClub: '',
                      status: newAppStatus,
                      activeJudgesCount: Number(newAppJudges) || 5
                    };
                    
                    setArenas(prev => [...prev, created]);
                    setFeedMsg(`Berhasil menambahkan alat baru: ${created.apparatusName} (${created.apparatusCode})`);
                    setIsAddingApp(false);
                    setTimeout(() => setFeedMsg(''), 4000);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 text-2xs"
                >
                  <div className="font-mono font-bold text-slate-700 text-[10px] uppercase border-b border-slate-200 pb-1.5 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> PENDAFTARAN ALAT TANDING (SOCIETAL FIG CODE) BARU
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-slate-450 uppercase block">Kode Alat (Short Code)</label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        value={newAppCode}
                        onChange={e => setNewAppCode(e.target.value)}
                        placeholder="Contoh: SR, VT, HB, LH (Max 5 huruf)"
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold uppercase font-mono"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-slate-450 uppercase block">Nama Panjang Alat (Apparatus Name)</label>
                      <input
                        type="text"
                        required
                        value={newAppName}
                        onChange={e => setNewAppName(e.target.value)}
                        placeholder="Contoh: Still Rings, Vaulting Table, Horizontal Bar"
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-slate-450 uppercase block">Alokasi Panel Juri</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        required
                        value={newAppJudges}
                        onChange={e => setNewAppJudges(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-semibold font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-slate-450 uppercase block">Status Lapangan Awal</label>
                      <select
                        value={newAppStatus}
                        onChange={e => setNewAppStatus(e.target.value as any)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold outline-none"
                      >
                        <option value="Idle">Idle (Kosong)</option>
                        <option value="Warm_up">Warm_up (Pemanasan)</option>
                        <option value="Routine">Routine (Pemberagaan)</option>
                        <option value="Scoring">Scoring (Penilaian)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingApp(false)}
                      className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-250 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-550 text-white rounded-xl font-bold border-none cursor-pointer transition-colors shadow-xs"
                    >
                      Daftarkan Alat
                    </button>
                  </div>
                </form>
              )}

              {/* Apparatus cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {arenas.map((arena) => {
                  const isEditing = editingAppCode === arena.apparatusCode;

                  if (isEditing) {
                    return (
                      <div key={arena.apparatusCode} className="p-4 bg-rose-500/5 border border-rose-300 rounded-2xl flex flex-col justify-between space-y-3">
                        <div className="space-y-2 text-3xs">
                          <span className="font-mono font-bold text-rose-800 uppercase block">SUNTING APPARATUS: {arena.apparatusCode}</span>
                          
                          <div className="space-y-1">
                            <label className="text-[8px] font-mono font-bold uppercase block text-slate-450">Nama Panjang Alat</label>
                            <input
                              type="text"
                              required
                              value={editAppName}
                              onChange={e => setEditAppName(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-2xs font-bold font-sans"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8px] font-mono font-bold uppercase block text-slate-450">Alokasi Juri (Max 10)</label>
                            <input
                              type="number"
                              min={1}
                              max={10}
                              required
                              value={editAppJudges}
                              onChange={e => setEditAppJudges(Number(e.target.value))}
                              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-2xs font-bold font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8px] font-mono font-bold uppercase block text-slate-450">Status Lapangan</label>
                            <select
                              value={editAppStatus}
                              onChange={e => setEditAppStatus(e.target.value as any)}
                              className="w-full bg-white border border-slate-200 p-1.5 rounded-lg text-2xs font-bold"
                            >
                              <option value="Idle">Idle</option>
                              <option value="Warm_up">Warm_up</option>
                              <option value="Routine">Routine</option>
                              <option value="Scoring">Scoring</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-1.5 pt-2 border-t border-slate-200 mt-2">
                          <button
                            type="button"
                            onClick={() => setEditingAppCode(null)}
                            className="w-1/2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-bold cursor-pointer text-[10px]"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!editAppName.trim()) return;
                              setConfirmModal({
                                isOpen: true,
                                title: 'Simpan Perubahan',
                                message: `Simpan perubahan pada alat "${editAppName}"?`,
                                variant: 'warning',
                                onConfirm: () => {
                                  closeConfirmModal();
                                  setArenas(prev => prev.map(a => a.apparatusCode === arena.apparatusCode ? {
                                    ...a,
                                    apparatusName: editAppName.trim(),
                                    status: editAppStatus,
                                    activeJudgesCount: editAppJudges
                                  } : a));
                                  setEditingAppCode(null);
                                  setFeedMsg(`Berhasil mengedit alat: ${editAppName}`);
                                  setTimeout(() => setFeedMsg(''), 4000);
                                }
                              });
                            }}
                            className="w-1/2 py-1.5 bg-rose-600 text-white font-bold rounded-lg cursor-pointer text-[10px] border-none"
                          >
                            Simpan
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={arena.apparatusCode} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-between hover:border-rose-200 transition-all">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="text-xs font-mono font-black text-rose-600 uppercase tracking-widest leading-none bg-rose-50 border border-rose-100 p-1.5 rounded-lg">
                            {arena.apparatusCode}
                          </span>
                          <span className={`text-[8px] font-mono font-black px-1.5 py-0.2 rounded border uppercase ${
                            arena.status === 'Routine' ? 'bg-sky-50 text-sky-700 border-sky-300' :
                            arena.status === 'Warm_up' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                            arena.status === 'Scoring' ? 'bg-rose-50 text-rose-700 border-rose-300' :
                            'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            {arena.status}
                          </span>
                        </div>

                        <div className="space-y-1 pt-1.5">
                          <h5 className="font-display font-black text-xs text-slate-900 leading-tight">{arena.apparatusName}</h5>
                          <span className="text-3xs font-semibold text-slate-400 font-mono block">⚖️ Panel Pendamping: {arena.activeJudgesCount} Juri</span>
                          {arena.currentAthleteName ? (
                            <p className="text-4xs text-emerald-600 font-bold font-mono mt-1 uppercase">
                              Active: {arena.currentAthleteName} ({arena.currentAthleteClub})
                            </p>
                          ) : (
                            <p className="text-4xs text-slate-400 font-medium font-mono mt-1 italic">
                              No Competitor Assigned
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 border-t border-slate-200 pt-3 mt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAppCode(arena.apparatusCode);
                            setEditAppName(arena.apparatusName);
                            setEditAppStatus(arena.status);
                            setEditAppJudges(arena.activeJudgesCount);
                          }}
                          className="bg-white hover:bg-slate-100 p-1.5 px-3 rounded-lg border border-slate-200 text-3xs font-bold text-slate-600 transition-colors cursor-pointer"
                        >
                          Sunting
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: 'Hapus Alat',
                              message: `Apakah Anda yakin ingin menghapus alat "${arena.apparatusName}" (${arena.apparatusCode})? Pastikan tidak ada data skor yang masih dibutuhkan pada alat ini.`,
                              variant: 'danger',
                              onConfirm: () => {
                                closeConfirmModal();
                                setArenas(prev => prev.filter(item => item.apparatusCode !== arena.apparatusCode));
                                setFeedMsg(`Berhasil menghapus alat: ${arena.apparatusName}`);
                                setTimeout(() => setFeedMsg(''), 4000);
                              }
                            });
                          }}
                          className="bg-rose-50 hover:bg-rose-100 p-1.5 px-3 rounded-lg border border-rose-250 text-3xs font-bold text-rose-600 transition-colors cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        )}

      </div>

      {/* STANDALONE FOOTER */}
      <footer className="border-t border-slate-200 py-6 mt-12 text-center text-3xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Jakarta International Open Gymnastics • Administrative Controller © 2026
          </div>
          <div>
            <span className="text-amber-600 font-bold">Status Database: Sinkron</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
