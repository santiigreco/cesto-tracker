import React from 'react';
import PhoneMockup from '@/components/ui/PhoneMockup';

const TrendingUpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className || 'h-6 w-6'}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TallyMockup = () => (
  <PhoneMockup>
    <div className="flex flex-col h-full bg-slate-800 p-3">
      <div className="bg-slate-900 p-2 rounded mb-3 text-center border border-slate-700">
        <p className="text-xs text-slate-400">Jugador seleccionado</p>
        <p className="text-lg font-bold text-cyan-400">#10</p>
      </div>
      <div className="flex gap-2 h-full">
        <div className="grid grid-cols-2 gap-2 w-2/3">
          {['Recupero', 'Pérdida', 'Asistencia', 'Rebote', 'Falta', 'Tapa'].map(label => (
            <div
              key={label}
              className="bg-slate-700 rounded flex items-center justify-center text-[10px] font-bold text-slate-300"
            >
              {label}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 w-1/3">
          <div className="bg-green-600 rounded flex-1 flex flex-col items-center justify-center shadow-lg">
            <span className="text-xl font-bold text-white">GOL</span>
          </div>
          <div className="bg-red-600 rounded flex-1 flex flex-col items-center justify-center shadow-lg">
            <span className="text-xl font-bold text-white">FALLO</span>
          </div>
        </div>
      </div>
      <div className="mt-3 bg-slate-900 p-2 rounded border border-slate-700">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Última acción:</span>
          <span>Hace 2s</span>
        </div>
        <div className="text-sm font-bold text-white flex items-center gap-2">
          <span className="text-green-400">[GOL]</span> #10
        </div>
      </div>
    </div>
  </PhoneMockup>
);

export const HomePhonePreview: React.FC = () => {
  return (
    <div className="flex-1 w-full flex flex-col items-center lg:items-end mt-8 lg:mt-0 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-cyan-500/10 to-emerald-500/10 blur-[80px] rounded-full pointer-events-none"></div>
      <div className="hidden lg:block relative transition-transform duration-500 ease-out hover:scale-105 cursor-pointer">
        <TallyMockup />
        <div
          className="absolute -right-12 top-20 bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl border border-slate-600/50 shadow-2xl flex items-center gap-3 animate-float"
          style={{ animationDelay: '1s' }}
        >
          <div className="bg-green-500/20 p-2 rounded-xl">
            <TrendingUpIcon className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Efectividad</p>
            <p className="text-xl font-bold text-white leading-none">+85%</p>
          </div>
        </div>
      </div>
      <div className="lg:hidden mt-8 w-full bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl text-center backdrop-blur-sm">
        <p className="text-slate-200 font-bold text-lg mb-1">
          Planilla técnica y estadísticas en tu bolsillo.
        </p>
        <p className="text-cyan-400 text-sm font-medium">PWA · Sin instalar desde la tienda.</p>
      </div>
    </div>
  );
};
