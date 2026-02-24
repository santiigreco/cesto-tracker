
import React, { useState, useEffect } from 'react';
import { XIcon } from './icons';
import { TEAMS_CONFIG } from '../constants';
import TeamLogo from './TeamLogo';
import { useTeamManager } from '../hooks/useTeamManager';
import { RosterPlayer } from '../types';
import { UsersIcon } from './icons';
import Loader from './Loader';
import { normalizeTeamName } from '../utils/teamUtils';

interface TeamSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTeam: (teamName: string, roster?: RosterPlayer[]) => void;
    currentTeam: string;
}

const TeamSelectorModal: React.FC<TeamSelectorModalProps> = ({ isOpen, onClose, onSelectTeam, currentTeam }) => {
    const { teams: savedTeams, loading, fetchTeams } = useTeamManager();
    const [customTeam, setCustomTeam] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchTeams();
        }
    }, [isOpen]);

    useEffect(() => {
        // Check if current team is custom (not in config list and not in saved teams)
        const isPredefined = TEAMS_CONFIG.some(t => normalizeTeamName(t.name) === normalizeTeamName(currentTeam));
        const isSaved = savedTeams.some(t => normalizeTeamName(t.name) === normalizeTeamName(currentTeam));

        if (currentTeam && !isPredefined && !isSaved && !loading) {
            setCustomTeam(currentTeam);
            // Don't auto-show input if we are just loading, wait for user interaction usually, 
            // but here we want to show it if it's already a custom value.
            if (currentTeam !== '') setShowCustomInput(true);
        }
    }, [currentTeam, savedTeams, loading]);

    if (!isOpen) return null;

    const handleSelect = (name: string, roster?: RosterPlayer[]) => {
        onSelectTeam(name, roster);
        // Do NOT call onClose() here. The parent component handles the flow (closing/transitioning).
        // Calling onClose() here would trigger the "dismiss" logic in parent (e.g. going to empty setup), causing a race condition.
    };

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (customTeam.trim()) {
            handleSelect(customTeam.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-all scale-100 border border-slate-700">
                <div className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0 bg-slate-800 rounded-t-xl">
                    <h2 className="text-xl font-bold text-cyan-400">Selecciona tu Equipo</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors text-slate-400 hover:text-white" aria-label="Cerrar">
                        <XIcon />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-grow bg-slate-900">

                    {/* 1. SAVED TEAMS SECTION (Standardized Data) */}
                    {loading ? (
                        <div className="flex justify-center py-4"><Loader className="h-6 w-6" /></div>
                    ) : savedTeams.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <UsersIcon className="h-4 w-4" /> Mis Planteles Guardados
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {savedTeams.map(team => (
                                    <button
                                        key={team.id}
                                        onClick={() => handleSelect(team.name, team.players)}
                                        className={`p-3 rounded-xl transition-all duration-200 border text-left flex items-center gap-3 relative overflow-hidden ${normalizeTeamName(currentTeam) === normalizeTeamName(team.name)
                                                ? 'bg-cyan-900/40 border-cyan-500 ring-1 ring-cyan-400'
                                                : 'bg-slate-800 border-slate-700 hover:border-cyan-500/50 hover:bg-slate-750'
                                            }`}
                                    >
                                        <div className="flex-shrink-0">
                                            <TeamLogo teamName={team.name} className="h-10 w-10" />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="font-bold text-white block truncate">{team.name}</span>
                                            <span className="text-xs text-slate-400 block">{team.players.length} Jugadores</span>
                                        </div>
                                        {normalizeTeamName(currentTeam) === normalizeTeamName(team.name) && (
                                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-cyan-500"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 2. PREDEFINED TEAMS SECTION */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Equipos de la Liga</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                            {TEAMS_CONFIG.map(team => (
                                <button
                                    key={team.name}
                                    onClick={() => handleSelect(team.name)}
                                    className={`p-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md flex flex-col items-center justify-center text-center gap-2 h-24 leading-tight ${normalizeTeamName(currentTeam) === normalizeTeamName(team.name)
                                            ? 'bg-gradient-to-br from-cyan-600 to-cyan-700 text-white ring-2 ring-cyan-300 shadow-cyan-500/20'
                                            : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white'
                                        }`}
                                >
                                    <TeamLogo teamName={team.name} className="h-8 w-8" />
                                    <span className="font-bold text-xs sm:text-sm">{team.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3. CUSTOM INPUT */}
                    <div className="border-t border-slate-700 pt-6">
                        {!showCustomInput ? (
                            <button
                                onClick={() => setShowCustomInput(true)}
                                className="w-full py-3 rounded-xl border-2 border-dashed border-slate-700 text-slate-500 font-semibold hover:border-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-2"
                            >
                                <span>+ Escribir otro nombre...</span>
                            </button>
                        ) : (
                            <div className="space-y-2 animate-fade-in bg-slate-800 p-4 rounded-xl border border-slate-700">
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Nombre personalizado</label>
                                <form onSubmit={handleCustomSubmit} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={customTeam}
                                        onChange={(e) => setCustomTeam(e.target.value)}
                                        placeholder="Ej: Mi Equipo Amigos"
                                        className="flex-grow bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-colors"
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        disabled={!customTeam.trim()}
                                        className="bg-cyan-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg whitespace-nowrap"
                                    >
                                        Usar
                                    </button>
                                </form>
                                <button
                                    onClick={() => setShowCustomInput(false)}
                                    className="text-xs text-slate-500 hover:text-slate-300 underline w-full text-center mt-2"
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamSelectorModal;
