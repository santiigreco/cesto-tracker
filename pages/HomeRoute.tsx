import React from 'react';
import { useNavigate } from 'react-router-dom';
import HomePage from '../components/HomePage';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useGameContext } from '../context/GameContext';

export default function HomeRoute() {
    const navigate = useNavigate();
    const { user, handleLogin } = useAuth();
    const { openModal } = useUI();
    const { setGameState, resetGame } = useGameContext();

    const handleStartApp = (teamName?: string, roster?: any[]) => {
        // Clear previous state before starting new game
        resetGame();
        // Set initial data and navigate to setup
        navigate('/setup', { state: { teamName, roster } });
    };

    const handleLoadGame = (id: string, asOwner: boolean) => {
        navigate(`/match/${id}`);
    };

    return (
        <HomePage
            onStart={handleStartApp}
            onLoadGameClick={() => openModal('loadGame')}
            onManageTeamsClick={() => openModal('teamManager')}
            user={user}
            onLogin={handleLogin}
            onLoadGame={handleLoadGame}
        />
    );
}
