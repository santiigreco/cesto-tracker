


import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Shot, ShotPosition, GamePeriod, AppTab, HeatmapFilter, PlayerStats, MapPeriodFilter, Settings, GameState, PlayerStreak, GameMode, TallyStats, TallyStatsPeriod } from './types';
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


// TypeScript declaration for html2canvas global variable
declare const html2canvas: any;

// --- SUPABASE CLIENT SETUP ---
const supabaseUrl = 'https://druqnbzzibkrxffftogl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydXFuYnp6aWJrcnhmZmZ0b2dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwODAyOTcsImV4cCI6MjA3ODY1NjI5N30.AeFCR_oN71lu0qmS5isdrj4Wu40wSqcr5uM_gjjLzqw';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const GAME_STATE_STORAGE_KEY = 'cestoTrackerGameState';

const initialTallyStatsPeriod: TallyStatsPeriod = {
  goles: 0,
  fallos: 0,
  recuperos: 0,
  perdidas: 0,
  reboteOfensivo: 0,
  reboteDefensivo: 0,
  asistencias: 0,
  golesContra: 0,
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

// --- NEW IN-FILE COMPONENTS ---
const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
);

const MinusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
    </svg>
);

const CompactTallyStat: React.FC<{ label: string; value: number; onIncrement: () => void; onDecrement: () => void; }> = React.memo(({ label, value, onIncrement, onDecrement }) => (
    <div className="flex flex-col items-center p-2 bg-slate-700/50 rounded-md gap-2">
        <span className="text-xs sm:text-sm text-slate-300 text-center font-semibold">{label}</span>
        <div className="flex items-center gap-2">
            <button
                onClick={onDecrement}
                disabled={value <= 0}
                className="w-7 h-7 flex items-center justify-center bg-red-600 hover:bg-red-700 rounded-full text-white font-bold disabled:bg-slate-600 disabled:opacity-50 transition-colors"
                aria-label={`Decrementar ${label}`}
            >
                <MinusIcon className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-xl font-bold font-mono text-white">{value}</span>
            <button
                onClick={onIncrement}
                className="w-7 h-7 flex items-center justify-center bg-green-600 hover:bg-green-700 rounded-full text-white font-bold transition-colors"
                aria-label={`Incrementar ${label}`}
            >
                <PlusIcon className="w-4 h-4" />
            </button>
        </div>
    </div>
));

const statLabels: Record<keyof TallyStatsPeriod, string> = {
    goles: 'Goles',
    fallos: 'Fallos',
    recuperos: 'Recuperos',
    perdidas: 'Pérdidas',
    reboteOfensivo: 'Reb. Ofensivo',
    reboteDefensivo: 'Reb. Defensivo',
    asistencias: 'Asistencias',
    golesContra: 'Goles en Contra',
};


const PlayerTallyCard: React.FC<{
    playerNumber: string;
    playerName: string;
    isEditing: boolean;
    tempPlayerName: string;
    setTempPlayerName: (name: string) => void;
    onStartEdit: (player: string) => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    playerTally: TallyStatsPeriod;
    onUpdate: (playerNumber: string, stat: keyof TallyStatsPeriod, change: 1 | -1) => void;
}> = React.memo(({ playerNumber, playerName, isEditing, tempPlayerName, setTempPlayerName, onStartEdit, onSaveEdit, onCancelEdit, playerTally, onUpdate }) => {
    return (
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg">
            <div className="mb-4" style={{ minHeight: '40px' }}>
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={tempPlayerName}
                            onChange={(e) => setTempPlayerName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') onSaveEdit();
                                if (e.key === 'Escape') onCancelEdit();
                            }}
                            autoFocus
                            className="bg-slate-700 border border-slate-600 text-white text-xl rounded-lg focus:ring-cyan-500 focus:border-cyan-500 p-2 w-full"
                            placeholder={`Nombre para #${playerNumber}`}
                        />
                        <button onClick={onSaveEdit} className="p-2 rounded-full bg-green-600 hover:bg-green-700 text-white transition-colors" title="Guardar nombre" aria-label="Guardar nombre">
                            <CheckIcon className="h-5 w-5" />
                        </button>
                        <button onClick={onCancelEdit} className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors" title="Cancelar edición" aria-label="Cancelar edición">
                            <XIcon className="h-5 w-5" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => onStartEdit(playerNumber)}
                        className="group text-2xl font-bold text-cyan-400 p-2 -m-2 rounded-lg hover:bg-slate-700/50 transition-colors w-full text-left"
                        title="Editar nombre del jugador"
                        aria-label="Editar nombre del jugador"
                    >
                        <span className="group-hover:underline decoration-dotted underline-offset-4">
                            {playerName || `Jugador #${playerNumber}`}
                        </span>
                    </button>
                )}
            </div>
            <div className="grid grid-cols-2 gap-3">
                {Object.keys(statLabels).map(statKey => (
                    <CompactTallyStat
                        key={statKey}
                        label={statLabels[statKey as keyof TallyStatsPeriod]}
                        value={playerTally[statKey as keyof TallyStatsPeriod]}
                        onIncrement={() => onUpdate(playerNumber, statKey as keyof TallyStatsPeriod, 1)}
                        onDecrement={() => onUpdate(playerNumber, statKey as keyof TallyStatsPeriod, -1)}
                    />
                ))}
            </div>
        </div>
    );
});

const StatsTallyView: React.FC<{
    players: string[];
    playerNames: Record<string, string>;
    tallyStats: Record<string, TallyStats>;
    currentPeriod: GamePeriod;
    onUpdate: (playerNumber: string, stat: keyof TallyStatsPeriod, change: 1 | -1) => void;
    editingPlayer: string | null;
    tempPlayerName: string;
    setTempPlayerName: (name: string) => void;
    onStartEdit: (player: string) => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
}> = ({ players, playerNames, tallyStats, currentPeriod, onUpdate, editingPlayer, tempPlayerName, setTempPlayerName, onStartEdit, onSaveEdit, onCancelEdit }) => {
    return (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            {players.map(player => (
                <PlayerTallyCard
                    key={player}
                    playerNumber={player}
                    playerName={playerNames[player]}
                    isEditing={editingPlayer === player}
                    tempPlayerName={tempPlayerName}
                    setTempPlayerName={setTempPlayerName}
                    onStartEdit={onStartEdit}
                    onSaveEdit={onSaveEdit}
                    onCancelEdit={onCancelEdit}
                    playerTally={(tallyStats[player] || initialPlayerTally)[currentPeriod]}
                    onUpdate={onUpdate}
                />
            ))}
        </div>
    );
};


const ShareReport: React.FC<{ gameState: GameState, playerStats: PlayerStats[] }> = ({ gameState, playerStats }) => {
    const { shots, playerNames, gameMode, tallyStats, settings } = gameState;
    const showMaps = gameMode === 'shot-chart' && shots.length > 0;

    return (
        <div className="p-6 bg-slate-900 text-slate-200 font-sans">
            <h1 className="text-3xl font-bold text-cyan-400 text-center mb-2">{settings.gameName || 'Reporte de Partido'}</h1>
            <p className="text-center text-slate-400 mb-6">Generado con Cesto Tracker el {new Date().toLocaleDateString()}</p>
            
            <div className="space-y-8">
                <StatisticsView 
                    stats={playerStats} 
                    playerNames={playerNames} 
                    shots={shots} 
                    isSharing={true}
                    gameMode={gameMode}
                    tallyStats={tallyStats} 
                />

                {showMaps && (
                    <>
                        <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
                            <h2 className="text-3xl font-bold text-cyan-400 mb-4 text-center">Mapa de Tiros</h2>
                            <Court shots={shots} showShotMarkers={true} />
                        </div>
                        <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
                            <h2 className="text-3xl font-bold text-cyan-400 mb-4 text-center">Mapa de Calor</h2>
                            <Court shots={[]}>
                                <HeatmapOverlay shots={shots} />
                            </Court>
                        </div>
                        <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
                            <h2 className="text-3xl font-bold text-cyan-400 mb-4 text-center">Análisis de Zonas</h2>
                            <Court shots={[]}>
                                <ZoneChart shots={shots} />
                            </Court>
                        </div>
                    </>
                )}
            </div>
             <footer className="w-full text-center text-slate-500 text-xs mt-8 pt-4 border-t border-slate-700">
                Generado con Cesto Tracker 🏐{'\uFE0F'}
            </footer>
        </div>
    );
};


const ShareModal: React.FC<{ isOpen: boolean; onClose: () => void; gameState: GameState; playerStats: PlayerStats[] }> = ({ isOpen, onClose, gameState, playerStats }) => {
    const reportRef = useRef<HTMLDivElement>(null);
    const [isCapturing, setIsCapturing] = useState(false);

    const handleShare = async () => {
        if (!reportRef.current || isCapturing) return;
        setIsCapturing(true);
        try {
            const canvas = await html2canvas(reportRef.current, {
                backgroundColor: '#0f172a',
                useCORS: true,
                scale: 2,
            });
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
            if (!blob) throw new Error('No se pudo crear la imagen.');
            
            const file = new File([blob], 'reporte-cestotracker.png', { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Reporte de Partido de Cesto Tracker',
                    text: 'Aquí están las estadísticas completas del partido de Cestoball.',
                });
            } else {
                alert('La función de compartir archivos no está disponible en este navegador.');
            }
        } catch (error) {
            console.error('Error al compartir:', error);
            alert('Ocurrió un error al intentar compartir el reporte.');
        } finally {
            setIsCapturing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-cyan-400">Compartir Reporte Completo</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Cerrar">
                        <XIcon />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto custom-scrollbar">
                    <div ref={reportRef}>
                        <ShareReport gameState={gameState} playerStats={playerStats} />
                    </div>
                </div>
                <div className="p-4 border-t border-slate-700 flex-shrink-0">
                    <button
                        onClick={handleShare}
                        disabled={isCapturing}
                        className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 disabled:bg-slate-600 disabled:opacity-50"
                    >
                        <ShareIcon />
                        {isCapturing ? 'Generando imagen...' : 'Compartir como Imagen'}
                    </button>
                </div>
            </div>
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
        // A "correction" means we are editing an existing player list, not starting a fresh game.
        const isCorrection = prev.isSetupComplete;
        
        const playerNames = isCorrection ? prev.playerNames : {};
        const playerStreaks = isCorrection ? prev.playerStreaks : {};
        const tallyStats = isCorrection ? prev.tallyStats : {};

        // Initialize tally stats for any new players added to the roster
        sortedRoster.forEach(p => {
            if (!tallyStats[p]) {
                tallyStats[p] = JSON.parse(JSON.stringify(initialPlayerTally));
            }
        });

        return {
            ...prev,
            availablePlayers: sortedRoster,
            activePlayers: sortedRoster.slice(0, 6), // First 6 are starters for shot-chart mode
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
  

  const handleUpdateTallyStat = useCallback((playerNumber: string, stat: keyof TallyStatsPeriod, change: 1 | -1) => {
    setGameState(prev => {
        const { currentPeriod } = prev;
        const playerTallyStats = prev.tallyStats[playerNumber] || JSON.parse(JSON.stringify(initialPlayerTally));
        const currentPeriodStats = playerTallyStats[currentPeriod];

        const newPeriodStats = { ...currentPeriodStats, [stat]: Math.max(0, currentPeriodStats[stat] + change) };
        const newPlayerTallyStats = { ...playerTallyStats, [currentPeriod]: newPeriodStats };

        const newTallyState = {
            ...prev,
            tallyStats: { ...prev.tallyStats, [playerNumber]: newPlayerTallyStats }
        };

        // Streak logic only on increments (+1)
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
            } else { // is Fallo/Miss
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

            newTallyState.playerStreaks = { ...prev.playerStreaks, [playerNumber]: newStreak };
        }

        return newTallyState;
    });
  }, []);


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
      if (!playerNumber || playerNumber === 'Todos') return;
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
                    const shotsPayload = gameState.shots.map(shot => ({
                        game_id: newGameId,
                        player_number: shot.playerNumber,
                        position: shot.position,
                        is_gol: shot.isGol,
                        gol_value: shot.golValue,
                        period: shot.period,
                    }));
                    const { error: shotsError } = await supabase.from('shots').insert(shotsPayload);
                    if (shotsError) throw shotsError;
                }
            }
    
            // 3. Sync Tally Stats if in stats-tally mode
            if (gameState.gameMode === 'stats-tally' && Object.keys(gameState.tallyStats).length > 0) {
                const statsPayload: any[] = [];
                for (const playerNumber in gameState.tallyStats) {
                    const playerTally = gameState.tallyStats[playerNumber];
                    statsPayload.push({ game_id: newGameId, player_number: playerNumber, period: 'First Half', ...playerTally['First Half'] });
                    statsPayload.push({ game_id: newGameId, player_number: playerNumber, period: 'Second Half', ...playerTally['Second Half'] });
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
            const loadedShots: Shot[] = (shotsRes.data || []).map((s: any) => ({
                id: s.id, // Use Supabase UUID as the shot ID
                playerNumber: s.player_number,
                position: s.position,
                isGol: s.is_gol,
                golValue: s.gol_value,
                period: s.period,
            }));
            
            // Reconstruct Tally Stats
            const loadedTallyStats: Record<string, TallyStats> = {};
            (tallyRes.data || []).forEach((stat: any) => {
                const player = stat.player_number;
                if (!loadedTallyStats[player]) {
                    loadedTallyStats[player] = JSON.parse(JSON.stringify(initialPlayerTally));
                }
                loadedTallyStats[player][stat.period as GamePeriod] = {
                    goles: stat.goles,
                    fallos: stat.fallos,
                    recuperos: stat.recuperos,
                    perdidas: stat.perdidas,
                    reboteOfensivo: stat.rebote_ofensivo,
                    reboteDefensivo: stat.rebote_defensivo,
                    asistencias: stat.asistencias,
                    golesContra: stat.goles_contra,
                };
            });
            
            // Reconstruct Player Streaks from loaded data
            const loadedPlayerStreaks: Record<string, PlayerStreak> = {};
            // This is a complex calculation. For now, we reset streaks on load.
            // A more advanced implementation would re-calculate streaks by iterating through shots/stats.
            
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
      // FIX: Explicitly type the accumulator in reduce to prevent 'unknown' type errors.
      return Object.values(gameState.tallyStats).reduce((total: number, playerTally) => {
          const firstHalfGoles = playerTally?.['First Half']?.goles ?? 0;
          const secondHalfGoles = playerTally?.['Second Half']?.goles ?? 0;
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

  const periodTranslations: {[key in GamePeriod]: string} = { 'First Half': 'Primer Tiempo', 'Second Half': 'Segundo Tiempo' };
  const { shots, isSetupComplete, hasSeenHomepage, availablePlayers, activePlayers, playerNames, currentPlayer, currentPeriod, settings, tutorialStep, gameMode, tallyStats } = gameState;

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
                  <p className="text-base sm:text-lg text-slate-400 mt-1">
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
              <div className="flex flex-col gap-6">
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
                  <StatsTallyView
                      players={availablePlayers}
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
                          {periodTranslations[period]}
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
                              <button onClick={() => setAnalysisPeriodFilter('First Half')} className={getFilterButtonClass(analysisPeriodFilter === 'First Half')}>{periodTranslations['First Half']}</button>
                              <button onClick={() => setAnalysisPeriodFilter('Second Half')} className={getFilterButtonClass(analysisPeriodFilter === 'Second Half')}>{periodTranslations['Second Half']}</button>
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