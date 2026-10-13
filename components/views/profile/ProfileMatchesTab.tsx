import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '@/components/ui/Loader';
import TeamLogo from '@/components/ui/TeamLogo';
import { SearchIcon, TrashIcon } from '@/components/icons';
import { useSync } from '@/context/SyncContext';
import { useUI } from '@/context/UIContext';
import { exportGameByIdToExcel } from '@/utils/exportToExcel';

export interface UserSavedGame {
  id: string;
  opponent_name?: string;
  game_mode: string;
  created_at: string;
  player_names?: Record<string, string>;
  settings?: any;
  views?: number;
}

interface ProfileMatchesTabProps {
  games: UserSavedGame[];
  loading: boolean;
  onRefresh: () => void;
}

export const ProfileMatchesTab: React.FC<ProfileMatchesTabProps> = ({
  games,
  loading,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const { handleDeleteGame } = useSync();
  const { showToast } = useUI();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'recent'>('all');
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtered games
  const filteredGames = useMemo(() => {
    let result = [...games];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(g => {
        const gameName = (g.settings?.gameName || g.opponent_name || '').toLowerCase();
        const myTeam = (g.settings?.myTeam || '').toLowerCase();
        const category = (g.settings?.categoryName || '').toLowerCase();
        return gameName.includes(term) || myTeam.includes(term) || category.includes(term);
      });
    }

    if (filterPeriod === 'recent') {
      result = result.slice(0, 5);
    }

    return result;
  }, [games, searchTerm, filterPeriod]);

  // Handle Export to Excel
  const handleExportExcel = async (gameId: string) => {
    setExportingId(gameId);
    try {
      showToast('Generando planilla técnica oficial en Excel...', 'info');
      await exportGameByIdToExcel(gameId);
      showToast('¡Planilla oficial descargada con éxito!', 'success');
    } catch (err: any) {
      console.error('[EXCEL_EXPORT_ERROR]', err);
      showToast(`Error al exportar planilla: ${err.message || 'Error desconocido'}`, 'error');
    } finally {
      setExportingId(null);
    }
  };

  // Handle Share Match Link
  const handleShare = (gameId: string) => {
    const url = `${window.location.origin}/match/${gameId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(gameId);
        showToast('Enlace público copiado al portapapeles', 'success');
        setTimeout(() => setCopiedId(null), 2000);
      });
    }
  };

  // Handle Delete Game
  const handleDelete = async (gameId: string) => {
    setDeletingId(gameId);
    try {
      const success = await handleDeleteGame(gameId);
      if (success) {
        showToast('Partido eliminado correctamente', 'success');
        onRefresh();
      } else {
        showToast('No se pudo eliminar el partido', 'error');
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por rival, club o torneo..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700/80 text-xs font-bold">
            <button
              onClick={() => setFilterPeriod('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterPeriod === 'all'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({games.length})
            </button>
            <button
              onClick={() => setFilterPeriod('recent')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterPeriod === 'recent'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Recientes (5)
            </button>
          </div>

          <button
            onClick={() => navigate('/setup')}
            className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 active:scale-95 shrink-0"
          >
            + Nueva Planilla
          </button>
        </div>
      </div>

      {/* Matches List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
          <Loader className="h-10 w-10 text-cyan-400" />
          <p className="text-slate-400 text-sm mt-4 font-semibold">Cargando tus partidos oficiales...</p>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
          <span className="text-5xl block mb-3">📋</span>
          <h3 className="text-lg font-bold text-white">
            {searchTerm ? 'No se encontraron partidos' : 'Aún no tenés planillas registradas'}
          </h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mt-1 mb-6">
            {searchTerm
              ? 'Probá buscando con otro nombre de rival o quitando el filtro.'
              : 'Digitalizá tu primer partido oficial de Cestoball con control de goles, faltas y planilla técnica reglamentaria.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate('/setup')}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-6 py-3 rounded-xl text-sm uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 active:scale-95 inline-flex items-center gap-2"
            >
              <span>⚡</span>
              <span>Comenzar Nueva Planilla</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredGames.map(game => {
            const myTeam = game.settings?.myTeam || 'Mi Equipo';
            const opponentName = game.settings?.gameName || game.opponent_name || 'Rival';
            const myScore = game.settings?.myScore ?? 0;
            const opponentScore = game.settings?.opponentScore ?? 0;
            const tournamentName = game.settings?.tournamentName || game.settings?.categoryName;

            return (
              <div
                key={game.id}
                className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 group"
              >
                {/* Left: Scoreboard preview */}
                <div className="flex items-center gap-4 min-w-0 flex-grow">
                  <div className="flex flex-col items-center justify-center bg-slate-800/90 border border-slate-700/60 rounded-xl px-4 py-3 shrink-0 min-w-[90px] text-center shadow-inner">
                    <span className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">
                      {formatDate(game.created_at)}
                    </span>
                    <div className="flex items-center gap-1.5 font-black text-xl leading-none">
                      <span className="text-cyan-400">{myScore}</span>
                      <span className="text-slate-500 text-sm">-</span>
                      <span className="text-slate-300">{opponentScore}</span>
                    </div>
                  </div>

                  {/* Names and info */}
                  <div className="min-w-0 flex-grow">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {tournamentName && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-cyan-400 text-[10px] font-extrabold uppercase tracking-wider border border-slate-700">
                          {tournamentName}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-medium">
                        Planilla Técnica Oficial
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-white font-bold text-base sm:text-lg truncate">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <TeamLogo teamName={myTeam} className="h-5 w-5" />
                        <span className="text-cyan-300 truncate max-w-[140px] sm:max-w-[200px]">{myTeam}</span>
                      </div>
                      <span className="text-slate-500 font-normal">vs</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <TeamLogo teamName={opponentName} className="h-5 w-5" />
                        <span className="text-slate-200 truncate max-w-[140px] sm:max-w-[200px]">{opponentName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Actions toolbar */}
                <div className="flex items-center gap-2 flex-wrap justify-end shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  {/* Share Link */}
                  <button
                    onClick={() => handleShare(game.id)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors active:scale-95"
                    title="Copiar enlace del partido"
                  >
                    {copiedId === game.id ? <span className="text-xs font-bold text-emerald-400">✓</span> : <span>🔗</span>}
                  </button>

                  {/* Export Official Excel */}
                  <button
                    onClick={() => handleExportExcel(game.id)}
                    disabled={exportingId === game.id}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 hover:border-emerald-500 text-emerald-300 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    title="Descargar Planilla Oficial en Excel (.xlsx)"
                  >
                    {exportingId === game.id ? (
                      <Loader className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <span>📊</span>
                    )}
                    <span className="hidden sm:inline">Excel</span>
                  </button>

                  {/* Read-Only Stats View */}
                  <button
                    onClick={() => navigate(`/match/${game.id}`)}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold rounded-xl transition-colors active:scale-95"
                    title="Ver planilla en modo lectura"
                  >
                    Ver
                  </button>

                  {/* Resume / Edit Match */}
                  <button
                    onClick={() => navigate(`/match/${game.id}?edit=true`)}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-cyan-900/30 active:scale-95 flex items-center gap-1"
                    title="Abrir en modo anotación"
                  >
                    <span>⚡</span>
                    <span>Anotar</span>
                  </button>

                  {/* Delete Match with Confirmation */}
                  {confirmDeleteId === game.id ? (
                    <div className="flex items-center gap-1 bg-red-950/80 border border-red-700/60 rounded-xl p-1">
                      <button
                        onClick={() => handleDelete(game.id)}
                        disabled={deletingId === game.id}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white text-[11px] font-black rounded-lg transition-colors"
                      >
                        {deletingId === game.id ? '...' : 'Confirmar'}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1 text-slate-400 hover:text-white text-[11px]"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(game.id)}
                      className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-xl transition-colors active:scale-95"
                      title="Eliminar partido"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
