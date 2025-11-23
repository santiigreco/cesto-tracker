
import React, { useState } from 'react';
import JerseyIcon from './JerseyIcon';
import { Settings, GameMode } from '../types';
import ToggleSwitch from './ToggleSwitch';
import ChevronDownIcon from './ChevronDownIcon';
import ClipboardIcon from './ClipboardIcon';
import ChartBarIcon from './ChartBarIcon';
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
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(
      new Set(initialSelectedPlayers)
  );
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [selectedMode, setSelectedMode] = useState<GameMode>(initialGameMode);


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
    if (!selectedMode) {
        alert("Debes seleccionar un modo de juego.");
        return;
    }
    if (selectedMode === 'shot-chart' && selectedPlayers.size < 6) {
        alert('El modo "Registro de Tiros" requiere un equipo de al menos 6 jugadores.');
        return;
    }
    const sortedPlayers = Array.from(selectedPlayers).sort((a, b) => Number(a) - Number(b));
    onSetupComplete(sortedPlayers, settings, selectedMode);
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
      <div className="w-full max-w-2xl bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-6 sm:p-8 rounded-2xl shadow-2xl text-center relative">
         {!isCorrection && (
             <button 
                 onClick={onBack}
                 className="absolute top-4 left-4 text-slate-400 hover:text-white flex items-center gap-1 text-sm font-semibold transition-colors"
             >
                 <UndoIcon className="h-4 w-4" /> Volver al Inicio
             </button>
         )}

        <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400 tracking-tight mb-2 mt-4 sm:mt-0">
          {isCorrection ? 'Corregir Equipo' : 'Nuevo Partido'}
        </h1>
        <p className="text-lg text-slate-400 mb-8">
            {isCorrection ? 'Ajusta el equipo y la configuración del partido actual.' : 'Define tu equipo y elige cómo registrarás los datos.'}
        </p>
        
        <div className="bg-slate-900/50 p-4 sm:p-6 rounded-xl border border-slate-700 mb-6">
            <h2 className="text-xl font-semibold text-slate-200 text-left mb-3">Nombre del Partido (Opcional)</h2>
            <input
                type="text"
                value={settings.gameName || ''}
                onChange={(e) => setSettings(s => ({ ...s, gameName: e.target.value }))}
                className="bg-slate-700 border border-slate-600 text-white text-lg rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                placeholder="Ej: Final vs Vélez"
            />
        </div>

        <div className="bg-slate-900/50 p-4 sm:p-6 rounded-xl border border-slate-700 mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-200">1. Selecciona tu Equipo</h2>
                <span className="text-sm font-medium text-slate-400">{selectedPlayers.size} / 15 seleccionados</span>
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
            
             <p className={`text-xs text-red-400 mt-3 transition-opacity duration-300 ${selectedPlayers.size < 1 ? 'opacity-100' : 'opacity-0'}`}>
              * Se necesita al menos 1 jugador.
            </p>
        </div>
        
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-200 text-center mb-4">2. Elige el Modo de Juego</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => setSelectedMode('shot-chart')}
                    className={`group bg-slate-800/80 backdrop-blur-sm border p-6 rounded-2xl shadow-lg hover:-translate-y-1 transition-all duration-300 ${selectedMode === 'shot-chart' ? 'border-cyan-500 ring-2 ring-cyan-500/50' : 'border-slate-700 hover:border-cyan-500'}`}
                >
                    <ClipboardIcon className="h-10 w-10 mx-auto text-cyan-400 mb-3" />
                    <h3 className="text-lg font-bold text-white mb-1">Registro de Tiros</h3>
                    <p className="text-sm text-slate-400">Analiza mapas de calor, zonas y estadísticas de tiros.</p>
                </button>
                <button
                    onClick={() => setSelectedMode('stats-tally')}
                    className={`group bg-slate-800/80 backdrop-blur-sm border p-6 rounded-2xl shadow-lg hover:-translate-y-1 transition-all duration-300 ${selectedMode === 'stats-tally' ? 'border-emerald-500 ring-2 ring-emerald-500/50' : 'border-slate-700 hover:border-emerald-500'}`}
                >
                    <ChartBarIcon className="h-10 w-10 mx-auto text-emerald-400 mb-3" />
                    <h3 className="text-lg font-bold text-white mb-1">Anotador Rápido</h3>
                    <p className="text-sm text-slate-400">Lleva un conteo de recuperos, pérdidas, asistencias, etc.</p>
                </button>
            </div>
             <p className={`text-xs text-red-400 mt-3 transition-opacity duration-300 ${!selectedMode ? 'opacity-100' : 'opacity-0'}`}>
              * Se necesita seleccionar un modo de juego.
            </p>
        </div>
        
        <div className="space-y-6">
             <div className="w-full max-w-md mx-auto">
                <button
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className="w-full flex justify-between items-center text-left text-xl font-semibold text-slate-300 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                  aria-expanded={isAdvancedOpen}
                >
                  <span>Configuración Adicional</span>
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
              disabled={selectedPlayers.size < 1 || !selectedMode}
              className="w-full max-w-sm bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-cyan-500/50 text-lg disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {isCorrection ? 'Confirmar y Continuar' : 'Iniciar Partido'}
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