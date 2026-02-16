
import React, { useEffect, useState } from 'react';
import { useAdminTournaments } from '../hooks/useAdminTournaments';
import TrophyIcon from '../../TrophyIcon';
import TrashIcon from '../../TrashIcon';
import PlusIcon from '../../PlusIcon';
import Loader from '../../Loader';

export const AdminTournamentsView: React.FC = () => {
    const { tournaments, fetchTournaments, createTournament, deleteTournament, loading, error } = useAdminTournaments();
    const [newTournamentName, setNewTournamentName] = useState('');

    useEffect(() => {
        fetchTournaments();
    }, [fetchTournaments]);

    const handleCreate = async () => {
        if (await createTournament(newTournamentName)) {
            setNewTournamentName('');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Create Form */}
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={newTournamentName}
                    onChange={(e) => setNewTournamentName(e.target.value)}
                    placeholder="Nombre nuevo torneo..."
                    className="bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2 flex-grow focus:ring-cyan-500 outline-none transition-all focus:border-cyan-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
                <button 
                    onClick={handleCreate} 
                    disabled={!newTournamentName.trim()}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-colors"
                >
                    <PlusIcon className="h-5 w-5" /> Crear
                </button>
            </div>

            {error && <div className="text-red-400 text-sm">{error}</div>}

            {loading ? (
                <div className="flex justify-center py-10"><Loader /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tournaments.map(t => (
                        <div key={t.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center shadow-md group hover:border-cyan-500/30 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-900 rounded-lg text-yellow-500"><TrophyIcon rank={1} /></div>
                                <span className="font-bold text-white text-lg">{t.name}</span>
                            </div>
                            <button 
                                onClick={() => deleteTournament(t.id)} 
                                className="text-slate-600 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all"
                                title="Borrar Torneo"
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                    {tournaments.length === 0 && <p className="text-slate-500 col-span-3 text-center">No hay torneos registrados.</p>}
                </div>
            )}
        </div>
    );
};
