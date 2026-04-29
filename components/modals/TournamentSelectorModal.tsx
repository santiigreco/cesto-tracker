import React from 'react';
import { XIcon } from '../icons';
import { TrophyIcon } from '../icons';
import { TOURNAMENTS_CONFIG } from '../../constants';

interface TournamentSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTournament: (id: string, name: string) => void;
    currentTournamentId?: string;
}

const TournamentSelectorModal: React.FC<TournamentSelectorModalProps> = ({ isOpen, onClose, onSelectTournament, currentTournamentId }) => {
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
                
                <div className="p-4 flex-grow overflow-y-auto custom-scrollbar flex flex-col space-y-2">
                    {TOURNAMENTS_CONFIG.map(name => (
                        <button
                            key={name}
                            onClick={() => { onSelectTournament(name, name); onClose(); }} // Using name as ID since it's hardcoded
                            className={`w-full text-left p-4 rounded-lg border transition-all ${
                                currentTournamentId === name 
                                ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400' 
                                : 'bg-slate-700/50 border-transparent hover:bg-slate-700 text-white'
                            }`}
                        >
                            <span className="font-bold">{name}</span>
                        </button>
                    ))}
                </div>
             </div>
        </div>
    );
};

export default TournamentSelectorModal;

