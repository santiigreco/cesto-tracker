
import React from 'react';
import ToggleSwitch from './ToggleSwitch';

interface Settings {
  isManoCalienteEnabled: boolean;
  manoCalienteThreshold: number;
  isManoFriaEnabled: boolean;
  manoFriaThreshold: number;
}

interface SettingsModalProps {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, setSettings, onClose }) => {
    
    const handleThresholdChange = (key: 'manoCalienteThreshold' | 'manoFriaThreshold', value: string) => {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue > 0) {
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
                            <label htmlFor="manoCalienteThreshold" className="text-gray-300">Tiros seguidos para notificar:</label>
                            <input
                                type="number"
                                id="manoCalienteThreshold"
                                value={settings.manoCalienteThreshold}
                                onChange={(e) => handleThresholdChange('manoCalienteThreshold', e.target.value)}
                                disabled={!settings.isManoCalienteEnabled}
                                className="w-20 bg-gray-900 border border-gray-600 text-white text-center text-lg rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2 disabled:opacity-50"
                                min="1"
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
                                value={settings.manoFriaThreshold}
                                onChange={(e) => handleThresholdChange('manoFriaThreshold', e.target.value)}
                                disabled={!settings.isManoFriaEnabled}
                                className="w-20 bg-gray-900 border border-gray-600 text-white text-center text-lg rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2 disabled:opacity-50"
                                min="1"
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
