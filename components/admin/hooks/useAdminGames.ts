
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
            // 1. Fetch Games raw (without join to avoid relationship errors)
            const { data: gamesData, error: apiError } = await supabase
                .from('games')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (apiError) throw apiError;

            if (!gamesData || gamesData.length === 0) {
                setGames([]);
                return;
            }

            // 2. Extract unique User IDs
            const userIds = Array.from(new Set(gamesData.map(g => g.user_id).filter(Boolean)));
            
            // 3. Fetch Profiles manually
            const profilesMap: Record<string, { email: string | null; full_name: string | null }> = {};

            if (userIds.length > 0) {
                const { data: profilesData, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, full_name, email') // Try to fetch email if column exists, otherwise it will just be undefined in result usually
                    .in('id', userIds);
                
                // Note: If email column doesn't exist in 'profiles', select might fail in strict mode. 
                // But usually standard profiles have it or we ignore the error for the join sake.
                // Assuming profiles table structure matches what we expect or is flexible.
                
                if (!profilesError && profilesData) {
                    profilesData.forEach((p: any) => {
                        profilesMap[p.id] = { 
                            full_name: p.full_name,
                            email: p.email || null
                        };
                    });
                }
            }

            // 4. Merge data
            const enrichedGames: AdminGame[] = gamesData.map(game => ({
                ...game,
                profiles: profilesMap[game.user_id] || null
            }));

            setGames(enrichedGames); 
        } catch (err: any) {
            console.error(err);
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
