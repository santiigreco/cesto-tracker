import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
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
    useEffect(() => {
        if (!isOpen || typeof document === 'undefined') return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = prevOverflow;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const modalContent = (
        <div
            className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-[90] p-4 animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tournament-selector-modal-title"
            onClick={onClose}
        >
             <div
                className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-slate-700 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
             >
                <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900 flex-shrink-0">
                    <h2 id="tournament-selector-modal-title" className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                        <TrophyIcon rank={1} /> Seleccionar Torneo
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
                        aria-label="Cerrar"
                    >
                        <XIcon />
                    </button>
                </div>
                
                <div className="p-4 flex-grow overflow-y-auto custom-scrollbar flex flex-col space-y-2 bg-slate-900">
                    {TOURNAMENTS_CONFIG.map(name => (
                        <button
                            type="button"
                            key={name}
                            onClick={() => { onSelectTournament(name, name); onClose(); }} // Using name as ID since it's hardcoded
                            className={`w-full text-left p-4 rounded-xl border transition-all ${
                                currentTournamentId === name 
                                ? 'bg-cyan-950 border-cyan-500 text-cyan-300' 
                                : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white'
                            }`}
                        >
                            <span className="font-bold">{name}</span>
                        </button>
                    ))}
                </div>
             </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

export default TournamentSelectorModal;

