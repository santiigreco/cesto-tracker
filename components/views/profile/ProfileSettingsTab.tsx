import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '@/components/ui/Loader';
import TeamLogo from '@/components/ui/TeamLogo';
import { CheckIcon } from '@/components/icons';
import { useProfile } from '@/hooks/useProfile';
import { useUI } from '@/context/UIContext';
import { TEAMS_CONFIG } from '@/constants';
import { IdentityRole, UserProfile } from '@/types';
import { getUserPreferences, saveUserPreferences, UserPreferences } from '@/utils/userPreferences';

interface ProfileSettingsTabProps {
  profile: UserProfile | null;
  user: any;
  onProfileUpdated?: () => void;
}

const IDENTITY_ROLES: { value: IdentityRole; label: string; emoji: string }[] = [
  { value: 'jugador', label: 'Jugador/a', emoji: '🏃' },
  { value: 'entrenador', label: 'Entrenador/a', emoji: '📋' },
  { value: 'dirigente', label: 'Delegado / Mesa', emoji: '⏱️' },
  { value: 'hincha', label: 'Hincha / Familiar', emoji: '🥁' },
  { value: 'periodista', label: 'Prensa', emoji: '🎙️' },
  { value: 'otro', label: 'Otro', emoji: '🏐' },
];

export const ProfileSettingsTab: React.FC<ProfileSettingsTabProps> = ({
  profile,
  user,
  onProfileUpdated,
}) => {
  const navigate = useNavigate();
  const { updateProfile } = useProfile();
  const { showToast } = useUI();

  // Profile fields state
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [favoriteClub, setFavoriteClub] = useState(profile?.favorite_club || '');
  const [role, setRole] = useState<IdentityRole>(profile?.role || 'jugador');
  const [playerNumber, setPlayerNumber] = useState(profile?.player_number || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // App preferences state
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
    <div className="space-y-6">
      {/* 1. Personal & Sports Profile Form */}
      <form
        onSubmit={handleSaveProfile}
        className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5"
      >
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <span>👤</span>
            <span>Datos Personales e Identidad Deportiva</span>
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">
            Tu información en las planillas oficiales y en la comunidad.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Nombre Completo
            </label>
            <input
              type="text"
              maxLength={50}
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Ej: Lucía Rodríguez"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Club del Corazón ❤️
            </label>
            <div className="relative">
              <select
                value={favoriteClub}
                onChange={e => setFavoriteClub(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
              >
                <option value="">Seleccionar Club...</option>
                <optgroup label="Federación Capital">
                  {TEAMS_CONFIG.filter(t => t.federation === 'capital').map(team => (
                    <option key={team.name} value={team.name}>
                      {team.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Federación Corrientes">
                  {TEAMS_CONFIG.filter(t => t.federation === 'corrientes').map(team => (
                    <option key={team.name} value={team.name}>
                      {team.name}
                    </option>
                  ))}
                </optgroup>
                <option value="Otro">Otro Club</option>
              </select>
              {favoriteClub && (
                <div className="absolute right-3 top-2.5 pointer-events-none">
                  <TeamLogo teamName={favoriteClub} className="h-5 w-5" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Rol en Cestoball
            </label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as IdentityRole)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
            >
              {IDENTITY_ROLES.map(r => (
                <option key={r.value} value={r.value}>
                  {r.emoji} {r.label}
                </option>
              ))}
            </select>
          </div>

          {role === 'jugador' && (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Dorsal de Camiseta Habitual 🏐
              </label>
              <input
                type="number"
                min="1"
                max="99"
                value={playerNumber}
                onChange={e => setPlayerNumber(e.target.value.slice(0, 2))}
                placeholder="Ej: 7"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSavingProfile}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 active:scale-95 flex items-center gap-2"
          >
            {isSavingProfile ? <Loader className="h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}
            <span>Guardar Perfil</span>
          </button>
        </div>
      </form>

      {/* 2. Match & Scorer Preferences Form */}
      <form
        onSubmit={handleSavePreferences}
        className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5"
      >
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <span>⚙️</span>
            <span>Preferencias de la Planilla Técnica</span>
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">
            Ajustá cómo se comporta la mesa de control durante tus partidos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Umbral Mano Caliente 🔥
            </label>
            <select
              value={preferences.manoCalienteThreshold}
              onChange={e =>
                setPreferences(prev => ({
                  ...prev,
                  manoCalienteThreshold: Number(e.target.value),
                }))
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value={3}>3 aciertos consecutivos</option>
              <option value={4}>4 aciertos consecutivos</option>
              <option value={5}>5 aciertos consecutivos</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Umbral Mano Fría ❄️
            </label>
            <select
              value={preferences.manoFriaThreshold}
              onChange={e =>
                setPreferences(prev => ({
                  ...prev,
                  manoFriaThreshold: Number(e.target.value),
                }))
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value={3}>3 fallos consecutivos</option>
              <option value={4}>4 fallos consecutivos</option>
              <option value={5}>5 fallos consecutivos</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Pestaña Inicial en Partido
            </label>
            <select
              value={preferences.defaultMatchTab}
              onChange={e =>
                setPreferences(prev => ({
                  ...prev,
                  defaultMatchTab: e.target.value as 'tally' | 'statistics',
                }))
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="tally">📋 Planilla Técnica (Recomendado)</option>
              <option value="statistics">📊 Estadísticas y Gráficos</option>
            </select>
          </div>

          <div className="flex flex-col justify-center">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
              Vibración Táctil (Móvil)
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
              <input
                type="checkbox"
                checked={preferences.enableHaptics}
                onChange={e =>
                  setPreferences(prev => ({
                    ...prev,
                    enableHaptics: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded text-cyan-500 bg-slate-800 border-slate-600 focus:ring-cyan-500"
              />
              <span>Vibrar levemente al registrar goles o faltas</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSavingPrefs}
            className="bg-slate-800 hover:bg-slate-750 text-cyan-400 border border-slate-700 font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2"
          >
            {isSavingPrefs ? <Loader className="h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}
            <span>Guardar Preferencias</span>
          </button>
        </div>
      </form>

      {/* 3. Account & Admin Shortcut */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white">Cuenta de Usuario</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Conectado como <strong className="text-slate-200">{user.email}</strong>
          </p>
        </div>

        {profile?.is_admin && (
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 bg-red-950/70 border border-red-700/60 hover:bg-red-900 text-red-300 text-xs font-black uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2 shadow"
          >
            <span>🛡️</span>
            <span>Ir al Panel de Administración</span>
          </button>
        )}
      </div>
    </div>
  );
};
