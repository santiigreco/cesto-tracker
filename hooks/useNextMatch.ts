
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export interface NextFixtureMatch {
    id: string;
    date: string;
    time: string;
    homeTeam: string;
    awayTeam: string;
    tournament: string;
    round?: string;
    scoreHome?: number | '';
    scoreAway?: number | '';
    status: string;
}

export interface LastSavedGame {
    id: string;
    gameName: string;
    myTeam: string;
    createdAt: string;
    gameMode: string;
}

export const useNextMatch = (userId?: string) => {
    const [nextMatch, setNextMatch] = useState<NextFixtureMatch | null>(null);
    const [lastGame, setLastGame] = useState<LastSavedGame | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const currentYear = new Date().getFullYear();
        const today = new Date().toISOString().split('T')[0];
        const endOfYear = `${currentYear}-12-31`;

        const run = async () => {
            // --- Fetch next upcoming fixture match ---
            const { data: fixtureData } = await supabase
                .from('fixture')
                .select('id, date, time, home_team, away_team, tournament, round, score_home, score_away, status')
                .gte('date', today)
                .lte('date', endOfYear)
                .order('date', { ascending: true })
                .order('time', { ascending: true })
                .limit(1)
                .single();

            if (!cancelled && fixtureData) {
                const m = fixtureData as Record<string, unknown>;
                setNextMatch({
                    id: String(m.id),
                    date: String(m.date ?? ''),
                    time: String(m.time ?? '00:00'),
                    homeTeam: String(m.home_team ?? ''),
                    awayTeam: String(m.away_team ?? ''),
                    tournament: String(m.tournament ?? ''),
                    round: m.round ? String(m.round) : undefined,
                    scoreHome: m.score_home === null || m.score_home === undefined ? '' : m.score_home as number,
                    scoreAway: m.score_away === null || m.score_away === undefined ? '' : m.score_away as number,
                    status: String(m.status ?? 'scheduled'),
                });
            }

            // --- Fetch user's last saved game (if logged in) ---
            if (userId) {
                const { data: gameData } = await supabase
                    .from('games')
                    .select('id, created_at, game_mode, settings')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (!cancelled && gameData) {
                    const g = gameData as Record<string, unknown>;
                    const settings = (g.settings as Record<string, string>) ?? {};
                    setLastGame({
                        id: String(g.id),
                        gameName: settings.gameName || 'Partido sin nombre',
                        myTeam: settings.myTeam || '',
                        createdAt: String(g.created_at ?? ''),
                        gameMode: String(g.game_mode ?? ''),
                    });
                }
            }

            if (!cancelled) setLoading(false);
        };

        run();
        return () => { cancelled = true; };
    }, [userId]);

    return { nextMatch, lastGame, loading };
};
