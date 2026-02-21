
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export interface Match {
    id: string;
    tournament: string;
    date: string;
    time: string;
    homeTeam: string;
    awayTeam: string;
    scoreHome?: number | '';
    scoreAway?: number | '';
    status: 'scheduled' | 'live' | 'finished';
    season?: string;
    category?: string;
    gender?: string;
    round?: string;
    matchUrl?: string;
    location?: string;
    isRest?: boolean;
    stageGroup?: string;
}

export interface TournamentOption {
    id: string;
    name: string;
    status: 'active' | 'finished';
}

// Normalize Excel-style dates (DD/MM/YYYY) to ISO (YYYY-MM-DD)
const normalizeDate = (dateStr: string | null): string => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
    }
    return dateStr;
};

const mapRow = (m: Record<string, unknown>): Match => ({
    id: String(m.id),
    tournament: String(m.tournament ?? ''),
    date: normalizeDate(m.date as string | null),
    time: (m.time as string) || '00:00',
    homeTeam: (m.home_team as string) || '',
    awayTeam: (m.away_team as string) || '',
    scoreHome: m.score_home === null || m.score_home === undefined ? '' : (m.score_home as number),
    scoreAway: m.score_away === null || m.score_away === undefined ? '' : (m.score_away as number),
    status: (m.status as Match['status']) || 'scheduled',
    season: m.season ? String(m.season) : '',
    category: m.category as string | undefined,
    gender: m.gender as string | undefined,
    round: m.round as string | undefined,
    matchUrl: m.match_url as string | undefined,
    location: m.location as string | undefined,
    isRest: m.is_rest === true || m.is_rest === 'SI' || m.is_rest === 'true' || m.is_rest === 'TRUE',
    stageGroup: m.stage_group as string | undefined,
});

/**
 * Detect the "active round" key — the round (or date) closest to today.
 */
const detectActiveRoundKey = (matches: Match[]): string | null => {
    if (matches.length === 0) return null;
    const todayStr = new Date().toISOString().split('T')[0];
    let closest: Match = matches[0];
    let minDiff = Infinity;
    for (const m of matches) {
        if (!m.date) continue;
        const diff = Math.abs(new Date(m.date).getTime() - new Date(todayStr).getTime());
        if (diff < minDiff) { minDiff = diff; closest = m; }
    }
    return closest.round?.trim() || closest.date;
};

/**
 * Fetch ALL matches for the season in one shot (limit 500).
 * Since the UI collapses past rounds by default, all data must be in memory
 * so users can instantly open any stage_group without a second round trip.
 */
const SEASON_LIMIT = 500;

export const useFixture = () => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [tournaments, setTournaments] = useState<TournamentOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSeason, setActiveSeason] = useState<string>(String(new Date().getFullYear()));
    const [activeRoundKey, setActiveRoundKey] = useState<string | null>(null);

    const fetchSeason = async (season: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('fixture')
            .select('*')
            .gte('date', `${season}-01-01`)
            .lte('date', `${season}-12-31`)
            .order('date', { ascending: false })
            .order('time', { ascending: false })
            .limit(SEASON_LIMIT);

        if (error) {
            console.error('Fixture fetch error:', error);
            setLoading(false);
            return;
        }

        const mapped = (data ?? []).map(mapRow);
        setMatches(mapped);
        setActiveRoundKey(detectActiveRoundKey(mapped));
        setLoading(false);
    };

    const fetchTournaments = async () => {
        const { data, error } = await supabase
            .from('tournaments')
            .select('id, name, status')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setTournaments(data.map((t: Record<string, unknown>) => ({
                id: String(t.id),
                name: String(t.name),
                status: (t.status as TournamentOption['status']) || 'active',
            })));
        }
    };

    const addMatch = async (matchData: Omit<Match, 'id' | 'status' | 'scoreHome' | 'scoreAway'>) => {
        const season = String(new Date().getFullYear());
        const { error } = await supabase.from('fixture').insert([{
            tournament: matchData.tournament,
            date: matchData.date,
            time: matchData.time,
            home_team: matchData.homeTeam,
            away_team: matchData.awayTeam,
            status: 'scheduled',
            season,
            category: matchData.category,
            gender: matchData.gender,
            round: matchData.round,
            stage_group: matchData.stageGroup,
            is_rest: matchData.isRest,
        }]);

        if (error) {
            console.error('Error creating match:', error);
            alert('Error al crear partido: ' + error.message);
        } else if (activeSeason === season) {
            fetchSeason(activeSeason);
        }
    };

    const deleteMatch = async (id: string) => {
        const { error } = await supabase.from('fixture').delete().eq('id', id);
        if (error) {
            console.error('Error deleting match:', error);
            alert('Error al eliminar partido');
        } else {
            setMatches(prev => prev.filter(m => m.id !== id));
        }
    };

    const updateMatch = async (id: string, updates: Partial<Match>) => {
        // Optimistic UI update
        setMatches(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));

        const dbUpdates: Record<string, unknown> = {};
        if (updates.scoreHome !== undefined) dbUpdates.score_home = updates.scoreHome === '' ? null : updates.scoreHome;
        if (updates.scoreAway !== undefined) dbUpdates.score_away = updates.scoreAway === '' ? null : updates.scoreAway;
        if (updates.time !== undefined) dbUpdates.time = updates.time;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.matchUrl !== undefined) dbUpdates.match_url = updates.matchUrl;

        const { error } = await supabase.from('fixture').update(dbUpdates).eq('id', id);
        if (error) console.error('Error updating match:', error);
    };

    const changeSeason = (season: string) => {
        setActiveSeason(season);
        fetchSeason(season);
    };

    useEffect(() => {
        fetchSeason(activeSeason);
        fetchTournaments();

        const subscription = supabase
            .channel('public:fixture')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'fixture' }, () => {
                fetchSeason(activeSeason);
            })
            .subscribe();

        return () => { supabase.removeChannel(subscription); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        matches,
        tournaments,
        loading,
        addMatch,
        updateMatch,
        deleteMatch,
        refresh: () => fetchSeason(activeSeason),
        activeSeason,
        changeSeason,
        activeRoundKey,
    };
};
