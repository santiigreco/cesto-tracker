import React from 'react';
import { LastSetupData, UserProfile } from '@/types';
import TeamLogo from '@/components/ui/TeamLogo';

interface HomeHeroProps {
  user?: unknown;
  profile?: UserProfile | null;
  lastSetup: LastSetupData | null;
  onStartClick: () => void;
  onQuickStart: () => void;
  onLoadGameClick: () => void;
  onLogin?: () => void;
}

/**
 * Landing hero: headline + single primary CTA + one secondary text link.
 * Everything else (profile, login) lives in the navbar to avoid duplicated actions.
 */
export const HomeHero: React.FC<HomeHeroProps> = ({
  user,
  profile,
  lastSetup,
  onStartClick,
  onQuickStart,
  onLoadGameClick,
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
        <button
          onClick={lastSetup ? onQuickStart : onStartClick}
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
              <span>Empezar planilla</span>
            </>
          ) : (
            <span>Empezar planilla</span>
          )}
        </button>

        {/* Con plantel previo, elegir otro club sigue siendo posible */}
        {lastSetup && (
          <button
            onClick={onStartClick}
            className="min-h-[44px] px-3 text-sm font-bold text-slate-300 hover:text-white underline underline-offset-4 decoration-slate-600 transition-colors"
          >
            Elegir otro equipo
          </button>
        )}

        {/* Promesa de fricción baja */}
        <p className="text-sm text-slate-300 font-medium">
          Sin registro · Se guarda en tu dispositivo · Exporta a Excel
        </p>

        {/* Acceso a resultados */}
        <button
          onClick={onLoadGameClick}
          className="min-h-[44px] px-3 text-sm font-bold text-cyan-300 hover:text-cyan-200 transition-colors"
        >
          {user ? 'Mis partidos →' : 'Ver partidos de la comunidad →'}
        </button>
      </div>
    </section>
  );
};
