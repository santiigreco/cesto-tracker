
import React, { useRef } from 'react';
import { PlayerStats } from '../types';
import DownloadIcon from './DownloadIcon';
import TrophyIcon from './TrophyIcon';

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
        <span className="text-xs text-gray-400">Goles</span>
      </div>
    </div>
  );
};


const StatisticsView: React.FC<{ stats: PlayerStats[]; playerNames: Record<string, string>; }> = ({ stats, playerNames }) => {
  const captureRef = useRef<HTMLDivElement>(null);
  const topScorers = [...stats].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 3);
  
  // Team-wide stats calculation
  const totalShots = stats.reduce((acc, player) => acc + player.totalShots, 0);
  const totalGoles = stats.reduce((acc, player) => acc + player.totalGoles, 0);
  const totalPoints = stats.reduce((acc, player) => acc + player.totalPoints, 0);
  const totalMisses = totalShots - totalGoles;
  const teamGolPercentage = totalShots > 0 ? (totalGoles / totalShots) * 100 : 0;

  const handleDownload = () => {
    if (captureRef.current && typeof html2canvas === 'function') {
      html2canvas(captureRef.current, {
        backgroundColor: null, // Use null to capture the actual background, fixing color issues
        useCORS: true,
        scale: 2, // Increase resolution for better quality
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
        <h2 className="text-3xl font-bold text-cyan-400">Resumen Estadístico</h2>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
          aria-label="Descargar estadísticas como imagen"
        >
          <DownloadIcon className="h-4 w-4 sm:h-5 sm:w-5"/>
          <span className="hidden sm:inline">Descargar PNG</span>
        </button>
      </div>
      
      <div ref={captureRef} className="pt-4 flex flex-col gap-8 bg-gray-900">
        {/* Team Statistics Section */}
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
          <h3 className="text-3xl font-bold text-cyan-400 mb-6 text-center">Estadísticas del Equipo</h3>
          <div className="flex flex-col md:flex-row items-center justify-around gap-8">
            {/* Donut Chart on the left */}
            <div className="text-cyan-400">
              <DonutChart percentage={teamGolPercentage} />
            </div>

            {/* Stats details on the right */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-center">
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <p className="text-3xl font-bold text-white">{totalPoints}</p>
                <p className="text-sm text-gray-400">Puntos Totales</p>
              </div>
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <p className="text-3xl font-bold text-white">{totalShots}</p>
                <p className="text-sm text-gray-400">Tiros Totales</p>
              </div>
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <p className="text-3xl font-bold text-green-400">{totalGoles}</p>
                <p className="text-sm text-gray-400">Goles</p>
              </div>
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <p className="text-3xl font-bold text-red-400">{totalMisses}</p>
                <p className="text-sm text-gray-400">Fallos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Scorers Section */}
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
          <h3 className="text-3xl font-bold text-cyan-400 mb-6 text-center">Jugadores Destacados</h3>
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
