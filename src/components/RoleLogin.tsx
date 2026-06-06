import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, Lock, Sparkles, CheckCircle, AlertTriangle, KeyRound, UserCheck, HelpCircle } from 'lucide-react';
import { Account } from '../types';
import { hashPassword, logSecurityEvent } from '../lib/crypto';
import { navigateTo } from '../lib/navigation';

interface RoleLoginProps {
  role: 'peserta' | 'juri' | 'panitia' | 'superadmin';
  onLoginSuccess: (account: Account) => void;
}

export default function RoleLogin({ role, onLoginSuccess }: RoleLoginProps) {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Custom Dynamic Security Policy configuration
  const getSecurityPolicy = () => {
    try {
      const stored = localStorage.getItem('gymnascore_security_policy');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {}
    return { maxAttempts: 5, lockoutDuration: 30, levelName: 'Standard' };
  };

  const policy = getSecurityPolicy();

  // Rate-limiting and Brute Force defense states
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState<number>(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number>(policy.maxAttempts);


  // Read failed attempts from LocalStorage to lock input if needed
  const checkLockoutStatus = (): { isLocked: boolean; secondsLeft: number } => {
    try {
      const attemptsStr = localStorage.getItem('gymnascore_login_attempts');
      if (attemptsStr && usernameInput.trim()) {
        const attempts = JSON.parse(attemptsStr);
        const record = attempts[usernameInput.trim().toLowerCase()];
        if (record && record.lockedUntil) {
          const lockedTime = new Date(record.lockedUntil).getTime();
          const now = Date.now();
          if (lockedTime > now) {
            const seconds = Math.ceil((lockedTime - now) / 1000);
            return { isLocked: true, secondsLeft: seconds };
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
    return { isLocked: false, secondsLeft: 0 };
  };

  // Active Lockout countdown effect
  useEffect(() => {
    if (lockoutTimeLeft > 0) {
      const timer = setTimeout(() => {
        setLockoutTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutTimeLeft]);

  // Handle Input Changes & Update attempt counter warning dynamically
  useEffect(() => {
    if (usernameInput.trim()) {
      try {
        const attemptsStr = localStorage.getItem('gymnascore_login_attempts');
        if (attemptsStr) {
          const attempts = JSON.parse(attemptsStr);
          const record = attempts[usernameInput.trim().toLowerCase()];
          if (record) {
            setRemainingAttempts(Math.max(0, policy.maxAttempts - record.count));
            if (record.lockedUntil) {
              const lockedTime = new Date(record.lockedUntil).getTime();
              const now = Date.now();
              if (lockedTime > now) {
                setLockoutTimeLeft(Math.ceil((lockedTime - now) / 1000));
              }
            }
          } else {
            setRemainingAttempts(policy.maxAttempts);
            setLockoutTimeLeft(0);
          }
        }
      } catch (e) {
        // Safe fail
      }
    }
  }, [usernameInput, policy.maxAttempts]);

  // Role details config
  const roleConfig = {
    peserta: {
      title: 'Portal Atlet & Kontingen Daerah',
      subtitle: 'Sertifikat Nilai & Buku Rekapitulasi Digital',
      desc: 'Masukkan username dan password untuk melihat skor, statistik, dan mengunduh E-Sertifikat secara mudah.',
      colorTheme: 'from-sky-500 to-indigo-600 shadow-sky-500/10',
      badgeClass: 'bg-sky-50 border-sky-200 text-sky-900',
      defaultHint: 'User default: "peserta" / sandi: "peserta123"'
    },
    juri: {
      title: 'Portal Wasit & Juri Arbitrasi',
      subtitle: 'Penginputan Skor Tanding Resmi FIG',
      desc: 'Masukkan username dan password untuk mengakses portal juri. Akun menentukan jenis panel juri (D/E/Neutral).',
      colorTheme: 'from-rose-500 to-red-700 shadow-rose-500/10',
      badgeClass: 'bg-rose-50 border-rose-200 text-rose-900',
      defaultHint: 'User default: [ jurid / jurie / jurin ] / sandi: "juriD123" / "juriE123" etc'
    },
    panitia: {
      title: 'Portal Staff & Panitia Pelaksana',
      subtitle: 'Kotak Kontrol GOR, Atlet, & Kalender Kompetisi',
      desc: 'Masuk sebagai panitia untuk mendaftarkan atlet, mengatur arena, dan mengelola jadwal pertandingan dengan jelas.',
      colorTheme: 'from-amber-500 to-orange-600 shadow-amber-500/10',
      badgeClass: 'bg-amber-50 border-amber-200 text-amber-900',
      defaultHint: 'User default: "panitia" / sandi: "panitia123"'
    },
    superadmin: {
      title: 'Portal Root Super Administrator',
      subtitle: 'Otoritas Kontrol Kredensial & Proteksi Sistem',
      desc: 'Masuk sebagai superadmin untuk menambah akun, mereset password, dan memantau keamanan sistem.',
      colorTheme: 'from-slate-905 from-slate-900 via-indigo-950 to-slate-900 shadow-slate-950/20',
      badgeClass: 'bg-indigo-50 border-indigo-200 text-indigo-950',
      defaultHint: 'User default: "superadmin" / sandi: "superadmin123"'
    }
  };

  const current = roleConfig[role];

  // Secure Auth Mechanism
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const targetUsername = usernameInput.trim().toLowerCase();
    const targetPassword = passwordInput;

    if (!targetUsername || !targetPassword) {
      setError('Form login tidak boleh kosong!');
      return;
    }

    // 1. check if rate-limited lock already exists
    const status = checkLockoutStatus();
    if (status.isLocked) {
      setLockoutTimeLeft(status.secondsLeft);
      setError(`IP Otoritas terkunci sementara! Masuk dibatasi karena terlalu banyak kegagalan sandi. Sisa waktu: ${status.secondsLeft} detik.`);
      return;
    }

    try {
      // Load accounts database
      const accountsStr = localStorage.getItem('gymnascore_accounts');
      const accounts: Account[] = accountsStr ? JSON.parse(accountsStr) : [];

      // Find user
      const user = accounts.find(a => a.username === targetUsername);

      const attemptsStr = localStorage.getItem('gymnascore_login_attempts') || '{}';
      const attempts = JSON.parse(attemptsStr);

      if (!user) {
        // Log unknown username login attempt
        logSecurityEvent(
          'LOGIN_FAILED',
          targetUsername,
          `Percobaan login ke portal [${role.toUpperCase()}] dengan nama akun tidak terdaftar`,
          'REJECTED'
        );
        setError('Kombinasi Username dan Password Anda keliruh atau tidak valid!');
        return;
      }

      // Check Password Hash Matching
      const matchedHash = await hashPassword(targetPassword, user.salt);
      const isPasswordValid = (matchedHash === user.passwordHash);

      if (!isPasswordValid) {
        // Record Attempt failure in LocalStorage (Hacking mitigation)
        const currentCount = (attempts[targetUsername]?.count || 0) + 1;
        
        let lockedTimeStr: string | null = null;
        if (currentCount >= policy.maxAttempts) {
          const lockedUntilDate = new Date(Date.now() + (policy.lockoutDuration * 1000));
          lockedTimeStr = lockedUntilDate.toISOString();
          setLockoutTimeLeft(policy.lockoutDuration);
          
          logSecurityEvent(
            'LOCKOUT',
            targetUsername,
            `Akun terblokir setelah mencapai batas kegagalan sandi (${policy.maxAttempts} kali) untuk durasi ${policy.lockoutDuration}s`,
            'BLOCKED'
          );
          
          setError(`Sistem mengaktifkan Brute-Force lockout! Anda telah salah ketik sandi ${policy.maxAttempts} kali. Otoritas dibekukan selama ${policy.lockoutDuration} detik.`);
        } else {
          setRemainingAttempts(policy.maxAttempts - currentCount);
          
          logSecurityEvent(
            'LOGIN_FAILED',
            targetUsername,
            `Salah memasukkan password keamanan (percobaan ke-${currentCount}/${policy.maxAttempts})`,
            'DENIED'
          );

          setError(`Password salah! Sisa percobaan otorisasi: ${policy.maxAttempts - currentCount} kali sebelum lockdown.`);
        }

        attempts[targetUsername] = {
          count: currentCount,
          lockedUntil: lockedTimeStr
        };
        localStorage.setItem('gymnascore_login_attempts', JSON.stringify(attempts));
        return;
      }

      // Privilege Separation Validation (Prevents Privilege Escalation Hack)
      if (user.role !== role) {
        logSecurityEvent(
          'LOGIN_FAILED',
          targetUsername,
          `Percobaan peningkatan hak akses (Privilege Escalation) ke Portal [${role.toUpperCase()}]`,
          'BLOCKED'
        );
        setError(`Otorisasi Ditolak! Akun @${user.username} terdaftar sebagai [${user.role.toUpperCase()}] dan tidak diizinkan masuk ke Portal [${role.toUpperCase()}].`);
        return;
      }

      // CLEAR failed attempts on success!
      delete attempts[targetUsername];
      localStorage.setItem('gymnascore_login_attempts', JSON.stringify(attempts));

      // Successfully logged in
      logSecurityEvent(
        'LOGIN_SUCCESS',
        targetUsername,
        `Otorisasi kredensial berhasil divalidasi dengan SHA-256`,
        'ALLOWED'
      );

      // Successful Auth transition
      setIsSuccess(true);
      setTimeout(() => {
        onLoginSuccess(user);
      }, 800);

    } catch (err) {
      console.error(err);
      setError('Terjadi kendala interupsi database sirkuit tanding. Silakan ulangi sebentar lagi.');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
        
        {/* UPPER BANNER */}
        <div className={`p-6 sm:p-8 bg-gradient-to-br ${current.colorTheme} text-white space-y-2 relative overflow-hidden`}>
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400 fill-indigo-400 shrink-0" />
            <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/90 uppercase">
              Sistem Otentikasi Hashed Kredensial (Non-Google)
            </span>
          </div>
          
          <h2 className="text-base sm:text-xl font-display font-bold leading-tight uppercase tracking-tight mt-1">
            {current.title}
          </h2>
          
          <p className="text-3xs sm:text-2xs text-white/80 font-mono font-semibold">
            {current.subtitle}
          </p>
        </div>

        {/* INPUT FORM BODY */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <p className="text-2xs sm:text-xs text-slate-500 leading-relaxed font-semibold">
            {current.desc}
          </p>

          <div className="space-y-4">
            {/* Username Field */}
            <div className="space-y-1">
              <label htmlFor="login-username" className="text-[9px] font-mono font-bold text-slate-400 uppercase block tracking-wider">
                Username Petugas
              </label>
              <input
                id="login-username"
                type="text"
                required
                disabled={lockoutTimeLeft > 0}
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Masukkan username akun..."
                className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-mono"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label htmlFor="login-password" className="text-[9px] font-mono font-bold text-slate-400 uppercase block tracking-wider">
                Password Rahasia
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={lockoutTimeLeft > 0}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Masukkan password keamanan..."
                  className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl py-2.5 px-3 pr-10 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-mono"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-450 hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div role="alert" className="bg-rose-50 border border-rose-150 p-3 rounded-xl flex items-start gap-2 animate-shake">
              <AlertTriangle className="w-4.5 h-4.5 text-rose-600 mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-2xs text-rose-750 font-bold font-mono leading-snug">
                {error}
              </p>
            </div>
          )}

          {isSuccess && (
            <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-xl flex items-center gap-3 animate-bounce">
              <CheckCircle className="w-5 h-5 text-emerald-55 logo text-emerald-500 shrink-0" />
              <div>
                <p className="font-bold text-xs text-emerald-950">Akses Kredensial Berhasil Diverifikasi!</p>
                <p className="text-3xs text-emerald-600 font-mono">Memuat portal otoritas Anda...</p>
              </div>
            </div>
          )}

          {lockoutTimeLeft > 0 ? (
            <div className="bg-red-900 text-white rounded-xl p-3 text-center text-2xs font-mono font-bold animate-pulse">
              🛡️ BRUTE-FORCE LOCKOUT: INPUT DIBEKUKAN ({lockoutTimeLeft}s)
            </div>
          ) : (
            <button
              type="submit"
              disabled={isSuccess}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl text-3xs font-mono font-black tracking-widest border-none cursor-pointer transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <UserCheck className="w-3.5 h-3.5" />
              AUTENTIKASI AKUN MASUK PORTAL
            </button>
          )}

          {/* HINT AREA */}
          <div className={`p-4 rounded-2xl border border-dashed text-center flex flex-col items-center gap-1.5 ${current.badgeClass}`}>
            <span className="text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1 text-slate-800">
              <Sparkles className="w-4 h-4 text-amber-500" /> PANDUAN KREDENSIAL PORTAL (Fase Simulasi)
            </span>
            <p className="text-3xs leading-relaxed max-w-sm font-semibold text-slate-500">
              Sesuai instruksi, untuk meredakan resiko peretasan dan kebocoran data, pembuatan akun baru wajib melalui persetujuan Superadmin di halaman pusat kontrol. Kredensial pengujian default:
            </p>
            <div className="px-3 py-1.5 bg-white/60 border border-slate-200 rounded-xl font-mono text-[9px] font-black text-slate-800 leading-normal select-all">
              {current.defaultHint}
            </div>
          </div>

          {/* Quick link button to Superadmin to make testing easy */}
          {role !== 'superadmin' && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => { navigateTo('/superadmin'); }}
                className="text-[10px] font-mono font-semibold text-indigo-600 hover:text-indigo-850 hover:underline bg-transparent border-none cursor-pointer"
              >
                🔐 Masuk ke Panel Superadmin untuk Kelola Akun & Reset sandi Wasit
              </button>
            </div>
          )}

        </form>

      </div>
    </div>
  );
}
