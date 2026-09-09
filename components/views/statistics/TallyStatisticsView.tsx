import React, { useState, useMemo } from 'react';
import { GamePeriod, TallyStats, TallyStatsPeriod } from '@/types';
import { TopPerformerCategory, TopPerformerItem } from './StatWidgets';

export type TallySortableKey = keyof (TallyStatsPeriod & {
  playerNumber: string;
  totalRebounds: number;
  golPercentage: number;
  totalShots: number;
  points: number;
});

const initialTallyStatsPeriod: TallyStatsPeriod = {
  goles: 0,
  triples: 0,
  fallos: 0,
  recuperos: 0,
  perdidas: 0,
  reboteOfensivo: 0,
  reboteDefensivo: 0,
  asistencias: 0,
  golesContra: 0,
  faltasPersonales: 0,
};

const periodTranslations: Record<string, string> = {
  all: 'Ambos',
  'First Half': '1er T',
  'Second Half': '2do T',
  'First Overtime': '1er S',
  'Second Overtime': '2do S',
};

interface TallyStatisticsViewProps {
  tallyStats: Record<string, TallyStats>;
  playerNames: Record<string, string>;
  isSharing: boolean;
}

export const TallyStatisticsView: React.FC<TallyStatisticsViewProps> = ({
  tallyStats,
  playerNames,
  isSharing,
}) => {
  const [tallyPeriodFilter, setTallyPeriodFilter] = useState<'all' | GamePeriod>('all');
  const [sortConfig, setSortConfig] = useState<{
    key: TallySortableKey;
    direction: 'ascending' | 'descending';
  } | null>({ key: 'playerNumber', direction: 'ascending' });

  const getFilterButtonClass = (isActive: boolean) =>
    `whitespace-nowrap flex-shrink-0 font-bold py-2 px-4 rounded-md transition-colors text-sm sm:text-base ${
      isActive ? 'bg-cyan-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'
    }`;

  const aggregatedStats = useMemo(() => {
    return Object.entries(tallyStats).map(([playerNumber, playerTally]) => {
      let stats: TallyStatsPeriod = { ...initialTallyStatsPeriod };

      if (tallyPeriodFilter === 'all') {
        Object.values(playerTally).forEach((periodStats: TallyStatsPeriod) => {
          (Object.keys(stats) as Array<keyof TallyStatsPeriod>).forEach(key => {
            stats[key] += periodStats[key] || 0;
          });
        });
      } else {
        stats = { ...(playerTally[tallyPeriodFilter] || initialTallyStatsPeriod) };
      }

      const totalShots = stats.goles + stats.triples + stats.fallos;
      const totalRebounds = stats.reboteOfensivo + stats.reboteDefensivo;
      const golPercentage = totalShots > 0 ? ((stats.goles + stats.triples) / totalShots) * 100 : 0;
      const points = stats.goles * 2 + stats.triples * 3;

      return { playerNumber, ...stats, totalRebounds, golPercentage, totalShots, points };
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
    return <span className="text-cyan-400">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>;
  };

  const teamTotals = useMemo(() => {
    return aggregatedStats.reduce(
      (acc, playerStats) => {
        if (playerStats.playerNumber !== 'Equipo') {
          (Object.keys(initialTallyStatsPeriod) as Array<keyof TallyStatsPeriod>).forEach(key => {
            acc[key] += playerStats[key];
          });
          acc.points += playerStats.points;
        }
        return acc;
      },
      { ...initialTallyStatsPeriod, points: 0 }
    );
  }, [aggregatedStats]);

  const topPerformers = useMemo(() => {
    const playersOnly = aggregatedStats.filter(p => p.playerNumber !== 'Equipo');
    const sortedByPoints = [...playersOnly].sort((a, b) => b.points - a.points);
    const sortedByRebounds = [...playersOnly].sort((a, b) => b.totalRebounds - a.totalRebounds);
    const sortedByAsistencias = [...playersOnly].sort((a, b) => b.asistencias - a.asistencias);
    return {
      points: sortedByPoints as TopPerformerItem[],
      rebotes: sortedByRebounds as TopPerformerItem[],
      asistencias: sortedByAsistencias as TopPerformerItem[],
    };
  }, [aggregatedStats]);

  const hasData = aggregatedStats.some(
    p =>
      p.playerNumber !== 'Equipo' &&
      (p.goles > 0 || p.triples > 0 || p.fallos > 0 || p.recuperos > 0 || p.perdidas > 0)
  );

  if (!hasData && !isSharing) {
    return (
      <div className="flex flex-col gap-8">
        <div className="w-full bg-slate-800 p-1.5 rounded-lg shadow-lg overflow-x-auto">
          <div className="flex justify-start sm:justify-center gap-2 min-w-max">
            <button onClick={() => setTallyPeriodFilter('all')} className={getFilterButtonClass(tallyPeriodFilter === 'all')}>
              Ambos
            </button>
            <button onClick={() => setTallyPeriodFilter('First Half')} className={getFilterButtonClass(tallyPeriodFilter === 'First Half')}>
              1er T
            </button>
            <button onClick={() => setTallyPeriodFilter('Second Half')} className={getFilterButtonClass(tallyPeriodFilter === 'Second Half')}>
              2do T
            </button>
            <button onClick={() => setTallyPeriodFilter('First Overtime')} className={getFilterButtonClass(tallyPeriodFilter === 'First Overtime')}>
              1er S
            </button>
            <button onClick={() => setTallyPeriodFilter('Second Overtime')} className={getFilterButtonClass(tallyPeriodFilter === 'Second Overtime')}>
              2do S
            </button>
          </div>
        </div>
        <div className="bg-slate-800 p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-3xl font-bold text-cyan-400 mb-2">Estadísticas</h2>
          <p className="text-slate-400">Registra algunos datos para ver las estadísticas de los jugadores aquí.</p>
        </div>
      </div>
    );
  }

  const tableHeaders: { key: TallySortableKey; label: string; title: string }[] = [
    { key: 'playerNumber', label: 'Jugador', title: 'Jugador' },
    { key: 'points', label: 'Pts', title: 'Puntos Totales' },
    { key: 'goles', label: 'G', title: 'Goles (2 pts)' },
    { key: 'triples', label: '3P', title: 'Triples (3 pts)' },
    { key: 'totalShots', label: 'T', title: 'Tiros Totales (Goles + Triples + Fallos)' },
    { key: 'golPercentage', label: '%G', title: '% Efectividad' },
    { key: 'recuperos', label: 'Rec', title: 'Recuperos' },
    { key: 'perdidas', label: 'Pér', title: 'Pérdidas' },
    { key: 'reboteOfensivo', label: 'RO', title: 'Rebotes Ofensivos' },
    { key: 'reboteDefensivo', label: 'RD', title: 'Rebotes Defensivos' },
    { key: 'asistencias', label: 'Ast', title: 'Asistencias' },
    { key: 'faltasPersonales', label: 'FP', title: 'Faltas Personales' },
    { key: 'golesContra', label: 'GC', title: 'Goles en Contra' },
  ];

  return (
    <div className="flex flex-col gap-8">
      {!isSharing && (
        <div className="w-full bg-slate-800 p-1.5 rounded-lg shadow-lg overflow-x-auto">
          <div className="flex justify-start sm:justify-center gap-2 min-w-max">
            <button onClick={() => setTallyPeriodFilter('all')} className={getFilterButtonClass(tallyPeriodFilter === 'all')}>
              Ambos
            </button>
            <button onClick={() => setTallyPeriodFilter('First Half')} className={getFilterButtonClass(tallyPeriodFilter === 'First Half')}>
              {periodTranslations['First Half']}
            </button>
            <button onClick={() => setTallyPeriodFilter('Second Half')} className={getFilterButtonClass(tallyPeriodFilter === 'Second Half')}>
              {periodTranslations['Second Half']}
            </button>
            <button onClick={() => setTallyPeriodFilter('First Overtime')} className={getFilterButtonClass(tallyPeriodFilter === 'First Overtime')}>
              {periodTranslations['First Overtime']}
            </button>
            <button onClick={() => setTallyPeriodFilter('Second Overtime')} className={getFilterButtonClass(tallyPeriodFilter === 'Second Overtime')}>
              {periodTranslations['Second Overtime']}
            </button>
          </div>
        </div>
      )}

      {/* Team Statistics Section */}
      <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
        <h3 className="text-3xl font-bold text-cyan-400 mb-6 text-center">Estadísticas del Equipo</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-center">
          <div className="p-2 sm:p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <p className="text-3xl sm:text-4xl font-extrabold text-cyan-400">{teamTotals.points}</p>
            <p className="text-xs sm:text-sm text-slate-400 uppercase tracking-wide">Puntos Totales</p>
          </div>
          <div className="p-2 sm:p-4 bg-slate-700/50 rounded-lg">
            <p className="text-2xl sm:text-3xl font-bold text-green-400">{teamTotals.goles}</p>
            <p className="text-xs sm:text-sm text-slate-400">Goles</p>
          </div>
          <div className="p-2 sm:p-4 bg-slate-700/50 rounded-lg">
            <p className="text-2xl sm:text-3xl font-bold text-blue-400">{teamTotals.triples}</p>
            <p className="text-xs sm:text-sm text-slate-400">Triples</p>
          </div>
          <div className="p-2 sm:p-4 bg-slate-700/50 rounded-lg">
            <p className="text-2xl sm:text-3xl font-bold text-red-400">{teamTotals.fallos}</p>
            <p className="text-xs sm:text-sm text-slate-400">Fallos</p>
          </div>
          <div className="p-2 sm:p-4 bg-slate-700/50 rounded-lg">
            <p className="text-2xl sm:text-3xl font-bold text-white">{teamTotals.recuperos}</p>
            <p className="text-xs sm:text-sm text-slate-400">Recuperos</p>
          </div>
          <div className="p-2 sm:p-4 bg-slate-700/50 rounded-lg">
            <p className="text-2xl sm:text-3xl font-bold text-white">{teamTotals.perdidas}</p>
            <p className="text-xs sm:text-sm text-slate-400">Pérdidas</p>
          </div>
          <div className="p-2 sm:p-4 bg-slate-700/50 rounded-lg">
            <p className="text-2xl sm:text-3xl font-bold text-white">
              {teamTotals.reboteOfensivo + teamTotals.reboteDefensivo}
            </p>
            <p className="text-xs sm:text-sm text-slate-400">Rebotes</p>
          </div>
          <div className="p-2 sm:p-4 bg-slate-700/50 rounded-lg">
            <p className="text-2xl sm:text-3xl font-bold text-white">{teamTotals.asistencias}</p>
            <p className="text-xs sm:text-sm text-slate-400">Asistencias</p>
          </div>
          <div className="p-2 sm:p-4 bg-slate-700/50 rounded-lg">
            <p className="text-2xl sm:text-3xl font-bold text-white">{teamTotals.faltasPersonales}</p>
            <p className="text-xs sm:text-sm text-slate-400">Faltas</p>
          </div>
          <div className="p-2 sm:p-4 bg-slate-700/50 rounded-lg">
            <p className="text-2xl sm:text-3xl font-bold text-white">{teamTotals.golesContra}</p>
            <p className="text-xs sm:text-sm text-slate-400">G. en Contra</p>
          </div>
        </div>
      </div>

      {/* Top Performers Section */}
      <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
        <h3 className="text-3xl font-bold text-cyan-400 mb-6 text-center">Jugadores Destacados</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TopPerformerCategory
            title="Puntos"
            performers={topPerformers.points}
            statKey="points"
            playerNames={playerNames}
          />
          <TopPerformerCategory
            title="Rebotes"
            performers={topPerformers.rebotes}
            statKey="totalRebounds"
            playerNames={playerNames}
          />
          <TopPerformerCategory
            title="Asistencias"
            performers={topPerformers.asistencias}
            statKey="asistencias"
            playerNames={playerNames}
          />
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
                  <th
                    key={key}
                    title={title}
                    className={`p-2 text-sm tracking-wider font-semibold ${
                      key === 'playerNumber'
                        ? 'text-left sticky left-0 z-20 bg-slate-800 shadow-[2px_0_5px_rgba(0,0,0,0.3)] min-w-[110px]'
                        : 'text-center'
                    }`}
                  >
                    <button
                      onClick={() => requestSort(key)}
                      className={`w-full font-semibold flex items-center gap-2 hover:text-cyan-300 transition-colors disabled:cursor-default disabled:hover:text-inherit ${
                        key === 'playerNumber' ? 'justify-start' : 'justify-center'
                      }`}
                      disabled={isSharing}
                    >
                      {label} {getSortIndicator(key)}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedAggregatedStats.map(player => (
                <tr key={player.playerNumber} className="border-b border-slate-700 hover:bg-slate-700/50">
                  <td className="p-2 font-mono text-cyan-300 font-bold sticky left-0 z-10 bg-slate-800 shadow-[2px_0_5px_rgba(0,0,0,0.3)] truncate max-w-[120px]">
                    {playerNames[player.playerNumber] ||
                      (player.playerNumber === 'Equipo' ? 'Equipo' : `#${player.playerNumber}`)}
                  </td>
                  <td className="p-2 font-mono text-cyan-400 font-bold text-center">{player.points}</td>
                  <td className="p-2 font-mono text-white text-center">{player.goles}</td>
                  <td className="p-2 font-mono text-white text-center">{player.triples}</td>
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
