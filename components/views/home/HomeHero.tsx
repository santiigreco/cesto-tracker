import React from 'react';
import { UserProfile } from '@/types';

interface HomeHeroProps {
  user?: any;
  profile?: UserProfile | null;
  communityStats: {
    totalGames: number | null;
    topTeams: any[];
  };
}

export const HomeHero: React.FC<HomeHeroProps> = ({ user, profile, communityStats }) => {
  return (
    <div className="text-center lg:text-left space-y-4">
      {user && profile && (
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 mb-2 backdrop-blur-sm shadow-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">
            {profile.role === 'jugador' ? '🏃 Jugador/a' :
             profile.role === 'entrenador' ? '📋 Entrenador/a' :
             profile.role === 'hincha' ? '🥁 Hincha' :
             profile.role === 'periodista' ? '🎙️ Prensa' :
             profile.role === 'dirigente' ? '⏱️ Mesa/Delegado' : '🏐 En línea'}
          </span>
          <span className="text-slate-600 px-0.5">•</span>
          <span className="text-xs font-bold text-white">
            {profile.full_name || user.email?.split('@')[0]}
          </span>
          {profile.favorite_club && (
            <>
              <span className="text-slate-600 px-0.5">•</span>
              <span className="text-xs font-bold text-emerald-400">
                {profile.favorite_club}
              </span>
            </>
          )}
        </div>
      )}
      <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.8] lg:leading-[0.8]">
        El Cestoball, <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 bg-[length:200%_auto] animate-text-shimmer">
          transformado en datos.
        </span>
      </h1>
      <p className="text-lg sm:text-xl text-slate-400 max-w-md mx-auto lg:mx-0 pt-4 leading-relaxed font-medium">
        Estadísticas en vivo, planilla técnica digital y gestión profesional. <br className="hidden sm:block" />
        <span className="text-slate-200">Creado por y para la comunidad del Cesto.</span>
      </p>
      {communityStats.totalGames !== null && communityStats.totalGames > 0 && (
        <div className="flex flex-wrap gap-3 pt-2 justify-center lg:justify-start">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <span className="text-xl font-black text-cyan-400 tabular-nums">
              {communityStats.totalGames.toLocaleString('es-AR')}
            </span>
            <span className="text-xs text-slate-400 font-bold">partidos registrados 🏐</span>
          </div>
          {communityStats.topTeams.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-xl font-black text-emerald-400">{communityStats.topTeams.length}</span>
              <span className="text-xs text-slate-400 font-bold">equipos activos esta semana</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
