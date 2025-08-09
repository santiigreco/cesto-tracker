
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Shot, ShotPosition, GamePeriod, AppTab, HeatmapFilter, PlayerStats } from './types';
import Court from './components/Court';
import ShotLog from './components/ShotLog';
import PlayerSelector from './components/PlayerSelector';
import OutcomeModal from './components/OutcomeModal';
import StatisticsView from './components/StatisticsView';

// TypeScript declaration for html2canvas global variable
declare const html2canvas: any;

// Constants for Heatmap
const HEATMAP_POINT_RADIUS = 40; // px, increased for more intensity
const HEATMAP_BLUR = 25; // px, increased for more intensity
const HEATMAP_OPACITY = 0.7; // increased opacity

const DownloadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.293a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);


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
  // Logger State
  const [currentPlayer, setCurrentPlayer] = useState<string>('1');
  const [currentPeriod, setCurrentPeriod] = useState<GamePeriod>('First Half');
  const [pendingShotPosition, setPendingShotPosition] = useState<ShotPosition | null>(null);
  // UI State
  const [activeTab, setActiveTab] = useState<AppTab>('logger');
  // Heatmap State
  const [heatmapPlayer, setHeatmapPlayer] = useState<string>('Todos');
  const [heatmapFilter, setHeatmapFilter] = useState<HeatmapFilter>('all');
  const heatmapRef = useRef<HTMLDivElement>(null);

  // --- HANDLERS ---
  const handleCourtClick = useCallback((position: ShotPosition) => {
    if (!currentPlayer.trim()) {
      alert('Por favor, selecciona un jugador antes de marcar un tiro.');
      return;
    }
    setPendingShotPosition(position);
  }, [currentPlayer]);

  const handleOutcomeSelection = useCallback((isGoal: boolean) => {
    if (pendingShotPosition) {
      const HALF_COURT_LINE_Y = 1; // From Court.tsx, represents the behind-the-arc line
      let goalValue = 0;
      if (isGoal) {
        // If shot y-position is below the line, it's a triple (3 points). Otherwise, it's 2.
        goalValue = pendingShotPosition.y < HALF_COURT_LINE_Y ? 3 : 2;
      }

      const newShot: Shot = {
        id: new Date().toISOString() + Math.random(),
        playerNumber: currentPlayer,
        position: pendingShotPosition,
        isGoal,
        goalValue,
        period: currentPeriod,
      };
      setShots(prevShots => [...prevShots, newShot]);
      setPendingShotPosition(null);
    }
  }, [currentPlayer, pendingShotPosition, currentPeriod]);

  const handleCancelShot = useCallback(() => setPendingShotPosition(null), []);
  const handleDeleteShot = useCallback((shotId: string) => setShots(p => p.filter(s => s.id !== shotId)), []);
  const handleClearAllShots = useCallback(() => {
    if (window.confirm('¿Estás seguro de que quieres borrar todos los registros de tiros? Esta acción no se puede deshacer.')) {
      setShots([]);
    }
  }, []);

  const handleDownloadHeatmap = useCallback(() => {
    if (heatmapRef.current && typeof html2canvas === 'function') {
      html2canvas(heatmapRef.current, {
        backgroundColor: '#111827', // bg-gray-900
        useCORS: true,
      }).then((canvas: HTMLCanvasElement) => {
        const link = document.createElement('a');
        link.download = `cestoball-mapa-calor-${heatmapPlayer.replace(' ', '_')}-${heatmapFilter}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  }, [heatmapPlayer, heatmapFilter]);

  // --- MEMOIZED DERIVED STATE ---
  const filteredHeatmapShots = useMemo(() => {
    return shots.filter(shot => {
      // If "Todos" is selected, playerMatch is always true.
      const playerMatch = heatmapPlayer === 'Todos' || shot.playerNumber === heatmapPlayer;
      if (!playerMatch) return false;

      switch (heatmapFilter) {
        case 'goals': return shot.isGoal;
        case 'misses': return !shot.isGoal;
        case 'all':
        default: return true;
      }
    });
  }, [shots, heatmapPlayer, heatmapFilter]);

  const playerStats = useMemo<PlayerStats[]>(() => {
    const statsMap = new Map<string, { totalShots: number; totalGoals: number; totalPoints: number }>();

    shots.forEach(shot => {
      const pStats = statsMap.get(shot.playerNumber) || { totalShots: 0, totalGoals: 0, totalPoints: 0 };
      pStats.totalShots += 1;
      if (shot.isGoal) {
        pStats.totalGoals += 1;
        pStats.totalPoints += shot.goalValue;
      }
      statsMap.set(shot.playerNumber, pStats);
    });

    return Array.from(statsMap.entries()).map(([playerNumber, data]) => ({
      playerNumber,
      ...data,
      goalPercentage: data.totalShots > 0 ? (data.totalGoals / data.totalShots) * 100 : 0,
    }));
  }, [shots]);
  
  const tabTranslations: {[key in AppTab]: string} = {
    logger: 'Registro',
    heatmap: 'Mapa de Calor',
    statistics: 'Estadísticas'
  }
  
  const periodTranslations: {[key in GamePeriod]: string} = {
      'First Half': 'Primer Tiempo',
      'Second Half': 'Segundo Tiempo'
  }

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans">
      <div className="w-full max-w-4xl flex-grow">
        <header className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400 tracking-tight">Cesto Tracker</h1>
          <p className="text-lg text-gray-400 mt-2">
            {activeTab === 'logger' && 'Registra tiros o cambia de pestaña para analizar.'}
            {activeTab === 'heatmap' && 'Analiza los patrones de tiro de un jugador seleccionado.'}
            {activeTab === 'statistics' && 'Revisa el rendimiento de los jugadores y los máximos anotadores.'}
          </p>
        </header>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8 border-b-2 border-gray-700">
          {(['logger', 'heatmap', 'statistics'] as AppTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-lg font-bold capitalize transition-colors duration-300 focus:outline-none ${
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
                <div className="flex justify-center gap-4">
                  {(['First Half', 'Second Half'] as GamePeriod[]).map((period) => (
                    <button key={period} onClick={() => setCurrentPeriod(period)}
                      className={`flex-1 max-w-xs font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg ${ currentPeriod === period ? 'bg-cyan-600 text-white ring-cyan-500 scale-105' : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:scale-105'}`}>
                      {periodTranslations[period]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logger Player Selector */}
              <div className="w-full bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
                <PlayerSelector currentPlayer={currentPlayer} setCurrentPlayer={setCurrentPlayer} />
              </div>

              {/* Court for Logging */}
              <div className="w-full">
                <Court shots={shots} onCourtClick={handleCourtClick} showShotMarkers={true} />
              </div>

              {/* Shot Log Table */}
              <div className="w-full">
                <ShotLog shots={shots} onDeleteShot={handleDeleteShot} onClearAllShots={handleClearAllShots} />
              </div>
            </>
          )}

          {activeTab === 'heatmap' && (
            <>
              <div ref={heatmapRef} className="flex flex-col gap-8">
                {/* Heatmap Player Selector */}
                <div className="w-full bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
                  <PlayerSelector currentPlayer={heatmapPlayer} setCurrentPlayer={setHeatmapPlayer} showAllPlayersOption={true} />
                </div>

                {/* Heatmap Filter Toggle */}
                <div className="w-full bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
                  <h2 className="text-2xl font-bold mb-4 text-cyan-400 text-center">Filtrar Tiros</h2>
                  <div className="flex justify-center gap-2 sm:gap-4">
                    {(['all', 'goals', 'misses'] as HeatmapFilter[]).map((filter) => (
                      <button key={filter} onClick={() => setHeatmapFilter(filter)}
                        className={`flex-1 max-w-xs capitalize font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg ${
                          heatmapFilter === filter ? 'bg-cyan-600 text-white ring-cyan-500 scale-105' : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:scale-105'
                        }`}
                      >
                        {filter === 'all' ? 'Todos' : filter === 'goals' ? 'Goals' : 'Fallos'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Court for Heatmap */}
                <div className="w-full">
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
                    <span className="hidden sm:inline">Descargar PNG</span>
                </button>
              </div>
            </>
          )}

          {activeTab === 'statistics' && (
            <StatisticsView stats={playerStats} />
          )}
        </main>
      </div>
      
      <footer className="w-full text-center text-gray-500 text-xs mt-8 pb-4">
        Santiago Greco - All rights reserved. Gresolutions ©
      </footer>

      {pendingShotPosition && (
        <OutcomeModal onOutcomeSelect={handleOutcomeSelection} onClose={handleCancelShot} />
      )}
    </div>
  );
}

export default App;