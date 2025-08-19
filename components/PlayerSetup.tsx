

import React, { useState } from 'react';
import JerseyIcon from './JerseyIcon';
import WhatsappIcon from './WhatsappIcon';
import { Settings } from '../types';
import ToggleSwitch from './ToggleSwitch';

const allPlayers = Array.from({ length: 15 }, (_, i) => String(i + 1));

const defaultSettings: Settings = {
    isManoCalienteEnabled: false,
    manoCalienteThreshold: 5,
    isManoFriaEnabled: false,
    manoFriaThreshold: 5,
};

interface PlayerSetupProps {
  onSetupComplete: (selectedPlayers: string[], settings: Settings) => void;
  initialSelectedPlayers?: string[];
  initialSettings?: Settings;
}

const PlayerSetup: React.FC<PlayerSetupProps> = ({ onSetupComplete, initialSelectedPlayers = [], initialSettings = defaultSettings }) => {
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set(initialSelectedPlayers));
  const [isNovedadesOpen, setIsNovedadesOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(initialSettings);


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
      if (!isNaN(numValue)) {
          setSettings({ ...settings, [key]: numValue });
      }
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 font-sans">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-xl shadow-2xl text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400 tracking-tight mb-4">
          Cesto Tracker 🏐
        </h1>
        <p className="text-lg text-gray-400 mb-8">La app definitiva para seguimiento y estadísticas de Cestoball.</p>
        
        <div className="text-gray-300 mb-8 max-w-xl mx-auto">
            <p className="text-lg">
                Selecciona los jugadores que participarán en el partido.
            </p>
            <p className="text-sm text-gray-400 mt-1">
                (Podrás personalizar sus nombres más adelante)
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
        
        <button
          onClick={handleStart}
          disabled={selectedPlayers.size === 0}
          className="w-full max-w-sm bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
        >
          {initialSelectedPlayers.length > 0 ? 'Continuar Partido' : 'Comenzar Partido'}
        </button>

        <div className="border-t border-gray-700 my-8 pt-8 flex flex-col items-center">
            <button
              onClick={() => setIsNovedadesOpen(!isNovedadesOpen)}
              className="w-full max-w-md flex justify-between items-center text-left text-2xl font-bold text-cyan-400 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
              aria-expanded={isNovedadesOpen}
              aria-controls="novedades-panel"
            >
              <span>¡Novedades!</span>
              <svg className={`w-6 h-6 text-cyan-400 transition-transform duration-300 ${isNovedadesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            
            <div
              id="novedades-panel"
              className={`w-full max-w-md transition-all duration-500 ease-in-out overflow-hidden ${isNovedadesOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="pt-6 space-y-6">
                    {/* Mano Caliente Settings */}
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Mano Caliente 🔥</h3>
                            <ToggleSwitch
                                isEnabled={settings.isManoCalienteEnabled}
                                onToggle={() => setSettings({ ...settings, isManoCalienteEnabled: !settings.isManoCalienteEnabled })}
                            />
                        </div>
                        <p className="text-gray-400 mt-2 mb-4">Avisar cuando un jugador anota <span className="font-bold text-white">{settings.manoCalienteThreshold}</span> goles seguidos.</p>
                        <div className="flex items-center gap-4 relative">
                            <span className="text-gray-300 font-mono">3</span>
                            <input
                                type="range"
                                id="manoCalienteThreshold"
                                value={settings.manoCalienteThreshold}
                                onChange={(e) => handleThresholdChange('manoCalienteThreshold', e.target.value)}
                                disabled={!settings.isManoCalienteEnabled}
                                className="w-full flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                                min="3"
                                max="10"
                            />
                            <span className="text-gray-300 font-mono">10</span>
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
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Mano Fría ❄️</h3>
                            <ToggleSwitch
                                isEnabled={settings.isManoFriaEnabled}
                                onToggle={() => setSettings({ ...settings, isManoFriaEnabled: !settings.isManoFriaEnabled })}
                            />
                        </div>
                        <p className="text-gray-400 mt-2 mb-4">Avisar cuando un jugador falla <span className="font-bold text-white">{settings.manoFriaThreshold}</span> tiros seguidos.</p>
                        <div className="flex items-center gap-4 relative">
                            <span className="text-gray-300 font-mono">3</span>
                            <input
                                type="range"
                                id="manoFriaThreshold"
                                value={settings.manoFriaThreshold}
                                onChange={(e) => handleThresholdChange('manoFriaThreshold', e.target.value)}
                                disabled={!settings.isManoFriaEnabled}
                                className="w-full flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                                min="3"
                                max="10"
                            />
                            <span className="text-gray-300 font-mono">10</span>
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
            </div>
        </div>
      </div>
       <footer className="w-full text-center text-gray-500 text-xs mt-8 pb-4">
        Santiago Greco - Gresolutions © 2025
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
