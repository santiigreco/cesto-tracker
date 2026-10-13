import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '@/components/ui/Loader';
import TeamLogo from '@/components/ui/TeamLogo';
import { PlusIcon, TrashIcon, CheckIcon } from '@/components/icons';
import { useTeamManager } from '@/hooks/useTeamManager';
import { useUI } from '@/context/UIContext';
import { SavedTeam, RosterPlayer } from '@/types';
import { CATEGORIES_CONFIG } from '@/constants';

interface ProfileTeamsTabProps {
  onTeamsCountChange?: (count: number) => void;
}

export const ProfileTeamsTab: React.FC<ProfileTeamsTabProps> = ({ onTeamsCountChange }) => {
  const navigate = useNavigate();
  const { showToast } = useUI();
  const { teams, loading, fetchTeams, saveTeam, updateTeam, deleteTeam } = useTeamManager();

  const [isCreatingOrEditing, setIsCreatingOrEditing] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);

  // Form State
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
    setPlayers(team.players && team.players.length > 0 ? [...team.players] : [{ number: '1', name: '' }]);
    setIsCreatingOrEditing(true);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleAddPlayerRow = () => {
    const nextNum = (players.length + 1).toString();
    setPlayers(prev => [...prev, { number: nextNum, name: '' }]);
  };

  const handleRemovePlayerRow = (index: number) => {
    if (players.length <= 1) return;
    setPlayers(prev => prev.filter((_, i) => i !== index));
  };

  const handlePlayerChange = (index: number, field: 'number' | 'name', value: string) => {
    setPlayers(prev => {
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
      .filter(p => p.number.trim() !== '')
      .map(p => ({
        number: p.number.trim(),
        name: p.name.trim() || `Jugador #${p.number.trim()}`,
      }));

    if (cleanPlayers.length === 0) {
      showToast('Agregá al menos un jugador con número.', 'warning');
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
    navigate('/setup', {
      state: {
        teamName: team.name,
        categoryName: team.category,
        roster: team.players,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header CTA banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>👥</span>
            <span>Planteles Oficiales Guardados</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Pre-configurá los dorsales y nombres de tu equipo para cargarlos en 1 click al iniciar un partido.
          </p>
        </div>

        {!isCreatingOrEditing && (
          <button
            onClick={handleStartCreate}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 active:scale-95 shrink-0 inline-flex items-center gap-1.5"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Nuevo Plantel</span>
          </button>
        )}
      </div>

      {/* Creation / Edit Form Modal / Inline Section */}
      {isCreatingOrEditing && (
        <form
          onSubmit={handleSaveTeam}
          className="bg-slate-900 border-2 border-cyan-500/50 rounded-2xl p-6 shadow-2xl space-y-5 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-base font-black text-white flex items-center gap-2 uppercase tracking-wide">
              <span>{editingTeamId ? '✏️ Editar Plantel' : '⚡ Crear Nuevo Plantel'}</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                setIsCreatingOrEditing(false);
                setEditingTeamId(null);
              }}
              className="text-slate-400 hover:text-white text-xs font-bold"
            >
              Cancelar ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Nombre del Equipo / Club *
              </label>
              <input
                type="text"
                required
                maxLength={40}
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                placeholder="Ej: Vélez Primera A, Regatas Sub-17..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Categoría (Opcional)
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                {CATEGORIES_CONFIG.map(cat => (
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
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                Jugadores / Dorsales ({players.length})
              </label>
              <button
                type="button"
                onClick={handleAddPlayerRow}
                className="text-cyan-400 hover:text-cyan-300 text-xs font-bold flex items-center gap-1"
              >
                + Agregar Jugador
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {players.map((player, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-xl p-2"
                >
                  <input
                    type="number"
                    min="1"
                    max="99"
                    required
                    value={player.number}
                    onChange={e => handlePlayerChange(idx, 'number', e.target.value.slice(0, 2))}
                    placeholder="#"
                    className="w-12 bg-slate-900 border border-slate-600 rounded-lg py-1.5 text-center text-sm font-black text-cyan-400 focus:outline-none focus:border-cyan-400"
                  />
                  <input
                    type="text"
                    maxLength={35}
                    value={player.name}
                    onChange={e => handlePlayerChange(idx, 'name', e.target.value)}
                    placeholder={`Nombre jugador #${player.number}`}
                    className="flex-grow bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  {players.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePlayerRow(idx)}
                      className="text-slate-500 hover:text-red-400 p-1 text-xs"
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsCreatingOrEditing(false);
                setEditingTeamId(null);
              }}
              className="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 active:scale-95 flex items-center gap-2"
            >
              {isSubmitting ? <Loader className="h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}
              <span>{editingTeamId ? 'Guardar Cambios' : 'Guardar Plantel'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Teams Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="h-8 w-8 text-cyan-400" />
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-14 px-4 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
          <span className="text-4xl block mb-2">🏐</span>
          <h3 className="text-base font-bold text-white">No tenés planteles guardados</h3>
          <p className="text-slate-400 text-xs mt-1 mb-4">
            Creá tu equipo ahora para tener los dorsales y nombres listos antes de cualquier partido.
          </p>
          <button
            onClick={handleStartCreate}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            + Crear mi primer plantel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map(team => (
            <div
              key={team.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <TeamLogo teamName={team.name} className="h-7 w-7 shrink-0" />
                    <div className="min-w-0">
                      <h3 className="text-base font-extrabold text-white truncate">{team.name}</h3>
                      {team.category && (
                        <span className="inline-block text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                          {team.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-bold shrink-0 border border-slate-700">
                    {team.players?.length || 0} jug.
                  </span>
                </div>

                {/* Player tags */}
                <div className="flex flex-wrap gap-1.5 mt-3 max-h-24 overflow-y-auto pr-1">
                  {team.players?.map(p => (
                    <span
                      key={p.number}
                      className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300 font-medium"
                    >
                      <strong className="text-cyan-400 font-bold mr-1">#{p.number}</strong>
                      {p.name.replace(`Jugador #${p.number}`, '') || `J#${p.number}`}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartEdit(team)}
                    className="text-xs text-slate-400 hover:text-white font-bold px-2 py-1 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    ✏️ Editar
                  </button>

                  {confirmDeleteId === team.id ? (
                    <div className="flex items-center gap-1 bg-red-950/80 p-1 rounded-lg">
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="text-[10px] bg-red-600 text-white font-black px-2 py-0.5 rounded"
                      >
                        Borrar
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-[10px] text-slate-400 px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(team.id)}
                      className="text-xs text-slate-500 hover:text-red-400 p-1 rounded-lg transition-colors"
                      title="Eliminar plantel"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Quick Start Match with this roster */}
                <button
                  onClick={() => handleQuickMatch(team)}
                  className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-black text-xs px-3.5 py-1.5 rounded-xl uppercase tracking-wider transition-all shadow active:scale-95 flex items-center gap-1.5"
                  title="Crear nuevo partido con este plantel pre-cargado"
                >
                  <span>⚡</span>
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
