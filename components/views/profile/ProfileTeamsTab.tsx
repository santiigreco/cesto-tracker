import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '@/components/ui/Loader';
import TeamLogo from '@/components/ui/TeamLogo';
import {
  BoltIcon,
  BrandLogoMark,
  CheckIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UsersIcon,
  XIcon,
} from '@/components/icons';
import { useTeamManager } from '@/hooks/useTeamManager';
import { useUI } from '@/context/UIContext';
import { useGameLogic } from '@/hooks/useGameLogic';
import { SavedTeam, RosterPlayer } from '@/types';
import { CATEGORIES_CONFIG } from '@/constants';

interface ProfileTeamsTabProps {
  onTeamsCountChange?: (count: number) => void;
}

export const ProfileTeamsTab: React.FC<ProfileTeamsTabProps> = ({
  onTeamsCountChange,
}) => {
  const navigate = useNavigate();
  const { showToast } = useUI();
  const { startQuickMatch } = useGameLogic();
  const { teams, loading, fetchTeams, saveTeam, updateTeam, deleteTeam } =
    useTeamManager();

  const [isCreatingOrEditing, setIsCreatingOrEditing] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);

  const [teamName, setTeamName] = useState('');
  const [category, setCategory] = useState('Primera A');
  const [players, setPlayers] = useState<RosterPlayer[]>([
    { number: '1', name: '' },
    { number: '2', name: '' },
    { number: '3', name: '' },
    { number: '4', name: '' },
    { number: '5', name: '' },
    { number: '6', name: '' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (onTeamsCountChange) {
      onTeamsCountChange(teams.length);
    }
  }, [teams, onTeamsCountChange]);

  const handleStartCreate = () => {
    setEditingTeamId(null);
    setTeamName('');
    setCategory('Primera A');
    setPlayers([
      { number: '1', name: '' },
      { number: '2', name: '' },
      { number: '3', name: '' },
      { number: '4', name: '' },
      { number: '5', name: '' },
      { number: '6', name: '' },
    ]);
    setIsCreatingOrEditing(true);
  };

  const handleStartEdit = (team: SavedTeam) => {
    setEditingTeamId(team.id);
    setTeamName(team.name);
    setCategory(team.category || 'Primera A');
    setPlayers(
      team.players && team.players.length > 0
        ? [...team.players]
        : [{ number: '1', name: '' }]
    );
    setIsCreatingOrEditing(true);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleAddPlayerRow = () => {
    const nextNum = (players.length + 1).toString();
    setPlayers((prev) => [...prev, { number: nextNum, name: '' }]);
  };

  const handleRemovePlayerRow = (index: number) => {
    if (players.length <= 1) return;
    setPlayers((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePlayerChange = (
    index: number,
    field: 'number' | 'name',
    value: string
  ) => {
    setPlayers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      showToast('Por favor, ingresá el nombre del equipo o club.', 'warning');
      return;
    }

    const cleanPlayers = players
      .filter((p) => p.number.trim() !== '')
      .map((p) => ({
        number: p.number.trim(),
        name: p.name.trim() || `Jugadora #${p.number.trim()}`,
      }));

    if (cleanPlayers.length === 0) {
      showToast('Agregá al menos una jugadora con número.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTeamId) {
        const ok = await updateTeam(editingTeamId, teamName.trim(), cleanPlayers, category);
        if (ok) {
          showToast('Plantel actualizado con éxito', 'success');
          setIsCreatingOrEditing(false);
          setEditingTeamId(null);
        } else {
          showToast('Error al actualizar el plantel', 'error');
        }
      } else {
        const res = await saveTeam(teamName.trim(), cleanPlayers, category);
        if (res) {
          showToast('¡Plantel guardado con éxito!', 'success');
          setIsCreatingOrEditing(false);
        } else {
          showToast('Error al guardar el plantel', 'error');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    await deleteTeam(id);
    setConfirmDeleteId(null);
    showToast('Plantel eliminado', 'info');
  };

  const handleQuickMatch = (team: SavedTeam) => {
    startQuickMatch({
      teamName: team.name,
      categoryName: team.category,
      roster: team.players,
      useLastSetup: false,
    });
    navigate('/match/new');
  };

  return (
    <div className="space-y-5">
      {/* Header CTA banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-card border border-border-subtle p-4 sm:p-5 rounded-2xl">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-ink-primary flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-brand shrink-0" />
            <span>Planteles Oficiales Guardados</span>
          </h2>
          <p className="text-ink-muted text-xs sm:text-sm mt-0.5">
            Pre-configurá los dorsales y nombres de tu equipo para cargarlos en 1 clic al iniciar un partido.
          </p>
        </div>

        {!isCreatingOrEditing && (
          <button
            type="button"
            onClick={handleStartCreate}
            className="w-full sm:w-auto min-h-[44px] bg-brand hover:bg-brand-hover text-ink-inverse font-extrabold px-5 rounded-xl text-xs uppercase tracking-wider transition-colors active:scale-[0.98] shrink-0 inline-flex items-center justify-center gap-1.5"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Nuevo Plantel</span>
          </button>
        )}
      </div>

      {/* Creation / Edit Form */}
      {isCreatingOrEditing && (
        <form
          onSubmit={handleSaveTeam}
          className="bg-surface-card border border-brand/50 rounded-2xl p-5 sm:p-6 shadow-card space-y-5 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-border-subtle pb-3.5">
            <h3 className="text-sm sm:text-base font-extrabold text-ink-primary flex items-center gap-2 uppercase tracking-wider">
              {editingTeamId ? (
                <>
                  <PencilIcon className="h-4 w-4 text-brand" />
                  <span>Editar Plantel</span>
                </>
              ) : (
                <>
                  <BoltIcon className="h-4 w-4 text-brand" />
                  <span>Crear Nuevo Plantel</span>
                </>
              )}
            </h3>
            <button
              type="button"
              onClick={() => {
                setIsCreatingOrEditing(false);
                setEditingTeamId(null);
              }}
              className="min-h-[36px] px-2 text-ink-muted hover:text-ink-primary text-xs font-bold inline-flex items-center gap-1"
            >
              <span>Cancelar</span>
              <XIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink-secondary uppercase tracking-wider mb-1.5">
                Nombre del Equipo / Club *
              </label>
              <input
                type="text"
                required
                maxLength={40}
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Ej: Vélez Primera A, Regatas Sub-17..."
                className="w-full min-h-[44px] bg-surface-elevated border border-border-strong rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-ink-primary focus:border-brand transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-secondary uppercase tracking-wider mb-1.5">
                Categoría (Opcional)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full min-h-[44px] bg-surface-elevated border border-border-strong rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-ink-primary focus:border-brand transition-colors"
              >
                {CATEGORIES_CONFIG.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Sub-17">Sub-17</option>
                <option value="Sub-14">Sub-14</option>
                <option value="Maxi Cesto">Maxi Cesto</option>
                <option value="Otra">Otra</option>
              </select>
            </div>
          </div>

          {/* Players Roster Inputs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-ink-secondary uppercase tracking-wider tabular-nums">
                Jugadoras / Dorsales ({players.length})
              </label>
              <button
                type="button"
                onClick={handleAddPlayerRow}
                className="min-h-[36px] px-2 text-brand hover:text-brand-hover text-xs font-bold flex items-center gap-1"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                <span>Agregar Jugadora</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto custom-scrollbar pr-1">
              {players.map((player, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-surface-elevated/70 border border-border-subtle rounded-xl p-2"
                >
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="99"
                    required
                    value={player.number}
                    onChange={(e) =>
                      handlePlayerChange(idx, 'number', e.target.value.slice(0, 2))
                    }
                    placeholder="#"
                    className="w-14 min-h-[40px] bg-surface-canvas border border-border-strong rounded-lg py-1.5 text-center text-base sm:text-sm font-black text-brand focus:border-brand tabular-nums"
                  />
                  <input
                    type="text"
                    maxLength={35}
                    value={player.name}
                    onChange={(e) => handlePlayerChange(idx, 'name', e.target.value)}
                    placeholder={`Nombre #${player.number}`}
                    className="flex-grow min-w-0 min-h-[40px] bg-surface-canvas border border-border-strong rounded-lg px-2.5 py-1.5 text-base sm:text-sm text-ink-primary focus:border-brand"
                  />
                  {players.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePlayerRow(idx)}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center text-ink-muted hover:text-sport-miss-light rounded-lg"
                      title="Eliminar"
                      aria-label="Eliminar jugadora"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-subtle">
            <button
              type="button"
              onClick={() => {
                setIsCreatingOrEditing(false);
                setEditingTeamId(null);
              }}
              className="min-h-[44px] px-4 text-ink-secondary hover:text-ink-primary text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[44px] bg-brand hover:bg-brand-hover text-ink-inverse font-extrabold px-6 rounded-xl text-xs uppercase tracking-wider transition-colors active:scale-[0.98] flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader className="h-4 w-4 text-ink-inverse" />
              ) : (
                <CheckIcon className="h-4 w-4" />
              )}
              <span>{editingTeamId ? 'Guardar Cambios' : 'Guardar Plantel'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Teams Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="h-8 w-8 text-brand" />
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-14 px-4 bg-surface-card rounded-2xl border border-dashed border-border-strong">
          <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center mx-auto mb-3">
            <BrandLogoMark className="h-7 w-7" />
          </div>
          <h3 className="text-base font-extrabold text-ink-primary">
            No tenés planteles guardados
          </h3>
          <p className="text-ink-muted text-xs sm:text-sm mt-1 mb-4">
            Creá tu equipo ahora para tener los dorsales y nombres listos antes de cualquier partido.
          </p>
          <button
            type="button"
            onClick={handleStartCreate}
            className="min-h-[44px] px-4 bg-surface-elevated hover:bg-surface-hover text-brand border border-border-strong rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Crear mi primer plantel</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-surface-card border border-border-subtle hover:border-border-strong rounded-2xl p-5 shadow-card flex flex-col justify-between transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <TeamLogo teamName={team.name} className="h-8 w-8 shrink-0" />
                    <div className="min-w-0">
                      <h3 className="text-base font-extrabold text-ink-primary truncate">
                        {team.name}
                      </h3>
                      {team.category && (
                        <span className="inline-block text-[11px] font-bold text-brand uppercase tracking-wider">
                          {team.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-lg bg-surface-elevated text-ink-secondary text-xs font-bold shrink-0 border border-border-subtle tabular-nums">
                    {team.players?.length || 0} jug.
                  </span>
                </div>

                {/* Player tags */}
                <div className="flex flex-wrap gap-1.5 mt-3 max-h-24 overflow-y-auto custom-scrollbar pr-1">
                  {team.players?.map((p) => (
                    <span
                      key={p.number}
                      className="px-2 py-0.5 rounded-lg bg-surface-elevated border border-border-subtle text-xs text-ink-secondary font-medium"
                    >
                      <strong className="text-brand font-bold mr-1 tabular-nums">
                        #{p.number}
                      </strong>
                      {p.name
                        .replace(`Jugador #${p.number}`, '')
                        .replace(`Jugadora #${p.number}`, '') || `J#${p.number}`}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-border-subtle">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(team)}
                    className="min-h-[44px] px-2.5 text-xs text-ink-secondary hover:text-ink-primary font-bold hover:bg-surface-elevated rounded-xl transition-colors inline-flex items-center gap-1.5"
                  >
                    <PencilIcon className="h-3.5 w-3.5" />
                    <span>Editar</span>
                  </button>

                  {confirmDeleteId === team.id ? (
                    <div className="flex items-center gap-1 bg-sport-miss/15 border border-sport-miss/40 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => handleDeleteTeam(team.id)}
                        className="min-h-[36px] text-xs bg-sport-miss hover:bg-red-500 text-white font-extrabold px-2.5 rounded-lg"
                      >
                        Borrar
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="min-h-[36px] text-xs text-ink-secondary px-2 font-bold"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(team.id)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center text-ink-muted hover:text-sport-miss-light hover:bg-sport-miss/10 rounded-xl transition-colors"
                      title="Eliminar plantel"
                      aria-label="Eliminar plantel"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickMatch(team)}
                  className="min-h-[44px] bg-brand hover:bg-brand-hover text-ink-inverse font-extrabold text-xs px-3.5 rounded-xl uppercase tracking-wider transition-colors active:scale-[0.98] flex items-center gap-1.5"
                  title="Crear nuevo partido con este plantel pre-cargado"
                >
                  <BoltIcon className="h-3.5 w-3.5" />
                  <span>Anotar Partido</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
