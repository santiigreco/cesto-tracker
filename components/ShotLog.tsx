
import React, { useState, useMemo } from 'react';
import { Shot, PlayerStats } from '../types';
import DownloadIcon from './DownloadIcon';

interface ShotLogProps {
  shots: Shot[];
  stats: PlayerStats[];
  playerNames: Record<string, string>;
}

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
  const [sortConfig, setSortConfig] = useState<{ key: keyof PlayerStats; direction: 'ascending' | 'descending' } | null>({ key: 'playerNumber', direction: 'ascending' });
  
  const sortedStats = useMemo(() => {
    let sortableItems = [...stats];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        // Handle playerNumber separately as it's a string that should be sorted numerically
        if (sortConfig.key === 'playerNumber') {
          const numA = Number(a.playerNumber);
          const numB = Number(b.playerNumber);
          if (numA < numB) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (numA > numB) return sortConfig.direction === 'ascending' ? 1 : -1;
          return 0;
        }

        // For all other numeric keys
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
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
    if (!sortConfig || sortConfig.key !== key) {
      return <span className="text-gray-500 opacity-50">↕</span>;
    }
    if (sortConfig.direction === 'ascending') {
      return <span className="text-cyan-400">▲</span>;
    }
    return <span className="text-cyan-400">▼</span>;
  };


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
        <h2 className="text-2xl font-bold text-cyan-400">Rendimiento</h2>
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
                <th className="p-3 text-sm tracking-wider">
                  <button onClick={() => requestSort('playerNumber')} className="w-full text-left font-semibold flex items-center gap-2 hover:text-cyan-300 transition-colors">
                    Jugador {getSortIndicator('playerNumber')}
                  </button>
                </th>
                <th className="p-3 text-sm tracking-wider text-center">
                   <button onClick={() => requestSort('totalPoints')} className="w-full justify-center font-semibold flex items-center gap-2 hover:text-cyan-300 transition-colors">
                    Puntos Totales {getSortIndicator('totalPoints')}
                  </button>
                </th>
                <th className="p-3 text-sm tracking-wider text-center">
                   <button onClick={() => requestSort('totalShots')} className="w-full justify-center font-semibold flex items-center gap-2 hover:text-cyan-300 transition-colors">
                    Tiros (G/T) {getSortIndicator('totalShots')}
                  </button>
                </th>
                <th className="p-3 text-sm tracking-wider w-[30%]">
                  <button onClick={() => requestSort('golPercentage')} className="w-full text-left font-semibold flex items-center gap-2 hover:text-cyan-300 transition-colors">
                    % Goles {getSortIndicator('golPercentage')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedStats.map(player => (
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
