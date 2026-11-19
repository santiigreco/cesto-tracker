import React from 'react';
import { GameEvent, StatAction } from '../../types';
import { PencilIcon } from '../icons';

interface GameLogViewProps {
  log: GameEvent[];
  playerNames: Record<string, string>;
  onEventClick?: (event: GameEvent) => void;
}

const ACTION_LABELS: Record<StatAction, string> = {
  goles: 'GOL',
  triples: 'TRIPLE',
  fallos: 'FALLO',
  recuperos: 'RECUPERO',
  perdidas: 'PÉRDIDA',
  reboteOfensivo: 'REB. OF.',
  reboteDefensivo: 'REB. DEF.',
  asistencias: 'ASISTENCIA',
  golesContra: 'GOL EN CONTRA',
  faltasPersonales: 'FALTA',
};

const getActionBadgeClass = (action: StatAction): string => {
  if (action === 'goles') {
    return 'bg-sport-goal/15 text-sport-goal-light border-sport-goal/35';
  }
  if (action === 'triples') {
    return 'bg-sport-triple/15 text-sport-triple-light border-sport-triple/35';
  }
  if (
    action === 'fallos' ||
    action === 'perdidas' ||
    action === 'faltasPersonales' ||
    action === 'golesContra'
  ) {
    return 'bg-sport-miss/15 text-sport-miss-light border-sport-miss/35';
  }
  return 'bg-surface-card text-ink-secondary border-border-strong';
};

const getActionLabel = (action: StatAction) => ACTION_LABELS[action] || action.toUpperCase();

const GameLogView: React.FC<GameLogViewProps> = React.memo(
  ({ log, playerNames, onEventClick }) => {
    return (
      <section className="bg-surface-card border border-border-subtle p-3 sm:p-4 rounded-2xl shadow-card">
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            Registro de jugadas
          </h3>
          {log.length > 0 && (
            <span className="text-[11px] font-semibold text-ink-muted tabular-nums">
              {log.length} {log.length === 1 ? 'acción' : 'acciones'}
            </span>
          )}
        </div>

        {log.length > 0 ? (
          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {log.map((event) => {
              const playerDisplay =
                playerNames[event.playerNumber] ||
                (event.playerNumber === 'Equipo' ? 'Equipo' : `#${event.playerNumber}`);

              return (
                <div
                  key={event.id}
                  onClick={() => onEventClick && onEventClick(event)}
                  role={onEventClick ? 'button' : undefined}
                  tabIndex={onEventClick ? 0 : undefined}
                  onKeyDown={
                    onEventClick
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onEventClick(event);
                          }
                        }
                      : undefined
                  }
                  className={`min-h-[44px] flex justify-between items-center bg-surface-elevated/70 px-3 py-2 rounded-xl text-sm border border-border-subtle transition-colors group ${
                    onEventClick
                      ? 'cursor-pointer hover:bg-surface-elevated hover:border-border-strong'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`px-2 py-0.5 rounded-md border text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${getActionBadgeClass(
                        event.action
                      )}`}
                    >
                      {getActionLabel(event.action)}
                    </span>
                    <span className="text-ink-primary font-semibold truncate text-xs sm:text-sm">
                      {playerDisplay}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 ml-2 shrink-0 text-ink-muted">
                    <span className="text-[11px] tabular-nums">
                      {new Date(event.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {onEventClick && (
                      <PencilIcon className="h-3.5 w-3.5 text-ink-muted group-hover:text-brand transition-colors" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-ink-muted text-center text-xs sm:text-sm py-3">
            Todavía no hay acciones registradas.
          </p>
        )}
      </section>
    );
  }
);

export default GameLogView;
