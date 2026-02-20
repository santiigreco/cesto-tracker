
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { ShotPosition, GamePeriod, AppTab, HeatmapFilter, MapPeriodFilter, Settings, StatAction, SavedTeam, GameEvent, RosterPlayer } from './types';
import { STAT_LABELS } from './constants';
import { useGameContext, initialGameState } from './context/GameContext';
import { useGameLogic } from './hooks/useGameLogic';
import { useSupabaseSync } from './hooks/useSupabaseSync';
import { supabase } from './utils/supabaseClient';

// Components
import Loader from './components/Loader';
import PlayerSetup from './components/PlayerSetup';
import HomePage from './components/HomePage';
import BottomNavigation from './components/BottomNavigation';
import LoadGameModal from './components/LoadGameModal';
import TeamRosterModal from './components/TeamRosterModal';

// New Architecture Components
import AppHeader from './components/AppHeader';
import AppModals from './components/AppModals';
import GameMainContent from './components/GameMainContent';

function App() {
  // --- AUTH STATE ---
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
        subscription.unsubscribe();
    };
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
      handleConfirmNewGame,
      handleDeleteGameEvent, handleEditGameEvent
  } = useGameLogic();
  
  const { 
      syncState, setSyncState, isLoading: isAppLoading, 
      handleSyncToSupabase, handleLoadGame,
      isAutoSaving, lastSaved
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
  const [editingEvent, setEditingEvent] = useState<GameEvent | null>(null);
  
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

  // Preloaded data from Home selection
  const [initialSetupData, setInitialSetupData] = useState<{
      teamName?: string;
      selectedPlayers?: string[];
      playerNames?: Record<string, string>;
  } | null>(null);

  // --- AUTO-SAVE LOGIC ---
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
      if (user && gameState.gameId && !gameState.isReadOnly) {
          if (autoSaveTimeoutRef.current) {
              clearTimeout(autoSaveTimeoutRef.current);
          }
          autoSaveTimeoutRef.current = setTimeout(() => {
              handleSyncToSupabase(gameState.settings.gameName || 'Partido sin nombre', true);
          }, 4000);
      }
      return () => {
          if (autoSaveTimeoutRef.current) {
              clearTimeout(autoSaveTimeoutRef.current);
          }
      };
  }, [
      gameState.shots, 
      gameState.tallyStats, 
      gameState.settings, 
      gameState.playerNames, 
      gameState.activePlayers, 
      user, 
      gameState.gameId, 
      gameState.isReadOnly,
      handleSyncToSupabase
  ]);


  // --- HANDLERS (UI Specific) ---
  const handleStartApp = useCallback((teamName?: string, roster?: RosterPlayer[]) => {
    if (teamName) {
        const players = roster ? roster.map(p => p.number) : [];
        const names = roster ? roster.reduce((acc, p) => ({ ...acc, [p.number]: p.name }), {} as Record<string, string>) : {};
        setInitialSetupData({
            teamName,
            selectedPlayers: players.length > 0 ? players : undefined,
            playerNames: names
        });
    } else {
        setInitialSetupData(null);
    }
    setGameState(prev => ({ ...prev, hasSeenHomepage: true }));
  }, [setGameState]);

  const handleBackToHome = useCallback(() => {
      setGameState(prev => ({ ...initialGameState, hasSeenHomepage: false }));
      setInitialSetupData(null);
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

    if (!gameState.currentPlayer || !gameState.currentPlayer.trim() || gameState.currentPlayer === 'Todos') {
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
    logger: 'Anotador',
    courtAnalysis: 'Análisis', 
    statistics: 'Estadísticas', 
    faq: 'Ayuda',
  };

  const tabsForCurrentMode: AppTab[] = useMemo(() => {
    if (gameState.gameMode === 'shot-chart') return ['logger', 'courtAnalysis', 'statistics', 'faq'];
    if (gameState.gameMode === 'stats-tally') return ['logger', 'statistics', 'faq'];
    return [];
  }, [gameState.gameMode]);

  const { isSetupComplete, hasSeenHomepage, availablePlayers, playerNames, currentPlayer, currentPeriod, settings, tutorialStep, gameMode, gameLog, tallyRedoLog, isReadOnly } = gameState;
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
              onLoadGame={handleLoadGame}
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
              initialSelectedPlayers={initialSetupData?.selectedPlayers || availablePlayers}
              initialSettings={{ ...settings, myTeam: initialSetupData?.teamName || settings.myTeam }}
              initialGameMode={gameMode}
              initialPlayerNames={initialSetupData?.playerNames}
            />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans bg-pattern-hoops pb-24 md:pb-8">
        <div className="w-full max-w-4xl flex-grow">
          
          <AppHeader 
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onRequestReturnHome={handleRequestReturnHome}
            isSetupComplete={isSetupComplete}
            gameName={settings.gameName}
            gameMode={gameMode}
            isAutoSaving={isAutoSaving}
            lastSaved={lastSaved}
            gameId={gameState.gameId}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            isReadOnly={isReadOnly}
          />

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

          <GameMainContent 
            gameMode={gameMode}
            activeTab={activeTab}
            isReadOnly={isReadOnly}
            
            // Tally Props
            onActionSelect={handleActionSelect}
            handleUndoTally={handleUndoTally}
            handleRedoTally={handleRedoTally}
            gameLog={gameLog}
            tallyRedoLog={tallyRedoLog}
            isCorrectionsVisible={isCorrectionsVisible}
            setIsCorrectionsVisible={setIsCorrectionsVisible}
            
            // Common Props
            playerNames={playerNames}
            currentPlayer={currentPlayer}
            currentPeriod={currentPeriod}
            setGameState={setGameState}
            setEditingEvent={setEditingEvent}
            
            // Statistics Props
            setIsShareModalOpen={setIsShareModalOpen}
            
            // Shot Chart Props
            showTutorial={showTutorial}
            tutorialStep={tutorialStep}
            isEditingHeaderPlayer={isEditingHeaderPlayer}
            headerPlayerName={headerPlayerName}
            setHeaderPlayerName={setHeaderPlayerName}
            saveHeaderPlayerName={saveHeaderPlayerName}
            cancelEditingHeader={cancelEditingHeader}
            startEditingHeader={startEditingHeader}
            handlePlayerChange={handlePlayerChange}
            activePlayers={gameState.activePlayers}
            setIsSubstitutionModalOpen={setIsSubstitutionModalOpen}
            filteredLoggerTabShots={filteredLoggerTabShots}
            handleCourtClick={handleCourtClick}
            handleUndoShot={handleUndoShot}
            handleRedoShot={handleRedoShot}
            redoStack={redoStack}
            handleRequestClearSheet={handleRequestClearSheet}
            shots={gameState.shots}
            
            // Analysis Props
            mapView={mapView}
            setMapView={setMapView}
            analysisPlayer={analysisPlayer}
            setAnalysisPlayer={setAnalysisPlayer}
            playersWithShots={playersWithShots}
            filteredAnalysisShots={filteredAnalysisShots}
            analysisResultFilter={analysisResultFilter}
            setAnalysisResultFilter={setAnalysisResultFilter}
            analysisPeriodFilter={analysisPeriodFilter}
            setAnalysisPeriodFilter={setAnalysisPeriodFilter}
          />
        </div>
        
        <footer className="w-full text-center text-slate-500 text-xs mt-8 pb-4">Santiago Greco - Gresolutions © 2026</footer>

        <BottomNavigation activeTab={activeTab} onSelectTab={setActiveTab} gameMode={gameMode} />
        
        <AppModals 
            activeTab={activeTab}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            isPlayerSelectionModalOpen={isPlayerSelectionModalOpen}
            setIsPlayerSelectionModalOpen={setIsPlayerSelectionModalOpen}
            isLoadGameModalOpen={isLoadGameModalOpen}
            setIsLoadGameModalOpen={setIsLoadGameModalOpen}
            isSaveGameModalOpen={isSaveGameModalOpen}
            setIsSaveGameModalOpen={setIsSaveGameModalOpen}
            isSettingsModalOpen={isSettingsModalOpen}
            setIsSettingsModalOpen={setIsSettingsModalOpen}
            isShareModalOpen={isShareModalOpen}
            setIsShareModalOpen={setIsShareModalOpen}
            isSubstitutionModalOpen={isSubstitutionModalOpen}
            setIsSubstitutionModalOpen={setIsSubstitutionModalOpen}
            isClearSheetModalOpen={isClearSheetModalOpen}
            setIsClearSheetModalOpen={setIsClearSheetModalOpen}
            isNewGameConfirmOpen={isNewGameConfirmOpen}
            setIsNewGameConfirmOpen={setIsNewGameConfirmOpen}
            isReturnHomeConfirmOpen={isReturnHomeConfirmOpen}
            setIsReturnHomeConfirmOpen={setIsReturnHomeConfirmOpen}
            isReselectConfirmOpen={isReselectConfirmOpen}
            setIsReselectConfirmOpen={setIsReselectConfirmOpen}
            isTeamManagerOpen={isTeamManagerOpen}
            setIsTeamManagerOpen={setIsTeamManagerOpen}
            
            onSelectTab={setActiveTab}
            onShare={handleShare}
            tabTranslations={tabTranslations}
            tabs={tabsForCurrentMode}
            
            actionToAssign={actionToAssign}
            setActionToAssign={setActionToAssign}
            handleAssignActionToPlayer={handleAssignActionToPlayer}
            playersForTally={playersForTally}
            playerNames={playerNames}
            actionLabel={actionToAssign ? STAT_LABELS[actionToAssign] : ''}
            
            handleLoadGame={handleLoadGame}
            user={user}
            
            handleSyncToSupabase={handleSyncToSupabase}
            syncState={syncState}
            gameName={gameState.settings.gameName}
            
            settings={settings}
            handleSettingsChange={handleSettingsChange}
            handleRequestNewGame={handleRequestNewGame}
            handleRequestReselectPlayers={handleRequestReselectPlayers}
            handleChangeMode={handleChangeMode}
            handleRequestSaveGame={handleRequestSaveGame}
            handleLogout={handleLogout}
            handleLogin={handleLogin}
            
            gameState={gameState}
            
            handleSubstitution={handleSubstitution}
            activePlayers={gameState.activePlayers}
            availablePlayers={availablePlayers}
            
            pendingShotPosition={pendingShotPosition}
            setPendingShotPosition={setPendingShotPosition}
            onOutcomeSelect={onOutcomeSelect}
            
            handleConfirmClearSheet={handleConfirmClearSheet}
            handleConfirmNewGameWrapper={handleConfirmNewGameWrapper}
            handleConfirmReturnHome={handleConfirmReturnHome}
            handleConfirmReselectPlayers={handleConfirmReselectPlayers}
            
            notificationPopup={notificationPopup}
            setNotificationPopup={setNotificationPopup}
            
            editingEvent={editingEvent}
            setEditingEvent={setEditingEvent}
            handleEditGameEvent={handleEditGameEvent}
            handleDeleteGameEvent={handleDeleteGameEvent}
            
            handleTeamLoadedFromHome={handleTeamLoadedFromHome}
            setActiveTab={setActiveTab}
        />
    </div>
  );
}

export default App;
