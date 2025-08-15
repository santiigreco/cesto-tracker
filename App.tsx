
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Shot, ShotPosition, GamePeriod, AppTab, HeatmapFilter, PlayerStats, MapPeriodFilter, Settings } from './types';
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
import PencilIcon from './components/PencilIcon';
import UndoIcon from './components/UndoIcon';
import TrashIcon from './components/TrashIcon';


// TypeScript declaration for html2canvas global variable
declare const html2canvas: any;

// Constants for Heatmap
const HEATMAP_POINT_RADIUS = 40; // px, increased for more intensity
const HEATMAP_BLUR = 25; // px, increased for more intensity
const HEATMAP_OPACITY = 0.7; // increased opacity

interface NotificationInfo {
    type: 'caliente' | 'fria';
    playerNumber: string;
}

interface PlayerStreak {
    consecutiveGoles: number;
    consecutiveMisses: number;
    notifiedCaliente: boolean;
    notifiedFria: boolean;
}

/**
 * The Heatmap overlay component.
 * It renders a visual representation of shot density.
 */
const HeatmapOverlay: React.FC<{ shots: Shot[], filter: HeatmapFilter }> = ({ shots }) => {
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
  const [shots, setShots] = useState<Shot[]>([]);
  // Setup State
  const [isSetupComplete, setIsSetupComplete] = useState<boolean>(false);
  const [availablePlayers, setAvailablePlayers] = useState<string[]>([]);
  // Player State
  const [playerNames, setPlayerNames] = useState<Record<string, string>>({});
  // Logger State
  const [currentPlayer, setCurrentPlayer] = useState<string>('1');
  const [currentPeriod, setCurrentPeriod] = useState<GamePeriod>('First Half');
  const [pendingShotPosition, setPendingShotPosition] = useState<ShotPosition | null>(null);
  const [isUndoModalOpen, setIsUndoModalOpen] = useState(false);
  const [isClearSheetModalOpen, setIsClearSheetModalOpen] = useState(false);
  // UI State
  const [activeTab, setActiveTab] = useState<AppTab>('logger');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  // Heatmap State
  const [heatmapPlayer, setHeatmapPlayer] = useState<string>('Todos');
  const [heatmapFilter, setHeatmapFilter] = useState<HeatmapFilter>('all');
  // Shotmap State
  const [shotmapPlayer, setShotmapPlayer] = useState<string>('Todos');
  const [shotmapResultFilter, setShotmapResultFilter] = useState<HeatmapFilter>('all');
  // Shared Map Filter State
  const [mapPeriodFilter, setMapPeriodFilter] = useState<MapPeriodFilter>('all');

  // "Mano Caliente / Fría" Feature State
  const [settings, setSettings] = useState<Settings>({
    isManoCalienteEnabled: true,
    manoCalienteThreshold: 3,
    isManoFriaEnabled: true,
    manoFriaThreshold: 3,
  });
  const [playerStreaks, setPlayerStreaks] = useState<Record<string, PlayerStreak>>({});
  const [notificationPopup, setNotificationPopup] = useState<NotificationInfo | null>(null);


  const heatmapCourtRef = useRef<HTMLDivElement>(null);

  // --- HANDLERS ---
  const handleSetupComplete = useCallback((selectedPlayers: string[], newSettings: Settings) => {
    if (selectedPlayers.length === 0) {
        alert('Debes seleccionar al menos un jugador.');
        return;
    }
    const sortedPlayers = selectedPlayers.sort((a,b) => Number(a) - Number(b));
    setAvailablePlayers(sortedPlayers);
    setSettings(newSettings);
    // Set default selections
    setCurrentPlayer(sortedPlayers[0]);
    setHeatmapPlayer('Todos'); // 'Todos' is a good default for maps
    setShotmapPlayer('Todos');
    setIsSetupComplete(true);
  }, []);
  
  const handleCourtClick = useCallback((position: ShotPosition) => {
    if (!currentPlayer.trim() || currentPlayer === 'Todos') {
      alert('Por favor, selecciona un jugador antes de marcar un tiro.');
      return;
    }
    setPendingShotPosition(position);
  }, [currentPlayer]);

  const handleOutcomeSelection = useCallback((isGol: boolean) => {
    if (pendingShotPosition) {
      const HALF_COURT_LINE_Y = 1; // From Court.tsx, represents the behind-the-arc line
      let golValue = 0;
      if (isGol) {
        // If shot y-position is below the line, it's a triple (3 points). Otherwise, it's 2.
        golValue = pendingShotPosition.y < HALF_COURT_LINE_Y ? 3 : 2;
      }

      const newShot: Shot = {
        id: new Date().toISOString() + Math.random(),
        playerNumber: currentPlayer,
        position: pendingShotPosition,
        isGol,
        golValue,
        period: currentPeriod,
      };
      
      // Update streaks and check for notifications
      const { playerNumber } = newShot;
      const currentStreak = playerStreaks[playerNumber] || { consecutiveGoles: 0, consecutiveMisses: 0, notifiedCaliente: false, notifiedFria: false };
      let newStreak = { ...currentStreak };
      let triggeredNotification: NotificationInfo | null = null;

      if (isGol) {
        newStreak.consecutiveGoles += 1;
        newStreak.consecutiveMisses = 0;
        newStreak.notifiedFria = false; // Reset opposite streak flag
        if (settings.isManoCalienteEnabled && newStreak.consecutiveGoles >= settings.manoCalienteThreshold && !newStreak.notifiedCaliente) {
          triggeredNotification = { type: 'caliente', playerNumber };
          newStreak.notifiedCaliente = true; // Mark as notified for this streak
        }
      } else { // is Miss
        newStreak.consecutiveMisses += 1;
        newStreak.consecutiveGoles = 0;
        newStreak.notifiedCaliente = false; // Reset opposite streak flag
        if (settings.isManoFriaEnabled && newStreak.consecutiveMisses >= settings.manoFriaThreshold && !newStreak.notifiedFria) {
          triggeredNotification = { type: 'fria', playerNumber };
          newStreak.notifiedFria = true; // Mark as notified for this streak
        }
      }
      setPlayerStreaks(prev => ({ ...prev, [playerNumber]: newStreak }));

      setShots(prevShots => [...prevShots, newShot]);
      setPendingShotPosition(null);

      // Show notification after a brief delay
      if (triggeredNotification) {
        setTimeout(() => setNotificationPopup(triggeredNotification), 200);
      }
    }
  }, [currentPlayer, pendingShotPosition, currentPeriod, playerStreaks, settings]);
  
  const handleEditPlayerName = useCallback(() => {
    if (!currentPlayer || currentPlayer === 'Todos') return;
    const currentName = playerNames[currentPlayer] || '';
    const newName = prompt(`Ingresa el nombre para el jugador #${currentPlayer}:`, currentName);
    if (newName !== null) { // prompt returns null if cancelled
      setPlayerNames(prev => ({
        ...prev,
        [currentPlayer]: newName.trim(),
      }));
    }
  }, [currentPlayer, playerNames]);
  
  const handleRequestUndo = useCallback(() => {
    if (shots.length > 0) {
      setIsUndoModalOpen(true);
    }
  }, [shots.length]);
  
  const handleConfirmUndo = useCallback(() => {
    // Note: This simple undo does not revert the streak counters,
    // as it would add significant complexity. It just removes the shot.
    setShots(prevShots => prevShots.slice(0, -1));
    setIsUndoModalOpen(false);
  }, []);
  
  const handleCancelUndo = useCallback(() => {
    setIsUndoModalOpen(false);
  }, []);

  const handleRequestClearSheet = useCallback(() => {
    if (shots.length > 0) {
      setIsClearSheetModalOpen(true);
    }
  }, [shots.length]);

  const handleConfirmClearSheet = useCallback(() => {
    setShots([]);
    setPlayerStreaks({}); // Also reset streaks
    setIsClearSheetModalOpen(false);
  }, []);

  const handleCancelClearSheet = useCallback(() => {
    setIsClearSheetModalOpen(false);
  }, []);

  const handleCancelShot = useCallback(() => setPendingShotPosition(null), []);

  const handleDownloadHeatmap = useCallback(() => {
    if (heatmapCourtRef.current && typeof html2canvas === 'function') {
      html2canvas(heatmapCourtRef.current, {
        backgroundColor: null, // Let html2canvas use the element's background
        useCORS: true,
      }).then((canvas: HTMLCanvasElement) => {
        const link = document.createElement('a');
        link.download = `cestoball-mapa-calor-${heatmapPlayer.replace(' ', '_')}-${heatmapFilter}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  }, [heatmapPlayer, heatmapFilter]);
  
  const handleSettingsChange = useCallback((newSettings: Settings) => {
    // Check if thresholds have changed before resetting streaks.
    const calienteThresholdChanged = newSettings.manoCalienteThreshold !== settings.manoCalienteThreshold;
    const friaThresholdChanged = newSettings.manoFriaThreshold !== settings.manoFriaThreshold;

    if (calienteThresholdChanged || friaThresholdChanged) {
        // Reset all player streaks to ensure new thresholds are applied cleanly from zero.
        setPlayerStreaks({});
    }
    
    setSettings(newSettings);
  }, [settings]); // The dependency on 'settings' is crucial.

  // --- MEMOIZED DERIVED STATE ---
  const filteredHeatmapShots = useMemo(() => {
    return shots.filter(shot => {
      const playerMatch = heatmapPlayer === 'Todos' || shot.playerNumber === heatmapPlayer;
      if (!playerMatch) return false;
      
      const periodMatch = mapPeriodFilter === 'all' || shot.period === mapPeriodFilter;
      if (!periodMatch) return false;

      switch (heatmapFilter) {
        case 'goles': return shot.isGol;
        case 'misses': return !shot.isGol;
        case 'all':
        default: return true;
      }
    });
  }, [shots, heatmapPlayer, heatmapFilter, mapPeriodFilter]);
  
  const filteredShotmapShots = useMemo(() => {
    return shots.filter(shot => {
        const playerMatch = shotmapPlayer === 'Todos' || shot.playerNumber === shotmapPlayer;
        const periodMatch = mapPeriodFilter === 'all' || shot.period === mapPeriodFilter;
        
        const resultMap = {
            'all': true,
            'goles': shot.isGol,
            'misses': !shot.isGol
        };
        const resultMatch = resultMap[shotmapResultFilter];

        return playerMatch && periodMatch && resultMatch;
    });
  }, [shots, shotmapPlayer, mapPeriodFilter, shotmapResultFilter]);

  const playerStats = useMemo<PlayerStats[]>(() => {
    const statsMap = new Map<string, { totalShots: number; totalGoles: number; totalPoints: number }>();

    shots.forEach(shot => {
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
  }, [shots]);
  
  const tabTranslations: {[key in AppTab]: string} = {
    logger: 'Registro',
    heatmap: 'Mapa de Calor',
    shotmap: 'Mapa de Tiros',
    statistics: 'Estadísticas'
  }
  
  const periodTranslations: {[key in GamePeriod]: string} = {
      'First Half': 'Primer Tiempo',
      'Second Half': 'Segundo Tiempo'
  }

  // --- RENDER ---
  if (!isSetupComplete) {
    return <PlayerSetup onSetupComplete={handleSetupComplete} />;
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans">
      <div className="w-full max-w-4xl flex-grow">
        <header className="relative text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400 tracking-tight">Cesto Tracker</h1>
          <p className="text-lg text-gray-400 mt-2">
            {activeTab === 'logger' && 'Registra tiros o cambia de pestaña para analizar.'}
            {activeTab === 'heatmap' && 'Analiza la densidad de tiros de un jugador.'}
            {activeTab === 'shotmap' && 'Visualiza la ubicación de cada tiro en la cancha.'}
            {activeTab === 'statistics' && 'Revisa el rendimiento de los jugadores.'}
          </p>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="absolute top-0 right-0 p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
            aria-label="Abrir configuración"
            title="Abrir configuración"
          >
            <GearIcon className="h-7 w-7" />
          </button>
        </header>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8 border-b-2 border-gray-700">
          {(['logger', 'heatmap', 'shotmap', 'statistics'] as AppTab[]).map(tab => (
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

        <main className="flex flex-col gap-8">
          {activeTab === 'logger' && (
            <>
              {/* Period Selector */}
              <div className="w-full bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-cyan-400 mb-4 text-center">Sesión Actual</h2>
                <div className="flex justify-center">
                  <select
                    id="period-selector"
                    value={currentPeriod}
                    onChange={(e) => setCurrentPeriod(e.target.value as GamePeriod)}
                    className="w-full max-w-xs bg-gray-700 border border-gray-600 text-white text-lg rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-3"
                  >
                    {(['First Half', 'Second Half'] as GamePeriod[]).map((period) => (
                      <option key={period} value={period}>
                        {periodTranslations[period]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Logger Player Selector */}
              <div className="w-full bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
                <div className="flex justify-center items-center gap-4 mb-4">
                  <h2 className="text-2xl font-bold text-cyan-400 text-center">
                    {playerNames[currentPlayer] ? `${playerNames[currentPlayer]} (#${currentPlayer})` : `Jugador #${currentPlayer}`}
                  </h2>
                  <button
                    onClick={handleEditPlayerName}
                    className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!currentPlayer || currentPlayer === 'Todos'}
                    title="Editar nombre del jugador"
                    aria-label="Editar nombre del jugador"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                </div>
                <PlayerSelector currentPlayer={currentPlayer} setCurrentPlayer={setCurrentPlayer} playerNames={playerNames} availablePlayers={availablePlayers} />
              </div>

              {/* Action Buttons & Court */}
              <div className="w-full flex flex-col gap-4">
                <div className="flex justify-end gap-4">
                    <button
                        onClick={handleRequestUndo}
                        disabled={shots.length === 0}
                        className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-yellow-500 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        aria-label="Deshacer último tiro"
                    >
                        <UndoIcon className="h-5 w-5" />
                        <span className="hidden sm:inline">Deshacer</span>
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
                <Court
                  shots={shots}
                  onCourtClick={handleCourtClick}
                  showShotMarkers={true}
                  currentPlayer={currentPlayer}
                />
              </div>

              {/* Player Performance & Actions */}
              <div className="w-full">
                <ShotLog shots={shots} stats={playerStats} playerNames={playerNames}/>
              </div>
            </>
          )}
          
          {activeTab === 'shotmap' && (
             <div className="flex flex-col gap-8">
                {/* Filters container */}
                <div className="w-full bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg flex flex-col sm:flex-row gap-8 justify-center">
                    {/* Result Filter */}
                    <div className="flex-1">
                        <label htmlFor="shotmap-result-filter" className="block text-xl font-bold mb-4 text-cyan-400 text-center">Filtrar Resultado</label>
                        <div className="flex justify-center">
                            <select
                                id="shotmap-result-filter"
                                value={shotmapResultFilter}
                                onChange={(e) => setShotmapResultFilter(e.target.value as HeatmapFilter)}
                                className="w-full max-w-xs bg-gray-700 border border-gray-600 text-white text-lg rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-3"
                            >
                                <option value="all">Todos</option>
                                <option value="goles">Goles</option>
                                <option value="misses">Fallos</option>
                            </select>
                        </div>
                    </div>
                    {/* Period Filter */}
                    <div className="flex-1">
                         <label htmlFor="shotmap-period-filter" className="block text-xl font-bold mb-4 text-cyan-400 text-center">Filtrar por Período</label>
                         <div className="flex justify-center">
                            <select
                                id="shotmap-period-filter"
                                value={mapPeriodFilter}
                                onChange={(e) => setMapPeriodFilter(e.target.value as MapPeriodFilter)}
                                className="w-full max-w-xs bg-gray-700 border border-gray-600 text-white text-lg rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-3"
                            >
                                <option value="all">Ambos</option>
                                <option value="First Half">{periodTranslations['First Half']}</option>
                                <option value="Second Half">{periodTranslations['Second Half']}</option>
                            </select>
                         </div>
                    </div>
                </div>
                
                {/* Shotmap Player Selector */}
                <div className="w-full bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
                   <h2 className="text-2xl font-bold mb-4 text-cyan-400 text-center">Seleccionar Jugador</h2>
                  <PlayerSelector currentPlayer={shotmapPlayer} setCurrentPlayer={setShotmapPlayer} showAllPlayersOption={true} playerNames={playerNames} availablePlayers={availablePlayers} />
                </div>

                {/* Court for Shotmap */}
                <div className="w-full">
                  <Court shots={filteredShotmapShots} showShotMarkers={true} />
                </div>
             </div>
          )}

          {activeTab === 'heatmap' && (
            <>
              <div className="flex flex-col gap-8">
                {/* Filters container */}
                <div className="w-full bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg flex flex-col sm:flex-row gap-8 justify-center">
                    {/* Result Filter */}
                    <div className="flex-1">
                        <label htmlFor="heatmap-filter" className="block text-xl font-bold mb-4 text-cyan-400 text-center">Filtrar Resultado</label>
                        <div className="flex justify-center">
                            <select
                                id="heatmap-filter"
                                value={heatmapFilter}
                                onChange={(e) => setHeatmapFilter(e.target.value as HeatmapFilter)}
                                className="w-full max-w-xs bg-gray-700 border border-gray-600 text-white text-lg rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-3"
                            >
                                <option value="all">Todos</option>
                                <option value="goles">Goles</option>
                                <option value="misses">Fallos</option>
                            </select>
                        </div>
                    </div>
                    {/* Period Filter */}
                    <div className="flex-1">
                         <label htmlFor="heatmap-period-filter" className="block text-xl font-bold mb-4 text-cyan-400 text-center">Filtrar por Período</label>
                         <div className="flex justify-center">
                            <select
                                id="heatmap-period-filter"
                                value={mapPeriodFilter}
                                onChange={(e) => setMapPeriodFilter(e.target.value as MapPeriodFilter)}
                                className="w-full max-w-xs bg-gray-700 border border-gray-600 text-white text-lg rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-3"
                            >
                                <option value="all">Ambos</option>
                                <option value="First Half">{periodTranslations['First Half']}</option>
                                <option value="Second Half">{periodTranslations['Second Half']}</option>
                            </select>
                         </div>
                    </div>
                </div>

                {/* Heatmap Player Selector */}
                <div className="w-full bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
                   <h2 className="text-2xl font-bold mb-4 text-cyan-400 text-center">Seleccionar Jugador</h2>
                  <PlayerSelector currentPlayer={heatmapPlayer} setCurrentPlayer={setHeatmapPlayer} showAllPlayersOption={true} playerNames={playerNames} availablePlayers={availablePlayers} />
                </div>
                
                {/* Court for Heatmap */}
                <div ref={heatmapCourtRef} className="w-full">
                  <Court shots={[]} showShotMarkers={false}>
                    <HeatmapOverlay shots={filteredHeatmapShots} filter={heatmapFilter} />
                  </Court>
                </div>
              </div>

              {/* Download Button */}
              <div className="mt-4 flex justify-end">
                <button
                    onClick={handleDownloadHeatmap}
                    className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
                    aria-label="Descargar mapa de calor como imagen"
                >
                    <DownloadIcon className="h-4 w-4 sm:h-5 sm:w-5"/>
                    <span>Descargar</span>
                </button>
              </div>
            </>
          )}

          {activeTab === 'statistics' && (
            <StatisticsView stats={playerStats} playerNames={playerNames} />
          )}
        </main>
      </div>
      
      <footer className="w-full text-center text-gray-500 text-xs mt-8 pb-4">
        Santiago Greco - All rights reserved. Gresolutions © 2025
      </footer>
      
      {isSettingsModalOpen && (
        <SettingsModal 
            settings={settings}
            setSettings={handleSettingsChange}
            onClose={() => setIsSettingsModalOpen(false)}
        />
      )}

      {pendingShotPosition && (
        <OutcomeModal onOutcomeSelect={handleOutcomeSelection} onClose={handleCancelShot} />
      )}
      
      {isUndoModalOpen && (
        <ConfirmationModal
            title="Confirmar Acción"
            message="¿Estás seguro de que quieres deshacer el último tiro registrado? Esta acción no se puede revertir."
            confirmText="Sí, deshacer"
            cancelText="Cancelar"
            onConfirm={handleConfirmUndo}
            onClose={handleCancelUndo}
            confirmButtonColor="bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500"
        />
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
