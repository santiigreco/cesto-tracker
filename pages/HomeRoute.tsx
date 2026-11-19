import React, { Suspense, lazy, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import HomePage from '@/components/views/HomePage';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useGameContext } from '../context/GameContext';
import { useGameLogic } from '../hooks/useGameLogic';
import { useProfile } from '../hooks/useProfile';
import { listLocalGames, computeMyScoreFromTally } from '../utils/localGamesStorage';

const LoadGameModal = lazy(() => import('@/components/modals/LoadGameModal'));

export default function HomeRoute() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { modals, openModal, closeModal, openAuthModal, setActiveTab } = useUI();
    const { gameState, resetGame } = useGameContext();
    const { startQuickMatch } = useGameLogic();
    const { profile } = useProfile();

    const activeMatchSummary = useMemo(() => {
        if (!gameState.isSetupComplete || gameState.isReadOnly) return null;
        return {
            myTeam: gameState.settings.myTeam?.trim() || 'Mi Equipo',
            opponentName: gameState.settings.gameName?.trim() || 'Rival',
            myScore: computeMyScoreFromTally(gameState.tallyStats),
            opponentScore: gameState.opponentScore || 0,
        };
    }, [gameState]);

    const localGamesCount = useMemo(
        () => listLocalGames().length,
        [gameState.localId, gameState.isSetupComplete, gameState.gameLog.length, modals.loadGame?.isOpen]
    );

    const handleResumeActiveMatch = useCallback(() => {
        if (!gameState.isSetupComplete) return;
        setActiveTab('tally');
        const targetPath = gameState.gameId
            ? `/match/${gameState.gameId}?edit=true`
            : gameState.localId
                ? `/match/${gameState.localId}?edit=true`
                : '/match/new';
        navigate(targetPath);
    }, [gameState.isSetupComplete, gameState.gameId, gameState.localId, setActiveTab, navigate]);

    const handleInstantStart = useCallback(() => {
        startQuickMatch({
            teamName: profile?.favorite_club || undefined,
            useLastSetup: true,
        });
        navigate('/match/new');
    }, [startQuickMatch, profile?.favorite_club, navigate]);

    const handleConfigureSetup = useCallback(() => {
        resetGame();
        setActiveTab('tally');
        navigate('/setup', { state: { mode: 'new' } });
    }, [resetGame, setActiveTab, navigate]);

    const handleLoadGame = useCallback((id: string, asOwner: boolean = false) => {
        navigate(`/match/${id}${asOwner ? '?edit=true' : ''}`);
    }, [navigate]);

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
                onInstantStart={handleInstantStart}
                onConfigureSetup={handleConfigureSetup}
                onLoadGameClick={handleOpenLoadGame}
                user={user}
                onLogin={handleLogin}
                onLoadGame={handleLoadGame}
                canAccessAdmin={!!canAccessAdmin}
                activeMatchSummary={activeMatchSummary}
                localGamesCount={localGamesCount}
                onResumeActiveMatch={handleResumeActiveMatch}
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
