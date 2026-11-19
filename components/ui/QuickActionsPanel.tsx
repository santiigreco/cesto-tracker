import React from 'react';
import { StatAction } from '../../types';

interface QuickActionsPanelProps {
  onActionSelect: (action: StatAction) => void;
}

interface TechnicalActionItem {
  action: StatAction;
  label: string;
  tone: 'positive' | 'neutral' | 'negative';
}

const TECHNICAL_ACTIONS: TechnicalActionItem[] = [
  { action: 'recuperos', label: 'Recupero', tone: 'positive' },
  { action: 'asistencias', label: 'Asistencia', tone: 'positive' },
  { action: 'reboteOfensivo', label: 'Reb. Of.', tone: 'neutral' },
  { action: 'reboteDefensivo', label: 'Reb. Def.', tone: 'neutral' },
  { action: 'perdidas', label: 'Pérdida', tone: 'negative' },
  { action: 'faltasPersonales', label: 'Falta', tone: 'negative' },
];

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = React.memo(({ onActionSelect }) => {
  return (
    <section
      aria-label="Panel de anotación rápida"
      className="w-full bg-surface-card border border-border-subtle p-3 sm:p-4 rounded-2xl shadow-card"
    >
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
          Registrar acción
        </h3>
        <span className="text-[11px] text-ink-muted hidden xs:inline">
          Tiro · Técnicas
        </span>
      </div>

      {/* Primary Scoring Row: GOL (+2), TRIPLE (+3), FALLO */}
      <div className="grid grid-cols-12 gap-2 sm:gap-2.5">
        <button
          type="button"
          onClick={() => onActionSelect('goles')}
          className="col-span-5 min-h-[72px] sm:min-h-[82px] px-2 rounded-xl bg-sport-goal hover:bg-emerald-500 active:bg-emerald-700 text-white border border-emerald-400/20 flex flex-col items-center justify-center gap-0.5 active:scale-[0.97] active:brightness-95 transition-all duration-75 touch-manipulation select-none"
        >
          <span className="text-lg sm:text-xl font-black tracking-tight leading-none">
            GOL
          </span>
          <span className="text-[11px] font-bold text-emerald-100/90 tabular-nums">
            +2 pts
          </span>
        </button>

        <button
          type="button"
          onClick={() => onActionSelect('triples')}
          className="col-span-4 min-h-[72px] sm:min-h-[82px] px-2 rounded-xl bg-sport-triple hover:bg-sky-500 active:bg-sky-700 text-white border border-sky-400/20 flex flex-col items-center justify-center gap-0.5 active:scale-[0.97] active:brightness-95 transition-all duration-75 touch-manipulation select-none"
        >
          <span className="text-sm xs:text-base sm:text-lg font-black tracking-tight leading-none">
            TRIPLE
          </span>
          <span className="text-[11px] font-bold text-sky-100/90 tabular-nums">
            +3 pts
          </span>
        </button>

        <button
          type="button"
          onClick={() => onActionSelect('fallos')}
          className="col-span-3 min-h-[72px] sm:min-h-[82px] px-1.5 rounded-xl bg-sport-miss hover:bg-red-500 active:bg-red-700 text-white border border-rose-400/20 flex flex-col items-center justify-center gap-0.5 active:scale-[0.97] active:brightness-95 transition-all duration-75 touch-manipulation select-none"
        >
          <span className="text-sm xs:text-base font-black tracking-tight leading-none">
            FALLO
          </span>
          <span className="text-[11px] font-semibold text-rose-100/80 tabular-nums">
            0 pts
          </span>
        </button>
      </div>

      {/* Secondary Technical & Foul Grid (3x2) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mt-2.5">
        {TECHNICAL_ACTIONS.map(({ action, label, tone }) => {
          const isNegative = tone === 'negative';
          const dotColor =
            tone === 'positive'
              ? 'bg-sport-goal-light'
              : tone === 'negative'
                ? 'bg-sport-miss-light'
                : 'bg-brand';

          return (
            <button
              key={action}
              type="button"
              onClick={() => onActionSelect(action)}
              className={`min-h-[56px] sm:min-h-[60px] px-2 rounded-xl font-bold text-xs xs:text-sm text-center leading-tight flex flex-col items-center justify-center gap-1 border active:scale-[0.97] transition-all duration-75 touch-manipulation select-none ${
                isNegative
                  ? 'bg-sport-miss/10 hover:bg-sport-miss/20 active:bg-sport-miss/25 border-sport-miss/35 text-rose-200'
                  : 'bg-surface-elevated hover:bg-surface-hover active:bg-surface-hover border-border-strong text-ink-primary'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
});

export default QuickActionsPanel;
