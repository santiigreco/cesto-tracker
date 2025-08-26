


import React from 'react';
import ToggleSwitch from './ToggleSwitch';
import { Settings } from '../types';

interface SettingsModalProps {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  onClose: () => void;
  onRequestNewGame: () => void;
  onRequestReselectPlayers: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = React.memo(({ settings, setSettings, onClose, onRequestNewGame, onRequestReselectPlayers }) => {
    
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
            <div className="bg-slate-800 rounded-xl shadow-2xl p-6 sm:p-8 m-4 max-w-lg w-full transform transition-all scale-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 id="settings-modal-title" className="text-3xl font-bold text-cyan-400">Configuración</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>

                <div className="space-y-8">
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

                {/* Session Management Section */}
                <div className="border-t border-slate-700 mt-8 pt-6">
                    <h3 className="text-xl font-bold text-white mb-2">Gestión de la Sesión</h3>
                    <p className="text-slate-400 mb-4">
                        Estas acciones reiniciarán el partido actual. Úsalas para corregir la selección inicial de jugadores o para empezar un partido completamente nuevo.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={onRequestReselectPlayers}
                            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            Corregir Jugadores
                        </button>
                         <button
                            onClick={onRequestNewGame}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
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
                        Guardar y Salir
                    </button>
                </div>
            </div>
        </div>
    );
});

export default SettingsModal;