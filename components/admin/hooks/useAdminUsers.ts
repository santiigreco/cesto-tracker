
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
            const { error: apiError } = await supabase.from('profiles').update({ role: newRole }).eq('id', id);
            if (apiError) throw apiError;
            setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
            return true;
        } catch (err: any) {
            alert("Error al actualizar identidad: " + err.message);
            return false;
        }
    };

    // Actualiza el rol de permisos (Sistema)
    const updateUserPermission = async (id: string, newPermission: PermissionRole) => {
        try {
            const { error: apiError } = await supabase.from('profiles').update({ permission_role: newPermission }).eq('id', id);
            if (apiError) throw apiError;
            setUsers(prev => prev.map(u => u.id === id ? { ...u, permission_role: newPermission } : u));
            return true;
        } catch (err: any) {
            alert("Error al actualizar permisos: " + err.message);
            return false;
        }
    };

    const updateUserClub = async (id: string, newClub: string) => {
        try {
            const { error: apiError } = await supabase.from('profiles').update({ favorite_club: newClub }).eq('id', id);
            if (apiError) throw apiError;
            setUsers(prev => prev.map(u => u.id === id ? { ...u, favorite_club: newClub } : u));
            return true;
        } catch (err: any) {
            alert("Error al actualizar club: " + err.message);
            return false;
        }
    };

    const deleteUser = async (id: string) => {
        if (!confirm("⚠️ ¿Eliminar usuario permanentemente? Esta acción es irreversible.")) return;
        try {
            const { error: apiError } = await supabase.from('profiles').delete().eq('id', id);
            if (apiError) throw apiError;
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (err: any) {
            alert("Error al eliminar usuario: " + err.message);
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
