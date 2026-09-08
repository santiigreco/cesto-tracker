import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleIcon } from '@/components/icons';
import { UserProfile } from '@/types';

interface HomeNavbarProps {
  canAccessAdmin: boolean;
  user?: any;
  profile?: UserProfile | null;
  onLogin?: () => void;
  onOpenProfile: () => void;
}

export const HomeNavbar: React.FC<HomeNavbarProps> = ({
  canAccessAdmin,
  user,
  profile,
  onLogin,
  onOpenProfile,
}) => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🏐</span>
        <h1 className="font-extrabold text-lg tracking-tight text-white">Cesto Tracker</h1>
      </div>
      <div className="flex items-center gap-3">
        {canAccessAdmin && (
          <button
            onClick={() => navigate('/admin')}
            className="hidden sm:flex items-center gap-2 bg-red-900/20 border border-red-900/50 text-red-500 hover:text-white hover:bg-red-600 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all"
          >
            <span>🛡️ Panel Admin</span>
          </button>
        )}
        {user ? (
          <div
            onClick={onOpenProfile}
            className="flex items-center gap-3 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 cursor-pointer hover:bg-slate-750 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold uppercase overflow-hidden relative ring-2 ring-transparent group-hover:ring-cyan-400 transition-all">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user.email?.charAt(0) || 'U'
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="flex items-center gap-2 bg-white text-slate-900 hover:bg-gray-100 font-bold px-4 py-2 rounded-full text-sm transition-transform hover:scale-105"
          >
            <GoogleIcon className="h-4 w-4" />
            <span>Ingresar</span>
          </button>
        )}
      </div>
    </nav>
  );
};
