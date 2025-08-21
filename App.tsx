
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

// --- HELPER COMPONENT: ShareIcon ---
const ShareIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor">
        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
    </svg>
);

// --- HELPER COMPONENT: ZoneChart ---
type VisualZone = 'ARO' | 'FONDO' | 'CENTRO' | 'MEDIA_DISTANCIA' | 'TRIPLE' | 'IZQUIERDA' | 'DERECHA';

// Classifier function to bucket shots into one of the 7 granular zones, ensuring no overlaps.
const getVisualZoneForShot = (shot: Shot): VisualZone => {
    const { x, y } = shot.position;
    const basketCenter = { x: 10, y: 11 };
    // The distortion factor of the court container (aspect-[4/5]) vs the SVG viewbox (20x16)
    // To calculate distance in a visually circular way, we must scale the y-distance.
    const aspectRatioDistortion = (16 / 20) / (5 / 4); // (viewbox H/W) / (container H/W)
    const distToBasket = Math.sqrt(Math.pow(x - basketCenter.x, 2) + Math.pow((y - basketCenter.y) / aspectRatioDistortion, 2));
    const aroRadius = 2.5;

    // Highest priority: Aro (perfect circle as requested)
    if (distToBasket <= aroRadius) return 'ARO';

    // Then, check by vertical position (y-axis) to partition the rest of the court
    if (y < 1) return 'TRIPLE'; // Three-point area
    if (y < 6) return 'MEDIA_DISTANCIA'; // Full width between 3pt line and free throw line
    if (y > 11) return 'FONDO'; // Baseline zone

    // Remaining area is y between 6 and 11 (free-throw line up to basket area)
    // Partition this area horizontally
    if (x < 7) return 'IZQUIERDA';  // Left side
    if (x > 13) return 'DERECHA';   // Right side
    
    // The central rectangle is the Centro zone
    return 'CENTRO'; // x is between 7 and 13
};


// Configuration for each zone's name and label position (in SVG coordinates)
const zonesConfig: Record<VisualZone, { labelPos: { x: number; y: number }; name: string }> = {
    ARO: { labelPos: { x: 10, y: 5 }, name: "Aro" },
    FONDO: { labelPos: { x: 3.5, y: 2.5 }, name: "Fondo" },
    CENTRO: { labelPos: { x: 10, y: 7.5 }, name: "Centro" },
    MEDIA_DISTANCIA: { labelPos: { x: 10, y: 12.5 }, name: "Media Distancia" },
    TRIPLE: { labelPos: { x: 10, y: 14.8 }, name: "Triple" },
    IZQUIERDA: { labelPos: { x: 3.5, y: 7.5 }, name: "Izquierda" },
    DERECHA: { labelPos: { x: 16.5, y: 7.5 }, name: "Derecha" },
};


const getZoneColor = (goles: number, total: number) => {
    if (total === 0) return 'rgba(107, 114, 128, 0.2)'; // gray-500 for empty
    const percentage = (goles / total) * 100;
    if (percentage < 33.3) return 'rgba(59, 130, 246, 0.5)'; // blue-500 for cold
    if (percentage < 66.6) return 'rgba(234, 179, 8, 0.5)';  // yellow-500 for average
    return 'rgba(239, 68, 68, 0.5)'; // red-500 for hot
};

const ZoneChart: React.FC<{ shots: Shot[] }> = ({ shots }) => {
    const zoneStats = React.useMemo(() => {
        const stats: Record<VisualZone, { goles: number; total: number }> = {
            ARO: { goles: 0, total: 0 }, FONDO: { goles: 0, total: 0 }, CENTRO: { goles: 0, total: 0 },
            MEDIA_DISTANCIA: { goles: 0, total: 0 }, TRIPLE: { goles: 0, total: 0 },
            IZQUIERDA: { goles: 0, total: 0 }, DERECHA: { goles: 0, total: 0 },
        };
        shots.forEach(shot => {
            const zone = getVisualZoneForShot(shot);
            stats[zone].total++;
            if (shot.isGol) stats[zone].goles++;
        });
        return stats;
    }, [shots]);
    
    // Note: SVG y-coordinate is inverted from shot data y-coordinate.
    // Conversion: svg_y = 16 - data_y.
    const aroMaskId = "aro-mask";
    
    // To make a circle appear perfectly round in a distorted container (aspect-[4/5]),
    // we must render an ellipse that counteracts the distortion.
    // Distortion = (Container H/W) / (ViewBox H/W) = (5/4) / (16/20) = 1.25 / 0.8 = 1.5625
    // ry = rx / distortion_factor
    const rx = 2.5;
    const ry = 1.6; // 2.5 * ( (4/5) / (20/16) ) = 2.5 * (16/25) = 1.6


    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 20 16" preserveAspectRatio="none">
                <defs>
                    {/* A mask to cut out the 'Aro' ellipse from other zones */}
                    <mask id={aroMaskId}>
                        <rect x="0" y="0" width="20" height="16" fill="white" />
                        <ellipse cx="10" cy="5" rx={rx} ry={ry} fill="black" />
                    </mask>
                </defs>
                
                <g stroke="rgba(255, 255, 255, 0.5)" strokeWidth="0.05">
                    {/* Zones that do NOT need the mask (drawn first) */}
                    {/* Triple Zone (data_y: 0-1 -> svg_y: 15-16) */}
                    <rect x="0" y="15" width="20" height="1" fill={getZoneColor(zoneStats.TRIPLE.goles, zoneStats.TRIPLE.total)} />
                    {/* Media Distancia Zone (data_y: 1-6 -> svg_y: 10-15), full width */}
                    <rect x="0" y="10" width="20" height="5" fill={getZoneColor(zoneStats.MEDIA_DISTANCIA.goles, zoneStats.MEDIA_DISTANCIA.total)} />

                    {/* Masked Zones (These are all under/around the basket area) */}
                    <g mask={`url(#${aroMaskId})`}>
                        {/* Fondo Zone (data_y: 11-16 -> svg_y: 0-5) */}
                        <rect x="0" y="0" width="20" height="5" fill={getZoneColor(zoneStats.FONDO.goles, zoneStats.FONDO.total)} />
                        {/* Centro Zone (data_y: 6-11 -> svg_y: 5-10, x: 7-13) */}
                        <rect x="7" y="5" width="6" height="5" fill={getZoneColor(zoneStats.CENTRO.goles, zoneStats.CENTRO.total)} />
                        {/* Izquierda Zone (data_y: 6-11 -> svg_y: 5-10, x: 0-7) */}
                        <rect x="0" y="5" width="7" height="5" fill={getZoneColor(zoneStats.IZQUIERDA.goles, zoneStats.IZQUIERDA.total)} />
                        {/* Derecha Zone (data_y: 6-11 -> svg_y: 5-10, x: 13-20) */}
                        <rect x="13" y="5" width="7" height="5" fill={getZoneColor(zoneStats.DERECHA.goles, zoneStats.DERECHA.total)} />
                    </g>

                    {/* Aro Zone (drawn on top of everything, no mask needed) */}
                    <ellipse cx="10" cy="5" rx={rx} ry={ry} fill={getZoneColor(zoneStats.ARO.goles, zoneStats.ARO.total)} />
                </g>

                {/* Text labels (drawn last to be on top) */}
                {Object.entries(zonesConfig).map(([zoneKey, config]) => {
                    const zone = zoneKey as VisualZone;
                    const stats = zoneStats[zone];
                    const percentage = stats.total > 0 ? (stats.goles / stats.total) * 100 : 0;
                    const hasShots = stats.total > 0;
                    const isCompactZone = zone === 'CENTRO' || zone === 'MEDIA_DISTANCIA' || zone === 'FONDO' || zone === 'TRIPLE';

                    return (
                        <text
                            key={zone}
                            x={config.labelPos.x}
                            y={config.labelPos.y}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill="white"
                            fontSize={isCompactZone ? "0.7" : "0.8"}
                            fontWeight="bold"
                            className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
                        >
                            <tspan x={config.labelPos.x} dy={hasShots ? "-0.6em" : "0"}>{config.name}</tspan>
                            {hasShots && (
                                <>
                                    <tspan x={config.labelPos.x} dy="1.2em" fontSize={isCompactZone ? "0.9" : "1"} fontWeight="bold" fontFamily="monospace">
                                        {`${stats.goles}/${stats.total}`}
                                    </tspan>
                                    <tspan x={config.labelPos.x} dy="1.1em" fontSize="0.7" fill="rgba(209, 213, 219, 1)">
                                        {`${percentage.toFixed(0)}%`}
                                    </tspan>
                                </>
                            )}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
};


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
        manoCalienteThreshold: 5,
        isManoFriaEnabled: false,
        manoFriaThreshold: 5,
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
const HeatmapOverlay: React.FC<{ shots: Shot[] }> = ({ shots }) => {
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
  const [notificationPopup, setNotificationPopup] = useState<NotificationInfo | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempPlayerName, setTempPlayerName] = useState('');

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
    setAnalysisPlayer(prevPlayer => sortedPlayers.includes(prevPlayer) || prevPlayer === 'Todos' ? prevPlayer : 'Todos');
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
  
  const tabTranslations: {[key in AppTab]: string} = { logger: 'Registro', courtAnalysis: 'Análisis de Cancha', statistics: 'Estadísticas', aiAnalysis: 'Análisis con IA' };
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
            {activeTab === 'courtAnalysis' && 'Visualiza la ubicación y densidad de los tiros.'}
            {activeTab === 'statistics' && 'Revisa el rendimiento de los jugadores.'}
            {activeTab === 'aiAnalysis' && 'Próximamente: Análisis avanzado con IA.'}
          </p>
          <div className="absolute top-0 right-0 flex items-center">
            <button
                onClick={handleShare}
                className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                aria-label="Compartir aplicación"
                title="Compartir aplicación"
            >
                <ShareIcon className="h-7 w-7" />
            </button>
            <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                aria-label="Abrir configuración"
                title="Abrir configuración"
            >
                <GearIcon className="h-7 w-7" />
            </button>
          </div>
        </header>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8 border-b-2 border-gray-700">
          {(['logger', 'courtAnalysis', 'statistics', 'aiAnalysis'] as AppTab[]).map(tab => (
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
          
          {activeTab === 'courtAnalysis' && (
             <div className="flex flex-col gap-8">
                {/* View Switcher */}
                <div className="w-full bg-gray-800 p-1.5 rounded-lg shadow-lg flex justify-center max-w-xl mx-auto">
                    <button onClick={() => setMapView('shotmap')} className={getFilterButtonClass(mapView === 'shotmap')}>Mapa de Tiros</button>
                    <button onClick={() => setMapView('heatmap')} className={getFilterButtonClass(mapView === 'heatmap')}>Mapa de Calor</button>
                    <button onClick={() => setMapView('zonemap')} className={getFilterButtonClass(mapView === 'zonemap')}>Gráfico de Zonas</button>
                </div>
                
                {/* Player Selector */}
                <div className="w-full bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
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
                <div className="w-full bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg flex flex-col sm:flex-row gap-8 justify-center">
                    {/* Result Filter */}
                    <div className="flex-1">
                        <h3 className="text-xl font-bold mb-4 text-cyan-400 text-center">Filtrar Resultado</h3>
                        <div className="flex justify-center bg-gray-700 p-1 rounded-lg w-full max-w-xs mx-auto">
                            <button onClick={() => setAnalysisResultFilter('all')} className={getFilterButtonClass(analysisResultFilter === 'all')}>Todos</button>
                            <button onClick={() => setAnalysisResultFilter('goles')} className={getFilterButtonClass(analysisResultFilter === 'goles')}>Goles</button>
                            <button onClick={() => setAnalysisResultFilter('misses')} className={getFilterButtonClass(analysisResultFilter === 'misses')}>Fallos</button>
                        </div>
                    </div>
                    {/* Period Filter */}
                    <div className="flex-1">
                         <h3 className="text-xl font-bold mb-4 text-cyan-400 text-center">Filtrar por Período</h3>
                         <div className="flex justify-center bg-gray-700 p-1 rounded-lg w-full max-w-xs mx-auto">
                            <button onClick={() => setAnalysisPeriodFilter('all')} className={getFilterButtonClass(analysisPeriodFilter === 'all')}>Ambos</button>
                            <button onClick={() => setAnalysisPeriodFilter('First Half')} className={getFilterButtonClass(analysisPeriodFilter === 'First Half')}>{periodTranslations['First Half']}</button>
                            <button onClick={() => setAnalysisPeriodFilter('Second Half')} className={getFilterButtonClass(analysisPeriodFilter === 'Second Half')}>{periodTranslations['Second Half']}</button>
                         </div>
                    </div>
                </div>
             </div>
          )}

          {activeTab === 'statistics' && (
            <StatisticsView stats={playerStats} playerNames={playerNames} />
          )}

          {activeTab === 'aiAnalysis' && (
            <div className="relative bg-gray-800 p-8 rounded-lg shadow-lg">
                <div className="blur-sm pointer-events-none select-none">
                    {/* Fake chat UI */}
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0"></div>
                            <div className="bg-gray-700 p-3 rounded-lg w-3/4">
                                <div className="h-4 bg-gray-600 rounded w-5/6"></div>
                                <div className="h-4 bg-gray-600 rounded w-1/2 mt-2"></div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 justify-end">
                            <div className="bg-cyan-700 p-3 rounded-lg w-3/4">
                                <div className="h-4 bg-cyan-600 rounded w-full"></div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0"></div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0"></div>
                            <div className="bg-gray-700 p-3 rounded-lg w-1/2">
                                <div className="h-4 bg-gray-600 rounded w-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex items-center gap-3">
                        <div className="flex-grow h-12 bg-gray-700 rounded-lg"></div>
                        <div className="w-24 h-12 bg-gray-700 rounded-lg"></div>
                    </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 rounded-lg">
                    <span className="text-3xl font-bold text-cyan-400 bg-gray-900 px-6 py-3 rounded-lg shadow-xl">
                        Próximamente
                    </span>
                </div>
            </div>
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
