
import React, { useState, useEffect } from 'react';
import { X, Users, Plus, Trash2, Check } from 'lucide-react';
import Loader from './Loader';
import JerseyIcon from './JerseyIcon';
import { useTeamManager } from '../hooks/useTeamManager';
import { SavedTeam, RosterPlayer } from '../types';

interface TeamRosterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoadTeam: (team: SavedTeam) => void;
    currentSelection: {
        name: string;
        players: string[]; // numbers only
    };
}

const TeamRosterModal: React.FC<TeamRosterModalProps> = ({ isOpen, onClose, onLoadTeam, currentSelection }) => {
    const { teams, loading, fetchTeams, saveTeam, deleteTeam } = useTeamManager();
    const [view, setView] = useState<'list' | 'create'>('list');
    
    // Create Mode State
    const [newTeamName, setNewTeamName] = useState('');
    const [roster, setRoster] = useState<Record<string, string>>({}); // Number -> Name
    const [selectedNumbers, setSelectedNumbers] = useState<Set<string>>(new Set());

    const allNumbers = Array.from({ length: 15 }, (_, i) => String(i + 1));

    useEffect(() => {
        if (isOpen) {
            fetchTeams();
            // Pre-fill creation form with current selection from parent
            setNewTeamName(currentSelection.name);
            const initialRoster: Record<string, string> = {};
            currentSelection.players.forEach(num => initialRoster[num] = '');
            setRoster(initialRoster);
            setSelectedNumbers(new Set(currentSelection.players));
        }
    }, [isOpen]); // Only on open

    const handleTogglePlayer = (num: string) => {
        setSelectedNumbers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(num)) {
                newSet.delete(num);
                const newRoster = { ...roster };
                delete newRoster[num];
                setRoster(newRoster);
            } else {
                newSet.add(num);
                setRoster(prevRoster => ({ ...prevRoster, [num]: '' }));
            }
            return newSet;
        });
    };

    const handleNameChange = (num: string, name: string) => {
        setRoster(prev => ({ ...prev, [num]: name }));
    };

    const handleSave = async () => {
        if (!newTeamName.trim()) {
            alert('Ingresa un nombre para el equipo');
            return;
        }
        if (selectedNumbers.size === 0) {
            alert('Selecciona al menos un jugador');
            return;
        }

        // Explicitly cast Array.from result to string[] to avoid TS errors
        const playersPayload: RosterPlayer[] = (Array.from(selectedNumbers) as string[]).map(num => ({
            number: num,
            name: roster[num]?.trim() || ''
        }));

        const saved = await saveTeam(newTeamName.trim(), playersPayload);
        if (saved) {
            setView('list');
        }
    };
    
    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if(confirm('¿Estás seguro de eliminar este equipo?')) {
            await deleteTeam(id);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-700 overflow-hidden">
                
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-slate-700 bg-slate-800 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <Users className="h-6 w-6 text-cyan-400" />
                        <h2 className="text-xl font-bold text-white">Mis Equipos</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors text-slate-400 hover:text-white" aria-label="Cerrar">
                        <X />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto custom-scrollbar bg-slate-900 p-6">
                    
                    {view === 'list' && (
                        <>
                            {loading && <div className="flex justify-center py-10"><Loader /></div>}
                            
                            {!loading && (
                                <div className="space-y-4">
                                    <button 
                                        onClick={() => {
                                            setNewTeamName('');
                                            setSelectedNumbers(new Set());
                                            setRoster({});
                                            setView('create');
                                        }}
                                        className="w-full bg-cyan-900/30 border border-cyan-500/50 hover:bg-cyan-900/50 text-cyan-400 font-bold p-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                                    >
                                        <Plus className="h-6 w-6" />
                                        <span>Crear Nuevo Equipo</span>
                                    </button>

                                    <h3 className="text-slate-400 text-sm uppercase font-bold tracking-wider pt-2">Equipos Guardados</h3>

                                    {teams.length === 0 ? (
                                        <p className="text-center text-slate-500 py-8">No tienes equipos guardados aún.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {teams.map(team => (
                                                <div 
                                                    key={team.id}
                                                    onClick={() => onLoadTeam(team)}
                                                    className="relative group p-4 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-500 hover:shadow-lg cursor-pointer transition-all"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-bold text-lg text-white group-hover:text-cyan-300 truncate pr-6">{team.name}</h3>
                                                        <button 
                                                            onClick={(e) => handleDelete(team.id, e)}
                                                            className="absolute top-2 right-2 text-slate-600 hover:text-red-500 p-2 rounded transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <p className="text-sm text-slate-400">
                                                        {team.players.length} Jugadores
                                                    </p>
                                                    <div className="mt-3 flex gap-1 overflow-hidden opacity-50">
                                                        {team.players.slice(0, 6).map(p => (
                                                            <div key={p.number} className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold">
                                                                {p.number}
                                                            </div>
                                                        ))}
                                                        {team.players.length > 6 && <span className="text-xs text-slate-500">...</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {view === 'create' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-white font-bold text-lg">Editar Plantel</h3>
                                <button onClick={() => setView('list')} className="text-sm text-slate-400 hover:text-white underline">Volver</button>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Nombre del Equipo</label>
                                <input 
                                    type="text" 
                                    value={newTeamName}
                                    onChange={e => setNewTeamName(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none"
                                    placeholder="Ej: Club Ciudad Sub-17"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Seleccionar Jugadores</label>
                                <div className="flex flex-wrap gap-2">
                                    {allNumbers.map(num => (
                                        <JerseyIcon 
                                            key={num}
                                            number={num}
                                            isSelected={selectedNumbers.has(num)}
                                            onClick={handleTogglePlayer}
                                        />
                                    ))}
                                </div>
                            </div>

                            {selectedNumbers.size > 0 && (
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Nombres (Camisetas)</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(Array.from(selectedNumbers) as string[]).sort((a,b) => Number(a)-Number(b)).map(num => (
                                            <div key={num} className="flex items-center gap-2">
                                                <span className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded text-white font-bold text-sm flex-shrink-0">
                                                    {num}
                                                </span>
                                                <input 
                                                    type="text"
                                                    value={roster[num] || ''}
                                                    onChange={e => handleNameChange(num, e.target.value)}
                                                    className="flex-grow min-w-0 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm text-white focus:border-cyan-500 outline-none"
                                                    placeholder="Nombre..."
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button 
                                    onClick={() => setView('list')}
                                    className="flex-1 py-3 rounded-lg border border-slate-600 text-slate-300 font-bold hover:bg-slate-800"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleSave}
                                    className="flex-[2] py-3 rounded-lg bg-cyan-600 text-white font-bold hover:bg-cyan-700 flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <Check className="h-5 w-5" />
                                    Guardar Equipo
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeamRosterModal;
