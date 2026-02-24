import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFixture } from '../hooks/useFixture';
import { useStandings, StandingsEntry, BracketRound } from '../hooks/useStandings';
import Loader from './Loader';
import TeamLogo from './TeamLogo';

// ── Icons ──────────────────────────────────────────────────────────────────
const TrophyIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C10.07 2 8.5 3.57 8.5 5.5c0 .34.05.67.12.99L6 7v1a6 6 0 0 0 5 5.91V15h-1a2 2 0 0 0-2 2v1H6v2h12v-2h-2v-1a2 2 0 0 0-2-2h-1v-1.09A6 6 0 0 0 18 8V7l-2.62-1.01c.07-.32.12-.65.12-.99C15.5 3.57 13.93 2 12 2" />
        <path d="M6 7H4c0 2.5 1.5 4.64 3.67 5.59L9 12c-1.65-.86-2.72-2.57-3-4.52V7z" />
        <path d="M18 7h2c0 2.5-1.5 4.64-3.67 5.59L15 12c1.65-.86 2.72-2.57 3-4.52V7z" />
    </svg>
);

const ChevronDown = ({ collapsed }: { collapsed: boolean }) => (
    <svg className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

// ── Streak Badge ────────────────────────────────────────────────────────────
const StreakBadge: React.FC<{ streak: ('W' | 'L')[] }> = ({ streak }) => (
    <div className="flex items-center gap-0.5">
        {streak.map((r, i) => (
            <span key={i}
                className={`w-4 h-4 rounded-sm text-[9px] font-black flex items-center justify-center
                    ${r === 'W' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}
            >{r}</span>
        ))}
    </div>
);

// ── Rank Medal ──────────────────────────────────────────────────────────────
const RankCell: React.FC<{ rank: number }> = ({ rank }) => {
    if (rank === 1) return <span className="text-yellow-400 font-black text-sm" title="1°">🥇</span>;
    if (rank === 2) return <span className="text-slate-300 font-black text-sm" title="2°">🥈</span>;
    if (rank === 3) return <span className="text-amber-600 font-black text-sm" title="3°">🥉</span>;
    return <span className="text-slate-500 font-bold text-xs tabular-nums">{rank}</span>;
};

// ── Single standings row ────────────────────────────────────────────────────
const StandingsRow: React.FC<{ entry: StandingsEntry; rank: number; isEven: boolean }> = ({
    entry, rank, isEven,
}) => {
    const isTopThree = rank <= 3;
    const diff = entry.diff > 0 ? `+${entry.diff}` : String(entry.diff);
    return (
        <div className={`grid grid-cols-[2rem_1fr_3rem_3rem_3rem_3rem_3rem_3rem_5rem] items-center px-3 py-2.5
            border-b border-slate-800/60 last:border-0 hover:bg-slate-700/20 transition-colors
            ${isTopThree ? 'border-l-2 border-l-yellow-500/30' : ''}
            ${isEven ? 'bg-slate-900' : 'bg-slate-800/30'}`}
        >
            <div className="flex justify-center"><RankCell rank={rank} /></div>
            <div className="flex items-center gap-2 min-w-0">
                <TeamLogo teamName={entry.team} className="h-6 w-6 flex-shrink-0" />
                <span className={`text-sm font-bold truncate ${isTopThree ? 'text-white' : 'text-slate-300'}`}>
                    {entry.team}
                </span>
            </div>
            <span className="text-center text-xs text-slate-400 tabular-nums">{entry.played}</span>
            <span className="text-center text-xs text-emerald-400 font-bold tabular-nums">{entry.won}</span>
            <span className="text-center text-xs text-red-400 tabular-nums">{entry.lost}</span>
            <span className="text-center text-xs text-slate-400 tabular-nums">{entry.pointsFor}</span>
            <span className="text-center text-xs text-slate-500 tabular-nums">{entry.pointsAgainst}</span>
            <span className={`text-center text-xs font-bold tabular-nums
                ${entry.diff > 0 ? 'text-emerald-400' : entry.diff < 0 ? 'text-red-400' : 'text-slate-500'}`}
            >{diff}</span>
            <div className="flex items-center justify-center gap-1">
                <span className={`text-sm font-black tabular-nums ${isTopThree ? 'text-cyan-300' : 'text-slate-300'}`}>
                    {entry.points}
                </span>
                {entry.streak.length > 0 && (
                    <div className="hidden sm:block"><StreakBadge streak={entry.streak} /></div>
                )}
            </div>
        </div>
    );
};

// ── Group Table (round-robin) ───────────────────────────────────────────────
const GroupTable: React.FC<{ label: string; entries: StandingsEntry[]; showGroupHeader: boolean }> = ({
    label, entries, showGroupHeader,
}) => {
    const [collapsed, setCollapsed] = useState(false);
    return (
        <div className="rounded-xl border border-slate-700 overflow-hidden">
            {showGroupHeader && (
                <button
                    onClick={() => setCollapsed(c => !c)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 hover:bg-slate-700/80 transition-colors border-b border-slate-700"
                >
                    <div className="flex items-center gap-2 text-slate-300">
                        <TrophyIcon />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">{label}</span>
                        <span className="text-[10px] text-slate-600">{entries.length} equipos</span>
                    </div>
                    <ChevronDown collapsed={collapsed} />
                </button>
            )}
            {!collapsed && (
                <>
                    <div className="grid grid-cols-[2rem_1fr_3rem_3rem_3rem_3rem_3rem_3rem_5rem] text-[10px] font-black text-slate-500 uppercase tracking-wider bg-slate-900 border-b border-slate-800 px-3 py-2">
                        <span className="text-center">#</span>
                        <span>Equipo</span>
                        <span className="text-center" title="Partidos Jugados">PJ</span>
                        <span className="text-center" title="Ganados">PG</span>
                        <span className="text-center" title="Perdidos">PP</span>
                        <span className="text-center" title="Puntos a Favor">PF</span>
                        <span className="text-center" title="Puntos en Contra">PC</span>
                        <span className="text-center" title="Diferencia">Dif</span>
                        <span className="text-center" title="Puntos de tabla">Pts</span>
                    </div>
                    {entries.map((entry, idx) => (
                        <StandingsRow key={entry.team} entry={entry} rank={idx + 1} isEven={idx % 2 === 0} />
                    ))}
                </>
            )}
        </div>
    );
};

// ── Knockout bracket ────────────────────────────────────────────────────────
const PHASE_EMOJI: Record<string, string> = {
    octavo: '🎯',
    cuarto: '⚡',
    semi: '🔥',
    final: '🏆',
    playoff: '⚡',
};

const getPhaseEmoji = (label: string): string => {
    const lower = label.toLowerCase();
    if (lower.includes('semi')) return PHASE_EMOJI['semi'];
    if (lower.includes('octavo')) return PHASE_EMOJI['octavo'];
    if (lower.includes('cuarto')) return PHASE_EMOJI['cuarto'];
    if (lower.includes('final')) return PHASE_EMOJI['final'];
    return PHASE_EMOJI['playoff'];
};

const BracketMatchCard: React.FC<{ match: BracketRound['matches'][0] }> = ({ match }) => {
    const hasScore = match.scoreHome !== '' && match.scoreAway !== '';
    const sh = Number(match.scoreHome);
    const sa = Number(match.scoreAway);
    const homeWon = hasScore && sh > sa;
    const awayWon = hasScore && sa > sh;
    const pending = !hasScore;

    const dateStr = match.date
        ? new Date(`${match.date}T00:00:00`)
            .toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
            .replace('.', '')
        : '';

    return (
        <div className="rounded-lg border border-slate-700 overflow-hidden bg-slate-800/50 min-w-[200px]">
            {/* Home team */}
            <div className={`flex items-center justify-between px-3 py-2 gap-2 border-b border-slate-700/60
                ${homeWon ? 'bg-emerald-900/20' : ''}`}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <TeamLogo teamName={match.homeTeam} className="h-5 w-5 flex-shrink-0" />
                    <span className={`text-xs truncate font-bold ${homeWon ? 'text-white' : awayWon ? 'text-slate-500' : 'text-slate-300'}`}>
                        {match.homeTeam}
                    </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {homeWon && <span className="text-[8px] text-emerald-400 font-black uppercase">✓</span>}
                    <span className={`text-sm font-black tabular-nums w-6 text-right
                        ${homeWon ? 'text-emerald-400' : awayWon ? 'text-slate-600' : 'text-slate-400'}`}
                    >
                        {hasScore ? sh : (pending ? '-' : '')}
                    </span>
                </div>
            </div>

            {/* Away team */}
            <div className={`flex items-center justify-between px-3 py-2 gap-2
                ${awayWon ? 'bg-emerald-900/20' : ''}`}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <TeamLogo teamName={match.awayTeam} className="h-5 w-5 flex-shrink-0" />
                    <span className={`text-xs truncate font-bold ${awayWon ? 'text-white' : homeWon ? 'text-slate-500' : 'text-slate-300'}`}>
                        {match.awayTeam}
                    </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {awayWon && <span className="text-[8px] text-emerald-400 font-black uppercase">✓</span>}
                    <span className={`text-sm font-black tabular-nums w-6 text-right
                        ${awayWon ? 'text-emerald-400' : homeWon ? 'text-slate-600' : 'text-slate-400'}`}
                    >
                        {hasScore ? sa : (pending ? '-' : '')}
                    </span>
                </div>
            </div>

            {/* Date footer */}
            {dateStr && (
                <div className="px-3 py-1 bg-slate-900/40 border-t border-slate-800">
                    <span className="text-[9px] text-slate-600">
                        {dateStr}{match.time && match.time !== '00:00' ? ` · ${match.time}` : ''}
                    </span>
                </div>
            )}
        </div>
    );
};

const BracketSection: React.FC<{ rounds: BracketRound[] }> = ({ rounds }) => {
    const [collapsed, setCollapsed] = useState(false);

    if (rounds.length === 0) return null;

    return (
        <div className="rounded-xl border border-amber-600/30 overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setCollapsed(c => !c)}
                className="w-full flex items-center justify-between px-4 py-3 bg-amber-900/20 hover:bg-amber-900/30 transition-colors border-b border-amber-600/20"
            >
                <div className="flex items-center gap-2">
                    <span className="text-base">🏆</span>
                    <span className="text-xs font-black text-amber-400 uppercase tracking-[0.2em]">
                        Ronda Eliminatoria
                    </span>
                    <span className="text-[10px] text-slate-600">{rounds.length} fase{rounds.length !== 1 ? 's' : ''}</span>
                </div>
                <ChevronDown collapsed={collapsed} />
            </button>

            {!collapsed && (
                <div className="p-4 space-y-5 bg-slate-900/50">
                    {rounds.map(round => (
                        <div key={round.roundLabel}>
                            {/* Phase label */}
                            <div className="flex items-center gap-2 mb-3">
                                <span>{getPhaseEmoji(round.roundLabel)}</span>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                                    {round.roundLabel}
                                </span>
                                <div className="flex-1 h-px bg-slate-800" />
                            </div>

                            {/* Match cards — horizontal scroll on mobile */}
                            <div className="flex flex-wrap gap-3">
                                {round.matches.map(m => (
                                    <BracketMatchCard key={m.id} match={m} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── Legend ──────────────────────────────────────────────────────────────────
const Legend = () => (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-600 px-1">
        <span><strong className="text-slate-500">PJ</strong> Jugados</span>
        <span><strong className="text-slate-500">PG</strong> Ganados</span>
        <span><strong className="text-slate-500">PP</strong> Perdidos</span>
        <span><strong className="text-slate-500">PF/PC</strong> Puntos</span>
        <span><strong className="text-slate-500">Dif</strong> Diferencia</span>
        <span><strong className="text-slate-500">Pts</strong> G×2 + P×1</span>
    </div>
);

// ── Main Component ──────────────────────────────────────────────────────────
const StandingsView: React.FC = () => {
    const { year, tournament: tournamentParam, category: categoryParam } = useParams();
    const navigate = useNavigate();
    const { matches, loading, activeSeason, changeSeason } = useFixture();

    const [filterTournament, setFilterTournament] = useState('Todos');
    const [filterCategory, setFilterCategory] = useState('Todas');

    const availableTournaments = useMemo(() => {
        const u = new Set(matches.map(m => m.tournament).filter(Boolean));
        return ['Todos', ...Array.from(u).sort()];
    }, [matches]);

    const availableCategories = useMemo(() => {
        let f = matches;
        if (filterTournament !== 'Todos') f = f.filter(m => m.tournament === filterTournament);
        const u = new Set(f.map(m => m.category).filter(Boolean));
        return ['Todas', ...Array.from(u).sort()];
    }, [matches, filterTournament]);


    // 1. Sync activeSeason with URL parameter :year
    useEffect(() => {
        if (year && year !== activeSeason) {
            changeSeason(year);
        }
    }, [year, activeSeason, changeSeason]);

    // 2. Sync local filter state with URL parameters
    useEffect(() => {
        let t = tournamentParam ? decodeURIComponent(tournamentParam) : 'Todos';
        let c = categoryParam ? decodeURIComponent(categoryParam) : 'Todas';

        // Auto-select Pretemporada if no tournament param is provided
        if (!tournamentParam && availableTournaments.includes('Pretemporada')) {
            t = 'Pretemporada';
        }

        setFilterTournament(t);
        setFilterCategory(c);
    }, [tournamentParam, categoryParam, availableTournaments]);

    // 3. Navigation helpers
    const handleYearChange = (newYear: string) => {
        navigate(`/standings/${newYear}`);
    };

    const handleTournamentChange = (t: string) => {
        if (t === 'Todos') {
            navigate(`/standings/${activeSeason}`);
        } else {
            navigate(`/standings/${activeSeason}/${encodeURIComponent(t)}`);
        }
    };

    const handleCategoryChange = (c: string) => {
        const t = filterTournament === 'Todos' ? 'Todos' : filterTournament;
        if (c === 'Todas') {
            navigate(`/standings/${activeSeason}/${encodeURIComponent(t)}`);
        } else {
            navigate(`/standings/${activeSeason}/${encodeURIComponent(t)}/${encodeURIComponent(c)}`);
        }
    };

    const availableYears = ['2026', '2025', '2024', '2023', '2022', '2021', '2019', '2018'];


    const groups = useStandings(matches, filterTournament, filterCategory);
    const hasContent = groups.some(g => g.subGroups.some(sg => sg.entries.length > 0) || g.bracketRounds.length > 0);

    if (loading && matches.length === 0) {
        return <div className="flex justify-center py-20"><Loader /></div>;
    }

    return (
        <div className="w-full flex-grow flex flex-col bg-slate-900 border border-slate-700 rounded-xl overflow-hidden mt-8 shadow-2xl">

            {/* ── Sticky Header ── */}
            <div className="sticky top-0 z-20 bg-slate-900 border-b border-slate-700 shadow-xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <span className="text-yellow-400 text-base">🏆</span>
                        <h1 className="text-base font-black text-white tracking-widest uppercase">Tabla</h1>
                        <span className="text-[10px] font-bold text-slate-600 border border-slate-700 px-1.5 rounded">
                            {activeSeason}
                        </span>
                    </div>
                </div>
                <div className="flex gap-2 px-3 py-2 overflow-x-auto scrollbar-hide">
                    <select value={activeSeason} onChange={e => handleYearChange(e.target.value)}
                        className="bg-slate-800 text-white text-xs font-bold py-1.5 px-2 rounded-lg border border-slate-700 focus:border-cyan-500 outline-none flex-shrink-0">
                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select value={filterTournament}
                        onChange={e => handleTournamentChange(e.target.value)}
                        disabled={availableTournaments.length <= 1}
                        className="bg-slate-800 text-white text-xs font-bold py-1.5 px-2 rounded-lg border border-slate-700 focus:border-cyan-500 outline-none flex-shrink-0 max-w-[140px] truncate disabled:opacity-50">
                        {availableTournaments.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select value={filterCategory} onChange={e => handleCategoryChange(e.target.value)}
                        disabled={availableCategories.length <= 1}
                        className="bg-slate-800 text-white text-xs font-bold py-1.5 px-2 rounded-lg border border-slate-700 focus:border-cyan-500 outline-none flex-shrink-0 max-w-[120px] truncate disabled:opacity-50">
                        {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="flex-grow overflow-y-auto p-4 space-y-6">
                {!hasContent ? (
                    <div className="text-center text-slate-500 py-16">
                        <span className="text-4xl block mb-3">🏆</span>
                        <p className="font-semibold">No hay resultados cargados aún</p>
                        <p className="text-sm mt-1">La tabla se calculará automáticamente cuando haya partidos finalizados.</p>
                    </div>
                ) : (
                    <>
                        {groups.map(({ tournament, subGroups, bracketRounds }) => {
                            const hasRR = subGroups.some(sg => sg.entries.length > 0);
                            const hasBracket = bracketRounds.length > 0;
                            if (!hasRR && !hasBracket) return null;

                            return (
                                <div key={tournament} className="space-y-3">
                                    {/* Tournament separator */}
                                    <div className="flex items-center gap-2 pt-1">
                                        <TrophyIcon className="h-3.5 w-3.5 text-slate-500" />
                                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                            {tournament}
                                        </h2>
                                        <div className="flex-1 h-px bg-slate-800" />
                                    </div>

                                    {/* Round-robin sub-tables */}
                                    {hasRR && subGroups
                                        .filter(sg => sg.entries.length > 0)
                                        .map(({ subLabel, entries }) => (
                                            <GroupTable
                                                key={subLabel ?? '__single__'}
                                                label={subLabel ?? ''}
                                                entries={entries}
                                                showGroupHeader={subLabel !== null}
                                            />
                                        ))
                                    }

                                    {/* Knockout bracket */}
                                    {hasBracket && <BracketSection rounds={bracketRounds} />}
                                </div>
                            );
                        })}
                        <Legend />
                        <div className="h-8" />
                    </>
                )}
            </div>
        </div>
    );
};

export default StandingsView;
