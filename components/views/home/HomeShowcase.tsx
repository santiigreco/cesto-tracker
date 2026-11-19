import React from 'react';

const MOCK_PLAYERS = [
  { number: '4', goals: 6, triples: 2, fouls: 1 },
  { number: '7', goals: 4, triples: 1, fouls: 3 },
  { number: '10', goals: 3, triples: 0, fouls: 5 },
];

/**
 * Static, lightweight preview aligned with the live stats sheet design tokens.
 */
export const HomeShowcase: React.FC = () => (
  <section
    aria-label="Vista previa de la planilla técnica"
    className="max-w-md w-full mx-auto mt-4 select-none pointer-events-none"
  >
    <div className="rounded-2xl border border-border-subtle bg-surface-card p-4 shadow-card">
      {/* Mini Broadcast Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
            Planilla en vivo
          </span>
          <span className="text-xs font-extrabold text-ink-primary tabular-nums">
            · 35 pts
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-surface-elevated border border-border-strong text-[11px] font-bold text-brand">
          1° Tiempo
        </span>
      </div>

      <div className="grid grid-cols-[2.5rem_1fr_1fr_1fr] gap-2 items-center text-center">
        <span className="text-[11px] font-bold text-ink-muted uppercase">Jug.</span>
        <span className="text-[11px] font-bold text-ink-muted uppercase">G (+2)</span>
        <span className="text-[11px] font-bold text-ink-muted uppercase">3P (+3)</span>
        <span className="text-[11px] font-bold text-ink-muted uppercase">Faltas</span>
        {MOCK_PLAYERS.map((p) => (
          <React.Fragment key={p.number}>
            <span className="h-9 w-9 mx-auto rounded-xl bg-surface-elevated border border-border-strong text-xs font-extrabold text-ink-primary flex items-center justify-center tabular-nums">
              #{p.number}
            </span>
            <span className="rounded-xl bg-sport-goal/15 border border-sport-goal/30 text-sport-goal-light font-extrabold py-2 text-sm tabular-nums">
              {p.goals}
            </span>
            <span className="rounded-xl bg-sport-triple/15 border border-sport-triple/30 text-sport-triple-light font-extrabold py-2 text-sm tabular-nums">
              {p.triples}
            </span>
            <span
              className={`rounded-xl border font-extrabold py-2 text-sm tabular-nums ${
                p.fouls >= 5
                  ? 'bg-sport-warn/15 border-sport-warn/35 text-sport-warn-light'
                  : 'bg-surface-elevated border-border-subtle text-ink-secondary'
              }`}
            >
              {p.fouls}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  </section>
);
