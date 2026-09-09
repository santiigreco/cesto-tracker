import React from 'react';

export const HomeVisualShowcase: React.FC = () => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 select-none">
      {/* Container Card: Annotation Interface Mockup */}
      <div className="relative rounded-3xl bg-slate-900/90 border border-slate-750 backdrop-blur-xl shadow-2xl p-5 sm:p-7 overflow-hidden">
        
        {/* Subtle Ambient Backlight */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

        {/* 1. Header Bar: Match Context */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-black text-white uppercase tracking-wider">
              Vélez <span className="text-cyan-400 font-mono">26</span> : <span className="text-slate-300 font-mono">22</span> Regatas
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-750">
            1° Tiempo · Oficial
          </span>
        </div>

        {/* 2. Active Player Annotation Card */}
        <div className="mt-5 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 relative z-10">
          
          {/* Player Identity and Fouls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-850">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 font-black text-sm flex items-center justify-center border border-cyan-500/30 font-mono">
                #10
              </span>
              <div>
                <h4 className="text-base font-black text-white leading-tight">Martín García</h4>
                <span className="text-xs text-slate-400 font-medium">Delantero · Titular</span>
              </div>
            </div>

            {/* Personal Fouls Indicator (Cesto Rules: 5 max) */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400">Faltas:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
              </div>
              <span className="text-[11px] font-mono font-bold text-red-400 ml-1">2/5</span>
            </div>
          </div>

          {/* Action Pad: Simulating the Moment of Scoring */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mt-4">
            
            {/* Active Highlighted Button: +2 Gol (Moment of Click Feedback) */}
            <div className="relative col-span-1 p-3 rounded-xl bg-cyan-500/15 border-2 border-cyan-400 text-center shadow-lg shadow-cyan-500/20 flex flex-col items-center justify-center">
              <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[9px] font-black uppercase tracking-wider">
                +2
              </span>
              <span className="text-xs sm:text-sm font-black text-cyan-300 uppercase tracking-tight">
                Gol
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-white mt-0.5">
                8
              </span>
            </div>

            {/* +3 Triple */}
            <div className="col-span-1 p-3 rounded-xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center justify-center">
              <span className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-tight">
                Triple
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-0.5">
                1
              </span>
            </div>

            {/* Recupero */}
            <div className="col-span-1 p-3 rounded-xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center justify-center">
              <span className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-tight">
                Recupero
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-slate-200 mt-0.5">
                4
              </span>
            </div>

            {/* Falta Personal */}
            <div className="col-span-1 p-3 rounded-xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center justify-center">
              <span className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-tight">
                Falta
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-red-400 mt-0.5">
                2
              </span>
            </div>

            {/* Asistencia */}
            <div className="col-span-1 p-3 rounded-xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center justify-center">
              <span className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-tight">
                Asistencia
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-slate-200 mt-0.5">
                3
              </span>
            </div>

            {/* Pérdida */}
            <div className="col-span-1 p-3 rounded-xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center justify-center">
              <span className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-tight">
                Pérdida
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-slate-400 mt-0.5">
                1
              </span>
            </div>

          </div>

          {/* 3. Action Feedback Toast (Clean and Direct) */}
          <div className="mt-4 flex items-center gap-2.5 bg-emerald-950/40 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-emerald-300 text-xs font-semibold">
            <span className="text-emerald-400 font-black">✓</span>
            <span>+2 Gol registrado para #10 Martín García · Tanteador actualizado</span>
          </div>

        </div>

      </div>
    </div>
  );
};
