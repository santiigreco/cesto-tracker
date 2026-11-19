
import { createClient } from '@supabase/supabase-js';

const SUPABASE_TIMEOUT_MS = 8000;

const rawUrl = typeof import.meta.env?.VITE_SUPABASE_URL === 'string'
    ? import.meta.env.VITE_SUPABASE_URL.trim()
    : '';
const rawAnonKey = typeof import.meta.env?.VITE_SUPABASE_ANON_KEY === 'string'
    ? import.meta.env.VITE_SUPABASE_ANON_KEY.trim()
    : '';

export const isSupabaseConfigured: boolean = Boolean(
    rawUrl &&
    rawAnonKey &&
    (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))
);

const resolvedUrl = isSupabaseConfigured ? rawUrl : 'https://unconfigured.supabase.co';
const resolvedKey = isSupabaseConfigured ? rawAnonKey : 'unconfigured-anon-key';

const fetchWithTimeout = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    if (typeof AbortController === 'undefined') {
        return fetch(input, init);
    }

    const controller = new AbortController();
    const externalSignal = init?.signal;

    const handleExternalAbort = () => {
        controller.abort();
    };

    if (externalSignal) {
        if (externalSignal.aborted) {
            controller.abort();
        } else {
            externalSignal.addEventListener('abort', handleExternalAbort, { once: true });
        }
    }

    const timeoutId = setTimeout(() => {
        controller.abort();
    }, SUPABASE_TIMEOUT_MS);

    try {
        return await fetch(input, {
            ...init,
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timeoutId);
        if (externalSignal) {
            externalSignal.removeEventListener('abort', handleExternalAbort);
        }
    }
};

export const supabase = createClient(resolvedUrl, resolvedKey, {
    global: {
        fetch: fetchWithTimeout,
    },
});
