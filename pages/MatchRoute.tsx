import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { useGameContext } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useGameLogic } from '../hooks/useGameLogic';
import AppHeader from '@/components/ui/AppHeader';
import BottomNavigation from '@/components/ui/BottomNavigation';
import GameMainContent from '@/components/game/GameMainContent';
import AppModals from '@/components/ui/AppModals';
import Loader from '@/components/ui/Loader';
import Scoreboard from '@/components/game/Scoreboard';
import { GameEvent, StatAction, AppTab, GamePeriod } from '../types';
import { STAT_LABELS } from '../constants';
import { useProfile } from '../hooks/useProfile';
import { useSync } from '../context/SyncContext';
import { isLocalGameId } from '../utils/localGamesStorage';
import { hasCompleteMatchMetadata } from '../utils/matchMetadata';
import {
    AlertTriangleIcon,
    PencilIcon,
    ShareIcon,
    SmartphoneIcon,
    WifiOffIcon,
} from '@/components/icons';

const TAB_TRANSLATIONS: Record<AppTab, string> = {
    tally: 'Planilla',
    statistics: 'Estadísticas'
};

export default function MatchRoute() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const isEditRequested = searchParams.get('edit') === 'true';
    const navigate = useNavigate();
    const { gameState, setGameState } = useGameContext();
    const { user, authLoading } = useAuth();
    const {
        activeTab, setActiveTab, openModal,
        actionToAssign, setActionToAssign, openAuthModal
    } = useUI();
    const { profile } = useProfile();
    const isAdmin = profile?.is_admin === true || profile?.permission_role === 'admin';

    const {
        handleLoadGame,
        isLoading: syncLoading,
        lastSaved,
        handleSyncToSupabase,
        isAutoSaving,
        syncState,
        isOnline,
        hasUnsavedChanges
    } = useSync();

    const {
        handleUndoTally, handleRedoTally
    } = useGameLogic();

    const [editingEvent, setEditingEvent] = useState<GameEvent | null>(null);
    const [isCorrectionsVisible, setIsCorrectionsVisible] = useState(false);

    // If there is no userId assigned yet, the logged in user creating this match is the owner
    const isGameOwner = Boolean(user && (!gameState.userId || gameState.userId === user.id));
    const canEditCurrentMatch =
        isGameOwner ||
        Boolean(id && isLocalGameId(id) && gameState.localId === id) ||
        Boolean(!gameState.gameId && gameState.localId);

    useEffect(() => {
        if (id && id !== 'new') {
            const matchesCurrentGame = isLocalGameId(id)
                ? gameState.localId === id
                : gameState.gameId === id;

            if (!matchesCurrentGame) {
                const enableEditing = isEditRequested;
                handleLoadGame(id, enableEditing).then((res) => {
                    if (res) {
                        if (enableEditing) {
                            setActiveTab('tally');
                        } else {
                            setActiveTab('statistics');
                        }
                    } else {
                        // Game not found or failed to load: redirect gracefully
                        navigate('/', { replace: true });
                    }
                });
            } else if (isEditRequested && canEditCurrentMatch && gameState.isReadOnly) {
                setGameState(prev => ({ ...prev, isReadOnly: false }));
                setActiveTab('tally');
            }
        }
    }, [id, gameState.gameId, gameState.localId, gameState.isReadOnly, isEditRequested, canEditCurrentMatch, handleLoadGame, setGameState, setActiveTab, navigate]);

    useEffect(() => {
        if ((id === 'new' || isLocalGameId(id)) && gameState.gameId && !gameState.isReadOnly) {
            navigate(`/match/${gameState.gameId}?edit=true`, { replace: true });
        }
    }, [id, gameState.gameId, gameState.isReadOnly, navigate]);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, [activeTab]);

    const tabsForCurrentMode = useMemo(() => ['tally', 'statistics'] as AppTab[], []);

    useEffect(() => {
        if (!tabsForCurrentMode.includes(activeTab)) {
            setActiveTab('tally');
        }
    }, [tabsForCurrentMode, activeTab, setActiveTab]);

    const handleLogin = useCallback(() => {
        openAuthModal({ initialMode: 'login' });
    }, [openAuthModal]);

    const handleOpenProfile = useCallback(() => {
        navigate('/perfil');
    }, [navigate]);

    const handleOpenSettings = useCallback(() => {
        openModal('settings');
    }, [openModal]);

    const handleOpenMobileMenu = useCallback(() => {
        openModal('mobileMenu');
    }, [openModal]);

    const handleRequestReturnHome = useCallback(() => {
        openModal('returnHome');
    }, [openModal]);

    const hasMissingMetadata = !hasCompleteMatchMetadata(gameState.settings);

    const handleEditMetadata = useCallback(() => {
        openModal('matchMetadata', { intent: 'edit' });
    }, [openModal]);

    const handleManualSave = useCallback(() => {
        if (!gameState.isReadOnly && hasMissingMetadata) {
            openModal('matchMetadata', { intent: 'save' });
            return;
        }
        handleSyncToSupabase(false);
    }, [gameState.isReadOnly, hasMissingMetadata, openModal, handleSyncToSupabase]);

    const handlePeriodChange = useCallback((p: GamePeriod) => {
        setGameState(prev => ({ ...prev, currentPeriod: p }));
    }, [setGameState]);

    const handleActionSelect = useCallback((a: StatAction) => {
        setActionToAssign(a);
        openModal('playerSelection');
    }, [setActionToAssign, openModal]);

    const handleOpenShareModal = useCallback(() => {
        if (!gameState.isReadOnly && hasMissingMetadata) {
            openModal('matchMetadata', { intent: 'share' });
            return;
        }
        openModal('share');
    }, [gameState.isReadOnly, hasMissingMetadata, openModal]);

    if (authLoading || syncLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-surface-canvas">
                <Loader />
                <p className="text-ink-muted mt-4 text-sm font-medium">Cargando partido...</p>
            </div>
        );
    }

    if (!gameState.isSetupComplete && id === 'new') {
        return <Navigate to="/setup" replace />;
    }

    const actionLabel = actionToAssign ? STAT_LABELS[actionToAssign] : '';

    return (
        <div className="min-h-screen bg-surface-canvas text-ink-primary flex flex-col items-center px-3 sm:px-6 md:px-8 pt-2 sm:pt-4 pb-24 md:pb-8 font-sans overflow-x-hidden selection:bg-brand/25 selection:text-ink-primary relative">

            <AppHeader
                user={user}
                userAvatarUrl={profile?.avatar_url}
                userInitial={profile?.full_name?.charAt(0)}
                onLogin={handleLogin}
                onOpenProfile={handleOpenProfile}
                onOpenSettings={handleOpenSettings}
                onOpenMobileMenu={handleOpenMobileMenu}
                onRequestReturnHome={handleRequestReturnHome}
                onSave={handleManualSave}
                isAutoSaving={isAutoSaving}
                lastSaved={lastSaved}
                gameId={gameState.gameId}
                gameName={gameState.settings.gameName}
                myTeam={gameState.settings.myTeam}
                currentPeriod={gameState.currentPeriod}
                onPeriodChange={handlePeriodChange}
                isReadOnly={gameState.isReadOnly}
                isSetupComplete={gameState.isSetupComplete}
                gameMode={gameState.gameMode}
                activeTab={activeTab}
                isAdmin={isAdmin}
                syncStatus={syncState.status}
                hasUnsavedChanges={hasUnsavedChanges}
                isOnline={isOnline}
                hasMissingMetadata={hasMissingMetadata}
                onEditMetadata={handleEditMetadata}
            />

            {/* Sync Cloud Bar Indicator for Logged-in Owners (Displayed on error or offline) */}
            {user && isGameOwner && (!isOnline || syncState.status === 'error') && (
                <div className={`w-full max-w-4xl flex items-center justify-between gap-2 text-xs px-3 py-2 mb-2.5 rounded-xl border ${
                    !isOnline
                        ? 'bg-sport-warn/10 border-sport-warn/35 text-sport-warn-light'
                        : 'bg-sport-miss/10 border-sport-miss/35 text-sport-miss-light'
                }`}>
                    <div className="flex items-center gap-2 min-w-0">
                        {!isOnline ? (
                            <WifiOffIcon className="h-4 w-4 shrink-0" />
                        ) : (
                            <AlertTriangleIcon className="h-4 w-4 shrink-0" />
                        )}
                        <span className="font-medium truncate">
                            {!isOnline
                                ? 'Sin conexión a internet. Los datos se guardan en este dispositivo.'
                                : `Error al sincronizar: ${syncState.message}`}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={handleManualSave}
                        disabled={!isOnline}
                        className={`shrink-0 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg transition-colors ${
                            !isOnline
                                ? 'text-ink-muted cursor-not-allowed'
                                : 'bg-sport-miss/20 hover:bg-sport-miss/30 text-sport-miss-light'
                        }`}
                    >
                        {!isOnline ? 'Offline' : 'Reintentar'}
                    </button>
                </div>
            )}

            {/* Offline/Anonymous Notice for Non-logged Users */}
            {!user && (
                <div className="w-full max-w-4xl flex items-center justify-between gap-2 text-xs px-3 py-2 mb-2.5 bg-surface-card rounded-xl border border-sport-warn/30 text-ink-secondary">
                    <div className="flex items-center gap-2 min-w-0">
                        <SmartphoneIcon className="h-4 w-4 text-sport-warn-light shrink-0" />
                        <span className="leading-snug">
                            <strong className="text-ink-primary">Modo local:</strong> Se guarda en este dispositivo. Iniciá sesión para respaldar en la nube.
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={handleLogin}
                        className="shrink-0 min-h-[36px] px-2.5 text-brand hover:text-brand-hover font-bold whitespace-nowrap rounded-lg hover:bg-surface-elevated transition-colors"
                    >
                        Ingresar
                    </button>
                </div>
            )}

            <div className="w-full max-w-4xl flex flex-col flex-grow">
                <Scoreboard />

                {/* Read-Only Resume Action */}
                {canEditCurrentMatch && gameState.isReadOnly && (
                    <div className="flex justify-end mb-3">
                        <button
                            type="button"
                            onClick={() => {
                                setGameState(prev => ({ ...prev, isReadOnly: false }));
                                setActiveTab('tally');
                                if (id && id !== 'new') {
                                    navigate(`/match/${id}?edit=true`, { replace: true });
                                }
                            }}
                            className="flex items-center gap-1.5 px-4 min-h-[44px] rounded-xl text-xs font-extrabold uppercase tracking-wider transition-colors bg-brand hover:bg-brand-hover text-ink-inverse shadow-card active:scale-[0.98]"
                        >
                            <PencilIcon className="h-4 w-4" />
                            <span>Continuar anotando</span>
                        </button>
                    </div>
                )}

                <div
                    role="tablist"
                    aria-label="Vistas del partido"
                    className="hidden md:grid grid-cols-2 mb-5 p-1 border border-border-subtle bg-surface-card rounded-xl gap-1"
                >
                    {tabsForCurrentMode.map(tab => (
                        <button
                            key={tab}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative z-20 flex items-center justify-center min-h-[44px] px-5 py-2 text-sm font-bold rounded-lg transition-colors ${
                                activeTab === tab
                                    ? 'bg-surface-elevated text-ink-primary border border-border-strong shadow-card'
                                    : 'text-ink-muted hover:text-ink-primary border border-transparent'
                            }`}
                        >
                            {TAB_TRANSLATIONS[tab]}
                        </button>
                    ))}
                </div>

                <GameMainContent
                    activeTab={activeTab}
                    isReadOnly={gameState.isReadOnly}
                    onActionSelect={handleActionSelect}
                    handleUndoTally={handleUndoTally}
                    handleRedoTally={handleRedoTally}
                    gameLog={gameState.gameLog}
                    tallyRedoLog={gameState.tallyRedoLog || []}
                    isCorrectionsVisible={isCorrectionsVisible}
                    setIsCorrectionsVisible={setIsCorrectionsVisible}
                    playerNames={gameState.playerNames}
                    setEditingEvent={setEditingEvent}
                    setIsShareModalOpen={handleOpenShareModal}
                />
            </div>

            <footer className="w-full text-center text-ink-muted text-xs mt-8 pb-4">Santiago Greco - Gresolutions © 2026</footer>

            <BottomNavigation activeTab={activeTab} onSelectTab={setActiveTab} gameMode={gameState.gameMode} />

            {/* Floating Report Action — visible in tally tab */}
            {activeTab !== 'statistics' && (
                <button
                    type="button"
                    onClick={handleOpenShareModal}
                    className="fixed bottom-[76px] right-3 md:bottom-6 md:right-6 z-30 flex items-center gap-2 bg-surface-elevated hover:bg-surface-hover text-ink-primary font-bold text-xs uppercase tracking-wider px-4 min-h-[44px] rounded-xl shadow-sticky transition-all active:scale-[0.97] border border-brand/40 touch-manipulation"
                    title="Compartir reporte del partido"
                    aria-label="Compartir reporte del partido"
                >
                    <ShareIcon className="h-4 w-4 text-brand" />
                    <span>Reporte</span>
                </button>
            )}

            <AppModals
                tabTranslations={TAB_TRANSLATIONS}
                tabs={tabsForCurrentMode}
                playersForTally={gameState.availablePlayers}
                actionLabel={actionLabel}
                editingEvent={editingEvent}
                setEditingEvent={setEditingEvent}
            />
        </div>
    );
}
