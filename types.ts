export type GamePeriod = 'First Half' | 'Second Half';
export type AppTab = 'logger' | 'heatmap' | 'statistics';
export type HeatmapFilter = 'all' | 'goals' | 'misses';

export interface ShotPosition {
  x: number; // in meters, from top edge (length-wise)
  y: number; // in meters, from left edge (width-wise)
}

export interface Shot {
  id: string; // Unique ID for React key prop
  playerNumber: string;
  position: ShotPosition;
  isGoal: boolean;
  goalValue: number; // 2 for regular goal, 3 for triple, 0 for miss
  period: GamePeriod;
}

export interface PlayerStats {
  playerNumber: string;
  totalShots: number;
  totalGoals: number;
  totalPoints: number;
  goalPercentage: number;
}
