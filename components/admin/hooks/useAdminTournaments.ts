
import { useState, useCallback } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { AdminTournament } from '../types';

export const useAdminTournaments = () => {
    const [tournaments, setTournaments] = useState<AdminTournament[]>([]);
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
            setTournaments(data as AdminTournament[] || []);
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
                .insert([{ name: name.trim() }])
                .select()
                .single();

            if (apiError) throw apiError;
            setTournaments(prev => [data as AdminTournament, ...prev]);
            return true;
        } catch (err: any) {
            alert("Error al crear torneo: " + err.message);
            return false;
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
        deleteTournament
    };
};
