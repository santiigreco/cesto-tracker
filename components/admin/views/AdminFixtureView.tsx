
import React, { useState, useMemo } from 'react';
import { useFixture, Match } from '../../../hooks/useFixture';
import { SearchIcon, TrashIcon, RefreshIcon, PlusIcon } from '../../icons';
import Loader from '../../Loader';

export const AdminFixtureView: React.FC = () => {
    const { matches, loading, updateMatch, deleteMatch, refresh } = useFixture();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('Todas');
    const [filterTournament, setFilterTournament] = useState('Todos');

    // Stats
    const totalMatches = matches.length;
    const finishedMatches = matches.filter(m => m.status === 'finished').length;
    const scheduledMatches = matches.filter(m => m.status === 'scheduled').length;

    const categories = useMemo(() => {
        const cats = new Set(matches.map(m => m.category).filter(Boolean));
        return ['Todas', ...Array.from(cats)].sort();
    }, [matches]);

    const tournaments = useMemo(() => {
        const tours = new Set(matches.map(m => m.tournament).filter(Boolean));
        return ['Todos', ...Array.from(tours)].sort();
    }, [matches]);

    const filteredMatches = useMemo(() => {
        return matches.filter(m => {
            const matchesSearch =
                m.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (m.round || '').toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = filterCategory === 'Todas' || m.category === filterCategory;
            const matchesTournament = filterTournament === 'Todos' || m.tournament === filterTournament;

            return matchesSearch && matchesCategory && matchesTournament;
        });
    }, [matches, searchTerm, filterCategory, filterTournament]);

    const handleScoreChange = (id: string, side: 'home' | 'away', value: string) => {
        const score = value === '' ? '' : parseInt(value, 10);
        if (typeof score === 'number' && isNaN(score)) return;

        updateMatch(id, {
            [side === 'home' ? 'scoreHome' : 'scoreAway']: score,
            status: 'finished' // Auto-set to finished if scores are entered
        });
    };

    const handleStatusToggle = (id: string, currentStatus: string) => {
        const nextStatus = currentStatus === 'scheduled' ? 'finished' : 'scheduled';
        updateMatch(id, { status: nextStatus as any });
    };

    const { addMatch } = useFixture();

    const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            const rows = text.split('\n').filter(r => r.trim());
            if (rows.length < 2) return;

            const headers = rows[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));

            const matchesToUpload = rows.slice(1).map(row => {
                const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
                const matchObj: any = {};
                headers.forEach((header, i) => {
                    matchObj[header] = values[i];
                });
                return matchObj;
            });

            for (const m of matchesToUpload) {
                await addMatch({
                    tournament: m.tournament || (filterTournament !== 'Todos' ? filterTournament : 'General'),
                    date: m.date,
                    time: m.time || '00:00',
                    homeTeam: m.home_team || m.hometeam || m.local,
                    awayTeam: m.away_team || m.awayteam || m.visitante,
                    category: m.category || 'Primera A',
                    gender: m.gender || 'Femenino',
                    round: m.round,
                    stageGroup: m.stage_group || m.stagegroup,
                    isRest: m.is_rest === 'true' || m.is_rest === 'TRUE' || m.is_rest === '1' || m.is_rest === 'SI'
                });
            }
            alert(`Sincronización completa: ${matchesToUpload.length} partidos procesados.`);
            refresh();
        };
        reader.readAsText(file);
    };

    return (
        <div className="flex flex-col h-full animate-fade-in space-y-4 pb-20 lg:pb-0">

            {/* --- HEADER STATS --- */}
            <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
                <div className="flex gap-4 sm:gap-8">
                    <div className="text-center">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total</p>
                        <p className="text-xl font-black text-white">{totalMatches}</p>
                    </div>
                    <div className="text-center border-l border-slate-700 pl-4 sm:pl-8">
                        <p className="text-[10px] text-green-500 uppercase font-bold tracking-widest">Final</p>
                        <p className="text-xl font-black text-green-400">{finishedMatches}</p>
                    </div>
                    <div className="text-center border-l border-slate-700 pl-4 sm:pl-8">
                        <p className="text-[10px] text-cyan-500 uppercase font-bold tracking-widest">Prog.</p>
                        <p className="text-xl font-black text-cyan-400">{scheduledMatches}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white px-3 sm:px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all active:scale-95 border border-slate-600 shadow-lg">
                        <PlusIcon className="h-4 w-4" /> <span className="hidden sm:inline">Importar</span> CSV
                        <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
                    </label>
                </div>
            </div>

            {/* --- FILTERS --- */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-grow">
                    <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar equipos o fecha..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                </div>
                <select
                    value={filterTournament}
                    onChange={(e) => setFilterTournament(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none"
                >
                    {tournaments.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none"
                >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button
                    onClick={refresh}
                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                    title="Sincronizar"
                >
                    <RefreshIcon className="h-5 w-5" />
                </button>
            </div>

            {/* --- TABLE --- */}
            <div className="flex-grow bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col shadow-xl">
                <div className="overflow-x-auto flex-grow custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-slate-900/50 text-slate-400 text-[10px] uppercase font-bold sticky top-0 z-10">
                            <tr>
                                <th className="p-3 border-b border-slate-700 w-24">Fecha</th>
                                <th className="p-3 border-b border-slate-700">Competencia/Cat</th>
                                <th className="p-3 border-b border-slate-700 text-right">Local</th>
                                <th className="p-3 border-b border-slate-700 text-center w-32">Resultado</th>
                                <th className="p-3 border-b border-slate-700">Visitante</th>
                                <th className="p-3 border-b border-slate-700 text-center">Estado</th>
                                <th className="p-3 border-b border-slate-700 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {loading ? (
                                <tr><td colSpan={7} className="p-10 text-center"><Loader /></td></tr>
                            ) : filteredMatches.map(m => (
                                <tr key={m.id} className="hover:bg-slate-700/20 transition-colors group">
                                    <td className="p-3">
                                        <div className="text-white text-sm font-medium">{new Date(m.date).toLocaleDateString()}</div>
                                        <div className="text-[10px] text-slate-500">{m.time}hs</div>
                                    </td>
                                    <td className="p-3">
                                        <div className="text-xs text-slate-300 font-bold truncate max-w-[150px]">{m.tournament}</div>
                                        <div className="text-[10px] text-cyan-500 font-bold uppercase">{m.category} - {m.gender}</div>
                                    </td>
                                    <td className="p-3 text-right">
                                        <span className="text-sm font-bold text-white">{m.homeTeam}</span>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center justify-center gap-1">
                                            <input
                                                type="number"
                                                value={m.scoreHome}
                                                onChange={(e) => handleScoreChange(m.id, 'home', e.target.value)}
                                                className="w-12 bg-slate-900 border border-slate-700 rounded p-1 text-center text-white font-bold text-sm focus:border-cyan-500 outline-none"
                                            />
                                            <span className="text-slate-600">-</span>
                                            <input
                                                type="number"
                                                value={m.scoreAway}
                                                onChange={(e) => handleScoreChange(m.id, 'away', e.target.value)}
                                                className="w-12 bg-slate-900 border border-slate-700 rounded p-1 text-center text-white font-bold text-sm focus:border-cyan-500 outline-none"
                                            />
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <span className="text-sm font-bold text-white">{m.awayTeam}</span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <button
                                            onClick={() => handleStatusToggle(m.id, m.status)}
                                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${m.status === 'finished' ? 'bg-green-900/40 text-green-400 border border-green-800' : 'bg-slate-700 text-slate-400 border border-slate-600'
                                                }`}
                                        >
                                            {m.status === 'finished' ? 'Final' : 'Prog.'}
                                        </button>
                                    </td>
                                    <td className="p-3 text-right">
                                        <button
                                            onClick={() => { if (confirm('¿Eliminar partido?')) deleteMatch(m.id) }}
                                            className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-900/20 rounded transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
