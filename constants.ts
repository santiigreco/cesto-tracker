
import { TallyStatsPeriod } from './types';

export const PERIOD_NAMES = {
  'First Half': 'Primer Tiempo',
  'Second Half': 'Segundo Tiempo',
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

export const SUPABASE_URL = 'https://druqnbzzibkrxffftogl.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydXFuYnp6aWJrcnhmZmZ0b2dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwODAyOTcsImV4cCI6MjA3ODY1NjI5N30.AeFCR_oN71lu0qmS5isdrj4Wu40wSqcr5uM_gjjLzqw';

export const GAME_STATE_STORAGE_KEY = 'cestoTrackerGameState';