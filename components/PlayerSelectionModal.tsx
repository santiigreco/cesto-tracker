
import React from 'react';
import { XIcon } from './icons';

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
    if (!isOpen) return null;

    const handlePlayerClick = (playerNumber: string) => {
        onSelectPlayer(playerNumber);
    };

    const recentPlayers = players.slice(0, recentCount);
    const otherPlayers = players.slice(recentCount);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-cyan-400">Asignar <span className="text-white">{actionLabel}</span> a:</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Cerrar">
                        <XIcon />
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto custom-scrollbar p-4">
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
};

const PlayerButton: React.FC<{
    player: string;
    name?: string;
    statuses: string[];
    onClick: () => void;
    isRecent: boolean;
}> = ({ player, name, statuses, onClick, isRecent }) => {
    return (
        <button
            onClick={onClick}
            className={`
                p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold text-lg transition-colors text-center truncate relative
                ${statuses.includes('⚠️') ? 'border-2 border-red-500 bg-red-900/20' : ''}
            `}
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
