import React from 'react';
import { useNavigate } from 'react-router-dom';
import HomePage from '@/components/views/HomePage';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useGameContext } from '../context/GameContext';
import LoadGameModal from '@/components/modals/LoadGameModal';
import { useProfile } from '../hooks/useProfile';
import { useCommunityStats } from '../hooks/useCommunityStats';

export default function HomeRoute() {
    const navigate = useNavigate();
    const { user, handleLogin } = useAuth();
    const { modals, openModal, closeModal } = useUI();
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

    const communityStats = useCommunityStats();
    const { profile } = useProfile();
    const isOwner = user && profile?.is_admin === true;
    const canEditFixture = isOwner || profile?.permission_role === 'admin' || profile?.permission_role === 'fixture_manager';

    return (
        <>
            <HomePage
                onStart={handleStartApp}
                onLoadGameClick={() => openModal('loadGame')}
                user={user}
                onLogin={handleLogin}
                onLoadGame={handleLoadGame}
                canEditFixture={canEditFixture}
            />
            {modals.loadGame?.isOpen && (
                <LoadGameModal
                    isOpen={modals.loadGame?.isOpen}
                    onClose={() => closeModal('loadGame')}
                    onLoadGame={(id) => {
                        closeModal('loadGame');
                        handleLoadGame(id, false);
                    }}
                    user={user}
                />
            )}
        </>
    );
}
