import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';

const AUTH_REDIRECT_STORAGE_KEY = 'cesto_auth_redirect';

export interface AuthContextType {
    user: User | null;
    session: Session | null;
    authLoading: boolean;
    signInWithGoogle: (redirectPath?: string) => Promise<{ error: any | null }>;
    signInWithPassword: (email: string, password: string) => Promise<{ error: any | null; user?: User | null }>;
    signUpWithPassword: (email: string, password: string, fullName?: string) => Promise<{ error: any | null; user?: User | null }>;
    resetPassword: (email: string) => Promise<{ error: any | null }>;
    handleLogin: (redirectPath?: string) => Promise<void>;
    handleLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Manejo de redirección inteligente post OAuth
    const checkAndExecutePostAuthRedirect = useCallback(() => {
        try {
            const pendingRedirect = sessionStorage.getItem(AUTH_REDIRECT_STORAGE_KEY);
            if (pendingRedirect) {
                sessionStorage.removeItem(AUTH_REDIRECT_STORAGE_KEY);
                const currentPath = window.location.pathname + window.location.search;
                if (pendingRedirect !== currentPath && pendingRedirect.startsWith('/')) {
                    console.log(`[AUTH_REDIRECT] Restaurando navegación previa a: ${pendingRedirect}`);
                    window.location.replace(pendingRedirect);
                }
            }
        } catch (e) {
            console.warn('[AUTH_REDIRECT] Error leyendo redirección previa:', e);
        }
    }, []);

    useEffect(() => {
        // 1. Obtener sesión inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setAuthLoading(false);

            if (session?.user) {
                checkAndExecutePostAuthRedirect();
            }
        }).catch((err) => {
            console.error('[AUTH] Error obteniendo sesión inicial:', err);
            setAuthLoading(false);
        });

        // 2. Escuchar cambios de estado de autenticación en tiempo real
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
            setSession(newSession);
            setUser(newSession?.user ?? null);

            if (event === 'SIGNED_IN' && newSession?.user) {
                checkAndExecutePostAuthRedirect();
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [checkAndExecutePostAuthRedirect]);

    const signInWithGoogle = async (redirectPath?: string): Promise<{ error: any | null }> => {
        try {
            const targetPath = redirectPath || (window.location.pathname + window.location.search);
            if (targetPath && targetPath !== '/') {
                sessionStorage.setItem(AUTH_REDIRECT_STORAGE_KEY, targetPath);
            }

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });

            return { error };
        } catch (err: any) {
            console.error('[AUTH_GOOGLE] Error al iniciar sesión con Google:', err);
            return { error: err };
        }
    };

    const signInWithPassword = async (email: string, password: string): Promise<{ error: any | null; user?: User | null }> => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password
            });

            if (error) {
                return { error };
            }

            setUser(data.user);
            setSession(data.session);
            return { error: null, user: data.user };
        } catch (err: any) {
            console.error('[AUTH_PASSWORD_SIGNIN] Error:', err);
            return { error: err };
        }
    };

    const signUpWithPassword = async (
        email: string,
        password: string,
        fullName?: string
    ): Promise<{ error: any | null; user?: User | null }> => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password: password,
                options: {
                    data: {
                        full_name: fullName?.trim() || email.split('@')[0]
                    }
                }
            });

            if (error) {
                return { error };
            }

            if (data.user) {
                setUser(data.user);
                setSession(data.session);
            }
            return { error: null, user: data.user };
        } catch (err: any) {
            console.error('[AUTH_PASSWORD_SIGNUP] Error:', err);
            return { error: err };
        }
    };

    const resetPassword = async (email: string): Promise<{ error: any | null }> => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: `${window.location.origin}/`
            });
            return { error };
        } catch (err: any) {
            console.error('[AUTH_RESET_PASSWORD] Error:', err);
            return { error: err };
        }
    };

    // Método legacy para compatibilidad directa
    const handleLogin = async (redirectPath?: string) => {
        await signInWithGoogle(redirectPath);
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error('[AUTH_SIGNOUT] Error al cerrar sesión:', err);
        } finally {
            setUser(null);
            setSession(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                authLoading,
                signInWithGoogle,
                signInWithPassword,
                signUpWithPassword,
                resetPassword,
                handleLogin,
                handleLogout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
