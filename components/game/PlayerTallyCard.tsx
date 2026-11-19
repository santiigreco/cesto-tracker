import React from 'react';
import { TallyStatsPeriod, StatAction } from '../../types';
import { CheckIcon, PencilIcon, PlusIcon, XIcon } from '../icons';

const getStatButtonClasses = (statKey: StatAction): string => {
  if (statKey === 'goles') {
    return 'bg-sport-goal hover:bg-emerald-500 active:bg-emerald-700 text-white';
  }
  if (statKey === 'triples') {
    return 'bg-sport-triple hover:bg-sky-500 active:bg-sky-700 text-white';
  }
  if (
    statKey === 'fallos' ||
    statKey === 'perdidas' ||
    statKey === 'faltasPersonales' ||
    statKey === 'golesContra'
  ) {
    return 'bg-sport-miss/85 hover:bg-sport-miss active:bg-red-700 text-white';
  }
  return 'bg-brand-strong hover:bg-brand active:bg-cyan-600 text-ink-inverse';
};

const CompactTallyStat: React.FC<{
  statKey: StatAction;
  playerNumber: string;
  label: string;
  value: number;
  onUpdate: (playerNumber: string, stat: StatAction, change: 1) => void;
  readOnly?: boolean;
  disabled?: boolean;
}> = React.memo(({ statKey, playerNumber, label, value, onUpdate, readOnly, disabled }) => (
  <div className="flex flex-col items-center p-2.5 bg-surface-elevated border border-border-subtle rounded-xl gap-1.5 select-none touch-manipulation">
    <span className="text-xs text-ink-secondary text-center font-semibold tracking-tight">
      {label}
    </span>
    <div className="flex items-center justify-between w-full px-1">
      <span className="w-8 text-center text-xl font-extrabold tabular-nums text-ink-primary">
        {value}
      </span>
      {!readOnly && (
        <button
          type="button"
          onClick={() => onUpdate(playerNumber, statKey, 1)}
          disabled={disabled}
          className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 disabled:opacity-30 disabled:active:scale-100 touch-manipulation ${getStatButtonClasses(
            statKey
          )}`}
          aria-label={`Incrementar ${label}`}
          title={disabled ? `${label} al límite reglamentario` : `Incrementar ${label}`}
        >
          <PlusIcon className="w-5 h-5 stroke-[2.25]" />
        </button>
      )}
    </div>
  </div>
));

const statLabels: Record<keyof TallyStatsPeriod, string> = {
  goles: 'Goles',
  triples: 'Triples',
  fallos: 'Fallos',
  recuperos: 'Recuperos',
  perdidas: 'Pérdidas',
  reboteOfensivo: 'Reb. Of.',
  reboteDefensivo: 'Reb. Def.',
  asistencias: 'Asist.',
  golesContra: 'G. Contra',
  faltasPersonales: 'Faltas',
};

const PlayerTallyCard: React.FC<{
  playerNumber: string;
  playerName: string;
  isEditing: boolean;
  tempPlayerName: string;
  setTempPlayerName: (name: string) => void;
  onStartEdit: (player: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  playerTally: TallyStatsPeriod;
  onUpdate: (playerNumber: string, stat: StatAction, change: 1) => void;
  isReadOnly?: boolean;
}> = React.memo(
  ({
    playerNumber,
    playerName,
    isEditing,
    tempPlayerName,
    setTempPlayerName,
    onStartEdit,
    onSaveEdit,
    onCancelEdit,
    playerTally,
    onUpdate,
    isReadOnly,
  }) => {
    const isTeamCard = playerNumber === 'Equipo';
    const playerStatsToShow: StatAction[] = [
      'goles',
      'triples',
      'fallos',
      'recuperos',
      'perdidas',
      'reboteOfensivo',
      'reboteDefensivo',
      'asistencias',
      'faltasPersonales',
    ];
    const teamStatsToShow: (keyof TallyStatsPeriod)[] = [
      'recuperos',
      'perdidas',
      'golesContra',
    ];

    return (
      <div className="bg-surface-elevated/40 border border-border-subtle p-3.5 sm:p-4 rounded-2xl shadow-card">
        <div className="mb-3 min-h-[44px] flex items-center">
          {isEditing ? (
            <div className="flex items-center gap-2 w-full">
              <input
                type="text"
                maxLength={40}
                value={tempPlayerName}
                onChange={(e) => setTempPlayerName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSaveEdit();
                  if (e.key === 'Escape') onCancelEdit();
                }}
                autoFocus
                className="bg-surface-canvas border border-border-strong text-ink-primary text-base sm:text-sm rounded-xl focus:border-brand px-3 py-2 w-full"
                placeholder={`Nombre para #${playerNumber}`}
              />
              <button
                type="button"
                onClick={onSaveEdit}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-sport-goal hover:bg-emerald-500 text-white transition-colors shrink-0"
                title="Guardar nombre"
                aria-label="Guardar nombre"
              >
                <CheckIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-surface-elevated hover:bg-surface-hover border border-border-strong text-ink-secondary hover:text-ink-primary transition-colors shrink-0"
                title="Cancelar edición"
                aria-label="Cancelar edición"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!isReadOnly) onStartEdit(playerNumber);
              }}
              disabled={isTeamCard || isReadOnly}
              className="group min-h-[44px] flex items-center justify-between gap-2 text-lg sm:text-xl font-extrabold text-ink-primary px-2 -mx-2 rounded-xl hover:bg-surface-elevated/70 transition-colors w-full text-left disabled:cursor-default disabled:hover:bg-transparent"
              title={
                isTeamCard
                  ? 'Estadísticas del Equipo'
                  : isReadOnly
                    ? 'Jugadora (Modo Lectura)'
                    : 'Editar nombre de la jugadora'
              }
            >
              <span className="truncate">
                {isTeamCard ? 'Equipo' : playerName || `Jugadora #${playerNumber}`}
              </span>
              {!isTeamCard && !isReadOnly && (
                <PencilIcon className="h-4 w-4 text-ink-muted group-hover:text-brand shrink-0 transition-colors" />
              )}
            </button>
          )}
        </div>

        {!isTeamCard && (
          <div
            className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 mb-3 px-0.5"
            title={`${playerTally.faltasPersonales} de 6 faltas personales`}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-ink-muted mr-0.5">Faltas:</span>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full border transition-colors ${
                    i < playerTally.faltasPersonales
                      ? i === 4 && playerTally.faltasPersonales === 5
                        ? 'bg-sport-warn-light border-sport-warn'
                        : 'bg-sport-miss border-rose-400'
                      : 'bg-surface-canvas border-border-strong'
                  }`}
                />
              ))}
            </div>
            {playerTally.faltasPersonales >= 6 ? (
              <span className="text-[10px] font-extrabold text-sport-miss-light bg-sport-miss/15 border border-sport-miss/50 px-2 py-0.5 rounded-lg uppercase tracking-wider tabular-nums">
                CAMBIO OBLIGATORIO · 6F
              </span>
            ) : playerTally.faltasPersonales === 5 ? (
              <span className="text-[10px] font-extrabold text-sport-warn-light bg-sport-warn/15 border border-sport-warn/45 px-2 py-0.5 rounded-lg uppercase tracking-wider tabular-nums">
                EN CAPILLA · 5F
              </span>
            ) : null}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          {(isTeamCard ? teamStatsToShow : playerStatsToShow).map((statKey) => (
            <CompactTallyStat
              key={statKey}
              statKey={statKey as StatAction}
              playerNumber={playerNumber}
              label={statLabels[statKey as keyof TallyStatsPeriod]}
              value={playerTally[statKey as keyof TallyStatsPeriod]}
              onUpdate={onUpdate}
              readOnly={isReadOnly}
              disabled={statKey === 'faltasPersonales' && playerTally.faltasPersonales >= 6}
            />
          ))}
        </div>
      </div>
    );
  }
);

export default PlayerTallyCard;
