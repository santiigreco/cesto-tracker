import React, { useState, useEffect } from 'react';
import ModalShell from '../ui/ModalShell';
import Loader from '@/components/ui/Loader';
import {
  CheckIcon,
  JerseyIcon,
  PlusIcon,
  TrashIcon,
  UsersIcon,
} from '../icons';
import { useTeamManager } from '../../hooks/useTeamManager';
import { SavedTeam, RosterPlayer } from '../../types';

interface TeamRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadTeam: (team: SavedTeam) => void;
  currentSelection: {
    name: string;
    players: string[];
  };
}

const TeamRosterModal: React.FC<TeamRosterModalProps> = ({
  isOpen,
  onClose,
  onLoadTeam,
  currentSelection,
}) => {
  const { teams, loading, fetchTeams, saveTeam, deleteTeam } = useTeamManager();
  const [view, setView] = useState<'list' | 'create'>('list');

  const [newTeamName, setNewTeamName] = useState('');
  const [roster, setRoster] = useState<Record<string, string>>({});
  const [selectedNumbers, setSelectedNumbers] = useState<Set<string>>(new Set());

  const allNumbers = Array.from({ length: 15 }, (_, i) => String(i + 1));

  useEffect(() => {
    if (isOpen) {
      fetchTeams();
      setNewTeamName(currentSelection.name);
      const initialRoster: Record<string, string> = {};
      currentSelection.players.forEach((num) => (initialRoster[num] = ''));
      setRoster(initialRoster);
      setSelectedNumbers(new Set(currentSelection.players));
    }
  }, [isOpen]);

  const handleTogglePlayer = (num: string) => {
    setSelectedNumbers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(num)) {
        newSet.delete(num);
        const newRoster = { ...roster };
        delete newRoster[num];
        setRoster(newRoster);
      } else {
        newSet.add(num);
        setRoster((prevRoster) => ({ ...prevRoster, [num]: '' }));
      }
      return newSet;
    });
  };

  const handleNameChange = (num: string, name: string) => {
    setRoster((prev) => ({ ...prev, [num]: name }));
  };

  const handleSave = async () => {
    if (!newTeamName.trim()) {
      alert('Ingresá un nombre para el equipo');
      return;
    }
    if (selectedNumbers.size === 0) {
      alert('Seleccioná al menos una jugadora');
      return;
    }

    const playersPayload: RosterPlayer[] = (Array.from(selectedNumbers) as string[]).map(
      (num) => ({
        number: num,
        name: roster[num]?.trim() || '',
      })
    );

    const saved = await saveTeam(newTeamName.trim(), playersPayload);
    if (saved) {
      setView('list');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de eliminar este equipo?')) {
      await deleteTeam(id);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Mis Equipos"
      headerLeading={<UsersIcon className="h-5 w-5 text-brand" />}
      maxWidth="2xl"
      zIndexClass="z-[70]"
      bodyClassName="p-4 sm:p-5 overflow-y-auto custom-scrollbar bg-surface-canvas"
    >
      {view === 'list' && (
        <>
          {loading && (
            <div className="flex justify-center py-10">
              <Loader />
            </div>
          )}

          {!loading && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  setNewTeamName('');
                  setSelectedNumbers(new Set());
                  setRoster({});
                  setView('create');
                }}
                className="w-full min-h-[48px] bg-brand/15 border border-brand/40 hover:bg-brand/25 text-brand font-bold px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Crear Nuevo Equipo</span>
              </button>

              <h3 className="text-ink-muted text-xs uppercase font-bold tracking-wider pt-1">
                Equipos Guardados
              </h3>

              {teams.length === 0 ? (
                <p className="text-center text-ink-muted text-sm py-8">
                  Todavía no tenés equipos guardados.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      onClick={() => onLoadTeam(team)}
                      className="relative group p-4 rounded-xl bg-surface-card border border-border-subtle hover:border-brand/50 cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <h3 className="font-bold text-base text-ink-primary group-hover:text-brand truncate pr-9">
                          {team.name}
                        </h3>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(team.id, e)}
                          className="absolute top-2 right-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-ink-muted hover:text-sport-miss-light rounded-lg transition-colors"
                          title="Eliminar"
                          aria-label="Eliminar equipo"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-ink-muted tabular-nums">
                        {team.players.length} jugadoras
                      </p>
                      <div className="mt-3 flex gap-1 overflow-hidden">
                        {team.players.slice(0, 6).map((p) => (
                          <div
                            key={p.number}
                            className="w-6 h-6 rounded-md bg-surface-elevated border border-border-subtle flex items-center justify-center text-[10px] text-ink-secondary font-bold tabular-nums"
                          >
                            {p.number}
                          </div>
                        ))}
                        {team.players.length > 6 && (
                          <span className="text-xs text-ink-muted self-center ml-1">...</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {view === 'create' && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="text-ink-primary font-extrabold text-base">Editar Plantel</h3>
            <button
              type="button"
              onClick={() => setView('list')}
              className="min-h-[36px] px-2 text-xs font-bold text-ink-secondary hover:text-ink-primary underline"
            >
              Volver
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-secondary uppercase tracking-wider mb-1.5">
              Nombre del Equipo
            </label>
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="w-full min-h-[44px] bg-surface-card border border-border-strong rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-ink-primary focus:border-brand"
              placeholder="Ej: Club Ciudad Sub-17"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-secondary uppercase tracking-wider mb-2">
              Seleccionar Jugadoras
            </label>
            <div className="flex flex-wrap gap-2">
              {allNumbers.map((num) => (
                <JerseyIcon
                  key={num}
                  number={num}
                  isSelected={selectedNumbers.has(num)}
                  onClick={handleTogglePlayer}
                />
              ))}
            </div>
          </div>

          {selectedNumbers.size > 0 && (
            <div className="bg-surface-card p-4 rounded-xl border border-border-subtle">
              <label className="block text-xs font-bold text-ink-secondary uppercase tracking-wider mb-3">
                Nombres (Camisetas)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(Array.from(selectedNumbers) as string[])
                  .sort((a, b) => Number(a) - Number(b))
                  .map((num) => (
                    <div key={num} className="flex items-center gap-2">
                      <span className="w-8 h-8 flex items-center justify-center bg-surface-elevated border border-border-strong rounded-lg text-brand font-bold text-xs flex-shrink-0 tabular-nums">
                        {num}
                      </span>
                      <input
                        type="text"
                        value={roster[num] || ''}
                        onChange={(e) => handleNameChange(num, e.target.value)}
                        className="flex-grow min-w-0 min-h-[40px] bg-surface-canvas border border-border-strong rounded-lg px-2.5 py-1.5 text-base sm:text-sm text-ink-primary focus:border-brand"
                        placeholder="Nombre..."
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setView('list')}
              className="flex-1 min-h-[44px] py-2.5 rounded-xl border border-border-strong bg-surface-elevated hover:bg-surface-hover text-ink-secondary font-bold text-sm"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-[2] min-h-[44px] py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-ink-inverse font-extrabold flex items-center justify-center gap-2 text-sm"
            >
              <CheckIcon className="h-4 w-4" />
              <span>Guardar Equipo</span>
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
};

export default TeamRosterModal;
