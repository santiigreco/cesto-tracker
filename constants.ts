
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

export type FederationId = 'femece' | 'corrientes';

export interface FederationConfig {
    id: FederationId;
    name: string;
    shortName: string;
}

export const FEDERATIONS_CONFIG: FederationConfig[] = [
    { id: 'femece', name: 'Federación Metropolitana (FeMeCe)', shortName: 'FeMeCe' },
    { id: 'corrientes', name: 'Federación Correntina (FeCoCe)', shortName: 'Corrientes' },
];

// Configuration for Teams
export interface TeamConfig {
    name: string;
    federation?: FederationId;
    city?: string;
}

export const TEAMS_CONFIG: TeamConfig[] = [
    // --- Federación Metropolitana (FeMeCe) ---
    { name: "APV", federation: "femece" },
    { name: "APV masc A", federation: "femece" },
    { name: "APV masc B", federation: "femece" },
    { name: "Avellaneda", federation: "femece" },
    { name: "Ballester", federation: "femece" },
    { name: "CEF La Plata", federation: "femece" },
    { name: "Ciudad", federation: "femece" },
    { name: "GEVP", federation: "femece" },
    { name: "Hacoaj", federation: "femece" },
    { name: "San Martín", federation: "femece" },
    { name: "SITAS", federation: "femece" },
    { name: "Social Parque", federation: "femece" },
    { name: "Vélez", federation: "femece" },

    // --- Federación Correntina de Cestoball ---
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
