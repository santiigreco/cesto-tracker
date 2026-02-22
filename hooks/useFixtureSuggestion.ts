
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export interface FixtureSuggestion {
    id: string;
    date: string;
    time: string;
    homeTeam: string;
    awayTeam: string;
    round?: string;
    tournament: string;
}

/**
 * Finds fixture matches involving `myTeam` vs `rival` in the last 3 days
 * or next 7 days. Returns at most 1 match (the closest to today).
 */
export const useFixtureSuggestion = (myTeam?: string, rival?: string) => {
    const [suggestion, setSuggestion] = useState<FixtureSuggestion | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!myTeam || !rival) {
            setSuggestion(null);
            return;
        }

        let cancelled = false;
        setLoading(true);

        const run = async () => {
            try {
                const pastLimit = new Date();
                pastLimit.setDate(pastLimit.getDate() - 3);
                const futureLimit = new Date();
                futureLimit.setDate(futureLimit.getDate() + 7);

                const from = pastLimit.toISOString().split('T')[0];
                const to = futureLimit.toISOString().split('T')[0];

                // Normalize for comparison: lowercase, trimmed
                const norm = (s: string) => s.toLowerCase().trim();
                const myTeamN = norm(myTeam);
                const rivalN = norm(rival);

                const { data } = await supabase
                    .from('fixture')
                    .select('id, date, time, home_team, away_team, round, tournament')
                    .gte('date', from)
                    .lte('date', to)
                    .order('date', { ascending: true });

                if (!cancelled && data) {
                    // Find a match where one team includes myTeam and the other includes rival
                    const match = data.find((m: Record<string, unknown>) => {
                        const home = norm(String(m.home_team ?? ''));
                        const away = norm(String(m.away_team ?? ''));
                        return (
                            (home.includes(myTeamN) || myTeamN.includes(home)) &&
                            (away.includes(rivalN) || rivalN.includes(away))
                        ) || (
                                (away.includes(myTeamN) || myTeamN.includes(away)) &&
                                (home.includes(rivalN) || rivalN.includes(home))
                            );
                    });

                    setSuggestion(match ? {
                        id: String(match.id),
                        date: String(match.date ?? ''),
                        time: String(match.time ?? ''),
                        homeTeam: String(match.home_team ?? ''),
                        awayTeam: String(match.away_team ?? ''),
                        round: match.round ? String(match.round) : undefined,
                        tournament: String(match.tournament ?? ''),
                    } : null);
                }
            } catch {
                // silent fail — fixture link is optional
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        run();
        return () => { cancelled = true; };
    }, [myTeam, rival]);

    return { suggestion, loading };
};
