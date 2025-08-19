
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Shot, ShotPosition, GamePeriod, AppTab, HeatmapFilter, PlayerStats, MapPeriodFilter, Settings, GameState, PlayerStreak } from './types';
import Court from './components/Court';
import ShotLog from './components/ShotLog';
import PlayerSelector from './components/PlayerSelector';
import OutcomeModal from './components/OutcomeModal';
import ConfirmationModal from './components/ConfirmationModal';
import StatisticsView from './components/StatisticsView';
import PlayerSetup from './components/PlayerSetup';
import WhatsappIcon from './components/WhatsappIcon';
import SettingsModal from './components/SettingsModal';
import GearIcon from './components/GearIcon';
import NotificationPopup from './components/NotificationPopup';
import DownloadIcon from './components/DownloadIcon';
import UndoIcon from './components/UndoIcon';
import RedoIcon from './components/RedoIcon';
import TrashIcon from './components/TrashIcon';
import CheckIcon from './components/CheckIcon';
import XIcon from './components/XIcon';


// TypeScript declaration for html2canvas global variable
declare const html2canvas: any;

// Constants for Heatmap
const HEATMAP_POINT_RADIUS = 40; // px, increased for more intensity
const HEATMAP_BLUR = 25; // px, increased for more intensity
const HEATMAP_OPACITY = 0.7; // increased opacity

const GAME_STATE_STORAGE_KEY = 'cestoTrackerGameState';

const initialGameState: GameState = {
    shots: [],
    isSetupComplete: false,
    availablePlayers: [],
    playerNames: {},
    currentPlayer: '1',
    currentPeriod: 'First Half',
    settings: {
        isManoCalienteEnabled: false,
        manoCalienteThreshold: 3,
        isManoFriaEnabled: false,
        manoFriaThreshold: 3,
    },
    playerStreaks: {},
};


interface NotificationInfo {
    type: 'caliente' | 'fria';
    playerNumber: string;
}

/**
 * The Heatmap overlay component.
 * It renders a visual representation of shot density.
 */
const HeatmapOverlay: React.FC<{ shots: Shot[], filter: HeatmapFilter }> = ({ shots }) => {
  // Use red tones for all filters for high visibility, as requested.
  const gradientColor = 'rgba(239, 68, 68, '; // Tailwind's red-500

  return (
    <div className="absolute inset-0 pointer-events-none">
      {shots.map(shot => (
        <div
          key={shot.id}
          className="absolute rounded-full"
          style={{
            left: `${(shot.position.x / 20) * 100}%`, // COURT_WIDTH is 20
            top: `${((16 - shot.position.y) / 16) * 100}%`, // HALF_COURT_LENGTH is 16
            width: `${HEATMAP_POINT_RADIUS * 2}px`,
            height: `${HEATMAP_POINT_RADIUS * 2}px`,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, ${gradientColor}${HEATMAP_OPACITY}) 0%, ${gradientColor}0) 70%)`,
            filter: `blur(${HEATMAP_BLUR}px)`,
          }}
        />
      ))}
    </div>
  );
};

/**
 * The main application component.
 * It holds the application's state and orchestrates all UI components and views.
 */
function App() {
  // --- STATE MANAGEMENT ---
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [redoStack, setRedoStack] = useState<Shot[]>([]);
  
  // Transient UI State (not saved)
  const [pendingShotPosition, setPendingShotPosition] = useState<ShotPosition | null>(null);
  const [isClearSheetModalOpen, setIsClearSheetModalOpen] = useState(false);
  const [isNewGameConfirmOpen, setIsNewGameConfirmOpen] = useState(false);
  const [isReselectConfirmOpen, setIsReselectConfirmOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>('logger');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [heatmapPlayer, setHeatmapPlayer] = useState<string>('Todos');
  const [heatmapFilter, setHeatmapFilter] = useState<HeatmapFilter>('all');
  const [shotmapPlayer, setShotmapPlayer] = useState<string>('Todos');
  const [shotmapResultFilter, setShotmapResultFilter] = useState<HeatmapFilter>('all');
  const [mapPeriodFilter, setMapPeriodFilter] = useState<MapPeriodFilter>('all');
  const [notificationPopup, setNotificationPopup] = useState<NotificationInfo | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempPlayerName, setTempPlayerName] = useState('');


  const heatmapCourtRef = useRef<HTMLDivElement>(null);

  // --- PERSISTENCE ---
  // Load state from localStorage on initial mount
  useEffect(() => {
    try {
      const savedStateJSON = localStorage.getItem(GAME_STATE_STORAGE_KEY);
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        setGameState(savedState);
      }
    } catch (error) {
      console.error("Failed to load game state from localStorage:", error);
      setGameState(initialGameState); // Fallback to initial state on error
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      const gameStateJSON = JSON.stringify(gameState);
      localStorage.setItem(GAME_STATE_STORAGE_KEY, gameStateJSON);
    } catch (error) {
      console.error("Failed to save game state to localStorage:", error);
    }
  }, [gameState]);


  // --- HANDLERS ---
  const handleSetupComplete = useCallback((selectedPlayers: string[], newSettings: Settings) => {
    if (selectedPlayers.length === 0) {
        alert('Debes seleccionar al menos un jugador.');
        return;
    }
    const sortedPlayers = selectedPlayers.sort((a,b) => Number(a) - Number(b));
    
    setGameState(prev => {
        // If the current player was removed, select the first available one
        const newCurrentPlayer = sortedPlayers.includes(prev.currentPlayer) ? prev.currentPlayer : sortedPlayers[0];

        return {
            ...prev,
            availablePlayers: sortedPlayers,
            settings: newSettings,
            isSetupComplete: true,
            currentPlayer: newCurrentPlayer,
        };
    });
    
    // Reset filters if the selected player was removed
    setHeatmapPlayer(prevPlayer => sortedPlayers.includes(prevPlayer) || prevPlayer === 'Todos' ? prevPlayer : 'Todos');
    setShotmapPlayer(prevPlayer => sortedPlayers.includes(prevPlayer) || prevPlayer === 'Todos' ? prevPlayer : 'Todos');
  }, []);
  
  const handleCourtClick = useCallback((position: ShotPosition) => {
    if (!gameState.currentPlayer.trim() || gameState.currentPlayer === 'Todos') {
      alert('Por favor, selecciona un jugador antes de marcar un tiro.');
      return;
    }
    setPendingShotPosition(position);
  }, [gameState.currentPlayer]);

  const handleOutcomeSelection = useCallback((isGol: boolean) => {
    if (pendingShotPosition) {
      const HALF_COURT_LINE_Y = 1; // From Court.tsx, represents the behind-the-arc line
      let golValue = 0;
      if (isGol) {
        golValue = pendingShotPosition.y < HALF_COURT_LINE_Y ? 3 : 2;
      }

      const newShot: Shot = {
        id: new Date().toISOString() + Math.random(),
        playerNumber: gameState.currentPlayer,
        position: pendingShotPosition,
        isGol,
        golValue,
        period: gameState.currentPeriod,
      };
      
      setGameState(prev => {
        // Update streaks and check for notifications
        const { playerNumber } = newShot;
        const currentStreak = prev.playerStreaks[playerNumber] || { consecutiveGoles: 0, consecutiveMisses: 0, notifiedCaliente: false, notifiedFria: false };
        let newStreak = { ...currentStreak };
        let triggeredNotification: NotificationInfo | null = null;
  
        if (isGol) {
          newStreak.consecutiveGoles += 1;
          newStreak.consecutiveMisses = 0;
          newStreak.notifiedFria = false; // Reset opposite streak flag
          if (prev.settings.isManoCalienteEnabled && newStreak.consecutiveGoles >= prev.settings.manoCalienteThreshold && !newStreak.notifiedCaliente) {
            triggeredNotification = { type: 'caliente', playerNumber };
            newStreak.notifiedCaliente = true; // Mark as notified for this streak
          }
        } else { // is Miss
          newStreak.consecutiveMisses += 1;
          newStreak.consecutiveGoles = 0;
          newStreak.notifiedCaliente = false; // Reset opposite streak flag
          if (prev.settings.isManoFriaEnabled && newStreak.consecutiveMisses >= prev.settings.manoFriaThreshold && !newStreak.notifiedFria) {
            triggeredNotification = { type: 'fria', playerNumber };
            newStreak.notifiedFria = true; // Mark as notified for this streak
          }
        }
        
        // Show notification after a brief delay
        if (triggeredNotification) {
            setTimeout(() => setNotificationPopup(triggeredNotification), 200);
        }

        return {
            ...prev,
            shots: [...prev.shots, newShot],
            playerStreaks: { ...prev.playerStreaks, [playerNumber]: newStreak }
        };
      });
      
      setRedoStack([]); // Clear redo stack on new action
      setPendingShotPosition(null);
    }
  }, [pendingShotPosition, gameState.currentPlayer, gameState.currentPeriod, gameState.settings, gameState.playerStreaks]);
  
  const handleStartEditingName = useCallback(() => {
    if (!gameState.currentPlayer || gameState.currentPlayer === 'Todos') return;
    setTempPlayerName(gameState.playerNames[gameState.currentPlayer] || '');
    setIsEditingName(true);
  }, [gameState.currentPlayer, gameState.playerNames]);

  const handleCancelEditingName = useCallback(() => {
    setIsEditingName(false);
    setTempPlayerName('');
  }, []);

  const handleSavePlayerName = useCallback(() => {
    if (!gameState.currentPlayer || gameState.currentPlayer === 'Todos') return;
    setGameState(prev => ({
      ...prev,
      playerNames: { ...prev.playerNames, [gameState.currentPlayer]: tempPlayerName.trim() }
    }));
    setIsEditingName(false);
    setTempPlayerName('');
  }, [gameState.currentPlayer, tempPlayerName]);
  
  const handleUndo = useCallback(() => {
    if (gameState.shots.length === 0) return;
    
    const lastShot = gameState.shots[gameState.shots.length - 1];
    setRedoStack(prev => [...prev, lastShot]);
    setGameState(prev => ({
        ...prev,
        shots: prev.shots.slice(0, -1)
    }));
    // Note: This simple undo does not revert the streak counters for simplicity.
  }, [gameState.shots]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;

    const shotToRedo = redoStack[redoStack.length - 1];
    setGameState(prev => ({
        ...prev,
        shots: [...prev.shots, shotToRedo]
    }));
    setRedoStack(prev => prev.slice(0, -1));
    // Note: This simple redo does not re-apply streak logic for simplicity.
  }, [redoStack]);
  
  const handleRequestClearSheet = useCallback(() => {
    if (gameState.shots.length > 0) {
      setIsClearSheetModalOpen(true);
    }
  }, [gameState.shots.length]);

  const handleConfirmClearSheet = useCallback(() => {
    setGameState(prev => ({...prev, shots: [], playerStreaks: {}}));
    setRedoStack([]);
    setIsClearSheetModalOpen(false);
  }, []);

  const handleCancelClearSheet = useCallback(() => setIsClearSheetModalOpen(false), []);

  const handleCancelShot = useCallback(() => setPendingShotPosition(null), []);

  const handleRequestNewGame = useCallback(() => {
      setIsSettingsModalOpen(false);
      setIsNewGameConfirmOpen(true);
  }, []);
  
  const handleConfirmNewGame = useCallback(() => {
      localStorage.removeItem(GAME_STATE_STORAGE_KEY);
      setGameState(initialGameState);
      setRedoStack([]);
      setIsNewGameConfirmOpen(false);
  }, []);

  const handleCancelNewGame = useCallback(() => setIsNewGameConfirmOpen(false), []);

  const handleRequestReselectPlayers = useCallback(() => {
    setIsSettingsModalOpen(false);
    setIsReselectConfirmOpen(true);
  }, []);

  const handleConfirmReselectPlayers = useCallback(() => {
    setGameState(prev => ({
        ...prev,
        isSetupComplete: false
    }));
    setRedoStack([]); // Clear redo stack to avoid confusion
    setIsReselectConfirmOpen(false);
  }, []);
  
  const handleCancelReselectPlayers = useCallback(() => setIsReselectConfirmOpen(false), []);


  const handleDownloadHeatmap = useCallback(() => {
    if (heatmapCourtRef.current && typeof html2canvas === 'function') {
      html2canvas(heatmapCourtRef.current, {
        backgroundColor: null, // Let html2canvas use the element's background
        useCORS: true,
      }).then((canvas: HTMLCanvasElement) => {
        const link = document.createElement('a');
        link.download = `cestoball-mapa-calor-${heatmapPlayer.replace(' ', '_')}-${heatmapFilter}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  }, [heatmapPlayer, heatmapFilter]);
  
  const handleSettingsChange = useCallback((newSettings: Settings) => {
    setGameState(prev => {
      const calienteThresholdChanged = newSettings.manoCalienteThreshold !== prev.settings.manoCalienteThreshold;
      const friaThresholdChanged = newSettings.manoFriaThreshold !== prev.settings.manoFriaThreshold;

      return {
        ...prev,
        settings: newSettings,
        // Reset streaks if thresholds change to apply new rules cleanly
        playerStreaks: (calienteThresholdChanged || friaThresholdChanged) ? {} : prev.playerStreaks,
      };
    });
  }, []);

  // --- MEMOIZED DERIVED STATE ---
  const filteredLoggerTabShots = useMemo(() => {
    return gameState.shots.filter(shot => shot.period === gameState.currentPeriod);
  }, [gameState.shots, gameState.currentPeriod]);

  const filteredHeatmapShots = useMemo(() => {
    return gameState.shots.filter(shot => {
      const playerMatch = heatmapPlayer === 'Todos' || shot.playerNumber === heatmapPlayer;
      if (!playerMatch) return false;
      
      const periodMatch = mapPeriodFilter === 'all' || shot.period === mapPeriodFilter;
      if (!periodMatch) return false;

      switch (heatmapFilter) {
        case 'goles': return shot.isGol;
        case 'misses': return !shot.isGol;
        case 'all':
        default: return true;
      }
    });
  }, [gameState.shots, heatmapPlayer, heatmapFilter, mapPeriodFilter]);
  
  const filteredShotmapShots = useMemo(() => {
    return gameState.shots.filter(shot => {
        const playerMatch = shotmapPlayer === 'Todos' || shot.playerNumber === shotmapPlayer;
        const periodMatch = mapPeriodFilter === 'all' || shot.period === mapPeriodFilter;
        
        const resultMap = { 'all': true, 'goles': shot.isGol, 'misses': !shot.isGol };
        const resultMatch = resultMap[shotmapResultFilter];

        return playerMatch && periodMatch && resultMatch;
    });
  }, [gameState.shots, shotmapPlayer, mapPeriodFilter, shotmapResultFilter]);

  const playerStats = useMemo<PlayerStats[]>(() => {
    const statsMap = new Map<string, { totalShots: number; totalGoles: number; totalPoints: number }>();

    gameState.shots.forEach(shot => {
      const pStats = statsMap.get(shot.playerNumber) || { totalShots: 0, totalGoles: 0, totalPoints: 0 };
      pStats.totalShots += 1;
      if (shot.isGol) {
        pStats.totalGoles += 1;
        pStats.totalPoints += shot.golValue;
      }
      statsMap.set(shot.playerNumber, pStats);
    });

    return Array.from(statsMap.entries()).map(([playerNumber, data]) => ({
      playerNumber,
      ...data,
      golPercentage: data.totalShots > 0 ? (data.totalGoles / data.totalShots) * 100 : 0,
    }));
  }, [gameState.shots]);
  
  const tabTranslations: {[key in AppTab]: string} = { logger: 'Registro', heatmap: 'Mapa de Calor', shotmap: 'Mapa de Tiros', statistics: 'Estadísticas' };
  const periodTranslations: {[key in GamePeriod]: string} = { 'First Half': 'Primer Tiempo', 'Second Half': 'Segundo Tiempo' };
  const { shots, isSetupComplete, availablePlayers, playerNames, currentPlayer, currentPeriod, settings } = gameState;

  const getFilterButtonClass = (isActive: boolean) =>
    `flex-1 font-bold py-2 px-3 rounded-md transition-colors text-sm sm:text-base ${
      isActive ? 'bg-cyan-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600/50'
    }`;

  // --- RENDER ---
  if (!isSetupComplete) {
    return <PlayerSetup 
              onSetupComplete={handleSetupComplete} 
              initialSelectedPlayers={availablePlayers}
              initialSettings={settings}
            />;
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans">
      <div className="w-full max-w-4xl flex-grow">
        <header className="relative text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400 tracking-tight">Cesto Tracker 🏐</h1>
          <p className="text-lg text-gray-400 mt-2">
            {activeTab === 'logger' && 'Registra tiros o cambia de pestaña para analizar.'}
            {activeTab === 'heatmap' && 'Analiza la densidad de tiros de un jugador.'}
            {activeTab === 'shotmap' && 'Visualiza la ubicación de cada tiro en la cancha.'}
            {activeTab === 'statistics' && 'Revisa el rendimiento de los jugadores.'}
          </p>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="absolute top-0 right-0 p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
            aria-label="Abrir configuración"
            title="Abrir configuración"
          >
            <GearIcon className="h-7 w-7" />
          </button>
        </header>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8 border-b-2 border-gray-700">
          {(['logger', 'heatmap', 'shotmap', 'statistics'] as AppTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-6 py-3 text-base sm:text-lg font-bold capitalize transition-colors duration-300 focus:outline-none ${
                activeTab === tab
                  ? 'border-b-4 border-cyan-500 text-cyan-400'
                  : 'text-gray-500 hover:text-cyan-400'
              }`}
            >
              {tabTranslations[tab]}
            </button>
          ))}
        </div>

        <main className="flex flex-col gap-6">
          {activeTab === 'logger' && (
            <>
              {/* Player Control Panel */}
              <div className="w-full bg-gray-800 p-4 rounded-lg shadow-lg">
                <div className="flex flex-col items-center">
                  <div className="flex justify-center items-center gap-2 mb-2" style={{ minHeight: '40px' }}>
                    {isEditingName ? (
                      <div className="flex items-center gap-2">
                          <input
                              type="text"
                              value={tempPlayerName}
                              onChange={(e) => setTempPlayerName(e.target.value)}
                              onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSavePlayerName();
                                  if (e.key === 'Escape') handleCancelEditingName();
                              }}
                              autoFocus
                              className="bg-gray-700 border border-gray-600 text-white text-xl rounded-lg focus:ring-cyan-500 focus:border-cyan-500 p-2"
                              placeholder={`Nombre para #${currentPlayer}`}
                          />
                          <button onClick={handleSavePlayerName} className="p-2 rounded-full bg-green-600 hover:bg-green-700 text-white transition-colors" title="Guardar nombre" aria-label="Guardar nombre">
                             <CheckIcon className="h-5 w-5" />
                          </button>
                          <button onClick={handleCancelEditingName} className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors" title="Cancelar edición" aria-label="Cancelar edición">
                             <XIcon className="h-5 w-5" />
                          </button>
                      </div>
                    ) : (
                      <button
                          onClick={handleStartEditingName}
                          disabled={!currentPlayer || currentPlayer === 'Todos'}
                          className="group text-2xl font-bold text-cyan-400 text-center disabled:opacity-50 disabled:cursor-not-allowed p-2 -m-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                          title="Editar nombre del jugador"
                          aria-label="Editar nombre del jugador"
                      >
                          <span className="group-hover:underline decoration-dotted underline-offset-4">
                             {playerNames[currentPlayer] ? `${playerNames[currentPlayer]} (#${currentPlayer})` : `Jugador #${currentPlayer}`}
                          </span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 text-center mb-3">Haz clic en el nombre para personalizarlo.</p>
                  <PlayerSelector currentPlayer={currentPlayer} setCurrentPlayer={(p) => setGameState(prev => ({...prev, currentPlayer: p}))} playerNames={playerNames} availablePlayers={availablePlayers} />
                </div>
              </div>

              {/* Court & Action Buttons */}
              <div className="w-full flex flex-col gap-4">
                <Court
                  shots={filteredLoggerTabShots}
                  onCourtClick={handleCourtClick}
                  showShotMarkers={true}
                  currentPlayer={currentPlayer}
                />
                <div className="flex justify-center gap-4 mt-2">
                    <button
                        onClick={handleUndo}
                        disabled={shots.length === 0}
                        className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-yellow-500 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        aria-label="Deshacer último tiro"
                    >
                        <UndoIcon className="h-5 w-5" />
                        <span className="hidden sm:inline">Deshacer</span>
                    </button>
                    <button
                        onClick={handleRedo}
                        disabled={redoStack.length === 0}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        aria-label="Rehacer último tiro"
                    >
                        <RedoIcon className="h-5 w-5" />
                        <span className="hidden sm:inline">Rehacer</span>
                    </button>
                    <button
                        onClick={handleRequestClearSheet}
                        disabled={shots.length === 0}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        aria-label="Limpiar planilla"
                        title="Limpiar planilla"
                    >
                        <TrashIcon className="h-5 w-5" />
                        <span className="hidden sm:inline">Limpiar Planilla</span>
                    </button>
                </div>
              </div>

              {/* Period Controls */}
              <div className="w-full bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col items-center">
                  <h2 className="text-xl font-bold text-cyan-400 mb-2 text-center">Sesión Actual</h2>
                  <select
                      id="period-selector"
                      value={currentPeriod}
                      onChange={(e) => setGameState(prev => ({...prev, currentPeriod: e.target.value as GamePeriod}))}
                      className="w-full max-w-xs bg-gray-700 border border-gray-600 text-white text-lg rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5"
                  >
                    {(['First Half', 'Second Half'] as GamePeriod[]).map((period) => (
                      <option key={period} value={period}>
                        {periodTranslations[period]}
                      </option>
                    ))}
                  </select>
              </div>
              
              {/* Player Performance */}
              <div className="w-full">
                <ShotLog shots={shots} stats={playerStats} playerNames={playerNames}/>
              </div>
            </>
          )}
          
          {activeTab === 'shotmap' && (
             <div className="flex flex-col gap-8">
                {/* Shotmap Player Selector */}
                <div className="w-full bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
                   <h2 className="text-2xl font-bold mb-4 text-cyan-400 text-center">Seleccionar Jugador</h2>
                  <PlayerSelector currentPlayer={shotmapPlayer} setCurrentPlayer={setShotmapPlayer} showAllPlayersOption={true} playerNames={playerNames} availablePlayers={availablePlayers} />
                </div>

                {/* Court for Shotmap */}
                <div className="w-full">
                  <Court shots={filteredShotmapShots} showShotMarkers={true} />
                </div>

                {/* Filters container */}
                <div className="w-full bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg flex flex-col sm:flex-row gap-8 justify-center">
                    {/* Result Filter */}
                    <div className="flex-1">
                        <h3 className="text-xl font-bold mb-4 text-cyan-400 text-center">Filtrar Resultado</h3>
                        <div className="flex justify-center bg-gray-700 p-1 rounded-lg w-full max-w-xs mx-auto">
                            <button onClick={() => setShotmapResultFilter('all')} className={getFilterButtonClass(shotmapResultFilter === 'all')}>Todos</button>
                            <button onClick={() => setShotmapResultFilter('goles')} className={getFilterButtonClass(shotmapResultFilter === 'goles')}>Goles</button>
                            <button onClick={() => setShotmapResultFilter('misses')} className={getFilterButtonClass(shotmapResultFilter === 'misses')}>Fallos</button>
                        </div>
                    </div>
                    {/* Period Filter */}
                    <div className="flex-1">
                         <h3 className="text-xl font-bold mb-4 text-cyan-400 text-center">Filtrar por Período</h3>
                         <div className="flex justify-center bg-gray-700 p-1 rounded-lg w-full max-w-xs mx-auto">
                            <button onClick={() => setMapPeriodFilter('all')} className={getFilterButtonClass(mapPeriodFilter === 'all')}>Ambos</button>
                            <button onClick={() => setMapPeriodFilter('First Half')} className={getFilterButtonClass(mapPeriodFilter === 'First Half')}>{periodTranslations['First Half']}</button>
                            <button onClick={() => setMapPeriodFilter('Second Half')} className={getFilterButtonClass(mapPeriodFilter === 'Second Half')}>{periodTranslations['Second Half']}</button>
                         </div>
                    </div>
                </div>
             </div>
          )}

          {activeTab === 'heatmap' && (
            <div className="flex flex-col gap-8">
                {/* Heatmap Player Selector */}
                <div className="w-full bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
                   <h2 className="text-2xl font-bold mb-4 text-cyan-400 text-center">Seleccionar Jugador</h2>
                  <PlayerSelector currentPlayer={heatmapPlayer} setCurrentPlayer={setHeatmapPlayer} showAllPlayersOption={true} playerNames={playerNames} availablePlayers={availablePlayers} />
                </div>
                
                {/* Court for Heatmap */}
                <div ref={heatmapCourtRef} className="w-full">
                  <Court shots={[]} showShotMarkers={false}>
                    <HeatmapOverlay shots={filteredHeatmapShots} filter={heatmapFilter} />
                  </Court>
                </div>
              
                {/* Filters container */}
                <div className="w-full bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
                    <div className="flex flex-col sm:flex-row gap-8 justify-center">
                        {/* Result Filter */}
                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-4 text-cyan-400 text-center">Filtrar Resultado</h3>
                            <div className="flex justify-center bg-gray-700 p-1 rounded-lg w-full max-w-xs mx-auto">
                                <button onClick={() => setHeatmapFilter('all')} className={getFilterButtonClass(heatmapFilter === 'all')}>Todos</button>
                                <button onClick={() => setHeatmapFilter('goles')} className={getFilterButtonClass(heatmapFilter === 'goles')}>Goles</button>
                                <button onClick={() => setHeatmapFilter('misses')} className={getFilterButtonClass(heatmapFilter === 'misses')}>Fallos</button>
                            </div>
                        </div>
                        {/* Period Filter */}
                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-4 text-cyan-400 text-center">Filtrar por Período</h3>
                            <div className="flex justify-center bg-gray-700 p-1 rounded-lg w-full max-w-xs mx-auto">
                                <button onClick={() => setMapPeriodFilter('all')} className={getFilterButtonClass(mapPeriodFilter === 'all')}>Ambos</button>
                                <button onClick={() => setMapPeriodFilter('First Half')} className={getFilterButtonClass(mapPeriodFilter === 'First Half')}>{periodTranslations['First Half']}</button>
                                <button onClick={() => setMapPeriodFilter('Second Half')} className={getFilterButtonClass(mapPeriodFilter === 'Second Half')}>{periodTranslations['Second Half']}</button>
                            </div>
                        </div>
                    </div>
                    {/* Download Button */}
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleDownloadHeatmap}
                            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
                            aria-label="Descargar mapa de calor como imagen"
                        >
                            <DownloadIcon className="h-4 w-4 sm:h-5 sm:w-5"/>
                            <span>Descargar</span>
                        </button>
                    </div>
                </div>
            </div>
          )}

          {activeTab === 'statistics' && (
            <StatisticsView stats={playerStats} playerNames={playerNames} />
          )}
        </main>
      </div>
      
      <footer className="w-full text-center text-gray-500 text-xs mt-8 pb-4">
        Santiago Greco - Gresolutions © 2025
      </footer>
      
      {isSettingsModalOpen && (
        <SettingsModal 
            settings={settings}
            setSettings={handleSettingsChange}
            onClose={() => setIsSettingsModalOpen(false)}
            onRequestNewGame={handleRequestNewGame}
            onRequestReselectPlayers={handleRequestReselectPlayers}
        />
      )}

      {pendingShotPosition && (
        <OutcomeModal onOutcomeSelect={handleOutcomeSelection} onClose={handleCancelShot} />
      )}
      
      {isClearSheetModalOpen && (
        <ConfirmationModal
            title="Limpiar Planilla"
            message="¿Estás seguro de que quieres borrar todos los tiros registrados? Esta acción no se puede deshacer."
            confirmText="Sí, borrar todo"
            cancelText="Cancelar"
            onConfirm={handleConfirmClearSheet}
            onClose={handleCancelClearSheet}
            confirmButtonColor="bg-red-600 hover:bg-red-700 focus:ring-red-500"
        />
      )}

      {isNewGameConfirmOpen && (
        <ConfirmationModal
            title="Comenzar Nuevo Partido"
            message="¿Estás seguro? Todos los datos del partido actual se perderán y no se podrán recuperar."
            confirmText="Sí, empezar de nuevo"
            cancelText="Cancelar"
            onConfirm={handleConfirmNewGame}
            onClose={handleCancelNewGame}
            confirmButtonColor="bg-red-600 hover:bg-red-700 focus:ring-red-500"
        />
      )}

      {isReselectConfirmOpen && (
        <ConfirmationModal
          title="Volver a Selección de Jugadores"
          message="¿Estás seguro? Volverás a la pantalla de selección para añadir o quitar jugadores. Los tiros ya registrados no se perderán."
          confirmText="Sí, volver"
          cancelText="Cancelar"
          onConfirm={handleConfirmReselectPlayers}
          onClose={handleCancelReselectPlayers}
          confirmButtonColor="bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500"
        />
      )}
      
      {notificationPopup && (
        <NotificationPopup
            type={notificationPopup.type}
            playerNumber={notificationPopup.playerNumber}
            playerName={playerNames[notificationPopup.playerNumber] || ''}
            threshold={notificationPopup.type === 'caliente' ? settings.manoCalienteThreshold : settings.manoFriaThreshold}
            onClose={() => setNotificationPopup(null)}
        />
      )}

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
}

export default App;
