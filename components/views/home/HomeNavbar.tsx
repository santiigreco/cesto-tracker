import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleIcon } from '@/components/icons';
import { UserProfile } from '@/types';
import { useUI } from '@/context/UIContext';

interface HomeNavbarProps {
  canAccessAdmin: boolean;
  user?: any;
  profile?: UserProfile | null;
  onLogin?: () => void;
  onOpenProfile: () => void;
}

export const HomeNavbar: React.FC<HomeNavbarProps> = React.memo(({
  canAccessAdmin,
  user,
  profile,
  onLogin,
  onOpenProfile,
}) => {
  const navigate = useNavigate();
  const { openAuthModal } = useUI();

  const handleLoginClick = () => {
    if (onLogin) {
      onLogin();
    } else {
      openAuthModal({ initialMode: 'login' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex justify-between items-center transition-all">
      {/* Clean Project Logo */}
      <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <span className="text-2xl filter drop-shadow">🏐</span>
        <span className="font-black text-lg tracking-tight text-white leading-none">
          Cesto Tracker
        </span>
      </div>

      {/* Right Action: Single Prominent CTA */}
      <div className="flex items-center gap-3">
        {/* Subtle Admin Quick Access (if privileged) */}
        {canAccessAdmin && (
          <button
            onClick={() => navigate('/admin')}
            className="hidden sm:flex items-center gap-1.5 bg-red-950/40 border border-red-800/60 text-red-400 hover:text-white hover:bg-red-700/80 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors"
            title="Panel de Administración"
          >
            <span>🛡️</span>
            <span>Admin</span>
          </button>
        )}

        {/* Minimal User Profile Icon (if logged in) */}
        {user ? (
          <button
            onClick={onOpenProfile}
            className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 hover:border-cyan-400 flex items-center justify-center text-xs font-bold text-slate-200 overflow-hidden transition-colors active:scale-95 touch-manipulation"
            title={profile?.full_name || user.email || 'Mi Perfil'}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" loading="lazy" decoding="async" width={36} height={36} className="w-full h-full object-cover" />
            ) : (
              profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'
            )}
          </button>
        ) : (
          <button
            onClick={handleLoginClick}
            className="flex items-center gap-1.5 text-slate-200 hover:text-white text-sm font-bold px-3.5 min-h-[44px] rounded-xl bg-slate-900/90 border border-slate-700 hover:border-slate-500 transition-colors active:scale-95 touch-manipulation"
            title="Iniciar sesión o crear cuenta"
          >
            <GoogleIcon className="h-4 w-4" />
            <span>Ingresar</span>
          </button>
        )}
      </div>
    </header>
  );
});
