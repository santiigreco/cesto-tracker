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
  onStartClick: () => void;
}

export const HomeNavbar: React.FC<HomeNavbarProps> = ({
  canAccessAdmin,
  user,
  profile,
  onLogin,
  onOpenProfile,
  onStartClick,
}) => {
  const navigate = useNavigate();
  const { openAuthModal } = useUI();

  const handleLoginClick = () => {
    openAuthModal({ initialMode: 'login' });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex justify-between items-center transition-all">
      {/* Clean Project Logo */}
      <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <span className="text-2xl filter drop-shadow">🏐</span>
        <div className="flex flex-col">
          <span className="font-black text-lg tracking-tight text-white leading-none">
            Cesto Tracker
          </span>
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest leading-none mt-1">
            Planilla Oficial
          </span>
        </div>
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
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'
            )}
          </button>
        ) : (
          <button
            onClick={handleLoginClick}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white text-xs font-bold px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 hover:border-slate-500 transition-colors active:scale-95 touch-manipulation"
            title="Iniciar sesión o crear cuenta"
          >
            <GoogleIcon className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Ingresar</span>
          </button>
        )}

        {/* The Single Clear Primary CTA: "Anotar Partido" */}
        <button
          onClick={onStartClick}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>⚡</span>
          <span>Anotar Partido</span>
        </button>
      </div>
    </header>
  );
};
