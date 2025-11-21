
import React, { useRef, useState, useMemo } from 'react';
import { PlayerStats, Shot, GameMode, TallyStats, GamePeriod, TallyStatsPeriod } from '../types';
import TrophyIcon from './TrophyIcon';
import DownloadIcon from './DownloadIcon';
import ShareIcon from './ShareIcon';
import TemporalChart from './TemporalChart';

interface StatisticsViewProps {
  stats: PlayerStats[];
  playerNames: Record<string, string>;
  shots: Shot[];
  onShareClick?: () => void;
  isSharing?: boolean;
  gameMode?: GameMode;
  tallyStats?: Record<string, TallyStats>;
}

type TallySortableKey = keyof (TallyStatsPeriod & { playerNumber: string, totalRebounds: number, golPercentage: number, totalShots: number });

// Sub-component for the Tally Statistics view
const TallyStatisticsView: React.FC<{
  tallyStats: Record<string, TallyStats>;
  playerNames: Record<string, string>;
  isSharing: boolean;
}> = ({ tallyStats, playerNames, isSharing }) => {
  const [tallyPeriodFilter, setTallyPeriodFilter] = useState<'all' | GamePeriod>('all');
  const [sortConfig, setSortConfig] = useState<{ key: TallySortableKey; direction: 'ascending' | 'descending' } | null>({ key: 'playerNumber', direction: 'ascending' });

  const getFilterButtonClass = (isActive: boolean) =>
    `flex-1 font-bold py-2 px-3 rounded-md transition-colors text-sm sm:text-base ${
      isActive ? 'bg-cyan-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'
    }`;

  const aggregatedStats = useMemo(() => {
    return Object.entries(tallyStats).map(([playerNumber, playerTally]) => {
      let stats: TallyStatsPeriod;
      if (tallyPeriodFilter === 'all') {
        stats = Object.values(playerTally).reduce((acc, periodStats) => {
          (Object.keys(acc) as Array<keyof TallyStatsPeriod>).forEach(key => {
            acc[key] = (acc[key] || 0) + (periodStats[key] || 0);
          });
          return acc;
        }, { goles: 0, fallos: 0, recuperos: 0, perdidas: 0, reboteOfensivo: 0, reboteDefensivo: 0, asistencias: 0, golesContra: 0, faltasPersonales: 0 });
      } else {
        stats = playerTally[tallyPeriodFilter];
      }
      const totalShots = stats.goles + stats.fallos;
      const totalRebounds = stats.reboteOfensivo + stats.reboteDefensivo;
      const golPercentage = totalShots > 0 ? (stats.goles / totalShots) * 100 : 0;
      return { playerNumber, ...stats, totalRebounds, golPercentage, totalShots };
    });
  }, [tallyStats, tallyPeriodFilter]);

  const sortedAggregatedStats = useMemo(() => {
    let sortableItems = [...aggregatedStats];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (sortConfig.key === 'playerNumber') {
          const numA = a.playerNumber === 'Equipo' ? Infinity : Number(a.playerNumber);
          const numB = b.playerNumber === 'Equipo' ? Infinity : Number(b.playerNumber);
          if (numA < numB) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (numA > numB) return sortConfig.direction === 'ascending' ? 1 : -1;
          return 0;
        }
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
  }, [aggregatedStats, sortConfig]);

  const requestSort = (key: TallySortableKey) => {
    if (isSharing) return;
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: TallySortableKey) => {
    if (isSharing) return null;
    if (!sortConfig || sortConfig.key !== key) return <span className="text-slate-500 opacity-50">↕</span>;
    return <span className={`text-cyan-400`}>{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>;
  };
  
  const teamTotals = useMemo(() => {
     return aggregatedStats.reduce((acc, playerStats) => {
        if (playerStats.playerNumber !== 'Equipo') { // Exclude team's own stats from totals
            (Object.keys(acc) as Array<keyof TallyStatsPeriod>).forEach(key => {
                acc[key] += playerStats[key];
            });
        }
        return acc;
    }, { goles: 0, fallos: 0, recuperos: 0, perdidas: 0, reboteOfensivo: 0, reboteDefensivo: 0, asistencias: 0, golesContra: 0, faltasPersonales: 0 });
  }, [aggregatedStats]);

  const topPerformers = useMemo(() => {
    const playersOnly = aggregatedStats.filter(p => p.playerNumber !== 'Equipo');
    const sortedByGoles = [...playersOnly].sort((a, b) => b.goles - a.goles);
    const sortedByRebounds = [...playersOnly].sort((a, b) => b.totalRebounds - a.totalRebounds);
    const sortedByAsistencias = [...playersOnly].sort((a, b) => b.asistencias - a.asistencias);
    return { goles: sortedByGoles, rebotes: sortedByRebounds, asistencias: sortedByAsistencias };
  }, [aggregatedStats]);
  
  const hasData = aggregatedStats.some(p => p.playerNumber !== 'Equipo' && (p.goles > 0 || p.fallos > 0 || p.recuperos > 0 || p.perdidas > 0));

  if (!hasData && !isSharing) {
    return (
      <div className="bg-slate-800 p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-3xl font-bold text-cyan-400 mb-2">Estadísticas</h2>
        <p className="text-slate-400">Registra algunos datos para ver las estadísticas de los jugadores aquí.</p>
      </div>
    );
  }

  const periodTranslations: {[key in GamePeriod]: string} = { 'First Half': 'Primer Tiempo', 'Second Half': 'Segundo Tiempo' };

   const tableHeaders: { key: TallySortableKey, label: string, title: string }[] = [
    { key: 'playerNumber', label: 'Jugador', title: 'Jugador' },
    { key: 'goles', label: 'G', title: 'Goles' },
    { key: 'totalShots', label: 'T', title: 'Tiros Totales (Goles + Fallos)' },
    { key: 'golPercentage', label: '%G', title: '% Goles' },
    { key: 'recuperos', label: 'Rec', title: 'Recuperos' },
    { key: 'perdidas', label: 'Pér', title: 'Pérdidas' },
    { key: 'reboteOfensivo', label: 'RO', title: 'Rebotes Ofensivos' },
    { key: 'reboteDefensivo', label: 'RD', title: 'Rebotes Defensivos' },
    { key: 'asistencias', label: 'Ast', title: 'Asistencias' },
    { key: 'faltasPersonales', label: 'FP', title: 'Faltas Personales'},
    { key: 'golesContra', label: 'GC', title: 'Goles en Contra' },
  ];

  return (
    <div className="flex flex-col gap-8">
      {!isSharing && (
        <div className="w-full bg-slate-800 p-1.5 rounded-lg shadow-lg flex justify-center max-w-xl mx-auto">
          <button onClick={() => setTallyPeriodFilter('all')} className={getFilterButtonClass(tallyPeriodFilter === 'all')}>Ambos</button>
          <button onClick={() => setTallyPeriodFilter('First Half')} className={getFilterButtonClass(tallyPeriodFilter === 'First Half')}>{periodTranslations['First Half']}</button>
          <button onClick={() => setTallyPeriodFilter('Second Half')} className={getFilterButtonClass(tallyPeriodFilter === 'Second Half')}>{periodTranslations['Second Half']}</button>
        </div>
      )}
      
       {/* Team Statistics Section */}
      <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
        <h3 className="text-3xl font-bold text-cyan-400 mb-6 text-center">Estadísticas del Equipo</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-center">
            <div className="p-2 sm:p-4 bg-slate-700/50 rounded-lg"><p className="text-2xl sm:text-3xl font-bold text-green-400">{teamTotals.goles}</p><p className="text-xs sm:text-sm text-slate-400">Goles</p></div>
            <div className="p-2 sm:p-4 bg-slate-700/50 rounded-lg"><p className="text-2xl sm:text-3xl font-bold text-red-400">{teamTotals.fallos}</p><p className="text-xs sm:text-sm text-slate-400">Fallos</p></div>
            <div className="p-2 sm:p-4 bg-slate-700/50 rounded-lg"><p className="text-2xl sm:text-3xl font-bold text-white">{teamTotals.recuperos}</p><p className="text-xs sm:text-sm text-slate-400">Recuperos</p></div>
            <div className="p-2 sm:p-4 bg-slate-700/50 rounded-lg"><p className="text-2xl sm:text-3xl font-bold text-white">{teamTotals.perdidas}</p><p className="text-xs sm:text-sm text-slate-400">Pérdidas</p></div>
            <div className="p-2 sm:p-4 bg-slate-700/50 rounded-lg"><p className="text-2xl sm:text-3xl font-bold text-white">{teamTotals.reboteOfensivo + teamTotals.reboteDefensivo}</p><p className="text-xs sm:text-sm text-slate-400">Rebotes</p></div>
            <div className="p-2 sm:p-4 bg-slate-700/50 rounded-lg"><p className="text-2xl sm:text-3xl font-bold text-white">{teamTotals.asistencias}</p><p className="text-xs sm:text-sm text-slate-400">Asistencias</p></div>
            <div className="p-2 sm:p-4 bg-slate-700/50 rounded-lg"><p className="text-2xl sm:text-3xl font-bold text-white">{teamTotals.faltasPersonales}</p><p className="text-xs sm:text-sm text-slate-400">Faltas</p></div>
            <div className="p-2 sm:p-4 bg-slate-700/50 rounded-lg"><p className="text-2xl sm:text-3xl font-bold text-white">{tallyStats && tallyStats['Equipo'] ? (tallyStats['Equipo']['First Half'].golesContra + tallyStats['Equipo']['Second Half'].golesContra) : 0}</p><p className="text-xs sm:text-sm text-slate-400">G. en Contra</p></div>
        </div>
      </div>

       {/* Top Performers Section */}
      <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
        <h3 className="text-3xl font-bold text-cyan-400 mb-6 text-center">Jugadores Destacados</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TopPerformerCategory title="Goles" performers={topPerformers.goles} statKey="goles" playerNames={playerNames} />
            <TopPerformerCategory title="Rebotes" performers={topPerformers.rebotes} statKey="totalRebounds" playerNames={playerNames} />
            <TopPerformerCategory title="Asistencias" performers={topPerformers.asistencias} statKey="asistencias" playerNames={playerNames} />
        </div>
      </div>
      
      {/* Performance Table Section */}
      <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
        <h3 className="text-3xl font-bold text-cyan-400 mb-4">Rendimiento por Jugador</h3>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[700px] text-left table-auto">
            <thead>
              <tr className="border-b-2 border-slate-600">
                {tableHeaders.map(({ key, label, title }) => (
                  <th key={key} title={title} className={`p-2 text-sm tracking-wider font-semibold ${key === 'playerNumber' ? 'text-left' : 'text-center'}`}>
                     <button onClick={() => requestSort(key)} className={`w-full font-semibold flex items-center gap-2 hover:text-cyan-300 transition-colors disabled:cursor-default disabled:hover:text-inherit ${key === 'playerNumber' ? 'justify-start' : 'justify-center'}`} disabled={isSharing}>
                        {label} {getSortIndicator(key)}
                     </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedAggregatedStats.map(player => (
                <tr key={player.playerNumber} className="border-b border-slate-700 hover:bg-slate-700/50">
                  <td className="p-2 font-mono text-cyan-300 font-bold">{playerNames[player.playerNumber] || (player.playerNumber === 'Equipo' ? 'Equipo' : `#${player.playerNumber}`)}</td>
                  <td className="p-2 font-mono text-white text-center">{player.goles}</td>
                  <td className="p-2 font-mono text-white text-center">{player.totalShots}</td>
                  <td className="p-2 font-mono text-white text-center">{player.golPercentage.toFixed(0)}%</td>
                  <td className="p-2 font-mono text-white text-center">{player.recuperos}</td>
                  <td className="p-2 font-mono text-white text-center">{player.perdidas}</td>
                  <td className="p-2 font-mono text-white text-center">{player.reboteOfensivo}</td>
                  <td className="p-2 font-mono text-white text-center">{player.reboteDefensivo}</td>
                  <td className="p-2 font-mono text-white text-center">{player.asistencias}</td>
                  <td className="p-2 font-mono text-white text-center">{player.faltasPersonales}</td>
                  <td className="p-2 font-mono text-white text-center">{player.golesContra}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const TopPerformerCategory: React.FC<{
    title: string;
    performers: (TallyStatsPeriod & { playerNumber: string, totalRebounds: number })[];
    statKey: 'goles' | 'totalRebounds' | 'asistencias';
    playerNames: Record<string, string>;
}> = ({ title, performers, statKey, playerNames }) => (
    <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
        <h4 className="text-xl font-bold text-center text-cyan-400 mb-3">{title}</h4>
        <div className="space-y-2">
            {performers.slice(0, 3).map((player, index) => (
                <div key={player.playerNumber} className="flex items-center gap-3 bg-slate-800/50 p-2 rounded-md">
                    <TrophyIcon rank={index + 1} />
                    <span className="flex-grow font-semibold text-white truncate">{playerNames[player.playerNumber] || `Jugador ${player.playerNumber}`}</span>
                    <span className="font-bold text-lg text-cyan-300">{player[statKey]}</span>
                </div>
            ))}
            {performers.length === 0 && <p className="text-slate-500 text-center text-sm py-2">Sin datos</p>}
        </div>
    </div>
);


const DonutChart: React.FC<{ percentage: number; size?: number; strokeWidth?: number; }> = ({ percentage, size = 120, strokeWidth = 15 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255, 255, 255, 0.1)" strokeWidth={strokeWidth} fill="transparent" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-500 ease-in-out" />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{percentage.toFixed(1)}%</span>
        <span className="text-xs text-slate-400">Goles</span>
      </div>
    </div>
  );
};

const PercentageBar: React.FC<{ percentage: number }> = ({ percentage }) => (
  <div className="w-full bg-slate-600 rounded-full h-2.5">
    <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
  </div>
);


const StatisticsView: React.FC<StatisticsViewProps> = React.memo(({ stats, playerNames, shots, onShareClick, isSharing = false, gameMode, tallyStats }) => {
  
  if (gameMode === 'stats-tally' && tallyStats) {
    return (
      <>
       {!isSharing && (
        <div className="flex justify-between items-center -mb-4">
          <h2 className="text-3xl font-bold text-cyan-400">Resumen Estadístico</h2>
          {onShareClick && typeof navigator.share === 'function' && Object.keys(tallyStats).length > 0 && (
            <button
              onClick={onShareClick}
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500"
              aria-label="Compartir estadísticas"
            >
              <ShareIcon className="h-4 w-4 sm:h-5 sm:w-5"/>
              <span className="hidden sm:inline">Compartir Reporte</span>
            </button>
          )}
        </div>
      )}
      <div className="pt-4">
        <TallyStatisticsView tallyStats={tallyStats} playerNames={playerNames} isSharing={isSharing} />
      </div>
      </>
    );
  }

  // --- Default Shot Chart View ---
  const topScorers = [...stats].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 3);
  const totalShots = stats.reduce((acc, player) => acc + player.totalShots, 0);
  const totalGoles = stats.reduce((acc, player) => acc + player.totalGoles, 0);
  const totalPoints = stats.reduce((acc, player) => acc + player.totalPoints, 0);
  const totalMisses = totalShots - totalGoles;
  const teamGolPercentage = totalShots > 0 ? (totalGoles / totalShots) * 100 : 0;
  
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
    <>
      {!isSharing && (
        <div className="flex justify-between items-center -mb-4">
          <h2 className="text-3xl font-bold text-cyan-400">Resumen Estadístico</h2>
          {onShareClick && typeof navigator.share === 'function' && hasData && (
            <button
              onClick={onShareClick}
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500"
              aria-label="Compartir estadísticas"
            >
              <ShareIcon className="h-4 w-4 sm:h-5 sm:w-5"/>
              <span className="hidden sm:inline">Compartir Reporte</span>
            </button>
          )}
        </div>
      )}
      
      <div className="pt-4 flex flex-col gap-8">
        <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
          <h3 className="text-3xl font-bold text-cyan-400 mb-6 text-center">Estadísticas del Equipo</h3>
          <div className="flex flex-col md:flex-row items-center justify-around gap-8">
            <div className="text-cyan-400">
              <DonutChart percentage={teamGolPercentage} />
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-center">
              <div className="p-4 bg-slate-700/50 rounded-lg"><p className="text-3xl font-bold text-white">{totalPoints}</p><p className="text-sm text-slate-400">Puntos Totales</p></div>
              <div className="p-4 bg-slate-700/50 rounded-lg"><p className="text-3xl font-bold text-white">{totalShots}</p><p className="text-sm text-slate-400">Tiros Totales</p></div>
              <div className="p-4 bg-slate-700/50 rounded-lg"><p className="text-3xl font-bold text-green-400">{totalGoles}</p><p className="text-sm text-slate-400">Goles</p></div>
              <div className="p-4 bg-slate-700/50 rounded-lg"><p className="text-3xl font-bold text-red-400">{totalMisses}</p><p className="text-sm text-slate-400">Fallos</p></div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
          <h3 className="text-3xl font-bold text-cyan-400 mb-6 text-center">Jugadores Destacados</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topScorers.map((player, index) => (
              <div key={player.playerNumber} className="bg-slate-700/50 p-6 rounded-xl flex flex-col items-center gap-2 border border-slate-600">
                <div className="flex items-center gap-3"><TrophyIcon rank={index + 1} /><p className="text-2xl font-bold text-white">{playerNames[player.playerNumber] || `Jugador ${player.playerNumber}`}</p></div>
                <p className="text-5xl font-extrabold text-cyan-400">{player.totalPoints}</p>
                <p className="text-slate-400">Puntos Totales</p>
              </div>
            ))}
            {topScorers.length === 0 && <p className="text-slate-400 text-center col-span-3">Aún no se han anotado puntos.</p>}
          </div>
        </div>
      </div>
      
      {canShowAdvancedCharts && (
        <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
            <h3 className="text-3xl font-bold text-cyan-400 mb-6 text-center">Gráfico Temporal</h3>
            <TemporalChart shots={shots} playerNames={playerNames} stats={stats} />
        </div>
      )}
      
      <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-3xl font-bold text-cyan-400">Rendimiento por Jugador</h3>
          {canShowAdvancedCharts && (
            <button onClick={handleExportCSV} className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500" aria-label="Exportar todos los tiros como CSV">
              <DownloadIcon className="h-4 w-4 sm:h-5 sm:w-5"/><span className="hidden sm:inline">Exportar Logs</span>
            </button>
          )}
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="border-b-2 border-slate-600">
                <th className="p-3 text-sm tracking-wider"><button onClick={() => requestSort('playerNumber')} className="w-full text-left font-semibold flex items-center gap-2 hover:text-cyan-300 transition-colors disabled:cursor-default disabled:hover:text-inherit" disabled={isSharing}>Jugador {getSortIndicator('playerNumber')}</button></th>
                <th className="p-3 text-sm tracking-wider text-center"><button onClick={() => requestSort('totalPoints')} className="w-full justify-center font-semibold flex items-center gap-2 hover:text-cyan-300 transition-colors disabled:cursor-default disabled:hover:text-inherit" disabled={isSharing}>Puntos {getSortIndicator('totalPoints')}</button></th>
                <th className="p-3 text-sm tracking-wider text-center"><button onClick={() => requestSort('totalShots')} className="w-full justify-center font-semibold flex items-center gap-2 hover:text-cyan-300 transition-colors disabled:cursor-default disabled:hover:text-inherit" disabled={isSharing}>Tiros (G/T) {getSortIndicator('totalShots')}</button></th>
                <th className="p-3 text-sm tracking-wider w-[30%]"><button onClick={() => requestSort('golPercentage')} className="w-full text-left font-semibold flex items-center gap-2 hover:text-cyan-300 transition-colors disabled:cursor-default disabled:hover:text-inherit" disabled={isSharing}>% Goles {getSortIndicator('golPercentage')}</button></th>
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
