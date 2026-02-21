
import React, { useState } from 'react';
import ToggleSwitch from './ToggleSwitch';
import { Settings } from '../types';
import { XIcon } from './icons';
import { ChevronDownIcon } from './icons';
import TeamSelectorModal from './TeamSelectorModal';
import { GoogleIcon } from './icons';
import { useProfile } from '../hooks/useProfile';

// --- ICONS (local to this component) ---
const CloudUploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9m-4-4l4-4 4 4" />
    </svg>
);

interface SettingsModalProps {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  onClose: () => void;
  onRequestNewGame: () => void;
  onRequestReselectPlayers: () => void;
  onRequestChangeMode: () => void;
  onRequestSaveGame: () => void;
  user: any;
  onLogout: () => void;
  onLogin: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = React.memo(({ settings, setSettings, onClose, onRequestNewGame, onRequestReselectPlayers, onRequestChangeMode, onRequestSaveGame, user, onLogout, onLogin }) => {
    const [isTeamSelectorOpen, setIsTeamSelectorOpen] = useState(false);
    const { profile } = useProfile();

    const handleThresholdChange = (key: 'manoCalienteThreshold' | 'manoFriaThreshold', value: string) => {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
            setSettings({ ...settings, [key]: numValue });
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity"
            aria-labelledby="settings-modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-slate-800 rounded-xl shadow-2xl p-6 sm:p-8 m-4 max-w-lg w-full transform transition-all scale-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <h2 id="settings-modal-title" className="text-3xl font-bold text-cyan-400">Configuración</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-2 -mr-2 rounded-full" aria-label="Cerrar"><XIcon/></button>
                </div>

                <div className="space-y-6">
                    {/* User Session Info */}
                    {user && (
                        <div className="bg-slate-700/50 p-4 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold text-lg uppercase overflow-hidden relative">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        user.email?.charAt(0) || 'U'
                                    )}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm text-slate-400">Sesión iniciada como:</p>
                                    <p className="text-white font-semibold truncate">{user.email}</p>
                                </div>
                            </div>
                            <button 
                                onClick={onLogout}
                                className="text-xs text-red-400 hover:text-red-300 font-bold border border-red-900/50 bg-red-900/20 px-3 py-1.5 rounded-lg hover:bg-red-900/40 transition-colors"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    )}

                     {/* Game Info Settings */}
                    <div className="bg-slate-700/50 p-4 rounded-lg space-y-4">
                        <h3 className="text-xl font-bold text-white mb-2">Información del Partido</h3>
                        
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide">Tu Equipo</label>
                            <button
                                onClick={() => setIsTeamSelectorOpen(true)}
                                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg block p-3 text-left flex justify-between items-center transition-all hover:bg-slate-800 hover:border-cyan-500 group mb-2"
                            >
                                <span className={`text-base ${settings.myTeam ? 'text-white font-bold' : 'text-slate-500'}`}>
                                    {settings.myTeam || 'Seleccionar Equipo...'}
                                </span>
                                <ChevronDownIcon className="h-5 w-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide">Nombre del Partido</label>
                            <input
                                type="text"
                                value={settings.gameName || ''}
                                onChange={(e) => setSettings({ ...settings, gameName: e.target.value })}
                                className="bg-slate-900/50 border border-slate-600 text-white text-base rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                                placeholder="Ej: Final vs. Vélez"
                            />
                        </div>
                    </div>

                    {/* Mano Caliente Settings */}
                    <div className="bg-slate-700/50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Mano Caliente 🔥</h3>
                            <ToggleSwitch
                                isEnabled={settings.isManoCalienteEnabled}
                                onToggle={() => setSettings({ ...settings, isManoCalienteEnabled: !settings.isManoCalienteEnabled })}
                            />
                        </div>
                        <p className="text-slate-400 mt-2 mb-4">Avisar cuando un jugador anota <span className="font-bold text-white">{settings.manoCalienteThreshold}</span> goles seguidos.</p>
                        <div className="flex items-center gap-4 relative">
                            <span className="text-slate-300 font-mono">3</span>
                            <input
                                type="range"
                                id="manoCalienteThreshold"
                                value={settings.manoCalienteThreshold}
                                onChange={(e) => handleThresholdChange('manoCalienteThreshold', e.target.value)}
                                disabled={!settings.isManoCalienteEnabled}
                                className="w-full flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                                min="3"
                                max="10"
                            />
                            <span className="text-slate-300 font-mono">10</span>
                            {!settings.isManoCalienteEnabled && (
                                <div
                                    className="absolute inset-0 cursor-pointer"
                                    onClick={() => setSettings({ ...settings, isManoCalienteEnabled: true })}
                                    aria-hidden="true"
                                ></div>
                            )}
                        </div>
                    </div>

                    {/* Mano Fría Settings */}
                    <div className="bg-slate-700/50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Mano Fría ❄️</h3>
                            <ToggleSwitch
                                isEnabled={settings.isManoFriaEnabled}
                                onToggle={() => setSettings({ ...settings, isManoFriaEnabled: !settings.isManoFriaEnabled })}
                            />
                        </div>
                        <p className="text-slate-400 mt-2 mb-4">Avisar cuando un jugador falla <span className="font-bold text-white">{settings.manoFriaThreshold}</span> tiros seguidos.</p>
                        <div className="flex items-center gap-4 relative">
                             <span className="text-slate-300 font-mono">3</span>
                            <input
                                type="range"
                                id="manoFriaThreshold"
                                value={settings.manoFriaThreshold}
                                onChange={(e) => handleThresholdChange('manoFriaThreshold', e.target.value)}
                                disabled={!settings.isManoFriaEnabled}
                                className="w-full flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                                min="3"
                                max="10"
                            />
                            <span className="text-slate-300 font-mono">10</span>
                             {!settings.isManoFriaEnabled && (
                                <div
                                    className="absolute inset-0 cursor-pointer"
                                    onClick={() => setSettings({ ...settings, isManoFriaEnabled: true })}
                                    aria-hidden="true"
                                ></div>
                            )}
                        </div>
                    </div>
                </div>
                
                 {/* Cloud Sync Section */}
                <div className="border-t border-slate-700 mt-8 pt-6">
                    <h3 className="text-xl font-bold text-white mb-2">Sincronización</h3>
                    <p className="text-slate-400 mb-4">
                        Guarda los datos de este partido en la nube para tener un respaldo.
                    </p>
                    <div className="flex flex-col items-center">
                        {user ? (
                             <button
                                onClick={onRequestSaveGame}
                                className="w-full max-w-xs flex items-center justify-center gap-3 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform bg-cyan-600 hover:bg-cyan-700 hover:scale-105"
                            >
                                <CloudUploadIcon className="h-5 w-5" />
                                <span>Guardar Partido en la Nube</span>
                            </button>
                        ) : (
                            <button
                                onClick={onLogin}
                                className="w-full max-w-xs flex items-center justify-center gap-3 bg-white text-slate-900 hover:bg-gray-100 font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                            >
                                <GoogleIcon className="h-5 w-5" />
                                <span>Ingresar para Guardar</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Session Management Section */}
                <div className="border-t border-slate-700 mt-8 pt-6">
                    <h3 className="text-xl font-bold text-white mb-2">Gestión del Partido</h3>
                    <p className="text-slate-400 mb-4">
                        Estas acciones afectarán el partido actual.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={onRequestChangeMode}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                        >
                           Cambiar Modo de Juego
                        </button>
                         <button
                            onClick={onRequestReselectPlayers}
                            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            Corregir Jugadores
                        </button>
                         <button
                            onClick={onRequestNewGame}
                            className="w-full sm:col-span-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            Comenzar Nuevo Partido
                        </button>
                    </div>
                </div>


                <div className="mt-8 text-right">
                    <button
                        onClick={onClose}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
                    >
                        Cerrar
                    </button>
                </div>
            </div>

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
        </div>
    );
});

export default SettingsModal;
