
import { useState, useCallback } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { AdminGame } from '../types';

export const useAdminGames = () => {
    const [games, setGames] = useState<AdminGame[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGames = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: apiError } = await supabase
                .from('games')
                .select('*, profiles(email, full_name)')
                .order('created_at', { ascending: false })
                .limit(100);

            if (apiError) throw apiError;
            setGames(data as any[] || []); 
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteGame = async (id: string) => {
        if (!confirm("¿Eliminar este partido permanentemente?")) return;
        try {
            const { error: apiError } = await supabase.from('games').delete().eq('id', id);
            if (apiError) throw apiError;
            setGames(prev => prev.filter(g => g.id !== id));
        } catch (err: any) {
            alert("Error al eliminar partido: " + err.message);
        }
    };

    return {
        games,
        loading,
        error,
        fetchGames,
        deleteGame
    };
};
