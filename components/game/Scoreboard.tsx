import React, { useMemo } from 'react';
import { useGameContext } from '../../context/GameContext';
import { useUI } from '../../context/UIContext';
import { hasCompleteMatchMetadata } from '../../utils/matchMetadata';
import { PERIOD_NAMES } from '../../constants';
import { GamePeriod } from '../../types';
import TeamLogo from '@/components/ui/TeamLogo';
import { ArrowRightIcon, FlagIcon } from '../icons';

const Scoreboard: React.FC = React.memo(() => {
  const { gameState, setGameState } = useGameContext();
  const { activeTab, openModal } = useUI();
  const { tallyStats, currentPeriod, isReadOnly, settings } = gameState;

  const handleFinishClick = () => {
    if (!hasCompleteMatchMetadata(settings)) {
      openModal('matchMetadata', { intent: 'finish' });
    } else {
      openModal('finishMatch');
    }
  };

  const totalPoints = useMemo(() => {
    return Object.entries(tallyStats || {}).reduce((total: number, [playerNumber, playerTally]) => {
      if (playerNumber === 'Equipo') return total;

      let playerTotal = 0;
      Object.values(playerTally).forEach((periodStats) => {
        playerTotal += (periodStats?.goles || 0) * 2 + (periodStats?.triples || 0) * 3;
      });

      return total + playerTotal;
    }, 0);
  }, [tallyStats]);

  const showLiveControls = activeTab !== 'statistics' && !isReadOnly;

  return (
    <div className="sticky top-0 z-30 -mx-3 px-3 sm:mx-0 sm:px-4 w-auto sm:w-full bg-surface-card/95 border-y sm:border border-border-subtle sm:rounded-2xl shadow-sticky mb-3 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        {/* Identity + Total Points */}
        <div className="flex items-center gap-2.5 min-w-0">
          {settings.myTeam && (
            <TeamLogo teamName={settings.myTeam} className="h-8 w-8 sm:h-9 sm:w-9 shrink-0" />
          )}
          <div className="min-w-0">
            <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-ink-muted truncate max-w-[130px] sm:max-w-[180px]">
              {settings.myTeam || 'Puntos'}
            </span>
            <span className="block text-3xl sm:text-4xl font-black text-ink-primary leading-none tabular-nums">
              {totalPoints}
            </span>
          </div>
        </div>

        {/* Period Transition Controls */}
        {showLiveControls && (
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0 sm:order-3">
            {currentPeriod === 'First Half' ? (
              <button
                type="button"
                onClick={() => setGameState((prev) => ({ ...prev, currentPeriod: 'Second Half' }))}
                className="min-h-[44px] flex items-center gap-1.5 bg-surface-elevated hover:bg-surface-hover border border-sport-goal/40 text-sport-goal-light active:scale-[0.97] transition-all rounded-xl px-3 sm:px-3.5 text-xs font-extrabold uppercase tracking-wider touch-manipulation whitespace-nowrap"
              >
                <span>FIN 1° T</span>
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </button>
            ) : currentPeriod === 'Second Half' ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setGameState((prev) => ({ ...prev, currentPeriod: 'First Overtime' }))
                  }
                  aria-label="Pasar a primer suplementario"
                  className="min-h-[44px] flex items-center bg-surface-elevated hover:bg-surface-hover border border-sport-warn/40 text-sport-warn-light active:scale-[0.97] transition-all rounded-xl px-2.5 sm:px-3 text-xs font-extrabold uppercase tracking-wider touch-manipulation whitespace-nowrap"
                >
                  <span className="sm:hidden">+ SUPL.</span>
                  <span className="hidden sm:inline">SUPLEMENTARIO</span>
                </button>
                <button
                  type="button"
                  onClick={handleFinishClick}
                  className="min-h-[44px] flex items-center gap-1.5 bg-sport-miss hover:bg-red-500 text-white active:scale-[0.97] transition-all rounded-xl px-3 sm:px-3.5 text-xs font-extrabold uppercase tracking-wider touch-manipulation whitespace-nowrap"
                  title="Finalizar e ir a estadísticas"
                >
                  <FlagIcon className="h-3.5 w-3.5 shrink-0" />
                  <span className="sm:hidden">FIN</span>
                  <span className="hidden sm:inline">FIN PARTIDO</span>
                </button>
              </>
            ) : currentPeriod === 'First Overtime' ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setGameState((prev) => ({ ...prev, currentPeriod: 'Second Overtime' }))
                  }
                  aria-label="Pasar a segundo suplementario"
                  className="min-h-[44px] flex items-center bg-surface-elevated hover:bg-surface-hover border border-sport-warn/40 text-sport-warn-light active:scale-[0.97] transition-all rounded-xl px-2.5 sm:px-3 text-xs font-extrabold uppercase tracking-wider touch-manipulation whitespace-nowrap"
                >
                  <span className="sm:hidden">+ 2° S</span>
                  <span className="hidden sm:inline">2° SUPL.</span>
                </button>
                <button
                  type="button"
                  onClick={handleFinishClick}
                  className="min-h-[44px] flex items-center gap-1.5 bg-sport-miss hover:bg-red-500 text-white active:scale-[0.97] transition-all rounded-xl px-3 sm:px-3.5 text-xs font-extrabold uppercase tracking-wider touch-manipulation whitespace-nowrap"
                  title="Finalizar e ir a estadísticas"
                >
                  <FlagIcon className="h-3.5 w-3.5 shrink-0" />
                  <span className="sm:hidden">FIN</span>
                  <span className="hidden sm:inline">FIN PARTIDO</span>
                </button>
              </>
            ) : currentPeriod === 'Second Overtime' ? (
              <button
                type="button"
                onClick={handleFinishClick}
                className="min-h-[44px] flex items-center gap-1.5 bg-sport-miss hover:bg-red-500 text-white active:scale-[0.97] transition-all rounded-xl px-3 sm:px-3.5 text-xs font-extrabold uppercase tracking-wider touch-manipulation whitespace-nowrap"
                title="Finalizar e ir a estadísticas"
              >
                <FlagIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="sm:hidden">FIN</span>
                <span className="hidden sm:inline">FIN PARTIDO</span>
              </button>
            ) : null}
          </div>
        )}

        {/* Integrated Period Selector */}
        <div
          className={`flex items-center justify-between gap-2 ${
            showLiveControls
              ? 'w-full sm:w-auto sm:order-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-subtle/70'
              : 'shrink-0'
          }`}
        >
          {showLiveControls ? (
            <>
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted sm:hidden">
                Período en juego
              </span>
              <select
                aria-label="Período del partido"
                value={currentPeriod}
                onChange={(e) =>
                  setGameState((prev) => ({
                    ...prev,
                    currentPeriod: e.target.value as GamePeriod,
                  }))
                }
                className="min-h-[40px] sm:min-h-[38px] bg-surface-elevated hover:bg-surface-hover text-brand font-bold border border-border-strong rounded-xl pl-3 pr-8 text-base sm:text-xs cursor-pointer transition-colors appearance-none tabular-nums"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2322d3ee' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.1em 1.1em',
                }}
              >
                {Object.entries(PERIOD_NAMES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-surface-elevated border border-border-subtle text-xs font-bold text-brand">
              {PERIOD_NAMES[currentPeriod]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

export default Scoreboard;
