
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { XIcon } from './icons';
import { CalendarIcon } from './icons';
import { PencilIcon } from './icons';
import { CheckIcon } from './icons';
import { PlusIcon } from './icons';
import { TrashIcon } from './icons';
import { ChevronDownIcon } from './icons';
import TeamLogo from './TeamLogo';
import Loader from './Loader';
import { useParams, useNavigate } from 'react-router-dom';
import { useFixture, Match } from '../hooks/useFixture';
import { TEAMS_CONFIG } from '../constants';
import GraphicalBracket from './GraphicalBracket';

interface FixtureViewProps {
    isOpen: boolean;
    onClose: () => void;
    isAdmin: boolean;
}

// ── Hook: current time updated every 30s ──
const useNow = () => {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 30_000);
        return () => clearInterval(id);
    }, []);
    return now;
};

// ── Compute effective match status based on system clock ──
// Cestoball match duration ≈ 60 minutes
const MATCH_DURATION_MS = 60 * 60 * 1000;

const computeEffectiveStatus = (
    match: Match,
    now: Date
): 'scheduled' | 'live' | 'finished' => {
    // If a score is already recorded, always show as finished
    const hasScore = match.scoreHome !== '' && match.scoreAway !== '';
    if (hasScore) return 'finished';

    // If DB explicitly marks it finished, respect that
    if (match.status === 'finished') return 'finished';

    // Try to parse the scheduled start time
    // match.time is HH:MM, match.date is YYYY-MM-DD
    const startStr = `${match.date}T${match.time.length === 5 ? match.time : '00:00'}:00`;
    const startTime = new Date(startStr);
    if (isNaN(startTime.getTime())) return match.status || 'scheduled';

    const endTime = new Date(startTime.getTime() + MATCH_DURATION_MS);

    if (now >= startTime && now < endTime) return 'live';
    if (now >= endTime) return 'finished';
    return 'scheduled';
};

// --- Status Badge ---
const StatusBadge: React.FC<{ match: Match; now: Date }> = ({ match, now }) => {
    const effectiveStatus = computeEffectiveStatus(match, now);
    const hasScore = match.scoreHome !== '' && match.scoreAway !== '';

    if (effectiveStatus === 'live') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block"></span>En Vivo
            </span>
        );
    }
    if (effectiveStatus === 'finished') {
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-700 text-slate-400">
                Finalizado
            </span>
        );
    }
    // scheduled
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-cyan-300 bg-cyan-900/20 border border-cyan-800/40">
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {match.time}
        </span>
    );
};

// --- Score Display ---
const ScoreDisplay: React.FC<{ match: Match }> = ({ match }) => {
    const hasScore = match.scoreHome !== '' && match.scoreAway !== '';
    const homeWon = hasScore && Number(match.scoreHome) > Number(match.scoreAway);
    const awayWon = hasScore && Number(match.scoreAway) > Number(match.scoreHome);

    if (!hasScore) {
        return <span className="text-slate-500 font-bold text-sm tracking-widest">- : -</span>;
    }

    return (
        <div className="flex items-center justify-center gap-1">
            <span className={`text-lg font-black tabular-nums ${homeWon ? 'text-white' : 'text-slate-500'}`}>
                {match.scoreHome}
            </span>
            <span className="text-slate-600 text-sm font-bold">:</span>
            <span className={`text-lg font-black tabular-nums ${awayWon ? 'text-white' : 'text-slate-500'}`}>
                {match.scoreAway}
            </span>
        </div>
    );
};

// --- Match Row ---
const MatchRow: React.FC<{
    match: Match;
    isEven: boolean;
    isEditMode: boolean;
    now: Date;
    onUpdate: (id: string, field: keyof Match, value: unknown) => void;
    onDelete: (id: string) => void;
    onClick: (match: Match) => void;
    onStartStats?: (match: Match) => void;
    linkedGameId?: string;
    isAdmin?: boolean;
}> = ({ match, isEven, isEditMode, now, onUpdate, onDelete, onClick, onStartStats, linkedGameId, isAdmin }) => {
    const hasScore = match.scoreHome !== '' && match.scoreAway !== '';
    const homeWon = hasScore && Number(match.scoreHome) > Number(match.scoreAway);
    const awayWon = hasScore && Number(match.scoreAway) > Number(match.scoreHome);

    if (match.isRest) {
        return (
            <div className={`flex items-center justify-center gap-3 py-3 px-4 ${isEven ? 'bg-slate-900' : 'bg-slate-900/60'} border-b border-slate-800`}>
                <TeamLogo teamName={match.homeTeam} className="h-6 w-6 opacity-60 grayscale" />
                <span className="text-slate-500 text-sm font-semibold">{match.homeTeam}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 border border-slate-700 px-2 py-0.5 rounded">
                    Fecha Libre
                </span>
            </div>
        );
    }

    return (
        <div
            className={`group relative flex items-center gap-2 sm:gap-3 px-3 py-2 border-b border-slate-800 cursor-pointer transition-colors duration-150
                ${isEven ? 'bg-slate-900' : 'bg-slate-800/40'}
                ${!isEditMode ? 'hover:bg-slate-700/50' : ''}`}
            onClick={() => !isEditMode && onClick(match)}
        >
            {/* Status */}
            <div className="w-16 sm:w-20 flex-shrink-0 flex justify-center">
                <StatusBadge match={match} now={now} />
            </div>

            {/* Home Team */}
            <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
                <span className={`text-xs sm:text-sm font-semibold truncate text-right leading-tight
                    ${homeWon ? 'text-white font-bold' : 'text-slate-400'}`}>
                    {match.homeTeam}
                </span>
                <TeamLogo teamName={match.homeTeam} className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0" />
            </div>

            {/* Score / Center */}
            <div className="w-20 sm:w-24 flex-shrink-0 flex flex-col items-center justify-center">
                {isEditMode ? (
                    <div className="flex items-center gap-1">
                        <input
                            type="number"
                            value={match.scoreHome ?? ''}
                            onClick={e => e.stopPropagation()}
                            onChange={(e) => onUpdate(match.id, 'scoreHome', e.target.value)}
                            className="w-8 h-8 bg-slate-800 text-center text-white font-bold border border-slate-600 rounded text-sm focus:border-cyan-500 outline-none"
                        />
                        <span className="text-slate-600 font-bold">:</span>
                        <input
                            type="number"
                            value={match.scoreAway ?? ''}
                            onClick={e => e.stopPropagation()}
                            onChange={(e) => onUpdate(match.id, 'scoreAway', e.target.value)}
                            className="w-8 h-8 bg-slate-800 text-center text-white font-bold border border-slate-600 rounded text-sm focus:border-cyan-500 outline-none"
                        />
                    </div>
                ) : (
                    <ScoreDisplay match={match} />
                )}
                {match.location && (
                    <span className="text-[9px] text-slate-600 truncate max-w-[80px] hidden sm:block mt-0.5">{match.location}</span>
                )}
            </div>

            {/* Away Team */}
            <div className="flex-1 flex items-center justify-start gap-2 min-w-0">
                <TeamLogo teamName={match.awayTeam} className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0" />
                <span className={`text-xs sm:text-sm font-semibold truncate text-left leading-tight
                    ${awayWon ? 'text-white font-bold' : 'text-slate-400'}`}>
                    {match.awayTeam}
                </span>
            </div>

            {/* Edit Controls */}
            {isEditMode && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(match.id); }}
                    className="flex-shrink-0 p-1.5 text-red-500 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                >
                    <TrashIcon className="h-4 w-4" />
                </button>
            )}

            {/* Hover arrow (read mode) */}
            {!isEditMode && match.matchUrl && (
                <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="h-4 w-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            )}

            {/* Linked game stats button */}
            {!isEditMode && linkedGameId && (
                <a
                    href={`/match/${linkedGameId}`}
                    onClick={e => e.stopPropagation()}
                    className="flex-shrink-0 flex items-center gap-1 bg-emerald-900/30 hover:bg-emerald-900/60 border border-emerald-500/30 hover:border-emerald-400/60 text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                    title="Ver estadísticas del partido"
                >
                    <span>📊</span>
                    <span className="hidden sm:inline">Stats</span>
                </a>
            )}

            {/* Quick Start Stats Button */}
            {!isEditMode && !linkedGameId && isAdmin && (
                <button
                    onClick={(e) => { e.stopPropagation(); onStartStats?.(match); }}
                    className="flex-shrink-0 flex items-center gap-1 bg-cyan-900/30 hover:bg-cyan-900/60 border border-cyan-500/30 hover:border-cyan-400/60 text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                    title="Iniciar planilla de estadísticas"
                >
                    <span>🗒️</span>
                    <span className="hidden sm:inline">Planilla</span>
                </button>
            )}

            {/* Tournament/Stage Info (Declarative) */}
            {!match.isRest && (
                <div className="absolute -bottom-0 right-1.5 flex gap-1.5 items-center opacity-60">
                    {match.category && (
                        <span className="text-[8px] font-black text-white bg-slate-700 px-1 rounded-sm uppercase">{match.category}</span>
                    )}
                    {match.tournament && match.tournament !== 'Todos' && (
                        <span className="text-[8px] font-bold text-slate-500 uppercase">{match.tournament}</span>
                    )}
                    {match.stageGroup && (
                        <span className="text-[8px] font-bold text-cyan-600 uppercase">/ {match.stageGroup}</span>
                    )}
                </div>
            )}
        </div>
    );
};

// --- Round Group Header ---
const RoundHeader: React.FC<{
    label: string;
    count: number;
    isCollapsed: boolean;
    onToggle: () => void;
    roundNumber: number | null;
}> = ({ label, count, isCollapsed, onToggle, roundNumber }) => (
    <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-800 hover:bg-slate-700/80 border-b border-slate-700 transition-colors group"
    >
        <div className="flex items-center gap-2">
            {roundNumber !== null && (
                <span className="w-6 h-6 rounded-full bg-cyan-600/20 border border-cyan-600/40 flex items-center justify-center text-[10px] font-black text-cyan-400">
                    {roundNumber}
                </span>
            )}
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{label}</span>
            <span className="text-[10px] text-slate-600 font-medium">{count} partido{count !== 1 ? 's' : ''}</span>
        </div>
        <ChevronDownIcon className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
    </button>
);

// --- Main Component ---
const FixtureView: React.FC<FixtureViewProps> = ({ isAdmin }) => {
    const { year, tournament: tournamentParam, category: categoryParam } = useParams();
    const navigate = useNavigate();
    const now = useNow();
    const { matches, tournaments, loading, updateMatch, addMatch, deleteMatch, activeSeason, changeSeason, activeRoundKey } = useFixture();
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [collapsedRounds, setCollapsedRounds] = useState<Set<string>>(new Set());
    const [linkedGamesMap, setLinkedGamesMap] = useState<Record<string, string>>({}); // fixture_id -> game_id

    // Fetch all games that have a fixture_id so we can show 'Ver Estadísticas'
    useEffect(() => {
        let cancelled = false;
        import('../utils/supabaseClient').then(({ supabase }) => {
            supabase
                .from('games')
                .select('id, fixture_id')
                .not('fixture_id', 'is', null)
                .then(({ data }) => {
                    if (!cancelled && data) {
                        const map: Record<string, string> = {};
                        data.forEach((g: { id: string; fixture_id: string }) => {
                            map[g.fixture_id] = g.id;
                        });
                        setLinkedGamesMap(map);
                    }
                });
        });
        return () => { cancelled = true; };
    }, []);

    // Local filter state (synced from URL)
    const [filterTournament, setFilterTournament] = useState<string>('Todos');
    const [filterCategory, setFilterCategory] = useState<string>('Primera A');
    const [filterGender, setFilterGender] = useState<string>('Femenino');

    // 1. Sync activeSeason with URL parameter :year
    useEffect(() => {
        if (year && year !== activeSeason) {
            changeSeason(year);
        }
    }, [year, activeSeason, changeSeason]);

    const availableTournaments = useMemo(() => {
        const unique = new Set(matches.map(m => m.tournament).filter(Boolean));
        return ['Todos', ...Array.from(unique).sort()];
    }, [matches]);

    const availableCategories = useMemo(() => {
        let filtered = matches;
        if (filterTournament !== 'Todos') filtered = filtered.filter(m => m.tournament === filterTournament);
        const unique = new Set(filtered.map(m => m.category).filter(Boolean));
        return ['Todas', ...Array.from(unique).sort()];
    }, [matches, filterTournament]);

    const availableGenders = useMemo(() => {
        const unique = new Set(matches.map(m => m.gender).filter(Boolean));
        return ['Todos', ...Array.from(unique).sort()];
    }, [matches]);

    // 2. Sync local filter state with URL parameters
    useEffect(() => {
        let t = tournamentParam ? decodeURIComponent(tournamentParam) : 'Todos';
        let c = categoryParam ? decodeURIComponent(categoryParam) : 'Primera';

        // Auto-select Pretemporada if no tournament param is provided
        if (!tournamentParam && availableTournaments.includes('Pretemporada')) {
            t = 'Pretemporada';
        }

        setFilterTournament(t);
        setFilterCategory(c);
        // Gender is kept as 'Femenino' by default or updated via UI
    }, [tournamentParam, categoryParam, availableTournaments]);

    const [viewMode, setViewMode] = useState<'list' | 'bracket'>('list');

    // 3. Navigation helpers
    const handleYearChange = (newYear: string) => {
        navigate(`/fixture/${newYear}`);
    };

    const handleTournamentChange = (t: string) => {
        if (t === 'Todos') {
            navigate(`/fixture/${activeSeason}`);
        } else {
            navigate(`/fixture/${activeSeason}/${encodeURIComponent(t)}`);
        }
    };

    const handleCategoryChange = (c: string) => {
        const t = filterTournament === 'Todos' ? 'Todos' : filterTournament;
        if (c === 'Todas') {
            navigate(`/fixture/${activeSeason}/${encodeURIComponent(t)}`);
        } else {
            navigate(`/fixture/${activeSeason}/${encodeURIComponent(t)}/${encodeURIComponent(c)}`);
        }
    };


    const [isAddingMatch, setIsAddingMatch] = useState(false);
    const [isCustomTournament, setIsCustomTournament] = useState(false);
    const [newMatchData, setNewMatchData] = useState({
        tournament: '',
        date: new Date().toISOString().split('T')[0],
        time: '20:30',
        homeTeam: '',
        awayTeam: '',
        category: 'Primera A',
        gender: 'Femenino',
        round: '',
        stageGroup: '',
        isRest: false
    });

    const availableYears = ['2026', '2025', '2024', '2023', '2022', '2021', '2019', '2018'];

    const availableTournamentsForCreation = useMemo(() => {
        return tournaments.filter(t => t.status === 'active');
    }, [tournaments]);

    const filteredMatches = useMemo(() => {
        return matches.filter(m => {
            if (filterTournament !== 'Todos' && m.tournament !== filterTournament) return false;
            // 'Todas' can be 'Todas' or 'Primera' (legacy fallback in Standings)
            if (filterCategory !== 'Todas' && filterCategory !== 'Primera' && m.category !== filterCategory) return false;
            // If user explicitly selected 'Todas', we don't filter by category
            if (filterCategory === 'Todas') { /* skip category filter */ }
            else if (m.category !== filterCategory) return false;

            if (filterGender !== 'Todos' && m.gender !== filterGender) return false;
            return true;
        });
    }, [matches, filterTournament, filterCategory, filterGender]);

    // ── Simplified grouping: round → matches ──
    const groupedByRound = useMemo(() => {
        const roundMap: Record<string, Match[]> = {};
        filteredMatches.forEach(m => {
            const rKey = m.round?.trim() || m.date;
            if (!roundMap[rKey]) roundMap[rKey] = [];
            roundMap[rKey].push(m);
        });

        // Sort rounds: ASCENDING chronological (oldest first) so that adding matches goes to the bottom
        // But the user wants "most recent first" but described "if a day is posterior go below".
        // Let's use DESCENDING (recent first) but ensure adding a future day keeps it consistent.
        // Actually, if a day is "posterior" (later), and we want it "below", the order must be ASCENDING.
        const sorted = Object.entries(roundMap).sort(([a], [b]) => {
            return a.localeCompare(b); // Ascending dates
        });

        return sorted;
    }, [filteredMatches]);

    // 4. Initial Collapse Logic (Expand first, collapse others)
    useEffect(() => {
        if (groupedByRound.length > 0) {
            const firstRound = groupedByRound[0][0];
            const allElse = groupedByRound.slice(1).map(([key]) => key);
            setCollapsedRounds(new Set(allElse));
        }
    }, [groupedByRound]);

    const formatRoundLabel = (key: string): { label: string; roundNum: number | null } => {
        if (!key) return { label: 'Fecha a confirmar', roundNum: null };
        if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
            const label = new Date(`${key}T00:00:00`)
                .toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
                .replace(/^\w/, c => c.toUpperCase());
            return { label, roundNum: null };
        }
        const numMatch = key.match(/(\d+)/);
        return { label: key, roundNum: numMatch ? parseInt(numMatch[1]) : null };
    };

    const toggleRound = (scopedKey: string) => {
        setCollapsedRounds(prev => {
            const next = new Set(prev);
            next.has(scopedKey) ? next.delete(scopedKey) : next.add(scopedKey);
            return next;
        });
    };

    const handleUpdateMatch = async (id: string, field: keyof Match, value: unknown) => {
        const match = matches.find(m => m.id === id);
        if (!match) return;

        const updates = { [field]: value };
        const updatedLocalMatch = { ...match, ...updates };

        // 1. Persist the change
        await updateMatch(id, updates as Partial<Match>);

        // 2. Automated Bracket Progression (Winner promotion)
        // Only trigger if score changes or status is set to finished
        if (field === 'scoreHome' || field === 'scoreAway' || field === 'status') {
            const sh = updatedLocalMatch.scoreHome;
            const sa = updatedLocalMatch.scoreAway;
            const hasScore = sh !== '' && sa !== '' && sh !== undefined && sa !== undefined;

            if (hasScore) {
                const winner = Number(sh) > Number(sa) ? updatedLocalMatch.homeTeam : Number(sa) > Number(sh) ? updatedLocalMatch.awayTeam : null;
                const loser = Number(sh) < Number(sa) ? updatedLocalMatch.homeTeam : Number(sa) < Number(sh) ? updatedLocalMatch.awayTeam : null;

                if (winner) {
                    // Match identifiers to look for in other matches' team placeholders
                    // We check both "round" and "stageGroup"
                    const identifiers = [
                        updatedLocalMatch.round?.trim(),
                        updatedLocalMatch.stageGroup?.trim()
                    ].filter(Boolean) as string[];

                    for (const iden of identifiers) {
                        const winPlaceholder = `Ganador ${iden}`;
                        const losePlaceholder = `Perdedor ${iden}`;

                        for (const m of matches) {
                            const mUpdates: Partial<Match> = {};
                            if (m.homeTeam === winPlaceholder) mUpdates.homeTeam = winner;
                            if (m.awayTeam === winPlaceholder) mUpdates.awayTeam = winner;
                            if (m.homeTeam === losePlaceholder && loser) mUpdates.homeTeam = loser;
                            if (m.awayTeam === losePlaceholder && loser) mUpdates.awayTeam = loser;

                            if (Object.keys(mUpdates).length > 0) {
                                await updateMatch(m.id, mUpdates);
                            }
                        }
                    }
                }
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de eliminar este partido?')) {
            await deleteMatch(id);
        }
    };

    const handleMatchClick = (match: Match) => {
        if (match.matchUrl) {
            window.open(match.matchUrl, '_blank');
        } else {
            setSelectedMatch(match);
        }
    };

    const handleStartStats = (match: Match) => {
        navigate('/setup', {
            state: {
                fixtureId: match.id,
                teamName: match.homeTeam,
                rivalName: match.awayTeam,
                tournamentName: match.tournament,
                category: match.category
            }
        });
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMatchData.tournament || !newMatchData.homeTeam || !newMatchData.awayTeam) {
            alert('Completa todos los campos obligatorios');
            return;
        }
        await addMatch({ ...newMatchData });
        setIsAddingMatch(false);
        setNewMatchData(prev => ({ ...prev, homeTeam: '', awayTeam: '' }));
    };

    return (
        <div className="w-full flex-grow flex flex-col bg-slate-900 border border-slate-700 rounded-xl overflow-hidden mt-8 shadow-2xl">

            {/* ── Sticky Header ── */}
            <div className="sticky top-0 z-20 bg-slate-900 border-b border-slate-700 shadow-xl">

                {/* Title Bar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-cyan-400" />
                            <h1 className="text-base font-black text-white tracking-widest uppercase">Fixture</h1>
                            <span className="text-[10px] font-bold text-slate-600 border border-slate-700 px-1.5 rounded">
                                {activeSeason}
                            </span>
                        </div>

                        {/* View Switcher - Public */}
                        <div className="bg-slate-800 p-0.5 rounded-lg border border-slate-700 flex">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all ${viewMode === 'list' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Lista
                            </button>
                            <button
                                onClick={() => setViewMode('bracket')}
                                className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all ${viewMode === 'bracket' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Llave
                            </button>
                        </div>
                    </div>
                    {isAdmin && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsAddingMatch(true)}
                                className="p-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white transition-colors"
                                title="Agregar partido"
                            >
                                <PlusIcon className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setIsEditMode(!isEditMode)}
                                className={`p-1.5 rounded-lg transition-colors ${isEditMode ? 'bg-green-600 text-white' : 'bg-slate-700 text-cyan-400 hover:bg-slate-600'}`}
                                title={isEditMode ? 'Guardar' : 'Editar resultados'}
                            >
                                {isEditMode ? <CheckIcon className="h-4 w-4" /> : <PencilIcon className="h-4 w-4" />}
                            </button>
                        </div>
                    )}
                </div>

                {/* Filter Bar */}
                <div className="flex gap-2 px-3 py-2 overflow-x-auto scrollbar-hide">
                    <select
                        value={activeSeason}
                        onChange={(e) => handleYearChange(e.target.value)}
                        className="bg-slate-800 text-white text-xs font-bold py-1.5 px-2 rounded-lg border border-slate-700 focus:border-cyan-500 outline-none flex-shrink-0"
                    >
                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>

                    <select
                        value={filterTournament}
                        onChange={(e) => handleTournamentChange(e.target.value)}
                        disabled={availableTournaments.length <= 1}
                        className="bg-slate-800 text-white text-xs font-bold py-1.5 px-2 rounded-lg border border-slate-700 focus:border-cyan-500 outline-none flex-shrink-0 max-w-[140px] truncate disabled:opacity-50"
                    >
                        {availableTournaments.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    <select
                        value={filterCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="bg-slate-800 text-white text-xs font-bold py-1.5 px-2 rounded-lg border border-slate-700 focus:border-cyan-500 outline-none flex-shrink-0 max-w-[120px] truncate"
                    >
                        {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <select
                        value={filterGender}
                        onChange={(e) => setFilterGender(e.target.value)}
                        className="bg-slate-800 text-white text-xs font-bold py-1.5 px-2 rounded-lg border border-slate-700 focus:border-cyan-500 outline-none flex-shrink-0"
                    >
                        {availableGenders.map(g => (
                            <option key={g} value={g}>{g === 'Todos' ? 'Ambos Sexos' : g}</option>
                        ))}
                    </select>
                </div>

                {isEditMode && (
                    <div className="px-3 py-1.5 bg-cyan-900/20 border-t border-cyan-800/30 text-cyan-400 text-[10px] font-bold uppercase tracking-wider text-center">
                        ✏️ Modo edición activo — cambios se guardan automáticamente
                    </div>
                )}
            </div>

            {/* ── Content ── */}
            <div className="flex-grow overflow-y-auto">
                {loading && matches.length === 0 ? (
                    <div className="flex justify-center py-20"><Loader /></div>
                ) : matches.length === 0 ? (
                    <div className="text-center text-slate-500 py-16">
                        <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>No hay partidos para {activeSeason}</p>
                    </div>
                ) : groupedByRound.length === 0 ? (
                    <div className="text-center text-slate-500 py-12">No hay partidos con estos filtros.</div>
                ) : (
                    <div>
                        {viewMode === 'bracket' ? (
                            <GraphicalBracket matches={filteredMatches} isAdmin={isAdmin} onUpdateMatch={handleUpdateMatch} />
                        ) : (
                            <div>
                                {groupedByRound.map(([roundKey, roundMatches]) => {
                                    const isRoundCollapsed = collapsedRounds.has(roundKey);
                                    const { label, roundNum } = formatRoundLabel(roundKey);

                                    return (
                                        <div key={roundKey} className="border-b border-slate-800">
                                            <RoundHeader
                                                label={label}
                                                count={roundMatches.length}
                                                isCollapsed={isRoundCollapsed}
                                                onToggle={() => toggleRound(roundKey)}
                                                roundNumber={roundNum}
                                            />

                                            {!isRoundCollapsed && (() => {
                                                // Sub-group by date within the round
                                                const byDate: Record<string, Match[]> = {};
                                                roundMatches.forEach(m => {
                                                    if (!byDate[m.date]) byDate[m.date] = [];
                                                    byDate[m.date].push(m);
                                                });
                                                const dates = Object.keys(byDate).sort().reverse();
                                                const showDateSub = dates.length > 1;

                                                return (
                                                    <div>
                                                        {dates.map(date => (
                                                            <div key={date}>
                                                                {showDateSub && (
                                                                    <div className="px-4 py-1 bg-slate-800/30 border-b border-slate-800">
                                                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                                                            {new Date(`${date}T00:00:00`).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/^\w/, c => c.toUpperCase())}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {byDate[date]
                                                                    .sort((a, b) => a.time.localeCompare(b.time))
                                                                    .map((match, idx) => (
                                                                        <MatchRow
                                                                            key={match.id}
                                                                            match={match}
                                                                            isEven={idx % 2 === 0}
                                                                            isEditMode={isEditMode}
                                                                            now={now}
                                                                            onUpdate={handleUpdateMatch}
                                                                            onDelete={handleDelete}
                                                                            onClick={handleMatchClick}
                                                                            onStartStats={handleStartStats}
                                                                            linkedGameId={linkedGamesMap[match.id]}
                                                                            isAdmin={isAdmin}
                                                                        />
                                                                    ))}
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    );
                                })}

                                {loading && matches.length > 0 && (
                                    <div className="flex justify-center py-4"><Loader /></div>
                                )}
                                <div className="h-16" />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Match Detail Modal ── */}
            {
                selectedMatch && (
                    <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-fade-in" onClick={() => setSelectedMatch(null)}>
                        <div
                            className="bg-slate-900 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-slate-700 shadow-2xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Handle */}
                            <div className="flex justify-center pt-3 pb-1 sm:hidden">
                                <div className="w-10 h-1 bg-slate-700 rounded-full"></div>
                            </div>

                            {/* Match Header */}
                            <div className="p-5 border-b border-slate-800">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <StatusBadge match={selectedMatch} now={now} />
                                        {selectedMatch.category && (
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">{selectedMatch.category}</span>
                                        )}
                                    </div>
                                    <button onClick={() => setSelectedMatch(null)} className="text-slate-500 hover:text-white p-1">
                                        <XIcon className="h-5 w-5" />
                                    </button>
                                </div>
                                {selectedMatch.round && (
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-3">{selectedMatch.round}</p>
                                )}

                                {/* Teams */}
                                <div className="flex items-center justify-between mt-4 gap-2">
                                    <div className="flex-1 flex flex-col items-center gap-2 text-center">
                                        <TeamLogo teamName={selectedMatch.homeTeam} className="h-14 w-14" />
                                        <span className="text-sm font-bold text-white leading-tight">{selectedMatch.homeTeam}</span>
                                    </div>

                                    <div className="flex flex-col items-center gap-1 px-4">
                                        <ScoreDisplay match={selectedMatch} />
                                        {selectedMatch.location && (
                                            <span className="text-[10px] text-slate-600 text-center">{selectedMatch.location}</span>
                                        )}
                                    </div>

                                    <div className="flex-1 flex flex-col items-center gap-2 text-center">
                                        <TeamLogo teamName={selectedMatch.awayTeam} className="h-14 w-14" />
                                        <span className="text-sm font-bold text-white leading-tight">{selectedMatch.awayTeam}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Meta Info */}
                            <div className="px-5 py-4 space-y-2">
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>📅 Fecha</span>
                                    <span className="text-slate-300 font-medium">
                                        {new Date(`${selectedMatch.date}T00:00:00`).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>🕐 Hora</span>
                                    <span className="text-slate-300 font-medium">{selectedMatch.time}hs</span>
                                </div>
                                {selectedMatch.tournament && (
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>🏆 Torneo</span>
                                        <span className="text-slate-300 font-medium">{selectedMatch.tournament}</span>
                                    </div>
                                )}
                                {selectedMatch.matchUrl && (
                                    <a
                                        href={selectedMatch.matchUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-lg text-sm border border-slate-700 transition-colors"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        📹 Ver partido
                                    </a>
                                )}

                                {isAdmin && !linkedGamesMap[selectedMatch.id] && (
                                    <button
                                        onClick={() => handleStartStats(selectedMatch)}
                                        className="mt-3 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-black py-3 rounded-xl text-sm transition-all shadow-lg shadow-cyan-900/20 uppercase tracking-widest"
                                    >
                                        <span>🗒️</span> Cargar Planilla
                                    </button>
                                )}

                                {linkedGamesMap[selectedMatch.id] && (
                                    <button
                                        onClick={() => navigate(`/match/${linkedGamesMap[selectedMatch.id]}`)}
                                        className="mt-3 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl text-sm transition-all shadow-lg shadow-emerald-900/20 uppercase tracking-widest"
                                    >
                                        <span>📊</span> Ver Estadísticas
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ── Add Match Modal ── */}
            {
                isAddingMatch && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
                        <div className="bg-slate-800 rounded-xl w-full max-w-md p-6 border border-slate-700 shadow-2xl">
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-lg font-bold text-white">Nuevo Partido</h2>
                                <button onClick={() => setIsAddingMatch(false)} className="text-slate-400 hover:text-white">
                                    <XIcon />
                                </button>
                            </div>
                            <form onSubmit={handleCreateSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Torneo</label>
                                    {!isCustomTournament ? (
                                        <select
                                            value={newMatchData.tournament}
                                            onChange={(e) => {
                                                if (e.target.value === 'custom') { setIsCustomTournament(true); setNewMatchData(p => ({ ...p, tournament: '' })); }
                                                else { setNewMatchData(p => ({ ...p, tournament: e.target.value })); }
                                            }}
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white outline-none focus:border-cyan-500"
                                        >
                                            <option value="">Seleccionar...</option>
                                            {availableTournamentsForCreation.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                            <option value="custom" className="text-cyan-400">+ Otro torneo</option>
                                        </select>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input type="text" value={newMatchData.tournament} onChange={e => setNewMatchData({ ...newMatchData, tournament: e.target.value })} placeholder="Nombre del torneo" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:border-cyan-500 outline-none" autoFocus />
                                            <button type="button" onClick={() => setIsCustomTournament(false)} className="px-3 bg-slate-700 rounded-lg text-slate-300 text-sm">✕</button>
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Fecha</label>
                                        <input type="date" value={newMatchData.date} onChange={e => setNewMatchData({ ...newMatchData, date: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:border-cyan-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Hora</label>
                                        <input type="time" value={newMatchData.time} onChange={e => setNewMatchData({ ...newMatchData, time: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:border-cyan-500 outline-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Local</label>
                                        <select value={newMatchData.homeTeam} onChange={e => setNewMatchData({ ...newMatchData, homeTeam: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:border-cyan-500 outline-none">
                                            <option value="">Elegir...</option>
                                            {TEAMS_CONFIG.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Visitante</label>
                                        <select value={newMatchData.awayTeam} onChange={e => setNewMatchData({ ...newMatchData, awayTeam: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:border-cyan-500 outline-none">
                                            <option value="">Elegir...</option>
                                            {TEAMS_CONFIG.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Categoría</label>
                                        <select value={newMatchData.category} onChange={e => setNewMatchData({ ...newMatchData, category: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:border-cyan-500 outline-none">
                                            <option value="Primera A">Primera A</option>
                                            <option value="Primera B">Primera B</option>
                                            <option value="Primera C">Primera C</option>
                                            <option value="Promo">Promo</option>
                                            <option value="Maxi">Maxi</option>
                                            <option value="Mini">Mini</option>
                                            <option value="Premini">Premini</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Rama</label>
                                        <select value={newMatchData.gender} onChange={e => setNewMatchData({ ...newMatchData, gender: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:border-cyan-500 outline-none">
                                            <option value="Femenino">Femenino</option>
                                            <option value="Masculino">Masculino</option>
                                            <option value="Mixte">Mixto</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Fecha #</label>
                                        <input type="text" value={newMatchData.round} onChange={e => setNewMatchData({ ...newMatchData, round: e.target.value })} placeholder="Ej: Fecha 1" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:border-cyan-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Grupo / Fase</label>
                                        <input type="text" value={newMatchData.stageGroup} onChange={e => setNewMatchData({ ...newMatchData, stageGroup: e.target.value })} placeholder="Ej: Zona A" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:border-cyan-500 outline-none" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isRest"
                                        checked={newMatchData.isRest}
                                        onChange={e => setNewMatchData({ ...newMatchData, isRest: e.target.checked })}
                                        className="w-4 h-4 rounded bg-slate-900 border-slate-600 text-cyan-500 focus:ring-cyan-500"
                                    />
                                    <label htmlFor="isRest" className="text-xs font-bold text-slate-300 uppercase cursor-pointer">Es descanso (Fecha Libre)</label>
                                </div>
                                <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg text-sm transition-colors mt-2">
                                    ✅ Crear Partido
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default FixtureView;
