import { useState, useCallback } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { AdminGame } from '../types';
import { fetchAdminUsersShared } from './useAdminUsers';

const ADMIN_GAMES_CACHE_TTL_MS = 20_000;
let cachedAdminGames: { games: AdminGame[]; timestamp: number } | null = null;

export const useAdminGames = () => {
    const [games, setGames] = useState<AdminGame[]>(() => cachedAdminGames?.games || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGames = useCallback(async (forceRefresh = false) => {
        const now = Date.now();
        if (!forceRefresh && cachedAdminGames && now - cachedAdminGames.timestamp < ADMIN_GAMES_CACHE_TTL_MS) {
            setGames(cachedAdminGames.games);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Execute lightweight games projection (excluding heavy settings.gameLog JSONB) in parallel with deduplicated users RPC
            const [gamesRes, usersData] = await Promise.all([
                supabase
                    .from('games')
                    .select('id, created_at, game_mode, user_id, views, my_team_name, opponent_name, gameName:settings->>gameName, myTeam:settings->>myTeam')
                    .order('created_at', { ascending: false })
                    .limit(100),
                fetchAdminUsersShared(forceRefresh).catch(() => [])
            ]);

            if (gamesRes.error) throw gamesRes.error;
            const gamesData = gamesRes.data;

            if (!gamesData || gamesData.length === 0) {
                cachedAdminGames = { games: [], timestamp: Date.now() };
                setGames([]);
                return;
            }

            const profilesMap: Record<string, { email: string | null; full_name: string | null }> = {};
            usersData.forEach(u => {
                profilesMap[u.id] = {
                    full_name: u.full_name || 'Anónimo',
                    email: u.email || null
                };
            });

            const enrichedGames: AdminGame[] = gamesData.map((game: any) => ({
                id: game.id,
                created_at: game.created_at,
                game_mode: game.game_mode,
                user_id: game.user_id,
                views: game.views,
                settings: {
                    gameName: game.gameName || game.opponent_name || '',
                    myTeam: game.myTeam || game.my_team_name || '',
                } as any,
                profiles: profilesMap[game.user_id] || null
            }));

            cachedAdminGames = { games: enrichedGames, timestamp: Date.now() };
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
            await supabase.from('tally_stats').delete().eq('game_id', id);
            const { error: apiError } = await supabase.from('games').delete().eq('id', id);
            if (apiError) throw apiError;
            setGames(prev => {
                const updated = prev.filter(g => g.id !== id);
                if (cachedAdminGames) cachedAdminGames = { games: updated, timestamp: Date.now() };
                return updated;
            });
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
