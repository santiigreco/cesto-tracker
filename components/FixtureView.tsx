
import React, { useState, useMemo, useEffect } from 'react';
import { XIcon } from './icons';
import TeamLogo from './TeamLogo';
import { CalendarIcon } from './icons';
import { PencilIcon } from './icons';
import { CheckIcon } from './icons';
import { PlusIcon } from './icons';
import { TrashIcon } from './icons';
import Loader from './Loader';
import { useFixture, Match } from '../hooks/useFixture';
import { TEAMS_CONFIG } from '../constants';

interface FixtureViewProps {
    isOpen: boolean;
    onClose: () => void;
    isAdmin: boolean;
}

const LocationIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const FixtureView: React.FC<FixtureViewProps> = ({ isOpen, onClose, isAdmin }) => {
    const { matches, tournaments, loading, updateMatch, addMatch, deleteMatch, activeSeason, changeSeason, loadMore, hasMore } = useFixture();
    const [isEditMode, setIsEditMode] = useState(false);

    // --- ESTADOS DE FILTROS EN CASCADA ---
    const [filterTournament, setFilterTournament] = useState<string>('Todos');
    const [filterCategory, setFilterCategory] = useState<string>('Primera A'); // Default: Primera A

    // Al cambiar la temporada (que ahora viene del hook), reseteamos los filtros hijos
    useEffect(() => {
        setFilterTournament('Todos');
        setFilterCategory('Primera A'); // Reset a Primera A al cambiar de año
    }, [activeSeason]);

    useEffect(() => {
        setFilterCategory('Primera A'); // Al cambiar torneo, intentar mantener Primera A
    }, [filterTournament]);


    const [isAddingMatch, setIsAddingMatch] = useState(false);
    const [isCustomTournament, setIsCustomTournament] = useState(false);

    const [newMatchData, setNewMatchData] = useState({
        tournament: '',
        date: new Date().toISOString().split('T')[0],
        time: '20:30',
        homeTeam: '',
        awayTeam: ''
    });

    // --- LÓGICA DE FILTROS CASCADA ---

    // 1. Años Disponibles: Lista estática
    // 2020 eliminado por pandemia
    const availableYears = ['2026', '2025', '2024', '2023', '2022', '2021', '2019', '2018'];

    // 2. Torneos Disponibles (Depende de los partidos cargados, que ya son de la temporada seleccionada)
    const availableTournaments = useMemo(() => {
        // Los partidos ya vienen filtrados por año (o limitados) desde el hook
        const unique = new Set(matches.map(m => m.tournament).filter(Boolean));
        return ['Todos', ...Array.from(unique).sort()];
    }, [matches]);

    // 3. Categorías Disponibles (Depende del Torneo seleccionado)
    const availableCategories = useMemo(() => {
        let filtered = matches;
        if (filterTournament !== 'Todos') {
            filtered = filtered.filter(m => m.tournament === filterTournament);
        }
        const unique = new Set(filtered.map(m => m.category).filter(Boolean));
        const categories = Array.from(unique).sort();
        // Asegurar que 'Todas' esté primero, seguido de las demás
        return ['Todas', ...categories];
    }, [matches, filterTournament]);

    // 4. Partidos Filtrados Finales (Solo aplicamos filtros locales de torneo y categoría)
    const filteredMatches = useMemo(() => {
        return matches.filter(m => {
            if (filterTournament !== 'Todos' && m.tournament !== filterTournament) return false;
            // Si la categoría seleccionada es 'Todas', no filtramos. Si no, debe coincidir.
            if (filterCategory !== 'Todas' && m.category !== filterCategory) return false;
            return true;
        });
    }, [matches, filterTournament, filterCategory]);

    const groupedMatches = useMemo(() => {
        return filteredMatches.reduce((acc, match) => {
            const key = match.date;
            if (!acc[key]) acc[key] = [];
            acc[key].push(match);
            return acc;
        }, {} as Record<string, Match[]>);
    }, [filteredMatches]);

    const availableTournamentsForCreation = useMemo(() => {
        return tournaments.filter(t => t.status === 'active');
    }, [tournaments]);



    const handleUpdateMatch = (id: string, field: keyof Match, value: any) => {
        updateMatch(id, { [field]: value });
    };

    const handleDelete = async (id: string) => {
        if (confirm("¿Estás seguro de eliminar este partido?")) {
            await deleteMatch(id);
        }
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMatchData.tournament || !newMatchData.homeTeam || !newMatchData.awayTeam) {
            alert("Completa todos los campos obligatorios");
            return;
        }
        await addMatch({ ...newMatchData });
        setIsAddingMatch(false);
        setNewMatchData(prev => ({ ...prev, homeTeam: '', awayTeam: '' }));
    };

    const getScoreStyle = (scoreHome: number | '', scoreAway: number | '', isHome: boolean) => {
        if (scoreHome === '' || scoreAway === '') return 'text-slate-300';
        const home = Number(scoreHome);
        const away = Number(scoreAway);
        if (isHome) return home > away ? 'text-green-400 font-extrabold' : 'text-slate-400';
        return away > home ? 'text-green-400 font-extrabold' : 'text-slate-400';
    };

    const formatDateFriendly = (dateString: string) => {
        if (!dateString) return 'Fecha a confirmar';
        const date = new Date(`${dateString}T00:00:00`);
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
        return date.toLocaleDateString('es-AR', options).replace(/^\w/, (c) => c.toUpperCase());
    };

    return (
        <div className="w-full flex-grow flex flex-col bg-slate-900 border border-slate-700 rounded-xl overflow-hidden mt-8 shadow-2xl">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 shadow-xl z-20">
                <div className="p-4 pb-2">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <CalendarIcon className="h-6 w-6 text-cyan-400" />
                            <h1 className="text-xl font-bold text-white tracking-wide">FIXTURE</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            {isAdmin && (
                                <>
                                    <button onClick={() => setIsAddingMatch(true)} className="p-2 bg-cyan-600 rounded-lg text-white">
                                        <PlusIcon className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => setIsEditMode(!isEditMode)} className={`p-2 rounded-lg ${isEditMode ? 'bg-green-600 text-white' : 'bg-slate-700 text-cyan-400'}`}>
                                        {isEditMode ? <CheckIcon className="h-5 w-5" /> : <PencilIcon className="h-5 w-5" />}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* --- FILTROS INTUITIVOS --- */}
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700 mb-2">
                        <span className="text-[10px] uppercase font-bold text-slate-500 mb-2 block tracking-wider">Filtrar por:</span>
                        <div className="grid grid-cols-3 gap-2">

                            {/* 1. Año / Temporada */}
                            <div className="flex flex-col">
                                <label className="text-[10px] text-slate-400 mb-1 ml-1">Periodo</label>
                                <select
                                    value={activeSeason}
                                    onChange={(e) => changeSeason(e.target.value)}
                                    className="w-full bg-slate-800 text-white text-xs font-bold py-2 px-2 rounded-lg border border-slate-600 focus:border-cyan-500 outline-none"
                                >
                                    {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>

                            {/* 2. Torneo */}
                            <div className="flex flex-col">
                                <label className="text-[10px] text-slate-400 mb-1 ml-1">Torneo</label>
                                <select
                                    value={filterTournament}
                                    onChange={(e) => setFilterTournament(e.target.value)}
                                    className="w-full bg-slate-800 text-white text-xs font-bold py-2 px-2 rounded-lg border border-slate-600 focus:border-cyan-500 outline-none truncate"
                                    disabled={availableTournaments.length <= 1 && availableTournaments[0] === 'Todos'}
                                >
                                    {availableTournaments.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            {/* 3. Categoría */}
                            <div className="flex flex-col">
                                <label className="text-[10px] text-slate-400 mb-1 ml-1">Categoría</label>
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="w-full bg-slate-800 text-white text-xs font-bold py-2 px-2 rounded-lg border border-slate-600 focus:border-cyan-500 outline-none truncate"
                                >
                                    {/* Muestra las categorías disponibles. Si 'Primera A' no está en los datos filtrados, aparecerá en el select pero podría no mostrar partidos */}
                                    {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Listado de Partidos */}
            <div className="flex-grow p-2 sm:p-4 max-w-3xl mx-auto w-full space-y-6">
                {isEditMode && (
                    <div className="bg-cyan-900/20 border border-cyan-500/30 p-3 rounded-lg text-cyan-200 text-xs text-center">
                        ✏️ Modo Edición: Cambios se guardan automáticamente.
                    </div>
                )}

                {loading && matches.length === 0 ? (
                    <div className="flex justify-center py-20"><Loader /></div>
                ) : matches.length === 0 ? (
                    <div className="text-center text-slate-500 py-10">No hay partidos cargados para {activeSeason}.</div>
                ) : Object.keys(groupedMatches).length === 0 ? (
                    <div className="text-center text-slate-500 py-10">No hay partidos con estos filtros.</div>
                ) : (
                    Object.entries(groupedMatches).map(([dateKey, groupMatches]) => (
                        <div key={dateKey} className="rounded-xl overflow-hidden border border-slate-700 shadow-lg bg-slate-900">
                            {/* Date Header */}
                            <div className="bg-slate-800/80 backdrop-blur-sm p-2 sm:p-3 border-b border-slate-700 flex justify-between items-center sticky top-0 z-10">
                                <span className="font-bold text-cyan-400 text-xs sm:text-sm uppercase tracking-wider pl-1">
                                    {formatDateFriendly(dateKey)}
                                </span>
                            </div>

                            <div className="divide-y divide-slate-800">
                                {(groupMatches as Match[]).map(match => (
                                    <div key={match.id} className={`flex flex-col p-3 transition-colors relative ${isEditMode ? 'bg-slate-800/30' : 'hover:bg-slate-800/30'}`}>

                                        {/* Metadata Row: Category | Round | Location | Time */}
                                        <div className="flex justify-between items-center mb-2 text-[10px] text-slate-500 uppercase font-bold tracking-wide">
                                            <div className="flex gap-2 items-center flex-wrap">
                                                {match.category && <span className="text-cyan-600 bg-cyan-900/10 px-1.5 rounded">{match.category}</span>}
                                                {match.round && <span className="text-slate-400">{match.round}</span>}
                                                {match.stageGroup && <span className="text-slate-500 border border-slate-700 px-1 rounded">Gr. {match.stageGroup}</span>}
                                                {/* Show tournament name if viewing 'Todos' to clarify context */}
                                                {filterTournament === 'Todos' && <span className="text-slate-600 border-l border-slate-700 pl-2">{match.tournament}</span>}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {/* Time */}
                                                <div className="flex items-center gap-1 text-slate-400">
                                                    <ClockIcon className="h-3 w-3" />
                                                    <span>{match.time}</span>
                                                </div>

                                                {/* Location */}
                                                {match.location && (
                                                    <div className="flex items-center gap-1 text-slate-500 max-w-[80px] sm:max-w-[120px] truncate">
                                                        <LocationIcon className="h-3 w-3" />
                                                        <span className="truncate">{match.location}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Conditional Render: Rest Date (Fecha Libre) OR Normal Match */}
                                        {match.isRest ? (
                                            <div className="flex items-center justify-center gap-4 py-2 relative">
                                                <TeamLogo teamName={match.homeTeam} className="h-10 w-10 opacity-80" />
                                                <div className="text-center">
                                                    <span className="block font-bold text-slate-300 text-sm mb-1">{match.homeTeam}</span>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-slate-700 px-2 py-1 rounded bg-slate-800">
                                                        Fecha Libre
                                                    </span>
                                                </div>
                                                {isEditMode && (
                                                    <button onClick={() => handleDelete(match.id)} className="absolute right-0 bg-red-900/30 text-red-400 p-2 rounded-lg hover:bg-red-900/50">
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between">

                                                {/* Home */}
                                                <div className="flex-1 flex items-center justify-end gap-2 text-right">
                                                    <span className={`font-semibold ${getScoreStyle(match.scoreHome, match.scoreAway, true)} text-xs sm:text-sm leading-tight`}>
                                                        {match.homeTeam}
                                                    </span>
                                                    <TeamLogo teamName={match.homeTeam} className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0" />
                                                </div>

                                                {/* Center Info */}
                                                <div className="w-24 sm:w-32 flex flex-col items-center justify-center px-1 relative">
                                                    {isEditMode ? (
                                                        <div className="flex flex-col gap-1 w-full z-20">
                                                            <div className="flex justify-center gap-1">
                                                                <input type="number" value={match.scoreHome} onChange={(e) => handleUpdateMatch(match.id, 'scoreHome', e.target.value)} className="w-8 h-8 bg-slate-800 text-center text-white font-bold border border-slate-600 rounded text-sm" />
                                                                <input type="number" value={match.scoreAway} onChange={(e) => handleUpdateMatch(match.id, 'scoreAway', e.target.value)} className="w-8 h-8 bg-slate-800 text-center text-white font-bold border border-slate-600 rounded text-sm" />
                                                            </div>
                                                            <input type="text" placeholder="Video URL" value={match.matchUrl || ''} onChange={(e) => handleUpdateMatch(match.id, 'matchUrl', e.target.value)} className="w-full bg-slate-800 text-[10px] text-white border border-slate-600 rounded px-1" />
                                                            <button onClick={() => handleDelete(match.id)} className="bg-red-600 text-white text-[10px] rounded px-1 mt-1">Borrar</button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {match.scoreHome !== '' && match.scoreAway !== '' ? (
                                                                <div className="flex items-center justify-center gap-2 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50">
                                                                    <span className={`text-xl font-black ${getScoreStyle(match.scoreHome, match.scoreAway, true)}`}>{match.scoreHome}</span>
                                                                    <span className="text-slate-600 text-[10px] font-bold">-</span>
                                                                    <span className={`text-xl font-black ${getScoreStyle(match.scoreHome, match.scoreAway, false)}`}>{match.scoreAway}</span>
                                                                </div>
                                                            ) : (
                                                                <div className="text-cyan-400 font-bold text-sm bg-slate-800/50 px-2 rounded border border-slate-700">{match.time}</div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>

                                                {/* Away */}
                                                <div className="flex-1 flex items-center justify-start gap-2 text-left">
                                                    <TeamLogo teamName={match.awayTeam} className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0" />
                                                    <span className={`font-semibold ${getScoreStyle(match.scoreHome, match.scoreAway, false)} text-xs sm:text-sm leading-tight`}>
                                                        {match.awayTeam}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}

                {/* Load More Button */}
                {hasMore && !loading && matches.length > 0 && (
                    <div className="flex justify-center pt-4 pb-8">
                        <button
                            onClick={loadMore}
                            className="bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold py-2 px-6 rounded-full border border-slate-600 transition-all shadow-lg flex items-center gap-2"
                        >
                            <PlusIcon className="h-4 w-4" /> Cargar más partidos
                        </button>
                    </div>
                )}

                {loading && matches.length > 0 && (
                    <div className="flex justify-center py-4"><Loader /></div>
                )}

                <div className="h-12"></div>
            </div>

            {/* Add Match Modal */}
            {isAddingMatch && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-4">
                    <div className="bg-slate-800 rounded-xl w-full max-w-md p-6 border border-slate-700">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Nuevo Partido</h2>
                            <button onClick={() => setIsAddingMatch(false)} className="text-slate-400 hover:text-white"><XIcon /></button>
                        </div>
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Torneo</label>
                                {!isCustomTournament ? (
                                    <select
                                        value={newMatchData.tournament}
                                        onChange={(e) => {
                                            if (e.target.value === 'custom') { setIsCustomTournament(true); setNewMatchData(p => ({ ...p, tournament: '' })); }
                                            else { setIsCustomTournament(false); setNewMatchData(p => ({ ...p, tournament: e.target.value })); }
                                        }}
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none"
                                    >
                                        <option value="">Seleccionar...</option>
                                        {availableTournamentsForCreation.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                        <option value="custom" className="text-cyan-400">+ Otro</option>
                                    </select>
                                ) : (
                                    <div className="flex gap-2">
                                        <input type="text" value={newMatchData.tournament} onChange={e => setNewMatchData({ ...newMatchData, tournament: e.target.value })} placeholder="Nombre del torneo" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" autoFocus />
                                        <button type="button" onClick={() => setIsCustomTournament(false)} className="px-3 bg-slate-700 rounded text-slate-300">Cancelar</button>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Fecha</label>
                                    <input type="date" value={newMatchData.date} onChange={e => setNewMatchData({ ...newMatchData, date: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Hora</label>
                                    <input type="time" value={newMatchData.time} onChange={e => setNewMatchData({ ...newMatchData, time: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Local</label>
                                    <select value={newMatchData.homeTeam} onChange={e => setNewMatchData({ ...newMatchData, homeTeam: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white">
                                        <option value="">Elegir...</option>
                                        {TEAMS_CONFIG.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Visitante</label>
                                    <select value={newMatchData.awayTeam} onChange={e => setNewMatchData({ ...newMatchData, awayTeam: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white">
                                        <option value="">Elegir...</option>
                                        {TEAMS_CONFIG.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg mt-2">Crear Partido</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FixtureView;
