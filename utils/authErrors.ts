import { isSupabaseConfigured } from './supabaseClient';

/**
 * Traduce códigos y mensajes de error habituales de Supabase Auth a explicaciones
 * claras y humanas en español.
 */
export function getFriendlyAuthErrorMessage(error: any): string {
    if (!isSupabaseConfigured) {
        return 'El servicio de cuentas no está configurado en este entorno. Podés seguir usando la planilla en modo local.';
    }

    if (!error) return '';

    const message = typeof error === 'string' ? error : (error.message || '');
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('invalid login credentials') || lowerMessage.includes('invalid credentials')) {
        return 'El correo o la contraseña son incorrectos. Por favor verificá tus datos.';
    }

    if (lowerMessage.includes('user already registered') || lowerMessage.includes('already registered')) {
        return 'Ya existe una cuenta con este correo electrónico. Probá iniciando sesión.';
    }

    if (lowerMessage.includes('password should be at least') || lowerMessage.includes('password is too short')) {
        return 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (lowerMessage.includes('email not confirmed') || lowerMessage.includes('unconfirmed email')) {
        return 'Tu correo electrónico aún no ha sido confirmado. Revisá tu bandeja de entrada o spam.';
    }

    if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests')) {
        return 'Demasiados intentos en poco tiempo. Aguardá unos instantes antes de volver a intentar.';
    }

    if (
        error?.name === 'AbortError' ||
        lowerMessage.includes('network') ||
        lowerMessage.includes('failed to fetch') ||
        lowerMessage.includes('timeout') ||
        lowerMessage.includes('abort') ||
        lowerMessage.includes('load failed') ||
        lowerMessage.includes('err_name_not_resolved') ||
        lowerMessage.includes('networkerror') ||
        lowerMessage.includes('fetch failed')
    ) {
        return 'Error de conexión con el servidor. Verificá tu conexión a internet.';
    }

    if (lowerMessage.includes('popup closed') || lowerMessage.includes('cancelled')) {
        return 'Se canceló el inicio de sesión con Google.';
    }

    return message || 'Ocurrió un error inesperado al procesar la autenticación.';
}

/**
 * Valida formato estándar de correo electrónico.
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

/**
 * Valida longitud mínima de contraseña para Cesto Tracker.
 */
export function isValidPassword(password: string): boolean {
    return typeof password === 'string' && password.length >= 6;
}
