export type GamePeriod = 'First Half' | 'Second Half';
export type AppTab = 'logger' | 'courtAnalysis' | 'statistics' | 'faq';
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

export interface Settings {
  isManoCalienteEnabled: boolean;
  manoCalienteThreshold: number;
  isManoFriaEnabled: boolean;
  manoFriaThreshold: number;
}

export interface PlayerStreak {
    consecutiveGoles: number;
    consecutiveMisses: number;
    notifiedCaliente: boolean;
    notifiedFria: boolean;
}

export interface GameState {
    shots: Shot[];
    isSetupComplete: boolean;
    hasSeenHomepage: boolean;
    availablePlayers: string[]; // Full roster
    activePlayers: string[]; // 6 players on court
    playerNames: Record<string, string>;
    currentPlayer: string;
    currentPeriod: GamePeriod;
    settings: Settings;
    playerStreaks: Record<string, PlayerStreak>;
    tutorialStep: number; // 1: Select Player, 2: Tap Court, 3: Done
}