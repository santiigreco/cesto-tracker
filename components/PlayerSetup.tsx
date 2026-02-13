
import React, { useState } from 'react';
import JerseyIcon from './JerseyIcon';
import { Settings, GameMode, SavedTeam } from '../types';
import ToggleSwitch from './ToggleSwitch';
import ChevronDownIcon from './ChevronDownIcon';
import UndoIcon from './UndoIcon';
import UsersIcon from './UsersIcon';
import TeamSelectorModal from './TeamSelectorModal';
import TournamentSelectorModal from './TournamentSelectorModal';
import TeamRosterModal from './TeamRosterModal';
import { supabase } from '../utils/supabaseClient';

const allPlayers = Array.from({ length: 15 }, (_, i) => String(i + 1));

const defaultSettings: Settings = {
    gameName: '',
    myTeam: '',
    tournamentId: '',
    tournamentName: '',
    isManoCalienteEnabled: true,
    manoCalienteThreshold: 5,
    isManoFriaEnabled: true,
    manoFriaThreshold: 5,
};

interface PlayerSetupProps {
  onSetupComplete: (selectedPlayers: string[], settings: Settings, gameMode: GameMode, initialPlayerNames?: Record<string, string>) => void;
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
  
  // Local state to hold player names when a team is loaded
  const [localPlayerNames, setLocalPlayerNames] = useState<Record<string, string>>({});

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isTeamSelectorOpen, setIsTeamSelectorOpen] = useState(false);
  const [isTournamentSelectorOpen, setIsTournamentSelectorOpen] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  
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
        gameName: settings.gameName?.trim() || `Partido del ${new Date().toLocaleDateString()}`
    };

    onSetupComplete(sortedPlayers, finalSettings, selectedMode || 'stats-tally', localPlayerNames);
  };

  const handleThresholdChange = (key: 'manoCalienteThreshold' | 'manoFriaThreshold', value: string) => {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
          setSettings({ ...settings, [key]: numValue });
      }
  };
  
  const handleTeamLoaded = (team: SavedTeam) => {
      // 1. Set Team Name
      setSettings(prev => ({ ...prev, myTeam: team.name }));
      
      // 2. Set Players
      const newSelected = new Set<string>();
      const newNames: Record<string, string> = {};
      
      team.players.forEach(p => {
          newSelected.add(p.number);
          if (p.name) newNames[p.number] = p.name;
      });
      
      setSelectedPlayers(newSelected);
      setLocalPlayerNames(newNames);
      setIsRosterModalOpen(false);
  };

  const isCorrection = initialSelectedPlayers.length > 0;
  const [user, setUser] = useState<any>(null);

    React.useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user));
    }, []);


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
        
        <div className="mb-6 space-y-4 max-w-sm mx-auto">
            {/* Tournament Selector */}
            <div className="text-left">
                <label className="block text-xs font-semibold text-slate-400 mb-1 ml-1 uppercase tracking-wide">Torneo / Temporada</label>
                <button
                    onClick={() => setIsTournamentSelectorOpen(true)}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg block p-3 text-left flex justify-between items-center transition-all hover:bg-slate-800 hover:border-cyan-500 group"
                >
                    <span className={`text-base ${settings.tournamentName ? 'text-cyan-300 font-bold' : 'text-slate-500'}`}>
                        {settings.tournamentName || 'Seleccionar Torneo...'}
                    </span>
                    <ChevronDownIcon className="h-5 w-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                </button>
            </div>

            {/* Team Selector Trigger & Roster Manager */}
            <div className="text-left">
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-400 ml-1 uppercase tracking-wide">Tu Equipo</label>
                    {user && (
                         <button 
                            onClick={() => setIsRosterModalOpen(true)}
                            className="text-xs flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold bg-cyan-900/30 px-2 py-0.5 rounded border border-cyan-500/30 hover:bg-cyan-900/50 transition-colors"
                        >
                            <UsersIcon className="h-3 w-3" /> Mis Planteles
                        </button>
                    )}
                </div>
                
                <button
                    onClick={() => setIsTeamSelectorOpen(true)}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg block p-3 text-left flex justify-between items-center transition-all hover:bg-slate-800 hover:border-cyan-500 group"
                >
                    <span className={`text-lg ${settings.myTeam ? 'text-white font-bold' : 'text-slate-500'}`}>
                        {settings.myTeam || 'Seleccionar Equipo...'}
                    </span>
                    <ChevronDownIcon className="h-5 w-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                </button>
            </div>

            {/* Game Name Input */}
            <div className="text-left">
                <label className="block text-xs font-semibold text-slate-400 mb-1 ml-1 uppercase tracking-wide">Rival / Detalle</label>
                <input
                    type="text"
                    value={settings.gameName || ''}
                    onChange={(e) => setSettings(s => ({ ...s, gameName: e.target.value }))}
                    className="bg-transparent border-b border-slate-600 text-white text-lg placeholder-slate-500 focus:border-cyan-500 focus:outline-none w-full py-2 transition-colors"
                    placeholder="Nombre del partido (Ej: Vs. Vélez)"
                />
            </div>
        </div>

        {/* Player Selection - Express Mode */}
        <div className="mb-8">
            <p className="text-sm text-slate-400 mb-4">Marca los jugadores que participan ({selectedPlayers.size} seleccionados)</p>
            
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center items-center bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 shadow-inner">
              {allPlayers.map(num => (
                <JerseyIcon
                  key={num}
                  number={num}
                  name={localPlayerNames[num]}
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

      {isTeamSelectorOpen && (
          <TeamSelectorModal 
              isOpen={isTeamSelectorOpen} 
              onClose={() => setIsTeamSelectorOpen(false)} 
              onSelectTeam={(team) => setSettings(prev => ({ ...prev, myTeam: team }))}
              currentTeam={settings.myTeam || ''}
          />
      )}

      {isTournamentSelectorOpen && (
          <TournamentSelectorModal
              isOpen={isTournamentSelectorOpen}
              onClose={() => setIsTournamentSelectorOpen(false)}
              onSelectTournament={(id, name) => setSettings(prev => ({ ...prev, tournamentId: id, tournamentName: name }))}
              currentTournamentId={settings.tournamentId}
          />
      )}
      
      {isRosterModalOpen && (
          <TeamRosterModal
            isOpen={isRosterModalOpen}
            onClose={() => setIsRosterModalOpen(false)}
            onLoadTeam={handleTeamLoaded}
            currentSelection={{
                name: settings.myTeam || '',
                players: Array.from(selectedPlayers)
            }}
          />
      )}
    </div>
  );
};

export default PlayerSetup;
