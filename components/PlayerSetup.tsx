import React, { useState } from 'react';
import JerseyIcon from './JerseyIcon';
import { Settings } from '../types';
import ToggleSwitch from './ToggleSwitch';
import ChevronDownIcon from './ChevronDownIcon';

const allPlayers = Array.from({ length: 15 }, (_, i) => String(i + 1));

const defaultSettings: Settings = {
    isManoCalienteEnabled: true,
    manoCalienteThreshold: 5,
    isManoFriaEnabled: true,
    manoFriaThreshold: 5,
};

interface PlayerSetupProps {
  onSetupComplete: (selectedPlayers: string[], settings: Settings) => void;
  initialSelectedPlayers?: string[];
  initialSettings?: Settings;
}

const PlayerSetup: React.FC<PlayerSetupProps> = ({ onSetupComplete, initialSelectedPlayers = [], initialSettings = defaultSettings }) => {
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(
      new Set(initialSelectedPlayers.length > 0 ? initialSelectedPlayers : allPlayers)
  );
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
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

  const handleSelectAll = () => {
    setSelectedPlayers(new Set(allPlayers));
  };

  const handleClearAll = () => {
    setSelectedPlayers(new Set());
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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans bg-pattern-hoops">
      <div className="w-full max-w-2xl bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-6 sm:p-8 rounded-2xl shadow-2xl text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400 tracking-tight mb-2">
          Configuración del Partido
        </h1>
        <p className="text-lg text-slate-400 mb-8">Elegí los jugadores y preparate para empezar.</p>
        
        <div className="bg-slate-900/50 p-4 sm:p-6 rounded-xl border border-slate-700 mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-200">Selección de Jugadores</h2>
                <span className="text-sm font-medium text-slate-400">{selectedPlayers.size} de 15 seleccionados</span>
            </div>
            
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center items-center">
              {allPlayers.map(num => (
                <JerseyIcon
                  key={num}
                  number={num}
                  isSelected={selectedPlayers.has(num)}
                  onClick={togglePlayer}
                />
              ))}
            </div>
            
            <div className="flex justify-center gap-4 mt-6 border-t border-slate-700 pt-4">
              <button
                onClick={handleSelectAll}
                className="bg-cyan-600 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Seleccionar Todos
              </button>
              <button
                onClick={handleClearAll}
                className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Limpiar Selección
              </button>
            </div>
             <p className={`text-xs text-red-400 mt-3 transition-opacity duration-300 ${selectedPlayers.size < 6 ? 'opacity-100' : 'opacity-0'}`}>
              * Se necesitan al menos 6 jugadores.
            </p>
        </div>
        
        <div className="space-y-6">
             <div className="w-full max-w-md mx-auto">
                <button
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className="w-full flex justify-between items-center text-left text-xl font-semibold text-slate-300 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                  aria-expanded={isAdvancedOpen}
                >
                  <span>Configuración Avanzada</span>
                  <ChevronDownIcon className={`h-6 w-6 text-slate-400 transition-transform duration-300 ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <div
                  className={`transition-all duration-500 ease-in-out overflow-hidden ${isAdvancedOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                    <div className="pt-4 space-y-4">
                        {/* Mano Caliente Settings */}
                        <div className="bg-slate-700/50 p-4 rounded-lg text-left">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-white">Mano Caliente 🔥</h3>
                                <ToggleSwitch
                                    isEnabled={settings.isManoCalienteEnabled}
                                    onToggle={() => setSettings({ ...settings, isManoCalienteEnabled: !settings.isManoCalienteEnabled })}
                                />
                            </div>
                            <p className="text-slate-400 text-sm mt-2 mb-3">Avisar cuando un jugador anota <span className="font-bold text-white">{settings.manoCalienteThreshold}</span> goles seguidos.</p>
                            <div className="flex items-center gap-4">
                                <span className="text-slate-300 font-mono text-sm">3</span>
                                <input type="range" value={settings.manoCalienteThreshold} onChange={(e) => handleThresholdChange('manoCalienteThreshold', e.target.value)} disabled={!settings.isManoCalienteEnabled} className="w-full flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50" min="3" max="10"/>
                                <span className="text-slate-300 font-mono text-sm">10</span>
                            </div>
                        </div>

                        {/* Mano Fría Settings */}
                        <div className="bg-slate-700/50 p-4 rounded-lg text-left">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-white">Mano Fría ❄️</h3>
                                <ToggleSwitch
                                    isEnabled={settings.isManoFriaEnabled}
                                    onToggle={() => setSettings({ ...settings, isManoFriaEnabled: !settings.isManoFriaEnabled })}
                                />
                            </div>
                            <p className="text-slate-400 text-sm mt-2 mb-3">Avisar cuando un jugador falla <span className="font-bold text-white">{settings.manoFriaThreshold}</span> tiros seguidos.</p>
                            <div className="flex items-center gap-4">
                                <span className="text-slate-300 font-mono text-sm">3</span>
                                <input type="range" value={settings.manoFriaThreshold} onChange={(e) => handleThresholdChange('manoFriaThreshold', e.target.value)} disabled={!settings.isManoFriaEnabled} className="w-full flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50" min="3" max="10" />
                                <span className="text-slate-300 font-mono text-sm">10</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button
              onClick={handleStart}
              disabled={selectedPlayers.size < 6}
              className="w-full max-w-sm bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-cyan-500/50 text-lg disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {initialSelectedPlayers.length > 0 ? 'Continuar Partido' : 'Comenzar Partido'}
            </button>
        </div>
      </div>
       <footer className="w-full text-center text-slate-500 text-xs mt-8 pb-4">
        Santiago Greco - Gresolutions © 2025
      </footer>
    </div>
  );
};

export default PlayerSetup;