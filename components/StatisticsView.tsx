
import React, { useRef } from 'react';
import { PlayerStats } from '../types';

// TypeScript declaration for html2canvas global variable
declare const html2canvas: any;

const DownloadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.293a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const TrophyIcon: React.FC<{ rank: number }> = ({ rank }) => {
  const colors: { [key: number]: string } = {
    1: 'text-yellow-400', // Gold
    2: 'text-gray-300',   // Silver
    3: 'text-yellow-600', // Bronze
  };
  const color = colors[rank] || 'text-gray-500';

  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${color}`} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2a6 6 0 00-6 6c0 1.887.646 3.633 1.726 5H4a1 1 0 00-1 1v2a1 1 0 001 1h1.583A6.012 6.012 0 0010 18a6.012 6.012 0 004.417-2H16a1 1 0 001-1v-2a1 1 0 00-1-1h-1.726A5.969 5.969 0 0016 8a6 6 0 00-6-6zm-3.293 9.293a1 1 0 010 1.414L5 14.414A3.99 3.99 0 0110 16a3.99 3.99 0 015-1.707l-1.707-1.707a1 1 0 010-1.414L15 10.293A4.004 4.004 0 0114 8c0-1.312-.636-2.5-1.682-3.268L10 7.05l-2.318-2.318C6.636 5.5 6 6.688 6 8c0 .79.23 1.523.634 2.121L3.293 11.293z" />
    </svg>
  );
};


const StatisticsView: React.FC<{ stats: PlayerStats[]; playerNames: Record<string, string>; }> = ({ stats, playerNames }) => {
  const captureRef = useRef<HTMLDivElement>(null);
  const topScorers = [...stats].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 3);
  
  const handleDownload = () => {
    if (captureRef.current && typeof html2canvas === 'function') {
      html2canvas(captureRef.current, {
        backgroundColor: '#111827', // bg-gray-900
        useCORS: true,
      }).then((canvas: HTMLCanvasElement) => {
        const link = document.createElement('a');
        link.download = 'cestoball-estadisticas.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  if (stats.length === 0) {
    return (
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-3xl font-bold text-cyan-400 mb-2">Estadísticas</h2>
        <p className="text-gray-400">Registra algunos tiros para ver las estadísticas de los jugadores aquí.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center -mb-4">
        <h2 className="text-3xl font-bold text-cyan-400">Estadísticas de Jugadores</h2>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
          aria-label="Descargar estadísticas como imagen"
        >
          <DownloadIcon className="h-4 w-4 sm:h-5 sm:w-5"/>
          <span className="hidden sm:inline">Descargar PNG</span>
        </button>
      </div>
      
      <div ref={captureRef} className="pt-4">
        {/* Top Scorers Section */}
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-cyan-400 mb-6 text-center">MVP del partido</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topScorers.map((player, index) => (
              <div key={player.playerNumber} className="bg-gray-700/50 p-6 rounded-xl flex flex-col items-center gap-2 border border-gray-600">
                <div className="flex items-center gap-3">
                  <TrophyIcon rank={index + 1} />
                  <p className="text-2xl font-bold text-white">{playerNames[player.playerNumber] || `Jugador ${player.playerNumber}`}</p>
                </div>
                <p className="text-5xl font-extrabold text-cyan-400">{player.totalPoints}</p>
                <p className="text-gray-400">Puntos Totales</p>
              </div>
            ))}
            {topScorers.length === 0 && <p className="text-gray-400 text-center col-span-3">Aún no se han anotado puntos.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsView;
