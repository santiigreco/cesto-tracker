import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Shot, ShotPosition, GamePeriod, AppTab, HeatmapFilter, PlayerStats, MapPeriodFilter, Settings, GameState, PlayerStreak } from './types';
import Court from './components/Court';
import ShotLog from './components/ShotLog';
import PlayerSelector from './components/PlayerSelector';
import OutcomeModal from './components/OutcomeModal';
import ConfirmationModal from './components/ConfirmationModal';
import StatisticsView from './components/StatisticsView';
import PlayerSetup from './components/PlayerSetup';
import SettingsModal from './components/SettingsModal';
import GearIcon from './components/GearIcon';
import NotificationPopup from './components/NotificationPopup';
import UndoIcon from './components/UndoIcon';
import RedoIcon from './components/RedoIcon';
import TrashIcon from './components/TrashIcon';
import CheckIcon from './components/CheckIcon';
import XIcon from './components/XIcon';
import HamburgerIcon from './components/HamburgerIcon';
import MobileMenu from './components/MobileMenu';
import TutorialOverlay from './components/TutorialOverlay';
import HomePage from './components/HomePage';
import ZoneChart from './components/ZoneChart';
import HeatmapOverlay from './components/HeatmapOverlay';
import Scoreboard from './components/Scoreboard';
import FaqView from './components/FaqView';


// TypeScript declaration for html2canvas global variable
declare const html2canvas: any;

const GAME_STATE_STORAGE_KEY = 'cestoTrackerGameState';

const initialGameState: GameState = {
    shots: [],
    isSetupComplete: false,
    hasSeenHomepage: false,
    availablePlayers: [],
    playerNames: {},
    currentPlayer: '',
    currentPeriod: 'First Half',
    settings: {
        isManoCalienteEnabled: true,
        manoCalienteThreshold: 5,
        isManoFriaEnabled: true,
        manoFriaThreshold: 5,
    },
    playerStreaks: {},
    tutorialStep: 1, // 1: Select Player, 2: Tap Court, 3: Done
};


interface NotificationInfo {
    type: 'caliente' | 'fria';
    playerNumber: string;
}

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
  const [isReturnHomeConfirmOpen, setIsReturnHomeConfirmOpen] = useState(false);
  const [isReselectConfirmOpen, setIsReselectConfirmOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>('logger');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [notificationPopup, setNotificationPopup] = useState<NotificationInfo | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempPlayerName, setTempPlayerName] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Analysis Tab State
  const [mapView, setMapView] = useState<'shotmap' | 'heatmap' | 'zonemap'>('heatmap');
  const [analysisPlayer, setAnalysisPlayer] = useState<string>('Todos');
  const [analysisResultFilter, setAnalysisResultFilter] = useState<HeatmapFilter>('all');
  const [analysisPeriodFilter, setAnalysisPeriodFilter] = useState<MapPeriodFilter>('all');


  // --- PERSISTENCE ---
  // Load state from localStorage on initial mount
  useEffect(() => {
    try {
      const savedStateJSON = localStorage.getItem(GAME_STATE_STORAGE_KEY);
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        
        // Migration from old hasSeenTutorial to new tutorialStep
        if (savedState.hasSeenTutorial === true && savedState.tutorialStep === undefined) {
            savedState.tutorialStep = 3; // 3 means completed
        } else if (savedState.hasSeenTutorial === false && savedState.tutorialStep === undefined) {
            savedState.tutorialStep = 1;
        }
        delete savedState.hasSeenTutorial;

        // Any saved state implies they have used the app. Don't show homepage.
        // New users will not have savedStateJSON and will get initial state.
        if (savedState.hasSeenHomepage === undefined) {
            savedState.hasSeenHomepage = true;
        }

        // Ensure settings from old saves get new defaults if they are missing
        const combinedSettings = { ...initialGameState.settings, ...savedState.settings };
        setGameState({ ...initialGameState, ...savedState, settings: combinedSettings });
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
  const handleStartApp = useCallback(() => {
    setGameState(prev => ({ ...prev, hasSeenHomepage: true }));
  }, []);
  
  const handleSetupComplete = useCallback((selectedPlayers: string[], newSettings: Settings) => {
    if (selectedPlayers.length < 6) {
        alert('Debes seleccionar al menos 6 jugadores.');
        return;
    }
    const sortedPlayers = selectedPlayers.sort((a,b) => Number(a) - Number(b));
    
    setGameState(prev => {
        // For the very first time (tutorial step 1), start with no player selected to guide the user.
        // Otherwise, maintain selection or default to the first player.
        const isFirstTimeSetup = !prev.isSetupComplete;
        const newCurrentPlayer = isFirstTimeSetup 
            ? '' // No player selected initially for the tutorial
            : (sortedPlayers.includes(prev.currentPlayer) ? prev.currentPlayer : sortedPlayers[0]);

        return {
            ...prev,
            availablePlayers: sortedPlayers,
            settings: newSettings,
            isSetupComplete: true,
            currentPlayer: newCurrentPlayer,
        };
    });
    
    // Reset filters if the selected player was removed
    setAnalysisPlayer(prevPlayer => sortedPlayers.includes(prevPlayer) || prevPlayer === 'Todos' ? prevPlayer : 'Todos');
  }, []);
  
  const handleCourtClick = useCallback((position: ShotPosition) => {
    // If tutorial is on step 2, tapping the court just completes the tutorial.
    if (gameState.tutorialStep === 2) {
        setGameState(prev => ({ ...prev, tutorialStep: 3 }));
        return;
    }

    if (!gameState.currentPlayer.trim() || gameState.currentPlayer === 'Todos') {
      alert('Por favor, selecciona un jugador antes de marcar un tiro.');
      return;
    }
    setPendingShotPosition(position);
  }, [gameState.currentPlayer, gameState.tutorialStep]);

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
        // --- Create the new state object ---
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

        const newState = {
            ...prev,
            shots: [...prev.shots, newShot],
            playerStreaks: { ...prev.playerStreaks, [playerNumber]: newStreak }
        };

        // If this is the very first shot being logged, the tutorial is now complete.
        if (prev.tutorialStep === 2) {
            newState.tutorialStep = 3;
        }

        return newState;
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
      setGameState(prev => ({
          ...initialGameState,
          hasSeenHomepage: true, // Keep homepage seen
          tutorialStep: prev.tutorialStep === 3 ? 3 : 1, // Keep tutorial completed if it was
      }));
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

  const handleRequestReturnHome = useCallback(() => {
    // Always confirm if a game is in progress
    if (gameState.isSetupComplete) {
      setIsReturnHomeConfirmOpen(true);
    }
  }, [gameState.isSetupComplete]);

  const handleConfirmReturnHome = useCallback(() => {
      // Reset state completely to show homepage and start fresh
      setGameState({ ...initialGameState, hasSeenHomepage: false, tutorialStep: 1 });
      setRedoStack([]);
      setIsReturnHomeConfirmOpen(false);
  }, []);

  const handleCancelReturnHome = useCallback(() => setIsReturnHomeConfirmOpen(false), []);
  
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
  
  const handleShare = async () => {
    const shareData = {
      title: 'Cesto Tracker App',
      text: '¡Prueba Cesto Tracker para registrar y analizar los tiros de Cestoball!',
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        navigator.clipboard.writeText(shareData.url);
        alert('Enlace de la app copiado al portapapeles.');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handlePlayerChange = useCallback((player: string) => {
    setGameState(prev => {
        const newState = {...prev, currentPlayer: player };
        if (prev.tutorialStep === 1) {
            newState.tutorialStep = 2;
        }
        return newState;
    })
  }, []);

  // --- MEMOIZED DERIVED STATE ---
  const filteredLoggerTabShots = useMemo(() => {
    return gameState.shots.filter(shot => shot.period === gameState.currentPeriod);
  }, [gameState.shots, gameState.currentPeriod]);

  const filteredAnalysisShots = useMemo(() => {
    return gameState.shots.filter(shot => {
      const playerMatch = analysisPlayer === 'Todos' || shot.playerNumber === analysisPlayer;
      if (!playerMatch) return false;
      
      const periodMatch = analysisPeriodFilter === 'all' || shot.period === analysisPeriodFilter;
      if (!periodMatch) return false;

      switch (analysisResultFilter) {
        case 'goles': return shot.isGol;
        case 'misses': return !shot.isGol;
        case 'all':
        default: return true;
      }
    });
  }, [gameState.shots, analysisPlayer, analysisResultFilter, analysisPeriodFilter]);

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
  
  const totalPoints = useMemo(() => {
    return playerStats.reduce((acc, player) => acc + player.totalPoints, 0);
  }, [playerStats]);

  const tabTranslations: {[key in AppTab]: string} = { 
    logger: 'Registro de tiros', 
    courtAnalysis: 'Análisis de Cancha', 
    statistics: 'Estadísticas', 
    faq: 'Preguntas Frecuentes',
  };
  const periodTranslations: {[key in GamePeriod]: string} = { 'First Half': 'Primer Tiempo', 'Second Half': 'Segundo Tiempo' };
  const { shots, isSetupComplete, hasSeenHomepage, availablePlayers, playerNames, currentPlayer, currentPeriod, settings, tutorialStep } = gameState;

  const getFilterButtonClass = (isActive: boolean) =>
    `flex-1 font-bold py-2 px-3 rounded-md transition-colors text-sm sm:text-base ${
      isActive ? 'bg-cyan-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'
    }`;

  const showTutorial = isSetupComplete && tutorialStep < 3;

  // --- RENDER ---
  if (!hasSeenHomepage) {
    return <HomePage onStart={handleStartApp} />;
  }

  if (!isSetupComplete) {
    return <PlayerSetup 
              onSetupComplete={handleSetupComplete} 
              initialSelectedPlayers={availablePlayers}
              initialSettings={settings}
            />;
  }
  
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans bg-pattern-hoops">
      <div className="w-full max-w-4xl flex-grow">
        <header className="relative flex items-center mb-6">
            <div className="flex-none w-12 md:w-0"> {/* Left side container */}
                 <button className="p-2 -ml-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors md:hidden" onClick={() => setIsMobileMenuOpen(true)} aria-label="Abrir menú">
                    <HamburgerIcon />
                 </button>
            </div>
            <div className="flex-grow text-center"> {/* Center container */}
                <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400 tracking-tight whitespace-nowrap">
                    <button
                        onClick={handleRequestReturnHome}
                        className="transition-opacity hover:opacity-80 disabled:opacity-100 disabled:cursor-default"
                        disabled={!isSetupComplete}
                        title={isSetupComplete ? "Volver a la página de inicio" : ""}
                    >Cesto Tracker 🏐{'\uFE0F'}</button>
                </h1>
                <p className="text-lg text-slate-400 mt-2">
                    {activeTab === 'logger' && 'Tocá en la cancha para registrar un tiro.'}
                    {activeTab === 'courtAnalysis' && 'Visualiza la ubicación y densidad de los tiros.'}
                    {activeTab === 'statistics' && 'Revisa el rendimiento de los jugadores.'}
                    {activeTab === 'faq' && 'Encontrá respuestas a las preguntas más comunes.'}
                </p>
            </div>
            <div className="flex-none w-12 flex justify-end"> {/* Right side container */}
                 <button
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                    aria-label="Abrir configuración"
                    title="Abrir configuración"
                >
                    <GearIcon className="h-7 w-7" />
                </button>
            </div>
        </header>

        {/* Tab Switcher - Desktop */}
        <div className="hidden md:flex justify-center mb-8 border-b-2 border-slate-700">
          {(['logger', 'courtAnalysis', 'statistics', 'faq'] as AppTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center px-4 sm:px-6 py-3 text-base sm:text-lg font-bold capitalize transition-colors duration-300 focus:outline-none ${
                activeTab === tab
                  ? 'border-b-4 border-cyan-500 text-cyan-400'
                  : 'text-slate-500 hover:text-cyan-400'
              }`}
            >
              {tabTranslations[tab]}
            </button>
          ))}
        </div>

        <main className="flex flex-col gap-6">
          {activeTab === 'logger' && (
            <>
              {showTutorial && (
                <TutorialOverlay step={tutorialStep} />
              )}
              
              {/* Player Control Panel */}
              <div className={`w-full bg-slate-800 p-4 rounded-lg shadow-lg ${showTutorial && tutorialStep === 1 ? 'relative z-50' : ''}`}>
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
                              className="bg-slate-700 border border-slate-600 text-white text-xl rounded-lg focus:ring-cyan-500 focus:border-cyan-500 p-2"
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
                          className="group text-2xl font-bold text-cyan-400 text-center disabled:opacity-50 disabled:cursor-not-allowed p-2 -m-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                          title="Editar nombre del jugador"
                          aria-label="Editar nombre del jugador"
                      >
                          <span className="group-hover:underline decoration-dotted underline-offset-4">
                             {playerNames[currentPlayer] ? `${playerNames[currentPlayer]} (#${currentPlayer})` : `Jugador #${currentPlayer}`}
                          </span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 text-center mb-3">Tocá en el nombre para personalizarlo.</p>
                  <PlayerSelector 
                    currentPlayer={currentPlayer} 
                    setCurrentPlayer={handlePlayerChange} 
                    playerNames={playerNames} 
                    availablePlayers={availablePlayers}
                    isTutorialActive={showTutorial}
                  />
                </div>
              </div>

              {/* Court & Action Buttons */}
              <div className={`w-full flex flex-col gap-4 ${showTutorial && tutorialStep === 2 ? 'relative z-50' : ''}`}>
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
                        className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-yellow-500 disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        aria-label="Deshacer último tiro"
                    >
                        <UndoIcon className="h-5 w-5" />
                        <span className="hidden sm:inline">Deshacer</span>
                    </button>
                    <button
                        onClick={handleRedo}
                        disabled={redoStack.length === 0}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500 disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        aria-label="Rehacer último tiro"
                    >
                        <RedoIcon className="h-5 w-5" />
                        <span className="hidden sm:inline">Rehacer</span>
                    </button>
                    <button
                        onClick={handleRequestClearSheet}
                        disabled={shots.length === 0}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-red-500 disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        aria-label="Limpiar planilla"
                        title="Limpiar planilla"
                    >
                        <TrashIcon className="h-5 w-5" />
                        <span className="hidden sm:inline">Limpiar Planilla</span>
                    </button>
                </div>
              </div>
              
              {/* Scoreboard */}
              <Scoreboard totalPoints={totalPoints} />

              {/* Period Controls */}
              <div className="w-full bg-slate-800 p-4 rounded-lg shadow-lg flex flex-col items-center">
                  <h2 className="text-xl font-bold text-cyan-400 mb-2 text-center">Sesión Actual</h2>
                  <select
                      id="period-selector"
                      value={currentPeriod}
                      onChange={(e) => setGameState(prev => ({...prev, currentPeriod: e.target.value as GamePeriod}))}
                      className="w-full max-w-xs bg-slate-700 border border-slate-600 text-white text-lg rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5"
                  >
                    {(['First Half', 'Second Half'] as GamePeriod[]).map((period) => (
                      <option key={period} value={period}>
                        {periodTranslations[period]}
                      </option>
                    ))}
                  </select>
              </div>

              {/* Chronological Shot Log */}
              <ShotLog shots={shots} playerNames={playerNames} />
            </>
          )}
          
          {activeTab === 'courtAnalysis' && (
             <div className="flex flex-col gap-8">
                {/* View Switcher */}
                <div className="w-full bg-slate-800 p-1.5 rounded-lg shadow-lg flex justify-center max-w-xl mx-auto">
                    <button onClick={() => setMapView('shotmap')} className={getFilterButtonClass(mapView === 'shotmap')}>Mapa de Tiros</button>
                    <button onClick={() => setMapView('heatmap')} className={getFilterButtonClass(mapView === 'heatmap')}>Mapa de Calor</button>
                    <button onClick={() => setMapView('zonemap')} className={getFilterButtonClass(mapView === 'zonemap')}>Gráfico de Zonas</button>
                </div>
                
                {/* Player Selector */}
                <div className="w-full bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
                   <h3 className="text-xl font-semibold mb-4 text-cyan-400 text-center">Seleccionar Jugador</h3>
                  <PlayerSelector currentPlayer={analysisPlayer} setCurrentPlayer={setAnalysisPlayer} showAllPlayersOption={true} playerNames={playerNames} availablePlayers={availablePlayers} />
                </div>

                {/* Court */}
                <div className="w-full">
                  <Court
                    shots={mapView === 'shotmap' ? filteredAnalysisShots : []}
                    showShotMarkers={mapView === 'shotmap'}
                  >
                    {mapView === 'heatmap' && <HeatmapOverlay shots={filteredAnalysisShots} />}
                    {mapView === 'zonemap' && <ZoneChart shots={filteredAnalysisShots} />}
                  </Court>
                </div>

                {/* Filters container */}
                <div className="w-full bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg flex flex-col sm:flex-row gap-8 justify-center">
                    {/* Result Filter */}
                    <div className="flex-1">
                        <h3 className="text-xl font-bold mb-4 text-cyan-400 text-center">Filtrar Resultado</h3>
                        <div className="flex justify-center bg-slate-700 p-1 rounded-lg w-full max-w-xs mx-auto">
                            <button onClick={() => setAnalysisResultFilter('all')} className={getFilterButtonClass(analysisResultFilter === 'all')}>Todos</button>
                            <button onClick={() => setAnalysisResultFilter('goles')} className={getFilterButtonClass(analysisResultFilter === 'goles')}>Goles</button>
                            <button onClick={() => setAnalysisResultFilter('misses')} className={getFilterButtonClass(analysisResultFilter === 'misses')}>Fallos</button>
                        </div>
                    </div>
                    {/* Period Filter */}
                    <div className="flex-1">
                         <h3 className="text-xl font-bold mb-4 text-cyan-400 text-center">Filtrar por Período</h3>
                         <div className="flex justify-center bg-slate-700 p-1 rounded-lg w-full max-w-xs mx-auto">
                            <button onClick={() => setAnalysisPeriodFilter('all')} className={getFilterButtonClass(analysisPeriodFilter === 'all')}>Ambos</button>
                            <button onClick={() => setAnalysisPeriodFilter('First Half')} className={getFilterButtonClass(analysisPeriodFilter === 'First Half')}>{periodTranslations['First Half']}</button>
                            <button onClick={() => setAnalysisPeriodFilter('Second Half')} className={getFilterButtonClass(analysisPeriodFilter === 'Second Half')}>{periodTranslations['Second Half']}</button>
                         </div>
                    </div>
                </div>
             </div>
          )}

          {activeTab === 'statistics' && (
            <div className="flex flex-col gap-8">
              <StatisticsView stats={playerStats} playerNames={playerNames} shots={shots} />
            </div>
          )}

          {activeTab === 'faq' && (
            <FaqView />
          )}

        </main>
      </div>
      
      <footer className="w-full text-center text-slate-500 text-xs mt-8 pb-4">
        Santiago Greco - Gresolutions © 2025
      </footer>
      
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => {
            setActiveTab(tab);
            setIsMobileMenuOpen(false);
        }}
        onShare={handleShare}
        tabTranslations={tabTranslations}
      />
      
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

      {isReturnHomeConfirmOpen && (
        <ConfirmationModal
          title="Volver a la Página de Inicio"
          message="¿Estás seguro? Todos los datos del partido actual se perderán y no se podrán recuperar."
          confirmText="Sí, volver al inicio"
          cancelText="Cancelar"
          onConfirm={handleConfirmReturnHome}
          onClose={handleCancelReturnHome}
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

    </div>
  );
}

export default App;