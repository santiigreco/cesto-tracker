import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PlayerSetup from '../components/PlayerSetup';
import { useGameContext } from '../context/GameContext';
import { useGameLogic } from '../hooks/useGameLogic';
import { Settings, GameMode, RosterPlayer } from '../types';

export default function SetupRoute() {
    const navigate = useNavigate();
    const location = useLocation();
    const { gameState } = useGameContext();
    const { handleSetupComplete } = useGameLogic();
    const state = location.state as any;

    const initialPlayers = state?.roster ? state.roster.map((p: RosterPlayer) => p.number) : gameState.availablePlayers;
    const initialNames = state?.roster ? state.roster.reduce((acc: Record<string, string>, p: RosterPlayer) => ({ ...acc, [p.number]: p.name }), {}) : undefined;

    const onSetupCompleteWrapper = (players: string[], settings: Settings, mode: GameMode, names: Record<string, string>) => {
        handleSetupComplete(players, settings, mode, names);
        navigate('/match/new', { replace: true });
    };

    return (
        <PlayerSetup
            onSetupComplete={onSetupCompleteWrapper}
            onBack={() => navigate('/')}
            initialSelectedPlayers={initialPlayers}
            initialSettings={{ ...gameState.settings, myTeam: state?.teamName || gameState.settings.myTeam }}
            initialGameMode={gameState.gameMode || 'stats-tally'}
            initialPlayerNames={initialNames}
        />
    );
}
