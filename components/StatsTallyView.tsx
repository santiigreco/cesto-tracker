import React from 'react';
import { GamePeriod, TallyStats, StatAction, TallyStatsPeriod } from '../types';
import PlayerTallyCard from './PlayerTallyCard';

const StatsTallyView: React.FC<{
    players: string[];
    playerNames: Record<string, string>;
    tallyStats: Record<string, TallyStats>;
    currentPeriod: GamePeriod;
    onUpdate: (playerNumber: string, stat: StatAction, change: 1 | -1) => void;
    editingPlayer: string | null;
    tempPlayerName: string;
    setTempPlayerName: (name: string) => void;
    onStartEdit: (player: string) => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
}> = ({ players, playerNames, tallyStats, currentPeriod, onUpdate, editingPlayer, tempPlayerName, setTempPlayerName, onStartEdit, onSaveEdit, onCancelEdit }) => {
    
    const initialPlayerTally: TallyStats = {
        'First Half': { goles: 0, fallos: 0, recuperos: 0, perdidas: 0, reboteOfensivo: 0, reboteDefensivo: 0, asistencias: 0, golesContra: 0, faltasPersonales: 0 },
        'Second Half': { goles: 0, fallos: 0, recuperos: 0, perdidas: 0, reboteOfensivo: 0, reboteDefensivo: 0, asistencias: 0, golesContra: 0, faltasPersonales: 0 },
    };

    return (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 pb-28">
            {players.map(player => (
                <PlayerTallyCard
                    key={player}
                    playerNumber={player}
                    playerName={playerNames[player]}
                    isEditing={editingPlayer === player}
                    tempPlayerName={tempPlayerName}
                    setTempPlayerName={setTempPlayerName}
                    onStartEdit={onStartEdit}
                    onSaveEdit={onSaveEdit}
                    onCancelEdit={onCancelEdit}
                    playerTally={(tallyStats[player] || initialPlayerTally)[currentPeriod]}
                    onUpdate={onUpdate}
                />
            ))}
        </div>
    );
};

export default StatsTallyView;
