
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export interface LatestGame {
    id: string;
    myTeam: string;
    opponentName: string;
    gameMode: string;
    createdAt: string;
}

export interface TopTeam {
    teamName: string;
    gameCount: number;
}

export interface CommunityStats {
    totalGames: number | null;
    latestGame: LatestGame | null;
    topTeams: TopTeam[];
    loading: boolean;
}

export const useCommunityStats = (): CommunityStats => {
    const [totalGames, setTotalGames] = useState<number | null>(null);
    const [latestGame, setLatestGame] = useState<LatestGame | null>(null);
    const [topTeams, setTopTeams] = useState<TopTeam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            try {
                // 1. Total games count
                const { count } = await supabase
                    .from('games')
                    .select('id', { count: 'exact', head: true });

                // 2. Most recent public game
                const { data: latestData } = await supabase
                    .from('games')
                    .select('id, my_team_name, opponent_name, game_mode, created_at')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                // 3. Top teams this week (last 7 days)
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                const { data: weekGames } = await supabase
                    .from('games')
                    .select('my_team_name')
                    .gte('created_at', weekAgo.toISOString())
                    .not('my_team_name', 'is', null)
                    .neq('my_team_name', '');

                if (!cancelled) {
                    if (count !== null) setTotalGames(count);

                    if (latestData) {
                        setLatestGame({
                            id: latestData.id,
                            myTeam: latestData.my_team_name || 'Equipo',
                            opponentName: latestData.opponent_name || 'Rival',
                            gameMode: latestData.game_mode,
                            createdAt: latestData.created_at,
                        });
                    }

                    // Tally team counts client-side
                    if (weekGames && weekGames.length > 0) {
                        const counts: Record<string, number> = {};
                        weekGames.forEach(g => {
                            const name = g.my_team_name as string;
                            counts[name] = (counts[name] || 0) + 1;
                        });
                        const sorted = Object.entries(counts)
                            .map(([teamName, gameCount]) => ({ teamName, gameCount }))
                            .sort((a, b) => b.gameCount - a.gameCount)
                            .slice(0, 3);
                        setTopTeams(sorted);
                    }

                    setLoading(false);
                }
            } catch (err) {
                if (!cancelled) setLoading(false);
            }
        };

        run();
        return () => { cancelled = true; };
    }, []);

    return { totalGames, latestGame, topTeams, loading };
};
