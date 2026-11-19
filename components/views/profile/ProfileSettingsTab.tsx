import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '@/components/ui/Loader';
import TeamLogo from '@/components/ui/TeamLogo';
import {
  CheckIcon,
  FlameIcon,
  GearIcon,
  HeartIcon,
  ShieldIcon,
  SnowflakeIcon,
  UserIcon,
} from '@/components/icons';
import { useProfile } from '@/hooks/useProfile';
import { useUI } from '@/context/UIContext';
import { TEAMS_CONFIG } from '@/constants';
import { IdentityRole, UserProfile } from '@/types';
import {
  getUserPreferences,
  saveUserPreferences,
  UserPreferences,
} from '@/utils/userPreferences';

interface ProfileSettingsTabProps {
  profile: UserProfile | null;
  user: any;
  onProfileUpdated?: () => void;
}

const IDENTITY_ROLES: { value: IdentityRole; label: string }[] = [
  { value: 'jugador', label: 'Jugador/a' },
  { value: 'entrenador', label: 'Entrenador/a' },
  { value: 'dirigente', label: 'Delegado / Mesa' },
  { value: 'hincha', label: 'Hincha / Familiar' },
  { value: 'periodista', label: 'Prensa' },
  { value: 'otro', label: 'Otro' },
];

export const ProfileSettingsTab: React.FC<ProfileSettingsTabProps> = ({
  profile,
  user,
  onProfileUpdated,
}) => {
  const navigate = useNavigate();
  const { updateProfile } = useProfile();
  const { showToast } = useUI();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [favoriteClub, setFavoriteClub] = useState(profile?.favorite_club || '');
  const [role, setRole] = useState<IdentityRole>(profile?.role || 'jugador');
  const [playerNumber, setPlayerNumber] = useState(profile?.player_number || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [preferences, setPreferences] = useState<UserPreferences>(getUserPreferences());
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setFavoriteClub(profile.favorite_club || '');
      if (profile.role) setRole(profile.role);
      setPlayerNumber(profile.player_number || '');
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const ok = await updateProfile({
        full_name: fullName.trim(),
        favorite_club: favoriteClub.trim() || null,
        role,
        player_number: role === 'jugador' ? playerNumber.trim() : null,
      });

      if (ok) {
        showToast('Perfil actualizado correctamente', 'success');
        if (onProfileUpdated) onProfileUpdated();
      } else {
        showToast('No se pudo actualizar el perfil', 'error');
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPrefs(true);
    try {
      saveUserPreferences(preferences);
      showToast('Preferencias de anotación guardadas', 'success');
    } finally {
      setIsSavingPrefs(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Personal & Sports Profile Form */}
      <form
        onSubmit={handleSaveProfile}
        className="bg-surface-card border border-border-subtle rounded-2xl p-5 sm:p-6 shadow-card space-y-5"
      >
        <div className="border-b border-border-subtle pb-3">
          <h3 className="text-base font-extrabold text-ink-primary flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-brand shrink-0" />
            <span>Datos Personales e Identidad Deportiva</span>
          </h3>
          <p className="text-ink-muted text-xs sm:text-sm mt-0.5">
            Tu información en las planillas oficiales y en la comunidad.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-ink-secondary uppercase tracking-wider mb-1.5">
              Nombre Completo
            </label>
            <input
              type="text"
              maxLength={50}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej: Lucía Rodríguez"
              className="w-full min-h-[44px] bg-surface-elevated border border-border-strong rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-ink-primary focus:border-brand transition-colors"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-ink-secondary uppercase tracking-wider mb-1.5">
              <HeartIcon className="h-3.5 w-3.5 text-sport-miss-light" />
              <span>Club del Corazón</span>
            </label>
            <div className="relative">
              <select
                value={favoriteClub}
                onChange={(e) => setFavoriteClub(e.target.value)}
                className="w-full min-h-[44px] bg-surface-elevated border border-border-strong rounded-xl pl-3.5 pr-10 py-2.5 text-base sm:text-sm text-ink-primary focus:border-brand transition-colors appearance-none"
              >
                <option value="">Seleccionar Club...</option>
                <optgroup label="Federación Capital">
                  {TEAMS_CONFIG.filter((t) => t.federation === 'capital').map((team) => (
                    <option key={team.name} value={team.name}>
                      {team.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Federación Corrientes">
                  {TEAMS_CONFIG.filter((t) => t.federation === 'corrientes').map((team) => (
                    <option key={team.name} value={team.name}>
                      {team.name}
                    </option>
                  ))}
                </optgroup>
                <option value="Otro">Otro Club</option>
              </select>
              {favoriteClub && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <TeamLogo teamName={favoriteClub} className="h-5 w-5" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-secondary uppercase tracking-wider mb-1.5">
              Rol en Cestoball
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as IdentityRole)}
              className="w-full min-h-[44px] bg-surface-elevated border border-border-strong rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-ink-primary focus:border-brand transition-colors"
            >
              {IDENTITY_ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {role === 'jugador' && (
            <div>
              <label className="block text-xs font-bold text-ink-secondary uppercase tracking-wider mb-1.5">
                Dorsal de Camiseta Habitual
              </label>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                max="99"
                value={playerNumber}
                onChange={(e) => setPlayerNumber(e.target.value.slice(0, 2))}
                placeholder="Ej: 7"
                className="w-full min-h-[44px] bg-surface-elevated border border-border-strong rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-ink-primary focus:border-brand transition-colors tabular-nums"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isSavingProfile}
            className="min-h-[44px] bg-brand hover:bg-brand-hover text-ink-inverse font-extrabold px-6 rounded-xl text-xs uppercase tracking-wider transition-colors active:scale-[0.98] flex items-center gap-2"
          >
            {isSavingProfile ? (
              <Loader className="h-4 w-4 text-ink-inverse" />
            ) : (
              <CheckIcon className="h-4 w-4" />
            )}
            <span>Guardar Perfil</span>
          </button>
        </div>
      </form>

      {/* 2. Match & Scorer Preferences Form */}
      <form
        onSubmit={handleSavePreferences}
        className="bg-surface-card border border-border-subtle rounded-2xl p-5 sm:p-6 shadow-card space-y-5"
      >
        <div className="border-b border-border-subtle pb-3">
          <h3 className="text-base font-extrabold text-ink-primary flex items-center gap-2">
            <GearIcon className="h-5 w-5 text-brand shrink-0" />
            <span>Preferencias de la Planilla Técnica</span>
          </h3>
          <p className="text-ink-muted text-xs sm:text-sm mt-0.5">
            Ajustá cómo se comporta la mesa de control durante tus partidos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-ink-secondary uppercase tracking-wider mb-1.5">
              <FlameIcon className="h-3.5 w-3.5 text-sport-warn-light" />
              <span>Umbral Mano Caliente</span>
            </label>
            <select
              value={preferences.manoCalienteThreshold}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  manoCalienteThreshold: Number(e.target.value),
                }))
              }
              className="w-full min-h-[44px] bg-surface-elevated border border-border-strong rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-ink-primary focus:border-brand transition-colors"
            >
              <option value={3}>3 aciertos consecutivos</option>
              <option value={4}>4 aciertos consecutivos</option>
              <option value={5}>5 aciertos consecutivos</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-ink-secondary uppercase tracking-wider mb-1.5">
              <SnowflakeIcon className="h-3.5 w-3.5 text-sport-triple-light" />
              <span>Umbral Mano Fría</span>
            </label>
            <select
              value={preferences.manoFriaThreshold}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  manoFriaThreshold: Number(e.target.value),
                }))
              }
              className="w-full min-h-[44px] bg-surface-elevated border border-border-strong rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-ink-primary focus:border-brand transition-colors"
            >
              <option value={3}>3 fallos consecutivos</option>
              <option value={4}>4 fallos consecutivos</option>
              <option value={5}>5 fallos consecutivos</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-secondary uppercase tracking-wider mb-1.5">
              Pestaña Inicial en Partido
            </label>
            <select
              value={preferences.defaultMatchTab}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  defaultMatchTab: e.target.value as 'tally' | 'statistics',
                }))
              }
              className="w-full min-h-[44px] bg-surface-elevated border border-border-strong rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-ink-primary focus:border-brand transition-colors"
            >
              <option value="tally">Planilla Técnica (Recomendado)</option>
              <option value="statistics">Estadísticas y Gráficos</option>
            </select>
          </div>

          <div className="flex flex-col justify-center">
            <span className="block text-xs font-bold text-ink-secondary uppercase tracking-wider mb-2">
              Vibración Táctil (Móvil)
            </span>
            <label className="min-h-[44px] flex items-center gap-2.5 cursor-pointer text-sm text-ink-secondary">
              <input
                type="checkbox"
                checked={preferences.enableHaptics}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    enableHaptics: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded text-brand bg-surface-elevated border-border-strong"
              />
              <span>Vibrar levemente al registrar goles o faltas</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isSavingPrefs}
            className="min-h-[44px] bg-surface-elevated hover:bg-surface-hover text-brand border border-border-strong font-bold px-6 rounded-xl text-xs uppercase tracking-wider transition-colors active:scale-[0.98] flex items-center gap-2"
          >
            {isSavingPrefs ? (
              <Loader className="h-4 w-4 text-brand" />
            ) : (
              <CheckIcon className="h-4 w-4" />
            )}
            <span>Guardar Preferencias</span>
          </button>
        </div>
      </form>

      {/* 3. Account & Admin Shortcut */}
      <div className="bg-surface-card border border-border-subtle rounded-2xl p-5 sm:p-6 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-ink-primary">Cuenta de Usuario</h3>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Conectado como <strong className="text-ink-secondary">{user.email}</strong>
          </p>
        </div>

        {profile?.is_admin && (
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="min-h-[44px] px-4 bg-sport-miss/15 border border-sport-miss/40 hover:bg-sport-miss/25 text-sport-miss-light text-xs font-extrabold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2"
          >
            <ShieldIcon className="h-4 w-4" />
            <span>Ir al Panel de Administración</span>
          </button>
        )}
      </div>
    </div>
  );
};
