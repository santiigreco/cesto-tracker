import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useGameContext } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useGameLogic } from '../hooks/useGameLogic';
import AppHeader from '../components/AppHeader';
import BottomNavigation from '../components/BottomNavigation';
import GameMainContent from '../components/GameMainContent';
import AppModals from '../components/AppModals';
import Loader from '../components/Loader';
import Scoreboard from '../components/Scoreboard';
import { ShotPosition, GameEvent, StatAction, AppTab, SavedTeam } from '../types';
import { STAT_LABELS } from '../constants';
import { useProfile } from '../hooks/useProfile';
import { useSync } from '../context/SyncContext';

export default function MatchRoute() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { gameState, setGameState, redoStack } = useGameContext();
    const { user, authLoading, handleLogin } = useAuth();
    const {
        activeTab, setActiveTab, openModal, closeModal,
        actionToAssign, setActionToAssign
    } = useUI();
    const { profile } = useProfile();
    const isAdmin = profile?.is_admin === true || profile?.permission_role === 'admin';

    const { handleLoadGame, isLoading: syncLoading, lastSaved, handleSyncToSupabase, isAutoSaving } = useSync();

    const {
        handlePlayerChange, handleSubstitution, updatePlayerName,
        handleUpdateTallyStat, handleUndoTally, handleRedoTally,
        handleOutcomeSelection, handleUndoShot, handleRedoShot,
        handleDeleteGameEvent, handleEditGameEvent
    } = useGameLogic();

    const [pendingShotPosition, setPendingShotPosition] = useState<ShotPosition | null>(null);
    const [editingEvent, setEditingEvent] = useState<GameEvent | null>(null);
    const [isEditingHeaderPlayer, setIsEditingHeaderPlayer] = useState(false);
    const [headerPlayerName, setHeaderPlayerName] = useState('');
    const [mapView, setMapView] = useState<'shotmap' | 'heatmap' | 'zonemap'>('heatmap');
    const [analysisPlayer, setAnalysisPlayer] = useState<string>('Todos');
    const [analysisResultFilter, setAnalysisResultFilter] = useState('all');
    const [analysisPeriodFilter, setAnalysisPeriodFilter] = useState('all');
    const [isCorrectionsVisible, setIsCorrectionsVisible] = useState(false);

    useEffect(() => {
        if (id && id !== 'new') {
            if (gameState.gameId !== id) {
                handleLoadGame(id, false);
                setActiveTab('statistics');
            }
        }
    }, [id, gameState.gameId]);

    const tabsForCurrentMode = useMemo(() => {
        if (!gameState.gameMode) return ['logger', 'tally', 'statistics'] as const;
        return gameState.gameMode === 'shot-chart'
            ? ['logger', 'courtAnalysis', 'statistics'] as const
            : ['tally', 'statistics'] as const;
    }, [gameState.gameMode]);

    useEffect(() => {
        if (!tabsForCurrentMode.includes(activeTab as any)) {
            setActiveTab(tabsForCurrentMode[0]);
        }
    }, [tabsForCurrentMode, activeTab, setActiveTab]);

    const tabTranslations: Partial<Record<AppTab, string>> = {
        logger: 'Cancha',
        tally: 'Planilla',
        courtAnalysis: 'Mapa',
        statistics: 'Estadísticas',
        faq: 'Ayuda'
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

    const handleCourtClick = (position: ShotPosition) => {
        if (gameState.isReadOnly) return;
        if (!gameState.currentPlayer || gameState.currentPlayer === 'Todos') {
            alert('Por favor, selecciona un jugador antes de marcar un tiro.');
            return;
        }
        setPendingShotPosition(position);
    };

    const onOutcomeSelect = (isGol: boolean) => {
        if (pendingShotPosition) {
            handleOutcomeSelection(isGol, pendingShotPosition);
            setPendingShotPosition(null);
        }
    }

    const renderModalsProps = {
        tabTranslations,
        tabs: tabsForCurrentMode as any,
        playersForTally: gameState.availablePlayers,
        actionLabel: actionToAssign ? STAT_LABELS[actionToAssign as any] : '',
        pendingShotPosition,
        setPendingShotPosition,
        onOutcomeSelect,
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

            <div className="w-full max-w-4xl flex-grow relative z-10">
                <AppHeader
                    onOpenMobileMenu={() => openModal('mobileMenu')}
                    onRequestReturnHome={() => openModal('returnHome')}
                    isSetupComplete={gameState.isSetupComplete}
                    gameName={gameState.settings.gameName}
                    myTeam={gameState.settings.myTeam}
                    gameMode={gameState.gameMode}
                    isAutoSaving={isAutoSaving}
                    lastSaved={lastSaved}
                    gameId={gameState.gameId}
                    activeTab={activeTab}
                    onOpenSettings={() => openModal('settings')}
                    isReadOnly={gameState.isReadOnly}
                    isAdmin={isAdmin}
                    currentPeriod={gameState.currentPeriod}
                    onPeriodChange={(p) => setGameState(prev => ({ ...prev, currentPeriod: p }))}
                    user={user}
                    userAvatarUrl={profile?.avatar_url}
                    userInitial={profile?.full_name?.charAt(0) || user?.email?.charAt(0)}
                    onLogin={handleLogin}
                    onSave={() => handleSyncToSupabase(true)}
                    onOpenProfile={() => openModal('profile')}
                />

                <Scoreboard />

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
                    gameMode={gameState.gameMode!}
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
                    currentPlayer={gameState.currentPlayer}
                    currentPeriod={gameState.currentPeriod}
                    setGameState={setGameState}
                    setEditingEvent={setEditingEvent}
                    setIsShareModalOpen={() => openModal('share')}
                    showTutorial={gameState.hasSeenHomepage && gameState.tutorialStep === 1}
                    tutorialStep={gameState.tutorialStep}
                    isEditingHeaderPlayer={isEditingHeaderPlayer}
                    headerPlayerName={headerPlayerName}
                    setHeaderPlayerName={setHeaderPlayerName}
                    saveHeaderPlayerName={() => { updatePlayerName(gameState.currentPlayer, headerPlayerName); setIsEditingHeaderPlayer(false); }}
                    cancelEditingHeader={() => setIsEditingHeaderPlayer(false)}
                    startEditingHeader={() => { setHeaderPlayerName(gameState.playerNames[gameState.currentPlayer] || ''); setIsEditingHeaderPlayer(true); }}
                    handlePlayerChange={handlePlayerChange}
                    activePlayers={gameState.activePlayers}
                    availablePlayers={gameState.availablePlayers}
                    setIsSubstitutionModalOpen={() => openModal('substitution')}
                    filteredLoggerTabShots={gameState.shots.filter(s => s.period === gameState.currentPeriod)}
                    handleCourtClick={handleCourtClick}
                    handleUndoShot={handleUndoShot}
                    handleRedoShot={handleRedoShot}
                    redoStack={redoStack}
                    handleRequestClearSheet={() => { }}
                    shots={gameState.shots}
                    mapView={mapView}
                    setMapView={setMapView}
                    analysisPlayer={analysisPlayer}
                    setAnalysisPlayer={setAnalysisPlayer}
                    playersWithShots={Array.from(new Set(gameState.shots.map(s => s.playerNumber))).sort((a: string, b: string) => Number(a) - Number(b))}
                    filteredAnalysisShots={gameState.shots.filter(s => (analysisPeriodFilter === 'all' || s.period === analysisPeriodFilter) && (analysisPlayer === 'Todos' || s.playerNumber === analysisPlayer))}
                    analysisResultFilter={analysisResultFilter}
                    setAnalysisResultFilter={setAnalysisResultFilter as any}
                    analysisPeriodFilter={analysisPeriodFilter}
                    setAnalysisPeriodFilter={setAnalysisPeriodFilter as any}
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
