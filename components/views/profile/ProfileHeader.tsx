import React, { useRef, useState } from 'react';
import {
  CameraIcon,
  ClipboardIcon,
  ClockIcon,
  HeartIcon,
  LogOutIcon,
  MicIcon,
  ShieldIcon,
  StarIcon,
  UserIcon,
} from '@/components/icons';
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

const CestoballEmojiIcon: React.FC<{ className?: string }> = ({ className }) => (
  <span className={`inline-flex items-center justify-center leading-none select-none text-xs ${className || ''}`} aria-hidden="true">
    🏐
  </span>
);

const IDENTITY_ROLES: {
  value: IdentityRole;
  label: string;
  Icon: React.FC<{ className?: string }>;
}[] = [
  { value: 'jugador', label: 'Jugador/a', Icon: UserIcon },
  { value: 'entrenador', label: 'Entrenador/a', Icon: ClipboardIcon },
  { value: 'dirigente', label: 'Delegado / Mesa', Icon: ClockIcon },
  { value: 'hincha', label: 'Hincha / Familiar', Icon: StarIcon },
  { value: 'periodista', label: 'Prensa', Icon: MicIcon },
  { value: 'otro', label: 'Otro', Icon: CestoballEmojiIcon },
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

  const currentRole = IDENTITY_ROLES.find((r) => r.value === profile?.role);
  const RoleIcon = currentRole?.Icon;

  return (
    <div className="bg-surface-card rounded-2xl border border-border-subtle p-5 sm:p-6 shadow-card">
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        {/* Left: Avatar + Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <button
            type="button"
            className="relative group cursor-pointer rounded-2xl"
            onClick={() => fileInputRef.current?.click()}
            title="Cambiar foto de perfil"
            aria-label="Cambiar foto de perfil"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-surface-elevated border-2 border-brand/40 flex items-center justify-center overflow-hidden relative">
              {isUploading ? (
                <Loader className="h-8 w-8 text-brand" />
              ) : profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  loading="lazy"
                  decoding="async"
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl sm:text-4xl font-black text-brand">
                  {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </span>
              )}
              <div className="absolute inset-0 bg-[#05080F]/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <CameraIcon className="h-6 w-6 text-white" />
              </div>
            </div>

            {profile?.favorite_club && (
              <div
                className="absolute -bottom-2 -right-2 w-9 h-9 bg-surface-card rounded-xl flex items-center justify-center border border-border-strong shadow-card"
                title={`Club: ${profile.favorite_club}`}
              >
                <TeamLogo teamName={profile.favorite_club} className="h-6 w-6" />
              </div>
            )}
          </button>

          {/* User Details */}
          <div className="flex flex-col">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-ink-primary tracking-tight">
                {profile?.full_name || 'Anotador de Cestoball'}
              </h1>

              {profile?.is_admin && (
                <span className="px-2.5 py-0.5 rounded-lg bg-sport-miss/15 border border-sport-miss/40 text-sport-miss-light text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1">
                  <ShieldIcon className="h-3.5 w-3.5" />
                  <span>Admin</span>
                </span>
              )}
            </div>

            <p className="text-ink-muted text-sm mt-1">{user.email}</p>

            {/* Badges / Sports Identity */}
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 flex-wrap">
              {currentRole && RoleIcon && (
                <span className="px-3 py-1 rounded-xl bg-brand/10 border border-brand/30 text-brand text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                  <RoleIcon className="h-3.5 w-3.5" />
                  <span>{currentRole.label}</span>
                </span>
              )}

              {profile?.role === 'jugador' && profile?.player_number && (
                <span className="px-3 py-1 rounded-xl bg-sport-goal/15 border border-sport-goal/35 text-sport-goal-light text-xs font-extrabold tracking-wider tabular-nums">
                  Camiseta #{profile.player_number}
                </span>
              )}

              {profile?.favorite_club && (
                <span className="px-3 py-1 rounded-xl bg-surface-elevated border border-border-subtle text-ink-secondary text-xs font-semibold inline-flex items-center gap-1.5">
                  <HeartIcon className="h-3.5 w-3.5 text-sport-miss-light" />
                  <span>{profile.favorite_club}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Counters & Logout */}
        <div className="flex flex-col sm:flex-row md:flex-col items-center gap-3 w-full md:w-auto shrink-0">
          <div className="grid grid-cols-2 gap-2.5 w-full sm:w-auto">
            <div className="bg-surface-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-center">
              <span className="block text-2xl font-black text-brand leading-none tabular-nums">
                {matchesCount}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mt-1 block">
                Planillas
              </span>
            </div>
            <div className="bg-surface-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-center">
              <span className="block text-2xl font-black text-sport-goal-light leading-none tabular-nums">
                {teamsCount}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mt-1 block">
                Planteles
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogoutClick}
            className="w-full min-h-[44px] text-xs font-bold text-sport-miss-light hover:bg-sport-miss/15 border border-sport-miss/35 rounded-xl px-4 py-2 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <LogOutIcon className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};
