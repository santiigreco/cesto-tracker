import React, { Suspense, lazy, useCallback } from 'react';
import { AppTab, GameEvent, StatAction } from '../../types';
import QuickActionsPanel from '@/components/ui/QuickActionsPanel';
import { UndoIcon, RedoIcon, ChevronDownIcon } from '../icons';
import GameLogView from '@/components/game/GameLogView';
import StatsTallyView from '@/components/game/StatsTallyView';
import Loader from '@/components/ui/Loader';

const StatisticsView = lazy(() => import('@/components/views/StatisticsView'));

interface GameMainContentProps {
    activeTab: AppTab;
    isReadOnly: boolean;

    // Tally Props
    onActionSelect: (action: StatAction) => void;
    handleUndoTally: () => void;
    handleRedoTally: () => void;
    gameLog: GameEvent[];
    tallyRedoLog: GameEvent[];
    isCorrectionsVisible: boolean;
    setIsCorrectionsVisible: React.Dispatch<React.SetStateAction<boolean>>;
    playerNames: Record<string, string>;
    setEditingEvent: (e: GameEvent | null) => void;

    // Statistics Props
    setIsShareModalOpen: (v: boolean) => void;
}

const GameMainContent: React.FC<GameMainContentProps> = React.memo((props) => {
    const {
        activeTab,
        isReadOnly,
        playerNames,
        setIsCorrectionsVisible,
        setIsShareModalOpen,
        setEditingEvent
    } = props;

    const handleToggleCorrections = useCallback(() => {
        setIsCorrectionsVisible((prev: boolean) => !prev);
    }, [setIsCorrectionsVisible]);

    const handleShareClick = useCallback(() => {
        setIsShareModalOpen(true);
    }, [setIsShareModalOpen]);

    return (
        <main className="flex flex-col gap-6">
            {activeTab === 'tally' && (
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
                        onEventClick={!isReadOnly ? setEditingEvent : undefined}
                    />

                    <div className="bg-slate-800 rounded-lg shadow-lg mb-4">
                        <button
                            onClick={handleToggleCorrections}
                            className="w-full flex justify-between items-center text-left p-4 font-bold text-xl text-cyan-400 hover:bg-slate-700/50 transition-colors rounded-lg"
                        >
                            <span>Planilla de Jugadores</span>
                            <ChevronDownIcon className={`h-6 w-6 text-slate-400 transition-transform duration-300 ${props.isCorrectionsVisible ? 'rotate-180' : ''}`} />
                        </button>
                        {props.isCorrectionsVisible && (
                            <div className="transition-all duration-500 ease-in-out overflow-hidden max-h-[8000px] opacity-100">
                                <div className="p-4 border-t border-slate-700">
                                    <StatsTallyView />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'statistics' && (
                <div className="flex flex-col gap-8">
                    <Suspense
                        fallback={
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader />
                                <p className="text-slate-400 mt-3 text-sm">Cargando estadísticas...</p>
                            </div>
                        }
                    >
                        <StatisticsView onShareClick={handleShareClick} />
                    </Suspense>
                </div>
            )}
        </main>
    );
});

export default GameMainContent;
