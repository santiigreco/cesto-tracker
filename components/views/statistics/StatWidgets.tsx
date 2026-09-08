import React from 'react';
import { TrophyIcon } from '@/components/icons';
import { TallyStatsPeriod } from '@/types';

export interface TopPerformerItem extends TallyStatsPeriod {
  playerNumber: string;
  totalRebounds: number;
  points: number;
}

export const TopPerformerCategory: React.FC<{
  title: string;
  performers: TopPerformerItem[];
  statKey: 'points' | 'totalRebounds' | 'asistencias';
  playerNames: Record<string, string>;
}> = ({ title, performers, statKey, playerNames }) => (
  <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
    <h4 className="text-xl font-bold text-center text-cyan-400 mb-3">{title}</h4>
    <div className="space-y-2">
      {performers.slice(0, 3).map((player, index) => (
        <div key={player.playerNumber} className="flex items-center gap-3 bg-slate-800/50 p-2 rounded-md">
          <TrophyIcon rank={index + 1} />
          <span className="flex-grow font-semibold text-white truncate">
            {playerNames[player.playerNumber] || `Jugador ${player.playerNumber}`}
          </span>
          <span className="font-bold text-lg text-cyan-300">{player[statKey]}</span>
        </div>
      ))}
      {performers.length === 0 && <p className="text-slate-500 text-center text-sm py-2">Sin datos</p>}
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
          stroke="rgba(255, 255, 255, 0.1)"
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
        <span className="text-2xl font-bold text-white">{percentage.toFixed(1)}%</span>
        <span className="text-xs text-slate-400">Goles</span>
      </div>
    </div>
  );
};

export const PercentageBar: React.FC<{ percentage: number }> = ({ percentage }) => (
  <div className="w-full bg-slate-600 rounded-full h-2.5">
    <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
  </div>
);
