import { useCallback } from 'react';
import { useGameContext, initialGameState, initialPlayerTally } from '../context/GameContext';
import { useUI } from '../context/UIContext';
import { GameMode, Settings, StatAction, GameEvent } from '../types';
import { generateLocalGameId } from '../utils/localGamesStorage';
import { getUserPreferences } from '../utils/userPreferences';

// Helper function moved outside the hook to ensure stability and avoid closure issues.
// Performs shallow immutable cloning on the target player & period so React.memo on PlayerTallyCard detects changes accurately.
const modifyStatValue = (tallyStats: any, player: string, period: string, action: StatAction, delta: number) => {
    const existingPlayerStats = tallyStats[player]
        ? { ...tallyStats[player] }
        : JSON.parse(JSON.stringify(initialPlayerTally));

    const existingPeriodStats = existingPlayerStats[period]
        ? { ...existingPlayerStats[period] }
        : JSON.parse(JSON.stringify(initialPlayerTally['First Half']));

    existingPeriodStats[action] = Math.max(0, (existingPeriodStats[action] || 0) + delta);
    existingPlayerStats[period] = existingPeriodStats;
    tallyStats[player] = existingPlayerStats;
};

export const useGameLogic = () => {
    const { gameState, setGameState, resetGame } = useGameContext();
    const { notificationPopup, setNotificationPopup } = useUI();
    const isReadOnly = gameState.isReadOnly;

    // --- SETUP ---
    const handleSetupComplete = useCallback((
        participatingPlayers: string[],
        newSettings: Settings,
        _gameMode?: GameMode,
        initialPlayerNames?: Record<string, string>,
        isEditMode: boolean = false
    ) => {
        const sortedRoster = [...participatingPlayers].sort((a, b) => Number(a) - Number(b));

        setGameState(prev => {
            const isCorrection = isEditMode;
            const playerNames = initialPlayerNames || (isCorrection ? prev.playerNames : {});

            if (isCorrection) {
                const tallyStats = { ...prev.tallyStats };
                if (!tallyStats['Equipo']) {
                    tallyStats['Equipo'] = JSON.parse(JSON.stringify(initialPlayerTally));
                }
                sortedRoster.forEach(p => {
                    if (!tallyStats[p]) {
                        tallyStats[p] = JSON.parse(JSON.stringify(initialPlayerTally));
                    }
                });

                return {
                    ...prev,
                    localId: prev.localId || generateLocalGameId(),
                    hasSeenHomepage: true,
                    availablePlayers: sortedRoster,
                    activePlayers: sortedRoster.slice(0, 6),
                    playerNames,
                    playerStreaks: prev.playerStreaks,
                    settings: newSettings,
                    isSetupComplete: true,
                    currentPlayer: '',
                    gameMode: 'stats-tally',
                    isReadOnly: false,
                    tallyStats,
                };
            }

            const tallyStats: Record<string, typeof initialPlayerTally> = {
                Equipo: JSON.parse(JSON.stringify(initialPlayerTally)),
            };
            sortedRoster.forEach(p => {
                tallyStats[p] = JSON.parse(JSON.stringify(initialPlayerTally));
            });

            return {
                ...initialGameState,
                gameId: null,
                localId: generateLocalGameId(),
                userId: null,
                shots: [],
                opponentScore: 0,
                currentPeriod: 'First Half',
                teamFouls: { ...initialGameState.teamFouls },
                gameLog: [],
                tallyRedoLog: [],
                hasSeenHomepage: true,
                availablePlayers: sortedRoster,
                activePlayers: sortedRoster.slice(0, 6),
                playerNames,
                playerStreaks: {},
                settings: newSettings,
                isSetupComplete: true,
                currentPlayer: '',
                gameMode: 'stats-tally',
                isReadOnly: false,
                tallyStats,
            };
        });
    }, [setGameState]);

    const updatePlayerName = useCallback((playerNumber: string, newName: string) => {
        setGameState(prev => ({
            ...prev,
            playerNames: { ...prev.playerNames, [playerNumber]: newName.trim() }
        }));
    }, [setGameState]);

    // --- TALLY LOGIC ---
    const handleUpdateTallyStat = useCallback((playerNumber: string, stat: StatAction, change: 1) => {
        if (!isReadOnly && (stat === 'goles' || stat === 'triples' || stat === 'faltasPersonales')) {
            try {
                if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function' && getUserPreferences().enableHaptics) {
                    navigator.vibrate(stat === 'faltasPersonales' ? [15, 30, 15] : 15);
                }
            } catch {
                // Ignore vibration API errors on unsupported browsers
            }
        }

        setGameState(prev => {
            if (prev.isReadOnly) return prev;
            const { currentPeriod } = prev;

            const newLogEntry: GameEvent = {
                id: new Date().toISOString() + Math.random(),
                timestamp: Date.now(),
                period: currentPeriod,
                playerNumber,
                action: stat
            };

            const newTallyStats = { ...prev.tallyStats };
            modifyStatValue(newTallyStats, playerNumber, currentPeriod, stat, change);

            // Streak Tracking (Hot/Cold Hand)
            const currentStreak = prev.playerStreaks[playerNumber] || {
                consecutiveGoles: 0,
                consecutiveMisses: 0,
                notifiedCaliente: false,
                notifiedFria: false
            };
            let newStreak = { ...currentStreak };
            let triggeredNotification: { type: 'caliente' | 'fria', playerNumber: string } | null = null;

            if (stat === 'goles' || stat === 'triples') {
                newStreak.consecutiveGoles += 1;
                newStreak.consecutiveMisses = 0;
                newStreak.notifiedFria = false;
                if (prev.settings.isManoCalienteEnabled && newStreak.consecutiveGoles >= prev.settings.manoCalienteThreshold && !newStreak.notifiedCaliente) {
                    triggeredNotification = { type: 'caliente', playerNumber };
                    newStreak.notifiedCaliente = true;
                }
            } else if (stat === 'fallos') {
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

            // Team fouls tracking
            let newTeamFouls = prev.teamFouls;
            if (stat === 'faltasPersonales' && playerNumber !== 'Equipo') {
                newTeamFouls = {
                    ...prev.teamFouls,
                    [currentPeriod]: (prev.teamFouls[currentPeriod] || 0) + 1
                };
            }

            return {
                ...prev,
                gameLog: [newLogEntry, ...prev.gameLog],
                tallyRedoLog: [],
                tallyStats: newTallyStats,
                playerStreaks: { ...prev.playerStreaks, [playerNumber]: newStreak },
                teamFouls: newTeamFouls
            };
        });
    }, [isReadOnly, setGameState, setNotificationPopup]);

    const handleUndoTally = useCallback(() => {
        setGameState(prev => {
            if (prev.isReadOnly || prev.gameLog.length === 0) return prev;

            const [lastEvent, ...remainingLog] = prev.gameLog;
            const newTallyStats = { ...prev.tallyStats };
            modifyStatValue(newTallyStats, lastEvent.playerNumber, lastEvent.period, lastEvent.action, -1);

            let newTeamFouls = prev.teamFouls;
            if (lastEvent.action === 'faltasPersonales' && lastEvent.playerNumber !== 'Equipo') {
                newTeamFouls = {
                    ...prev.teamFouls,
                    [lastEvent.period]: Math.max(0, (prev.teamFouls[lastEvent.period] || 0) - 1)
                };
            }

            return {
                ...prev,
                gameLog: remainingLog,
                tallyRedoLog: [lastEvent, ...prev.tallyRedoLog],
                tallyStats: newTallyStats,
                teamFouls: newTeamFouls
            };
        });
    }, [setGameState]);

    const handleRedoTally = useCallback(() => {
        setGameState(prev => {
            if (prev.isReadOnly || prev.tallyRedoLog.length === 0) return prev;

            const [eventToRedo, ...remainingRedo] = prev.tallyRedoLog;
            const newTallyStats = { ...prev.tallyStats };
            modifyStatValue(newTallyStats, eventToRedo.playerNumber, eventToRedo.period, eventToRedo.action, 1);

            let newTeamFouls = prev.teamFouls;
            if (eventToRedo.action === 'faltasPersonales' && eventToRedo.playerNumber !== 'Equipo') {
                newTeamFouls = {
                    ...prev.teamFouls,
                    [eventToRedo.period]: (prev.teamFouls[eventToRedo.period] || 0) + 1
                };
            }

            return {
                ...prev,
                gameLog: [eventToRedo, ...prev.gameLog],
                tallyRedoLog: remainingRedo,
                tallyStats: newTallyStats,
                teamFouls: newTeamFouls
            };
        });
    }, [setGameState]);

    const handleDeleteGameEvent = useCallback((eventId: string) => {
        setGameState(prev => {
            if (prev.isReadOnly) return prev;
            const eventToDelete = prev.gameLog.find(e => e.id === eventId);
            if (!eventToDelete) return prev;

            const newLog = prev.gameLog.filter(e => e.id !== eventId);
            const newTallyStats = { ...prev.tallyStats };
            modifyStatValue(newTallyStats, eventToDelete.playerNumber, eventToDelete.period, eventToDelete.action, -1);

            let newTeamFouls = prev.teamFouls;
            if (eventToDelete.action === 'faltasPersonales' && eventToDelete.playerNumber !== 'Equipo') {
                newTeamFouls = {
                    ...prev.teamFouls,
                    [eventToDelete.period]: Math.max(0, (prev.teamFouls[eventToDelete.period] || 0) - 1)
                };
            }

            return {
                ...prev,
                gameLog: newLog,
                tallyStats: newTallyStats,
                teamFouls: newTeamFouls
            };
        });
    }, [setGameState]);

    const handleEditGameEvent = useCallback((oldEventOrId: GameEvent | string, newPlayer: string, newAction: StatAction) => {
        setGameState(prev => {
            if (prev.isReadOnly) return prev;
            const targetId = typeof oldEventOrId === 'string' ? oldEventOrId : oldEventOrId.id;
            const eventIndex = prev.gameLog.findIndex(e => e.id === targetId);
            if (eventIndex === -1) return prev;

            const existingEvent = prev.gameLog[eventIndex];
            const newTallyStats = { ...prev.tallyStats };
            modifyStatValue(newTallyStats, existingEvent.playerNumber, existingEvent.period, existingEvent.action, -1);
            modifyStatValue(newTallyStats, newPlayer, existingEvent.period, newAction, 1);

            const updatedEvent: GameEvent = {
                ...existingEvent,
                playerNumber: newPlayer,
                action: newAction
            };

            const newLog = [...prev.gameLog];
            newLog[eventIndex] = updatedEvent;

            const newState = {
                ...prev,
                gameLog: newLog,
                tallyStats: newTallyStats
            };

            const wasPlayerFoul = existingEvent.action === 'faltasPersonales' && existingEvent.playerNumber !== 'Equipo';
            const isPlayerFoul = newAction === 'faltasPersonales' && newPlayer !== 'Equipo';

            if (wasPlayerFoul !== isPlayerFoul) {
                const newTeamFouls = { ...prev.teamFouls };
                if (wasPlayerFoul) newTeamFouls[existingEvent.period] = Math.max(0, newTeamFouls[existingEvent.period] - 1);
                if (isPlayerFoul) newTeamFouls[existingEvent.period] = (newTeamFouls[existingEvent.period] || 0) + 1;
                newState.teamFouls = newTeamFouls;
            }

            return newState;
        });
    }, [setGameState]);

    const handleClearSheet = useCallback(() => {
        setGameState(prev => ({ ...prev, shots: [], playerStreaks: {}, gameLog: [], tallyStats: {}, tallyRedoLog: [] }));
    }, [setGameState]);

    return {
        // State
        notificationPopup,
        setNotificationPopup,
        // Handlers
        handleSetupComplete,
        updatePlayerName,
        handleUpdateTallyStat,
        handleUndoTally,
        handleRedoTally,
        handleClearSheet,
        handleConfirmNewGame: resetGame,
        handleDeleteGameEvent,
        handleEditGameEvent
    };
};
