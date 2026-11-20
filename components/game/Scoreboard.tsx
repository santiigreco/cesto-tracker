import React, { useMemo } from 'react';
import { useGameContext } from '../../context/GameContext';
import { useUI } from '../../context/UIContext';
import { useGameLogic } from '../../hooks/useGameLogic';
import { hasCompleteMatchMetadata } from '../../utils/matchMetadata';
import { PERIOD_NAMES } from '../../constants';
import { GamePeriod } from '../../types';
import TeamLogo from '@/components/ui/TeamLogo';
import { ArrowRightIcon, FlagIcon } from '../icons';

const transitionBase =
  'min-h-[44px] flex items-center bg-surface-elevated hover:bg-surface-hover active:scale-[0.97] transition-all rounded-xl text-xs font-extrabold uppercase tracking-wider touch-manipulation whitespace-nowrap';

const finishBtnClass =
  'min-h-[44px] flex items-center gap-1.5 bg-sport-miss hover:bg-red-500 text-white active:scale-[0.97] transition-all rounded-xl px-3 sm:px-3.5 text-xs font-extrabold uppercase tracking-wider touch-manipulation whitespace-nowrap';

const rivalBtnClass =
  'min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl font-black text-sm tabular-nums transition-all active:scale-[0.95] touch-manipulation select-none';

const Scoreboard: React.FC = React.memo(() => {
  const { gameState, setGameState } = useGameContext();
  const { activeTab, openModal } = useUI();
  const { handleUpdateOpponentScore } = useGameLogic();
  const { tallyStats, currentPeriod, isReadOnly, settings, opponentScore, teamFouls } = gameState;

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
  const rivalScore = opponentScore || 0;
  const rivalName = settings.gameName?.trim() || 'Rival';
  const periodTeamFouls = teamFouls?.[currentPeriod] || 0;

  const FinishButton = (
    <button
      type="button"
      onClick={handleFinishClick}
      className={finishBtnClass}
      title="Finalizar e ir a estadísticas"
    >
      <FlagIcon className="h-3.5 w-3.5 shrink-0" />
      <span className="sm:hidden">FIN</span>
      <span className="hidden sm:inline">FIN PARTIDO</span>
    </button>
  );

  return (
    <div className="sticky top-0 z-30 -mx-3 px-3 sm:mx-0 sm:px-4 w-auto sm:w-full bg-surface-card/95 border-y sm:border border-border-subtle sm:rounded-2xl shadow-sticky mb-3 py-2.5">
      {/* Row 1: Broadcast score line (my team vs rival) + rival quick buttons */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* My team */}
          <div className="flex items-center gap-2 min-w-0">
            {settings.myTeam && (
              <TeamLogo teamName={settings.myTeam} className="h-8 w-8 sm:h-9 sm:w-9 shrink-0" />
            )}
            <div className="min-w-0">
              <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-ink-muted truncate max-w-[76px] sm:max-w-[160px]">
                {settings.myTeam || 'Mi equipo'}
              </span>
              <span className="block text-3xl sm:text-4xl font-black text-ink-primary leading-none tabular-nums">
                {totalPoints}
              </span>
            </div>
          </div>

          <span className="text-ink-muted font-bold text-lg leading-none self-end pb-1" aria-hidden="true">
            –
          </span>

          {/* Rival */}
          <div className="min-w-0">
            <span
              className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-ink-muted truncate max-w-[64px] sm:max-w-[160px]"
              title={rivalName}
            >
              {rivalName}
            </span>
            <span
              className="block text-3xl sm:text-4xl font-black text-ink-secondary leading-none tabular-nums"
              aria-label={`Tanteador rival: ${rivalScore}`}
            >
              {rivalScore}
            </span>
          </div>
        </div>

        {showLiveControls ? (
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0" role="group" aria-label="Sumar puntos al rival">
            <button
              type="button"
              onClick={() => handleUpdateOpponentScore(-1)}
              disabled={rivalScore <= 0}
              className={`${rivalBtnClass} bg-surface-canvas hover:bg-surface-hover border border-border-subtle text-ink-muted disabled:opacity-30 disabled:active:scale-100`}
              aria-label="Restar 1 punto al rival (corrección)"
              title="Corregir: restar 1 al rival"
            >
              −1
            </button>
            <button
              type="button"
              onClick={() => handleUpdateOpponentScore(2)}
              className={`${rivalBtnClass} bg-surface-elevated hover:bg-surface-hover border border-border-strong text-ink-primary`}
              aria-label="Sumar 2 puntos al rival"
            >
              +2
            </button>
            <button
              type="button"
              onClick={() => handleUpdateOpponentScore(3)}
              className={`${rivalBtnClass} bg-surface-elevated hover:bg-surface-hover border border-border-strong text-ink-primary`}
              aria-label="Sumar 3 puntos al rival"
            >
              +3
            </button>
          </div>
        ) : (
          <span className="px-2.5 py-1 rounded-lg bg-surface-elevated border border-border-subtle text-xs font-bold text-brand shrink-0">
            {PERIOD_NAMES[currentPeriod]}
          </span>
        )}
      </div>

      {/* Row 2: Period selector + team fouls + period transitions */}
      {showLiveControls && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 mt-2 border-t border-border-subtle/70">
          <div className="flex items-center gap-1.5 min-w-0">
            <select
              aria-label="Período del partido"
              value={currentPeriod}
              onChange={(e) =>
                setGameState((prev) => ({
                  ...prev,
                  currentPeriod: e.target.value as GamePeriod,
                }))
              }
              className="min-h-[44px] sm:min-h-[38px] max-w-[150px] bg-surface-elevated hover:bg-surface-hover text-brand font-bold border border-border-strong rounded-xl pl-3 pr-8 text-base sm:text-xs cursor-pointer transition-colors appearance-none tabular-nums"
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

            <span
              className="min-h-[36px] flex items-center gap-1 px-2.5 rounded-lg bg-surface-canvas border border-border-subtle text-[11px] font-bold uppercase tracking-wider text-ink-muted whitespace-nowrap"
              title="Faltas personales del equipo en el período actual"
            >
              <span className="hidden min-[380px]:inline">Faltas</span>
              <span className="min-[380px]:hidden">F</span>
              <span className="text-sm font-black text-ink-primary tabular-nums">{periodTeamFouls}</span>
            </span>
          </div>

          <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
            {currentPeriod === 'First Half' ? (
              <button
                type="button"
                onClick={() => setGameState((prev) => ({ ...prev, currentPeriod: 'Second Half' }))}
                className={`${transitionBase} gap-1.5 border border-sport-goal/40 text-sport-goal-light px-3 sm:px-3.5`}
              >
                <span>FIN 1° T</span>
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </button>
            ) : currentPeriod === 'Second Half' ? (
              <>
                <button
                  type="button"
                  onClick={() => setGameState((prev) => ({ ...prev, currentPeriod: 'First Overtime' }))}
                  aria-label="Pasar a primer suplementario"
                  className={`${transitionBase} border border-sport-warn/40 text-sport-warn-light px-2.5 sm:px-3`}
                >
                  <span className="sm:hidden">+ SUPL.</span>
                  <span className="hidden sm:inline">SUPLEMENTARIO</span>
                </button>
                {FinishButton}
              </>
            ) : currentPeriod === 'First Overtime' ? (
              <>
                <button
                  type="button"
                  onClick={() => setGameState((prev) => ({ ...prev, currentPeriod: 'Second Overtime' }))}
                  aria-label="Pasar a segundo suplementario"
                  className={`${transitionBase} border border-sport-warn/40 text-sport-warn-light px-2.5 sm:px-3`}
                >
                  <span className="sm:hidden">+ 2° S</span>
                  <span className="hidden sm:inline">2° SUPL.</span>
                </button>
                {FinishButton}
              </>
            ) : currentPeriod === 'Second Overtime' ? (
              FinishButton
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
});

export default Scoreboard;
