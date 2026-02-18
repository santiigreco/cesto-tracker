
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
            const { data, error: apiError } = await supabase
                .from('profiles')
                .select('*')
                .range(0, 4999);

            if (apiError) throw apiError;

            if (data) {
                const sorted = (data as AdminProfile[]).sort((a, b) => 
                    new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime()
                );
                setUsers(sorted);
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
            // Esto permite borrar al usuario de `auth.users` si has creado la función SQL `delete_user`
            // SQL necesario en Supabase: 
            // create function delete_user(user_id uuid) returns void as $$ begin delete from auth.users where id = user_id; end; $$ language plpgsql security definer;
            const { error: rpcError } = await supabase.rpc('delete_user', { user_id: id });

            if (!rpcError) {
                // Éxito vía RPC
                setUsers(prev => prev.filter(u => u.id !== id));
                return;
            }

            // Si RPC falla (o no existe), intentamos borrar solo el perfil
            console.warn("RPC delete_user falló o no existe, intentando borrado directo de tabla...", rpcError.message);

            // INTENTO 2: Borrar de la tabla profiles directamente
            const { data, error: apiError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', id)
                .select(); // .select() es CRUCIAL para saber si realmente se borró algo

            if (apiError) throw apiError;

            // Si data está vacío, significa que RLS bloqueó el borrado silenciosamente
            if (!data || data.length === 0) {
                throw new Error("No se pudo eliminar el registro. Es probable que falten permisos RLS en la base de datos o la función 'delete_user'.");
            }

            // Éxito vía Tabla Directa
            setUsers(prev => prev.filter(u => u.id !== id));

        } catch (err: any) {
            console.error(err);
            alert("Error al eliminar usuario: " + err.message);
            // Recargar lista para asegurar que la UI coincida con la BD
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
