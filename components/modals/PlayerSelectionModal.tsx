
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { XIcon } from '../icons';

interface PlayerSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectPlayer: (playerNumber: string) => void;
    onAddPlayer?: (playerNumber: string, playerName?: string) => string | null;
    players: string[];
    playerNames: Record<string, string>;
    actionLabel: string;
    playerStatuses?: Record<string, string[]>;
    recentCount?: number;
}

const PlayerSelectionModal: React.FC<PlayerSelectionModalProps> = ({ 
    isOpen, 
    onClose, 
    onSelectPlayer, 
    onAddPlayer,
    players, 
    playerNames, 
    actionLabel,
    playerStatuses = {},
    recentCount = 0
}) => {
    const [isAddingCustom, setIsAddingCustom] = useState(false);
    const [customNumber, setCustomNumber] = useState('');
    const [customName, setCustomName] = useState('');
    const [customError, setCustomError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setIsAddingCustom(false);
            setCustomNumber('');
            setCustomName('');
            setCustomError(null);
        }
    }, [isOpen]);
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

    const handlePlayerClick = (playerNumber: string) => {
        onSelectPlayer(playerNumber);
    };

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!onAddPlayer) return;

        const parsed = parseInt(customNumber.trim(), 10);
        if (isNaN(parsed) || parsed < 1 || parsed > 99) {
            setCustomError('Ingresá un dorsal del 1 al 99');
            return;
        }

        const addedKey = onAddPlayer(String(parsed), customName.trim() || undefined);
        if (!addedKey) {
            setCustomError('Ingresá un dorsal del 1 al 99');
            return;
        }

        setIsAddingCustom(false);
        setCustomNumber('');
        setCustomName('');
        setCustomError(null);
        onSelectPlayer(addedKey);
    };

    const recentPlayers = players.slice(0, recentCount);
    const otherPlayers = players.slice(recentCount);

    const modalContent = (
        <div
            className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-[90] p-4 animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="player-selection-modal-title"
            onClick={onClose}
        >
            <div
                className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900 flex-shrink-0">
                    <h2 id="player-selection-modal-title" className="text-xl font-bold text-cyan-400">Asignar <span className="text-white">{actionLabel}</span> a:</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
                        aria-label="Cerrar"
                    >
                        <XIcon />
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto custom-scrollbar p-4 bg-slate-900">
                    <div className="space-y-6">
                        
                        {/* SECTION 1: "Jugadores" (Recientes del partido) */}
                        {recentPlayers.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Jugadores</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {recentPlayers.map(player => (
                                        <PlayerButton 
                                            key={player}
                                            player={player}
                                            name={playerNames[player]}
                                            statuses={playerStatuses[player] || []}
                                            onClick={() => handlePlayerClick(player)}
                                            isRecent={true}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Divider */}
                        {recentPlayers.length > 0 && otherPlayers.length > 0 && (
                            <hr className="border-slate-700" />
                        )}

                        {/* SECTION 2: Resto del plantel */}
                        {otherPlayers.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Alternativos</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {otherPlayers.map(player => (
                                        <PlayerButton 
                                            key={player}
                                            player={player}
                                            name={playerNames[player]}
                                            statuses={playerStatuses[player] || []}
                                            onClick={() => handlePlayerClick(player)}
                                            isRecent={false}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sticky Footer: Add custom dorsal (16-99) */}
                {onAddPlayer && (
                    <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900 flex-shrink-0">
                        {!isAddingCustom ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsAddingCustom(true);
                                    setCustomError(null);
                                }}
                                className="w-full min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 border border-dashed border-cyan-500/40 text-cyan-300 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <span>+</span>
                                <span>Otro dorsal (16–99)</span>
                            </button>
                        ) : (
                            <form onSubmit={handleCustomSubmit} className="space-y-2.5">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        min={1}
                                        max={99}
                                        autoFocus
                                        value={customNumber}
                                        onChange={(e) => {
                                            setCustomNumber(e.target.value.slice(0, 2));
                                            if (customError) setCustomError(null);
                                        }}
                                        placeholder="N°"
                                        aria-label="Número de dorsal"
                                        className="w-full sm:w-24 bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-base font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                    <input
                                        type="text"
                                        maxLength={30}
                                        value={customName}
                                        onChange={(e) => setCustomName(e.target.value)}
                                        placeholder="Nombre (opcional)"
                                        aria-label="Nombre de jugadora opcional"
                                        className="flex-1 min-w-0 bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-base font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                                {customError && (
                                    <p className="text-xs text-red-400 font-medium px-1">{customError}</p>
                                )}
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="flex-1 min-h-[44px] rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-colors"
                                    >
                                        Agregar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAddingCustom(false);
                                            setCustomError(null);
                                        }}
                                        className="px-4 min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm border border-slate-700 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

const PlayerButton: React.FC<{
    player: string;
    name?: string;
    statuses: string[];
    onClick: () => void;
    isRecent: boolean;
}> = ({ player, name, statuses, onClick }) => {
    const foulHighlightClass = statuses.includes('🛑')
        ? 'border-2 border-red-500 bg-red-950/70'
        : statuses.includes('⚠️')
            ? 'border-2 border-amber-500 bg-amber-950/40'
            : 'bg-slate-800 hover:bg-slate-700 border border-slate-700';

    return (
        <button
            type="button"
            onClick={onClick}
            className={`p-4 min-h-[60px] rounded-xl text-white font-bold text-lg transition-colors text-center truncate relative ${foulHighlightClass}`}
        >
            <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                    <span>{player === 'Equipo' ? 'Equipo' : `#${player}`}</span>
                    {statuses.length > 0 && (
                        <span className="text-sm">
                            {statuses.join('')}
                        </span>
                    )}
                </div>
                {name && player !== 'Equipo' && (
                    <div className="text-[10px] text-slate-400 font-normal uppercase truncate max-w-full">
                        {name}
                    </div>
                )}
            </div>
        </button>
    );
};

export default PlayerSelectionModal;
