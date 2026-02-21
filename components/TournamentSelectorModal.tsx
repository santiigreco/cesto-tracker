
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { XIcon } from './icons';
import { TrophyIcon } from './icons';
import Loader from './Loader';

interface Tournament {
    id: string;
    name: string;
}

interface TournamentSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTournament: (id: string, name: string) => void;
    currentTournamentId?: string;
}

const TournamentSelectorModal: React.FC<TournamentSelectorModalProps> = ({ isOpen, onClose, onSelectTournament, currentTournamentId }) => {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchTournaments();
        }
    }, [isOpen]);

    const fetchTournaments = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('tournaments')
            .select('id, name')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setTournaments(data);
        }
        setLoading(false);
    };

    const handleCreateTournament = async () => {
        if (!searchTerm.trim()) return;
        setCreating(true);

        // Insert new tournament
        const { data, error } = await supabase
            .from('tournaments')
            .insert([{ name: searchTerm.trim() }])
            .select()
            .single();

        if (error) {
            console.error(error);
            alert('Error al crear el torneo');
        } else if (data) {
            onSelectTournament(data.id, data.name);
            onClose();
        }
        setCreating(false);
    };

    const filteredTournaments = tournaments.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
             <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-all scale-100 border border-slate-700">
                <div className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                        <TrophyIcon rank={1} /> Seleccionar Torneo
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors text-slate-400 hover:text-white" aria-label="Cerrar">
                        <XIcon />
                    </button>
                </div>
                
                <div className="p-4 flex-grow overflow-hidden flex flex-col">
                    <input 
                        type="text" 
                        placeholder="Buscar o crear torneo..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none mb-4"
                        autoFocus
                    />

                    {loading ? (
                        <div className="flex justify-center py-8"><Loader /></div>
                    ) : (
                        <div className="overflow-y-auto custom-scrollbar flex-grow space-y-2">
                            {filteredTournaments.length > 0 ? (
                                filteredTournaments.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => { onSelectTournament(t.id, t.name); onClose(); }}
                                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                                            currentTournamentId === t.id 
                                            ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400' 
                                            : 'bg-slate-700/50 border-transparent hover:bg-slate-700 text-white'
                                        }`}
                                    >
                                        <span className="font-bold">{t.name}</span>
                                    </button>
                                ))
                            ) : (
                                <div className="text-center text-slate-400 py-4">
                                    {searchTerm ? 'No se encontraron torneos con ese nombre.' : 'No hay torneos registrados.'}
                                </div>
                            )}
                        </div>
                    )}

                    {searchTerm && !filteredTournaments.find(t => t.name.toLowerCase() === searchTerm.toLowerCase()) && (
                        <div className="mt-4 pt-4 border-t border-slate-700">
                            <button
                                onClick={handleCreateTournament}
                                disabled={creating}
                                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center gap-2"
                            >
                                {creating ? <Loader className="h-5 w-5" /> : `Crear Torneo: "${searchTerm}"`}
                            </button>
                        </div>
                    )}
                </div>
             </div>
        </div>
    );
};

export default TournamentSelectorModal;
