
import React, { useMemo } from 'react';
import { Match } from '../hooks/useFixture';
import TeamLogo from './TeamLogo';

interface GraphicalBracketProps {
    matches: Match[];
    isAdmin: boolean;
    onUpdateMatch: (id: string, field: keyof Match, value: unknown) => void;
}

// Order for columns in the bracket
const PHASE_ORDER: Record<string, number> = {
    'octavo': 1,
    'cuarto': 2,
    'semi': 3,
    'final': 4,
};

const getPhaseKey = (label: string): string => {
    const lower = label.toLowerCase();
    if (lower.includes('semi')) return 'semi';
    if (lower.includes('octavo')) return 'octavo';
    if (lower.includes('cuarto')) return 'cuarto';
    if (lower.includes('final')) return 'final';
    return 'other';
};

const getDisplayPhaseLabel = (label: string): string => {
    const lower = label.toLowerCase();
    if (lower.includes('semi')) return 'Semifinales';
    if (lower.includes('octavo')) return 'Octavos';
    if (lower.includes('cuarto')) return 'Cuartos';
    if (lower.includes('final')) return 'Final';
    return label;
};

const GraphicalBracket: React.FC<GraphicalBracketProps> = ({ matches, isAdmin, onUpdateMatch }) => {
    // Filter matches that belong to a knockout stage
    const bracketMatches = useMemo(() => {
        return matches.filter(m => {
            const sg = m.stageGroup?.toLowerCase() || '';
            return sg.includes('final') || sg.includes('semi') || sg.includes('cuarto') || sg.includes('octavo');
        });
    }, [matches]);

    // Group matches by "Column" (Phase)
    const columns = useMemo(() => {
        const groups: Record<string, Match[]> = {};
        bracketMatches.forEach(m => {
            const key = getPhaseKey(m.stageGroup || '');
            if (!groups[key]) groups[key] = [];
            groups[key].push(m);
        });

        return Object.entries(groups)
            .sort(([a], [b]) => (PHASE_ORDER[a] || 99) - (PHASE_ORDER[b] || 99))
            .map(([key, columnMatches]) => ({
                key,
                label: getDisplayPhaseLabel(columnMatches[0].stageGroup || key),
                matches: columnMatches.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
            }));
    }, [bracketMatches]);

    if (bracketMatches.length === 0) {
        return (
            <div className="p-10 text-center text-slate-500 italic">
                No hay partidos de fase eliminatoria cargados para este torneo.
            </div>
        );
    }

    return (
        <div className="p-4 overflow-x-auto min-h-[400px]">
            <div className="flex gap-8 min-w-max pb-8">
                {columns.map((col, colIdx) => (
                    <div key={col.key} className="flex flex-col gap-6 w-60">
                        {/* Column Header */}
                        <div className="text-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-800 pb-1 px-4">
                                {col.label}
                            </span>
                        </div>

                        {/* Matches in Column */}
                        <div className="flex flex-col justify-around flex-grow gap-4">
                            {col.matches.map((match) => {
                                const hasScore = match.scoreHome !== '' && match.scoreAway !== '' && match.scoreHome !== undefined;
                                const sh = Number(match.scoreHome);
                                const sa = Number(match.scoreAway);
                                const homeWon = hasScore && sh > sa;
                                const awayWon = hasScore && sa > sh;

                                return (
                                    <div key={match.id} className="relative">
                                        <div className="bg-slate-800/80 border border-slate-700 rounded-lg overflow-hidden shadow-lg hover:border-cyan-500/50 transition-colors">
                                            {/* Home Team */}
                                            <div className={`flex items-center justify-between px-3 py-2 border-b border-slate-700/50 ${homeWon ? 'bg-cyan-500/10' : ''}`}>
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <TeamLogo teamName={match.homeTeam} className="h-5 w-5 flex-shrink-0" />
                                                    <span className={`text-xs font-bold truncate ${homeWon ? 'text-white' : 'text-slate-400'}`}>
                                                        {match.homeTeam}
                                                    </span>
                                                </div>
                                                <span className={`text-sm font-black tabular-nums ${homeWon ? 'text-cyan-400' : 'text-slate-500'}`}>
                                                    {match.scoreHome !== '' ? match.scoreHome : '-'}
                                                </span>
                                            </div>

                                            {/* Away Team */}
                                            <div className={`flex items-center justify-between px-3 py-2 ${awayWon ? 'bg-cyan-500/10' : ''}`}>
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <TeamLogo teamName={match.awayTeam} className="h-5 w-5 flex-shrink-0" />
                                                    <span className={`text-xs font-bold truncate ${awayWon ? 'text-white' : 'text-slate-400'}`}>
                                                        {match.awayTeam}
                                                    </span>
                                                </div>
                                                <span className={`text-sm font-black tabular-nums ${awayWon ? 'text-cyan-400' : 'text-slate-500'}`}>
                                                    {match.scoreAway !== '' ? match.scoreAway : '-'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Connecting lines for beauty (simplified) */}
                                        {colIdx < columns.length - 1 && (
                                            <div className="absolute top-1/2 -right-4 w-4 h-px bg-slate-700"></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 p-4 bg-slate-800/40 border border-slate-700 rounded-lg">
                <p className="text-[10px] text-slate-500 uppercase font-black mb-2 text-center tracking-widest">Cómo funciona la Llave</p>
                <ul className="text-[11px] text-slate-400 space-y-1">
                    <li className="flex items-start gap-2">
                        <span className="text-cyan-500">✔</span>
                        <span>La llave se arma automáticamente buscando partidos con "Final", "Semi" o "Cuartos" en su fase.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-cyan-500">✔</span>
                        <span>Cuando cargues el resultado en la lista, el ganador aparecerá automáticamente en la siguiente fase si existe un lugar reservado (Ej: "Ganador Semi 1").</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default GraphicalBracket;
