
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Shot, ShotPosition, GamePeriod, AppTab, HeatmapFilter, PlayerStats, MapPeriodFilter, Settings, GameState, PlayerStreak, GameMode, TallyStats, TallyStatsPeriod, StatAction, GameEvent } from './types';
import { supabase } from './utils/supabaseClient';
import { GAME_STATE_STORAGE_KEY, PERIOD_NAMES, STAT_LABELS } from './constants';
import { mapTallyPeriodToDb, mapTallyPeriodFromDb, mapShotToDb, mapShotFromDb } from './utils/dbAdapters';

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
import ClipboardIcon from './components/ClipboardIcon';
import ChartBarIcon from './components/ChartBarIcon';
import ShareIcon from './components/ShareIcon';
import LoadGameModal from './components/LoadGameModal';
import Loader from './components/Loader';
import SaveGameModal from './components/SaveGameModal';
import PlayerSelectionModal from './components/PlayerSelectionModal';
import ChevronDownIcon from './components/ChevronDownIcon';
import GameLogView from './components/GameLogView';
import QuickActionsPanel from './components/QuickActionsPanel';
import StatsTallyView from './components/StatsTallyView';
import ShareModal from './components/ShareModal';

const initialTallyStatsPeriod: TallyStatsPeriod = {
  goles: 0,
  fallos: 0,
  recuperos: 0,
  perdidas: 0,
  reboteOfensivo: 0,
  reboteDefensivo: 0,
  asistencias: 0,
  golesContra: 0,
  faltasPersonales: 0,
};

const initialPlayerTally: TallyStats = {
    'First Half': { ...initialTallyStatsPeriod },
    'Second Half': { ...initialTallyStatsPeriod },
};

const initialGameState: GameState = {
    gameId: null,
    shots: [],
    isSetupComplete: false,
    hasSeenHomepage: false,
    availablePlayers: [],
    activePlayers: [],
    playerNames: {},
    currentPlayer: '',
    currentPeriod: 'First Half',
    settings: {
        gameName: '',
        isManoCalienteEnabled: true,
        manoCalienteThreshold: 5,
        isManoFriaEnabled: true,
        manoFriaThreshold: 5,
    },
    playerStreaks: {},
    tutorialStep: 1, // 1: Select Player, 2: Tap Court, 3: Done
    gameMode: null,
    tallyStats: {},
    opponentScore: 0,
    teamFouls: {
        'First Half': 0,
        'Second Half': 0,
    },
    gameLog: [],
    tallyRedoLog: [],
};


interface NotificationInfo {
    type: 'caliente' | 'fria';
    playerNumber: string;
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';
export interface SyncState {
    status: SyncStatus;
    message: string;
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
  const [isSaveGameModalOpen, setIsSaveGameModalOpen] = useState(false);
  const [isSubstitutionModalOpen, setIsSubstitutionModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLoadGameModalOpen, setIsLoadGameModalOpen] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(false);
  const [notificationPopup, setNotificationPopup] = useState<NotificationInfo | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [tempPlayerName, setTempPlayerName] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>({ status: 'idle', message: '' });
  const [isPlayerSelectionModalOpen, setIsPlayerSelectionModalOpen] = useState(false);
  const [actionToAssign, setActionToAssign] = useState<StatAction | null>(null);
  const [isCorrectionsVisible, setIsCorrectionsVisible] = useState(false);

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
        let savedState = JSON.parse(savedStateJSON);
        
        // Ensure new state fields have defaults
        if (!savedState.gameId) savedState.gameId = null;
        if (!savedState.gameMode) savedState.gameMode = null;
        if (!savedState.tallyStats) savedState.tallyStats = {};
        if (!savedState.opponentScore) savedState.opponentScore = 0;
        if (!savedState.teamFouls) savedState.teamFouls = { 'First Half': 0, 'Second Half': 0 };
        if (!savedState.gameLog) savedState.gameLog = [];
        if (!savedState.tallyRedoLog) savedState.tallyRedoLog = [];
        
        // Migration for older tallyStats structure
        if (savedState.tallyStats) {
            Object.keys(savedState.tallyStats).forEach(playerNum => {
                const playerTally = savedState.tallyStats[playerNum];
                if (playerTally && !playerTally['First Half']) { // Check if it's the old structure
                    savedState.tallyStats[playerNum] = {
                        'First Half': playerTally,
                        'Second Half': initialTallyStatsPeriod,
                    };
                }
                 if (playerTally['First Half'] && playerTally['First Half'].faltasPersonales === undefined) {
                    playerTally['First Half'].faltasPersonales = 0;
                }
                if (playerTally['Second Half'] && playerTally['Second Half'].faltasPersonales === undefined) {
                    playerTally['Second Half'].faltasPersonales = 0;
                }
            });
        }

        if (savedState.availablePlayers && !savedState.activePlayers) {
             savedState.activePlayers = savedState.availablePlayers.slice(0, 6);
        }
        if (savedState.hasSeenTutorial === true && savedState.tutorialStep === undefined) {
            savedState.tutorialStep = 3;
        } else if (savedState.hasSeenTutorial === false && savedState.tutorialStep === undefined) {
            savedState.tutorialStep = 1;
        }
        delete savedState.hasSeenTutorial;
        if (savedState.hasSeenHomepage === undefined) {
            savedState.hasSeenHomepage = true;
        }

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
  
  const handleSetupComplete = useCallback((participatingPlayers: string[], newSettings: Settings, gameMode: GameMode) => {
    const sortedRoster = participatingPlayers.sort((a,b) => Number(a) - Number(b));
    
    setGameState(prev => {
        const isCorrection = prev.availablePlayers.length > 0 && prev.gameMode === gameMode;
        
        const playerNames = isCorrection ? prev.playerNames : {};
        const playerStreaks = isCorrection ? prev.playerStreaks : {};
        const tallyStats = isCorrection ? prev.tallyStats : {};

        if (!tallyStats['Equipo']) {
            tallyStats['Equipo'] = JSON.parse(JSON.stringify(initialPlayerTally));
        }

        sortedRoster.forEach(p => {
            if (!tallyStats[p]) {
                tallyStats[p] = JSON.parse(JSON.stringify(initialPlayerTally));
            }
        });

        // Reset state unless it's a correction
        const baseState = isCorrection ? prev : initialGameState;

        return {
            ...baseState,
            hasSeenHomepage: true,
            availablePlayers: sortedRoster,
            activePlayers: sortedRoster.slice(0, 6),
            playerNames,
            playerStreaks,
            settings: newSettings,
            isSetupComplete: true,
            currentPlayer: '',
            gameMode: gameMode,
            tallyStats: tallyStats,
            activeTab: 'logger',
        };
    });
    
    setAnalysisPlayer('Todos');
  }, []);
  

  const handleUpdateTallyStat = useCallback((playerNumber: string, stat: StatAction, change: 1) => {
    setGameState(prev => {
        const { currentPeriod } = prev;

        const newLogEntry: GameEvent = {
            id: new Date().toISOString() + Math.random(),
            timestamp: Date.now(),
            period: currentPeriod,
            playerNumber,
            action: stat,
        };
        const newGameLog = [newLogEntry, ...prev.gameLog];
        
        const playerTallyStats = prev.tallyStats[playerNumber] || JSON.parse(JSON.stringify(initialPlayerTally));
        const currentPeriodStats = playerTallyStats[currentPeriod];

        const newPeriodStats = { ...currentPeriodStats, [stat]: currentPeriodStats[stat] + change };
        const newPlayerTallyStats = { ...playerTallyStats, [currentPeriod]: newPeriodStats };

        const newState = { 
            ...prev,
            tallyStats: { ...prev.tallyStats, [playerNumber]: newPlayerTallyStats },
            gameLog: newGameLog,
            tallyRedoLog: [], // Clear redo stack on new action
        };

        if (stat === 'faltasPersonales' && playerNumber !== 'Equipo') {
            const newTeamFouls = { ...prev.teamFouls };
            newTeamFouls[currentPeriod] = newTeamFouls[currentPeriod] + change;
            newState.teamFouls = newTeamFouls;
        }
        
        if (change === 1 && (stat === 'goles' || stat === 'fallos')) {
            const isGol = stat === 'goles';
            const currentStreak = prev.playerStreaks[playerNumber] || { consecutiveGoles: 0, consecutiveMisses: 0, notifiedCaliente: false, notifiedFria: false };
            let newStreak = { ...currentStreak };
            let triggeredNotification: NotificationInfo | null = null;
    
            if (isGol) {
                newStreak.consecutiveGoles += 1;
                newStreak.consecutiveMisses = 0;
                newStreak.notifiedFria = false;
                if (prev.settings.isManoCalienteEnabled && newStreak.consecutiveGoles >= prev.settings.manoCalienteThreshold && !newStreak.notifiedCaliente) {
                    triggeredNotification = { type: 'caliente', playerNumber };
                    newStreak.notifiedCaliente = true;
                }
            } else {
                newStreak.consecutiveMisses += 1;
                newStreak.consecutiveGoles = 0;
                newStreak.notifiedCaliente = false;
                if (prev.settings.isManoFriaEnabled && newStreak.consecutiveMisses >= prev.settings.manoFriaThreshold && !newStreak.notifiedFria) {
                    triggeredNotification = { type: 'fria', playerNumber };
                    newStreak.notifiedFria = true;
                }
            }
            
            if (triggeredNotification) {
                setTimeout(() => setNotificationPopup(triggeredNotification), 200);
            }

            newState.playerStreaks = { ...prev.playerStreaks, [playerNumber]: newStreak };
        }

        return newState;
    });
  }, []);

  const handleUndoTally = useCallback(() => {
    setGameState(prev => {
        if (prev.gameLog.length === 0) return prev;

        const newGameLog = [...prev.gameLog];
        const eventToUndo = newGameLog.shift(); // remove newest event
        if (!eventToUndo) return prev;

        const { playerNumber, action, period } = eventToUndo;

        // Decrement the stat
        const playerTallyStats = prev.tallyStats[playerNumber];
        const currentPeriodStats = playerTallyStats[period];
        const newPeriodStats = { ...currentPeriodStats, [action]: Math.max(0, currentPeriodStats[action] - 1) };
        const newPlayerTallyStats = { ...playerTallyStats, [period]: newPeriodStats };

        const newState = { 
            ...prev,
            tallyStats: { ...prev.tallyStats, [playerNumber]: newPlayerTallyStats },
            gameLog: newGameLog,
            tallyRedoLog: [eventToUndo, ...prev.tallyRedoLog],
        };
        
        // Also undo team foul if necessary
        if (action === 'faltasPersonales' && playerNumber !== 'Equipo') {
            const newTeamFouls = { ...prev.teamFouls };
            newTeamFouls[period] = Math.max(0, newTeamFouls[period] - 1);
            newState.teamFouls = newTeamFouls;
        }
        
        // Streaks are not recalculated on undo to keep the logic simple.
        return newState;
    });
  }, []);

  const handleRedoTally = useCallback(() => {
    setGameState(prev => {
        if (prev.tallyRedoLog.length === 0) return prev;
        
        const newTallyRedoLog = [...prev.tallyRedoLog];
        const eventToRedo = newTallyRedoLog.shift();
        if (!eventToRedo) return prev;

        const { playerNumber, action, period } = eventToRedo;

        // Increment the stat
        const playerTallyStats = prev.tallyStats[playerNumber];
        const currentPeriodStats = playerTallyStats[period];
        const newPeriodStats = { ...currentPeriodStats, [action]: currentPeriodStats[action] + 1 };
        const newPlayerTallyStats = { ...playerTallyStats, [period]: newPeriodStats };

        const newState = { 
            ...prev,
            tallyStats: { ...prev.tallyStats, [playerNumber]: newPlayerTallyStats },
            gameLog: [eventToRedo, ...prev.gameLog],
            tallyRedoLog: newTallyRedoLog,
        };

        // Also redo team foul if necessary
        if (action === 'faltasPersonales' && playerNumber !== 'Equipo') {
            const newTeamFouls = { ...prev.teamFouls };
            newTeamFouls[period]++;
            newState.teamFouls = newTeamFouls;
        }
        
        // Streaks are not recalculated on redo.
        return newState;
    });
  }, []);


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


  const handleSubstitution = useCallback((playerOut: string, playerIn: string) => {
    setGameState(prev => {
        const newActivePlayers = prev.activePlayers.map(p => p === playerOut ? playerIn : p).sort((a, b) => Number(a) - Number(b));
        return {
            ...prev,
            activePlayers: newActivePlayers,
            currentPlayer: prev.currentPlayer === playerOut ? '' : prev.currentPlayer,
        };
    });
    setIsSubstitutionModalOpen(false);
  }, []);
  
  const handleCourtClick = useCallback((position: ShotPosition) => {
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
      const HALF_COURT_LINE_Y = 1; 
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
        const { playerNumber } = newShot;
        const currentStreak = prev.playerStreaks[playerNumber] || { consecutiveGoles: 0, consecutiveMisses: 0, notifiedCaliente: false, notifiedFria: false };
        let newStreak = { ...currentStreak };
        let triggeredNotification: NotificationInfo | null = null;
  
        if (isGol) {
          newStreak.consecutiveGoles += 1;
          newStreak.consecutiveMisses = 0;
          newStreak.notifiedFria = false; 
          if (prev.settings.isManoCalienteEnabled && newStreak.consecutiveGoles >= prev.settings.manoCalienteThreshold && !newStreak.notifiedCaliente) {
            triggeredNotification = { type: 'caliente', playerNumber };
            newStreak.notifiedCaliente = true;
          }
        } else { // is Miss
          newStreak.consecutiveMisses += 1;
          newStreak.consecutiveGoles = 0;
          newStreak.notifiedCaliente = false;
          if (prev.settings.isManoFriaEnabled && newStreak.consecutiveMisses >= prev.settings.manoFriaThreshold && !newStreak.notifiedFria) {
            triggeredNotification = { type: 'fria', playerNumber };
            newStreak.notifiedFria = true;
          }
        }
        
        if (triggeredNotification) {
            setTimeout(() => setNotificationPopup(triggeredNotification), 200);
        }

        const newState = {
            ...prev,
            shots: [...prev.shots, newShot],
            playerStreaks: { ...prev.playerStreaks, [playerNumber]: newStreak }
        };

        if (prev.tutorialStep === 2) {
            newState.tutorialStep = 3;
        }

        return newState;
      });
      
      setRedoStack([]);
      setPendingShotPosition(null);
    }
  }, [pendingShotPosition, gameState.currentPlayer, gameState.currentPeriod, gameState.settings, gameState.playerStreaks]);
  
  const handleStartEditingName = useCallback((playerNumber: string) => {
      if (!playerNumber || playerNumber === 'Todos' || playerNumber === 'Equipo') return;
      setTempPlayerName(gameState.playerNames[playerNumber] || '');
      setEditingPlayer(playerNumber);
  }, [gameState.playerNames]);

  const handleCancelEditingName = useCallback(() => {
      setEditingPlayer(null);
      setTempPlayerName('');
  }, []);

  const handleSavePlayerName = useCallback(() => {
      if (!editingPlayer) return;
      setGameState(prev => ({
          ...prev,
          playerNames: { ...prev.playerNames, [editingPlayer]: tempPlayerName.trim() }
      }));
      setEditingPlayer(null);
      setTempPlayerName('');
  }, [editingPlayer, tempPlayerName]);
  
  const handleUndo = useCallback(() => {
    if (gameState.shots.length === 0) return;
    
    const lastShot = gameState.shots[gameState.shots.length - 1];
    setRedoStack(prev => [...prev, lastShot]);
    setGameState(prev => ({
        ...prev,
        shots: prev.shots.slice(0, -1)
    }));
  }, [gameState.shots]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;

    const shotToRedo = redoStack[redoStack.length - 1];
    setGameState(prev => ({
        ...prev,
        shots: [...prev.shots, shotToRedo]
    }));
    setRedoStack(prev => prev.slice(0, -1));
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
          hasSeenHomepage: true,
          tutorialStep: prev.tutorialStep === 3 ? 3 : 1,
          gameId: null, // Ensure new game doesn't reuse old ID
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
        isSetupComplete: false,
        gameMode: prev.gameMode // Preserve mode when correcting
    }));
    setRedoStack([]);
    setIsReselectConfirmOpen(false);
  }, []);
  
  const handleCancelReselectPlayers = useCallback(() => setIsReselectConfirmOpen(false), []);
  
  const handleChangeMode = useCallback(() => {
    setGameState(prev => ({...prev, isSetupComplete: false, gameMode: null}));
    setIsSettingsModalOpen(false);
  }, []);


  const handleRequestReturnHome = useCallback(() => {
    if (gameState.isSetupComplete) {
      setIsReturnHomeConfirmOpen(true);
    }
  }, [gameState.isSetupComplete]);

  const handleConfirmReturnHome = useCallback(() => {
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
        playerStreaks: (calienteThresholdChanged || friaThresholdChanged) ? {} : prev.playerStreaks,
      };
    });
  }, []);
  
    const handleRequestSaveGame = useCallback(() => {
        setIsSettingsModalOpen(false);
        setIsSaveGameModalOpen(true);
        setSyncState({ status: 'idle', message: '' });
    }, []);

    const handleSyncToSupabase = async (gameName: string) => {
        setSyncState({ status: 'syncing', message: 'Sincronizando con la nube...' });
        try {
            // 1. Prepare and Upsert Game data
            const gamePayload = {
                id: gameState.gameId || undefined, // Let Supabase generate UUID on first sync
                game_mode: gameState.gameMode,
                settings: { ...gameState.settings, gameName: gameName.trim() },
                player_names: gameState.playerNames,
                available_players: gameState.availablePlayers,
            };

            const { data: gameData, error: gameError } = await supabase
                .from('games')
                .upsert(gamePayload)
                .select()
                .single();

            if (gameError) throw gameError;
            if (!gameData) throw new Error("No se pudo obtener el ID del partido guardado.");
    
            const newGameId = gameData.id;
    
            // 2. Sync Shots if in shot-chart mode
            if (gameState.gameMode === 'shot-chart') {
                const { error: deleteError } = await supabase.from('shots').delete().eq('game_id', newGameId);
                if (deleteError) throw deleteError;
    
                if (gameState.shots.length > 0) {
                    const shotsPayload = gameState.shots.map(shot => mapShotToDb(shot, newGameId));
                    const { error: shotsError } = await supabase.from('shots').insert(shotsPayload);
                    if (shotsError) throw shotsError;
                }
            }
    
            // 3. Sync Tally Stats if in stats-tally mode
            if (gameState.gameMode === 'stats-tally' && Object.keys(gameState.tallyStats).length > 0) {
                const statsPayload: any[] = [];
                
                for (const playerNumber in gameState.tallyStats) {
                    const playerTally = gameState.tallyStats[playerNumber];
                    statsPayload.push({ 
                        game_id: newGameId, 
                        player_number: playerNumber, 
                        period: 'First Half', 
                        ...mapTallyPeriodToDb(playerTally['First Half']) 
                    });
                    statsPayload.push({ 
                        game_id: newGameId, 
                        player_number: playerNumber, 
                        period: 'Second Half', 
                        ...mapTallyPeriodToDb(playerTally['Second Half']) 
                    });
                }
                const { error: statsError } = await supabase.from('tally_stats').upsert(statsPayload, { onConflict: 'game_id,player_number,period' });
                if (statsError) throw statsError;
            }
    
            setGameState(prev => ({ ...prev, gameId: newGameId, settings: { ...prev.settings, gameName: gameName.trim() } }));
            setSyncState({ status: 'success', message: '¡Partido guardado en la nube!' });
    
        } catch (error: any) {
            console.error('Error syncing with Supabase:', error);
            setSyncState({ status: 'error', message: `Error: ${error.message}` });
        }
    };

    const handleLoadGame = async (gameId: string) => {
        setIsLoadGameModalOpen(false);
        setIsAppLoading(true);
        try {
            // Fetch all data in parallel
            const [gameRes, shotsRes, tallyRes] = await Promise.all([
                supabase.from('games').select('*').eq('id', gameId).single(),
                supabase.from('shots').select('*').eq('game_id', gameId),
                supabase.from('tally_stats').select('*').eq('game_id', gameId),
            ]);

            if (gameRes.error) throw gameRes.error;
            if (shotsRes.error) throw shotsRes.error;
            if (tallyRes.error) throw tallyRes.error;
            
            const gameData = gameRes.data;
            
            // Reconstruct Shots
            const loadedShots: Shot[] = (shotsRes.data || []).map(mapShotFromDb);
            
            // Reconstruct Tally Stats
            const loadedTallyStats: Record<string, TallyStats> = {};
            (tallyRes.data || []).forEach((stat: any) => {
                const player = stat.player_number;
                if (!loadedTallyStats[player]) {
                    loadedTallyStats[player] = JSON.parse(JSON.stringify(initialPlayerTally));
                }
                loadedTallyStats[player][stat.period as GamePeriod] = mapTallyPeriodFromDb(stat);
            });
            
            // Reconstruct Player Streaks from loaded data
            const loadedPlayerStreaks: Record<string, PlayerStreak> = {};
            // This is a complex calculation. For now, we reset streaks on load.
            
            // Build the final game state
            const loadedGameState: GameState = {
                ...initialGameState,
                gameId: gameData.id,
                gameMode: gameData.game_mode,
                isSetupComplete: true,
                hasSeenHomepage: true,
                settings: gameData.settings,
                availablePlayers: gameData.available_players,
                playerNames: gameData.player_names,
                activePlayers: gameData.available_players.slice(0, 6),
                shots: loadedShots,
                tallyStats: loadedTallyStats,
                playerStreaks: loadedPlayerStreaks,
                tutorialStep: 3, // Assume user loading a game is past the tutorial
            };
            
            setGameState(loadedGameState);

        } catch (error: any) {
            console.error('Error loading game:', error);
            alert(`No se pudo cargar el partido: ${error.message}`);
        } finally {
            setIsAppLoading(false);
        }
    };


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
        case 'all':
        default: return true;
      }
    });
  }, [gameState.shots, analysisPlayer, analysisResultFilter, analysisPeriodFilter]);

  const playerStats = useMemo<PlayerStats[]>(() => {
    if (gameState.gameMode === 'shot-chart') {
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
    }
    return [];
  }, [gameState.shots, gameState.gameMode]);
  
  const totalPoints = useMemo(() => {
    if (gameState.gameMode === 'shot-chart') {
      return playerStats.reduce((acc, player) => acc + player.totalPoints, 0);
    }
    if (gameState.gameMode === 'stats-tally') {
      return Object.entries(gameState.tallyStats).reduce((total: number, [playerNumber, playerTally]) => {
          if (playerNumber === 'Equipo') return total; // Do not count team's 'goles' stat
          if (!playerTally || playerTally['First Half'] === undefined) return total;
          const firstHalfGoles = playerTally['First Half']?.goles ?? 0;
          const secondHalfGoles = playerTally['Second Half']?.goles ?? 0;
          const playerPoints = (firstHalfGoles + secondHalfGoles) * 2;
          return total + playerPoints;
      }, 0);
    }
    return 0;
  }, [playerStats, gameState.tallyStats, gameState.gameMode]);

  const tabTranslations: {[key in AppTab]: string} = { 
    logger: gameState.gameMode === 'stats-tally' ? 'Anotador' : 'Registro de tiros',
    courtAnalysis: 'Análisis de Cancha', 
    statistics: 'Estadísticas', 
    faq: 'Preguntas Frecuentes',
  };

  const tabsForCurrentMode: AppTab[] = useMemo(() => {
    if (gameState.gameMode === 'shot-chart') {
        return ['logger', 'courtAnalysis', 'statistics', 'faq'];
    }
    if (gameState.gameMode === 'stats-tally') {
        return ['logger', 'statistics', 'faq'];
    }
    return [];
  }, [gameState.gameMode]);

  const { shots, isSetupComplete, hasSeenHomepage, availablePlayers, activePlayers, playerNames, currentPlayer, currentPeriod, settings, tutorialStep, gameMode, tallyStats, opponentScore, teamFouls, gameLog, tallyRedoLog } = gameState;

  const getFilterButtonClass = (isActive: boolean) =>
    `flex-1 font-bold py-2 px-3 rounded-md transition-colors text-sm sm:text-base ${
      isActive ? 'bg-cyan-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'
    }`;

  const showTutorial = isSetupComplete && tutorialStep < 3 && gameMode === 'shot-chart';
  
  const getPageSubtitle = () => {
    if (gameMode === 'shot-chart') {
      switch(activeTab) {
        case 'logger': return 'Tocá en la cancha para registrar un tiro.';
        case 'courtAnalysis': return 'Visualiza la ubicación y densidad de los tiros.';
        case 'statistics': return 'Revisa el rendimiento de los jugadores.';
        case 'faq': return 'Encontrá respuestas a las preguntas más comunes.';
        default: return '';
      }
    }
    if (gameMode === 'stats-tally') {
        switch(activeTab) {
            case 'logger': return 'Anota las estadísticas de cada jugador.';
            case 'statistics': return 'Revisa el rendimiento de los jugadores.';
            case 'faq': return 'Encontrá respuestas a las preguntas más comunes.';
            default: return '';
        }
    }
    return '';
  };

  const playersForTally = useMemo(() => ['Equipo', ...availablePlayers], [availablePlayers]);


  // --- RENDER ---
  let pageContent;

  if (isAppLoading) {
    pageContent = (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
            <Loader />
            <p className="text-slate-400 mt-4">Cargando partido...</p>
        </div>
    );
  } else if (!hasSeenHomepage) {
    pageContent = <HomePage onStart={handleStartApp} onLoadGameClick={() => setIsLoadGameModalOpen(true)} />;
  } else if (!isSetupComplete || !gameMode) {
    pageContent = <PlayerSetup 
              onSetupComplete={handleSetupComplete} 
              initialSelectedPlayers={availablePlayers}
              initialSettings={settings}
              initialGameMode={gameMode}
            />;
  } else {
    pageContent = (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans bg-pattern-hoops">
        <div className="w-full max-w-4xl flex-grow">
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
                    {getPageSubtitle()}
                  </p>
              </div>
              <div className="flex-none w-12 flex justify-end">
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
                    <Scoreboard totalPoints={totalPoints} />
                    
                    <QuickActionsPanel onActionSelect={handleActionSelect} />
                    
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={handleUndoTally}
                            disabled={gameLog.length === 0}
                            className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-yellow-500 disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            aria-label="Deshacer última acción"
                        >
                            <UndoIcon className="h-5 w-5" />
                            <span className="hidden sm:inline">Deshacer</span>
                        </button>
                        <button
                            onClick={handleRedoTally}
                            disabled={tallyRedoLog.length === 0}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500 disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            aria-label="Rehacer última acción"
                        >
                            <RedoIcon className="h-5 w-5" />
                            <span className="hidden sm:inline">Rehacer</span>
                        </button>
                    </div>

                    <GameLogView log={gameLog} playerNames={playerNames} />
                    
                    <div className="bg-slate-800 rounded-lg shadow-lg">
                        <button
                          onClick={() => setIsCorrectionsVisible(prev => !prev)}
                          className="w-full flex justify-between items-center text-left p-4 font-bold text-xl text-cyan-400 hover:bg-slate-700/50 transition-colors rounded-lg"
                          aria-expanded={isCorrectionsVisible}
                        >
                          <span>Planilla de Jugadores</span>
                          <ChevronDownIcon className={`h-6 w-6 text-slate-400 transition-transform duration-300 ${isCorrectionsVisible ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isCorrectionsVisible ? 'max-h-[8000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="p-4 border-t border-slate-700">
                                <StatsTallyView
                                    players={playersForTally}
                                    playerNames={playerNames}
                                    tallyStats={tallyStats}
                                    currentPeriod={currentPeriod}
                                    onUpdate={handleUpdateTallyStat}
                                    editingPlayer={editingPlayer}
                                    tempPlayerName={tempPlayerName}
                                    setTempPlayerName={setTempPlayerName}
                                    onStartEdit={handleStartEditingName}
                                    onSaveEdit={handleSavePlayerName}
                                    onCancelEdit={handleCancelEditingName}
                                />
                            </div>
                        </div>
                    </div>
                    
                     <div className="w-full bg-slate-800 p-4 rounded-lg shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-xl font-bold text-cyan-400">Sesión Actual</h2>
                        <p className="text-sm text-slate-400">Estás viendo el {PERIOD_NAMES[currentPeriod]}</p>
                      </div>
                      <select
                          id="period-selector"
                          value={currentPeriod}
                          onChange={(e) => setGameState(prev => ({...prev, currentPeriod: e.target.value as GamePeriod}))}
                          className="w-full sm:w-auto bg-slate-700 border border-slate-600 text-white text-lg rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5"
                      >
                        {(['First Half', 'Second Half'] as GamePeriod[]).map((period) => (
                          <option key={period} value={period}>
                            {PERIOD_NAMES[period]}
                          </option>
                        ))}
                      </select>
                    </div>
                </div>
              </>
            )}

            {gameMode === 'stats-tally' && activeTab === 'statistics' && (
              <div className="flex flex-col gap-8">
                <StatisticsView
                  stats={[]}
                  playerNames={playerNames}
                  shots={[]}
                  onShareClick={() => setIsShareModalOpen(true)}
                  gameMode={gameMode}
                  tallyStats={tallyStats}
                />
              </div>
            )}

            {gameMode === 'stats-tally' && activeTab === 'faq' && (
              <FaqView />
            )}

            {gameMode === 'shot-chart' && activeTab === 'logger' && (
              <>
                {showTutorial && (
                  <TutorialOverlay step={tutorialStep} />
                )}
                
                <div className={`w-full bg-slate-800 p-4 rounded-lg shadow-lg ${showTutorial && tutorialStep === 1 ? 'relative z-50' : ''}`}>
                  <div className="flex flex-col items-center">
                    <div className="flex justify-center items-center gap-2 mb-2" style={{ minHeight: '40px' }}>
                      {editingPlayer === currentPlayer && currentPlayer && currentPlayer !== 'Todos' ? (
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
                            onClick={() => handleStartEditingName(currentPlayer)}
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
                      availablePlayers={activePlayers}
                      isTutorialActive={showTutorial}
                    />
                    <div className="mt-4 border-t border-slate-700 w-full pt-4 flex justify-center">
                          <button
                              onClick={() => setIsSubstitutionModalOpen(true)}
                              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 ease-in-out transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500"
                          >
                              <SwitchIcon className="h-5 w-5" />
                              <span>Cambio de Jugador</span>
                          </button>
                      </div>
                  </div>
                </div>

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
                
                <Scoreboard totalPoints={totalPoints} />

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
                          {PERIOD_NAMES[period]}
                        </option>
                      ))}
                    </select>
                </div>

                <ShotLog shots={shots} playerNames={playerNames} />
              </>
            )}
            
            {gameMode === 'shot-chart' && activeTab === 'courtAnalysis' && (
              <div className="flex flex-col gap-8">
                  <div className="w-full bg-slate-800 p-1.5 rounded-lg shadow-lg flex justify-center max-w-xl mx-auto">
                      <button onClick={() => setMapView('shotmap')} className={getFilterButtonClass(mapView === 'shotmap')}>Mapa de Tiros</button>
                      <button onClick={() => setMapView('heatmap')} className={getFilterButtonClass(mapView === 'heatmap')}>Mapa de Calor</button>
                      <button onClick={() => setMapView('zonemap')} className={getFilterButtonClass(mapView === 'zonemap')}>Gráfico de Zonas</button>
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

                  <div className="w-full bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg flex flex-col sm:flex-row gap-8 justify-center">
                      <div className="flex-1">
                          <h3 className="text-xl font-bold mb-4 text-cyan-400 text-center">Filtrar Resultado</h3>
                          <div className="flex justify-center bg-slate-700 p-1 rounded-lg w-full max-w-xs mx-auto">
                              <button onClick={() => setAnalysisResultFilter('all')} className={getFilterButtonClass(analysisResultFilter === 'all')}>Todos</button>
                              <button onClick={() => setAnalysisResultFilter('goles')} className={getFilterButtonClass(analysisResultFilter === 'goles')}>Goles</button>
                              <button onClick={() => setAnalysisResultFilter('misses')} className={getFilterButtonClass(analysisResultFilter === 'misses')}>Fallos</button>
                          </div>
                      </div>
                      <div className="flex-1">
                          <h3 className="text-xl font-bold mb-4 text-cyan-400 text-center">Filtrar por Período</h3>
                          <div className="flex justify-center bg-slate-700 p-1 rounded-lg w-full max-w-xs mx-auto">
                              <button onClick={() => setAnalysisPeriodFilter('all')} className={getFilterButtonClass(analysisPeriodFilter === 'all')}>Ambos</button>
                              <button onClick={() => setAnalysisPeriodFilter('First Half')} className={getFilterButtonClass(analysisPeriodFilter === 'First Half')}>{PERIOD_NAMES['First Half']}</button>
                              <button onClick={() => setAnalysisPeriodFilter('Second Half')} className={getFilterButtonClass(analysisPeriodFilter === 'Second Half')}>{PERIOD_NAMES['Second Half']}</button>
                          </div>
                      </div>
                  </div>
              </div>
            )}

            {gameMode === 'shot-chart' && activeTab === 'statistics' && (
              <div className="flex flex-col gap-8">
                <StatisticsView 
                  stats={playerStats} 
                  playerNames={playerNames} 
                  shots={shots} 
                  onShareClick={() => setIsShareModalOpen(true)}
                  gameMode={gameMode}
                />
              </div>
            )}

            {gameMode === 'shot-chart' && activeTab === 'faq' && (
              <FaqView />
            )}

          </main>
        </div>
        
        <footer className="w-full text-center text-slate-500 text-xs mt-8 pb-4">
          Santiago Greco - Gresolutions © 2025
        </footer>
      </div>
    )
  }

  return (
    <>
      {pageContent}

      {/* --- MODALS --- */}
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
        tabs={tabsForCurrentMode}
      />

      {isPlayerSelectionModalOpen && actionToAssign && (
        <PlayerSelectionModal
            isOpen={isPlayerSelectionModalOpen}
            onClose={() => {
                setIsPlayerSelectionModalOpen(false);
                setActionToAssign(null);
            }}
            onSelectPlayer={handleAssignActionToPlayer}
            players={playersForTally}
            playerNames={playerNames}
            actionLabel={STAT_LABELS[actionToAssign]}
        />
      )}

      {isLoadGameModalOpen && (
        <LoadGameModal 
            onClose={() => setIsLoadGameModalOpen(false)} 
            onLoadGame={handleLoadGame} 
        />
      )}

      {isSaveGameModalOpen && (
        <SaveGameModal
            isOpen={isSaveGameModalOpen}
            onClose={() => setIsSaveGameModalOpen(false)}
            onSave={handleSyncToSupabase}
            syncState={syncState}
            initialGameName={gameState.settings.gameName}
        />
      )}
      
      {isSettingsModalOpen && (
        <SettingsModal 
            settings={settings}
            setSettings={handleSettingsChange}
            onClose={() => setIsSettingsModalOpen(false)}
            onRequestNewGame={handleRequestNewGame}
            onRequestReselectPlayers={handleRequestReselectPlayers}
            onRequestChangeMode={handleChangeMode}
            onRequestSaveGame={handleRequestSaveGame}
        />
      )}
      
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        gameState={gameState}
        playerStats={playerStats}
      />

      {isSubstitutionModalOpen && (
        <SubstitutionModal
            isOpen={isSubstitutionModalOpen}
            onClose={() => setIsSubstitutionModalOpen(false)}
            onSubstitute={handleSubstitution}
            activePlayers={activePlayers}
            availablePlayers={availablePlayers}
            playerNames={playerNames}
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
          message="¿Estás seguro? Volverás a la pantalla de selección para cambiar los jugadores del equipo."
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
    </>
  );
}

export default App;
