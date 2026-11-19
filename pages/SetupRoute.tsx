import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PlayerSetup from '@/components/game/PlayerSetup';
import { useGameContext, initialGameState } from '../context/GameContext';
import { useUI } from '../context/UIContext';
import { useGameLogic } from '../hooks/useGameLogic';
import { Settings, GameMode, RosterPlayer } from '../types';
import { useProfile } from '../hooks/useProfile';

interface SetupLocationState {
    mode?: 'new' | 'edit';
    teamName?: string;
    rivalName?: string;
    tournamentName?: string;
    categoryName?: string;
    roster?: RosterPlayer[];
}

export default function SetupRoute() {
    const navigate = useNavigate();
    const location = useLocation();
    const { gameState } = useGameContext();
    const { setActiveTab } = useUI();
    const { handleSetupComplete } = useGameLogic();
    const { profile } = useProfile();
    const state = (location.state as SetupLocationState | null) || null;

    const isEditMode = state?.mode === 'edit' && gameState.isSetupComplete;

    const initialPlayers = isEditMode
        ? gameState.availablePlayers
        : state?.roster
            ? state.roster.map((p: RosterPlayer) => p.number)
            : [];

    const initialNames = isEditMode
        ? gameState.playerNames
        : state?.roster
            ? state.roster.reduce((acc: Record<string, string>, p: RosterPlayer) => ({ ...acc, [p.number]: p.name }), {})
            : {};

    const initialSettings: Settings = isEditMode
        ? gameState.settings
        : {
            ...initialGameState.settings,
            myTeam: state?.teamName || profile?.favorite_club || '',
            gameName: state?.rivalName || '',
            tournamentName: state?.tournamentName || initialGameState.settings.tournamentName,
            categoryName: state?.categoryName || 'Primera A',
            gameDate: new Date().toISOString().split('T')[0],
        };

    const onSetupCompleteWrapper = (players: string[], settings: Settings, mode: GameMode, names: Record<string, string>) => {
        handleSetupComplete(players, settings, mode, names, isEditMode);
        if (!isEditMode) {
            setActiveTab('tally');
        }
        const targetPath = isEditMode && gameState.gameId
            ? `/match/${gameState.gameId}?edit=true`
            : '/match/new';
        navigate(targetPath, { replace: true });
    };

    const handleBack = () => {
        if (isEditMode) {
            navigate(gameState.gameId ? `/match/${gameState.gameId}?edit=true` : '/match/new');
        } else {
            navigate('/');
        }
    };

    return (
        <PlayerSetup
            onSetupComplete={onSetupCompleteWrapper}
            onBack={handleBack}
            initialSelectedPlayers={initialPlayers}
            initialSettings={initialSettings}
            initialGameMode={gameState.gameMode || 'stats-tally'}
            initialPlayerNames={initialNames}
            isEditMode={isEditMode}
        />
    );
}
