
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
            
            // 3. Fetch Profiles manually via RPC to get email + names correctly
            const profilesMap: Record<string, { email: string | null; full_name: string | null }> = {};

            if (userIds.length > 0) {
                // We use the same RPC as AdminUsersView to ensure we get email and full_name correctly
                const { data: usersData, error: rpcError } = await supabase.rpc('get_admin_users');
                
                if (!rpcError && usersData) {
                    usersData.forEach((u: any) => {
                        profilesMap[u.id] = { 
                            full_name: u.full_name || 'Anónimo',
                            email: u.email || null
                        };
                    });
                } else {
                    console.warn("Could not fetch user profiles via RPC for games list", rpcError);
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
