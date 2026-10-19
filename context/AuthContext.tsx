import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';
import { UserProfile } from '../types';

const AUTH_REDIRECT_STORAGE_KEY = 'cesto_auth_redirect';

export interface AuthContextType {
    user: User | null;
    session: Session | null;
    authLoading: boolean;
    profile: UserProfile | null;
    profileLoading: boolean;
    profileError: string | null;
    isOwner: boolean;
    canAccessAdmin: boolean;
    refreshProfile: () => Promise<void>;
    updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
    uploadAvatar: (file: File) => Promise<string | null>;
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
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState<string | null>(null);

    // Deduplication refs to prevent duplicate profile + games count queries on INITIAL_SESSION / TOKEN_REFRESHED
    const inFlightProfilePromiseRef = useRef<Promise<void> | null>(null);
    const lastFetchedUserIdRef = useRef<string | null>(null);

    // Roles y accesos calculados
    const isOwner = profile?.is_admin === true;
    const canAccessAdmin = isOwner || profile?.permission_role === 'admin';

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

    // Cargar o crear perfil en Supabase (con deduplicación en vuelo y consultas paralelas)
    const fetchProfileForUser = useCallback(async (userId: string, authUser?: User | null, forceRefresh = false) => {
        if (!forceRefresh && lastFetchedUserIdRef.current === userId) {
            if (inFlightProfilePromiseRef.current) {
                return inFlightProfilePromiseRef.current;
            }
            return;
        }

        lastFetchedUserIdRef.current = userId;
        setProfileLoading(true);
        setProfileError(null);

        const promise = (async () => {
            try {
                const [profileRes, countRes] = await Promise.all([
                    supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', userId)
                        .single(),
                    supabase
                        .from('games')
                        .select('id', { count: 'exact', head: true })
                        .eq('user_id', userId)
                ]);

                if (profileRes.error && profileRes.error.code !== 'PGRST116') {
                    throw profileRes.error;
                }

                if (profileRes.data) {
                    const gamesCount = countRes.count ?? 0;
                    setProfile({ ...(profileRes.data as UserProfile), games_count: gamesCount });
                } else {
                    const newProfile: UserProfile = {
                        id: userId,
                        full_name: authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'Usuario',
                        favorite_club: null,
                        role: 'jugador',
                        permission_role: null,
                        is_admin: false,
                        avatar_url: authUser?.user_metadata?.avatar_url || null,
                        player_number: null,
                        updated_at: new Date().toISOString()
                    };
                    setProfile(newProfile);
                    await supabase.from('profiles').upsert(newProfile);
                }
            } catch (err: any) {
                lastFetchedUserIdRef.current = null;
                console.error('[AUTH_PROFILE] Error cargando perfil:', err);
                setProfileError(err.message || 'Error cargando perfil');
            } finally {
                inFlightProfilePromiseRef.current = null;
                setProfileLoading(false);
            }
        })();

        inFlightProfilePromiseRef.current = promise;
        return promise;
    }, []);

    const refreshProfile = useCallback(async () => {
        if (user) {
            await fetchProfileForUser(user.id, user, true);
        }
    }, [user, fetchProfileForUser]);

    const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<boolean> => {
        if (!user) return false;
        setProfileLoading(true);
        setProfileError(null);
        try {
            const payload = {
                id: user.id,
                ...updates,
                updated_at: new Date().toISOString()
            };
            const { error } = await supabase.from('profiles').upsert(payload);
            if (error) throw error;
            setProfile(prev => prev ? { ...prev, ...updates } : (payload as UserProfile));
            return true;
        } catch (err: any) {
            console.error('[AUTH_PROFILE] Error actualizando perfil:', err);
            setProfileError('No se pudo guardar el perfil.');
            return false;
        } finally {
            setProfileLoading(false);
        }
    }, [user]);

    const uploadAvatar = useCallback(async (file: File): Promise<string | null> => {
        if (!user) return null;
        setProfileLoading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
            await updateProfile({ avatar_url: publicUrl });
            return publicUrl;
        } catch (err: any) {
            console.error('[AUTH_AVATAR] Error al subir avatar:', err);
            setProfileError('Error al subir la imagen.');
            return null;
        } finally {
            setProfileLoading(false);
        }
    }, [user, updateProfile]);

    useEffect(() => {
        // 1. Obtener sesión inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setAuthLoading(false);

            if (session?.user) {
                fetchProfileForUser(session.user.id, session.user);
                checkAndExecutePostAuthRedirect();
            } else {
                lastFetchedUserIdRef.current = null;
                setProfile(null);
                setProfileLoading(false);
            }
        }).catch((err) => {
            console.error('[AUTH] Error obteniendo sesión inicial:', err);
            setAuthLoading(false);
            setProfileLoading(false);
        });

        // 2. Escuchar cambios de estado de autenticación en tiempo real
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
            setSession(newSession);
            setUser(newSession?.user ?? null);
            setAuthLoading(false);

            if (newSession?.user) {
                fetchProfileForUser(newSession.user.id, newSession.user);
            } else {
                lastFetchedUserIdRef.current = null;
                setProfile(null);
                setProfileLoading(false);
            }

            if (event === 'SIGNED_IN' && newSession?.user) {
                checkAndExecutePostAuthRedirect();
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [checkAndExecutePostAuthRedirect, fetchProfileForUser]);

    const signInWithGoogle = useCallback(async (redirectPath?: string): Promise<{ error: any | null }> => {
        try {
            const targetPath = redirectPath || (window.location.pathname + window.location.search);
            if (targetPath && targetPath !== '/') {
                sessionStorage.setItem(AUTH_REDIRECT_STORAGE_KEY, targetPath);
            }

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });

            if (error) {
                return { error };
            }

            if (data?.url && typeof window !== 'undefined') {
                window.location.assign(data.url);
            }

            return { error: null };
        } catch (err: any) {
            console.error('[AUTH_GOOGLE] Error al iniciar sesión con Google:', err);
            return { error: err };
        }
    }, []);

    const signInWithPassword = useCallback(async (email: string, password: string): Promise<{ error: any | null; user?: User | null }> => {
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
            if (data.user) {
                fetchProfileForUser(data.user.id, data.user);
            }
            return { error: null, user: data.user };
        } catch (err: any) {
            console.error('[AUTH_PASSWORD_SIGNIN] Error:', err);
            return { error: err };
        }
    }, [fetchProfileForUser]);

    const signUpWithPassword = useCallback(async (
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
                fetchProfileForUser(data.user.id, data.user);
            }
            return { error: null, user: data.user };
        } catch (err: any) {
            console.error('[AUTH_PASSWORD_SIGNUP] Error:', err);
            return { error: err };
        }
    }, [fetchProfileForUser]);

    const resetPassword = useCallback(async (email: string): Promise<{ error: any | null }> => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: `${window.location.origin}/`
            });
            return { error };
        } catch (err: any) {
            console.error('[AUTH_RESET_PASSWORD] Error:', err);
            return { error: err };
        }
    }, []);

    // Método legacy para compatibilidad directa
    const handleLogin = useCallback(async (redirectPath?: string) => {
        await signInWithGoogle(redirectPath);
    }, [signInWithGoogle]);

    const handleLogout = useCallback(async () => {
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error('[AUTH_SIGNOUT] Error al cerrar sesión:', err);
        } finally {
            setUser(null);
            setSession(null);
            setProfile(null);
            setProfileLoading(false);
        }
    }, []);

    const contextValue = useMemo(() => ({
        user,
        session,
        authLoading,
        profile,
        profileLoading,
        profileError,
        isOwner,
        canAccessAdmin,
        refreshProfile,
        updateProfile,
        uploadAvatar,
        signInWithGoogle,
        signInWithPassword,
        signUpWithPassword,
        resetPassword,
        handleLogin,
        handleLogout
    }), [
        user,
        session,
        authLoading,
        profile,
        profileLoading,
        profileError,
        isOwner,
        canAccessAdmin,
        refreshProfile,
        updateProfile,
        uploadAvatar,
        signInWithGoogle,
        signInWithPassword,
        signUpWithPassword,
        resetPassword,
        handleLogin,
        handleLogout
    ]);

    return (
        <AuthContext.Provider value={contextValue}>
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
