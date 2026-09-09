import React from 'react';

// Minimalist Sports SVG Icons
const WhistleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className || "w-7 h-7"}
  >
    {/* Clean Sports Whistle Icon */}
    <path d="M11 5a5 5 0 0 0-5 5v1a5 5 0 0 0 10 0v-1a5 5 0 0 0-5-5z" />
    <path d="M16 10h5a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-5" />
    <circle cx="11" cy="10" r="2" />
    <path d="M11 15v5" />
  </svg>
);

const StopwatchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className || "w-7 h-7"}
  >
    {/* Stopwatch / Precision Timer Icon */}
    <circle cx="12" cy="14" r="8" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="14" x2="15" y2="11" />
    <line x1="10" y1="2" x2="14" y2="2" />
  </svg>
);

const MedalIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className || "w-7 h-7"}
  >
    {/* Sports Medal / Championship Trophy Icon */}
    <circle cx="12" cy="15" r="5" />
    <path d="M8.21 13.89L7 2l5 3 5-3-1.21 11.89" />
  </svg>
);

export const HomeFeatures: React.FC = () => {
  return (
    <section className="mt-16 sm:mt-24 max-w-5xl mx-auto w-full px-4">
      {/* Bento Grid: 3 Clean Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        
        {/* Pilar 1: Anotación Ágil */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-7 flex flex-col items-start transition-all duration-300 hover:border-cyan-500/40 hover:bg-slate-900/90 group">
          <div className="w-13 h-13 p-3.5 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
            <WhistleIcon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white mt-5 mb-2 tracking-tight">
            Anotación Ágil
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed font-normal">
            Carga puntos, faltas y cambios al instante con un solo toque sin perder el ritmo del partido.
          </p>
        </div>

        {/* Pilar 2: Precisión Técnica */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-7 flex flex-col items-start transition-all duration-300 hover:border-emerald-500/40 hover:bg-slate-900/90 group">
          <div className="w-13 h-13 p-3.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
            <StopwatchIcon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white mt-5 mb-2 tracking-tight">
            Precisión Técnica
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed font-normal">
            Formatos oficiales y validaciones integradas para respetar al 100% el reglamento de la CADC.
          </p>
        </div>

        {/* Pilar 3: Estadísticas Consolidadas */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-7 flex flex-col items-start transition-all duration-300 hover:border-purple-500/40 hover:bg-slate-900/90 group">
          <div className="w-13 h-13 p-3.5 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-400 group-hover:scale-105 transition-transform">
            <MedalIcon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white mt-5 mb-2 tracking-tight">
            Estadísticas Consolidadas
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed font-normal">
            Reportes claros y listos al finalizar: efectividad, tanteador final y exportación directa a Excel.
          </p>
        </div>

      </div>
    </section>
  );
};
