
import React, { useState, useEffect } from 'react';
import XIcon from './XIcon';
import { TEAMS_CONFIG } from '../constants';
import TeamLogo from './TeamLogo';

interface TeamSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTeam: (team: string) => void;
    currentTeam: string;
}

const TeamSelectorModal: React.FC<TeamSelectorModalProps> = ({ isOpen, onClose, onSelectTeam, currentTeam }) => {
    const [customTeam, setCustomTeam] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);

    useEffect(() => {
        // Check if current team is custom (not in config list)
        const isPredefined = TEAMS_CONFIG.some(t => t.name === currentTeam);
        if (currentTeam && !isPredefined) {
            setCustomTeam(currentTeam);
            setShowCustomInput(true);
        }
    }, [currentTeam]);

    if (!isOpen) return null;

    const handlePredefinedSelect = (team: string) => {
        onSelectTeam(team);
        onClose();
    };

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (customTeam.trim()) {
            onSelectTeam(customTeam.trim());
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
             <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-all scale-100">
                <div className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-cyan-400">Selecciona tu Equipo</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors text-slate-400 hover:text-white" aria-label="Cerrar">
                        <XIcon />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                        {TEAMS_CONFIG.map(team => (
                            <button
                                key={team.name}
                                onClick={() => handlePredefinedSelect(team.name)}
                                className={`p-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md flex flex-col items-center justify-center text-center gap-2 h-28 leading-tight ${
                                    currentTeam === team.name 
                                    ? 'bg-gradient-to-br from-cyan-600 to-cyan-700 text-white ring-2 ring-cyan-300 shadow-cyan-500/20' 
                                    : 'bg-slate-700 text-slate-200 hover:bg-slate-600 hover:text-white'
                                }`}
                            >
                                <TeamLogo teamName={team.name} className="h-10 w-10" />
                                <span className="font-bold text-sm">{team.name}</span>
                            </button>
                        ))}
                     </div>

                     <div className="border-t border-slate-700 pt-6">
                        {!showCustomInput ? (
                             <button 
                                onClick={() => setShowCustomInput(true)}
                                className="w-full py-3 rounded-xl border-2 border-dashed border-slate-600 text-slate-400 font-semibold hover:border-cyan-500 hover:text-cyan-400 transition-colors flex items-center justify-center gap-2"
                             >
                                <span>+ Otro equipo...</span>
                             </button>
                        ) : (
                            <div className="space-y-2 animate-fade-in">
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Nombre del equipo</label>
                                <form onSubmit={handleCustomSubmit} className="flex gap-2">
                                    <input 
                                        type="text"
                                        value={customTeam}
                                        onChange={(e) => setCustomTeam(e.target.value)}
                                        placeholder="Escribe el nombre..."
                                        className="flex-grow bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-3 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-colors"
                                        autoFocus
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!customTeam.trim()}
                                        className="bg-cyan-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                                    >
                                        Usar
                                    </button>
                                </form>
                                <button 
                                    onClick={() => setShowCustomInput(false)}
                                    className="text-xs text-slate-500 hover:text-slate-300 underline"
                                >
                                    Volver a la lista
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
