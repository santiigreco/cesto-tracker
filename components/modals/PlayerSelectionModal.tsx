
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XIcon } from '../icons';

interface PlayerSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectPlayer: (playerNumber: string) => void;
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
    players, 
    playerNames, 
    actionLabel,
    playerStatuses = {},
    recentCount = 0
}) => {
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
