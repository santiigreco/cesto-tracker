import React, { useState, useMemo, useEffect } from 'react';
import { GamePeriod, TallyStats, TallyStatsPeriod } from '@/types';
import { ChartBarIcon } from '@/components/icons';
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
  all: 'Todos',
  'First Half': '1er T',
  'Second Half': '2do T',
  'First Overtime': '1er S',
  'Second Overtime': '2do S',
};

interface TallyStatisticsViewProps {
  tallyStats: Record<string, TallyStats>;
  playerNames: Record<string, string>;
  isSharing: boolean;
  currentPeriod?: GamePeriod;
}

export const TallyStatisticsView: React.FC<TallyStatisticsViewProps> = ({
  tallyStats,
  playerNames,
  isSharing,
  currentPeriod,
}) => {
  const [tallyPeriodFilter, setTallyPeriodFilter] = useState<'all' | GamePeriod>('all');
  const [showAllPlayers, setShowAllPlayers] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: TallySortableKey;
    direction: 'ascending' | 'descending';
  } | null>({ key: 'playerNumber', direction: 'ascending' });

  const visibleFilters = useMemo<Array<'all' | GamePeriod>>(() => {
    const hasPeriodStats = (period: GamePeriod) =>
      Object.values(tallyStats).some((playerTally) => {
        const ps = playerTally?.[period];
        if (!ps) return false;
        return (Object.keys(initialTallyStatsPeriod) as Array<keyof TallyStatsPeriod>).some(
          (key) => (ps[key] || 0) > 0
        );
      });

    const showFirstOt =
      currentPeriod === 'First Overtime' ||
      currentPeriod === 'Second Overtime' ||
      hasPeriodStats('First Overtime');
    const showSecondOt =
      currentPeriod === 'Second Overtime' || hasPeriodStats('Second Overtime');

    const filters: Array<'all' | GamePeriod> = ['all', 'First Half', 'Second Half'];
    if (showFirstOt) filters.push('First Overtime');
    if (showSecondOt) filters.push('Second Overtime');
    return filters;
  }, [tallyStats, currentPeriod]);

  useEffect(() => {
    if (!visibleFilters.includes(tallyPeriodFilter)) {
      setTallyPeriodFilter('all');
    }
  }, [visibleFilters, tallyPeriodFilter]);

  const aggregatedStats = useMemo(() => {
    return Object.entries(tallyStats).map(([playerNumber, playerTally]) => {
      let stats: TallyStatsPeriod = { ...initialTallyStatsPeriod };

      if (tallyPeriodFilter === 'all') {
        Object.values(playerTally).forEach((periodStats: TallyStatsPeriod) => {
          (Object.keys(stats) as Array<keyof TallyStatsPeriod>).forEach((key) => {
            stats[key] += periodStats[key] || 0;
          });
        });
      } else {
        stats = { ...(playerTally[tallyPeriodFilter] || initialTallyStatsPeriod) };
      }

      const totalShots = stats.goles + stats.triples + stats.fallos;
      const totalRebounds = stats.reboteOfensivo + stats.reboteDefensivo;
      const golPercentage =
        totalShots > 0 ? ((stats.goles + stats.triples) / totalShots) * 100 : 0;
      const points = stats.goles * 2 + stats.triples * 3;

      return { playerNumber, ...stats, totalRebounds, golPercentage, totalShots, points };
    });
  }, [tallyStats, tallyPeriodFilter]);

  const sortedAggregatedStats = useMemo(() => {
    const sortableItems = [...aggregatedStats];
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
    if (!sortConfig || sortConfig.key !== key) {
      return <span className="text-ink-muted/50 text-[10px]">↕</span>;
    }
    return (
      <span className="text-brand text-[10px]">
        {sortConfig.direction === 'ascending' ? '▲' : '▼'}
      </span>
    );
  };

  const teamTotals = useMemo(() => {
    return aggregatedStats.reduce(
      (acc, playerStats) => {
        if (playerStats.playerNumber !== 'Equipo') {
          (Object.keys(initialTallyStatsPeriod) as Array<keyof TallyStatsPeriod>).forEach((key) => {
            acc[key] += playerStats[key];
          });
          acc.points += playerStats.points;
        }
        return acc;
      },
      { ...initialTallyStatsPeriod, points: 0 }
    );
  }, [aggregatedStats]);

  const teamMadeShots = teamTotals.goles + teamTotals.triples;
  const teamTotalShots = teamMadeShots + teamTotals.fallos;
  const teamEfficiency = teamTotalShots > 0 ? (teamMadeShots / teamTotalShots) * 100 : 0;

  const topPerformers = useMemo(() => {
    const playersOnly = aggregatedStats.filter((p) => p.playerNumber !== 'Equipo');
    const sortedByPoints = [...playersOnly].sort((a, b) => b.points - a.points);
    const sortedByRebounds = [...playersOnly].sort((a, b) => b.totalRebounds - a.totalRebounds);
    const sortedByAsistencias = [...playersOnly].sort((a, b) => b.asistencias - a.asistencias);
    return {
      points: sortedByPoints as TopPerformerItem[],
      rebotes: sortedByRebounds as TopPerformerItem[],
      asistencias: sortedByAsistencias as TopPerformerItem[],
    };
  }, [aggregatedStats]);

  const hasData = aggregatedStats.some((p) =>
    (Object.keys(initialTallyStatsPeriod) as Array<keyof TallyStatsPeriod>).some(
      (key) => (p[key] || 0) > 0
    )
  );

  const activeRows = useMemo(
    () =>
      sortedAggregatedStats.filter((p) =>
        (Object.keys(initialTallyStatsPeriod) as Array<keyof TallyStatsPeriod>).some(
          (key) => (p[key] || 0) > 0
        )
      ),
    [sortedAggregatedStats]
  );

  const hasInactiveRows =
    activeRows.length > 0 && activeRows.length < sortedAggregatedStats.length;
  const displayedRows =
    hasInactiveRows && (isSharing || !showAllPlayers) ? activeRows : sortedAggregatedStats;

  const periodFilterBar = !isSharing ? (
    <div className="w-full bg-surface-card border border-border-subtle p-1 rounded-xl shadow-card">
      <div className="flex flex-wrap justify-center gap-1">
        {visibleFilters.map((filterKey) => {
          const isActive = tallyPeriodFilter === filterKey;
          return (
            <button
              key={filterKey}
              type="button"
              aria-pressed={isActive}
              onClick={() => setTallyPeriodFilter(filterKey)}
              className={`min-h-[44px] flex-1 min-w-[74px] sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-brand text-ink-inverse font-extrabold'
                  : 'text-ink-secondary hover:bg-surface-elevated hover:text-ink-primary'
              }`}
            >
              {periodTranslations[filterKey]}
            </button>
          );
        })}
      </div>
    </div>
  ) : null;

  if (!hasData && !isSharing) {
    return (
      <div className="flex flex-col gap-5">
        {periodFilterBar}
        <div className="bg-surface-card border border-border-subtle p-8 rounded-2xl shadow-card text-center flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-border-strong flex items-center justify-center text-brand mb-1">
            <ChartBarIcon className="h-6 w-6" />
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-ink-primary">
            Todavía no hay estadísticas
          </h2>
          <p className="text-ink-muted text-sm max-w-sm">
            Registrá jugadas en la planilla para ver el rendimiento de tu equipo acá.
          </p>
        </div>
      </div>
    );
  }

  const tableHeaders: { key: TallySortableKey; label: string; title: string }[] = [
    { key: 'playerNumber', label: 'Jugadora', title: 'Jugadora' },
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

  const renderMetricCell = (val: number, extraClass = 'text-ink-primary') => (
    <span className={val === 0 ? 'text-ink-muted/50' : extraClass}>{val}</span>
  );

  return (
    <div className="flex flex-col gap-5">
      {periodFilterBar}

      {/* Team Statistics Section */}
      <section className="bg-surface-card border border-border-subtle p-4 sm:p-5 rounded-2xl shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            Resumen del Equipo
          </h3>
          <span className="text-xs font-semibold text-ink-muted tabular-nums">
            {periodTranslations[tallyPeriodFilter]}
          </span>
        </div>

        {/* Hero KPIs: Points & Efficiency */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 sm:p-4 bg-surface-elevated border border-border-strong rounded-xl flex flex-col items-center text-center">
            <span className="text-3xl sm:text-4xl font-black text-brand leading-none tabular-nums">
              {teamTotals.points}
            </span>
            <span className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider mt-1.5">
              Puntos Totales
            </span>
          </div>

          <div className="p-3.5 sm:p-4 bg-surface-elevated border border-border-strong rounded-xl flex flex-col items-center text-center">
            <span className="text-3xl sm:text-4xl font-black text-sport-goal-light leading-none tabular-nums">
              {teamEfficiency.toFixed(0)}%
            </span>
            <span className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider mt-1.5 tabular-nums">
              Efectividad ({teamMadeShots}/{teamTotalShots})
            </span>
          </div>
        </div>

        {/* Shooting Breakdown */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="p-3 bg-sport-goal/10 border border-sport-goal/25 rounded-xl">
            <p className="text-2xl font-extrabold text-sport-goal-light leading-none tabular-nums">
              {teamTotals.goles}
            </p>
            <p className="text-[11px] font-semibold text-ink-secondary mt-1">Goles</p>
          </div>
          <div className="p-3 bg-sport-triple/10 border border-sport-triple/25 rounded-xl">
            <p className="text-2xl font-extrabold text-sport-triple-light leading-none tabular-nums">
              {teamTotals.triples}
            </p>
            <p className="text-[11px] font-semibold text-ink-secondary mt-1">Triples</p>
          </div>
          <div className="p-3 bg-sport-miss/10 border border-sport-miss/25 rounded-xl">
            <p className="text-2xl font-extrabold text-sport-miss-light leading-none tabular-nums">
              {teamTotals.fallos}
            </p>
            <p className="text-[11px] font-semibold text-ink-secondary mt-1">Fallos</p>
          </div>
        </div>

        {/* Technical & Foul Breakdown */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
          <div className="p-2.5 bg-surface-elevated/60 border border-border-subtle rounded-xl">
            <p className="text-lg sm:text-xl font-extrabold text-ink-primary leading-none tabular-nums">
              {teamTotals.recuperos}
            </p>
            <p className="text-[11px] text-ink-muted font-medium mt-1">Recuperos</p>
          </div>
          <div className="p-2.5 bg-surface-elevated/60 border border-border-subtle rounded-xl">
            <p className="text-lg sm:text-xl font-extrabold text-sport-miss-light leading-none tabular-nums">
              {teamTotals.perdidas}
            </p>
            <p className="text-[11px] text-ink-muted font-medium mt-1">Pérdidas</p>
          </div>
          <div className="p-2.5 bg-surface-elevated/60 border border-border-subtle rounded-xl">
            <p className="text-lg sm:text-xl font-extrabold text-ink-primary leading-none tabular-nums">
              {teamTotals.reboteOfensivo + teamTotals.reboteDefensivo}
            </p>
            <p className="text-[11px] text-ink-muted font-medium mt-1">Rebotes</p>
          </div>
          <div className="p-2.5 bg-surface-elevated/60 border border-border-subtle rounded-xl">
            <p className="text-lg sm:text-xl font-extrabold text-ink-primary leading-none tabular-nums">
              {teamTotals.asistencias}
            </p>
            <p className="text-[11px] text-ink-muted font-medium mt-1">Asist.</p>
          </div>
          <div className="p-2.5 bg-surface-elevated/60 border border-border-subtle rounded-xl">
            <p className="text-lg sm:text-xl font-extrabold text-sport-warn-light leading-none tabular-nums">
              {teamTotals.faltasPersonales}
            </p>
            <p className="text-[11px] text-ink-muted font-medium mt-1">Faltas</p>
          </div>
          <div className="p-2.5 bg-surface-elevated/60 border border-border-subtle rounded-xl">
            <p className="text-lg sm:text-xl font-extrabold text-ink-primary leading-none tabular-nums">
              {teamTotals.golesContra}
            </p>
            <p className="text-[11px] text-ink-muted font-medium mt-1">G. Contra</p>
          </div>
        </div>
      </section>

      {/* Top Performers Section */}
      <section className="bg-surface-card border border-border-subtle p-4 sm:p-5 rounded-2xl shadow-card">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-3">
          Jugadoras Destacadas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
      </section>

      {/* Performance Table Section */}
      <section className="bg-surface-card border border-border-subtle p-4 sm:p-5 rounded-2xl shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            Rendimiento por Jugadora
          </h3>
          {!isSharing && hasInactiveRows && (
            <button
              type="button"
              onClick={() => setShowAllPlayers((prev) => !prev)}
              className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-hover text-ink-secondary hover:text-ink-primary border border-border-strong text-xs font-bold transition-colors tabular-nums"
            >
              {showAllPlayers
                ? `Solo activas (${activeRows.length})`
                : `Mostrar todas (${sortedAggregatedStats.length})`}
            </button>
          )}
        </div>

        <div className="overflow-x-auto custom-scrollbar -mx-1 px-1">
          <table className="w-full min-w-[700px] text-left table-auto border-collapse">
            <thead>
              <tr className="border-b border-border-strong">
                {tableHeaders.map(({ key, label, title }) => {
                  const isSorted = sortConfig?.key === key;
                  return (
                    <th
                      key={key}
                      title={title}
                      className={`py-2.5 px-2 text-[11px] uppercase tracking-wider font-bold ${
                        key === 'playerNumber'
                          ? 'text-left sticky left-0 z-20 bg-surface-card border-r border-border-subtle min-w-[120px]'
                          : 'text-center'
                      } ${isSorted ? 'text-brand' : 'text-ink-muted'}`}
                    >
                      <button
                        type="button"
                        onClick={() => requestSort(key)}
                        className={`w-full min-h-[32px] font-bold flex items-center gap-1 hover:text-ink-primary transition-colors disabled:cursor-default disabled:hover:text-inherit ${
                          key === 'playerNumber' ? 'justify-start' : 'justify-center'
                        }`}
                        disabled={isSharing}
                      >
                        <span>{label}</span>
                        {getSortIndicator(key)}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {displayedRows.map((player) => {
                const foulColor =
                  player.faltasPersonales >= 6
                    ? 'text-sport-miss-light font-extrabold'
                    : player.faltasPersonales === 5
                      ? 'text-sport-warn-light font-extrabold'
                      : undefined;

                return (
                  <tr
                    key={player.playerNumber}
                    className="border-b border-border-subtle/70 hover:bg-surface-elevated/45 transition-colors text-sm"
                  >
                    <td className="py-2.5 px-2 font-bold text-ink-primary sticky left-0 z-10 bg-surface-card border-r border-border-subtle truncate max-w-[130px] tabular-nums">
                      {playerNames[player.playerNumber] ||
                        (player.playerNumber === 'Equipo' ? 'Equipo' : `#${player.playerNumber}`)}
                    </td>
                    <td className="py-2.5 px-2 font-extrabold text-center tabular-nums">
                      {renderMetricCell(player.points, 'text-brand')}
                    </td>
                    <td className="py-2.5 px-2 font-semibold text-center tabular-nums">
                      {renderMetricCell(player.goles, 'text-sport-goal-light')}
                    </td>
                    <td className="py-2.5 px-2 font-semibold text-center tabular-nums">
                      {renderMetricCell(player.triples, 'text-sport-triple-light')}
                    </td>
                    <td className="py-2.5 px-2 font-medium text-center tabular-nums">
                      {renderMetricCell(player.totalShots)}
                    </td>
                    <td className="py-2.5 px-2 font-medium text-center tabular-nums">
                      <span className={player.totalShots === 0 ? 'text-ink-muted/50' : 'text-ink-secondary'}>
                        {player.golPercentage.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-2 font-medium text-center tabular-nums">
                      {renderMetricCell(player.recuperos)}
                    </td>
                    <td className="py-2.5 px-2 font-medium text-center tabular-nums">
                      {renderMetricCell(player.perdidas, 'text-sport-miss-light')}
                    </td>
                    <td className="py-2.5 px-2 font-medium text-center tabular-nums">
                      {renderMetricCell(player.reboteOfensivo)}
                    </td>
                    <td className="py-2.5 px-2 font-medium text-center tabular-nums">
                      {renderMetricCell(player.reboteDefensivo)}
                    </td>
                    <td className="py-2.5 px-2 font-medium text-center tabular-nums">
                      {renderMetricCell(player.asistencias)}
                    </td>
                    <td className="py-2.5 px-2 font-medium text-center tabular-nums">
                      {renderMetricCell(player.faltasPersonales, foulColor)}
                    </td>
                    <td className="py-2.5 px-2 font-medium text-center tabular-nums">
                      {renderMetricCell(player.golesContra)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
