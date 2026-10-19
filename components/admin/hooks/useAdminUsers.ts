import { useState, useCallback } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { AdminProfile } from '../types';
import { IdentityRole, PermissionRole } from '../../../types';

const ADMIN_USERS_CACHE_TTL_MS = 30_000;
let cachedAdminUsers: { users: AdminProfile[]; timestamp: number } | null = null;
let inFlightAdminUsersPromise: Promise<AdminProfile[]> | null = null;

export const fetchAdminUsersShared = async (forceRefresh = false): Promise<AdminProfile[]> => {
    const now = Date.now();
    if (!forceRefresh && cachedAdminUsers && now - cachedAdminUsers.timestamp < ADMIN_USERS_CACHE_TTL_MS) {
        return cachedAdminUsers.users;
    }

    if (!forceRefresh && inFlightAdminUsersPromise) {
        return inFlightAdminUsersPromise;
    }

    const promise = (async () => {
        const { data, error: rpcError } = await supabase.rpc('get_admin_users');

        if (rpcError) {
            console.warn('RPC get_admin_users falló, ejecutando fallback directo sobre tabla profiles...', rpcError);
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .order('updated_at', { ascending: false });

            if (profilesError) throw profilesError;
            const fallbackUsers = (profilesData || []).map(p => ({
                ...p,
                created_at: p.updated_at || new Date().toISOString()
            })) as AdminProfile[];

            cachedAdminUsers = { users: fallbackUsers, timestamp: Date.now() };
            return fallbackUsers;
        }

        const result = (data || []) as AdminProfile[];
        cachedAdminUsers = { users: result, timestamp: Date.now() };
        return result;
    })();

    inFlightAdminUsersPromise = promise;
    try {
        return await promise;
    } finally {
        inFlightAdminUsersPromise = null;
    }
};

export const useAdminUsers = (canAccess: boolean = true) => {
    const [users, setUsers] = useState<AdminProfile[]>(() => cachedAdminUsers?.users || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async (forceRefresh = false) => {
        if (!canAccess) return;
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAdminUsersShared(forceRefresh);
            setUsers(data);
        } catch (err: any) {
            console.error('Error al obtener usuarios en panel admin:', err);
            setError(err.message || 'Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    }, [canAccess]);

    // Actualiza el rol autopercibido (Identidad)
    const updateUserIdentity = async (id: string, newRole: IdentityRole) => {
        try {
            const { data, error: apiError } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', id)
                .select()
                .single();

            if (apiError) throw apiError;
            setUsers(prev => {
                const updated = prev.map(u => u.id === id ? { ...u, role: data.role } : u);
                if (cachedAdminUsers) cachedAdminUsers = { users: updated, timestamp: Date.now() };
                return updated;
            });
            return true;
        } catch (err: any) {
            console.error(err);
            alert("Error al actualizar identidad: " + err.message);
            return false;
        }
    };

    // Actualiza el rol de permisos (Sistema)
    const updateUserPermission = async (id: string, newPermission: PermissionRole) => {
        try {
            const { data, error: apiError } = await supabase
                .from('profiles')
                .update({ permission_role: newPermission })
                .eq('id', id)
                .select()
                .single();

            if (apiError) throw apiError;
            
            setUsers(prev => {
                const updated = prev.map(u => u.id === id ? { ...u, permission_role: data.permission_role } : u);
                if (cachedAdminUsers) cachedAdminUsers = { users: updated, timestamp: Date.now() };
                return updated;
            });
            return true;
        } catch (err: any) {
            console.error(err);
            alert("Error al actualizar permisos. Verifica que tengas una Política RLS en Supabase que permita al Owner editar otros perfiles.\n\nError: " + err.message);
            return false;
        }
    };

    const updateUserClub = async (id: string, newClub: string) => {
        try {
            const { data, error: apiError } = await supabase
                .from('profiles')
                .update({ favorite_club: newClub })
                .eq('id', id)
                .select()
                .single();

            if (apiError) throw apiError;
            setUsers(prev => {
                const updated = prev.map(u => u.id === id ? { ...u, favorite_club: data.favorite_club } : u);
                if (cachedAdminUsers) cachedAdminUsers = { users: updated, timestamp: Date.now() };
                return updated;
            });
            return true;
        } catch (err: any) {
            console.error(err);
            alert("Error al actualizar club: " + err.message);
            return false;
        }
    };

    const deleteUser = async (id: string) => {
        const target = users.find(u => u.id === id);
        if (target?.is_admin) {
            alert("No se puede eliminar a un usuario con privilegios de Owner principal.");
            return;
        }

        if (!confirm("⚠️ ¿Eliminar usuario permanentemente? Esta acción intentará borrar la cuenta y el perfil.")) return;
        
        try {
            // INTENTO 1: Usar función RPC (Recomendado)
            const { error: rpcError } = await supabase.rpc('delete_user', { user_id: id });

            if (!rpcError) {
                setUsers(prev => {
                    const updated = prev.filter(u => u.id !== id);
                    if (cachedAdminUsers) cachedAdminUsers = { users: updated, timestamp: Date.now() };
                    return updated;
                });
                return;
            }

            console.warn("RPC delete_user falló o no existe, intentando borrado directo de tabla...", rpcError.message);

            // INTENTO 2: Borrar de la tabla profiles directamente
            const { data, error: apiError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', id)
                .select();

            if (apiError) throw apiError;

            if (!data || data.length === 0) {
                throw new Error("No se pudo eliminar el registro. Es probable que falten permisos RLS en la base de datos o la función 'delete_user'.");
            }

            setUsers(prev => {
                const updated = prev.filter(u => u.id !== id);
                if (cachedAdminUsers) cachedAdminUsers = { users: updated, timestamp: Date.now() };
                return updated;
            });

        } catch (err: any) {
            console.error(err);
            alert("Error al eliminar usuario: " + err.message);
            fetchUsers(true);
        }
    };

    return {
        users,
        loading,
        error,
        fetchUsers,
        updateUserIdentity,
        updateUserPermission,
        updateUserClub,
        deleteUser
    };
};
