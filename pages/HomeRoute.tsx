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
    const { user } = useAuth();
    const { modals, openModal, closeModal, openAuthModal } = useUI();
    const { setGameState, resetGame } = useGameContext();

    const handleStartApp = (teamName?: string, roster?: any[]) => {
        // Clear previous state before starting new game
        resetGame();
        // Set initial data and navigate to setup
        navigate('/setup', { state: { teamName, roster } });
    };

    const handleLoadGame = (id: string, asOwner: boolean = false) => {
        navigate(`/match/${id}${asOwner ? '?edit=true' : ''}`);
    };

    const communityStats = useCommunityStats();
    const { profile } = useProfile();
    const isOwner = user && profile?.is_admin === true;
    const canAccessAdmin = isOwner || profile?.permission_role === 'admin';

    const handleLogin = () => {
        openAuthModal({ initialMode: 'login' });
    };

    return (
        <>
            <HomePage
                onStart={handleStartApp}
                onLoadGameClick={() => openModal('loadGame')}
                user={user}
                onLogin={handleLogin}
                onLoadGame={handleLoadGame}
                canAccessAdmin={!!canAccessAdmin}
            />
            {modals.loadGame?.isOpen && (
                <LoadGameModal
                    isOpen={modals.loadGame?.isOpen}
                    onClose={() => closeModal('loadGame')}
                    onLoadGame={(id, editable) => {
                        closeModal('loadGame');
                        handleLoadGame(id, !!editable);
                    }}
                    user={user}
                    onLogin={handleLogin}
                />
            )}
        </>
    );
}
