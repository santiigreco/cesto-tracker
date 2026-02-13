
import { useCallback, useState } from 'react';
import { useGameContext, initialGameState, initialPlayerTally } from '../context/GameContext';
import { Shot, ShotPosition, GameMode, Settings, StatAction, GameEvent } from '../types';

export const useGameLogic = () => {
    const { gameState, setGameState, redoStack, setRedoStack, resetGame } = useGameContext();
    const [notificationPopup, setNotificationPopup] = useState<{ type: 'caliente' | 'fria'; playerNumber: string } | null>(null);

    // --- SETUP ---
    const handleSetupComplete = useCallback((participatingPlayers: string[], newSettings: Settings, gameMode: GameMode, initialPlayerNames?: Record<string, string>) => {
        const sortedRoster = participatingPlayers.sort((a,b) => Number(a) - Number(b));
        
        setGameState(prev => {
            const isCorrection = prev.availablePlayers.length > 0 && prev.gameMode === gameMode;
            
            // If we are loading a team (initialPlayerNames provided), use that. 
            // Otherwise, if it's a correction, keep existing names. 
            // Otherwise, start empty.
            const playerNames = initialPlayerNames || (isCorrection ? prev.playerNames : {});
            
            const playerStreaks = isCorrection ? prev.playerStreaks : {};
            const tallyStats = isCorrection ? prev.tallyStats : {};

            // Ensure Equipo entry exists
            if (!tallyStats['Equipo']) {
                tallyStats['Equipo'] = JSON.parse(JSON.stringify(initialPlayerTally));
            }

            // Ensure all players have tally entries
            sortedRoster.forEach(p => {
                if (!tallyStats[p]) {
                    tallyStats[p] = JSON.parse(JSON.stringify(initialPlayerTally));
                }
            });

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
                isReadOnly: false,
                tallyStats, // Ensure updated tallyStats are set
            };
        });
    }, [setGameState]);

    const handlePlayerChange = useCallback((player: string) => {
        setGameState(prev => {
            const newState = {...prev, currentPlayer: player };
            if (prev.tutorialStep === 1) {
                newState.tutorialStep = 2;
            }
            return newState;
        })
    }, [setGameState]);

    const updatePlayerName = useCallback((playerNumber: string, newName: string) => {
        setGameState(prev => ({
            ...prev,
            playerNames: { ...prev.playerNames, [playerNumber]: newName.trim() }
        }));
    }, [setGameState]);

    const handleSubstitution = useCallback((playerOut: string, playerIn: string) => {
        setGameState(prev => {
            const newActivePlayers = prev.activePlayers.map(p => p === playerOut ? playerIn : p).sort((a, b) => Number(a) - Number(b));
            return {
                ...prev,
                activePlayers: newActivePlayers,
                currentPlayer: prev.currentPlayer === playerOut ? '' : prev.currentPlayer,
            };
        });
    }, [setGameState]);

    // --- TALLY LOGIC ---
    const handleUpdateTallyStat = useCallback((playerNumber: string, stat: StatAction, change: 1) => {
        if (gameState.isReadOnly) return;
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
            
            // Ensure deep copy to avoid mutation issues
            const playerTallyStats = prev.tallyStats[playerNumber] ? 
                JSON.parse(JSON.stringify(prev.tallyStats[playerNumber])) : 
                JSON.parse(JSON.stringify(initialPlayerTally));
                
            const currentPeriodStats = playerTallyStats[currentPeriod];

            const newPeriodStats = { ...currentPeriodStats, [stat]: currentPeriodStats[stat] + change };
            const newPlayerTallyStats = { ...playerTallyStats, [currentPeriod]: newPeriodStats };

            const newState = { 
                ...prev,
                tallyStats: { ...prev.tallyStats, [playerNumber]: newPlayerTallyStats },
                gameLog: newGameLog,
                tallyRedoLog: [],
            };

            if (stat === 'faltasPersonales' && playerNumber !== 'Equipo') {
                const newTeamFouls = { ...prev.teamFouls };
                newTeamFouls[currentPeriod] = newTeamFouls[currentPeriod] + change;
                newState.teamFouls = newTeamFouls;
            }
            
            // Streak logic for players (not 'Equipo' generally, but handled same way)
            if (change === 1 && (stat === 'goles' || stat === 'triples' || stat === 'fallos')) {
                const isScoring = stat === 'goles' || stat === 'triples';
                const currentStreak = prev.playerStreaks[playerNumber] || { consecutiveGoles: 0, consecutiveMisses: 0, notifiedCaliente: false, notifiedFria: false };
                let newStreak = { ...currentStreak };
                let triggeredNotification: { type: 'caliente' | 'fria', playerNumber: string } | null = null;
        
                if (isScoring) {
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
    }, [gameState.isReadOnly, setGameState]);

    const handleUndoTally = useCallback(() => {
        if (gameState.isReadOnly) return;
        setGameState(prev => {
            if (prev.gameLog.length === 0) return prev;

            const newGameLog = [...prev.gameLog];
            const eventToUndo = newGameLog.shift();
            if (!eventToUndo) return prev;

            const { playerNumber, action, period } = eventToUndo;

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
            
            if (action === 'faltasPersonales' && playerNumber !== 'Equipo') {
                const newTeamFouls = { ...prev.teamFouls };
                newTeamFouls[period] = Math.max(0, newTeamFouls[period] - 1);
                newState.teamFouls = newTeamFouls;
            }
            return newState;
        });
    }, [gameState.isReadOnly, setGameState]);

    const handleRedoTally = useCallback(() => {
        if (gameState.isReadOnly) return;
        setGameState(prev => {
            if (prev.tallyRedoLog.length === 0) return prev;
            
            const newTallyRedoLog = [...prev.tallyRedoLog];
            const eventToRedo = newTallyRedoLog.shift();
            if (!eventToRedo) return prev;

            const { playerNumber, action, period } = eventToRedo;

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

            if (action === 'faltasPersonales' && playerNumber !== 'Equipo') {
                const newTeamFouls = { ...prev.teamFouls };
                newTeamFouls[period]++;
                newState.teamFouls = newTeamFouls;
            }
            return newState;
        });
    }, [gameState.isReadOnly, setGameState]);

    // --- SHOT LOGIC ---
    const handleOutcomeSelection = useCallback((isGol: boolean, shotPosition: ShotPosition) => {
        if (gameState.isReadOnly) return;

        const HALF_COURT_LINE_Y = 1; 
        let golValue = 0;
        if (isGol) {
            golValue = shotPosition.y < HALF_COURT_LINE_Y ? 3 : 2;
        }

        const newShot: Shot = {
            id: new Date().toISOString() + Math.random(),
            playerNumber: gameState.currentPlayer,
            position: shotPosition,
            isGol,
            golValue,
            period: gameState.currentPeriod,
        };
        
        setGameState(prev => {
            const { playerNumber } = newShot;
            const currentStreak = prev.playerStreaks[playerNumber] || { consecutiveGoles: 0, consecutiveMisses: 0, notifiedCaliente: false, notifiedFria: false };
            let newStreak = { ...currentStreak };
            let triggeredNotification: { type: 'caliente' | 'fria', playerNumber: string } | null = null;
    
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
    }, [gameState.currentPlayer, gameState.currentPeriod, gameState.isReadOnly, setGameState, setRedoStack]);

    const handleUndoShot = useCallback(() => {
        if (gameState.isReadOnly) return;
        if (gameState.shots.length === 0) return;
        
        const lastShot = gameState.shots[gameState.shots.length - 1];
        setRedoStack(prev => [...prev, lastShot]);
        setGameState(prev => ({
            ...prev,
            shots: prev.shots.slice(0, -1)
        }));
    }, [gameState.shots, gameState.isReadOnly, setGameState, setRedoStack]);

    const handleRedoShot = useCallback(() => {
        if (gameState.isReadOnly) return;
        if (redoStack.length === 0) return;

        const shotToRedo = redoStack[redoStack.length - 1];
        setGameState(prev => ({
            ...prev,
            shots: [...prev.shots, shotToRedo]
        }));
        setRedoStack(prev => prev.slice(0, -1));
    }, [gameState.isReadOnly, redoStack, setGameState, setRedoStack]);

    const handleClearSheet = useCallback(() => {
        setGameState(prev => ({...prev, shots: [], playerStreaks: {}, gameLog: [], tallyStats: {}, tallyRedoLog: []}));
        setRedoStack([]);
    }, [setGameState, setRedoStack]);

    return {
        // State
        notificationPopup,
        setNotificationPopup,
        // Handlers
        handleSetupComplete,
        handlePlayerChange,
        updatePlayerName,
        handleSubstitution,
        handleUpdateTallyStat,
        handleUndoTally,
        handleRedoTally,
        handleOutcomeSelection,
        handleUndoShot,
        handleRedoShot,
        handleClearSheet,
        handleConfirmNewGame: resetGame
    };
};
