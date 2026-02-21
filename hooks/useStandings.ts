
import { useMemo } from 'react';
import { Match } from './useFixture';

export interface StandingsEntry {
    team: string;
    played: number;
    won: number;
    lost: number;
    pointsFor: number;
    pointsAgainst: number;
    diff: number;
    points: number;
    streak: ('W' | 'L')[];
}

export interface StandingsSubGroup {
    subLabel: string | null;
    entries: StandingsEntry[];
}

// A single matchup in the knockout bracket
export interface BracketMatch {
    id: string;
    homeTeam: string;
    awayTeam: string;
    scoreHome: number | '';
    scoreAway: number | '';
    date: string;
    time: string;
}

export interface BracketRound {
    roundLabel: string;    // e.g. "Cuartos de Final", "Semifinal", "Final"
    matches: BracketMatch[];
}

export interface StandingsGroup {
    tournament: string;
    subGroups: StandingsSubGroup[];          // round-robin tables
    bracketRounds: BracketRound[];           // knockout bracket
}

// Stage ordering for knockout rounds (lower index = earlier round)
const KNOCKOUT_ORDER: Record<string, number> = {
    'octavo': 0,
    'cuarto': 1,
    'semi': 2,
    'final': 3,
};

const getKnockoutOrder = (label: string): number => {
    const lower = label.toLowerCase();
    // "final" matches both "semifinal" and "final", so check semi first
    if (lower.includes('semi')) return KNOCKOUT_ORDER['semi'];
    if (lower.includes('octavo')) return KNOCKOUT_ORDER['octavo'];
    if (lower.includes('cuarto')) return KNOCKOUT_ORDER['cuarto'];
    if (lower.includes('final')) return KNOCKOUT_ORDER['final'];
    if (lower.includes('playoff')) return 1;
    if (lower.includes('eliminat')) return 1;
    return 99;
};

export const isKnockoutStage = (label: string): boolean => {
    const lower = label.toLowerCase();
    return (
        lower.includes('cuarto') ||
        lower.includes('semi') ||
        lower.includes('final') ||
        lower.includes('playoff') ||
        lower.includes('eliminat') ||
        lower.includes('octavo')
    );
};

const isMatchFinished = (m: Match): boolean => {
    if (m.isRest) return false;
    return (
        m.scoreHome !== '' && m.scoreAway !== '' &&
        m.scoreHome !== undefined && m.scoreAway !== undefined
    );
};

function computeEntries(groupMatches: Match[]): StandingsEntry[] {
    const teamMap: Record<string, StandingsEntry> = {};

    const get = (team: string): StandingsEntry => {
        if (!teamMap[team]) {
            teamMap[team] = {
                team, played: 0, won: 0, lost: 0,
                pointsFor: 0, pointsAgainst: 0, diff: 0, points: 0, streak: [],
            };
        }
        return teamMap[team];
    };

    const sorted = [...groupMatches].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return (a.time || '').localeCompare(b.time || '');
    });

    sorted.forEach(m => {
        if (!isMatchFinished(m)) return;
        const home = get(m.homeTeam);
        const away = get(m.awayTeam);
        const sh = Number(m.scoreHome);
        const sa = Number(m.scoreAway);

        home.played++; away.played++;
        home.pointsFor += sh; home.pointsAgainst += sa;
        away.pointsFor += sa; away.pointsAgainst += sh;

        if (sh > sa) {
            home.won++; away.lost++;
            home.points += 2; away.points += 1;
            home.streak = [...home.streak.slice(-4), 'W'];
            away.streak = [...away.streak.slice(-4), 'L'];
        } else if (sa > sh) {
            away.won++; home.lost++;
            away.points += 2; home.points += 1;
            away.streak = [...away.streak.slice(-4), 'W'];
            home.streak = [...home.streak.slice(-4), 'L'];
        }
    });

    return Object.values(teamMap)
        .map(e => ({ ...e, diff: e.pointsFor - e.pointsAgainst }))
        .sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.diff !== a.diff) return b.diff - a.diff;
            return b.pointsFor - a.pointsFor;
        });
}

export const useStandings = (
    matches: Match[],
    filterTournament = 'Todos',
    filterCategory = 'Todas',
): StandingsGroup[] =>
    useMemo(() => {
        // Filter by UI selectors
        const filtered = matches.filter(m => {
            if (filterTournament !== 'Todos' && m.tournament !== filterTournament) return false;
            if (filterCategory !== 'Todas' && m.category !== filterCategory) return false;
            return true;
        });

        if (filtered.length === 0) return [];

        // PRIMARY split: ALWAYS by tournament
        const tournamentMap: Record<string, Match[]> = {};
        filtered.forEach(m => {
            const key = m.tournament || 'Sin torneo';
            if (!tournamentMap[key]) tournamentMap[key] = [];
            tournamentMap[key].push(m);
        });

        return Object.entries(tournamentMap).map(([tournament, tMatches]) => {

            // Separate round-robin matches from knockout matches
            const rrMatches = tMatches.filter(m => !m.stageGroup?.trim() || !isKnockoutStage(m.stageGroup));
            const koMatches = tMatches.filter(m => m.stageGroup?.trim() && isKnockoutStage(m.stageGroup));

            // ── Round-robin standings (sub-grouped by stage_group if 2+ groups) ──
            const stageKeys = new Set(
                rrMatches
                    .map(m => m.stageGroup?.trim())
                    .filter((sg): sg is string => !!sg)
            );
            const useSubGroups = stageKeys.size > 1;

            let subGroups: StandingsSubGroup[];
            if (useSubGroups) {
                const subMap: Record<string, Match[]> = {};
                rrMatches.forEach(m => {
                    const sg = m.stageGroup?.trim() || '__';
                    if (!subMap[sg]) subMap[sg] = [];
                    subMap[sg].push(m);
                });
                subGroups = Object.entries(subMap).map(([subLabel, subMatches]) => ({
                    subLabel: subLabel === '__' ? null : subLabel,
                    entries: computeEntries(subMatches),
                }));
            } else {
                const entries = computeEntries(rrMatches);
                subGroups = entries.length > 0 ? [{ subLabel: null, entries }] : [];
            }

            // ── Knockout bracket (group by stage_group and sort by phase order) ──
            const koStageMap: Record<string, Match[]> = {};
            koMatches.forEach(m => {
                const sg = m.stageGroup!.trim();
                if (!koStageMap[sg]) koStageMap[sg] = [];
                koStageMap[sg].push(m);
            });

            const bracketRounds: BracketRound[] = Object.entries(koStageMap)
                .sort(([a], [b]) => getKnockoutOrder(a) - getKnockoutOrder(b))
                .map(([roundLabel, roundMatches]) => ({
                    roundLabel,
                    matches: roundMatches
                        .sort((a, b) => a.date.localeCompare(b.date))
                        .map(m => ({
                            id: m.id,
                            homeTeam: m.homeTeam,
                            awayTeam: m.awayTeam,
                            scoreHome: m.scoreHome ?? '',
                            scoreAway: m.scoreAway ?? '',
                            date: m.date,
                            time: m.time,
                        })),
                }));

            return { tournament, subGroups, bracketRounds };
        });
    }, [matches, filterTournament, filterCategory]);
