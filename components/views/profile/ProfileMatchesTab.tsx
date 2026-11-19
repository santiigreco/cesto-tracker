import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '@/components/ui/Loader';
import TeamLogo from '@/components/ui/TeamLogo';
import {
  AlertTriangleIcon,
  BoltIcon,
  CheckIcon,
  ClipboardIcon,
  DownloadIcon,
  LinkIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  TrashIcon,
} from '@/components/icons';
import { useSync } from '@/context/SyncContext';
import { useUI } from '@/context/UIContext';
import { useGameLogic } from '@/hooks/useGameLogic';
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
  error?: string | null;
  onRefresh: () => void;
}

export const ProfileMatchesTab: React.FC<ProfileMatchesTabProps> = ({
  games,
  loading,
  error,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const { handleDeleteGame } = useSync();
  const { showToast } = useUI();
  const { startQuickMatch } = useGameLogic();

  const handleStartNewMatch = () => {
    startQuickMatch({ useLastSetup: true });
    navigate('/match/new');
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'recent'>('all');
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredGames = useMemo(() => {
    let result = [...games];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((g) => {
        const gameName = (g.settings?.gameName || g.opponent_name || '').toLowerCase();
        const myTeam = (g.settings?.myTeam || '').toLowerCase();
        const category = (g.settings?.categoryName || '').toLowerCase();
        return (
          gameName.includes(term) || myTeam.includes(term) || category.includes(term)
        );
      });
    }

    if (filterPeriod === 'recent') {
      result = result.slice(0, 5);
    }

    return result;
  }, [games, searchTerm, filterPeriod]);

  const handleExportExcel = async (gameId: string) => {
    setExportingId(gameId);
    try {
      showToast('Generando planilla técnica oficial en Excel...', 'info');
      await exportGameByIdToExcel(gameId);
      showToast('¡Planilla oficial descargada con éxito!', 'success');
    } catch (err: any) {
      console.error('[EXCEL_EXPORT_ERROR]', err);
      showToast(
        `Error al exportar planilla: ${err.message || 'Error desconocido'}`,
        'error'
      );
    } finally {
      setExportingId(null);
    }
  };

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

  const handleDelete = async (gameId: string) => {
    setDeletingId(gameId);
    try {
      const success = await handleDeleteGame(gameId);
      if (success) {
        onRefresh();
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
    <div className="space-y-5">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-card border border-border-subtle p-3.5 sm:p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por rival, club o torneo..."
            className="w-full min-h-[44px] bg-surface-elevated border border-border-strong rounded-xl pl-10 pr-4 py-2 text-base sm:text-sm text-ink-primary placeholder-ink-muted focus:border-brand transition-colors"
          />
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none" />
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-end">
          <div className="flex bg-surface-elevated rounded-xl p-1 border border-border-subtle text-xs font-bold">
            <button
              type="button"
              onClick={() => setFilterPeriod('all')}
              className={`min-h-[36px] px-3 rounded-lg transition-colors tabular-nums ${
                filterPeriod === 'all'
                  ? 'bg-brand text-ink-inverse font-extrabold'
                  : 'text-ink-muted hover:text-ink-primary'
              }`}
            >
              Todos ({games.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterPeriod('recent')}
              className={`min-h-[36px] px-3 rounded-lg transition-colors tabular-nums ${
                filterPeriod === 'recent'
                  ? 'bg-brand text-ink-inverse font-extrabold'
                  : 'text-ink-muted hover:text-ink-primary'
              }`}
            >
              Recientes (5)
            </button>
          </div>

          <button
            type="button"
            onClick={handleStartNewMatch}
            className="min-h-[44px] bg-brand hover:bg-brand-hover text-ink-inverse font-extrabold px-4 rounded-xl text-xs uppercase tracking-wider transition-colors active:scale-[0.98] shrink-0 inline-flex items-center gap-1.5"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Nueva Planilla</span>
          </button>
        </div>
      </div>

      {/* Matches List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-surface-card rounded-2xl border border-border-subtle">
          <Loader className="h-10 w-10 text-brand" />
          <p className="text-ink-muted text-sm mt-4 font-semibold">
            Cargando tus partidos oficiales...
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-12 px-4 bg-sport-miss/10 rounded-2xl border border-sport-miss/35 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-sport-miss/15 border border-sport-miss/35 text-sport-miss-light flex items-center justify-center mx-auto">
            <AlertTriangleIcon className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-ink-primary">
              No pudimos cargar tus planillas
            </h3>
            <p className="text-sport-miss-light text-sm max-w-md mx-auto">{error}</p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="bg-sport-miss hover:bg-red-500 text-white font-bold px-5 min-h-[44px] rounded-xl text-xs uppercase tracking-wider transition-colors active:scale-[0.98] inline-flex items-center gap-2"
          >
            <RefreshIcon className="h-4 w-4" />
            <span>Reintentar</span>
          </button>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="text-center py-14 px-4 bg-surface-card rounded-2xl border border-dashed border-border-strong">
          <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-border-subtle text-ink-muted flex items-center justify-center mx-auto mb-3">
            <ClipboardIcon className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-extrabold text-ink-primary">
            {searchTerm ? 'No se encontraron partidos' : 'Aún no tenés planillas registradas'}
          </h3>
          <p className="text-ink-muted text-sm max-w-md mx-auto mt-1 mb-6">
            {searchTerm
              ? 'Probá buscando con otro nombre de rival o quitando el filtro.'
              : 'Digitalizá tu primer partido oficial de Cestoball con control de goles, faltas y planilla técnica reglamentaria.'}
          </p>
          {!searchTerm && (
            <button
              type="button"
              onClick={handleStartNewMatch}
              className="bg-brand hover:bg-brand-hover text-ink-inverse font-extrabold px-6 min-h-[48px] rounded-xl text-sm uppercase tracking-wider transition-colors active:scale-[0.98] inline-flex items-center gap-2"
            >
              <BoltIcon className="h-4 w-4" />
              <span>Comenzar Nueva Planilla</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredGames.map((game) => {
            const myTeam = game.settings?.myTeam || 'Mi Equipo';
            const opponentName =
              game.settings?.gameName || game.opponent_name || 'Rival';
            const myScore = game.settings?.myScore ?? 0;
            const opponentScore = game.settings?.opponentScore ?? 0;
            const tournamentName =
              game.settings?.tournamentName || game.settings?.categoryName;

            return (
              <div
                key={game.id}
                className="bg-surface-card hover:bg-surface-elevated/60 border border-border-subtle hover:border-border-strong rounded-2xl p-4 sm:p-5 transition-colors flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
              >
                {/* Left: Scoreboard preview */}
                <div className="flex items-center gap-3.5 min-w-0 flex-grow">
                  <div className="flex flex-col items-center justify-center bg-surface-elevated border border-border-subtle rounded-xl px-3.5 py-2.5 shrink-0 min-w-[88px] text-center">
                    <span className="text-[11px] uppercase tracking-wider text-ink-muted font-bold mb-1 tabular-nums">
                      {formatDate(game.created_at)}
                    </span>
                    <div className="flex items-center gap-1.5 font-black text-xl leading-none tabular-nums">
                      <span className="text-brand">{myScore}</span>
                      <span className="text-ink-muted text-sm">-</span>
                      <span className="text-ink-secondary">{opponentScore}</span>
                    </div>
                  </div>

                  <div className="min-w-0 flex-grow">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {tournamentName && (
                        <span className="px-2 py-0.5 rounded-md bg-surface-elevated text-brand text-[10px] font-extrabold uppercase tracking-wider border border-border-subtle">
                          {tournamentName}
                        </span>
                      )}
                      <span className="text-xs text-ink-muted font-medium">
                        Planilla Técnica Oficial
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-primary font-bold text-base sm:text-lg min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <TeamLogo teamName={myTeam} className="h-5 w-5 shrink-0" />
                        <span className="text-ink-primary truncate max-w-[180px] sm:max-w-[200px]">
                          {myTeam}
                        </span>
                      </div>
                      <span className="text-ink-muted font-normal shrink-0">vs</span>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <TeamLogo teamName={opponentName} className="h-5 w-5 shrink-0" />
                        <span className="text-ink-secondary truncate max-w-[180px] sm:max-w-[200px]">
                          {opponentName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Actions toolbar */}
                <div className="flex items-center gap-2 flex-wrap justify-end shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-border-subtle">
                  <button
                    type="button"
                    onClick={() => handleShare(game.id)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-surface-elevated hover:bg-surface-hover text-ink-secondary hover:text-ink-primary border border-border-strong transition-colors"
                    title="Copiar enlace del partido"
                    aria-label="Copiar enlace del partido"
                  >
                    {copiedId === game.id ? (
                      <CheckIcon className="h-4 w-4 text-sport-goal-light" />
                    ) : (
                      <LinkIcon className="h-4 w-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportExcel(game.id)}
                    disabled={exportingId === game.id}
                    className="min-h-[44px] flex items-center gap-1.5 px-3 bg-sport-goal/15 hover:bg-sport-goal/25 border border-sport-goal/40 text-sport-goal-light text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                    title="Descargar Planilla Oficial en Excel (.xlsx)"
                  >
                    {exportingId === game.id ? (
                      <Loader className="h-4 w-4 text-sport-goal-light" />
                    ) : (
                      <DownloadIcon className="h-4 w-4 shrink-0" />
                    )}
                    <span className="hidden sm:inline">Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/match/${game.id}`)}
                    className="min-h-[44px] px-3.5 bg-surface-elevated hover:bg-surface-hover text-ink-primary border border-border-strong text-xs font-bold rounded-xl transition-colors"
                    title="Ver planilla en modo lectura"
                  >
                    Ver
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/match/${game.id}?edit=true`)}
                    className="min-h-[44px] px-4 bg-brand hover:bg-brand-hover text-ink-inverse font-extrabold text-xs uppercase tracking-wider rounded-xl transition-colors active:scale-[0.98] flex items-center gap-1.5"
                    title="Abrir en modo anotación"
                  >
                    <BoltIcon className="h-3.5 w-3.5" />
                    <span>Anotar</span>
                  </button>

                  {confirmDeleteId === game.id ? (
                    <div className="flex items-center gap-1 bg-sport-miss/15 border border-sport-miss/40 rounded-xl p-1">
                      <button
                        type="button"
                        onClick={() => handleDelete(game.id)}
                        disabled={deletingId === game.id}
                        className="min-h-[36px] px-2.5 bg-sport-miss hover:bg-red-500 text-white text-xs font-extrabold rounded-lg transition-colors"
                      >
                        {deletingId === game.id ? '...' : 'Confirmar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="min-h-[36px] px-2.5 text-ink-secondary hover:text-ink-primary text-xs font-bold"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(game.id)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center text-ink-muted hover:text-sport-miss-light hover:bg-sport-miss/10 rounded-xl transition-colors"
                      title="Eliminar partido"
                      aria-label="Eliminar partido"
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
