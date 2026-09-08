import React from 'react';
import { ChartBarIcon, FeatureTapIcon } from '@/components/icons';

export const HomeFeatures: React.FC = () => {
  return (
    <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="group bg-slate-900/40 p-10 rounded-[2.5rem] border border-slate-800/50 flex flex-col items-center text-center transition-all duration-500 hover:bg-slate-800/40 hover:-translate-y-2">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-6 ring-1 ring-emerald-500/20 group-hover:ring-emerald-500/40 transition-all duration-500">
          <FeatureTapIcon className="h-8 w-8 text-emerald-400" />
        </div>
        <h3 className="text-xl font-black text-white mb-4 tracking-tight">Experiencia Fluida</h3>
        <p className="text-slate-400 leading-relaxed">
          Interfaz optimizada para un registro táctil veloz sin despegar la vista de la jugada.
        </p>
      </div>

      <div className="group bg-slate-900/40 p-10 rounded-[2.5rem] border border-slate-800/50 flex flex-col items-center text-center transition-all duration-500 hover:bg-slate-800/40 hover:-translate-y-2">
        <div className="w-16 h-16 bg-cyan-500/10 rounded-3xl flex items-center justify-center mb-6 ring-1 ring-cyan-500/20 group-hover:ring-cyan-500/40 transition-all duration-500">
          <span className="text-3xl">🏆</span>
        </div>
        <h3 className="text-xl font-black text-white mb-4 tracking-tight">Reportes de Elite</h3>
        <p className="text-slate-400 leading-relaxed">
          Genera automáticamente el <strong>Excel oficial para la Federación</strong> y resúmenes visuales
          listos para compartir.
        </p>
      </div>

      <div className="group bg-slate-900/40 p-10 rounded-[2.5rem] border border-slate-800/50 flex flex-col items-center text-center transition-all duration-500 hover:bg-slate-800/40 hover:-translate-y-2">
        <div className="w-16 h-16 bg-purple-500/10 rounded-3xl flex items-center justify-center mb-6 ring-1 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all duration-500">
          <ChartBarIcon className="h-8 w-8 text-purple-400" />
        </div>
        <h3 className="text-xl font-black text-white mb-4 tracking-tight">Control Total</h3>
        <p className="text-slate-400 leading-relaxed">
          Planilla técnica completa con registro de goles, triples, faltas, recuperos y asistencias en tiempo real.
        </p>
      </div>
    </div>
  );
};
