import React, { useState } from 'react';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import ModalShell from '@/components/ui/ModalShell';
import { Settings } from '../../types';
import {
  ChevronDownIcon,
  CloudUploadIcon,
  FlameIcon,
  GoogleIcon,
  SnowflakeIcon,
} from '../icons';
import TeamSelectorModal from '@/components/modals/TeamSelectorModal';
import { useProfile } from '../../hooks/useProfile';

interface SettingsModalProps {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  onClose: () => void;
  onRequestNewGame: () => void;
  onRequestReselectPlayers: () => void;
  onRequestSaveGame: () => void;
  user: any;
  onLogout: () => void;
  onLogin: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = React.memo(
  ({
    settings,
    setSettings,
    onClose,
    onRequestNewGame,
    onRequestReselectPlayers,
    onRequestSaveGame,
    user,
    onLogout,
    onLogin,
  }) => {
    const [isTeamSelectorOpen, setIsTeamSelectorOpen] = useState(false);
    const { profile } = useProfile();

    const handleThresholdChange = (
      key: 'manoCalienteThreshold' | 'manoFriaThreshold',
      value: string
    ) => {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
        setSettings({ ...settings, [key]: numValue });
      }
    };

    const modalFooter = (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] bg-brand hover:bg-brand-hover text-ink-inverse font-extrabold py-2 px-6 rounded-xl text-sm transition-colors"
        >
          Cerrar
        </button>
      </div>
    );

    return (
      <>
        <ModalShell
          isOpen={true}
          onClose={onClose}
          title="Configuración"
          titleId="settings-modal-title"
          maxWidth="lg"
          zIndexClass="z-[70]"
          disableEscape={isTeamSelectorOpen}
          footer={modalFooter}
        >
          <div className="space-y-4">
            {/* User Session Info */}
            {user && (
              <div className="bg-surface-elevated p-3.5 rounded-xl border border-border-subtle flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-surface-card border border-border-strong flex items-center justify-center text-ink-primary font-bold text-sm uppercase overflow-hidden shrink-0">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Perfil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.email?.charAt(0) || 'U'
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-ink-muted">Sesión iniciada como:</p>
                    <p className="text-ink-primary text-sm font-semibold truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="shrink-0 min-h-[40px] text-xs text-sport-miss-light hover:bg-sport-miss/20 font-bold border border-sport-miss/40 bg-sport-miss/10 px-3 py-1.5 rounded-xl transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}

            {/* Game Info Settings */}
            <div className="bg-surface-elevated/60 p-4 rounded-xl border border-border-subtle space-y-3.5">
              <h3 className="text-sm font-extrabold text-ink-primary uppercase tracking-wider">
                Información del Partido
              </h3>

              <div>
                <label className="block text-xs font-bold text-ink-secondary mb-1.5 uppercase tracking-wider">
                  Tu Equipo
                </label>
                <button
                  type="button"
                  onClick={() => setIsTeamSelectorOpen(true)}
                  className="w-full min-h-[48px] bg-surface-canvas border border-border-strong rounded-xl px-3.5 py-2.5 text-left flex justify-between items-center transition-colors hover:border-brand/50 group"
                >
                  <span
                    className={`text-sm ${
                      settings.myTeam ? 'text-ink-primary font-bold' : 'text-ink-muted'
                    }`}
                  >
                    {settings.myTeam || 'Seleccioná equipo...'}
                  </span>
                  <ChevronDownIcon className="h-4 w-4 text-ink-muted group-hover:text-brand transition-colors" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-secondary mb-1.5 uppercase tracking-wider">
                  Nombre del Partido / Rival
                </label>
                <input
                  type="text"
                  value={settings.gameName || ''}
                  onChange={(e) => setSettings({ ...settings, gameName: e.target.value })}
                  className="bg-surface-canvas border border-border-strong text-ink-primary text-base sm:text-sm rounded-xl focus:border-brand block w-full px-3.5 py-2.5 placeholder-ink-muted"
                  placeholder="Ej: Final vs. Vélez"
                />
              </div>
            </div>

            {/* Mano Caliente Settings */}
            <div className="bg-surface-elevated/60 p-4 rounded-xl border border-border-subtle">
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <FlameIcon className="h-5 w-5 text-sport-warn-light" />
                  <h3 className="text-base font-extrabold text-ink-primary">Mano Caliente</h3>
                </div>
                <ToggleSwitch
                  isEnabled={settings.isManoCalienteEnabled}
                  ariaLabel="Activar detección de Mano Caliente"
                  onToggle={() =>
                    setSettings({
                      ...settings,
                      isManoCalienteEnabled: !settings.isManoCalienteEnabled,
                    })
                  }
                />
              </div>
              <p className="text-ink-muted text-xs sm:text-sm mt-1.5 mb-3">
                Avisar cuando una jugadora anota{' '}
                <span className="font-bold text-ink-primary tabular-nums">
                  {settings.manoCalienteThreshold}
                </span>{' '}
                goles seguidos.
              </p>
              <div className="flex items-center gap-3 relative">
                <span className="text-ink-secondary text-xs font-bold tabular-nums">3</span>
                <input
                  type="range"
                  id="manoCalienteThreshold"
                  value={settings.manoCalienteThreshold}
                  onChange={(e) =>
                    handleThresholdChange('manoCalienteThreshold', e.target.value)
                  }
                  disabled={!settings.isManoCalienteEnabled}
                  className="w-full flex-1 h-2 bg-surface-canvas rounded-lg appearance-none cursor-pointer disabled:opacity-50 accent-cyan-400"
                  min="3"
                  max="10"
                />
                <span className="text-ink-secondary text-xs font-bold tabular-nums">10</span>
                {!settings.isManoCalienteEnabled && (
                  <div
                    className="absolute inset-0 cursor-pointer"
                    onClick={() =>
                      setSettings({ ...settings, isManoCalienteEnabled: true })
                    }
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>

            {/* Mano Fría Settings */}
            <div className="bg-surface-elevated/60 p-4 rounded-xl border border-border-subtle">
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <SnowflakeIcon className="h-5 w-5 text-sport-triple-light" />
                  <h3 className="text-base font-extrabold text-ink-primary">Mano Fría</h3>
                </div>
                <ToggleSwitch
                  isEnabled={settings.isManoFriaEnabled}
                  ariaLabel="Activar detección de Mano Fría"
                  onToggle={() =>
                    setSettings({
                      ...settings,
                      isManoFriaEnabled: !settings.isManoFriaEnabled,
                    })
                  }
                />
              </div>
              <p className="text-ink-muted text-xs sm:text-sm mt-1.5 mb-3">
                Avisar cuando una jugadora falla{' '}
                <span className="font-bold text-ink-primary tabular-nums">
                  {settings.manoFriaThreshold}
                </span>{' '}
                tiros seguidos.
              </p>
              <div className="flex items-center gap-3 relative">
                <span className="text-ink-secondary text-xs font-bold tabular-nums">3</span>
                <input
                  type="range"
                  id="manoFriaThreshold"
                  value={settings.manoFriaThreshold}
                  onChange={(e) => handleThresholdChange('manoFriaThreshold', e.target.value)}
                  disabled={!settings.isManoFriaEnabled}
                  className="w-full flex-1 h-2 bg-surface-canvas rounded-lg appearance-none cursor-pointer disabled:opacity-50 accent-sky-400"
                  min="3"
                  max="10"
                />
                <span className="text-ink-secondary text-xs font-bold tabular-nums">10</span>
                {!settings.isManoFriaEnabled && (
                  <div
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => setSettings({ ...settings, isManoFriaEnabled: true })}
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>

            {/* Cloud Sync Section */}
            <div className="border-t border-border-subtle pt-4">
              <h3 className="text-sm font-extrabold text-ink-primary uppercase tracking-wider mb-1">
                Sincronización
              </h3>
              <p className="text-ink-muted text-xs sm:text-sm mb-3">
                Guardá los datos de este partido en la nube para tener respaldo.
              </p>
              {user ? (
                <button
                  type="button"
                  onClick={onRequestSaveGame}
                  className="w-full min-h-[44px] flex items-center justify-center gap-2.5 text-ink-inverse font-extrabold py-2.5 px-4 rounded-xl transition-colors bg-brand hover:bg-brand-hover text-sm"
                >
                  <CloudUploadIcon className="h-4 w-4" />
                  <span>Guardar Partido en la Nube</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onLogin}
                  className="w-full min-h-[44px] flex items-center justify-center gap-2.5 bg-white text-slate-900 hover:bg-slate-100 font-bold py-2.5 px-4 rounded-xl transition-colors text-sm"
                >
                  <GoogleIcon className="h-4 w-4" />
                  <span>Ingresar para Guardar</span>
                </button>
              )}
            </div>

            {/* Session Management Section */}
            <div className="border-t border-border-subtle pt-4">
              <h3 className="text-sm font-extrabold text-ink-primary uppercase tracking-wider mb-1">
                Gestión del Partido
              </h3>
              <p className="text-ink-muted text-xs sm:text-sm mb-3">
                Estas acciones afectan el partido actual.
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                <button
                  type="button"
                  onClick={onRequestReselectPlayers}
                  className="w-full min-h-[44px] bg-surface-elevated hover:bg-surface-hover border border-border-strong text-ink-primary font-bold py-2.5 px-4 rounded-xl transition-colors text-sm"
                >
                  Editar Datos del Partido
                </button>
                <button
                  type="button"
                  onClick={onRequestNewGame}
                  className="w-full min-h-[44px] bg-sport-miss/15 hover:bg-sport-miss/25 border border-sport-miss/45 text-sport-miss-light font-bold py-2.5 px-4 rounded-xl transition-colors text-sm"
                >
                  Comenzar Nuevo Partido
                </button>
              </div>
            </div>
          </div>
        </ModalShell>

        {isTeamSelectorOpen && (
          <TeamSelectorModal
            isOpen={isTeamSelectorOpen}
            onClose={() => setIsTeamSelectorOpen(false)}
            onSelectTeam={(team) => {
              setSettings({ ...settings, myTeam: team });
              setIsTeamSelectorOpen(false);
            }}
            currentTeam={settings.myTeam || ''}
          />
        )}
      </>
    );
  }
);

export default SettingsModal;
