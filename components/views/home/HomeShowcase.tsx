import React from 'react';

const MOCK_PLAYERS = [
  { number: '4', goals: 6, triples: 2, fouls: 1 },
  { number: '7', goals: 4, triples: 1, fouls: 3 },
  { number: '10', goals: 3, triples: 0, fouls: 2 },
];

/**
 * Static, lightweight (HTML/CSS only) preview of the live stats sheet.
 * Purely illustrative: no images, no network, no interactivity.
 */
export const HomeShowcase: React.FC = () => (
  <section
    aria-label="Vista previa de la planilla técnica"
    className="max-w-md mx-auto mt-6 px-4 select-none pointer-events-none"
  >
    <div className="rounded-3xl border border-slate-700/70 bg-slate-900/80 p-4 shadow-2xl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Planilla en vivo</span>
        <span className="text-xs font-bold text-emerald-300">1° Tiempo</span>
      </div>

      <div className="grid grid-cols-[2.5rem_1fr_1fr_1fr] gap-x-2 gap-y-2 items-center text-center">
        <span />
        <span className="text-xs font-bold text-slate-400">Goles</span>
        <span className="text-xs font-bold text-slate-400">Triples</span>
        <span className="text-xs font-bold text-slate-400">Faltas</span>
        {MOCK_PLAYERS.map(p => (
          <React.Fragment key={p.number}>
            <span className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 text-sm font-black text-white flex items-center justify-center">
              {p.number}
            </span>
            <span className="rounded-xl bg-cyan-500/15 text-cyan-300 font-black py-2">{p.goals}</span>
            <span className="rounded-xl bg-emerald-500/15 text-emerald-300 font-black py-2">{p.triples}</span>
            <span className="rounded-xl bg-slate-800 text-slate-200 font-black py-2">{p.fouls}</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  </section>
);
