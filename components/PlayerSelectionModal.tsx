
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[120] p-4 transition-all">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-800/50 shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-white italic tracking-tight">Asignar <span className="text-cyan-400 uppercase">{actionLabel}</span></h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Seleccioná un jugador</p>
                    </div>
                    <button onClick={onClose} className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition-all active:scale-95 shadow-lg border border-slate-700/50" aria-label="Cerrar">
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto custom-scrollbar p-5">
                    <div className="space-y-6">
                        
                        {/* Section 1: Recent / Frequent */}
                        {recentPlayers.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50"></span>
                                    Recientes / Juego
                                </h3>
                                <div className="grid grid-cols-2 xs:grid-cols-3 gap-3">
                                    {recentPlayers.map(player => (
                                        <PlayerCard 
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

                        {/* Divider if both sections exist */}
                        {recentPlayers.length > 0 && otherPlayers.length > 0 && (
                            <hr className="border-slate-800/50 mx-2" />
                        )}

                        {/* Section 2: Rest of Team */}
                        {otherPlayers.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] px-1">Resto del Equipo</h3>
                                <div className="grid grid-cols-3 xs:grid-cols-4 gap-2">
                                    {otherPlayers.map(player => (
                                        <PlayerCard 
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

interface PlayerCardProps {
    player: string;
    name?: string;
    statuses: string[];
    onClick: () => void;
    isRecent: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, name, statuses, onClick, isRecent }) => {
    return (
        <button
            onClick={onClick}
            className={`
                relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl transition-all duration-200 active:scale-95 shadow-lg group
                ${isRecent 
                    ? 'bg-slate-800 border-2 border-slate-700 hover:border-cyan-500/50 hover:bg-slate-700/80 ring-offset-slate-900' 
                    : 'bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800'
                }
            `}
        >
            {/* Player Number Label */}
            <span className={`
                font-black leading-none tracking-tight mb-1 transition-colors
                ${isRecent ? 'text-2xl text-white' : 'text-lg text-slate-400'}
                ${statuses.includes('⚠️') ? 'text-red-500' : ''}
            `}>
                {player === 'Equipo' ? 'EQ' : player}
            </span>

            {/* Player Name */}
            {isRecent && (
                <span className="text-[10px] sm:text-xs text-slate-400 font-bold truncate w-full max-w-[80px] text-center opacity-80 group-hover:opacity-100">
                    {player === 'Equipo' ? 'Colectivo' : (name || '-')}
                </span>
            )}

            {/* Indicators / Badges */}
            {statuses.length > 0 && (
                <div className="absolute -top-2 -right-1 flex gap-0.5">
                    {statuses.map((s, i) => (
                        <span key={i} className="text-sm drop-shadow-md animate-in slide-in-from-bottom-1 duration-300">
                            {s}
                        </span>
                    ))}
                </div>
            )}

            {/* Special styling for fouls indicator */}
            {statuses.includes('⚠️') && (
                <div className="absolute inset-0 rounded-2xl border-2 border-red-500/30 animate-pulse pointer-events-none"></div>
            )}
        </button>
    );
};

export default PlayerSelectionModal;
