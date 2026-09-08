import React from 'react';
import { FeatureTapIcon } from '@/components/icons';
import InstallApp from '@/components/views/InstallApp';

const CloudDownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className || 'h-6 w-6'}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 17l-4-4m0 0l4-4m-4 4h12" />
  </svg>
);

const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className || 'h-4 w-4'}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
      clipRule="evenodd"
    />
  </svg>
);

export interface LastSetupData {
  myTeam: string;
  players?: string[];
  playerNames?: Record<string, string>;
}

interface HomeActionGridProps {
  onStartClick: () => void;
  lastSetup: LastSetupData | null;
  onQuickStart: () => void;
  onLoadGameClick: () => void;
  user?: any;
  onLogin?: () => void;
}

export const HomeActionGrid: React.FC<HomeActionGridProps> = ({
  onStartClick,
  lastSetup,
  onQuickStart,
  onLoadGameClick,
  user,
  onLogin,
}) => {
  return (
    <div className="w-full grid grid-cols-6 gap-3 sm:gap-4 mt-4">
      {/* Official Federation Badge */}
      <div className="col-span-6 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 mb-2 shadow-sm pointer-events-none">
        <div className="flex-shrink-0 w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
          <CloudDownloadIcon className="h-5 w-5 text-emerald-400" />
        </div>
        <div className="flex-grow">
          <div className="flex items-center gap-2">
            <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">
              Reporte para la Federación
            </h4>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-[8px] font-bold text-emerald-300 uppercase">
              Oficial
            </span>
          </div>
          <p className="text-xs text-slate-300 font-medium leading-tight">
            Genera automáticamente la planilla de estadísticas para enviar a la Federación.
          </p>
        </div>
      </div>

      {/* Empezar Partido */}
      <div
        onClick={onStartClick}
        className="col-span-6 group relative h-40 rounded-[2.5rem] bg-slate-900 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-500 cursor-pointer overflow-hidden shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-cyan-500/10 blur-3xl group-hover:bg-cyan-500/20 transition-all duration-500"></div>
        <div className="relative h-full flex flex-col justify-center px-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-cyan-500 rounded-2xl shadow-lg shadow-cyan-500/30 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <FeatureTapIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                Empezar Partido
              </h3>
              <p className="text-cyan-400/80 text-xs font-bold uppercase tracking-widest">
                Planilla digital en vivo
              </p>
            </div>
          </div>
          <p className="text-slate-400 text-sm max-w-[240px] leading-snug">
            Planifica, registra y analiza cada jugada con herramientas profesionales.
          </p>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500">
          <svg className="h-12 w-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Quick Start (si existe setup previo) */}
      {lastSetup && (
        <div className="col-span-6 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-3">
          <span className="text-lg">⚡</span>
          <div className="flex-grow min-w-0">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
              Acceso rápido
            </p>
            <p className="text-sm font-bold text-white truncate">
              {lastSetup.myTeam}
              {lastSetup.players && lastSetup.players.length > 0 && (
                <span className="text-slate-400 font-normal"> · {lastSetup.players.length} jugadoras</span>
              )}
            </p>
          </div>
          <button
            onClick={onQuickStart}
            className="flex-shrink-0 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs uppercase tracking-widest px-4 py-2 rounded-xl transition-all hover:scale-105 shadow-lg shadow-emerald-900/20"
          >
            Continuar →
          </button>
        </div>
      )}

      {/* Historial de Partidos */}
      <div
        onClick={user ? onLoadGameClick : onLogin}
        className="col-span-6 group relative h-32 rounded-[2rem] bg-slate-800/40 border border-slate-700/50 hover:border-emerald-400/50 transition-all duration-500 cursor-pointer overflow-hidden backdrop-blur-md"
      >
        <div className="absolute inset-0 bg-gradient-to-l from-emerald-400/5 to-transparent" />
        <div className="p-5 flex items-center justify-center sm:justify-start gap-4 h-full">
          <div className="p-3 bg-slate-900 rounded-xl group-hover:bg-emerald-500/10 transition-colors">
            <CloudDownloadIcon className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h5 className="text-xl font-black text-white uppercase tracking-tighter">
              Historial de Partidos
            </h5>
            {!user ? (
              <span className="text-[10px] text-slate-500 block flex items-center gap-1 font-bold mt-1">
                <LockIcon className="h-3 w-3" /> INICIÁ SESIÓN PARA VER TUS PARTIDOS
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 block font-bold mt-1 uppercase">
                Recuperá y continuá tracking
              </span>
            )}
          </div>
        </div>
      </div>

      {/* PWA Install Card */}
      <div className="col-span-6">
        <InstallApp variant="card" />
      </div>
    </div>
  );
};
