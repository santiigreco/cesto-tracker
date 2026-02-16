
import { useState, useCallback, useMemo } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { AdminProfile } from '../types';
import { UserRole } from '../../../types';

export const useAdminUsers = (isOwner: boolean) => {
    const [users, setUsers] = useState<AdminProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        if (!isOwner) return;
        setLoading(true);
        setError(null);
        try {
            // Nota: .range(0, 4999) es un override manual de paginación para traer "todos"
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

    const updateUserRole = async (id: string, newRole: UserRole) => {
        try {
            const { error: apiError } = await supabase.from('profiles').update({ role: newRole }).eq('id', id);
            if (apiError) throw apiError;
            setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
            return true;
        } catch (err: any) {
            alert("Error al actualizar rol: " + err.message);
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
        updateUserRole,
        updateUserClub,
        deleteUser
    };
};
