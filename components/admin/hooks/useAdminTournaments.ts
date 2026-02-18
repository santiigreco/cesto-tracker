
import { useState, useCallback } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { AdminTournament } from '../types';

// Extend AdminTournament locally to include status if not yet in global types
interface ExtendedAdminTournament extends AdminTournament {
    status?: 'active' | 'finished';
}

export const useAdminTournaments = () => {
    const [tournaments, setTournaments] = useState<ExtendedAdminTournament[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTournaments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: apiError } = await supabase
                .from('tournaments')
                .select('*')
                .order('created_at', { ascending: false });

            if (apiError) throw apiError;
            
            // Map ensure default status
            const mapped = (data || []).map((t: any) => ({
                ...t,
                status: t.status || 'active'
            }));
            
            setTournaments(mapped);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const createTournament = async (name: string) => {
        if (!name.trim()) return;
        try {
            const { data, error: apiError } = await supabase
                .from('tournaments')
                .insert([{ name: name.trim(), status: 'active' }])
                .select()
                .single();

            if (apiError) throw apiError;
            setTournaments(prev => [data as ExtendedAdminTournament, ...prev]);
            return true;
        } catch (err: any) {
            alert("Error al crear torneo: " + err.message);
            return false;
        }
    };

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'finished' : 'active';
        try {
            const { error: apiError } = await supabase
                .from('tournaments')
                .update({ status: newStatus })
                .eq('id', id);

            if (apiError) throw apiError;

            setTournaments(prev => prev.map(t => 
                t.id === id ? { ...t, status: newStatus } : t
            ));
        } catch (err: any) {
            alert("Error al cambiar estado: " + err.message);
        }
    };

    const deleteTournament = async (id: string) => {
        if (!confirm("¿Eliminar este torneo?")) return;
        try {
            const { error: apiError } = await supabase.from('tournaments').delete().eq('id', id);
            if (apiError) throw apiError;
            setTournaments(prev => prev.filter(t => t.id !== id));
        } catch (err: any) {
            alert("Error al eliminar torneo: " + err.message);
        }
    };

    return {
        tournaments,
        loading,
        error,
        fetchTournaments,
        createTournament,
        toggleStatus,
        deleteTournament
    };
};
