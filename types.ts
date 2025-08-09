export type GamePeriod = 'First Half' | 'Second Half';
export type AppTab = 'logger' | 'heatmap' | 'shotmap' | 'statistics';
export type HeatmapFilter = 'all' | 'goles' | 'misses';
export type MapPeriodFilter = GamePeriod | 'all';

export interface ShotPosition {
  x: number; // in meters, from top edge (length-wise)
  y: number; // in meters, from left edge (width-wise)
}

export interface Shot {
  id: string; // Unique ID for React key prop
  playerNumber: string;
  position: ShotPosition;
  isGol: boolean;
  golValue: number; // 2 for regular gol, 3 for triple, 0 for miss
  period: GamePeriod;
}

export interface PlayerStats {
  playerNumber: string;
  totalShots: number;
  totalGoles: number;
  totalPoints: number;
  golPercentage: number;
}