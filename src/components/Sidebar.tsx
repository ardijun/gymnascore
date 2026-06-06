import React from 'react';
import { 
  Trophy, 
  Users, 
  Award, 
  Settings, 
  LogOut, 
  Lock, 
  Unlock, 
  Activity, 
  Sparkles,
  Menu,
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (hash: string) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  authStates: {
    peserta: boolean;
    juri: boolean;
    juriRole: 'D' | 'E' | 'Neutral' | null;
    panitia: boolean;
    superadmin: boolean;
    currentUserName?: string | null;
  };
  onLogout: (role: 'peserta' | 'juri' | 'panitia' | 'superadmin') => void;
}

export default function Sidebar({
  currentPath,
  onNavigate,
  isSidebarOpen,
  setSidebarOpen,
  authStates,
  onLogout
}: SidebarProps) {
  
  const menuItems = [
    {
      id: '/',
      label: 'Live Dashboard',
      description: 'Klasemen Real-Time & Live Arena',
      icon: Trophy,
      color: 'text-amber-500',
      bgColor: 'hover:bg-slate-100',
      activeBg: 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-600',
      isProtected: false,
    },
    {
      id: '/peserta',
      label: 'Portal Peserta',
      description: 'Sertifikat & Cari Nilai Atlit',
      icon: Users,
      color: 'text-sky-500',
      bgColor: 'hover:bg-slate-100',
      activeBg: 'bg-sky-50 text-sky-700 border-r-4 border-sky-500',
      isProtected: true,
      authKey: 'peserta' as const,
    },
    {
      id: '/juri',
      label: 'Portal Juri',
      description: 'Kalkulator & Input Slip Nilai',
      icon: Award,
      color: 'text-rose-500',
      bgColor: 'hover:bg-slate-100',
      activeBg: 'bg-rose-50 text-rose-700 border-r-4 border-rose-500',
      isProtected: true,
      authKey: 'juri' as const,
    },
    {
      id: '/panitia',
      label: 'Portal Panitia',
      description: 'Manajemen Event & Alat',
      icon: Settings,
      color: 'text-amber-600',
      bgColor: 'hover:bg-slate-100',
      activeBg: 'bg-amber-50 text-amber-700 border-r-4 border-amber-600',
      isProtected: true,
      authKey: 'panitia' as const,
    },
    {
      id: '/superadmin',
      label: 'Panel Superadmin',
      description: 'Kontrol Kredensial Hashed',
      icon: ShieldAlert,
      color: 'text-purple-600',
      bgColor: 'hover:bg-purple-50',
      activeBg: 'bg-purple-100/60 text-purple-800 border-r-4 border-purple-600',
      isProtected: true,
      authKey: 'superadmin' as const,
    }
  ];

  // Securely filter menu items: Inside each portal, only display its own portal + Live Dashboard
  const getFilteredMenuItems = () => {
    const list = [menuItems[0]]; // Always show Live Dashboard option
    
    if (currentPath.startsWith('/peserta')) {
      list.push(menuItems[1]);
    } else if (currentPath.startsWith('/juri')) {
      const activeJuriRole = authStates.juriRole;
      const customJuriLabel = activeJuriRole 
        ? `Portal Juri (Panel-${activeJuriRole})` 
        : 'Portal Juri';
      const customJuriDesc = activeJuriRole === 'D'
        ? 'Mode Nilai Kesulitan (DV/CR/CV)'
        : activeJuriRole === 'E'
          ? 'Mode Nilai Eksekusi / Potongan'
          : activeJuriRole === 'Neutral'
            ? 'Mode Penalti Netral Juri'
            : 'Kalkulator & Input Slip Nilai';
      
      list.push({
        ...menuItems[2],
        label: customJuriLabel,
        description: customJuriDesc
      });
    } else if (currentPath.startsWith('/panitia')) {
      list.push(menuItems[3]);
    } else if (currentPath.startsWith('/superadmin')) {
      list.push(menuItems[4]);
    } else {
      // Fallback
      list.push(menuItems[1], menuItems[2], menuItems[3]);
      if (authStates.superadmin) {
        list.push(menuItems[4]);
      }
    }
    return list;
  };

  const filteredMenuItems = getFilteredMenuItems();

  const handleItemClick = (path: string) => {
    // Jika mengeklik panel superadmin atau panitia utama, arahkan ke sub-menu default
    if (path === '/superadmin') {
      onNavigate('/superadmin/accounts');
    } else if (path === '/panitia') {
      onNavigate('/panitia/control');
    } else {
      onNavigate(path);
    }
    setSidebarOpen(false); // Close mobile sidebar on navigate
  };

  return (
    <>
      {/* Mobile Back-drop overlay when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* PERSISTENT SIDEBAR INNER WRAPPER */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex h-full w-72 flex-col justify-between border-r border-slate-200 bg-white transition-transform duration-300 lg:sticky lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* SIDEBAR HEADER */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 font-display font-black text-xl text-white shadow-md shadow-indigo-600/20">
              G
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div>
              <span className="block font-display font-black text-xs sm:text-sm tracking-wider uppercase text-slate-900 leading-none">GymnaScore</span>
              <span className="text-[9px] font-mono text-slate-400 font-bold uppercase leading-none mt-1 block">Portal Otoritas</span>
            </div>
          </div>
          
          <button 
            type="button" 
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup sidebar"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          >
            ✕
          </button>
        </div>

        {/* NAVIGATION MENUS AREA */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-7">
          
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Menu Utama Portal
            </span>
            <nav className="space-y-1">
              {filteredMenuItems.map((item) => {
                const isActive = (item.id === '/' && (currentPath === '' || currentPath === '/')) ||
                  (item.id !== '/' && currentPath.startsWith(item.id));
                const isAuthed = item.isProtected && item.authKey && authStates[item.authKey];
                
                return (
                  <div key={item.id} className="space-y-1">
                    <button
                      onClick={() => handleItemClick(item.id)}
                      className={`group flex w-full items-center justify-between rounded-xl p-3 text-left transition-all ${
                        isActive ? item.activeBg : `text-slate-600 ${item.bgColor}`
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 ${isActive ? 'text-current' : item.color}`}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-display font-extrabold text-xs sm:text-xs tracking-wide text-slate-850">
                            {item.label}
                          </div>
                          <div className={`text-[10px] ${isActive ? 'text-indigo-600/70' : 'text-slate-400'}`}>
                            {item.description}
                          </div>
                        </div>
                      </div>

                      {item.isProtected && (
                        <div className="pl-2 shrink-0">
                          {isAuthed ? (
                            <span 
                              title="Tersertifikasi / Terbuka"
                              className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200"
                            >
                              <Unlock className="h-3 w-3" />
                            </span>
                          ) : (
                            <span 
                              title="Butuh Kode Akses"
                              className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-105 text-slate-400 border border-slate-200"
                            >
                              <Lock className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                      )}
                    </button>

                    {item.id === '/superadmin' && currentPath.startsWith('/superadmin') && (
                      <div id="superadmin-sidebar-submenus" className="ml-4 pl-3.5 border-l border-indigo-200 space-y-1.5 pt-1 pb-1 animate-fadeIn">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick('/superadmin/accounts');
                          }}
                          className={`w-full text-left py-1.5 px-2.5 rounded-lg text-2xs font-sans font-bold transition-all cursor-pointer block ${
                            !currentPath.includes('/security-policy')
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-150'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
                          }`}
                        >
                          👥 Direktori Akun
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick('/superadmin/security-policy');
                          }}
                          className={`w-full text-left py-1.5 px-2.5 rounded-lg text-2xs font-sans font-bold transition-all cursor-pointer block ${
                            currentPath.includes('/security-policy')
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-150'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
                          }`}
                        >
                          🛡️ Kebijakan & Log Audit
                        </button>
                      </div>
                    )}

                    {item.id === '/panitia' && currentPath.startsWith('/panitia') && (
                      <div id="panitia-sidebar-submenus" className="ml-4 pl-3.5 border-l border-amber-350 space-y-1.5 pt-1 pb-1 animate-fadeIn">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick('/panitia/control');
                          }}
                          className={`w-full text-left py-1.5 px-2.5 rounded-lg text-2xs font-sans font-bold transition-all cursor-pointer block ${
                            !currentPath.includes('/register') && !currentPath.includes('/events')
                              ? 'bg-amber-50 text-amber-900 border border-amber-200'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
                          }`}
                        >
                          ⚙️ Pengaturan Arena
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick('/panitia/register');
                          }}
                          className={`w-full text-left py-1.5 px-2.5 rounded-lg text-2xs font-sans font-bold transition-all cursor-pointer block ${
                            currentPath.includes('/register')
                              ? 'bg-amber-50 text-amber-900 border border-amber-200'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
                          }`}
                        >
                          ➕ Registrasi Atlet
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick('/panitia/events');
                          }}
                          className={`w-full text-left py-1.5 px-2.5 rounded-lg text-2xs font-sans font-bold transition-all cursor-pointer block ${
                            currentPath.includes('/events')
                              ? 'bg-amber-50 text-amber-900 border border-amber-200'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
                          }`}
                        >
                          🏆 Kelola Event & Alat
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick('/panitia/certificates');
                          }}
                          className={`w-full text-left py-1.5 px-2.5 rounded-lg text-2xs font-sans font-bold transition-all cursor-pointer block ${
                            currentPath.includes('/certificates')
                              ? 'bg-amber-50 text-amber-900 border border-amber-200'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
                          }`}
                        >
                          🎖️ Builder Sertifikat
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* TELEMETRY LIVE SIGNAL DECORATOR */}
          <div className="rounded-2xl border border-slate-150 bg-slate-50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500"></span>
              </span>
              <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-slate-500">
                Koneksi Real-Time
              </span>
            </div>
            
            <p className="text-[10px] text-slate-500 leading-normal font-sans">
              Aplikasi terhubung langsung dengan sistem penilaian utama tanding secara aman.
            </p>

            <div className="border-t border-slate-200 pt-2 text-[9px] font-mono text-slate-400 font-bold flex items-center justify-between">
              <span>Status Koneksi:</span>
              <span className="text-emerald-600 font-black">TERHUBUNG (STABIL)</span>
            </div>
          </div>

        </div>

        {/* FOOTER USER AREA */}
        <div className="border-t border-slate-200 p-4 space-y-3 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold uppercase text-slate-400">Status Akses Anda</span>
            <span className="text-[8px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.2 rounded font-mono font-bold">FIG 4.0</span>
          </div>

          <div className="space-y-1">
            {authStates.peserta && (
              <div className="flex items-center justify-between text-2xs font-semibold">
                <span className="text-slate-600 font-mono text-[10px]">👤 Peserta</span>
                <button
                  onClick={() => onLogout('peserta')}
                  className="flex items-center gap-1 text-[9px] font-mono font-bold text-rose-600 hover:text-rose-850 cursor-pointer bg-transparent border-none"
                >
                  Logout <LogOut className="h-2.5 w-2.5" />
                </button>
              </div>
            )}
            {authStates.juri && (
              <div className="flex items-center justify-between text-2xs font-semibold">
                <span className="text-slate-600 font-mono text-[10px]">⚖️ Juri (Panel-{authStates.juriRole || 'D'})</span>
                <button
                  onClick={() => onLogout('juri')}
                  className="flex items-center gap-1 text-[9px] font-mono font-bold text-rose-600 hover:text-rose-850 cursor-pointer bg-transparent border-none"
                >
                  Logout <LogOut className="h-2.5 w-2.5" />
                </button>
              </div>
            )}
            {authStates.panitia && (
              <div className="flex items-center justify-between text-2xs font-semibold">
                <span className="text-slate-600 font-mono text-[10px]">⚙️ Panitia</span>
                <button
                  onClick={() => onLogout('panitia')}
                  className="flex items-center gap-1 text-[9px] font-mono font-bold text-rose-600 hover:text-rose-850 cursor-pointer bg-transparent border-none"
                >
                  Logout <LogOut className="h-2.5 w-2.5" />
                </button>
              </div>
            )}
            {authStates.superadmin && (
              <div className="flex items-center justify-between text-2xs font-semibold">
                <span className="text-purple-750 font-mono text-[10px] font-bold">🛡️ Superadmin</span>
                <button
                  onClick={() => onLogout('superadmin')}
                  className="flex items-center gap-1 text-[9px] font-mono font-bold text-rose-600 hover:text-rose-850 cursor-pointer bg-transparent border-none"
                >
                  Logout <LogOut className="h-2.5 w-2.5" />
                </button>
              </div>
            )}
          </div>
          
          <div className="text-center text-[9px] text-slate-400 font-mono pt-2 border-t border-slate-200/60 font-semibold">
            GymnaScore v1.0.4 • FIG Official
          </div>
        </div>

      </aside>
    </>
  );
}
