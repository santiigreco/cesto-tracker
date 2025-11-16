import React from 'react';
import XIcon from './XIcon';

interface PlayerSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectPlayer: (playerNumber: string) => void;
    players: string[];
    playerNames: Record<string, string>;
    actionLabel: string;
}

const PlayerSelectionModal: React.FC<PlayerSelectionModalProps> = ({ isOpen, onClose, onSelectPlayer, players, playerNames, actionLabel }) => {
    if (!isOpen) return null;

    const handlePlayerClick = (playerNumber: string) => {
        onSelectPlayer(playerNumber);
    };

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
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {players.map(player => (
                            <button
                                key={player}
                                onClick={() => handlePlayerClick(player)}
                                className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold text-lg transition-colors text-center truncate"
                            >
                                {playerNames[player] || (player === 'Equipo' ? 'Equipo' : `#${player}`)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerSelectionModal;
