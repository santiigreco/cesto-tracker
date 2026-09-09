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
    <div className="w-full grid grid-cols-6 gap-3 sm:gap-4 mt-2">
      
      {/* Official Federation Badge Header */}
      <div className="col-span-6 flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-9 h-9 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
            <span className="text-base">📋</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-[11px] font-black text-white uppercase tracking-wider">
                Planilla Oficial CADC / Federaciones
              </h4>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-[9px] font-black text-emerald-300 uppercase">
                Excel .xlsx
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Exportación técnica reglamentaria en tiempo real lista para enviar a la mesa.
            </p>
          </div>
        </div>
      </div>

      {/* Main Start Action: Command Center Card */}
      <div
        onClick={onStartClick}
        className="col-span-6 group relative rounded-[2rem] bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-700/70 hover:border-cyan-400/70 transition-all duration-300 cursor-pointer overflow-hidden shadow-2xl p-6 sm:p-7"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-cyan-500/15 blur-2xl group-hover:bg-cyan-500/25 transition-all"></div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl shadow-lg shadow-cyan-500/30 transform group-hover:scale-105 group-hover:rotate-1 transition-all">
              <FeatureTapIcon className="h-7 w-7 text-slate-950 font-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  Nuevo Partido
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase">
                  En Vivo
                </span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm font-medium mt-0.5">
                Selecciona tu club de Metro o Corrientes y empieza a anotar.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 border border-slate-700 group-hover:border-cyan-400 text-slate-400 group-hover:text-cyan-400 transition-all">
            <svg className="h-5 w-5 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Quick Resume Card (if previous setup exists) */}
      {lastSetup && (
        <div className="col-span-6 flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 px-5 py-3.5 backdrop-blur-sm shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xl">⚡</span>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                Reanudar Plantel Habitual
              </p>
              <p className="text-sm font-black text-white truncate">
                {lastSetup.myTeam}
                {lastSetup.players && lastSetup.players.length > 0 && (
                  <span className="text-slate-400 font-medium"> · {lastSetup.players.length} jugadores</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onQuickStart}
            className="flex-shrink-0 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all hover:scale-105 shadow-md shadow-emerald-900/30"
          >
            Continuar →
          </button>
        </div>
      )}

      {/* Historial de Partidos Guardados */}
      <div
        onClick={user ? onLoadGameClick : onLogin}
        className="col-span-6 group relative rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-md p-4 sm:p-5 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-slate-800 rounded-xl group-hover:bg-emerald-500/20 group-hover:text-emerald-400 text-slate-400 transition-colors border border-slate-700/60">
              <CloudDownloadIcon className="h-5 w-5" />
            </div>
            <div>
              <h5 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                Mis Partidos & Planillas Oficiales
              </h5>
              {!user ? (
                <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5 mt-0.5">
                  <LockIcon className="h-3.5 w-3.5 text-cyan-400" /> Inicia sesión para guardar y sincronizar con la nube
                </span>
              ) : (
                <span className="text-[11px] text-emerald-400 font-bold block mt-0.5">
                  Historial en la nube y visor comunitario disponible
                </span>
              )}
            </div>
          </div>

          <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">
            Explorar →
          </span>
        </div>
      </div>

      {/* PWA Install Card */}
      <div className="col-span-6">
        <InstallApp variant="card" />
      </div>

    </div>
  );
};
