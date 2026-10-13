import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '@/types';
import { LastSetupData } from './HomeActionGrid';
import { useUI } from '@/context/UIContext';
import TeamLogo from '@/components/ui/TeamLogo';

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
  profile,
  lastSetup,
  onStartClick,
  onQuickStart,
  onLoadGameClick,
}) => {
  const navigate = useNavigate();
  const { openAuthModal } = useUI();

  return (
    <section className="text-center max-w-3xl mx-auto pt-6 sm:pt-12 pb-6 px-4 select-none">
      {/* Category Pill Tag + Optional Club */}
      <div className="flex items-center justify-center gap-2 flex-wrap mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-black uppercase tracking-widest">
          <span>🏐</span>
          <span>Planilla Técnica Oficial · Cestoball</span>
        </div>

        {profile?.favorite_club && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold shadow-sm">
            <TeamLogo teamName={profile.favorite_club} className="h-4 w-4" />
            <span>{profile.favorite_club}</span>
          </div>
        )}
      </div>

      {/* Titular Conciso y Directo */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.08] mb-5">
        Llevá las estadísticas de tu partido <br className="hidden sm:inline" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-300 to-cyan-400">
          en segundos
        </span>
      </h1>

      {/* Subtítulo Simplificado */}
      <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed font-normal mb-8">
        La planilla digital para planilleros, técnicos y clubes.
        Registrá goles, faltas y recuperos al instante con precisión reglamentaria.
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

      {/* Secondary Clean Action Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6">
        <button
          onClick={onLoadGameClick}
          className="hover:text-cyan-400 text-xs font-bold text-slate-400 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
        >
          <span>📂</span>
          <span>Historial de Partidos</span>
        </button>

        {user ? (
          <button
            onClick={() => navigate('/perfil')}
            className="hover:text-emerald-400 text-xs font-bold text-slate-400 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
          >
            <span>👤</span>
            <span>Mi Perfil & Planteles</span>
          </button>
        ) : (
          <button
            onClick={() => openAuthModal({ initialMode: 'login', title: 'Ingresá para sincronizar' })}
            className="hover:text-cyan-400 text-xs font-bold text-slate-400 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
          >
            <span>🔑</span>
            <span>Ingresar con Google</span>
          </button>
        )}
      </div>
    </section>
  );
};
