import React from 'react';
import { TallyStatsPeriod } from '@/types';

export interface TopPerformerItem extends TallyStatsPeriod {
  playerNumber: string;
  totalRebounds: number;
  points: number;
}

const RANK_BADGE_CLASSES: Record<number, string> = {
  1: 'bg-amber-400/15 text-amber-300 border-amber-400/40',
  2: 'bg-slate-300/15 text-slate-200 border-slate-400/35',
  3: 'bg-amber-700/20 text-amber-400 border-amber-600/40',
};

export const TopPerformerCategory: React.FC<{
  title: string;
  performers: TopPerformerItem[];
  statKey: 'points' | 'totalRebounds' | 'asistencias';
  playerNames: Record<string, string>;
}> = ({ title, performers, statKey, playerNames }) => (
  <div className="bg-surface-elevated/60 p-3.5 sm:p-4 rounded-xl border border-border-subtle">
    <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-3">
      {title}
    </h4>
    <div className="space-y-2">
      {performers.slice(0, 3).map((player, index) => {
        const rank = index + 1;
        const badgeClass =
          RANK_BADGE_CLASSES[rank] || 'bg-surface-card text-ink-muted border-border-subtle';

        return (
          <div
            key={player.playerNumber}
            className="flex items-center gap-2.5 bg-surface-card border border-border-subtle px-3 py-2 rounded-xl"
          >
            <span
              className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-black tabular-nums shrink-0 ${badgeClass}`}
            >
              {rank}°
            </span>
            <span className="flex-grow text-sm font-semibold text-ink-primary truncate">
              {playerNames[player.playerNumber] || `Jugadora #${player.playerNumber}`}
            </span>
            <span className="font-black text-base text-brand tabular-nums shrink-0">
              {player[statKey]}
            </span>
          </div>
        );
      })}
      {performers.length === 0 && (
        <p className="text-ink-muted text-center text-xs py-3">Sin datos registrados</p>
      )}
    </div>
  </div>
);

export const DonutChart: React.FC<{
  percentage: number;
  size?: number;
  strokeWidth?: number;
}> = ({ percentage, size = 120, strokeWidth = 15 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-ink-primary tabular-nums">
          {percentage.toFixed(1)}%
        </span>
        <span className="text-xs text-ink-muted font-medium">Goles</span>
      </div>
    </div>
  );
};

export const PercentageBar: React.FC<{ percentage: number }> = ({ percentage }) => (
  <div className="w-full bg-surface-elevated rounded-full h-2">
    <div
      className="bg-brand h-2 rounded-full transition-all duration-300"
      style={{ width: `${percentage}%` }}
    />
  </div>
);
