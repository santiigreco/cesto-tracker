import React, { useState, useEffect } from 'react';
import { GameEvent, StatAction } from '../../types';
import { STAT_LABELS } from '../../constants';
import ModalShell from '../ui/ModalShell';
import { CheckIcon, TrashIcon } from '../icons';

interface GameEventEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: GameEvent;
  onSave: (event: GameEvent, newPlayer: string, newAction: StatAction) => void;
  onDelete: (eventId: string) => void;
  playerNames: Record<string, string>;
  availablePlayers: string[];
}

const GameEventEditModal: React.FC<GameEventEditModalProps> = ({
  isOpen,
  onClose,
  event,
  onSave,
  onDelete,
  playerNames,
  availablePlayers,
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<string>(event.playerNumber);
  const [selectedAction, setSelectedAction] = useState<StatAction>(event.action);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    setSelectedPlayer(event.playerNumber);
    setSelectedAction(event.action);
    setIsConfirmingDelete(false);
  }, [event, isOpen]);

  const handleSave = () => {
    onSave(event, selectedPlayer, selectedAction);
    onClose();
  };

  const handleDeleteClick = () => {
    if (isConfirmingDelete) {
      onDelete(event.id);
      onClose();
    } else {
      setIsConfirmingDelete(true);
    }
  };

  const allPlayers = ['Equipo', ...availablePlayers];

  const modalFooter = (
    <div className="flex gap-2.5">
      <button
        type="button"
        onClick={handleDeleteClick}
        onMouseLeave={() => isConfirmingDelete && setIsConfirmingDelete(false)}
        className={`flex-1 min-h-[44px] flex items-center justify-center gap-2 border font-bold py-2.5 px-4 rounded-xl transition-colors text-sm ${
          isConfirmingDelete
            ? 'bg-sport-miss text-white border-sport-miss hover:bg-red-500'
            : 'bg-sport-miss/15 text-sport-miss-light border-sport-miss/40 hover:bg-sport-miss/25'
        }`}
      >
        <TrashIcon className="h-4 w-4 shrink-0" />
        <span>{isConfirmingDelete ? '¿Confirmar?' : 'Eliminar'}</span>
      </button>
      <button
        type="button"
        onClick={handleSave}
        className="flex-[2] min-h-[44px] flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-ink-inverse font-extrabold py-2.5 px-4 rounded-xl transition-colors text-sm"
      >
        <CheckIcon className="h-4 w-4 shrink-0" />
        <span>Guardar</span>
      </button>
    </div>
  );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Jugada"
      subtitle="Corregí la jugadora o el tipo de acción registrada"
      titleId="edit-event-modal-title"
      maxWidth="md"
      zIndexClass="z-[90]"
      footer={modalFooter}
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="edit-event-player"
            className="block text-xs font-bold text-ink-secondary uppercase tracking-wider mb-1.5"
          >
            Jugadora
          </label>
          <select
            id="edit-event-player"
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            className="w-full min-h-[48px] bg-surface-elevated border border-border-strong rounded-xl px-3.5 py-2.5 text-base sm:text-sm font-semibold text-ink-primary focus:border-brand"
          >
            {allPlayers.map((p) => (
              <option key={p} value={p}>
                {playerNames[p] || (p === 'Equipo' ? 'Equipo' : `#${p}`)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="edit-event-action"
            className="block text-xs font-bold text-ink-secondary uppercase tracking-wider mb-1.5"
          >
            Acción
          </label>
          <select
            id="edit-event-action"
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value as StatAction)}
            className="w-full min-h-[48px] bg-surface-elevated border border-border-strong rounded-xl px-3.5 py-2.5 text-base sm:text-sm font-semibold text-ink-primary focus:border-brand"
          >
            {Object.entries(STAT_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </ModalShell>
  );
};

export default GameEventEditModal;
