import React, { useRef, useState } from 'react';
import { CameraIcon } from '@/components/icons';
import Loader from '@/components/ui/Loader';
import TeamLogo from '@/components/ui/TeamLogo';
import { UserProfile, IdentityRole } from '@/types';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { useNavigate } from 'react-router-dom';

interface ProfileHeaderProps {
  profile: UserProfile | null;
  user: any;
  matchesCount: number;
  teamsCount: number;
}

const IDENTITY_ROLES: { value: IdentityRole; label: string; emoji: string }[] = [
  { value: 'jugador', label: 'Jugador/a', emoji: '🏃' },
  { value: 'entrenador', label: 'Entrenador/a', emoji: '📋' },
  { value: 'dirigente', label: 'Delegado / Mesa', emoji: '⏱️' },
  { value: 'hincha', label: 'Hincha / Familiar', emoji: '🥁' },
  { value: 'periodista', label: 'Prensa', emoji: '🎙️' },
  { value: 'otro', label: 'Otro', emoji: '🏐' },
];

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  user,
  matchesCount,
  teamsCount,
}) => {
  const { uploadAvatar } = useProfile();
  const { handleLogout } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    if (file.size > 2 * 1024 * 1024) {
      showToast('La imagen es demasiado grande. Máximo 2MB.', 'error');
      return;
    }
    setIsUploading(true);
    const newUrl = await uploadAvatar(file);
    setIsUploading(false);
    if (newUrl) {
      showToast('¡Foto de perfil actualizada!', 'success');
    }
  };

  const handleLogoutClick = async () => {
    await handleLogout();
    showToast('Sesión cerrada correctamente', 'info');
    navigate('/');
  };

  const currentRole = IDENTITY_ROLES.find(r => r.value === profile?.role);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/80 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Glow ambient background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        {/* Left: Avatar + Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          {/* Avatar with Upload button */}
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()} title="Cambiar foto de perfil">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-cyan-600 via-emerald-600 to-cyan-500 p-1 shadow-xl transform group-hover:scale-105 transition-all duration-300">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center overflow-hidden relative">
                {isUploading ? (
                  <Loader className="h-8 w-8 text-cyan-400" />
                ) : profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-emerald-400">
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </span>
                )}
                {/* Overlay hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-[14px]">
                  <CameraIcon className="h-7 w-7 text-white drop-shadow" />
                </div>
              </div>
            </div>

            {/* Club logo badge in corner */}
            {profile?.favorite_club && (
              <div
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-700 shadow-lg"
                title={`Club: ${profile.favorite_club}`}
              >
                <TeamLogo teamName={profile.favorite_club} className="h-7 w-7" />
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="flex flex-col">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {profile?.full_name || 'Anotador de Cestoball'}
              </h1>

              {profile?.is_admin && (
                <span className="px-2.5 py-0.5 rounded-full bg-red-950/70 border border-red-700/60 text-red-400 text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <span>🛡️</span> Admin
                </span>
              )}
            </div>

            <p className="text-slate-400 text-sm mt-1">{user.email}</p>

            {/* Badges / Sports Identity */}
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 flex-wrap">
              {currentRole && (
                <span className="px-3 py-1 rounded-xl bg-cyan-950/60 border border-cyan-700/50 text-cyan-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <span>{currentRole.emoji}</span>
                  <span>{currentRole.label}</span>
                </span>
              )}

              {profile?.role === 'jugador' && profile?.player_number && (
                <span className="px-3 py-1 rounded-xl bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-xs font-extrabold tracking-wider shadow-sm">
                  Camiseta #{profile.player_number}
                </span>
              )}

              {profile?.favorite_club && (
                <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                  <span>❤️</span> {profile.favorite_club}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Counters & Logout */}
        <div className="flex flex-col sm:flex-row md:flex-col items-center gap-3 w-full md:w-auto shrink-0">
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl px-4 py-2.5 text-center">
              <span className="block text-2xl font-black text-cyan-400 leading-none">{matchesCount}</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1 block">Planillas</span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl px-4 py-2.5 text-center">
              <span className="block text-2xl font-black text-emerald-400 leading-none">{teamsCount}</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1 block">Planteles</span>
            </div>
          </div>

          <button
            onClick={handleLogoutClick}
            className="w-full text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/40 rounded-xl px-4 py-2 transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <span>🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};
