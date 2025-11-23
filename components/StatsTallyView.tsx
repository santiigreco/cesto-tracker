import React, { useState, useMemo, useCallback } from 'react';
import { useGameContext } from '../context/GameContext';
import { useGameLogic } from '../hooks/useGameLogic';
import PlayerTallyCard from './PlayerTallyCard';
import { initialPlayerTally } from '../context/GameContext';

const StatsTallyView: React.FC = () => {
    const { gameState } = useGameContext();
    const { handleUpdateTallyStat, updatePlayerName } = useGameLogic();
    const { availablePlayers, playerNames, tallyStats, currentPeriod } = gameState;
    
    // Local state for name editing within this view
    const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
    const [tempPlayerName, setTempPlayerName] = useState('');

    const players = useMemo(() => ['Equipo', ...availablePlayers], [availablePlayers]);
    const isReadOnly = gameState.isReadOnly;

    const handleStartEditingName = useCallback((playerNumber: string) => {
        if (isReadOnly) return;
        setTempPlayerName(playerNames[playerNumber] || '');
        setEditingPlayer(playerNumber);
    }, [playerNames, isReadOnly]);

    const handleCancelEditingName = useCallback(() => {
        setEditingPlayer(null);
        setTempPlayerName('');
    }, []);

    const handleSavePlayerName = useCallback(() => {
        if (!editingPlayer) return;
        updatePlayerName(editingPlayer, tempPlayerName);
        setEditingPlayer(null);
        setTempPlayerName('');
    }, [editingPlayer, tempPlayerName, updatePlayerName]);

    return (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 pb-32">
            {players.map(player => (
                <PlayerTallyCard
                    key={player}
                    playerNumber={player}
                    playerName={playerNames[player]}
                    isEditing={editingPlayer === player}
                    tempPlayerName={tempPlayerName}
                    setTempPlayerName={setTempPlayerName}
                    onStartEdit={handleStartEditingName}
                    onSaveEdit={handleSavePlayerName}
                    onCancelEdit={handleCancelEditingName}
                    playerTally={(tallyStats[player] || initialPlayerTally)[currentPeriod]}
                    onUpdate={handleUpdateTallyStat}
                    isReadOnly={isReadOnly}
                />
            ))}
        </div>
    );
};

export default StatsTallyView;