
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GameEvent, StatAction } from '../../types';
import { STAT_LABELS } from '../../constants';
import { XIcon } from '../icons';
import { TrashIcon } from '../icons';
import { CheckIcon } from '../icons';

interface GameEventEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: GameEvent;
    onSave: (event: GameEvent, newPlayer: string, newAction: StatAction) => void;
    onDelete: (eventId: string) => void;
    playerNames: Record<string, string>;
    availablePlayers: string[];
}

const GameEventEditModal: React.FC<GameEventEditModalProps> = ({ 
    isOpen, 
    onClose, 
    event, 
    onSave, 
    onDelete, 
    playerNames, 
    availablePlayers 
}) => {
    const [selectedPlayer, setSelectedPlayer] = useState<string>(event.playerNumber);
    const [selectedAction, setSelectedAction] = useState<StatAction>(event.action);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    // Reset internal state when event changes or modal opens
    useEffect(() => {
        setSelectedPlayer(event.playerNumber);
        setSelectedAction(event.action);
        setIsConfirmingDelete(false);
    }, [event, isOpen]);

    // Lock body scroll and close on Escape
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

    const handleSave = () => {
        onSave(event, selectedPlayer, selectedAction);
        onClose();
    };

    const handleDeleteClick = () => {
        if (isConfirmingDelete) {
            onDelete(event.id);
            onClose();
        } else {
            setIsConfirmingDelete(true);
        }
    };

    const allPlayers = ['Equipo', ...availablePlayers];

    const modalContent = (
        <div
            className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-[90] p-4 animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-event-modal-title"
            onClick={onClose}
        >
            <div
                className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-700 overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900">
                    <h2 id="edit-event-modal-title" className="text-xl font-bold text-cyan-400">Editar Evento</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
                        aria-label="Cerrar"
                    >
                        <XIcon />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar bg-slate-900">
                    
                    {/* Player Selector */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Jugador</label>
                        <select
                            value={selectedPlayer}
                            onChange={(e) => setSelectedPlayer(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none"
                        >
                            {allPlayers.map(p => (
                                <option key={p} value={p}>
                                    {playerNames[p] || (p === 'Equipo' ? 'Equipo' : `#${p}`)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Action Selector */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Acción</label>
                        <select
                            value={selectedAction}
                            onChange={(e) => setSelectedAction(e.target.value as StatAction)}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none"
                        >
                            {Object.entries(STAT_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={handleDeleteClick}
                            onMouseLeave={() => isConfirmingDelete && setIsConfirmingDelete(false)}
                            className={`flex-1 min-h-[44px] flex items-center justify-center gap-2 border font-bold py-3 px-4 rounded-lg transition-all duration-200 ${
                                isConfirmingDelete 
                                ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' 
                                : 'bg-red-900/30 text-red-400 border-red-900/50 hover:bg-red-900/50'
                            }`}
                        >
                            <TrashIcon className="h-5 w-5" />
                            {isConfirmingDelete ? '¿Seguro?' : 'Eliminar'}
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="flex-[2] min-h-[44px] flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg"
                        >
                            <CheckIcon className="h-5 w-5" />
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

export default GameEventEditModal;
