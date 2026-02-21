
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
// Reemplaza esto con tu email real para ver el panel de admin
export const ADMIN_EMAILS = ['gresolutions.info@gmail.com', 'santiagogreco@gmail.com'];

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
