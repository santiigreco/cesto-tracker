
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ShotPosition, GamePeriod, AppTab, HeatmapFilter, MapPeriodFilter, Settings, StatAction, SavedTeam } from './types';
import { PERIOD_NAMES, STAT_LABELS } from './constants';
import { useGameContext, initialGameState } from './context/GameContext';
import { useGameLogic } from './hooks/useGameLogic';
import { useSupabaseSync } from './hooks/useSupabaseSync';
import { supabase } from './utils/supabaseClient';
import { User } from '@supabase/supabase-js';

// Components
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
import SubstitutionModal from './components/SubstitutionModal';
import SwitchIcon from './components/SwitchIcon';
import LoadGameModal from './components/LoadGameModal';
import Loader from './components/Loader';
import SaveGameModal from './components/SaveGameModal';
import PlayerSelectionModal from './components/PlayerSelectionModal';
import ChevronDownIcon from './components/ChevronDownIcon';
import GameLogView from './components/GameLogView';
import QuickActionsPanel from './components/QuickActionsPanel';
import StatsTallyView from './components/StatsTallyView';
import ShareModal from './components/ShareModal';
import BottomNavigation from './components/BottomNavigation';
import TeamRosterModal from './components/TeamRosterModal';

function App() {
  // --- AUTH STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // --- STATE FROM CONTEXT & HOOKS ---
  const { gameState, setGameState, redoStack } = useGameContext();
  const { 
      notificationPopup, setNotificationPopup,
      handleSetupComplete, handlePlayerChange, handleSubstitution, updatePlayerName,
      handleUpdateTallyStat, handleUndoTally, handleRedoTally,
      handleOutcomeSelection, handleUndoShot, handleRedoShot, handleClearSheet,
      handleConfirmNewGame
  } = useGameLogic();
  
  const { 
      syncState, setSyncState, isLoading: isAppLoading, 
      handleSyncToSupabase, handleLoadGame 
  } = useSupabaseSync();

  // --- LOCAL UI STATE ---
  const [pendingShotPosition, setPendingShotPosition] = useState<ShotPosition | null>(null);
  
  // Modal States
  const [isClearSheetModalOpen, setIsClearSheetModalOpen] = useState(false);
  const [isNewGameConfirmOpen, setIsNewGameConfirmOpen] = useState(false);
  const [isReturnHomeConfirmOpen, setIsReturnHomeConfirmOpen] = useState(false);
  const [isReselectConfirmOpen, setIsReselectConfirmOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>('logger');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSaveGameModalOpen, setIsSaveGameModalOpen] = useState(false);
  const [isSubstitutionModalOpen, setIsSubstitutionModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLoadGameModalOpen, setIsLoadGameModalOpen] = useState(false);
  const [isTeamManagerOpen, setIsTeamManagerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPlayerSelectionModalOpen, setIsPlayerSelectionModalOpen] = useState(false);
  
  // Header Player Name Editing (for Logger Mode)
  const [isEditingHeaderPlayer, setIsEditingHeaderPlayer] = useState(false);
  const [headerPlayerName, setHeaderPlayerName] = useState('');

  const [actionToAssign, setActionToAssign] = useState<StatAction | null>(null);
  const [isCorrectionsVisible, setIsCorrectionsVisible] = useState(false);

  // Analysis Tab State
  const [mapView, setMapView] = useState<'shotmap' | 'heatmap' | 'zonemap'>('heatmap');
  const [analysisPlayer, setAnalysisPlayer] = useState<string>('Todos');
  const [analysisResultFilter, setAnalysisResultFilter] = useState<HeatmapFilter>('all');
  const [analysisPeriodFilter, setAnalysisPeriodFilter] = useState<MapPeriodFilter>('all');

  // --- HANDLERS (UI Specific) ---
  const handleStartApp = useCallback(() => {
    setGameState(prev => ({ ...prev, hasSeenHomepage: true }));
  }, [setGameState]);

  const handleBackToHome = useCallback(() => {
      setGameState(prev => ({ ...initialGameState, hasSeenHomepage: false }));
  }, [setGameState]);

  const handleActionSelect = (action: StatAction) => {
      setActionToAssign(action);
      setIsPlayerSelectionModalOpen(true);
  };

  const handleAssignActionToPlayer = (playerNumber: string) => {
      if (actionToAssign) {
          handleUpdateTallyStat(playerNumber, actionToAssign, 1);
      }
      setIsPlayerSelectionModalOpen(false);
      setActionToAssign(null);
  };

  const handleCourtClick = useCallback((position: ShotPosition) => {
    if (gameState.isReadOnly) return;
    
    if (gameState.tutorialStep === 2) {
        setGameState(prev => ({ ...prev, tutorialStep: 3 }));
        return;
    }

    if (!gameState.currentPlayer.trim() || gameState.currentPlayer === 'Todos') {
      alert('Por favor, selecciona un jugador antes de marcar un tiro.');
      return;
    }
    setPendingShotPosition(position);
  }, [gameState.currentPlayer, gameState.tutorialStep, gameState.isReadOnly, setGameState]);

  const onOutcomeSelect = (isGol: boolean) => {
      if(pendingShotPosition) {
          handleOutcomeSelection(isGol, pendingShotPosition);
          setPendingShotPosition(null);
      }
  }

  // Header Editing logic
  const startEditingHeader = () => {
      if (gameState.isReadOnly) return;
      setHeaderPlayerName(gameState.playerNames[gameState.currentPlayer] || '');
      setIsEditingHeaderPlayer(true);
  };

  const saveHeaderPlayerName = () => {
      if (gameState.currentPlayer) {
          updatePlayerName(gameState.currentPlayer, headerPlayerName);
          setIsEditingHeaderPlayer(false);
      }
  };

  const cancelEditingHeader = () => {
      setIsEditingHeaderPlayer(false);
  };

  // Modals & Flows Wrappers
  const handleRequestClearSheet = useCallback(() => {
    if (gameState.shots.length > 0) setIsClearSheetModalOpen(true);
  }, [gameState.shots.length]);

  const handleConfirmClearSheet = useCallback(() => {
    handleClearSheet();
    setIsClearSheetModalOpen(false);
  }, [handleClearSheet]);

  const handleRequestNewGame = useCallback(() => {
      setIsSettingsModalOpen(false);
      setIsNewGameConfirmOpen(true);
  }, []);
  
  const handleConfirmNewGameWrapper = useCallback(() => {
      handleConfirmNewGame();
      setIsNewGameConfirmOpen(false);
  }, [handleConfirmNewGame]);

  const handleRequestReselectPlayers = useCallback(() => {
    setIsSettingsModalOpen(false);
    setIsReselectConfirmOpen(true);
  }, []);

  const handleConfirmReselectPlayers = useCallback(() => {
    setGameState(prev => ({ ...prev, isSetupComplete: false }));
    setIsReselectConfirmOpen(false);
  }, [setGameState]);
  
  const handleChangeMode = useCallback(() => {
    setGameState(prev => ({...prev, isSetupComplete: false, gameMode: null}));
    setIsSettingsModalOpen(false);
  }, [setGameState]);

  const handleRequestReturnHome = useCallback(() => {
    if (gameState.isSetupComplete) setIsReturnHomeConfirmOpen(true);
  }, [gameState.isSetupComplete]);

  const handleConfirmReturnHome = useCallback(() => {
      setGameState({ ...initialGameState, hasSeenHomepage: false, tutorialStep: 1 });
      setIsReturnHomeConfirmOpen(false);
  }, [setGameState]);
  
  const handleSettingsChange = useCallback((newSettings: Settings) => {
    setGameState(prev => ({ ...prev, settings: newSettings }));
  }, [setGameState]);
  
  const handleRequestSaveGame = useCallback(() => {
      setIsSettingsModalOpen(false);
      setIsSaveGameModalOpen(true);
      setSyncState({ status: 'idle', message: '' });
  }, [setSyncState]);

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
  
  // Handle team loaded from Home Page (TeamManager)
  const handleTeamLoadedFromHome = (team: SavedTeam) => {
      setIsTeamManagerOpen(false);
      
      const newNames: Record<string, string> = {};
      team.players.forEach(p => {
          if (p.name) newNames[p.number] = p.name;
      });
      
      const newAvailablePlayers = team.players.map(p => p.number);

      setGameState(prev => ({
          ...initialGameState,
          hasSeenHomepage: true, // Go to setup
          isSetupComplete: false,
          availablePlayers: newAvailablePlayers, // Pre-select these
          playerNames: newNames,
          settings: {
              ...initialGameState.settings,
              myTeam: team.name
          }
      }));
  };


  // --- COMPUTED VALUES ---
  const filteredLoggerTabShots = useMemo(() => {
    return gameState.shots.filter(shot => shot.period === gameState.currentPeriod);
  }, [gameState.shots, gameState.currentPeriod]);

  const playersWithShots = useMemo(() => 
    Array.from(new Set(gameState.shots.map(shot => shot.playerNumber))).sort((a, b) => Number(a) - Number(b)), 
    [gameState.shots]
  );
  
  const filteredAnalysisShots = useMemo(() => {
    return gameState.shots.filter(shot => {
      const playerMatch = analysisPlayer === 'Todos' || shot.playerNumber === analysisPlayer;
      if (!playerMatch) return false;
      const periodMatch = analysisPeriodFilter === 'all' || shot.period === analysisPeriodFilter;
      if (!periodMatch) return false;
      switch (analysisResultFilter) {
        case 'goles': return shot.isGol;
        case 'misses': return !shot.isGol;
        case 'all': default: return true;
      }
    });
  }, [gameState.shots, analysisPlayer, analysisResultFilter, analysisPeriodFilter]);

  const tabTranslations: {[key in AppTab]: string} = { 
    logger: gameState.gameMode === 'stats-tally' ? 'Anotador' : 'Registro de tiros',
    courtAnalysis: 'Análisis de Cancha', 
    statistics: 'Estadísticas', 
    faq: 'Preguntas Frecuentes',
  };

  const tabsForCurrentMode: AppTab[] = useMemo(() => {
    if (gameState.gameMode === 'shot-chart') return ['logger', 'courtAnalysis', 'statistics', 'faq'];
    if (gameState.gameMode === 'stats-tally') return ['logger', 'statistics', 'faq'];
    return [];
  }, [gameState.gameMode]);

  const { isSetupComplete, hasSeenHomepage, availablePlayers, activePlayers, playerNames, currentPlayer, currentPeriod, settings, tutorialStep, gameMode, gameLog, tallyRedoLog, isReadOnly } = gameState;
  const showTutorial = isSetupComplete && tutorialStep < 3 && gameMode === 'shot-chart';
  const playersForTally = useMemo(() => ['Equipo', ...availablePlayers], [availablePlayers]);

  // --- RENDER ---
  if (isAppLoading || authLoading) {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
            <Loader />
            <p className="text-slate-400 mt-4">Cargando...</p>
        </div>
    );
  } 
  
  if (!hasSeenHomepage) {
    return (
        <>
            <HomePage 
              onStart={handleStartApp} 
              onLoadGameClick={() => setIsLoadGameModalOpen(true)}
              onManageTeamsClick={() => setIsTeamManagerOpen(true)}
              user={user}
              onLogin={handleLogin}
            />
            {isLoadGameModalOpen && (
                <LoadGameModal 
                    onClose={() => setIsLoadGameModalOpen(false)} 
                    onLoadGame={async (id) => { 
                        setIsLoadGameModalOpen(false); 
                        await handleLoadGame(id); 
                        setActiveTab('statistics');
                    }} 
                    user={user}
                />
            )}
            {isTeamManagerOpen && (
                <TeamRosterModal
                    isOpen={isTeamManagerOpen}
                    onClose={() => setIsTeamManagerOpen(false)}
                    onLoadTeam={handleTeamLoadedFromHome}
                    currentSelection={{ name: '', players: [] }}
                />
            )}
        </>
    );
  } 
  
  if (!isSetupComplete || !gameMode) {
    return <PlayerSetup 
              onSetupComplete={handleSetupComplete} 
              onBack={handleBackToHome}
              initialSelectedPlayers={availablePlayers}
              initialSettings={settings}
              initialGameMode={gameMode}
            />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans bg-pattern-hoops pb-24 md:pb-8">
        <div className="w-full max-w-4xl flex-grow">
          {/* Read Only Banner */}
          {isReadOnly && (
            <div className="w-full bg-amber-600 text-white text-center py-2 px-4 rounded-lg mb-4 font-bold shadow-lg">
                ⚠️ Modo Lectura: Estás viendo un partido guardado. No se pueden hacer cambios.
            </div>
          )}

          <header className="relative flex items-center mb-4">
              <div className="flex-none w-12 md:w-0">
                  <button className="p-2 -ml-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors md:hidden" onClick={() => setIsMobileMenuOpen(true)} aria-label="Abrir menú">
                      <HamburgerIcon />
                  </button>
              </div>
              <div className="flex-grow text-center">
                  <h1 className="text-3xl sm:text-4xl font-bold text-cyan-400 tracking-tight whitespace-nowrap">
                      <button
                          onClick={handleRequestReturnHome}
                          className="transition-opacity hover:opacity-80 disabled:opacity-100 disabled:cursor-default"
                          disabled={!isSetupComplete}
                          title={isSetupComplete ? "Volver a la página de inicio" : ""}
                      >Cesto Tracker 🏐{'\uFE0F'}</button>
                  </h1>
                   {settings.gameName && <p className="text-lg font-semibold text-white -mb-1 mt-1 truncate">{settings.gameName}</p>}
                  <p className="text-base text-slate-400 mt-1">
                    {gameMode === 'stats-tally' ? 'Estadísticas y Tanteador' : 'Registro de Tiros y Mapa'}
                  </p>
              </div>
              <div className="flex-none w-12 flex justify-end">
                  <button
                      onClick={() => setIsSettingsModalOpen(true)}
                      className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                      aria-label="Abrir configuración"
                  >
                      <GearIcon className="h-7 w-7" />
                  </button>
              </div>
          </header>

          {/* Tab Switcher - Desktop */}
          <div className="hidden md:flex justify-center mb-8 border-b-2 border-slate-700">
              {tabsForCurrentMode.map(tab => (
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
            {gameMode === 'stats-tally' && activeTab === 'logger' && (
              <>
                <div className="flex flex-col gap-6">
                    <Scoreboard />
                    
                    {!isReadOnly && <QuickActionsPanel onActionSelect={handleActionSelect} />}
                    
                    {!isReadOnly && (
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleUndoTally}
                                disabled={gameLog.length === 0}
                                className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-3 rounded-lg transition-transform hover:scale-105 disabled:bg-slate-600 disabled:opacity-50 disabled:transform-none"
                            >
                                <UndoIcon className="h-5 w-5" />
                                <span className="hidden sm:inline">Deshacer</span>
                            </button>
                            <button
                                onClick={handleRedoTally}
                                disabled={tallyRedoLog.length === 0}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg transition-transform hover:scale-105 disabled:bg-slate-600 disabled:opacity-50 disabled:transform-none"
                            >
                                <RedoIcon className="h-5 w-5" />
                                <span className="hidden sm:inline">Rehacer</span>
                            </button>
                        </div>
                    )}

                    <GameLogView log={gameLog} playerNames={playerNames} />
                    
                    <div className="bg-slate-800 rounded-lg shadow-lg">
                        <button
                          onClick={() => setIsCorrectionsVisible(prev => !prev)}
                          className="w-full flex justify-between items-center text-left p-4 font-bold text-xl text-cyan-400 hover:bg-slate-700/50 transition-colors rounded-lg"
                        >
                          <span>Planilla de Jugadores</span>
                          <ChevronDownIcon className={`h-6 w-6 text-slate-400 transition-transform duration-300 ${isCorrectionsVisible ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isCorrectionsVisible ? 'max-h-[8000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="p-4 border-t border-slate-700">
                                <StatsTallyView />
                            </div>
                        </div>
                    </div>
                    
                     <div className="w-full bg-slate-800 p-4 rounded-lg shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-xl font-bold text-cyan-400">Sesión Actual</h2>
                        <p className="text-sm text-slate-400">Estás viendo el {PERIOD_NAMES[currentPeriod]}</p>
                      </div>
                      <select
                          value={currentPeriod}
                          onChange={(e) => setGameState(prev => ({...prev, currentPeriod: e.target.value as GamePeriod}))}
                          className="w-full sm:w-auto bg-slate-700 border border-slate-600 text-white text-lg rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5"
                      >
                        {Object.entries(PERIOD_NAMES).map(([key, name]) => (
                          <option key={key} value={key}>{name}</option>
                        ))}
                      </select>
                    </div>
                </div>
              </>
            )}

            {activeTab === 'statistics' && (
              <div className="flex flex-col gap-8">
                <StatisticsView onShareClick={() => setIsShareModalOpen(true)} />
              </div>
            )}

            {activeTab === 'faq' && (
              <FaqView />
            )}

            {gameMode === 'shot-chart' && activeTab === 'logger' && (
              <>
                {showTutorial && <TutorialOverlay step={tutorialStep} />}
                
                {!isReadOnly && (
                    <div className={`w-full bg-slate-800 p-4 rounded-lg shadow-lg ${showTutorial && tutorialStep === 1 ? 'relative z-50' : ''}`}>
                    <div className="flex flex-col items-center">
                        {/* Header Player Editor UI */}
                        <div className="flex justify-center items-center gap-2 mb-2" style={{ minHeight: '40px' }}>
                        {isEditingHeaderPlayer && currentPlayer && currentPlayer !== 'Todos' ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={headerPlayerName}
                                    onChange={(e) => setHeaderPlayerName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveHeaderPlayerName();
                                        if (e.key === 'Escape') cancelEditingHeader();
                                    }}
                                    autoFocus
                                    className="bg-slate-700 border border-slate-600 text-white text-xl rounded-lg focus:ring-cyan-500 focus:border-cyan-500 p-2"
                                />
                                <button onClick={saveHeaderPlayerName} className="p-2 rounded-full bg-green-600 hover:bg-green-700 text-white"><CheckIcon className="h-5 w-5" /></button>
                                <button onClick={cancelEditingHeader} className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white"><XIcon className="h-5 w-5" /></button>
                            </div>
                        ) : (
                            <button
                                onClick={startEditingHeader}
                                disabled={!currentPlayer || currentPlayer === 'Todos'}
                                className="group text-2xl font-bold text-cyan-400 text-center disabled:opacity-50 disabled:cursor-not-allowed p-2 -m-2 rounded-lg hover:bg-slate-700/50 transition-colors"
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
                            availablePlayers={activePlayers}
                            isTutorialActive={showTutorial}
                        />
                        <div className="mt-4 border-t border-slate-700 w-full pt-4 flex justify-center">
                            <button
                                onClick={() => setIsSubstitutionModalOpen(true)}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-transform hover:scale-105"
                            >
                                <SwitchIcon className="h-5 w-5" />
                                <span>Cambio de Jugador</span>
                            </button>
                        </div>
                    </div>
                    </div>
                )}

                <div className={`w-full flex flex-col gap-4 ${showTutorial && tutorialStep === 2 ? 'relative z-50' : ''}`}>
                  <Court
                    shots={filteredLoggerTabShots}
                    onCourtClick={isReadOnly ? undefined : handleCourtClick}
                    showShotMarkers={true}
                    currentPlayer={currentPlayer}
                  />
                  {!isReadOnly && (
                    <div className="flex justify-center gap-4 mt-2">
                        <button onClick={handleUndoShot} disabled={gameState.shots.length === 0} className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-3 rounded-lg transition-transform hover:scale-105 disabled:bg-slate-600 disabled:opacity-50">
                            <UndoIcon className="h-5 w-5" />
                            <span className="hidden sm:inline">Deshacer</span>
                        </button>
                        <button onClick={handleRedoShot} disabled={redoStack.length === 0} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg transition-transform hover:scale-105 disabled:bg-slate-600 disabled:opacity-50">
                            <RedoIcon className="h-5 w-5" />
                            <span className="hidden sm:inline">Rehacer</span>
                        </button>
                        <button onClick={handleRequestClearSheet} disabled={gameState.shots.length === 0} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg transition-transform hover:scale-105 disabled:bg-slate-600 disabled:opacity-50">
                            <TrashIcon className="h-5 w-5" />
                            <span className="hidden sm:inline">Limpiar</span>
                        </button>
                    </div>
                  )}
                </div>
                
                <Scoreboard />
                <ShotLog shots={gameState.shots} playerNames={playerNames} />
              </>
            )}
            
            {gameMode === 'shot-chart' && activeTab === 'courtAnalysis' && (
              <div className="flex flex-col gap-8">
                  {/* Analysis filters & Chart rendering logic */}
                   <div className="w-full bg-slate-800 p-1.5 rounded-lg shadow-lg flex justify-center max-w-xl mx-auto">
                      <button onClick={() => setMapView('shotmap')} className={`flex-1 font-bold py-2 px-3 rounded-md transition-colors ${mapView === 'shotmap' ? 'bg-cyan-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'}`}>Mapa de Tiros</button>
                      <button onClick={() => setMapView('heatmap')} className={`flex-1 font-bold py-2 px-3 rounded-md transition-colors ${mapView === 'heatmap' ? 'bg-cyan-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'}`}>Mapa de Calor</button>
                      <button onClick={() => setMapView('zonemap')} className={`flex-1 font-bold py-2 px-3 rounded-md transition-colors ${mapView === 'zonemap' ? 'bg-cyan-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'}`}>Gráfico de Zonas</button>
                  </div>
                  
                  <div className="w-full bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-4 text-cyan-400 text-center">Seleccionar Jugador</h3>
                    <PlayerSelector currentPlayer={analysisPlayer} setCurrentPlayer={setAnalysisPlayer} showAllPlayersOption={true} playerNames={playerNames} availablePlayers={playersWithShots} />
                  </div>

                  <div className="w-full">
                    <Court
                      shots={mapView === 'shotmap' ? filteredAnalysisShots : []}
                      showShotMarkers={mapView === 'shotmap'}
                    >
                      {mapView === 'heatmap' && <HeatmapOverlay shots={filteredAnalysisShots} />}
                      {mapView === 'zonemap' && <ZoneChart shots={filteredAnalysisShots} />}
                    </Court>
                  </div>

                  {/* Filter Controls */}
                  <div className="w-full bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg flex flex-col sm:flex-row gap-8 justify-center">
                      <div className="flex-1">
                          <h3 className="text-xl font-bold mb-4 text-cyan-400 text-center">Filtrar Resultado</h3>
                          <div className="flex justify-center bg-slate-700 p-1 rounded-lg w-full max-w-xs mx-auto">
                              <button onClick={() => setAnalysisResultFilter('all')} className={`flex-1 py-1 rounded ${analysisResultFilter === 'all' ? 'bg-cyan-600 text-white' : 'text-slate-300'}`}>Todos</button>
                              <button onClick={() => setAnalysisResultFilter('goles')} className={`flex-1 py-1 rounded ${analysisResultFilter === 'goles' ? 'bg-cyan-600 text-white' : 'text-slate-300'}`}>Goles</button>
                              <button onClick={() => setAnalysisResultFilter('misses')} className={`flex-1 py-1 rounded ${analysisResultFilter === 'misses' ? 'bg-cyan-600 text-white' : 'text-slate-300'}`}>Fallos</button>
                          </div>
                      </div>
                      <div className="flex-1">
                          <h3 className="text-xl font-bold mb-4 text-cyan-400 text-center">Filtrar por Período</h3>
                          <div className="flex justify-center bg-slate-700 p-1 rounded-lg w-full max-w-xs mx-auto">
                               {['all', 'First Half', 'Second Half'].map(p => (
                                   <button key={p} onClick={() => setAnalysisPeriodFilter(p as any)} className={`flex-1 py-1 rounded ${analysisPeriodFilter === p ? 'bg-cyan-600 text-white' : 'text-slate-300'}`}>
                                       {p === 'all' ? 'Ambos' : PERIOD_NAMES[p as GamePeriod]}
                                   </button>
                               ))}
                          </div>
                      </div>
                  </div>
              </div>
            )}
          </main>
        </div>
        
        <footer className="w-full text-center text-slate-500 text-xs mt-8 pb-4">Santiago Greco - Gresolutions © 2026</footer>

        {/* --- MODALS --- */}
        <BottomNavigation activeTab={activeTab} onSelectTab={setActiveTab} gameMode={gameMode} />
        
        <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} activeTab={activeTab} onSelectTab={(tab) => { setActiveTab(tab); setIsMobileMenuOpen(false); }} onShare={handleShare} tabTranslations={tabTranslations} tabs={tabsForCurrentMode} />
        
        {isPlayerSelectionModalOpen && actionToAssign && (
            <PlayerSelectionModal isOpen={isPlayerSelectionModalOpen} onClose={() => { setIsPlayerSelectionModalOpen(false); setActionToAssign(null); }} onSelectPlayer={handleAssignActionToPlayer} players={playersForTally} playerNames={playerNames} actionLabel={STAT_LABELS[actionToAssign]} />
        )}

        {isLoadGameModalOpen && (
            <LoadGameModal 
                onClose={() => setIsLoadGameModalOpen(false)} 
                onLoadGame={async (id) => { 
                    setIsLoadGameModalOpen(false); 
                    await handleLoadGame(id); 
                    setActiveTab('statistics');
                }} 
                user={user}
            />
        )}

        {isSaveGameModalOpen && <SaveGameModal isOpen={isSaveGameModalOpen} onClose={() => setIsSaveGameModalOpen(false)} onSave={handleSyncToSupabase} syncState={syncState} initialGameName={gameState.settings.gameName} />}
        
        {isSettingsModalOpen && <SettingsModal 
            settings={settings} 
            setSettings={handleSettingsChange} 
            onClose={() => setIsSettingsModalOpen(false)} 
            onRequestNewGame={handleRequestNewGame} 
            onRequestReselectPlayers={handleRequestReselectPlayers} 
            onRequestChangeMode={handleChangeMode} 
            onRequestSaveGame={handleRequestSaveGame}
            user={user}
            onLogout={handleLogout}
        />}
        
        <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} gameState={gameState} playerStats={[]} />

        {isSubstitutionModalOpen && <SubstitutionModal isOpen={isSubstitutionModalOpen} onClose={() => setIsSubstitutionModalOpen(false)} onSubstitute={handleSubstitution} activePlayers={activePlayers} availablePlayers={availablePlayers} playerNames={playerNames} />}

        {pendingShotPosition && <OutcomeModal onOutcomeSelect={onOutcomeSelect} onClose={() => setPendingShotPosition(null)} />}
        
        {isClearSheetModalOpen && <ConfirmationModal title="Limpiar Planilla" message="¿Borrar todos los tiros?" confirmText="Sí, borrar" cancelText="Cancelar" onConfirm={handleConfirmClearSheet} onClose={() => setIsClearSheetModalOpen(false)} />}

        {isNewGameConfirmOpen && <ConfirmationModal title="Nuevo Partido" message="Se perderán los datos actuales." confirmText="Sí, nuevo partido" cancelText="Cancelar" onConfirm={handleConfirmNewGameWrapper} onClose={() => setIsNewGameConfirmOpen(false)} />}

        {isReturnHomeConfirmOpen && <ConfirmationModal title="Volver al Inicio" message="Se perderán los datos no guardados." confirmText="Volver" cancelText="Cancelar" onConfirm={handleConfirmReturnHome} onClose={() => setIsReturnHomeConfirmOpen(false)} />}

        {isReselectConfirmOpen && <ConfirmationModal title="Corregir Jugadores" message="Volver a selección de equipo." confirmText="Volver" cancelText="Cancelar" onConfirm={handleConfirmReselectPlayers} onClose={() => setIsReselectConfirmOpen(false)} confirmButtonColor="bg-yellow-600 hover:bg-yellow-700" />}
        
        {notificationPopup && <NotificationPopup type={notificationPopup.type} playerNumber={notificationPopup.playerNumber} playerName={playerNames[notificationPopup.playerNumber] || ''} threshold={notificationPopup.type === 'caliente' ? settings.manoCalienteThreshold : settings.manoFriaThreshold} onClose={() => setNotificationPopup(null)} />}
    </div>
  );
}

export default App;
