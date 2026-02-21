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

export default function MatchRoute() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { gameState, setGameState, redoStack } = useGameContext();
    const { user, authLoading } = useAuth();
    const {
        activeTab, setActiveTab, openModal, closeModal,
        actionToAssign, setActionToAssign
    } = useUI();

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
        if (!gameState.gameMode) return ['logger', 'tally', 'statistics'];
        return gameState.gameMode === 'shot-chart'
            ? ['logger', 'statistics'] as const
            : ['tally', 'statistics'] as const;
    }, [gameState.gameMode]);

    const tabTranslations: Partial<Record<AppTab, string>> = { logger: 'Cancha', courtAnalysis: 'Mapa', statistics: 'Análisis', faq: 'FAQ' };

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
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans bg-pattern-hoops pb-24 md:pb-8">
            <div className="w-full max-w-4xl flex-grow">
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
                    currentPeriod={gameState.currentPeriod}
                    onPeriodChange={(p) => setGameState(prev => ({ ...prev, currentPeriod: p }))}
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
