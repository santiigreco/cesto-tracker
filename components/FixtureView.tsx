
import React, { useState } from 'react';
import XIcon from './XIcon';
import TeamLogo from './TeamLogo';
import CalendarIcon from './CalendarIcon';
import PencilIcon from './PencilIcon';
import CheckIcon from './CheckIcon';
import PlusIcon from './PlusIcon';
import TrashIcon from './TrashIcon';
import Loader from './Loader';
import { useFixture, Match } from '../hooks/useFixture';
import { TEAMS_CONFIG } from '../constants';

interface FixtureViewProps {
    isOpen: boolean;
    onClose: () => void;
    isAdmin: boolean;
}

const FixtureView: React.FC<FixtureViewProps> = ({ isOpen, onClose, isAdmin }) => {
    const { matches, tournaments, loading, updateMatch, addMatch, deleteMatch } = useFixture();
    const [isEditMode, setIsEditMode] = useState(false);
    
    // State for New Match Modal
    const [isAddingMatch, setIsAddingMatch] = useState(false);
    const [isCustomTournament, setIsCustomTournament] = useState(false);
    
    const [newMatchData, setNewMatchData] = useState({
        tournament: '',
        date: new Date().toISOString().split('T')[0], // Default today
        time: '20:30',
        homeTeam: '',
        awayTeam: ''
    });

    if (!isOpen) return null;

    // Group matches by Tournament and Date
    const groupedMatches = matches.reduce((acc, match) => {
        const key = `${match.tournament} - ${match.date}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(match);
        return acc;
    }, {} as Record<string, Match[]>);

    const handleUpdateMatch = (id: string, field: keyof Match, value: any) => {
        updateMatch(id, { [field]: value });
    };

    const handleDelete = async (id: string) => {
        if (confirm("¿Estás seguro de eliminar este partido?")) {
            await deleteMatch(id);
        }
    };

    const handleTournamentSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'custom') {
            setIsCustomTournament(true);
            setNewMatchData(prev => ({ ...prev, tournament: '' }));
        } else {
            setIsCustomTournament(false);
            setNewMatchData(prev => ({ ...prev, tournament: value }));
        }
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMatchData.tournament || !newMatchData.homeTeam || !newMatchData.awayTeam) {
            alert("Completa todos los campos obligatorios");
            return;
        }
        
        await addMatch({
            tournament: newMatchData.tournament,
            date: newMatchData.date,
            time: newMatchData.time,
            homeTeam: newMatchData.homeTeam,
            awayTeam: newMatchData.awayTeam
        });
        
        setIsAddingMatch(false);
        // Reset form slightly but keep tournament for convenience
        setNewMatchData(prev => ({ ...prev, homeTeam: '', awayTeam: '' }));
    };

    return (
        <div className="fixed inset-0 bg-slate-900 z-50 overflow-y-auto animate-fade-in flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-4 shadow-md flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    <CalendarIcon className="h-6 w-6 text-cyan-400" />
                    <h1 className="text-xl font-bold text-white tracking-wide">FIXTURE</h1>
                </div>
                <div className="flex items-center gap-3">
                    {isAdmin && (
                        <>
                            <button
                                onClick={() => setIsAddingMatch(true)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm transition-colors shadow-lg"
                            >
                                <PlusIcon className="h-4 w-4" /> <span className="hidden sm:inline">Nuevo</span>
                            </button>
                            <button
                                onClick={() => setIsEditMode(!isEditMode)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                                    isEditMode 
                                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg' 
                                    : 'bg-slate-700 text-cyan-400 hover:bg-slate-600 border border-cyan-900/50'
                                }`}
                            >
                                {isEditMode ? <><CheckIcon className="h-4 w-4" /> Listo</> : <><PencilIcon className="h-4 w-4" /> Editar</>}
                            </button>
                        </>
                    )}
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600 transition-colors"
                    >
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-grow p-2 sm:p-4 max-w-3xl mx-auto w-full space-y-6">
                
                {isEditMode && (
                    <div className="bg-cyan-900/20 border border-cyan-500/30 p-3 rounded-lg text-cyan-200 text-sm text-center mb-4 animate-fade-in">
                        ✏️ Modo Edición Activo: Los cambios se guardan automáticamente y son visibles para todos al instante.
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20"><Loader /></div>
                ) : matches.length === 0 ? (
                    <div className="text-center text-slate-500 py-10">
                        <p>No hay partidos programados.</p>
                        {isAdmin && <p className="text-xs mt-2 text-cyan-400">¡Usa el botón "+ Nuevo" para crear uno!</p>}
                    </div>
                ) : (
                    Object.entries(groupedMatches).map(([groupTitle, groupMatches]) => (
                        <div key={groupTitle} className="rounded-lg overflow-hidden border border-slate-700 shadow-lg">
                            {/* Tournament Header */}
                            <div className="bg-slate-800 p-2 border-b border-slate-700 flex justify-between items-center">
                                <span className="font-bold text-cyan-400 text-sm uppercase tracking-wider pl-2">{groupTitle}</span>
                            </div>
                            
                            {/* Matches List */}
                            <div className="bg-slate-900 divide-y divide-slate-800">
                                {(groupMatches as Match[]).map(match => (
                                    <div key={match.id} className={`flex items-center justify-between p-3 transition-colors ${isEditMode ? 'bg-slate-800/30' : 'hover:bg-slate-800/50'}`}>
                                        
                                        {/* Home Team */}
                                        <div className="flex-1 flex items-center justify-end gap-2 text-right">
                                            <span className={`font-semibold ${match.scoreHome !== '' && Number(match.scoreHome) > Number(match.scoreAway) ? 'text-white' : 'text-slate-300'} text-sm sm:text-base hidden sm:block`}>
                                                {match.homeTeam}
                                            </span>
                                            <span className="sm:hidden font-bold text-white text-xs">{match.homeTeam.substring(0,3).toUpperCase()}</span>
                                            <TeamLogo teamName={match.homeTeam} className="h-6 w-6 sm:h-8 sm:w-8" />
                                        </div>

                                        {/* Score / Time / Inputs */}
                                        <div className="w-32 sm:w-40 text-center flex flex-col items-center justify-center bg-slate-800/80 rounded py-1 mx-2 border border-slate-700 relative group">
                                            {isEditMode && (
                                                <button 
                                                    onClick={() => handleDelete(match.id)}
                                                    className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 text-white shadow-md hover:bg-red-700 z-10"
                                                    title="Eliminar partido"
                                                >
                                                    <TrashIcon className="h-3 w-3" />
                                                </button>
                                            )}

                                            {isEditMode ? (
                                                <div className="flex flex-col gap-1 w-full px-1">
                                                    <div className="flex justify-center items-center gap-1">
                                                        <input 
                                                            type="number" 
                                                            value={match.scoreHome === undefined ? '' : match.scoreHome}
                                                            onChange={(e) => handleUpdateMatch(match.id, 'scoreHome', e.target.value)}
                                                            placeholder="L"
                                                            className="w-8 h-8 bg-slate-900 border border-slate-600 text-center text-white font-bold rounded focus:border-cyan-500 outline-none p-0 text-sm"
                                                        />
                                                        <span className="text-slate-500">-</span>
                                                        <input 
                                                            type="number" 
                                                            value={match.scoreAway === undefined ? '' : match.scoreAway}
                                                            onChange={(e) => handleUpdateMatch(match.id, 'scoreAway', e.target.value)}
                                                            placeholder="V"
                                                            className="w-8 h-8 bg-slate-900 border border-slate-600 text-center text-white font-bold rounded focus:border-cyan-500 outline-none p-0 text-sm"
                                                        />
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <input 
                                                            type="text" 
                                                            value={match.time}
                                                            onChange={(e) => handleUpdateMatch(match.id, 'time', e.target.value)}
                                                            className="w-full bg-slate-900 text-xs text-center text-white border border-slate-600 rounded py-0.5"
                                                        />
                                                    </div>
                                                    <select 
                                                        value={match.status}
                                                        onChange={(e) => handleUpdateMatch(match.id, 'status', e.target.value)}
                                                        className={`w-full text-[10px] uppercase font-bold text-center rounded py-0.5 cursor-pointer outline-none border border-slate-600 ${
                                                            match.status === 'live' ? 'bg-red-900 text-red-200' : 
                                                            match.status === 'finished' ? 'bg-slate-700 text-slate-400' : 'bg-slate-900 text-cyan-400'
                                                        }`}
                                                    >
                                                        <option value="scheduled">Programado</option>
                                                        <option value="live">En Vivo 🔴</option>
                                                        <option value="finished">Finalizado</option>
                                                    </select>
                                                </div>
                                            ) : (
                                                <>
                                                    {match.status === 'scheduled' ? (
                                                        <span className="text-cyan-400 font-bold text-lg font-mono">{match.time}</span>
                                                    ) : (
                                                        <div className="font-bold text-lg text-white font-mono leading-none">
                                                            {match.scoreHome ?? '-'} - {match.scoreAway ?? '-'}
                                                        </div>
                                                    )}
                                                    
                                                    {match.status === 'live' && (
                                                        <span className="text-[10px] text-red-500 font-bold uppercase mt-0.5 animate-pulse">En Vivo 🔴</span>
                                                    )}
                                                    {match.status === 'finished' && (
                                                        <span className="text-[10px] text-slate-500 uppercase mt-0.5">Final</span>
                                                    )}
                                                    {match.status === 'scheduled' && (
                                                        <span className="text-[10px] text-slate-500 uppercase mt-0.5">Programado</span>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {/* Away Team */}
                                        <div className="flex-1 flex items-center justify-start gap-2 text-left">
                                            <TeamLogo teamName={match.awayTeam} className="h-6 w-6 sm:h-8 sm:w-8" />
                                            <span className={`font-semibold ${match.scoreAway !== '' && Number(match.scoreAway) > Number(match.scoreHome) ? 'text-white' : 'text-slate-300'} text-sm sm:text-base hidden sm:block`}>
                                                {match.awayTeam}
                                            </span>
                                            <span className="sm:hidden font-bold text-white text-xs">{match.awayTeam.substring(0,3).toUpperCase()}</span>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}

                <div className="text-center text-slate-500 text-xs py-8">
                    Datos provistos por Cesto Tracker - Actualizado en tiempo real
                </div>
            </div>

            {/* Add Match Modal */}
            {isAddingMatch && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-4">
                    <div className="bg-slate-800 rounded-xl w-full max-w-md p-6 border border-slate-700 shadow-2xl">
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
                                        onChange={handleTournamentSelectChange}
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-cyan-500"
                                    >
                                        <option value="">Seleccionar torneo...</option>
                                        {tournaments.map(t => (
                                            <option key={t.id} value={t.name}>{t.name}</option>
                                        ))}
                                        <option value="custom" className="text-cyan-400 font-bold">+ Otro (Escribir nombre)</option>
                                    </select>
                                ) : (
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={newMatchData.tournament}
                                            onChange={e => setNewMatchData({...newMatchData, tournament: e.target.value})}
                                            placeholder="Ej: Amistoso de Verano"
                                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-cyan-500"
                                            autoFocus
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => { setIsCustomTournament(false); setNewMatchData(prev => ({...prev, tournament: ''})); }}
                                            className="px-3 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 text-xs"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Fecha</label>
                                    <input 
                                        type="date" 
                                        value={newMatchData.date}
                                        onChange={e => setNewMatchData({...newMatchData, date: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Hora</label>
                                    <input 
                                        type="time" 
                                        value={newMatchData.time}
                                        onChange={e => setNewMatchData({...newMatchData, time: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-cyan-500"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Local</label>
                                    <select 
                                        value={newMatchData.homeTeam}
                                        onChange={e => setNewMatchData({...newMatchData, homeTeam: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-cyan-500"
                                    >
                                        <option value="">Elegir...</option>
                                        {TEAMS_CONFIG.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                                    </select>
                                    {/* Fallback input if needed, but TEAMS_CONFIG is safer for now */}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Visitante</label>
                                    <select 
                                        value={newMatchData.awayTeam}
                                        onChange={e => setNewMatchData({...newMatchData, awayTeam: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-cyan-500"
                                    >
                                        <option value="">Elegir...</option>
                                        {TEAMS_CONFIG.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg shadow-lg transition-colors mt-2">
                                Crear Partido
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FixtureView;
