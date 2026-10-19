import React, { Suspense, lazy, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HomePage from '@/components/views/HomePage';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useGameContext } from '../context/GameContext';
import { useProfile } from '../hooks/useProfile';

const LoadGameModal = lazy(() => import('@/components/modals/LoadGameModal'));

export default function HomeRoute() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { modals, openModal, closeModal, openAuthModal } = useUI();
    const { resetGame } = useGameContext();

    const handleStartApp = useCallback((teamName?: string, roster?: any[]) => {
        // Clear previous state before starting new game
        resetGame();
        // Set initial data and navigate to setup
        navigate('/setup', { state: { teamName, roster } });
    }, [resetGame, navigate]);

    const handleLoadGame = useCallback((id: string, asOwner: boolean = false) => {
        navigate(`/match/${id}${asOwner ? '?edit=true' : ''}`);
    }, [navigate]);

    const { profile } = useProfile();
    const isOwner = user && profile?.is_admin === true;
    const canAccessAdmin = isOwner || profile?.permission_role === 'admin';

    const handleLogin = useCallback(() => {
        openAuthModal({ initialMode: 'login' });
    }, [openAuthModal]);

    const handleOpenLoadGame = useCallback(() => {
        openModal('loadGame');
    }, [openModal]);

    return (
        <>
            <HomePage
                onStart={handleStartApp}
                onLoadGameClick={handleOpenLoadGame}
                user={user}
                onLogin={handleLogin}
                onLoadGame={handleLoadGame}
                canAccessAdmin={!!canAccessAdmin}
            />
            {modals.loadGame?.isOpen && (
                <Suspense fallback={null}>
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
                </Suspense>
            )}
        </>
    );
}
