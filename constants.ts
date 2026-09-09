
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

export type FederationId = 'capital' | 'corrientes';

export interface FederationConfig {
    id: FederationId;
    name: string;
    shortName: string;
}

export const FEDERATIONS_CONFIG: FederationConfig[] = [
    { id: 'capital', name: 'Capital', shortName: 'Capital' },
    { id: 'corrientes', name: 'Corrientes', shortName: 'Corrientes' },
];

// Configuration for Teams
export interface TeamConfig {
    name: string;
    federation?: FederationId;
    city?: string;
}

export const TEAMS_CONFIG: TeamConfig[] = [
    // --- Capital ---
    { name: "APV", federation: "capital" },
    { name: "APV masc A", federation: "capital" },
    { name: "APV masc B", federation: "capital" },
    { name: "Avellaneda", federation: "capital" },
    { name: "Ballester", federation: "capital" },
    { name: "CEF La Plata", federation: "capital" },
    { name: "Ciudad", federation: "capital" },
    { name: "GEVP", federation: "capital" },
    { name: "Hacoaj", federation: "capital" },
    { name: "San Martín", federation: "capital" },
    { name: "SITAS", federation: "capital" },
    { name: "Social Parque", federation: "capital" },
    { name: "Vélez", federation: "capital" },

    // --- Corrientes ---
    { name: "Jaguareté", federation: "corrientes", city: "Corrientes" },
    { name: "Hércules", federation: "corrientes", city: "Corrientes" },
    { name: "Quilmes", federation: "corrientes", city: "Corrientes" },
    { name: "Regatas", federation: "corrientes", city: "Corrientes" },
    { name: "San Martín (Ctes)", federation: "corrientes", city: "Corrientes" },
    { name: "Banco Provincia", federation: "corrientes", city: "Corrientes" },
    { name: "Córdoba", federation: "corrientes", city: "Corrientes" },
    { name: "Colón", federation: "corrientes", city: "Corrientes" },
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
