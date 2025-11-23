
import React, { useState } from 'react';
import JerseyIcon from './JerseyIcon';
import { Settings, GameMode } from '../types';
import ToggleSwitch from './ToggleSwitch';
import ChevronDownIcon from './ChevronDownIcon';
import UndoIcon from './UndoIcon';

const allPlayers = Array.from({ length: 15 }, (_, i) => String(i + 1));

const defaultSettings: Settings = {
    gameName: '',
    isManoCalienteEnabled: true,
    manoCalienteThreshold: 5,
    isManoFriaEnabled: true,
    manoFriaThreshold: 5,
};

interface PlayerSetupProps {
  onSetupComplete: (selectedPlayers: string[], settings: Settings, gameMode: GameMode) => void;
  onBack: () => void;
  initialSelectedPlayers?: string[];
  initialSettings?: Settings;
  initialGameMode?: GameMode | null;
}

const PlayerSetup: React.FC<PlayerSetupProps> = ({ onSetupComplete, onBack, initialSelectedPlayers = [], initialSettings = defaultSettings, initialGameMode = null }) => {
  // Pre-select all players (1-15) for new games, or use existing selection for corrections
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(() => {
      if (initialSelectedPlayers.length > 0) {
          return new Set(initialSelectedPlayers);
      }
      return new Set(allPlayers);
  });

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(initialSettings);
  
  // Default to 'stats-tally' (Anotador) if no mode provided
  const [selectedMode, setSelectedMode] = useState<GameMode>(initialGameMode || 'stats-tally');

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
    if (selectedPlayers.size < 1) {
        alert("Debes seleccionar al menos un jugador.");
        return;
    }
    if (selectedMode === 'shot-chart' && selectedPlayers.size < 6) {
        alert('El modo "Registro de Tiros" requiere un equipo de al menos 6 jugadores.');
        return;
    }
    
    const sortedPlayers = Array.from(selectedPlayers).sort((a, b) => Number(a) - Number(b));
    
    // Set default name if empty
    const finalSettings = {
        ...settings,
        gameName: settings.gameName.trim() || `Partido del ${new Date().toLocaleDateString()}`
    };

    onSetupComplete(sortedPlayers, finalSettings, selectedMode || 'stats-tally');
  };
  
  const handleThresholdChange = (key: 'manoCalienteThreshold' | 'manoFriaThreshold', value: string) => {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
          setSettings({ ...settings, [key]: numValue });
      }
  };

  const isCorrection = initialSelectedPlayers.length > 0;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans bg-pattern-hoops">
      <div className="w-full max-w-2xl bg-slate-800/90 backdrop-blur-sm border border-slate-700 p-6 sm:p-8 rounded-2xl shadow-2xl text-center relative">
         {!isCorrection && (
             <button 
                 onClick={onBack}
                 className="absolute top-4 left-4 text-slate-400 hover:text-white flex items-center gap-1 text-sm font-semibold transition-colors"
             >
                 <UndoIcon className="h-4 w-4" /> Inicio
             </button>
         )}

        <h1 className="text-3xl sm:text-4xl font-bold text-cyan-400 tracking-tight mb-2 mt-6 sm:mt-0">
          {isCorrection ? 'Editar Equipo' : 'Nuevo Partido'}
        </h1>
        
        {/* Simplified Game Name Input */}
        <div className="mb-6 max-w-sm mx-auto">
            <input
                type="text"
                value={settings.gameName || ''}
                onChange={(e) => setSettings(s => ({ ...s, gameName: e.target.value }))}
                className="bg-transparent border-b border-slate-600 text-center text-white text-lg placeholder-slate-500 focus:border-cyan-500 focus:outline-none w-full py-2 transition-colors"
                placeholder="Nombre del partido (Opcional)"
            />
        </div>

        {/* Player Selection - Express Mode */}
        <div className="mb-8">
            <p className="text-sm text-slate-400 mb-4">Marca los jugadores que participan ({selectedPlayers.size} seleccionados)</p>
            
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center items-center bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 shadow-inner">
              {allPlayers.map(num => (
                <JerseyIcon
                  key={num}
                  number={num}
                  isSelected={selectedPlayers.has(num)}
                  onClick={togglePlayer}
                />
              ))}
            </div>
        </div>
        
        {/* Big Start Button */}
        <button
            onClick={handleStart}
            className="w-full max-w-sm bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 ease-in-out transform hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.3)] text-xl mb-6"
        >
            {isCorrection ? 'Guardar Cambios' : 'INICIAR PARTIDO'}
        </button>
        
        {/* Advanced Options Collapsible */}
        <div className="border-t border-slate-700 pt-4">
             <button
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className="flex items-center justify-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors mx-auto"
                  aria-expanded={isAdvancedOpen}
                >
                  <span>Opciones Avanzadas</span>
                  <ChevronDownIcon className={`h-4 w-4 transition-transform duration-300 ${isAdvancedOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isAdvancedOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                <div className="bg-slate-700/30 p-4 rounded-xl text-left space-y-4 border border-slate-600/30">
                    
                    {/* Game Mode Toggle */}
                    <div className="flex items-center justify-between">
                         <div>
                             <h3 className="text-white font-semibold">Modo Mapa de Tiros</h3>
                             <p className="text-xs text-slate-400">Registrar posición exacta en cancha (Avanzado)</p>
                         </div>
                         <ToggleSwitch 
                            isEnabled={selectedMode === 'shot-chart'}
                            onToggle={() => setSelectedMode(prev => prev === 'shot-chart' ? 'stats-tally' : 'shot-chart')}
                         />
                    </div>

                     <div className="h-px bg-slate-600/50"></div>

                    {/* Hand Hot/Cold Settings */}
                     <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-300">Alerta Mano Caliente 🔥</span>
                            <ToggleSwitch
                                isEnabled={settings.isManoCalienteEnabled}
                                onToggle={() => setSettings({ ...settings, isManoCalienteEnabled: !settings.isManoCalienteEnabled })}
                            />
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-300">Alerta Mano Fría ❄️</span>
                            <ToggleSwitch
                                isEnabled={settings.isManoFriaEnabled}
                                onToggle={() => setSettings({ ...settings, isManoFriaEnabled: !settings.isManoFriaEnabled })}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
      </div>
       <footer className="w-full text-center text-slate-500 text-xs mt-8 pb-4">
        Santiago Greco - Gresolutions © 2025
      </footer>
    </div>
  );
};

export default PlayerSetup;
