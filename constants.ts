
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

// Configuration for Teams (Strictly matches Aux!C1:C13)
export interface TeamConfig {
    name: string;
}
export const TEAMS_CONFIG: TeamConfig[] = [
    { name: "APV" },
    { name: "APV masc A" },
    { name: "APV masc B" },
    { name: "Avellaneda" },
    { name: "Ballester" },
    { name: "CEF La Plata" },
    { name: "Ciudad" },
    { name: "GEVP" },
    { name: "Hacoaj" },
    { name: "San Martín" },
    { name: "SITAS" },
    { name: "Social Parque" },
    { name: "Vélez" }
];

// Configuration for Tournaments (Strictly matches Aux!E1:E14)
export const TOURNAMENTS_CONFIG = [
    "Apertura 2024", "Clausura 2024", "Apertura 2025", "Clausura 2025", 
    "Apertura 2026", "Clausura 2026", "Apertura 2027", "Clausura 2027", 
    "Apertura 2028", "Clausura 2028", "Apertura 2029", "Clausura 2029", 
    "Apertura 2030", "Clausura 2030"
];

// Configuration for Categories (Strictly matches Aux!A1:A2)
export const CATEGORIES_CONFIG = [
    "Masculino",
    "Primera A"
];

// Helper to maintain compatibility with simple string arrays
export const PREDEFINED_TEAMS = TEAMS_CONFIG.map(t => t.name);

// Helper to get logo by name (Deprecated: handled in TeamLogo.tsx now, keeping for compatibility if needed elsewhere, but returning null)
export const getTeamLogo = (teamName: string): string | undefined => {
    return undefined;
};
