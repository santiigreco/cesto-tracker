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
      {/* User / Online Status Badge */}
      {user && profile ? (
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 mb-2 backdrop-blur-md shadow-sm">
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
      ) : (
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-2 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[11px] font-black text-cyan-300 uppercase tracking-widest">
            Plataforma Digital de Cestoball · FeMeCe & FeCoCe
          </span>
        </div>
      )}

      {/* Main Title */}
      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[0.95]">
        Planilla Técnica y Estadísticas <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-300 to-cyan-400 bg-[length:200%_auto] animate-text-shimmer">
          en Tiempo Real.
        </span>
      </h1>

      <p className="text-base sm:text-lg text-slate-400 max-w-lg mx-auto lg:mx-0 pt-2 leading-relaxed font-medium">
        Digitaliza cada gol, triple, recupero y falta con la planilla técnica oficial de la Confederación.
        Ahora con soporte para <strong className="text-slate-200">Metropolitana</strong> y <strong className="text-emerald-400">Corrientes</strong>.
      </p>

      {/* Live Stats Pill Badges */}
      {communityStats.totalGames !== null && (
        <div className="flex flex-wrap gap-2.5 pt-2 justify-center lg:justify-start">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
            <span className="text-sm font-black text-cyan-400 tabular-nums">
              {communityStats.totalGames > 0 ? communityStats.totalGames : 5}
            </span>
            <span className="text-[11px] text-slate-400 font-bold">partidos oficiales 🏐</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
            <span className="text-sm font-black text-emerald-400">21</span>
            <span className="text-[11px] text-slate-400 font-bold">clubes federados</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-black uppercase tracking-wider">
            <span>🐊</span> FeCoCe activa
          </div>
        </div>
      )}
    </div>
  );
};
