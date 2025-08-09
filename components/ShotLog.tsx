
import React from 'react';
import { Shot, PlayerStats } from '../types';

interface ShotLogProps {
  shots: Shot[];
  stats: PlayerStats[];
  playerNames: Record<string, string>;
}

const DownloadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.293a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

// Helper component for a progress bar
const PercentageBar: React.FC<{ percentage: number }> = ({ percentage }) => (
  <div className="w-full bg-gray-600 rounded-full h-2.5">
    <div
      className="bg-cyan-500 h-2.5 rounded-full"
      style={{ width: `${percentage}%` }}
    ></div>
  </div>
);


/**
 * Displays player performance statistics and provides an option to export logs.
 */
const ShotLog: React.FC<ShotLogProps> = ({ shots, stats, playerNames }) => {
  const sortedByPlayerNumber = [...stats].sort((a, b) => Number(a.playerNumber) - Number(b.playerNumber));

  /**
   * Generates a CSV file from the shot data and triggers a download.
   */
  const handleExportCSV = () => {
    if (shots.length === 0) {
      alert("No hay tiros para exportar.");
      return;
    }

    const headers = ['ID Tiro', 'Jugador', 'Nombre Jugador', 'Período', 'Posición X', 'Posición Y', 'Resultado', 'Puntos'];
    const csvRows = [headers.join(',')];

    // Create a row for each shot
    shots.forEach(shot => {
      const row = [
        `"${shot.id}"`,
        shot.playerNumber,
        playerNames[shot.playerNumber] || '',
        shot.period === 'First Half' ? 'Primer Tiempo' : 'Segundo Tiempo',
        shot.position.x.toFixed(2),
        shot.position.y.toFixed(2),
        shot.isGol ? 'Gol' : 'Fallo',
        shot.golValue.toString()
      ];
      csvRows.push(row.join(','));
    });

    // Create a Blob and download link
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

    // Clean up the URL object
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-cyan-400">Rendimiento de Jugadores</h2>
        {shots.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
            aria-label="Exportar todos los tiros como CSV"
          >
            <DownloadIcon className="h-4 w-4 sm:h-5 sm:w-5"/>
            <span className="hidden sm:inline">Exportar Logs</span>
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        {stats.length === 0 ? (
          <p className="text-gray-400 text-center py-4">Aún no hay tiros registrados para ver estadísticas.</p>
        ) : (
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="border-b-2 border-gray-600">
                <th className="p-3 text-sm font-semibold tracking-wider">Jugador</th>
                <th className="p-3 text-sm font-semibold tracking-wider text-center">Puntos Totales</th>
                <th className="p-3 text-sm font-semibold tracking-wider text-center">Tiros (G/T)</th>
                <th className="p-3 text-sm font-semibold tracking-wider w-[30%]">% Goles</th>
              </tr>
            </thead>
            <tbody>
              {sortedByPlayerNumber.map(player => (
                <tr key={player.playerNumber} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="p-3 font-mono text-cyan-300 font-bold text-lg">{playerNames[player.playerNumber] || `#${player.playerNumber}`}</td>
                  <td className="p-3 font-mono text-white text-center text-lg">{player.totalPoints}</td>
                  <td className="p-3 font-mono text-gray-300 text-center">{`${player.totalGoles}/${player.totalShots}`}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <PercentageBar percentage={player.golPercentage} />
                      <span className="font-mono text-gray-300 w-12 text-right">{player.golPercentage.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ShotLog;
