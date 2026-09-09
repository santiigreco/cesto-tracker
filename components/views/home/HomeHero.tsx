import React from 'react';
import { UserProfile } from '@/types';
import { LastSetupData } from './HomeActionGrid';

interface HomeHeroProps {
  user?: any;
  profile?: UserProfile | null;
  lastSetup: LastSetupData | null;
  onStartClick: () => void;
  onQuickStart: () => void;
  onLoadGameClick: () => void;
  onLogin?: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  user,
  lastSetup,
  onStartClick,
  onQuickStart,
  onLoadGameClick,
  onLogin,
}) => {
  return (
    <section className="text-center max-w-3xl mx-auto pt-6 sm:pt-10 pb-8 sm:pb-12 px-4 select-none">
      {/* Category Pill Tag */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-black uppercase tracking-widest mb-6">
        <span>🏐</span>
        <span>Planilla Técnica Oficial · Cestoball</span>
      </div>

      {/* Titular Conciso y Directo */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.08] mb-5">
        Lleva las estadísticas de tu partido <br className="hidden sm:inline" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-300 to-cyan-400">
          en segundos
        </span>
      </h1>

      {/* Subtítulo Simplificado (máx 2 líneas) */}
      <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed font-normal mb-8">
        La planilla digital para planilleros, técnicos y clubes.
        Registra goles, faltas y recuperos al instante con precisión reglamentaria.
      </p>

      {/* CTA Principal Hero */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
        <button
          onClick={onStartClick}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-400 via-cyan-500 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-base sm:text-lg px-8 py-4 rounded-2xl shadow-xl shadow-cyan-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="text-xl">📋</span>
          <span>Crear Nueva Planilla</span>
        </button>

        {/* Quick Resume Button if last team setup exists */}
        {lastSetup && (
          <button
            onClick={onQuickStart}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900/90 hover:bg-slate-800/90 border border-emerald-500/40 text-emerald-300 hover:text-white font-bold text-sm px-6 py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>⚡</span>
            <span>Reanudar {lastSetup.myTeam}</span>
          </button>
        )}
      </div>

      {/* Secondary saved games link */}
      <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
        <button
          onClick={user ? onLoadGameClick : onLogin}
          className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5 underline decoration-slate-700 underline-offset-4"
        >
          <span>📂</span>
          <span>{user ? 'Ver mis planillas guardadas' : 'Ingresar para sincronizar partidos en la nube'}</span>
        </button>
      </div>
    </section>
  );
};
