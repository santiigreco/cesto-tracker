
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { GameState, Shot, TallyStats, TallyStatsPeriod, GamePeriod } from '../types';
import { GAME_STATE_STORAGE_KEY } from '../constants';

const initialTallyStatsPeriod: TallyStatsPeriod = {
  goles: 0,
  triples: 0,
  fallos: 0,
  recuperos: 0,
  perdidas: 0,
  reboteOfensivo: 0,
  reboteDefensivo: 0,
  asistencias: 0,
  golesContra: 0,
  faltasPersonales: 0,
};

export const initialPlayerTally: TallyStats = {
    'First Half': { ...initialTallyStatsPeriod },
    'Second Half': { ...initialTallyStatsPeriod },
    'First Overtime': { ...initialTallyStatsPeriod },
    'Second Overtime': { ...initialTallyStatsPeriod },
};

export const initialGameState: GameState = {
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
        myTeam: '',
        tournamentId: '',
        tournamentName: 'Primera A - Apertura 2026', // Default tournament
        isManoCalienteEnabled: true,
        manoCalienteThreshold: 5,
        isManoFriaEnabled: true,
        manoFriaThreshold: 5,
    },
    playerStreaks: {},
    tutorialStep: 1,
    gameMode: null,
    tallyStats: {},
    opponentScore: 0,
    teamFouls: {
        'First Half': 0,
        'Second Half': 0,
        'First Overtime': 0,
        'Second Overtime': 0,
    },
    gameLog: [],
    tallyRedoLog: [],
    isReadOnly: false,
};

interface GameContextType {
    gameState: GameState;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    redoStack: Shot[];
    setRedoStack: React.Dispatch<React.SetStateAction<Shot[]>>;
    resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [gameState, setGameState] = useState<GameState>(initialGameState);
    const [redoStack, setRedoStack] = useState<Shot[]>([]);

    // Load from LocalStorage
    useEffect(() => {
        try {
            const savedStateJSON = localStorage.getItem(GAME_STATE_STORAGE_KEY);
            if (savedStateJSON) {
                let savedState = JSON.parse(savedStateJSON);
                
                // Migrations and defaults
                if (!savedState.gameId) savedState.gameId = null;
                if (!savedState.gameMode) savedState.gameMode = null;
                if (!savedState.tallyStats) savedState.tallyStats = {};
                if (!savedState.opponentScore) savedState.opponentScore = 0;
                
                // Migrate teamFouls to include OTs
                const defaultFouls = { 'First Half': 0, 'Second Half': 0, 'First Overtime': 0, 'Second Overtime': 0 };
                savedState.teamFouls = { ...defaultFouls, ...savedState.teamFouls };

                if (!savedState.gameLog) savedState.gameLog = [];
                if (!savedState.tallyRedoLog) savedState.tallyRedoLog = [];
                if (savedState.isReadOnly === undefined) savedState.isReadOnly = false;
                
                // Legacy Migration: tallyStats structure
                if (savedState.tallyStats) {
                    const allPeriods: GamePeriod[] = ['First Half', 'Second Half', 'First Overtime', 'Second Overtime'];
                    
                    Object.keys(savedState.tallyStats).forEach(playerNum => {
                        const playerTally = savedState.tallyStats[playerNum];
                        
                        // Ensure all periods exist
                        allPeriods.forEach(period => {
                            if (!playerTally[period]) {
                                playerTally[period] = { ...initialTallyStatsPeriod };
                            } else {
                                // Default missing fields within a period
                                if (playerTally[period].faltasPersonales === undefined) playerTally[period].faltasPersonales = 0;
                                if (playerTally[period].triples === undefined) playerTally[period].triples = 0;
                            }
                        });
                    });
                }

                if (savedState.availablePlayers && !savedState.activePlayers) {
                    savedState.activePlayers = savedState.availablePlayers.slice(0, 6);
                }
                
                // Tutorial state migration
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
            setGameState(initialGameState);
        }
    }, []);

    // Save to LocalStorage
    useEffect(() => {
        try {
            const gameStateJSON = JSON.stringify(gameState);
            localStorage.setItem(GAME_STATE_STORAGE_KEY, gameStateJSON);
        } catch (error) {
            console.error("Failed to save game state to localStorage:", error);
        }
    }, [gameState]);

    const resetGame = () => {
        setGameState(prev => ({
            ...initialGameState,
            hasSeenHomepage: true,
            tutorialStep: prev.tutorialStep === 3 ? 3 : 1,
            gameId: null,
            isReadOnly: false,
        }));
        setRedoStack([]);
    };

    return (
        <GameContext.Provider value={{ gameState, setGameState, redoStack, setRedoStack, resetGame }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGameContext = () => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGameContext must be used within a GameProvider');
    }
    return context;
};
