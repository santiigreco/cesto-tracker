import React from 'react';
import TeamLogo from '@/components/ui/TeamLogo';

export const HomePhonePreview: React.FC = () => {
  return (
    <div className="flex-1 w-full flex flex-col items-center lg:items-end mt-8 lg:mt-0 relative select-none">
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] bg-gradient-to-tr from-cyan-500/15 via-emerald-500/10 to-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Modern Phone/Tablet Sports Mockup */}
      <div className="w-full max-w-sm sm:max-w-md relative transition-transform duration-500 ease-out hover:scale-[1.02]">
        
        {/* Device Frame */}
        <div className="bg-slate-950/90 backdrop-blur-2xl rounded-[2.5rem] border border-slate-700/70 p-4 sm:p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden">
          
          {/* Top Bar / Status */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                Planilla Oficial en Vivo
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
              2° Tiempo · 36'
            </span>
          </div>

          {/* Live Scoreboard Header */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 rounded-2xl p-4 border border-slate-800 mb-4 shadow-inner">
            <div className="flex items-center justify-between">
              {/* My Team */}
              <div className="flex items-center gap-2.5">
                <TeamLogo teamName="Vélez" className="h-9 w-9 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-black text-white leading-tight">Vélez</h4>
                  <span className="text-[10px] font-bold text-cyan-400">Capital</span>
                </div>
              </div>

              {/* Live Score */}
              <div className="text-center px-3">
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-1.5 tabular-nums">
                  <span className="text-cyan-400">64</span>
                  <span className="text-slate-600 text-lg">:</span>
                  <span className="text-slate-200">58</span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Tanteador</span>
              </div>

              {/* Rival Team (Corrientes) */}
              <div className="flex items-center gap-2.5 text-right">
                <div>
                  <h4 className="text-sm font-black text-white leading-tight">Regatas</h4>
                  <span className="text-[10px] font-bold text-emerald-400">Corrientes</span>
                </div>
                <TeamLogo teamName="Regatas" className="h-9 w-9 flex-shrink-0" />
              </div>
            </div>
          </div>

          {/* Tally Stats Live Table Preview */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500 px-2">
              <span>Jugador</span>
              <div className="flex items-center gap-3">
                <span className="w-8 text-center">Goles</span>
                <span className="w-8 text-center">Trip.</span>
                <span className="w-8 text-center">Rec.</span>
                <span className="w-8 text-center">Faltas</span>
              </div>
            </div>

            {/* Row 1: Active Hot Hand Player */}
            <div className="bg-slate-900/80 border border-cyan-500/30 rounded-xl p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-black text-xs flex items-center justify-center border border-cyan-500/30">
                  #10
                </span>
                <div className="flex flex-col">
                  <span className="font-bold text-white text-xs leading-none">M. García</span>
                  <span className="text-[9px] text-amber-400 font-bold flex items-center gap-0.5">
                    🔥 Mano Caliente
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 font-mono font-bold">
                <span className="w-8 text-center text-cyan-400 font-black text-sm">18</span>
                <span className="w-8 text-center text-emerald-400">2</span>
                <span className="w-8 text-center text-slate-300">4</span>
                <span className="w-8 text-center text-amber-400">2</span>
              </div>
            </div>

            {/* Row 2 */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-black text-xs flex items-center justify-center border border-slate-700">
                  #7
                </span>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-200 text-xs leading-none">L. Romero</span>
                  <span className="text-[9px] text-slate-500 font-medium">Capitán</span>
                </div>
              </div>
              <div className="flex items-center gap-3 font-mono font-bold">
                <span className="w-8 text-center text-white text-sm">12</span>
                <span className="w-8 text-center text-slate-400">0</span>
                <span className="w-8 text-center text-slate-300">6</span>
                <span className="w-8 text-center text-slate-400">1</span>
              </div>
            </div>

            {/* Row 3 */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-black text-xs flex items-center justify-center border border-slate-700">
                  #4
                </span>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-200 text-xs leading-none">S. Benítez</span>
                  <span className="text-[9px] text-slate-500 font-medium">Anotador</span>
                </div>
              </div>
              <div className="flex items-center gap-3 font-mono font-bold">
                <span className="w-8 text-center text-white text-sm">10</span>
                <span className="w-8 text-center text-emerald-400">1</span>
                <span className="w-8 text-center text-slate-300">2</span>
                <span className="w-8 text-center text-slate-400">3</span>
              </div>
            </div>
          </div>

          {/* Action Footer Indicator */}
          <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-400 font-medium text-[11px]">
              <span className="text-emerald-400">📊</span>
              <span>Exportación CADC oficial lista</span>
            </div>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-[10px] uppercase">
              Excel .xlsx
            </span>
          </div>

        </div>

        {/* Floating Highlight Badges */}
        <div
          className="hidden sm:flex absolute -right-6 top-16 bg-slate-900/95 backdrop-blur-xl p-3.5 rounded-2xl border border-cyan-500/40 shadow-2xl items-center gap-3 animate-float"
          style={{ animationDelay: '0.8s' }}
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 text-cyan-400 font-black text-base">
            ⚡
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Sincronización</p>
            <p className="text-xs font-black text-white leading-none">Nube en Tiempo Real</p>
          </div>
        </div>

        <div
          className="hidden sm:flex absolute -left-6 bottom-16 bg-slate-900/95 backdrop-blur-xl p-3.5 rounded-2xl border border-emerald-500/40 shadow-2xl items-center gap-3 animate-float"
          style={{ animationDelay: '1.6s' }}
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400 font-black text-base">
            📋
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Planilla Técnica</p>
            <p className="text-xs font-black text-white leading-none">Formato Oficial Excel</p>
          </div>
        </div>

      </div>

      {/* Mobile Badge */}
      <div className="lg:hidden mt-6 w-full bg-slate-900/70 border border-slate-800 p-4 rounded-2xl text-center backdrop-blur-md">
        <p className="text-slate-200 font-black text-sm">
          Planilla técnica oficial de Cestoball en vivo.
        </p>
        <p className="text-cyan-400 text-xs font-bold mt-0.5">
          Equipos oficiales de Capital y Corrientes integrados.
        </p>
      </div>
    </div>
  );
};
