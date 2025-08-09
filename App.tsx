
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Shot, ShotPosition, GamePeriod, AppTab, HeatmapFilter, PlayerStats, MapPeriodFilter } from './types';
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

const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor">
      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
      <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
);

const WhatsappIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-8 w-8"} viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.651 4.383 1.803 6.123l-1.215 4.433 4.515-1.185z" />
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

// Reusable Period Filter Component
const PeriodFilter: React.FC<{
  currentFilter: MapPeriodFilter;
  setFilter: (filter: MapPeriodFilter) => void;
  translations: { [key in GamePeriod]: string };
}> = ({ currentFilter, setFilter, translations }) => (
  <div className="w-full bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
    <h2 className="text-2xl font-bold mb-4 text-cyan-400 text-center">Filtrar por Período</h2>
    <div className="flex justify-center gap-2 sm:gap-4">
      {(['all', 'First Half', 'Second Half'] as MapPeriodFilter[]).map((period) => (
        <button
          key={period}
          onClick={() => setFilter(period)}
          className={`flex-1 max-w-xs capitalize font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg ${
            currentFilter === period ? 'bg-cyan-600 text-white ring-cyan-500 scale-105' : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:scale-105'
          }`}
        >
          {period === 'all' ? 'Ambos' : translations[period as GamePeriod]}
        </button>
      ))}
    </div>
  </div>
);


/**
 * The main application component.
 * It holds the application's state and orchestrates all UI components and views.
 */
function App() {
  // --- STATE MANAGEMENT ---
  const [shots, setShots] = useState<Shot[]>([]);
  // Player State
  const [playerNames, setPlayerNames] = useState<Record<string, string>>({});
  // Logger State
  const [currentPlayer, setCurrentPlayer] = useState<string>('1');
  const [currentPeriod, setCurrentPeriod] = useState<GamePeriod>('First Half');
  const [pendingShotPosition, setPendingShotPosition] = useState<ShotPosition | null>(null);
  // UI State
  const [activeTab, setActiveTab] = useState<AppTab>('logger');
  // Heatmap State
  const [heatmapPlayer, setHeatmapPlayer] = useState<string>('Todos');
  const [heatmapFilter, setHeatmapFilter] = useState<HeatmapFilter>('all');
  // Shotmap State
  const [shotmapPlayer, setShotmapPlayer] = useState<string>('Todos');
  // Shared Map Filter State
  const [mapPeriodFilter, setMapPeriodFilter] = useState<MapPeriodFilter>('all');

  const heatmapRef = useRef<HTMLDivElement>(null);

  // --- HANDLERS ---
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
      setShots(prevShots => [...prevShots, newShot]);
      setPendingShotPosition(null);
    }
  }, [currentPlayer, pendingShotPosition, currentPeriod]);
  
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

  const handleCancelShot = useCallback(() => setPendingShotPosition(null), []);
  const handleDeleteShot = useCallback((shotId: string) => setShots(p => p.filter(s => s.id !== shotId)), []);
  const handleClearAllShots = useCallback(() => {
    if (window.confirm('¿Estás seguro de que quieres borrar todos los registros de tiros? Esta acción no se puede deshacer.')) {
      setShots([]);
      setPlayerNames({});
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
        return playerMatch && periodMatch;
    });
  }, [shots, shotmapPlayer, mapPeriodFilter]);

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
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans">
      <div className="w-full max-w-4xl flex-grow">
        <header className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400 tracking-tight">Cesto Tracker</h1>
          <p className="text-lg text-gray-400 mt-2">
            {activeTab === 'logger' && 'Registra tiros o cambia de pestaña para analizar.'}
            {activeTab === 'heatmap' && 'Analiza la densidad de tiros de un jugador.'}
            {activeTab === 'shotmap' && 'Visualiza la ubicación de cada tiro en la cancha.'}
            {activeTab === 'statistics' && 'Revisa el rendimiento de los jugadores.'}
          </p>
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
                <div className="flex justify-center items-center gap-4 mb-4">
                  <h2 className="text-2xl font-bold text-cyan-400 text-center">
                    {playerNames[currentPlayer] ? `${playerNames[currentPlayer]} (#${currentPlayer})` : 'Seleccionar Jugador'}
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
                <PlayerSelector currentPlayer={currentPlayer} setCurrentPlayer={setCurrentPlayer} playerNames={playerNames} />
              </div>

              {/* Court for Logging */}
              <div className="w-full">
                <Court shots={shots} onCourtClick={handleCourtClick} showShotMarkers={true} />
              </div>

              {/* Shot Log Table */}
              <div className="w-full">
                <ShotLog shots={shots} onDeleteShot={handleDeleteShot} onClearAllShots={handleClearAllShots} playerNames={playerNames}/>
              </div>
            </>
          )}
          
          {activeTab === 'shotmap' && (
             <div className="flex flex-col gap-8">
                {/* Shotmap Player Selector */}
                <div className="w-full bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
                   <h2 className="text-2xl font-bold mb-4 text-cyan-400 text-center">Seleccionar Jugador</h2>
                  <PlayerSelector currentPlayer={shotmapPlayer} setCurrentPlayer={setShotmapPlayer} showAllPlayersOption={true} playerNames={playerNames} />
                </div>
                
                {/* Period Filter */}
                <PeriodFilter currentFilter={mapPeriodFilter} setFilter={setMapPeriodFilter} translations={periodTranslations} />

                {/* Court for Shotmap */}
                <div className="w-full">
                  <Court shots={filteredShotmapShots} showShotMarkers={true} />
                </div>
             </div>
          )}

          {activeTab === 'heatmap' && (
            <>
              <div ref={heatmapRef} className="flex flex-col gap-8">
                {/* Heatmap Player Selector */}
                <div className="w-full bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
                   <h2 className="text-2xl font-bold mb-4 text-cyan-400 text-center">Seleccionar Jugador</h2>
                  <PlayerSelector currentPlayer={heatmapPlayer} setCurrentPlayer={setHeatmapPlayer} showAllPlayersOption={true} playerNames={playerNames} />
                </div>

                {/* Heatmap Filter Toggle */}
                <div className="w-full bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
                  <h2 className="text-2xl font-bold mb-4 text-cyan-400 text-center">Filtrar Resultado</h2>
                  <div className="flex justify-center gap-2 sm:gap-4">
                    {(['all', 'goles', 'misses'] as HeatmapFilter[]).map((filter) => (
                      <button key={filter} onClick={() => setHeatmapFilter(filter)}
                        className={`flex-1 max-w-xs capitalize font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg ${
                          heatmapFilter === filter ? 'bg-cyan-600 text-white ring-cyan-500 scale-105' : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:scale-105'
                        }`}
                      >
                        {filter === 'all' ? 'Todos' : filter === 'goles' ? 'Goles' : 'Fallos'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Period Filter */}
                <PeriodFilter currentFilter={mapPeriodFilter} setFilter={setMapPeriodFilter} translations={periodTranslations} />

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
            <StatisticsView stats={playerStats} playerNames={playerNames} />
          )}
        </main>
      </div>
      
      <footer className="w-full text-center text-gray-500 text-xs mt-8 pb-4">
        Santiago Greco - All rights reserved. Gresolutions ©
      </footer>

      {pendingShotPosition && (
        <OutcomeModal onOutcomeSelect={handleOutcomeSelection} onClose={handleCancelShot} />
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