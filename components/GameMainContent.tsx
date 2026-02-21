
import React from 'react';
import { AppTab, GameMode, GamePeriod, GameEvent, Shot, HeatmapFilter, MapPeriodFilter } from '../types';
import QuickActionsPanel from './QuickActionsPanel';
import { UndoIcon } from './icons';
import { RedoIcon } from './icons';
import GameLogView from './GameLogView';
import { ChevronDownIcon } from './icons';
import StatsTallyView from './StatsTallyView';
import { PERIOD_NAMES } from '../constants';
import StatisticsView from './StatisticsView';
import FaqView from './FaqView';
import TutorialOverlay from './TutorialOverlay';
import { CheckIcon } from './icons';
import { XIcon } from './icons';
import { SwitchIcon } from './icons';
import PlayerSelector from './PlayerSelector';
import Court from './Court';
import { TrashIcon } from './icons';
import ShotLog from './ShotLog';
import HeatmapOverlay from './HeatmapOverlay';
import ZoneChart from './ZoneChart';

interface GameMainContentProps {
    gameMode: GameMode;
    activeTab: AppTab;
    isReadOnly: boolean;

    // Tally Props
    onActionSelect: (action: any) => void;
    handleUndoTally: () => void;
    handleRedoTally: () => void;
    gameLog: GameEvent[];
    tallyRedoLog: GameEvent[];
    isCorrectionsVisible: boolean;
    setIsCorrectionsVisible: (v: any) => void;

    // Common Props
    playerNames: Record<string, string>;
    currentPlayer: string;
    currentPeriod: GamePeriod;
    setGameState: any; // Using any for simpler refactor of complex state setter
    setEditingEvent: (e: GameEvent | null) => void;

    // Statistics Props
    setIsShareModalOpen: (v: boolean) => void;

    // Shot Chart Props
    showTutorial: boolean;
    tutorialStep: number;
    isEditingHeaderPlayer: boolean;
    headerPlayerName: string;
    setHeaderPlayerName: (n: string) => void;
    saveHeaderPlayerName: () => void;
    cancelEditingHeader: () => void;
    startEditingHeader: () => void;
    handlePlayerChange: (p: string) => void;
    activePlayers: string[];
    setIsSubstitutionModalOpen: (v: boolean) => void;
    filteredLoggerTabShots: Shot[];
    handleCourtClick: (pos: any) => void;
    handleUndoShot: () => void;
    handleRedoShot: () => void;
    redoStack: Shot[];
    handleRequestClearSheet: () => void;
    shots: Shot[];

    // Analysis Props
    mapView: 'shotmap' | 'heatmap' | 'zonemap';
    setMapView: (v: any) => void;
    analysisPlayer: string;
    setAnalysisPlayer: (p: string) => void;
    playersWithShots: string[];
    filteredAnalysisShots: Shot[];
    analysisResultFilter: HeatmapFilter;
    setAnalysisResultFilter: (f: HeatmapFilter) => void;
    analysisPeriodFilter: MapPeriodFilter;
    setAnalysisPeriodFilter: (p: MapPeriodFilter) => void;
}

const GameMainContent: React.FC<GameMainContentProps> = (props) => {
    const {
        gameMode, activeTab, isReadOnly,
        playerNames, currentPlayer, currentPeriod, setGameState
    } = props;

    return (
        <main className="flex flex-col gap-6">
            {gameMode === 'stats-tally' && activeTab === 'logger' && (
                <>
                    <div className="flex flex-col gap-6">

                        {!isReadOnly && <QuickActionsPanel onActionSelect={props.onActionSelect} />}

                        {!isReadOnly && (
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={props.handleUndoTally}
                                    disabled={props.gameLog.length === 0}
                                    className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-3 rounded-lg transition-transform hover:scale-105 disabled:bg-slate-600 disabled:opacity-50 disabled:transform-none"
                                >
                                    <UndoIcon className="h-5 w-5" />
                                    <span className="hidden sm:inline">Deshacer</span>
                                </button>
                                <button
                                    onClick={props.handleRedoTally}
                                    disabled={props.tallyRedoLog.length === 0}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg transition-transform hover:scale-105 disabled:bg-slate-600 disabled:opacity-50 disabled:transform-none"
                                >
                                    <RedoIcon className="h-5 w-5" />
                                    <span className="hidden sm:inline">Rehacer</span>
                                </button>
                            </div>
                        )}

                        <GameLogView
                            log={props.gameLog}
                            playerNames={playerNames}
                            onEventClick={!isReadOnly ? (event) => props.setEditingEvent(event) : undefined}
                        />

                        <div className="bg-slate-800 rounded-lg shadow-lg mb-4">
                            <button
                                onClick={() => props.setIsCorrectionsVisible((prev: boolean) => !prev)}
                                className="w-full flex justify-between items-center text-left p-4 font-bold text-xl text-cyan-400 hover:bg-slate-700/50 transition-colors rounded-lg"
                            >
                                <span>Planilla de Jugadores</span>
                                <ChevronDownIcon className={`h-6 w-6 text-slate-400 transition-transform duration-300 ${props.isCorrectionsVisible ? 'rotate-180' : ''}`} />
                            </button>
                            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${props.isCorrectionsVisible ? 'max-h-[8000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="p-4 border-t border-slate-700">
                                    <StatsTallyView />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'statistics' && (
                <div className="flex flex-col gap-8">
                    <StatisticsView onShareClick={() => props.setIsShareModalOpen(true)} />
                </div>
            )}

            {activeTab === 'faq' && (
                <FaqView />
            )}

            {gameMode === 'shot-chart' && activeTab === 'logger' && (
                <>
                    {props.showTutorial && <TutorialOverlay step={props.tutorialStep} />}

                    {!isReadOnly && (
                        <div className={`w-full bg-slate-800 p-4 rounded-lg shadow-lg ${props.showTutorial && props.tutorialStep === 1 ? 'relative z-50' : ''}`}>
                            <div className="flex flex-col items-center">
                                {/* Header Player Editor UI */}
                                <div className="flex justify-center items-center gap-2 mb-2" style={{ minHeight: '40px' }}>
                                    {props.isEditingHeaderPlayer && currentPlayer && currentPlayer !== 'Todos' ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={props.headerPlayerName}
                                                onChange={(e) => props.setHeaderPlayerName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') props.saveHeaderPlayerName();
                                                    if (e.key === 'Escape') props.cancelEditingHeader();
                                                }}
                                                autoFocus
                                                className="bg-slate-700 border border-slate-600 text-white text-xl rounded-lg focus:ring-cyan-500 focus:border-cyan-500 p-2"
                                            />
                                            <button onClick={props.saveHeaderPlayerName} className="p-2 rounded-full bg-green-600 hover:bg-green-700 text-white"><CheckIcon className="h-5 w-5" /></button>
                                            <button onClick={props.cancelEditingHeader} className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white"><XIcon className="h-5 w-5" /></button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={props.startEditingHeader}
                                            disabled={!currentPlayer || currentPlayer === 'Todos'}
                                            className="group text-2xl font-bold text-cyan-400 text-center disabled:opacity-50 disabled:cursor-not-allowed p-2 -m-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                                        >
                                            <span className="group-hover:underline decoration-dotted underline-offset-4">
                                                {playerNames[currentPlayer] ? `${playerNames[currentPlayer]} (#${currentPlayer})` : `Jugador #${currentPlayer}`}
                                            </span>
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 text-center mb-3">Tocá en el nombre para personalizarlo.</p>
                                <PlayerSelector
                                    currentPlayer={currentPlayer}
                                    setCurrentPlayer={props.handlePlayerChange}
                                    playerNames={playerNames}
                                    availablePlayers={props.activePlayers}
                                    isTutorialActive={props.showTutorial}
                                />
                                <div className="mt-4 border-t border-slate-700 w-full pt-4 flex justify-center">
                                    <button
                                        onClick={() => props.setIsSubstitutionModalOpen(true)}
                                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-transform hover:scale-105"
                                    >
                                        <SwitchIcon className="h-5 w-5" />
                                        <span>Cambio de Jugador</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={`w-full flex flex-col gap-4 ${props.showTutorial && props.tutorialStep === 2 ? 'relative z-50' : ''}`}>
                        <Court
                            shots={props.filteredLoggerTabShots}
                            onCourtClick={isReadOnly ? undefined : props.handleCourtClick}
                            showShotMarkers={true}
                            currentPlayer={currentPlayer}
                        />
                        {!isReadOnly && (
                            <div className="flex justify-center gap-4 mt-2">
                                <button onClick={props.handleUndoShot} disabled={props.shots.length === 0} className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-3 rounded-lg transition-transform hover:scale-105 disabled:bg-slate-600 disabled:opacity-50">
                                    <UndoIcon className="h-5 w-5" />
                                    <span className="hidden sm:inline">Deshacer</span>
                                </button>
                                <button onClick={props.handleRedoShot} disabled={props.redoStack.length === 0} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg transition-transform hover:scale-105 disabled:bg-slate-600 disabled:opacity-50">
                                    <RedoIcon className="h-5 w-5" />
                                    <span className="hidden sm:inline">Rehacer</span>
                                </button>
                                <button onClick={props.handleRequestClearSheet} disabled={props.shots.length === 0} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg transition-transform hover:scale-105 disabled:bg-slate-600 disabled:opacity-50">
                                    <TrashIcon className="h-5 w-5" />
                                    <span className="hidden sm:inline">Limpiar</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <ShotLog shots={props.shots} playerNames={playerNames} />
                </>
            )}

            {gameMode === 'shot-chart' && activeTab === 'courtAnalysis' && (
                <div className="flex flex-col gap-8">
                    {/* Analysis filters & Chart rendering logic */}
                    <div className="w-full bg-slate-800 p-1.5 rounded-lg shadow-lg flex justify-center max-w-xl mx-auto">
                        <button onClick={() => props.setMapView('shotmap')} className={`flex-1 font-bold py-2 px-3 rounded-md transition-colors ${props.mapView === 'shotmap' ? 'bg-cyan-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'}`}>Mapa de Tiros</button>
                        <button onClick={() => props.setMapView('heatmap')} className={`flex-1 font-bold py-2 px-3 rounded-md transition-colors ${props.mapView === 'heatmap' ? 'bg-cyan-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'}`}>Mapa de Calor</button>
                        <button onClick={() => props.setMapView('zonemap')} className={`flex-1 font-bold py-2 px-3 rounded-md transition-colors ${props.mapView === 'zonemap' ? 'bg-cyan-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'}`}>Gráfico de Zonas</button>
                    </div>

                    <div className="w-full bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
                        <h3 className="text-xl font-semibold mb-4 text-cyan-400 text-center">Seleccionar Jugador</h3>
                        <PlayerSelector currentPlayer={props.analysisPlayer} setCurrentPlayer={props.setAnalysisPlayer} showAllPlayersOption={true} playerNames={playerNames} availablePlayers={props.playersWithShots} />
                    </div>

                    <div className="w-full">
                        <Court
                            shots={props.mapView === 'shotmap' ? props.filteredAnalysisShots : []}
                            showShotMarkers={props.mapView === 'shotmap'}
                        >
                            {props.mapView === 'heatmap' && <HeatmapOverlay shots={props.filteredAnalysisShots} />}
                            {props.mapView === 'zonemap' && <ZoneChart shots={props.filteredAnalysisShots} />}
                        </Court>
                    </div>

                    {/* Filter Controls */}
                    <div className="w-full bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg flex flex-col sm:flex-row gap-8 justify-center">
                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-4 text-cyan-400 text-center">Filtrar Resultado</h3>
                            <div className="flex justify-center bg-slate-700 p-1 rounded-lg w-full max-w-xs mx-auto">
                                <button onClick={() => props.setAnalysisResultFilter('all')} className={`flex-1 py-1 rounded ${props.analysisResultFilter === 'all' ? 'bg-cyan-600 text-white' : 'text-slate-300'}`}>Todos</button>
                                <button onClick={() => props.setAnalysisResultFilter('goles')} className={`flex-1 py-1 rounded ${props.analysisResultFilter === 'goles' ? 'bg-cyan-600 text-white' : 'text-slate-300'}`}>Goles</button>
                                <button onClick={() => props.setAnalysisResultFilter('misses')} className={`flex-1 py-1 rounded ${props.analysisResultFilter === 'misses' ? 'bg-cyan-600 text-white' : 'text-slate-300'}`}>Fallos</button>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-4 text-cyan-400 text-center">Filtrar por Período</h3>
                            <div className="flex justify-center bg-slate-700 p-1 rounded-lg w-full max-w-xs mx-auto">
                                {['all', 'First Half', 'Second Half'].map(p => (
                                    <button key={p} onClick={() => props.setAnalysisPeriodFilter(p as any)} className={`flex-1 py-1 rounded ${props.analysisPeriodFilter === p ? 'bg-cyan-600 text-white' : 'text-slate-300'}`}>
                                        {p === 'all' ? 'Ambos' : PERIOD_NAMES[p as GamePeriod]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default GameMainContent;
