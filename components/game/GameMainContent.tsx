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
    setEditingEvent,
  } = props;

  const handleToggleCorrections = useCallback(() => {
    setIsCorrectionsVisible((prev: boolean) => !prev);
  }, [setIsCorrectionsVisible]);

  const handleShareClick = useCallback(() => {
    setIsShareModalOpen(true);
  }, [setIsShareModalOpen]);

  return (
    <main className="flex flex-col gap-4 sm:gap-5">
      {activeTab === 'tally' && (
        <div className="flex flex-col gap-4 sm:gap-5">
          {!isReadOnly && <QuickActionsPanel onActionSelect={props.onActionSelect} />}

          {!isReadOnly && (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={props.handleUndoTally}
                disabled={props.gameLog.length === 0}
                aria-label="Deshacer última acción"
                title="Deshacer última acción"
                className="min-h-[44px] flex items-center justify-center gap-2 bg-surface-card hover:bg-surface-elevated border border-border-strong text-ink-primary font-semibold text-sm py-2 px-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation"
              >
                <UndoIcon className="h-4 w-4 text-ink-secondary" />
                <span>Deshacer</span>
              </button>
              <button
                type="button"
                onClick={props.handleRedoTally}
                disabled={props.tallyRedoLog.length === 0}
                aria-label="Rehacer acción"
                title="Rehacer acción"
                className="min-h-[44px] flex items-center justify-center gap-2 bg-surface-card hover:bg-surface-elevated border border-border-strong text-ink-primary font-semibold text-sm py-2 px-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation"
              >
                <RedoIcon className="h-4 w-4 text-ink-secondary" />
                <span>Rehacer</span>
              </button>
            </div>
          )}

          <GameLogView
            log={props.gameLog}
            playerNames={playerNames}
            onEventClick={!isReadOnly ? setEditingEvent : undefined}
          />

          <div className="bg-surface-card border border-border-subtle rounded-2xl shadow-card mb-4 overflow-hidden">
            <button
              type="button"
              onClick={handleToggleCorrections}
              aria-expanded={props.isCorrectionsVisible}
              className="w-full min-h-[52px] flex justify-between items-center text-left px-4 py-3 font-bold text-sm sm:text-base text-ink-primary hover:bg-surface-elevated/60 transition-colors"
            >
              <span>Planilla de Jugadoras</span>
              <ChevronDownIcon
                className={`h-5 w-5 text-ink-muted transition-transform duration-200 ${
                  props.isCorrectionsVisible ? 'rotate-180' : ''
                }`}
              />
            </button>
            {props.isCorrectionsVisible && (
              <div className="p-3 sm:p-4 border-t border-border-subtle">
                <StatsTallyView />
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'statistics' && (
        <div className="flex flex-col gap-6">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center py-12">
                <Loader />
                <p className="text-ink-muted mt-3 text-sm">Cargando estadísticas...</p>
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
