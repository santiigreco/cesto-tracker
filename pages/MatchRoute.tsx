import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useGameContext } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useGameLogic } from '../hooks/useGameLogic';
import { useSupabaseSync } from '../hooks/useSupabaseSync';
import AppHeader from '../components/AppHeader';
import BottomNavigation from '../components/BottomNavigation';
import GameMainContent from '../components/GameMainContent';
import AppModals from '../components/AppModals';
import Loader from '../components/Loader';
import Scoreboard from '../components/Scoreboard';
import { ShotPosition, GameEvent, StatAction, AppTab, SavedTeam } from '../types';
import { STAT_LABELS } from '../constants';
import { useProfile } from '../hooks/useProfile';

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

    const { handleLoadGame, isLoading: syncLoading, lastSaved, handleSyncToSupabase, isAutoSaving } = useSupabaseSync();

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
            }
        }
    }, [id, gameState.gameId]);

    const tabsForCurrentMode = useMemo(() => {
        if (!gameState.gameMode) return ['logger', 'tally', 'statistics'] as const;
        return gameState.gameMode === 'shot-chart'
            ? ['logger', 'courtAnalysis', 'statistics'] as const
            : ['tally', 'statistics'] as const;
    }, [gameState.gameMode]);

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
                    gameMode={gameState.gameMode}
                    isAutoSaving={isAutoSaving}
                    lastSaved={lastSaved}
                    gameId={gameState.gameId}
                    onOpenSettings={() => openModal('settings')}
                    isReadOnly={gameState.isReadOnly}
                    isAdmin={isAdmin}
                    currentPeriod={gameState.currentPeriod}
                    onPeriodChange={(p) => setGameState(prev => ({ ...prev, currentPeriod: p }))}
                    user={user}
                    onLogin={handleLogin}
                    onSave={handleSyncToSupabase}
                />

                <Scoreboard />

                <div className="hidden md:flex justify-center mb-8 border-b-2 border-slate-700">
                    {tabsForCurrentMode.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex items-center px-4 sm:px-6 py-3 text-base sm:text-lg font-bold capitalize transition-colors duration-300 focus:outline-none ${activeTab === tab ? 'border-b-4 border-cyan-500 text-cyan-400' : 'text-slate-500 hover:text-cyan-400'}`}
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

            <AppModals {...renderModalsProps} />
        </div>
    );
}
