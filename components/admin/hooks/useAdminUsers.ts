
import { useState, useCallback } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { AdminProfile } from '../types';
import { IdentityRole, PermissionRole } from '../../../types';

export const useAdminUsers = (isOwner: boolean) => {
    const [users, setUsers] = useState<AdminProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        if (!isOwner) return;
        setLoading(true);
        setError(null);
        try {
            // Usamos la RPC get_admin_users() que hace JOIN entre auth.users y profiles.
            // Esto garantiza ver TODOS los usuarios registrados, incluso los que
            // no tienen fila en la tabla profiles todavía.
            const { data, error: rpcError } = await supabase.rpc('get_admin_users');

            if (rpcError) throw rpcError;

            if (data) {
                setUsers(data as AdminProfile[]);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [isOwner]);

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
