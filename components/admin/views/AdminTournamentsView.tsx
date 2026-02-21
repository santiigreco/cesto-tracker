
import React, { useEffect, useState } from 'react';
import { useAdminTournaments } from '../hooks/useAdminTournaments';
import TrophyIcon from '../../TrophyIcon';
import TrashIcon from '../../TrashIcon';
import PlusIcon from '../../PlusIcon';
import Loader from '../../Loader';

// Simple Archive Icon Component
const BoxDownIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
);

const RedoIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

export const AdminTournamentsView: React.FC = () => {
    const { tournaments, fetchTournaments, createTournament, toggleStatus, deleteTournament, loading, error } = useAdminTournaments();
    const [newTournamentName, setNewTournamentName] = useState('');

    useEffect(() => {
        fetchTournaments();
    }, [fetchTournaments]);

    const handleCreate = async () => {
        if (await createTournament(newTournamentName)) {
            setNewTournamentName('');
        }
    };

    const activeTournaments = tournaments.filter(t => t.status === 'active');
    const finishedTournaments = tournaments.filter(t => t.status === 'finished');

    return (
        <div className="space-y-8 animate-fade-in pb-20 lg:pb-0">
            {/* Header with Create Form */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3">Nuevo Campeonato</h3>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={newTournamentName}
                        onChange={(e) => setNewTournamentName(e.target.value)}
                        placeholder="Ej: Liga Apertura 2026..."
                        className="bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2 flex-grow focus:ring-cyan-500 outline-none transition-all focus:border-cyan-500 placeholder-slate-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    />
                    <button 
                        onClick={handleCreate} 
                        disabled={!newTournamentName.trim()}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-colors"
                    >
                        <PlusIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {error && <div className="text-red-400 text-sm bg-red-900/10 p-2 rounded">{error}</div>}

            {loading ? (
                <div className="flex justify-center py-10"><Loader /></div>
            ) : (
                <div className="space-y-8">
                    
                    {/* SECTION: ACTIVE TOURNAMENTS */}
                    <div>
                        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 mb-4 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50"></span>
                            Torneos en Curso
                        </h2>
                        
                        {activeTournaments.length === 0 ? (
                            <p className="text-slate-500 italic ml-4">No hay torneos activos actualmente.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {activeTournaments.map(t => (
                                    <div key={t.id} className="bg-slate-800 p-4 rounded-xl border border-slate-600 shadow-lg flex justify-between items-center group relative overflow-hidden">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                                        <div className="flex items-center gap-3 pl-2">
                                            <div className="p-2 bg-slate-900 rounded-lg text-yellow-400"><TrophyIcon rank={1} /></div>
                                            <span className="font-bold text-white text-lg leading-tight">{t.name}</span>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => toggleStatus(t.id, t.status || 'active')} 
                                                className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-700 rounded transition-colors"
                                                title="Finalizar / Archivar"
                                            >
                                                <BoxDownIcon className="h-5 w-5" />
                                            </button>
                                            <button 
                                                onClick={() => deleteTournament(t.id)} 
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-700 rounded transition-colors"
                                                title="Eliminar"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* SECTION: FINISHED TOURNAMENTS */}
                    <div>
                        <h2 className="text-xl font-bold text-slate-500 mb-4 flex items-center gap-2 border-t border-slate-700 pt-6">
                            <BoxDownIcon className="h-5 w-5" />
                            Historial / Finalizados
                        </h2>
                        
                        {finishedTournaments.length === 0 ? (
                            <p className="text-slate-600 italic ml-4 text-sm">No hay torneos finalizados.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75 hover:opacity-100 transition-opacity">
                                {finishedTournaments.map(t => (
                                    <div key={t.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex justify-between items-center group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-900/50 rounded-lg text-slate-600 grayscale"><TrophyIcon rank={1} /></div>
                                            <span className="font-semibold text-slate-400">{t.name}</span>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => toggleStatus(t.id, t.status || 'finished')} 
                                                className="p-2 text-slate-500 hover:text-green-400 hover:bg-slate-700 rounded transition-colors"
                                                title="Reactivar Torneo"
                                            >
                                                <RedoIcon className="h-5 w-5" />
                                            </button>
                                            <button 
                                                onClick={() => deleteTournament(t.id)} 
                                                className="p-2 text-slate-500 hover:text-red-500 hover:bg-slate-700 rounded transition-colors"
                                                title="Eliminar Permanentemente"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
};
