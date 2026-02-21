
import React, { useCallback, useMemo, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate, Outlet } from 'react-router-dom';
import { ShotPosition, AppTab, Settings, StatAction, SavedTeam, RosterPlayer, GameMode } from './types';
import { STAT_LABELS } from './constants';
import { useGameContext, initialGameState } from './context/GameContext';
import { useGameLogic } from './hooks/useGameLogic';
import { useSupabaseSync } from './hooks/useSupabaseSync';
import { useAuth } from './hooks/useAuth';
import { useAppModals } from './hooks/useAppModals';
import { useAppUI } from './hooks/useAppUI';
import { useAutoSave } from './hooks/useAutoSave';

// Components
import Loader from './components/Loader';
import PlayerSetup from './components/PlayerSetup';
import HomePage from './components/HomePage';
import BottomNavigation from './components/BottomNavigation';
import AdminDashboard from './components/AdminDashboard';
import FixtureView from './components/FixtureView';

// New Architecture Components
import AppHeader from './components/AppHeader';
import AppModals from './components/AppModals';
import GameMainContent from './components/GameMainContent';

import { useProfile } from './hooks/useProfile';
import { ADMIN_EMAILS } from './constants';

function App() {
  const { user, authLoading, handleLogin, handleLogout } = useAuth();
  const { profile } = useProfile();
  const modals = useAppModals();
  const ui = useAppUI();
  const navigate = useNavigate();

  // Permissions Logic
  const isOwner = user && ADMIN_EMAILS.map(e => e.toLowerCase()).includes((user.email || '').toLowerCase());
  const canEditFixture = isOwner || profile?.permission_role === 'admin' || profile?.permission_role === 'fixture_manager';

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

  // --- AUTO-SAVE LOGIC ---
  useAutoSave(user, gameState, handleSyncToSupabase);

  // --- HANDLERS (UI Specific) ---
  const handleStartApp = useCallback((teamName?: string, roster?: RosterPlayer[]) => {
    if (teamName) {
        const players = roster ? roster.map(p => p.number) : [];
        const names = roster ? roster.reduce((acc, p) => ({ ...acc, [p.number]: p.name }), {} as Record<string, string>) : {};
        ui.setInitialSetupData({
            teamName,
            selectedPlayers: players.length > 0 ? players : undefined,
            playerNames: names
        });
    } else {
        ui.setInitialSetupData(null);
    }
    setGameState(prev => ({ ...prev, hasSeenHomepage: true }));
    navigate('/setup');
  }, [setGameState, ui, navigate]);

  const handleBackToHome = useCallback(() => {
      setGameState(prev => ({ ...initialGameState, hasSeenHomepage: false }));
      ui.setInitialSetupData(null);
      navigate('/');
  }, [setGameState, ui, navigate]);

  const handleSetupCompleteWrapper = useCallback((selectedPlayers: string[], settings: Settings, gameMode: GameMode, playerNames?: Record<string, string>) => {
    handleSetupComplete(selectedPlayers, settings, gameMode, playerNames);
    navigate('/game');
  }, [handleSetupComplete, navigate]);

  const handleActionSelect = (action: StatAction) => {
      modals.openModal('playerSelection', { actionToAssign: action, actionLabel: STAT_LABELS[action] });
  };

  const handleAssignActionToPlayer = (playerNumber: string) => {
      if (modals.modalProps.actionToAssign) {
          handleUpdateTallyStat(playerNumber, modals.modalProps.actionToAssign, 1);
      }
      modals.closeModal();
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
    ui.setPendingShotPosition(position);
  }, [gameState.currentPlayer, gameState.tutorialStep, gameState.isReadOnly, setGameState, ui]);

  const onOutcomeSelect = (isGol: boolean) => {
      if(ui.pendingShotPosition) {
          handleOutcomeSelection(isGol, ui.pendingShotPosition);
          ui.setPendingShotPosition(null);
      }
  }

  // Header Editing logic
  const startEditingHeader = () => {
      if (gameState.isReadOnly) return;
      ui.setHeaderPlayerName(gameState.playerNames[gameState.currentPlayer] || '');
      ui.setIsEditingHeaderPlayer(true);
  };

  const saveHeaderPlayerName = () => {
      if (gameState.currentPlayer) {
          updatePlayerName(gameState.currentPlayer, ui.headerPlayerName);
          ui.setIsEditingHeaderPlayer(false);
      }
  };

  const cancelEditingHeader = () => {
      ui.setIsEditingHeaderPlayer(false);
  };

  // Modals & Flows Wrappers
  const handleRequestClearSheet = useCallback(() => {
    if (gameState.shots.length > 0) modals.openModal('clearSheet');
  }, [gameState.shots.length, modals]);

  const handleConfirmClearSheet = useCallback(() => {
    handleClearSheet();
    modals.closeModal();
  }, [handleClearSheet, modals]);

  const handleRequestNewGame = useCallback(() => {
      modals.openModal('newGameConfirm');
  }, [modals]);
  
  const handleConfirmNewGameWrapper = useCallback(() => {
      handleConfirmNewGame();
      modals.closeModal();
      navigate('/setup');
  }, [handleConfirmNewGame, modals, navigate]);

  const handleRequestReselectPlayers = useCallback(() => {
    modals.openModal('reselectConfirm');
  }, [modals]);

  const handleConfirmReselectPlayers = useCallback(() => {
    setGameState(prev => ({ ...prev, isSetupComplete: false }));
    modals.closeModal();
    navigate('/setup');
  }, [setGameState, modals, navigate]);
  
  const handleChangeMode = useCallback(() => {
    setGameState(prev => ({...prev, isSetupComplete: false, gameMode: null}));
    modals.closeModal();
    navigate('/setup');
  }, [setGameState, modals, navigate]);

  const handleRequestReturnHome = useCallback(() => {
    if (gameState.isSetupComplete) modals.openModal('returnHomeConfirm');
  }, [gameState.isSetupComplete, modals]);

  const handleConfirmReturnHome = useCallback(() => {
      setGameState({ ...initialGameState, hasSeenHomepage: false, tutorialStep: 1 });
      modals.closeModal();
      navigate('/');
  }, [setGameState, modals, navigate]);
  
  const handleSettingsChange = useCallback((newSettings: Settings) => {
    setGameState(prev => ({ ...prev, settings: newSettings }));
  }, [setGameState]);
  
  const handleRequestSaveGame = useCallback(() => {
      modals.openModal('saveGame');
      setSyncState({ status: 'idle', message: '' });
  }, [setSyncState, modals]);

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
      modals.closeModal();
      
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
      navigate('/setup');
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
      const playerMatch = ui.analysisPlayer === 'Todos' || shot.playerNumber === ui.analysisPlayer;
      if (!playerMatch) return false;
      const periodMatch = ui.analysisPeriodFilter === 'all' || shot.period === ui.analysisPeriodFilter;
      if (!periodMatch) return false;
      switch (ui.analysisResultFilter) {
        case 'goles': return shot.isGol;
        case 'misses': return !shot.isGol;
        case 'all': default: return true;
      }
    });
  }, [gameState.shots, ui.analysisPlayer, ui.analysisResultFilter, ui.analysisPeriodFilter]);

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

  // --- ROUTE COMPONENTS ---
  const GameLoader = () => {
    const { gameId } = useParams();
    const { handleLoadGame: loadGame, isLoading: isAppLoading } = useSupabaseSync();
    const { isSetupComplete, gameId: currentGameId } = useGameContext().gameState;

    useEffect(() => {
      if (gameId && gameId !== 'current' && gameId !== currentGameId) {
        loadGame(gameId);
      }
    }, [gameId, currentGameId, loadGame]);

    if (isAppLoading) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
            <Loader />
            <p className="text-slate-400 mt-4">Cargando partido...</p>
        </div>
      );
    }

    if (!isSetupComplete && gameId === 'current') {
      return <Navigate to="/setup" replace />;
    }

    return <Outlet />;
  };

  // --- RENDER ---
  if (isAppLoading || authLoading) {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
            <Loader />
            <p className="text-slate-400 mt-4">Cargando...</p>
        </div>
    );
  } 
  
  return (
    <Routes>
      <Route path="/" element={
        <HomePage 
          onStart={handleStartApp} 
          onLoadGameClick={() => modals.openModal('loadGame')}
          onManageTeamsClick={() => modals.openModal('teamManager')}
          user={user}
          onLogin={handleLogin}
          onLoadGame={(id) => {
            handleLoadGame(id).then(() => {
              navigate(`/game/${id}/stats`);
            });
          }}
        />
      } />
      
      <Route path="/setup" element={
        hasSeenHomepage ? (
          <PlayerSetup 
            onSetupComplete={handleSetupCompleteWrapper} 
            onBack={handleBackToHome}
            initialSelectedPlayers={ui.initialSetupData?.selectedPlayers || availablePlayers}
            initialSettings={{ ...settings, myTeam: ui.initialSetupData?.teamName || settings.myTeam }}
            initialGameMode={gameMode}
            initialPlayerNames={ui.initialSetupData?.playerNames}
          />
        ) : (
          <Navigate to="/" replace />
        )
      } />

      {/* Game Routes */}
      <Route path="/game/:gameId" element={<GameLoader />}>
          <Route index element={<GameLayout activeTab="logger" />} />
          <Route path="stats" element={<GameLayout activeTab="statistics" />} />
          <Route path="analysis" element={<GameLayout activeTab="courtAnalysis" />} />
          <Route path="faq" element={<GameLayout activeTab="faq" />} />
      </Route>

      {/* Legacy/Redirect Route */}
      <Route path="/game" element={isSetupComplete ? <Navigate to={`/game/${gameState.gameId || 'current'}`} replace /> : <Navigate to="/setup" replace />} />
      <Route path="/partido/:gameId" element={<Navigate to="/game/:gameId/stats" replace />} />

      {/* Admin & Fixture */}
      <Route path="/admin" element={<AdminDashboard isOpen={true} onClose={() => navigate('/')} isOwner={!!isOwner} onLoadGame={handleLoadGame} />} />
      <Route path="/fixture" element={<FixtureView isOpen={true} onClose={() => navigate('/')} isAdmin={!!canEditFixture} />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

const GameLayout = ({ activeTab }: { activeTab: AppTab }) => {
    const { user, handleLogin, handleLogout } = useAuth();
    const modals = useAppModals();
    const ui = useAppUI();
    const navigate = useNavigate();
    const { gameState, setGameState, redoStack } = useGameContext();
    const { 
        notificationPopup, setNotificationPopup,
        handlePlayerChange, handleSubstitution, updatePlayerName,
        handleUpdateTallyStat, handleUndoTally, handleRedoTally,
        handleOutcomeSelection, handleUndoShot, handleRedoShot, handleClearSheet,
        handleConfirmNewGame,
        handleDeleteGameEvent, handleEditGameEvent
    } = useGameLogic();
    
    const { 
        syncState, setSyncState,
        handleSyncToSupabase, handleLoadGame,
        isAutoSaving, lastSaved
    } = useSupabaseSync();

    const { isSetupComplete, availablePlayers, playerNames, currentPlayer, currentPeriod, settings, tutorialStep, gameMode, gameLog, tallyRedoLog, isReadOnly } = gameState;
    const showTutorial = isSetupComplete && tutorialStep < 3 && gameMode === 'shot-chart';
    const playersForTally = useMemo(() => ['Equipo', ...availablePlayers], [availablePlayers]);

    const handleActionSelect = (action: StatAction) => {
        modals.openModal('playerSelection', { actionToAssign: action, actionLabel: STAT_LABELS[action] });
    };

    const handleAssignActionToPlayer = (playerNumber: string) => {
        if (modals.modalProps.actionToAssign) {
            handleUpdateTallyStat(playerNumber, modals.modalProps.actionToAssign, 1);
        }
        modals.closeModal();
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
      ui.setPendingShotPosition(position);
    }, [gameState.currentPlayer, gameState.tutorialStep, gameState.isReadOnly, setGameState, ui]);

    const onOutcomeSelect = (isGol: boolean) => {
        if(ui.pendingShotPosition) {
            handleOutcomeSelection(isGol, ui.pendingShotPosition);
            ui.setPendingShotPosition(null);
        }
    }

    const startEditingHeader = () => {
        if (gameState.isReadOnly) return;
        ui.setHeaderPlayerName(gameState.playerNames[gameState.currentPlayer] || '');
        ui.setIsEditingHeaderPlayer(true);
    };

    const saveHeaderPlayerName = () => {
        if (gameState.currentPlayer) {
            updatePlayerName(gameState.currentPlayer, ui.headerPlayerName);
            ui.setIsEditingHeaderPlayer(false);
        }
    };

    const cancelEditingHeader = () => {
        ui.setIsEditingHeaderPlayer(false);
    };

    const handleRequestClearSheet = useCallback(() => {
      if (gameState.shots.length > 0) modals.openModal('clearSheet');
    }, [gameState.shots.length, modals]);

    const handleConfirmClearSheet = useCallback(() => {
      handleClearSheet();
      modals.closeModal();
    }, [handleClearSheet, modals]);

    const handleRequestNewGame = useCallback(() => {
        modals.openModal('newGameConfirm');
    }, [modals]);
    
    const handleConfirmNewGameWrapper = useCallback(() => {
        handleConfirmNewGame();
        modals.closeModal();
        navigate('/setup');
    }, [handleConfirmNewGame, modals, navigate]);

    const handleRequestReselectPlayers = useCallback(() => {
      modals.openModal('reselectConfirm');
    }, [modals]);

    const handleConfirmReselectPlayers = useCallback(() => {
      setGameState(prev => ({ ...prev, isSetupComplete: false }));
      modals.closeModal();
      navigate('/setup');
    }, [setGameState, modals, navigate]);
    
    const handleChangeMode = useCallback(() => {
      setGameState(prev => ({...prev, isSetupComplete: false, gameMode: null}));
      modals.closeModal();
      navigate('/setup');
    }, [setGameState, modals, navigate]);

    const handleRequestReturnHome = useCallback(() => {
      if (gameState.isSetupComplete) modals.openModal('returnHomeConfirm');
    }, [gameState.isSetupComplete, modals]);

    const handleConfirmReturnHome = useCallback(() => {
        setGameState({ ...initialGameState, hasSeenHomepage: false, tutorialStep: 1 });
        modals.closeModal();
        navigate('/');
    }, [setGameState, modals, navigate]);
    
    const handleSettingsChange = useCallback((newSettings: Settings) => {
      setGameState(prev => ({ ...prev, settings: newSettings }));
    }, [setGameState]);
    
    const handleRequestSaveGame = useCallback(() => {
        modals.openModal('saveGame');
        setSyncState({ status: 'idle', message: '' });
    }, [setSyncState, modals]);

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

    const handleTeamLoadedFromHome = (team: SavedTeam) => {
        modals.closeModal();
        const newNames: Record<string, string> = {};
        team.players.forEach(p => { if (p.name) newNames[p.number] = p.name; });
        const newAvailablePlayers = team.players.map(p => p.number);
        setGameState(prev => ({
            ...initialGameState,
            hasSeenHomepage: true,
            isSetupComplete: false,
            availablePlayers: newAvailablePlayers,
            playerNames: newNames,
            settings: { ...initialGameState.settings, myTeam: team.name }
        }));
        navigate('/setup');
    };

    const filteredLoggerTabShots = useMemo(() => {
      return gameState.shots.filter(shot => shot.period === gameState.currentPeriod);
    }, [gameState.shots, gameState.currentPeriod]);

    const playersWithShots = useMemo(() => 
      Array.from(new Set(gameState.shots.map(shot => shot.playerNumber))).sort((a, b) => Number(a) - Number(b)), 
      [gameState.shots]
    );
    
    const filteredAnalysisShots = useMemo(() => {
      return gameState.shots.filter(shot => {
        const playerMatch = ui.analysisPlayer === 'Todos' || shot.playerNumber === ui.analysisPlayer;
        if (!playerMatch) return false;
        const periodMatch = ui.analysisPeriodFilter === 'all' || shot.period === ui.analysisPeriodFilter;
        if (!periodMatch) return false;
        switch (ui.analysisResultFilter) {
          case 'goles': return shot.isGol;
          case 'misses': return !shot.isGol;
          case 'all': default: return true;
        }
      });
    }, [gameState.shots, ui.analysisPlayer, ui.analysisResultFilter, ui.analysisPeriodFilter]);

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

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans bg-pattern-hoops pb-24 md:pb-8">
            <div className="w-full max-w-4xl flex-grow">
              <AppHeader 
                onOpenMobileMenu={() => modals.openModal('mobileMenu')}
                onRequestReturnHome={handleRequestReturnHome}
                isSetupComplete={isSetupComplete}
                gameName={settings.gameName}
                gameMode={gameMode!}
                isAutoSaving={isAutoSaving}
                lastSaved={lastSaved}
                gameId={gameState.gameId}
                onOpenSettings={() => modals.openModal('settings')}
                isReadOnly={isReadOnly}
              />

              {/* Tab Switcher - Desktop */}
              <div className="hidden md:flex justify-center mb-8 border-b-2 border-slate-700">
                  {tabsForCurrentMode.map(tab => (
                  <button
                      key={tab}
                      onClick={() => navigate(`/game/${gameState.gameId || 'current'}/${tab === 'logger' ? '' : tab}`)}
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
                gameMode={gameMode!}
                activeTab={activeTab}
                isReadOnly={isReadOnly}
                onActionSelect={handleActionSelect}
                handleUndoTally={handleUndoTally}
                handleRedoTally={handleRedoTally}
                gameLog={gameLog}
                tallyRedoLog={tallyRedoLog}
                isCorrectionsVisible={ui.isCorrectionsVisible}
                setIsCorrectionsVisible={ui.setIsCorrectionsVisible}
                playerNames={playerNames}
                currentPlayer={currentPlayer}
                currentPeriod={currentPeriod}
                setGameState={setGameState}
                setEditingEvent={(e) => modals.openModal('editEvent', { event: e })}
                setIsShareModalOpen={() => modals.openModal('share')}
                showTutorial={showTutorial}
                tutorialStep={tutorialStep}
                isEditingHeaderPlayer={ui.isEditingHeaderPlayer}
                headerPlayerName={ui.headerPlayerName}
                setHeaderPlayerName={ui.setHeaderPlayerName}
                saveHeaderPlayerName={saveHeaderPlayerName}
                cancelEditingHeader={cancelEditingHeader}
                startEditingHeader={startEditingHeader}
                handlePlayerChange={handlePlayerChange}
                activePlayers={gameState.activePlayers}
                setIsSubstitutionModalOpen={() => modals.openModal('substitution')}
                filteredLoggerTabShots={filteredLoggerTabShots}
                handleCourtClick={handleCourtClick}
                handleUndoShot={handleUndoShot}
                handleRedoShot={handleRedoShot}
                redoStack={redoStack}
                handleRequestClearSheet={handleRequestClearSheet}
                shots={gameState.shots}
                mapView={ui.mapView}
                setMapView={ui.setMapView}
                analysisPlayer={ui.analysisPlayer}
                setAnalysisPlayer={ui.setAnalysisPlayer}
                playersWithShots={playersWithShots}
                filteredAnalysisShots={filteredAnalysisShots}
                analysisResultFilter={ui.analysisResultFilter}
                setAnalysisResultFilter={ui.setAnalysisResultFilter}
                analysisPeriodFilter={ui.analysisPeriodFilter}
                setAnalysisPeriodFilter={ui.setAnalysisPeriodFilter}
              />
            </div>
            <footer className="w-full text-center text-slate-500 text-xs mt-8 pb-4">Santiago Greco - Gresolutions © 2026</footer>
            <BottomNavigation activeTab={activeTab} onSelectTab={(tab) => navigate(`/game/${gameState.gameId || 'current'}/${tab === 'logger' ? '' : tab}`)} gameMode={gameMode!} />
            <AppModals 
                {...modals}
                activeTab={activeTab}
                onSelectTab={(tab) => navigate(`/game/${gameState.gameId || 'current'}/${tab === 'logger' ? '' : tab}`)}
                onShare={handleShare}
                tabTranslations={tabTranslations}
                tabs={tabsForCurrentMode}
                handleAssignActionToPlayer={handleAssignActionToPlayer}
                playersForTally={playersForTally}
                playerNames={playerNames}
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
                pendingShotPosition={ui.pendingShotPosition}
                setPendingShotPosition={ui.setPendingShotPosition}
                onOutcomeSelect={onOutcomeSelect}
                handleConfirmClearSheet={handleConfirmClearSheet}
                handleConfirmNewGameWrapper={handleConfirmNewGameWrapper}
                handleConfirmReturnHome={handleConfirmReturnHome}
                handleConfirmReselectPlayers={handleConfirmReselectPlayers}
                notificationPopup={notificationPopup}
                setNotificationPopup={setNotificationPopup}
                handleEditGameEvent={handleEditGameEvent}
                handleDeleteGameEvent={handleDeleteGameEvent}
                handleTeamLoadedFromHome={handleTeamLoadedFromHome}
                setActiveTab={(tab) => navigate(`/game/${gameState.gameId || 'current'}/${tab === 'logger' ? '' : tab}`)}
            />
        </div>
    );
};

export default App;
