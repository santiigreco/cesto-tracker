
import React, { useState } from 'react';
import JerseyIcon from './JerseyIcon';
import WhatsappIcon from './WhatsappIcon';
import { Settings } from '../types';
import ToggleSwitch from './ToggleSwitch';

const allPlayers = Array.from({ length: 15 }, (_, i) => String(i + 1));

interface PlayerSetupProps {
  onSetupComplete: (selectedPlayers: string[], settings: Settings) => void;
}

const PlayerSetup: React.FC<PlayerSetupProps> = ({ onSetupComplete }) => {
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [settings, setSettings] = useState<Settings>({
    isManoCalienteEnabled: true,
    manoCalienteThreshold: 3,
    isManoFriaEnabled: true,
    manoFriaThreshold: 3,
  });


  const togglePlayer = (playerNumber: string) => {
    setSelectedPlayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playerNumber)) {
        newSet.delete(playerNumber);
      } else {
        newSet.add(playerNumber);
      }
      return newSet;
    });
  };

  const handleStart = () => {
    const sortedPlayers = Array.from(selectedPlayers).sort((a, b) => Number(a) - Number(b));
    onSetupComplete(sortedPlayers, settings);
  };
  
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
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 font-sans">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-xl shadow-2xl text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400 tracking-tight mb-4">
          Bienvenido a Cesto Tracker 🏐
        </h1>
        <div className="text-gray-300 mb-8 max-w-xl mx-auto">
            <p className="text-lg">
                Selecciona los jugadores que participarán en el partido.
            </p>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center items-center mb-8">
          {allPlayers.map(num => {
            const isSelected = selectedPlayers.has(num);
            return (
              <JerseyIcon
                key={num}
                number={num}
                isSelected={isSelected}
                onClick={togglePlayer}
              />
            );
          })}
        </div>
        
        <div className="border-t border-gray-700 my-8 pt-8 space-y-6 text-left">
            <h2 className="text-2xl font-bold text-cyan-400 text-center mb-6">Configuración de Notificaciones</h2>
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
                <div className="flex flex-wrap items-center gap-4">
                    <label htmlFor="manoCalienteThreshold" className="text-gray-300 flex-shrink-0">Goles seguidos para notificar:</label>
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
                <div className="flex flex-wrap items-center gap-4">
                    <label htmlFor="manoFriaThreshold" className="text-gray-300 flex-shrink-0">Fallos seguidos para notificar:</label>
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


        <button
          onClick={handleStart}
          disabled={selectedPlayers.size === 0}
          className="w-full max-w-sm bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
        >
          Comenzar Partido
        </button>
      </div>
       <footer className="w-full text-center text-gray-500 text-xs mt-8 pb-4">
        Santiago Greco - All rights reserved. Gresolutions © 2025
      </footer>

      <a
        href="https://api.whatsapp.com/send/?phone=5491163303194&text=Hola!%20Estuve%20probando%20la%20app%20Cesto%20Tracker%20y...."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-400 flex items-center gap-2"
        aria-label="Enviar feedback por WhatsApp"
        title="Enviar feedback por WhatsApp"
      >
        <WhatsappIcon className="h-6 w-6" />
        <span className="text-sm">Feedback</span>
      </a>
    </div>
  );
};

export default PlayerSetup;
