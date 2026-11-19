import React from 'react';
import { LastSetupData, UserProfile } from '@/types';
import TeamLogo from '@/components/ui/TeamLogo';
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
 * Landing hero: headline + single primary CTA + one secondary text link.
 * Everything else (profile, login) lives in the navbar to avoid duplicated actions.
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
    <section className="text-center max-w-3xl mx-auto pt-6 sm:pt-12 pb-6 px-4 select-none">
      {/* Titular */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.08] mb-5">
        Llevá las estadísticas de tu partido <br className="hidden sm:inline" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-300 to-cyan-400">
          en segundos
        </span>
      </h1>

      {/* Subtítulo */}
      <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed font-normal mb-8">
        La planilla digital de cestoball para planilleros, técnicos y clubes.
      </p>

      {/* CTA principal único */}
      <div className="flex flex-col items-center justify-center gap-3">
        {activeMatchSummary && onResumeActiveMatch && (
          <button
            type="button"
            onClick={onResumeActiveMatch}
            className="w-full max-w-md flex items-center justify-between gap-2.5 bg-slate-900/95 hover:bg-slate-800 border border-emerald-500/40 hover:border-emerald-400/70 rounded-2xl px-4 py-2.5 min-h-[48px] shadow-lg transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div className="min-w-0 text-left">
                <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-400">
                  Partido en curso
                </span>
                <span className="block text-xs sm:text-sm font-bold text-white truncate">
                  {activeMatchSummary.myTeam} {activeMatchSummary.myScore} - {activeMatchSummary.opponentScore} {activeMatchSummary.opponentName}
                </span>
              </div>
            </div>
            <span className="text-xs font-black text-cyan-300 uppercase tracking-wider shrink-0">
              Reanudar →
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={onInstantStart}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-400 via-cyan-500 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-base sm:text-lg px-8 py-4 min-h-[56px] rounded-2xl shadow-xl shadow-cyan-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          {lastSetup ? (
            <>
              <TeamLogo teamName={lastSetup.myTeam} className="h-6 w-6" />
              <span>Empezar planilla · {lastSetup.myTeam}</span>
            </>
          ) : profile?.favorite_club ? (
            <>
              <TeamLogo teamName={profile.favorite_club} className="h-6 w-6" />
              <span>⚡ Empezar planilla</span>
            </>
          ) : (
            <span>⚡ Empezar planilla</span>
          )}
        </button>

        {/* Acceso alternativo al setup clásico previo */}
        <button
          type="button"
          onClick={onConfigureSetup}
          className="min-h-[44px] px-3 text-sm font-bold text-slate-300 hover:text-white underline underline-offset-4 decoration-slate-600 transition-colors"
        >
          Configurar equipos primero
        </button>

        {/* Promesa de fricción baja */}
        <p className="text-sm text-slate-300 font-medium">
          Sin registro · Se guarda en tu dispositivo · Exporta a Excel
        </p>

        {/* Acceso a resultados */}
        <button
          onClick={onLoadGameClick}
          className="min-h-[44px] px-3 text-sm font-bold text-cyan-300 hover:text-cyan-200 transition-colors"
        >
          {user
            ? 'Mis partidos →'
            : localGamesCount > 0
              ? `Mis partidos (${localGamesCount}) →`
              : 'Ver partidos de la comunidad →'}
        </button>
      </div>
    </section>
  );
};
