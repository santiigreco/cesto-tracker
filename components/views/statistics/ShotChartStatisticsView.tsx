import React, { useState, useMemo } from 'react';
import { PlayerStats, Shot } from '@/types';
import { TrophyIcon, DownloadIcon } from '@/components/icons';
import TemporalChart from '@/components/charts/TemporalChart';
import { DonutChart, PercentageBar } from './StatWidgets';

interface ShotChartStatisticsViewProps {
  stats: PlayerStats[];
  shots: Shot[];
  playerNames: Record<string, string>;
  isSharing: boolean;
}

export const ShotChartStatisticsView: React.FC<ShotChartStatisticsViewProps> = ({
  stats,
  shots,
  playerNames,
  isSharing,
}) => {
  const topScorers = useMemo(() => {
    return [...stats].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 3);
  }, [stats]);

  const totalShots = useMemo(() => stats.reduce((acc, player) => acc + player.totalShots, 0), [stats]);
  const totalGoles = useMemo(() => stats.reduce((acc, player) => acc + player.totalGoles, 0), [stats]);
  const totalPoints = useMemo(() => stats.reduce((acc, player) => acc + player.totalPoints, 0), [stats]);
  const totalMisses = totalShots - totalGoles;
  const teamGolPercentage = totalShots > 0 ? (totalGoles / totalShots) * 100 : 0;

  const [sortConfig, setSortConfig] = useState<{
    key: keyof PlayerStats;
    direction: 'ascending' | 'descending';
  } | null>({ key: 'playerNumber', direction: 'ascending' });

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
    if (isSharing) return;
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof PlayerStats) => {
    if (isSharing) return null;
    if (!sortConfig || sortConfig.key !== key) return <span className="text-slate-500 opacity-50">↕</span>;
    return <span className="text-cyan-400">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>;
  };

  const handleExportCSV = () => {
    if (shots.length === 0) {
      alert('No hay tiros para exportar.');
      return;
    }
    const headers = [
      'ID Tiro',
      'Jugador',
      'Nombre Jugador',
      'Período',
      'Posición X',
      'Posición Y',
      'Resultado',
      'Puntos',
    ];
    const csvRows = [headers.join(',')];
    shots.forEach(shot => {
      const row = [
        `"${shot.id}"`,
        shot.playerNumber,
        playerNames[shot.playerNumber] || '',
        shot.period === 'First Half' ? 'Primer Tiempo' : 'Segundo Tiempo',
        shot.position.x.toFixed(2),
        shot.position.y.toFixed(2),
        shot.isGol ? 'Gol' : 'Fallo',
        shot.golValue.toString(),
      ];
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

  const hasData = stats.length > 0;
  const canShowAdvancedCharts = !isSharing && shots.length > 0;

  if (!hasData && !isSharing) {
    return (
      <div className="bg-slate-800 p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-3xl font-bold text-cyan-400 mb-2">Estadísticas</h2>
        <p className="text-slate-400">Registra algunos datos para ver las estadísticas de los jugadores aquí.</p>
      </div>
    );
  }

  return (
    <div className="pt-4 flex flex-col gap-8">
      {/* Team Shot Stats */}
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
            <div
              key={player.playerNumber}
              className="bg-slate-700/50 p-6 rounded-xl flex flex-col items-center gap-2 border border-slate-600"
            >
              <div className="flex items-center gap-3">
                <TrophyIcon rank={index + 1} />
                <p className="text-2xl font-bold text-white">
                  {playerNames[player.playerNumber] || `Jugador ${player.playerNumber}`}
                </p>
              </div>
              <p className="text-5xl font-extrabold text-cyan-400">{player.totalPoints}</p>
              <p className="text-slate-400">Puntos Totales</p>
            </div>
          ))}
          {topScorers.length === 0 && (
            <p className="text-slate-400 text-center col-span-3">Aún no se han anotado puntos.</p>
          )}
        </div>
      </div>

      {/* Temporal Chart */}
      {canShowAdvancedCharts && (
        <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
          <h3 className="text-3xl font-bold text-cyan-400 mb-6 text-center">Gráfico Temporal</h3>
          <TemporalChart shots={shots} playerNames={playerNames} stats={stats} />
        </div>
      )}

      {/* Shot Performance Table */}
      <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-3xl font-bold text-cyan-400">Rendimiento por Jugador</h3>
          {canShowAdvancedCharts && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500"
              aria-label="Exportar todos los tiros como CSV"
            >
              <DownloadIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Exportar Logs</span>
            </button>
          )}
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="border-b-2 border-slate-600">
                <th className="p-3 text-sm tracking-wider">
                  <button
                    onClick={() => requestSort('playerNumber')}
                    className="w-full text-left font-semibold flex items-center gap-2 hover:text-cyan-300 transition-colors disabled:cursor-default disabled:hover:text-inherit"
                    disabled={isSharing}
                  >
                    Jugador {getSortIndicator('playerNumber')}
                  </button>
                </th>
                <th className="p-3 text-sm tracking-wider text-center">
                  <button
                    onClick={() => requestSort('totalPoints')}
                    className="w-full justify-center font-semibold flex items-center gap-2 hover:text-cyan-300 transition-colors disabled:cursor-default disabled:hover:text-inherit"
                    disabled={isSharing}
                  >
                    Puntos {getSortIndicator('totalPoints')}
                  </button>
                </th>
                <th className="p-3 text-sm tracking-wider text-center">
                  <button
                    onClick={() => requestSort('totalShots')}
                    className="w-full justify-center font-semibold flex items-center gap-2 hover:text-cyan-300 transition-colors disabled:cursor-default disabled:hover:text-inherit"
                    disabled={isSharing}
                  >
                    Tiros (G/T) {getSortIndicator('totalShots')}
                  </button>
                </th>
                <th className="p-3 text-sm tracking-wider w-[30%]">
                  <button
                    onClick={() => requestSort('golPercentage')}
                    className="w-full text-left font-semibold flex items-center gap-2 hover:text-cyan-300 transition-colors disabled:cursor-default disabled:hover:text-inherit"
                    disabled={isSharing}
                  >
                    % Goles {getSortIndicator('golPercentage')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedStats.map(player => (
                <tr key={player.playerNumber} className="border-b border-slate-700 hover:bg-slate-700/50">
                  <td className="p-3 font-mono text-cyan-300 font-bold text-lg">
                    {playerNames[player.playerNumber] || `#${player.playerNumber}`}
                  </td>
                  <td className="p-3 font-mono text-white text-center text-lg">{player.totalPoints}</td>
                  <td className="p-3 font-mono text-slate-300 text-center">
                    {`${player.totalGoles}/${player.totalShots}`}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <PercentageBar percentage={player.golPercentage} />
                      <span className="font-mono text-slate-300 w-12 text-right">
                        {player.golPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
