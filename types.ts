
export type GamePeriod = 'First Half' | 'Second Half' | 'First Overtime' | 'Second Overtime';
export type AppTab = 'logger' | 'courtAnalysis' | 'statistics' | 'faq';
export type HeatmapFilter = 'all' | 'goles' | 'misses';
export type MapPeriodFilter = GamePeriod | 'all';
export type GameMode = 'shot-chart' | 'stats-tally' | null;

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
  gameName?: string;
  myTeam?: string;
  tournamentId?: string; // ID del torneo en base de datos
  tournamentName?: string; // Nombre para mostrar en UI
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

// Represents stats for a single period
export interface TallyStatsPeriod {
  goles: number;
  triples: number;
  fallos: number;
  recuperos: number;
  perdidas: number;
  reboteOfensivo: number;
  reboteDefensivo: number;
  asistencias: number;
  golesContra: number;
  faltasPersonales: number;
}

// Holds stats for all periods
export type TallyStats = {
    [key in GamePeriod]: TallyStatsPeriod;
};

export type StatAction = keyof TallyStatsPeriod;

export interface GameEvent {
    id: string;
    timestamp: number;
    period: GamePeriod;
    playerNumber: string; // can be 'Equipo'
    action: StatAction;
}


export interface GameState {
    gameId: string | null; // Supabase game ID
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
    gameMode: GameMode;
    tallyStats: Record<string, TallyStats>; // Maps playerNumber to their TallyStats
    opponentScore: number;
    teamFouls: { [key in GamePeriod]: number };
    gameLog: GameEvent[];
    tallyRedoLog: GameEvent[];
    isReadOnly: boolean;
}

export interface RosterPlayer {
    number: string;
    name: string;
}

export interface SavedTeam {
    id: string;
    name: string;
    players: RosterPlayer[];
    category?: string;
    created_at?: string;
}

export type UserRole = 'jugador' | 'entrenador' | 'hincha' | 'dirigente' | 'periodista' | 'admin' | 'fixture_manager' | 'otro';

export interface UserProfile {
    id: string;
    full_name: string | null;
    favorite_club: string | null;
    role: UserRole | null;
    avatar_url: string | null;
    updated_at?: string;
}
