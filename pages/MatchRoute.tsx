import React, { useEffect, useMemo, useState } from 'react';
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
import { GameEvent, StatAction, AppTab, SavedTeam } from '../types';
import { STAT_LABELS } from '../constants';
import { useProfile } from '../hooks/useProfile';
import { useSync } from '../context/SyncContext';

export default function MatchRoute() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const isEditRequested = searchParams.get('edit') === 'true';
    const navigate = useNavigate();
    const { gameState, setGameState } = useGameContext();
    const { user, authLoading, handleLogin } = useAuth();
    const {
        activeTab, setActiveTab, openModal, closeModal,
        actionToAssign, setActionToAssign
    } = useUI();
    const { profile } = useProfile();
    const isAdmin = profile?.is_admin === true || profile?.permission_role === 'admin';

    const { handleLoadGame, isLoading: syncLoading, lastSaved, handleSyncToSupabase, isAutoSaving, syncState } = useSync();

    const {
        updatePlayerName,
        handleUpdateTallyStat, handleUndoTally, handleRedoTally,
        handleDeleteGameEvent, handleEditGameEvent
    } = useGameLogic();

    const [editingEvent, setEditingEvent] = useState<GameEvent | null>(null);
    const [isCorrectionsVisible, setIsCorrectionsVisible] = useState(false);

    // If there is no userId assigned yet, the logged in user creating this match is the owner
    const isGameOwner = Boolean(user && (!gameState.userId || gameState.userId === user.id));

    useEffect(() => {
        if (id && id !== 'new') {
            if (gameState.gameId !== id) {
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
            }
        }
    }, [id, gameState.gameId, isEditRequested, handleLoadGame, setActiveTab, navigate]);

    const tabsForCurrentMode = useMemo(() => ['tally', 'statistics'] as const, []);

    useEffect(() => {
        if (!tabsForCurrentMode.includes(activeTab as any)) {
            setActiveTab('tally');
        }
    }, [tabsForCurrentMode, activeTab, setActiveTab]);

    const tabTranslations: Record<AppTab, string> = {
        tally: 'Planilla',
        statistics: 'Estadísticas'
    };

    if (authLoading || syncLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
                <Loader />
                <p className="text-slate-400 mt-4">Cargando partido...</p>
            </div>
        );
    }

    if (!gameState.isSetupComplete && id === 'new') {
        return <Navigate to="/setup" replace />;
    }

    const renderModalsProps = {
        tabTranslations,
        tabs: tabsForCurrentMode as any,
        playersForTally: gameState.availablePlayers,
        actionLabel: actionToAssign ? STAT_LABELS[actionToAssign as any] : '',
        editingEvent,
        setEditingEvent,
        handleTeamLoadedFromHome: (_team: SavedTeam) => { }
    };

    return (
        <div className="min-h-screen bg-[#0a0f18] text-slate-200 flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200 pb-24 md:pb-8 relative">

            {/* ── Background Glows ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
                <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-emerald-500/10 blur-[120px] rounded-full animate-float"></div>
                <div className="absolute top-[30%] right-[10%] w-[20%] h-[20%] bg-purple-500/5 blur-[100px] rounded-full"></div>
            </div>

            <AppHeader
                user={user}
                onLogin={handleLogin}
                onOpenProfile={() => openModal('profile')}
                onOpenSettings={() => openModal('settings')}
                onOpenMobileMenu={() => openModal('mobileMenu')}
                onRequestReturnHome={() => openModal('returnHome')}
                onSave={() => handleSyncToSupabase(false)}
                isAutoSaving={isAutoSaving}
                lastSaved={lastSaved}
                gameId={gameState.gameId}
                gameName={gameState.settings.gameName}
                myTeam={gameState.settings.myTeam}
                currentPeriod={gameState.currentPeriod}
                onPeriodChange={(p) => setGameState(prev => ({ ...prev, currentPeriod: p }))}
                isReadOnly={gameState.isReadOnly}
                isSetupComplete={gameState.isSetupComplete}
                gameMode={gameState.gameMode}
                activeTab={activeTab}
                isAdmin={isAdmin}
            />

            {/* Sync Cloud Bar Indicator for Logged-in Owners */}
            {user && isGameOwner && (
                <div className={`w-full max-w-4xl flex items-center justify-between text-xs px-3 py-1.5 mb-2 rounded border transition-colors ${
                    syncState.status === 'error'
                        ? 'bg-red-950/40 border-red-800/60'
                        : 'bg-slate-800/40 border-slate-700/50'
                }`}>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                syncState.status === 'error' ? 'bg-red-400' : isAutoSaving ? 'bg-amber-400' : 'bg-emerald-400'
                            }`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${
                                syncState.status === 'error' ? 'bg-red-500' : isAutoSaving ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}></span>
                        </span>
                        <span className={`font-medium ${syncState.status === 'error' ? 'text-red-300' : 'text-slate-300'}`}>
                            {syncState.status === 'error'
                                ? `Error al sincronizar: ${syncState.message}`
                                : isAutoSaving
                                    ? 'Guardando cambios en la nube...'
                                    : lastSaved
                                        ? `Sincronizado en la nube: ${lastSaved.toLocaleTimeString('es-AR')}`
                                        : 'En la nube (Autoguardado activo)'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {syncState.status === 'error' ? (
                            <button
                                onClick={() => handleSyncToSupabase(false)}
                                className="text-red-400 hover:text-red-300 font-black uppercase text-[10px] tracking-wider transition-colors underline"
                            >
                                Reintentar
                            </button>
                        ) : !isAutoSaving ? (
                            <button
                                onClick={() => handleSyncToSupabase(false)}
                                className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
                            >
                                Guardar ahora
                            </button>
                        ) : null}
                    </div>
                </div>
            )}

            {/* Offline/Anonymous Notice for Non-logged Users */}
            {!user && (
                <div className="w-full max-w-4xl flex items-center justify-between text-xs px-3 py-2 mb-2 bg-amber-950/30 rounded-xl border border-amber-800/40 text-amber-200/90">
                    <div className="flex items-center gap-2">
                        <span>⚠️</span>
                        <span>
                            <strong>Modo local:</strong> Los datos se guardan en este dispositivo. Iniciá sesión con Google para sincronizar y respaldar en la nube.
                        </span>
                    </div>
                    <button
                        onClick={handleLogin}
                        className="text-amber-400 hover:text-amber-300 font-bold underline whitespace-nowrap ml-2"
                    >
                        Iniciar Sesión
                    </button>
                </div>
            )}

            <div className="w-full max-w-4xl flex flex-col z-10 flex-grow">
                <Scoreboard />

                {/* Read-Only Banner / Mode Switcher */}
                {isGameOwner && (
                    <div className="flex justify-end mb-3">
                        <button
                            onClick={() => {
                                const nextReadOnly = !gameState.isReadOnly;
                                setGameState(prev => ({ ...prev, isReadOnly: nextReadOnly }));
                                if (nextReadOnly) {
                                    setActiveTab('statistics');
                                } else {
                                    setActiveTab('tally');
                                }
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                gameState.isReadOnly
                                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md hover:shadow-cyan-500/20'
                                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'
                            }`}
                        >
                            {gameState.isReadOnly ? '✏️ Continuar Anotando' : '📊 Ver Estadísticas'}
                        </button>
                    </div>
                )}

                <div className="hidden md:flex justify-center mb-8 border-b border-slate-700 bg-slate-900 shadow-md">
                    {tabsForCurrentMode.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative z-20 flex items-center px-4 sm:px-6 py-3 text-base sm:text-lg font-bold capitalize transition-colors duration-300 focus:outline-none ${activeTab === tab ? 'border-b-4 border-cyan-500 text-cyan-400' : 'text-slate-500 hover:text-cyan-400'}`}
                        >
                            {tabTranslations[tab]}
                        </button>
                    ))}
                </div>

                <GameMainContent
                    activeTab={activeTab}
                    isReadOnly={gameState.isReadOnly}
                    onActionSelect={(a: StatAction) => { setActionToAssign(a); openModal('playerSelection'); }}
                    handleUndoTally={handleUndoTally}
                    handleRedoTally={handleRedoTally}
                    gameLog={gameState.gameLog}
                    tallyRedoLog={gameState.tallyRedoLog || []}
                    isCorrectionsVisible={isCorrectionsVisible}
                    setIsCorrectionsVisible={setIsCorrectionsVisible}
                    playerNames={gameState.playerNames}
                    setEditingEvent={setEditingEvent}
                    setIsShareModalOpen={() => openModal('share')}
                />
            </div>

            <footer className="w-full text-center text-slate-500 text-xs mt-8 pb-4">Santiago Greco - Gresolutions © 2026</footer>

            <BottomNavigation activeTab={activeTab} onSelectTab={setActiveTab} gameMode={gameState.gameMode} />

            {/* FAB flotante Compartir Reporte — visible en todas las tabs menos estadísticas */}
            {activeTab !== 'statistics' && (
                <button
                    onClick={() => { setActiveTab('statistics'); openModal('share'); }}
                    className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs uppercase tracking-widest px-4 py-3 rounded-2xl shadow-xl shadow-cyan-900/40 transition-all hover:scale-105 active:scale-95 border border-cyan-400/30 backdrop-blur-sm"
                    title="Compartir reporte del partido"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>Reporte</span>
                </button>
            )}

            <AppModals {...renderModalsProps} />
        </div>
    );
}
