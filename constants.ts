
import { TallyStatsPeriod } from './types';

export const PERIOD_NAMES = {
    'First Half': 'Primer Tiempo',
    'Second Half': 'Segundo Tiempo',
    'First Overtime': '1er Suplementario',
    'Second Overtime': '2do Suplementario',
};

export const STAT_LABELS: Record<keyof TallyStatsPeriod, string> = {
    goles: 'Goles',
    triples: 'Triples',
    fallos: 'Fallos',
    recuperos: 'Recuperos',
    perdidas: 'Pérdidas',
    reboteOfensivo: 'Reb. Of.',
    reboteDefensivo: 'Reb. Def.',
    asistencias: 'Asist.',
    golesContra: 'G. Contra',
    faltasPersonales: 'Faltas',
};


export const GAME_STATE_STORAGE_KEY = 'cestoTrackerGameState';

// --- ADMIN CONFIGURATION ---
// Admin access is controlled via the `is_admin` column in the `profiles` table in Supabase.
// To grant admin access, run: UPDATE profiles SET is_admin = TRUE WHERE id = '<user-id>';
export const SUPER_ADMIN_EMAILS = [
    'santiigreco@gmail.com', // Developer/Owner
];

// Configuration for Teams
export interface TeamConfig {
    name: string;
}

export const TEAMS_CONFIG: TeamConfig[] = [
    { name: "Ballester" },
    { name: "APV" },
    { name: "Ciudad" },
    { name: "Avellaneda" },
    { name: "Hacoaj" },
    { name: "SITAS" },
    { name: "Social Parque" },
    { name: "CEF" },
    { name: "GEVP" },
    { name: "Vélez" }
];

// Helper to maintain compatibility with simple string arrays
export const PREDEFINED_TEAMS = TEAMS_CONFIG.map(t => t.name);

// Helper to get logo by name (Deprecated: handled in TeamLogo.tsx now, keeping for compatibility if needed elsewhere, but returning null)
export const getTeamLogo = (teamName: string): string | undefined => {
    return undefined;
};
