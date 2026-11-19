import { isSupabaseConfigured } from './supabaseClient';

const extractErrorDetails = (error: unknown): { name: string; message: string; code: string; status?: number } => {
    if (!error) {
        return { name: '', message: '', code: '' };
    }
    if (typeof error === 'string') {
        return { name: '', message: error, code: '' };
    }
    if (typeof error === 'object') {
        const err = error as Record<string, unknown>;
        return {
            name: typeof err.name === 'string' ? err.name : '',
            message: typeof err.message === 'string' ? err.message : '',
            code: typeof err.code === 'string' ? err.code : '',
            status: typeof err.status === 'number' ? err.status : undefined,
        };
    }
    return { name: '', message: String(error), code: '' };
};

export const isNetworkOrConfigError = (error: unknown): boolean => {
    if (!isSupabaseConfigured) return true;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;

    const { name, message } = extractErrorDetails(error);
    const lower = message.toLowerCase();

    return (
        name === 'AbortError' ||
        lower.includes('timeout') ||
        lower.includes('timed out') ||
        lower.includes('failed to fetch') ||
        lower.includes('networkerror') ||
        lower.includes('load failed') ||
        lower.includes('err_name_not_resolved') ||
        lower.includes('enotfound') ||
        lower.includes('fetch failed') ||
        lower.includes('network request failed') ||
        lower === 'offline' ||
        lower === 'supabase_not_configured'
    );
};

export const getFriendlySupabaseErrorMessage = (error: unknown, isOnline?: boolean): string => {
    const { name, message, code, status } = extractErrorDetails(error);
    const lower = message.toLowerCase();
    const lowerCode = code.toLowerCase();

    if (!isSupabaseConfigured || lower === 'supabase_not_configured') {
        return 'La sincronización en la nube no está configurada en este entorno. Tus partidos se guardan localmente en este dispositivo.';
    }

    if (
        isOnline === false ||
        (typeof navigator !== 'undefined' && navigator.onLine === false) ||
        lower === 'offline' ||
        lower.includes('sin conexión')
    ) {
        return 'Sin conexión a internet. Tus datos siguen guardados en este dispositivo.';
    }

    if (name === 'AbortError' || lower.includes('timeout') || lower.includes('timed out')) {
        return 'El servidor tardó demasiado en responder. Verificá tu señal o reintentá en unos instantes.';
    }

    if (
        lower.includes('failed to fetch') ||
        lower.includes('networkerror') ||
        lower.includes('load failed') ||
        lower.includes('err_name_not_resolved') ||
        lower.includes('enotfound') ||
        lower.includes('fetch failed') ||
        lower.includes('network request failed')
    ) {
        return 'No se pudo conectar con el servidor de Cesto Tracker. Verificá tu conexión o reintentá más tarde.';
    }

    if (
        lower.includes('jwt expired') ||
        lower.includes('invalid jwt') ||
        lower.includes('not authenticated') ||
        lower.includes('usuario no autenticado') ||
        status === 401
    ) {
        return 'Tu sesión venció o no iniciaste sesión. Volvé a ingresar para sincronizar en la nube.';
    }

    if (
        lower.includes('permission denied') ||
        lower.includes('row-level security') ||
        lowerCode === '42501' ||
        status === 403
    ) {
        return 'No tenés permisos para realizar esta acción sobre el partido.';
    }

    if (
        lower.includes('pgrst116') ||
        lowerCode === 'pgrst116' ||
        lower.includes('not found') ||
        status === 404
    ) {
        return 'No se encontró el partido solicitado en la nube.';
    }

    return 'No pudimos comunicarnos con la nube. Tus datos siguen respaldados localmente en este dispositivo.';
};
