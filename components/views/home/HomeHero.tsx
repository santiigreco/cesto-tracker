import React from 'react';
import { LastSetupData, UserProfile } from '@/types';
import TeamLogo from '@/components/ui/TeamLogo';
import { ArrowRightIcon, BoltIcon } from '@/components/icons';
import type { ActiveMatchSummary } from '../HomePage';

interface HomeHeroProps {
  user?: unknown;
  profile?: UserProfile | null;
  lastSetup: LastSetupData | null;
  onInstantStart: () => void;
  onConfigureSetup: () => void;
  onLoadGameClick: () => void;
  onLogin?: () => void;
  activeMatchSummary?: ActiveMatchSummary | null;
  localGamesCount?: number;
  onResumeActiveMatch?: () => void;
}

/**
 * Landing hero: headline + active match card + single primary CTA + secondary links.
 */
export const HomeHero: React.FC<HomeHeroProps> = ({
  user,
  profile,
  lastSetup,
  onInstantStart,
  onConfigureSetup,
  onLoadGameClick,
  activeMatchSummary,
  localGamesCount = 0,
  onResumeActiveMatch,
}) => {
  return (
    <section className="text-center max-w-2xl mx-auto pt-4 sm:pt-10 pb-6 px-2 select-none">
      {/* Headline */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-ink-primary tracking-tight leading-[1.08] mb-4">
        Llevá las estadísticas de tu partido{' '}
        <span className="text-brand block sm:inline">en segundos</span>
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-lg text-ink-secondary max-w-xl mx-auto leading-relaxed font-normal mb-7">
        La planilla digital de cestoball para planilleros, técnicos y clubes.
      </p>

      {/* Action Stack */}
      <div className="flex flex-col items-center justify-center gap-3">
        {activeMatchSummary && onResumeActiveMatch && (
          <button
            type="button"
            onClick={onResumeActiveMatch}
            className="w-full max-w-md flex items-center justify-between gap-3 bg-surface-card hover:bg-surface-elevated border border-sport-goal/45 hover:border-sport-goal-light rounded-2xl px-4 py-3 min-h-[56px] shadow-card transition-colors active:scale-[0.99] touch-manipulation"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="px-2 py-0.5 rounded-md bg-sport-goal/20 border border-sport-goal/40 text-sport-goal-light text-[10px] font-extrabold uppercase tracking-wider shrink-0">
                En curso
              </span>
              <div className="min-w-0 text-left">
                <span className="block text-xs sm:text-sm font-bold text-ink-primary truncate tabular-nums">
                  {activeMatchSummary.myTeam} {activeMatchSummary.myScore} -{' '}
                  {activeMatchSummary.opponentScore} {activeMatchSummary.opponentName}
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-brand uppercase tracking-wider shrink-0">
              <span>Reanudar</span>
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={onInstantStart}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-brand hover:bg-brand-hover text-ink-inverse font-black text-base sm:text-lg px-7 py-3.5 min-h-[54px] rounded-xl shadow-card transition-all duration-150 active:scale-[0.98] touch-manipulation"
        >
          {lastSetup ? (
            <>
              <TeamLogo teamName={lastSetup.myTeam} className="h-6 w-6 shrink-0" />
              <span>Empezar planilla · {lastSetup.myTeam}</span>
            </>
          ) : profile?.favorite_club ? (
            <>
              <TeamLogo teamName={profile.favorite_club} className="h-6 w-6 shrink-0" />
              <span>Empezar planilla</span>
            </>
          ) : (
            <>
              <BoltIcon className="h-5 w-5 shrink-0" />
              <span>Empezar planilla</span>
            </>
          )}
        </button>

        {/* Secondary Actions */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-1">
          <button
            type="button"
            onClick={onConfigureSetup}
            className="min-h-[44px] px-3 text-sm font-semibold text-ink-secondary hover:text-ink-primary underline underline-offset-4 decoration-border-strong transition-colors"
          >
            Configurar equipos primero
          </button>

          <button
            type="button"
            onClick={onLoadGameClick}
            className="min-h-[44px] px-3 inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:text-brand-hover transition-colors tabular-nums"
          >
            <span>
              {user
                ? 'Mis partidos'
                : localGamesCount > 0
                  ? `Mis partidos (${localGamesCount})`
                  : 'Partidos de la comunidad'}
            </span>
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Low-friction promise */}
        <p className="text-xs sm:text-sm text-ink-muted font-medium">
          Sin registro · Se guarda en tu dispositivo · Exporta a Excel oficial
        </p>
      </div>
    </section>
  );
};
