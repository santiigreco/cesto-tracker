


import React, { useRef, useState, useMemo } from 'react';
import { PlayerStats, Shot } from '../types';
import TrophyIcon from './TrophyIcon';
import DownloadIcon from './DownloadIcon';
import ShareIcon from './ShareIcon';

// TypeScript declaration for html2canvas global variable
declare const html2canvas: any;

const DonutChart: React.FC<{ percentage: number; size?: number; strokeWidth?: number; }> = ({ percentage, size = 120, strokeWidth = 15 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)" // a light gray for the track
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Foreground circle (progress) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor" // Will inherit text-cyan-400
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{percentage.toFixed(1)}%</span>
        <span className="text-xs text-slate-400">Goles</span>
      </div>
    </div>
  );
};

// Helper component for a progress bar
const PercentageBar: React.FC<{ percentage: number }> = ({ percentage }) => (
  <div className="w-full bg-slate-600 rounded-full h-2.5">
    <div
      className="bg-cyan-500 h-2.5 rounded-full"
      style={{ width: `${percentage}%` }}
    ></div>
  </div>
);


interface StatisticsViewProps {
  stats: PlayerStats[];
  playerNames: Record<string, string>;
  shots: Shot[];
}

const StatisticsView: React.FC<StatisticsViewProps> = React.memo(({ stats, playerNames, shots }) => {
  const captureRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const topScorers = [...stats].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 3);
  
  // Team-wide stats calculation
  const totalShots = stats.reduce((acc, player) => acc + player.totalShots, 0);
  const totalGoles = stats.reduce((acc, player) => acc + player.totalGoles, 0);
  const totalPoints = stats.reduce((acc, player) => acc + player.totalPoints, 0);
  const totalMisses = totalShots - totalGoles;
  const teamGolPercentage = totalShots > 0 ? (totalGoles / totalShots) * 100 : 0;
  
  // --- Logic from old ShotLog component ---
  const [sortConfig, setSortConfig] = useState<{ key: keyof PlayerStats; direction: 'ascending' | 'descending' } | null>({ key: 'playerNumber', direction: 'ascending' });
  
  const sortedStats = useMemo(() => {
    let sortableItems = [...stats];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (sortConfig.key === 'playerNumber') {
          const numA = Number(a.playerNumber);
          const numB = Number(b.playerNumber);
          if (numA < numB) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (numA > numB) return sortConfig.direction === 'ascending' ? 1 : -1;
          return 0;
        }
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [stats, sortConfig]);

  const requestSort = (key: keyof PlayerStats) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: keyof PlayerStats) => {
    if (!sortConfig || sortConfig.key !== key) return <span className="text-slate-500 opacity-50">↕</span>;
    return <span className={`text-cyan-400`}>{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>;
  };

  const handleExportCSV = () => {
    if (shots.length === 0) {
      alert("No hay tiros para exportar.");
      return;
    }
    const headers = ['ID Tiro', 'Jugador', 'Nombre Jugador', 'Período', 'Posición X', 'Posición Y', 'Resultado', 'Puntos'];
    const csvRows = [headers.join(',')];
    shots.forEach(shot => {
      const row = [`"${shot.id}"`, shot.playerNumber, playerNames[shot.playerNumber] || '', shot.period === 'First Half' ? 'Primer Tiempo' : 'Segundo Tiempo', shot.position.x.toFixed(2), shot.position.y.toFixed(2), shot.isGol ? 'Gol' : 'Fallo', shot.golValue.toString()];
      csvRows.push(row.join(','));
    });
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'cestoball_registro_tiros.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  // --- End of logic from old ShotLog ---

  const handleShare = async () => {
    if (!navigator.share) {
      alert('La función de compartir no está disponible en este navegador.');
      return;
    }
    if (captureRef.current) {
      setIsSharing(true);
      try {
        const canvas = await html2canvas(captureRef.current, {
          backgroundColor: '#0f172a', // Tailwind's bg-slate-900
          useCORS: true,
          scale: 2,
        });
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
        
        if (!blob) {
            throw new Error('Could not create image blob.');
        }

        const file = new File([blob], 'cestoball-estadisticas.png', { type: 'image/png' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Estadísticas de Cesto Tracker',
            text: 'Revisa las estadísticas de mi partido de Cestoball.',
          });
        } else {
            alert('No se pueden compartir archivos en este navegador.');
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') { // Don't show error if user cancels share
            console.error('Error sharing:', error);
            alert('Ocurrió un error al intentar compartir.');
        }
      } finally {
        setIsSharing(false);
      }
    }
  };

  if (stats.length === 0) {
    return (
      <div className="bg-slate-800 p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-3xl font-bold text-cyan-400 mb-2">Estadísticas</h2>
        <p className="text-slate-400">Registra algunos tiros para ver las estadísticas de los jugadores aquí.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center -mb-4">
        <h2 className="text-3xl font-bold text-cyan-400">Resumen Estadístico</h2>
        {typeof navigator.share === 'function' && (
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            aria-label="Compartir estadísticas"
          >
            <ShareIcon className="h-4 w-4 sm:h-5 sm:w-5"/>
            <span className="hidden sm:inline">{isSharing ? 'Compartiendo...' : 'Compartir'}</span>
          </button>
        )}
      </div>
      
      <div ref={captureRef} className="pt-4 flex flex-col gap-8 bg-slate-900">
        {/* Team Statistics Section */}
        <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
          <h3 className="text-3xl font-bold text-cyan-400 mb-6 text-center">Estadísticas del Equipo</h3>
          <div className="flex flex-col md:flex-row items-center justify-around gap-8">
            <div className="text-cyan-400">
              <DonutChart percentage={teamGolPercentage} />
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-center">
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <p className="text-3xl font-bold text-white">{totalPoints}</p>
                <p className="text-sm text-slate-400">Puntos Totales</p>
              </div>
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <p className="text-3xl font-bold text-white">{totalShots}</p>
                <p className="text-sm text-slate-400">Tiros Totales</p>
              </div>
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <p className="text-3xl font-bold text-green-400">{totalGoles}</p>
                <p className="text-sm text-slate-400">Goles</p>
              </div>
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <p className="text-3xl font-bold text-red-400">{totalMisses}</p>
                <p className="text-sm text-slate-400">Fallos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Scorers Section */}
        <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
          <h3 className="text-3xl font-bold text-cyan-400 mb-6 text-center">Jugadores Destacados</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topScorers.map((player, index) => (
              <div key={player.playerNumber} className="bg-slate-700/50 p-6 rounded-xl flex flex-col items-center gap-2 border border-slate-600">
                <div className="flex items-center gap-3">
                  <TrophyIcon rank={index + 1} />
                  <p className="text-2xl font-bold text-white">{playerNames[player.playerNumber] || `Jugador ${player.playerNumber}`}</p>
                </div>
                <p className="text-5xl font-extrabold text-cyan-400">{player.totalPoints}</p>
                <p className="text-slate-400">Puntos Totales</p>
              </div>
            ))}
            {topScorers.length === 0 && <p className="text-slate-400 text-center col-span-3">Aún no se han anotado puntos.</p>}
          </div>
        </div>
      </div>
      
      {/* Performance Table Section */}
      <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-3xl font-bold text-cyan-400">Rendimiento por Jugador</h3>
          {shots.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500"
              aria-label="Exportar todos los tiros como CSV"
            >
              <DownloadIcon className="h-4 w-4 sm:h-5 sm:w-5"/>
              <span className="hidden sm:inline">Exportar Logs</span>
            </button>
          )}
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="border-b-2 border-slate-600">
                <th className="p-3 text-sm tracking-wider"><button onClick={() => requestSort('playerNumber')} className="w-full text-left font-semibold flex items-center gap-2 hover:text-cyan-300 transition-colors">Jugador {getSortIndicator('playerNumber')}</button></th>
                <th className="p-3 text-sm tracking-wider text-center"><button onClick={() => requestSort('totalPoints')} className="w-full justify-center font-semibold flex items-center gap-2 hover:text-cyan-300 transition-colors">Puntos {getSortIndicator('totalPoints')}</button></th>
                <th className="p-3 text-sm tracking-wider text-center"><button onClick={() => requestSort('totalShots')} className="w-full justify-center font-semibold flex items-center gap-2 hover:text-cyan-300 transition-colors">Tiros (G/T) {getSortIndicator('totalShots')}</button></th>
                <th className="p-3 text-sm tracking-wider w-[30%]"><button onClick={() => requestSort('golPercentage')} className="w-full text-left font-semibold flex items-center gap-2 hover:text-cyan-300 transition-colors">% Goles {getSortIndicator('golPercentage')}</button></th>
              </tr>
            </thead>
            <tbody>
              {sortedStats.map(player => (
                <tr key={player.playerNumber} className="border-b border-slate-700 hover:bg-slate-700/50">
                  <td className="p-3 font-mono text-cyan-300 font-bold text-lg">{playerNames[player.playerNumber] || `#${player.playerNumber}`}</td>
                  <td className="p-3 font-mono text-white text-center text-lg">{player.totalPoints}</td>
                  <td className="p-3 font-mono text-slate-300 text-center">{`${player.totalGoles}/${player.totalShots}`}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <PercentageBar percentage={player.golPercentage} />
                      <span className="font-mono text-slate-300 w-12 text-right">{player.golPercentage.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
});

export default StatisticsView;