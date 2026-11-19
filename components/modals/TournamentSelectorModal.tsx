import React from 'react';
import ModalShell from '../ui/ModalShell';
import { TrophyIcon } from '../icons';
import { TOURNAMENTS_CONFIG } from '../../constants';

interface TournamentSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTournament: (id: string, name: string) => void;
  currentTournamentId?: string;
}

const TournamentSelectorModal: React.FC<TournamentSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectTournament,
  currentTournamentId,
}) => {
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Seleccionar Torneo"
      titleId="tournament-selector-modal-title"
      headerLeading={<TrophyIcon className="h-5 w-5 text-sport-warn-light" />}
      maxWidth="lg"
      zIndexClass="z-[90]"
    >
      <div className="flex flex-col space-y-2">
        {TOURNAMENTS_CONFIG.map((name) => {
          const isSelected = currentTournamentId === name;
          return (
            <button
              type="button"
              key={name}
              onClick={() => {
                onSelectTournament(name, name);
                onClose();
              }}
              className={`w-full min-h-[48px] text-left px-4 py-3 rounded-xl border transition-colors ${
                isSelected
                  ? 'bg-brand/15 border-brand text-brand'
                  : 'bg-surface-elevated border-border-subtle hover:bg-surface-hover hover:border-border-strong text-ink-primary'
              }`}
            >
              <span className="font-bold text-sm sm:text-base">{name}</span>
            </button>
          );
        })}
      </div>
    </ModalShell>
  );
};

export default TournamentSelectorModal;
