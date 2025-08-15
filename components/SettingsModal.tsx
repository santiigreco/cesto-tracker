
import React from 'react';
import ToggleSwitch from './ToggleSwitch';
import { Settings } from '../types';

interface SettingsModalProps {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, setSettings, onClose }) => {
    
    const handleThresholdChange = (key: 'manoCalienteThreshold' | 'manoFriaThreshold', value: string) => {
        const numValue = parseInt(value, 10);
        if (value === '') {
            // Use 0 as a temporary placeholder for an empty input
            setSettings({ ...settings, [key]: 0 });
        } else if (!isNaN(numValue)) {
            setSettings({ ...settings, [key]: numValue });
        }
    };

    const handleThresholdBlur = (key: 'manoCalienteThreshold' | 'manoFriaThreshold') => {
        const currentValue = settings[key];
        if (currentValue < 3) {
            setSettings({ ...settings, [key]: 3 });
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity"
            aria-labelledby="settings-modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 m-4 max-w-lg w-full transform transition-all scale-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 id="settings-modal-title" className="text-3xl font-bold text-cyan-400">Configuración</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>

                <div className="space-y-8">
                    {/* Mano Caliente Settings */}
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Mano Caliente 🔥</h3>
                            <ToggleSwitch
                                isEnabled={settings.isManoCalienteEnabled}
                                onToggle={() => setSettings({ ...settings, isManoCalienteEnabled: !settings.isManoCalienteEnabled })}
                            />
                        </div>
                        <p className="text-gray-400 mt-2 mb-4">Notificar cuando un jugador mete varios goles seguidos.</p>
                        <div className="flex items-center gap-4">
                            <label htmlFor="manoCalienteThreshold" className="text-gray-300">Goles seguidos para notificar:</label>
                            <input
                                type="number"
                                id="manoCalienteThreshold"
                                value={settings.manoCalienteThreshold === 0 ? '' : settings.manoCalienteThreshold}
                                onChange={(e) => handleThresholdChange('manoCalienteThreshold', e.target.value)}
                                onBlur={() => handleThresholdBlur('manoCalienteThreshold')}
                                disabled={!settings.isManoCalienteEnabled}
                                className="w-20 bg-gray-900 border border-gray-600 text-white text-center text-lg rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2 disabled:opacity-50"
                                min="3"
                            />
                        </div>
                    </div>

                    {/* Mano Fría Settings */}
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Mano Fría ❄️</h3>
                            <ToggleSwitch
                                isEnabled={settings.isManoFriaEnabled}
                                onToggle={() => setSettings({ ...settings, isManoFriaEnabled: !settings.isManoFriaEnabled })}
                            />
                        </div>
                        <p className="text-gray-400 mt-2 mb-4">Notificar cuando un jugador falla varios tiros seguidos.</p>
                        <div className="flex items-center gap-4">
                            <label htmlFor="manoFriaThreshold" className="text-gray-300">Fallos seguidos para notificar:</label>
                            <input
                                type="number"
                                id="manoFriaThreshold"
                                value={settings.manoFriaThreshold === 0 ? '' : settings.manoFriaThreshold}
                                onChange={(e) => handleThresholdChange('manoFriaThreshold', e.target.value)}
                                onBlur={() => handleThresholdBlur('manoFriaThreshold')}
                                disabled={!settings.isManoFriaEnabled}
                                className="w-20 bg-gray-900 border border-gray-600 text-white text-center text-lg rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2 disabled:opacity-50"
                                min="3"
                            />
                        </div>
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
        </div>
    );
};

export default SettingsModal;
