import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../../utils/supabaseClient';
import {
  AlertTriangleIcon,
  CalendarIcon,
  ChartBarIcon,
  ClipboardIcon,
  CloudCheckIcon,
  EyeIcon,
  FolderIcon,
  GlobeIcon,
  LockIcon,
  PencilIcon,
  RefreshIcon,
  SearchIcon,
  SmartphoneIcon,
  StarIcon,
  TrashIcon,
  TrophyIcon,
} from '../icons';
import Loader from '@/components/ui/Loader';
import ModalShell from '@/components/ui/ModalShell';
import TeamLogo from '@/components/ui/TeamLogo';
import { GameMode } from '../../types';
import { useSync } from '../../context/SyncContext';
import { PERIOD_NAMES } from '../../constants';
import { getFriendlySupabaseErrorMessage } from '../../utils/supabaseErrors';
import { isLocalGameId, listLocalGames, LocalSavedGame } from '../../utils/localGamesStorage';

interface LightweightSettings {
  gameName?: string;
  myTeam?: string;
  tournamentName?: string | null;
  myScore?: number;
  opponentScore?: number;
}

interface SavedGame {
  id: string;
  created_at: string;
  game_mode: GameMode;
  settings: LightweightSettings;
  views: number;
  user_id: string;
  profiles?: { full_name: string | null } | null;
}

interface LoadGameModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onLoadGame: (gameId: string, editable?: boolean) => void;
  user: any;
  onLogin?: () => void;
}

const GAMES_LIST_CACHE_TTL_MS = 20_000;
let cachedGamesList: { games: SavedGame[]; timestamp: number } | null = null;

const LoadGameModal: React.FC<LoadGameModalProps> = ({
  isOpen = true,
  onClose,
  onLoadGame,
  user,
  onLogin,
}) => {
  const { handleDeleteGame, isOnline } = useSync();

  const [games, setGames] = useState<SavedGame[]>(() => cachedGamesList?.games || []);
  const [localGames, setLocalGames] = useState<LocalSavedGame[]>(() => listLocalGames());
  const [loading, setLoading] = useState(!cachedGamesList);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'myGames' | 'community'>('myGames');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('Todos');

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchGames = useCallback(
    async (forceRefresh = false) => {
      const freshLocal = listLocalGames();
      setLocalGames(freshLocal);

      const onlineNow = typeof navigator !== 'undefined' ? navigator.onLine : isOnline;
      if (!isSupabaseConfigured || !onlineNow) {
        setError(getFriendlySupabaseErrorMessage(null, false));
        setLoading(false);
        if (freshLocal.length > 0) {
          setActiveTab('myGames');
        }
        return;
      }

      const now = Date.now();
      if (
        !forceRefresh &&
        cachedGamesList &&
        now - cachedGamesList.timestamp < GAMES_LIST_CACHE_TTL_MS
      ) {
        setGames(cachedGamesList.games);
        setError(null);
        setLoading(false);
        const hasMyCloudGames = Boolean(
          user && cachedGamesList.games.some((g) => g.user_id === user.id)
        );
        setActiveTab(freshLocal.length > 0 || hasMyCloudGames ? 'myGames' : 'community');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data: gamesData, error: gamesError } = await supabase
          .from('games')
          .select(
            'id, created_at, game_mode, views, user_id, my_team_name, opponent_name, gameName:settings->>gameName, myTeam:settings->>myTeam, tournamentName:settings->>tournamentName, myScore:settings->myScore, opponentScore:settings->opponentScore'
          )
          .order('created_at', { ascending: false })
          .limit(100);

        if (gamesError) throw gamesError;

        if (!gamesData || gamesData.length === 0) {
          cachedGamesList = { games: [], timestamp: Date.now() };
          setGames([]);
          setActiveTab(freshLocal.length > 0 ? 'myGames' : 'community');
          return;
        }

        const uniqueUserIds = Array.from(
          new Set(gamesData.map((g: any) => g.user_id).filter(Boolean))
        );
        const profilesMap: Record<string, { full_name: string | null }> = {};

        if (uniqueUserIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', uniqueUserIds);

          if (!profilesError && profilesData) {
            profilesData.forEach((p) => {
              profilesMap[p.id] = { full_name: p.full_name };
            });
          }
        }

        const enrichedGames: SavedGame[] = gamesData.map((game: any) => ({
          id: game.id,
          created_at: game.created_at,
          game_mode: game.game_mode,
          views: game.views,
          user_id: game.user_id,
          settings: {
            gameName: game.gameName || game.opponent_name || '',
            myTeam: game.myTeam || game.my_team_name || '',
            tournamentName: game.tournamentName || null,
            myScore: typeof game.myScore === 'number' ? game.myScore : undefined,
            opponentScore:
              typeof game.opponentScore === 'number' ? game.opponentScore : undefined,
          },
          profiles: profilesMap[game.user_id] || null,
        }));

        cachedGamesList = { games: enrichedGames, timestamp: Date.now() };
        setGames(enrichedGames);

        const hasMyCloudGames = Boolean(
          user && enrichedGames.some((g) => g.user_id === user.id)
        );
        setActiveTab(freshLocal.length > 0 || hasMyCloudGames ? 'myGames' : 'community');
      } catch (err: unknown) {
        setError(getFriendlySupabaseErrorMessage(err, isOnline));
        if (freshLocal.length > 0) {
          setActiveTab('myGames');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [isOnline, user]
  );

  useEffect(() => {
    if (isOpen) {
      fetchGames();
    }
  }, [fetchGames, isOpen]);

  const myCloudGames = useMemo(() => {
    if (!user) return [];
    return games.filter((g) => g.user_id === user.id);
  }, [games, user]);

  const loadedCloudIds = useMemo(() => {
    return new Set(myCloudGames.map((g) => g.id));
  }, [myCloudGames]);

  const deduplicatedLocalGames = useMemo(() => {
    return localGames.filter((lg) => !(lg.cloudGameId && loadedCloudIds.has(lg.cloudGameId)));
  }, [localGames, loadedCloudIds]);

  const myGamesCount = myCloudGames.length + deduplicatedLocalGames.length;
  const communityGamesCount = games.length;

  const uniqueTeams = useMemo(() => {
    const teams = new Set<string>(['Todos']);
    games.forEach((g) => {
      teams.add(g.settings?.myTeam || 'Sin Equipo');
    });
    deduplicatedLocalGames.forEach((lg) => {
      teams.add(lg.myTeam || 'Sin Equipo');
    });
    return Array.from(teams);
  }, [games, deduplicatedLocalGames]);

  const visibleLocalGames = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return deduplicatedLocalGames.filter((lg) => {
      const matchesSearch =
        !term ||
        lg.gameName.toLowerCase().includes(term) ||
        lg.myTeam.toLowerCase().includes(term) ||
        (lg.tournamentName || '').toLowerCase().includes(term);

      const teamName = lg.myTeam || 'Sin Equipo';
      const matchesTeam = selectedTeam === 'Todos' || teamName === selectedTeam;
      return matchesSearch && matchesTeam;
    });
  }, [deduplicatedLocalGames, searchTerm, selectedTeam]);

  const filteredGames = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return games.filter((game) => {
      if (activeTab === 'myGames') {
        if (!user || game.user_id !== user.id) return false;
      }

      const matchesSearch =
        !term ||
        (game.settings?.gameName || '').toLowerCase().includes(term) ||
        (game.profiles?.full_name || '').toLowerCase().includes(term) ||
        (game.settings?.myTeam || '').toLowerCase().includes(term);

      const teamName = game.settings?.myTeam || 'Sin Equipo';
      const matchesTeam = selectedTeam === 'Todos' || teamName === selectedTeam;

      return matchesSearch && matchesTeam;
    });
  }, [games, activeTab, user, searchTerm, selectedTeam]);

  const handleDelete = async (gameId: string) => {
    setDeletingId(gameId);
    try {
      const ok = await handleDeleteGame(gameId);
      if (ok) {
        setLocalGames(listLocalGames());
        if (!isLocalGameId(gameId)) {
          setGames((prev) => {
            const updated = prev.filter((g) => g.id !== gameId);
            cachedGamesList = { games: updated, timestamp: Date.now() };
            return updated;
          });
        }
        setConfirmDeleteId(null);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const getGameModeLabel = (mode: string | null) => {
    if (mode === 'shot-chart') return 'Mapa de Tiros (Legado)';
    if (mode === 'stats-tally') return 'Planilla';
    return 'Partido';
  };

  const modalFooter = (
    <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-ink-muted tabular-nums">
      <span>
        {activeTab === 'myGames'
          ? `Mostrando ${visibleLocalGames.length + (user ? filteredGames.length : 0)} de ${myGamesCount} partidos`
          : `Mostrando ${filteredGames.length} de ${communityGamesCount} partidos`}
      </span>
      {(user || deduplicatedLocalGames.length > 0) && (
        <span className="text-brand font-semibold">
          {user
            ? `${myGamesCount} en tus partidos`
            : `${deduplicatedLocalGames.length} guardado(s) en este dispositivo`}
        </span>
      )}
    </div>
  );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Historial de Partidos"
      subtitle="Recuperá partidos anteriores, consultá estadísticas o continuá anotando"
      headerLeading={
        <div className="w-9 h-9 rounded-xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand">
          <FolderIcon className="h-5 w-5" />
        </div>
      }
      maxWidth="4xl"
      zIndexClass="z-[70]"
      bodyClassName="flex flex-col min-h-0 overflow-hidden p-0"
      footer={modalFooter}
    >
      {/* Tabs */}
      <div className="flex border-b border-border-subtle bg-surface-card shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('myGames')}
          className={`flex-1 min-h-[46px] py-2.5 px-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors border-b-2 ${
            activeTab === 'myGames'
              ? 'text-brand border-brand bg-surface-elevated/40'
              : 'text-ink-muted border-transparent hover:text-ink-primary hover:bg-surface-elevated/25'
          }`}
        >
          <StarIcon className="h-4 w-4 shrink-0" />
          <span>Mis Partidos</span>
          {(user || myGamesCount > 0) && (
            <span
              className={`px-2 py-0.5 rounded-lg text-[11px] font-extrabold tabular-nums ${
                activeTab === 'myGames'
                  ? 'bg-brand/20 text-brand'
                  : 'bg-surface-elevated text-ink-muted'
              }`}
            >
              {myGamesCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('community')}
          className={`flex-1 min-h-[46px] py-2.5 px-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors border-b-2 ${
            activeTab === 'community'
              ? 'text-brand border-brand bg-surface-elevated/40'
              : 'text-ink-muted border-transparent hover:text-ink-primary hover:bg-surface-elevated/25'
          }`}
        >
          <GlobeIcon className="h-4 w-4 shrink-0" />
          <span className="sm:hidden">Comunidad</span>
          <span className="hidden sm:inline">Partidos de la Comunidad</span>
          <span
            className={`px-2 py-0.5 rounded-lg text-[11px] font-extrabold tabular-nums ${
              activeTab === 'community'
                ? 'bg-brand/20 text-brand'
                : 'bg-surface-elevated text-ink-muted'
            }`}
          >
            {communityGamesCount}
          </span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="p-3 sm:p-4 bg-surface-canvas/50 border-b border-border-subtle space-y-2.5 flex-shrink-0">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
            <SearchIcon className="h-4 w-4" />
          </div>
          <input
            type="text"
            className="bg-surface-elevated border border-border-strong text-ink-primary text-base sm:text-sm rounded-xl focus:border-brand block w-full pl-10 pr-4 py-2.5 placeholder-ink-muted transition-colors"
            placeholder="Buscar por partido, rival, equipo o creador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {uniqueTeams.length > 2 && (
          <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-0.5">
            {uniqueTeams.map((team) => (
              <button
                type="button"
                key={team}
                onClick={() => setSelectedTeam(team)}
                className={`whitespace-nowrap px-3 min-h-[34px] rounded-lg text-xs font-bold transition-colors ${
                  selectedTeam === team
                    ? 'bg-brand text-ink-inverse font-extrabold'
                    : 'bg-surface-elevated text-ink-secondary hover:text-ink-primary border border-border-subtle'
                }`}
              >
                {team}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Games List */}
      <div className="flex-grow overflow-y-auto custom-scrollbar p-3 sm:p-4 bg-surface-canvas space-y-4">
        {error && !loading && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sport-miss-light p-3.5 bg-sport-miss/10 rounded-xl border border-sport-miss/35">
            <div className="flex items-start gap-2.5 text-xs sm:text-sm">
              <AlertTriangleIcon className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => fetchGames(true)}
              className="self-start sm:self-auto shrink-0 min-h-[40px] px-3.5 py-2 bg-sport-miss hover:bg-red-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
            >
              <RefreshIcon className="h-3.5 w-3.5" />
              <span>Reintentar</span>
            </button>
          </div>
        )}

        {/* Local Matches */}
        {activeTab === 'myGames' && visibleLocalGames.length > 0 && (
          <section className="space-y-2.5">
            <div className="flex items-center justify-between px-0.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sport-warn-light flex items-center gap-1.5">
                <SmartphoneIcon className="h-4 w-4" />
                <span>En este dispositivo (Local)</span>
              </h3>
              <span className="text-xs font-semibold text-ink-muted tabular-nums">
                {visibleLocalGames.length}{' '}
                {visibleLocalGames.length === 1 ? 'planilla' : 'planillas'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {visibleLocalGames.map((lg) => {
                const matchTitle =
                  lg.myTeam && lg.gameName
                    ? `${lg.myTeam} vs ${lg.gameName}`
                    : lg.gameName || lg.myTeam || 'Partido sin nombre';

                return (
                  <div
                    key={lg.localId}
                    className="bg-surface-card hover:bg-surface-elevated/70 border border-sport-warn/35 hover:border-brand/50 p-3.5 sm:p-4 rounded-xl transition-colors flex flex-col sm:flex-row gap-3 items-start sm:items-center"
                  >
                    <div className="flex-shrink-0 hidden sm:block">
                      <TeamLogo
                        teamName={lg.myTeam || ''}
                        className="h-11 w-11"
                        fallbackClassName="bg-surface-elevated"
                      />
                    </div>

                    <div className="flex-grow min-w-0 w-full">
                      <div className="flex items-center gap-2 mb-1 min-w-0">
                        <div className="sm:hidden shrink-0">
                          <TeamLogo teamName={lg.myTeam || ''} className="h-6 w-6" />
                        </div>
                        <h4 className="font-extrabold text-ink-primary text-sm sm:text-base truncate min-w-0 flex-1">
                          {matchTitle}
                        </h4>
                        <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-sport-warn/15 text-sport-warn-light border border-sport-warn/35">
                          Local
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                        <div className="flex items-center gap-1.5 tabular-nums">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          <span>
                            {new Date(lg.updatedAt || lg.createdAt).toLocaleDateString('es-AR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        <span>{PERIOD_NAMES[lg.currentPeriod] || 'Primer Tiempo'}</span>

                        {lg.tournamentName && (
                          <span className="inline-flex items-center gap-1 text-ink-secondary font-medium truncate max-w-[180px]">
                            <TrophyIcon className="h-3 w-3 text-sport-warn-light shrink-0" />
                            <span className="truncate">{lg.tournamentName}</span>
                          </span>
                        )}

                        <span className="bg-brand/10 text-brand font-bold px-2 py-0.5 rounded-md border border-brand/25 tabular-nums">
                          {lg.myScore} - {lg.opponentScore}
                        </span>

                        <span className="tabular-nums">
                          {lg.eventsCount} {lg.eventsCount === 1 ? 'acción' : 'acciones'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-border-subtle">
                      <button
                        type="button"
                        onClick={() => onLoadGame(lg.localId, true)}
                        className="flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-ink-inverse font-extrabold py-2 px-3.5 min-h-[44px] rounded-xl text-xs uppercase tracking-wider transition-colors"
                        title="Reanudar y continuar registrando jugadas"
                      >
                        <PencilIcon className="h-3.5 w-3.5" />
                        <span>Continuar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onLoadGame(lg.localId, false)}
                        className="flex items-center gap-1.5 bg-surface-elevated hover:bg-surface-hover text-ink-primary font-bold py-2 px-3 min-h-[44px] rounded-xl border border-border-strong text-xs transition-colors"
                        title="Ver estadísticas y análisis"
                      >
                        <ChartBarIcon className="h-3.5 w-3.5 text-brand" />
                        <span>Stats</span>
                      </button>

                      {confirmDeleteId === lg.localId ? (
                        <div className="flex items-center gap-1 bg-sport-miss/15 p-1 rounded-xl border border-sport-miss/40 animate-fade-in">
                          <button
                            type="button"
                            onClick={() => handleDelete(lg.localId)}
                            disabled={deletingId === lg.localId}
                            className="min-h-[36px] px-2.5 bg-sport-miss hover:bg-red-500 text-white text-xs font-extrabold rounded-lg"
                          >
                            {deletingId === lg.localId ? '...' : 'Sí'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="min-h-[36px] px-2.5 bg-surface-elevated hover:bg-surface-hover text-ink-secondary text-xs font-bold rounded-lg"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(lg.localId)}
                          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-ink-muted hover:text-sport-miss-light hover:bg-sport-miss/10 rounded-xl transition-colors"
                          title="Eliminar partido local"
                          aria-label="Eliminar partido local"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 text-ink-muted">
            <Loader />
            <p className="mt-4 text-sm font-medium">Cargando partidos en la nube...</p>
          </div>
        )}

        {!loading && activeTab === 'myGames' && !user && visibleLocalGames.length > 0 && onLogin && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-surface-card rounded-xl border border-border-subtle text-left">
            <div className="text-xs sm:text-sm text-ink-secondary">
              <p className="font-bold text-ink-primary">
                ¿Querés respaldar estas planillas en la nube?
              </p>
              <p className="text-ink-muted text-xs mt-0.5">
                Iniciá sesión para acceder a tus partidos desde cualquier celular o computadora.
              </p>
            </div>
            <button
              type="button"
              onClick={onLogin}
              className="shrink-0 w-full sm:w-auto bg-brand hover:bg-brand-hover text-ink-inverse font-extrabold px-4 min-h-[44px] rounded-xl text-xs uppercase tracking-wider transition-colors active:scale-[0.98]"
            >
              Iniciar Sesión
            </button>
          </div>
        )}

        {!loading && !error && activeTab === 'myGames' && !user && visibleLocalGames.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-14 h-14 bg-surface-card border border-border-subtle rounded-2xl flex items-center justify-center text-brand mb-3">
              <LockIcon className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-extrabold text-ink-primary mb-1">
              Iniciá sesión para ver tus partidos en la nube
            </h3>
            <p className="text-ink-muted text-sm max-w-sm mb-5">
              {deduplicatedLocalGames.length > 0
                ? 'No se encontraron partidos locales con los filtros actuales.'
                : 'Accedé con tu cuenta para guardar, reanudar y consultar tu historial personal desde cualquier dispositivo.'}
            </p>
            {onLogin && (
              <button
                type="button"
                onClick={onLogin}
                className="bg-brand hover:bg-brand-hover text-ink-inverse font-extrabold px-6 min-h-[44px] rounded-xl text-sm transition-colors inline-flex items-center gap-2"
              >
                <LockIcon className="h-4 w-4" />
                <span>Iniciar Sesión</span>
              </button>
            )}
          </div>
        )}

        {!loading &&
          !error &&
          activeTab === 'myGames' &&
          user &&
          filteredGames.length === 0 &&
          visibleLocalGames.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-14 h-14 bg-surface-card border border-border-subtle rounded-2xl flex items-center justify-center text-ink-muted mb-3">
                <ClipboardIcon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-extrabold text-ink-primary mb-1">
                Aún no tenés partidos guardados
              </h3>
              <p className="text-ink-muted text-sm max-w-sm mb-4">
                Los partidos que anotes o guardes aparecerán acá para que los continúes cuando quieras.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('community')}
                className="min-h-[44px] px-4 text-brand hover:text-brand-hover font-bold text-xs uppercase tracking-wider underline underline-offset-4"
              >
                Explorar partidos de la comunidad
              </button>
            </div>
          )}

        {!loading && !error && activeTab === 'community' && filteredGames.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-ink-muted text-center">
            <p className="text-base font-bold text-ink-secondary">No se encontraron partidos</p>
            <p className="text-sm mt-1">Probá cambiando los filtros o el término de búsqueda.</p>
          </div>
        )}

        {!loading && !error && filteredGames.length > 0 && (
          <section className="space-y-2.5">
            {activeTab === 'myGames' && visibleLocalGames.length > 0 && (
              <div className="flex items-center justify-between px-0.5 pt-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand flex items-center gap-1.5">
                  <CloudCheckIcon className="h-4 w-4" />
                  <span>En la nube</span>
                </h3>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2.5">
              {filteredGames.map((game) => {
                const isMyGame = Boolean(user && game.user_id === user.id);
                const hasScore = game.settings?.myScore !== undefined;

                return (
                  <div
                    key={game.id}
                    className="group bg-surface-card hover:bg-surface-elevated/70 border border-border-subtle hover:border-brand/50 p-3.5 sm:p-4 rounded-xl transition-colors flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center"
                  >
                    <div className="flex-shrink-0 hidden sm:block">
                      <TeamLogo
                        teamName={game.settings?.myTeam || ''}
                        className="h-11 w-11"
                        fallbackClassName="bg-surface-elevated"
                      />
                    </div>

                    <div className="flex-grow min-w-0 w-full">
                      <div className="flex items-center justify-between sm:justify-start gap-2 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="sm:hidden shrink-0">
                            <TeamLogo teamName={game.settings?.myTeam || ''} className="h-6 w-6" />
                          </div>
                          <h3 className="font-extrabold text-ink-primary text-sm sm:text-base truncate group-hover:text-brand transition-colors">
                            {game.settings?.myTeam
                              ? `${game.settings.myTeam} vs ${game.settings?.gameName || 'Rival'}`
                              : game.settings?.gameName || 'Partido sin nombre'}
                          </h3>
                        </div>

                        {!isMyGame && game.profiles && (
                          <span className="text-[11px] text-ink-muted bg-surface-elevated px-2 py-0.5 rounded-lg border border-border-subtle whitespace-nowrap shrink-0">
                            por {game.profiles.full_name?.split(' ')[0] || 'Anónimo'}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                        <div className="flex items-center gap-1.5 tabular-nums">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          <span>
                            {new Date(game.created_at).toLocaleDateString('es-AR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              game.game_mode === 'shot-chart' ? 'bg-amber-400' : 'bg-sport-goal-light'
                            }`}
                          />
                          <span>{getGameModeLabel(game.game_mode)}</span>
                        </div>

                        {game.settings?.tournamentName && (
                          <span className="inline-flex items-center gap-1 text-ink-secondary font-medium">
                            <TrophyIcon className="h-3 w-3 text-sport-warn-light shrink-0" />
                            <span>{game.settings.tournamentName}</span>
                          </span>
                        )}

                        {hasScore && (
                          <span className="bg-brand/10 text-brand font-bold px-2 py-0.5 rounded-md border border-brand/25 tabular-nums">
                            {game.settings.myScore} - {game.settings.opponentScore || 0}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row flex-wrap sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-border-subtle justify-between sm:justify-center shrink-0">
                      <div
                        className="flex items-center gap-1 text-ink-muted text-[11px] font-medium tabular-nums"
                        title="Visualizaciones"
                      >
                        <EyeIcon className="h-3.5 w-3.5" />
                        <span>{game.views || 0}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {isMyGame ? (
                          <>
                            <button
                              type="button"
                              onClick={() => onLoadGame(game.id, true)}
                              className="flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-ink-inverse font-extrabold py-2 px-3.5 min-h-[44px] rounded-xl text-xs uppercase tracking-wider transition-colors"
                              title="Reanudar y continuar registrando jugadas"
                            >
                              <PencilIcon className="h-3.5 w-3.5" />
                              <span>Continuar</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => onLoadGame(game.id, false)}
                              className="flex items-center gap-1.5 bg-surface-elevated hover:bg-surface-hover text-ink-primary font-bold py-2 px-3 min-h-[44px] rounded-xl border border-border-strong text-xs transition-colors"
                              title="Ver estadísticas y análisis"
                            >
                              <ChartBarIcon className="h-3.5 w-3.5 text-brand" />
                              <span>Stats</span>
                            </button>

                            {confirmDeleteId === game.id ? (
                              <div className="flex items-center gap-1 bg-sport-miss/15 p-1 rounded-xl border border-sport-miss/40 animate-fade-in">
                                <button
                                  type="button"
                                  onClick={() => handleDelete(game.id)}
                                  disabled={deletingId === game.id}
                                  className="min-h-[36px] px-2.5 bg-sport-miss hover:bg-red-500 text-white text-xs font-extrabold rounded-lg"
                                >
                                  {deletingId === game.id ? '...' : 'Sí'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="min-h-[36px] px-2.5 bg-surface-elevated hover:bg-surface-hover text-ink-secondary text-xs font-bold rounded-lg"
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
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onLoadGame(game.id, false)}
                            className="bg-surface-elevated hover:bg-surface-hover text-ink-primary font-bold py-2 px-4 min-h-[44px] rounded-xl border border-border-strong text-xs transition-colors"
                          >
                            Ver Partido
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </ModalShell>
  );
};

export default LoadGameModal;
