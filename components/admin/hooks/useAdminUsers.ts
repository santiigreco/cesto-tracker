
import { useState, useCallback } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { AdminProfile } from '../types';
import { IdentityRole, PermissionRole } from '../../../types';

export const useAdminUsers = (canAccess: boolean = true) => {
    const [users, setUsers] = useState<AdminProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        if (!canAccess) return;
        setLoading(true);
        setError(null);
        try {
            // Usamos la RPC get_admin_users() que hace JOIN entre auth.users y profiles.
            // Esto garantiza ver TODOS los usuarios registrados con su email.
            const { data, error: rpcError } = await supabase.rpc('get_admin_users');

            if (rpcError) {
                console.warn('RPC get_admin_users falló, ejecutando fallback directo sobre tabla profiles...', rpcError);
                const { data: profilesData, error: profilesError } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('updated_at', { ascending: false });

                if (profilesError) throw profilesError;
                if (profilesData) {
                    setUsers(profilesData.map(p => ({
                        ...p,
                        created_at: p.updated_at || new Date().toISOString()
                    })) as AdminProfile[]);
                }
            } else if (data) {
                setUsers(data as AdminProfile[]);
            }
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
            setUsers(prev => prev.map(u => u.id === id ? { ...u, role: data.role } : u));
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
            
            setUsers(prev => prev.map(u => u.id === id ? { ...u, permission_role: data.permission_role } : u));
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
            setUsers(prev => prev.map(u => u.id === id ? { ...u, favorite_club: data.favorite_club } : u));
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
                setUsers(prev => prev.filter(u => u.id !== id));
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

            setUsers(prev => prev.filter(u => u.id !== id));

        } catch (err: any) {
            console.error(err);
            alert("Error al eliminar usuario: " + err.message);
            fetchUsers();
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
