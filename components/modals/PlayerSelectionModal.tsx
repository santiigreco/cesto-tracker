import React, { useEffect, useState } from 'react';
import ModalShell from '../ui/ModalShell';
import { FlameIcon, PlusIcon, SnowflakeIcon } from '../icons';
import { StatAction } from '../../types';

interface PlayerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlayer: (playerNumber: string) => void;
  onAddPlayer?: (playerNumber: string, playerName?: string) => string | null;
  players: string[];
  playerNames: Record<string, string>;
  actionLabel: string;
  actionKey?: StatAction | null;
  playerStatuses?: Record<string, string[]>;
  recentCount?: number;
}

const getActionPillClass = (actionKey?: StatAction | null): string => {
  if (actionKey === 'goles') {
    return 'bg-sport-goal/20 text-sport-goal-light border-sport-goal/40';
  }
  if (actionKey === 'triples') {
    return 'bg-sport-triple/20 text-sport-triple-light border-sport-triple/40';
  }
  if (
    actionKey === 'fallos' ||
    actionKey === 'perdidas' ||
    actionKey === 'faltasPersonales' ||
    actionKey === 'golesContra'
  ) {
    return 'bg-sport-miss/20 text-sport-miss-light border-sport-miss/40';
  }
  return 'bg-brand/15 text-brand border-brand/35';
};

const PlayerSelectionModal: React.FC<PlayerSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectPlayer,
  onAddPlayer,
  players,
  playerNames,
  actionLabel,
  actionKey,
  playerStatuses = {},
  recentCount = 0,
}) => {
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customNumber, setCustomNumber] = useState('');
  const [customName, setCustomName] = useState('');
  const [customError, setCustomError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsAddingCustom(false);
      setCustomNumber('');
      setCustomName('');
      setCustomError(null);
    }
  }, [isOpen]);

  const handlePlayerClick = (playerNumber: string) => {
    onSelectPlayer(playerNumber);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddPlayer) return;

    const parsed = parseInt(customNumber.trim(), 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 99) {
      setCustomError('Ingresá un dorsal del 1 al 99');
      return;
    }

    const addedKey = onAddPlayer(String(parsed), customName.trim() || undefined);
    if (!addedKey) {
      setCustomError('Ingresá un dorsal del 1 al 99');
      return;
    }

    setIsAddingCustom(false);
    setCustomNumber('');
    setCustomName('');
    setCustomError(null);
    onSelectPlayer(addedKey);
  };

  const recentPlayers = players.slice(0, recentCount);
  const otherPlayers = players.slice(recentCount);

  const customFooter = onAddPlayer ? (
    !isAddingCustom ? (
      <button
        type="button"
        onClick={() => {
          setIsAddingCustom(true);
          setCustomError(null);
        }}
        className="w-full min-h-[44px] rounded-xl bg-surface-elevated hover:bg-surface-hover border border-dashed border-brand/45 text-brand font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 touch-manipulation"
      >
        <PlusIcon className="h-4 w-4" />
        <span>Otro dorsal (16–99)</span>
      </button>
    ) : (
      <form onSubmit={handleCustomSubmit} className="space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={99}
            autoFocus
            value={customNumber}
            onChange={(e) => {
              setCustomNumber(e.target.value.slice(0, 2));
              if (customError) setCustomError(null);
            }}
            placeholder="N°"
            aria-label="Número de dorsal"
            className="w-full sm:w-24 bg-surface-canvas border border-border-strong rounded-xl px-3 py-2 text-base sm:text-sm font-bold text-ink-primary placeholder-ink-muted focus:border-brand tabular-nums"
          />
          <input
            type="text"
            maxLength={30}
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Nombre (opcional)"
            aria-label="Nombre de jugadora opcional"
            className="flex-1 min-w-0 bg-surface-canvas border border-border-strong rounded-xl px-3 py-2 text-base sm:text-sm font-medium text-ink-primary placeholder-ink-muted focus:border-brand"
          />
        </div>
        {customError && (
          <p className="text-xs text-sport-miss-light font-medium px-1">{customError}</p>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 min-h-[44px] rounded-xl bg-brand hover:bg-brand-hover text-ink-inverse font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-colors touch-manipulation"
          >
            Agregar
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAddingCustom(false);
              setCustomError(null);
            }}
            className="px-4 min-h-[44px] rounded-xl bg-surface-elevated hover:bg-surface-hover text-ink-secondary font-bold text-xs sm:text-sm border border-border-strong transition-colors touch-manipulation"
          >
            Cancelar
          </button>
        </div>
      </form>
    )
  ) : undefined;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      titleId="player-selection-modal-title"
      maxWidth="md"
      zIndexClass="z-[90]"
      title={
        <span className="flex flex-wrap items-center gap-2">
          <span>Asignar</span>
          <span
            className={`px-2.5 py-0.5 rounded-lg border text-sm font-extrabold uppercase tracking-wider ${getActionPillClass(
              actionKey
            )}`}
          >
            {actionLabel}
          </span>
        </span>
      }
      subtitle="Tocá el dorsal correspondiente"
      footer={customFooter}
    >
      <div className="space-y-5">
        {recentPlayers.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="text-[11px] font-bold text-ink-muted uppercase tracking-wider px-0.5">
              En actividad
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {recentPlayers.map((player) => (
                <PlayerButton
                  key={player}
                  player={player}
                  name={playerNames[player]}
                  statuses={playerStatuses[player] || []}
                  onClick={() => handlePlayerClick(player)}
                />
              ))}
            </div>
          </div>
        )}

        {recentPlayers.length > 0 && otherPlayers.length > 0 && (
          <hr className="border-border-subtle" />
        )}

        {otherPlayers.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="text-[11px] font-bold text-ink-muted uppercase tracking-wider px-0.5">
              {recentPlayers.length > 0 ? 'Plantel' : 'Jugadoras'}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {otherPlayers.map((player) => (
                <PlayerButton
                  key={player}
                  player={player}
                  name={playerNames[player]}
                  statuses={playerStatuses[player] || []}
                  onClick={() => handlePlayerClick(player)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  );
};

const PlayerButton: React.FC<{
  player: string;
  name?: string;
  statuses: string[];
  onClick: () => void;
}> = ({ player, name, statuses, onClick }) => {
  const isFoulOut = statuses.includes('foul-out') || statuses.includes('🛑');
  const isFoulWarn = statuses.includes('foul-warning') || statuses.includes('⚠️');
  const isHot = statuses.includes('hot') || statuses.includes('🔥');
  const isCold = statuses.includes('cold') || statuses.includes('❄️');

  const containerClass = isFoulOut
    ? 'border-2 border-sport-miss bg-sport-miss/15 hover:bg-sport-miss/25'
    : isFoulWarn
      ? 'border-2 border-sport-warn bg-sport-warn/15 hover:bg-sport-warn/25'
      : 'bg-surface-elevated hover:bg-surface-hover border border-border-strong';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-2.5 min-h-[64px] rounded-xl text-ink-primary transition-all active:scale-[0.97] text-center flex flex-col items-center justify-center gap-0.5 relative touch-manipulation select-none ${containerClass}`}
    >
      <div className="flex items-center justify-center gap-1.5">
        <span className="text-lg sm:text-xl font-black leading-none tabular-nums">
          {player === 'Equipo' ? 'Equipo' : `#${player}`}
        </span>
        {isFoulOut && (
          <span className="px-1.5 py-0.5 rounded bg-sport-miss text-white text-[9px] font-black leading-none tabular-nums">
            6F
          </span>
        )}
        {!isFoulOut && isFoulWarn && (
          <span className="px-1.5 py-0.5 rounded bg-sport-warn text-ink-inverse text-[9px] font-black leading-none tabular-nums">
            5F
          </span>
        )}
        {isHot && <FlameIcon className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
        {isCold && <SnowflakeIcon className="h-3.5 w-3.5 text-sky-400 shrink-0" />}
      </div>
      {name && player !== 'Equipo' && (
        <span className="text-[11px] text-ink-secondary font-medium truncate max-w-full leading-tight">
          {name}
        </span>
      )}
    </button>
  );
};

export default PlayerSelectionModal;
