import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../../utils/supabaseClient';
import { XIcon, EyeIcon, SearchIcon, CalendarIcon, TrashIcon } from '../icons';
import Loader from '@/components/ui/Loader';
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

// Short-lived cache (20s) to avoid redundant network waterfalls when reopening the modal
const GAMES_LIST_CACHE_TTL_MS = 20_000;
let cachedGamesList: { games: SavedGame[]; timestamp: number } | null = null;

const LoadGameModal: React.FC<LoadGameModalProps> = ({ isOpen = true, onClose, onLoadGame, user, onLogin }) => {
    const { handleDeleteGame, isOnline } = useSync();

    // Data State
    const [games, setGames] = useState<SavedGame[]>(() => cachedGamesList?.games || []);
    const [localGames, setLocalGames] = useState<LocalSavedGame[]>(() => listLocalGames());
    const [loading, setLoading] = useState(!cachedGamesList);
    const [error, setError] = useState<string | null>(null);

    // Active Tab: 'myGames' | 'community'
    const [activeTab, setActiveTab] = useState<'myGames' | 'community'>('myGames');

    // Filtering State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTeam, setSelectedTeam] = useState<string>('Todos');

    // Deletion State
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // --- FETCH DATA (Projection excludes heavy settings.gameLog and player_names JSONB) ---
    const fetchGames = useCallback(async (forceRefresh = false) => {
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
        if (!forceRefresh && cachedGamesList && now - cachedGamesList.timestamp < GAMES_LIST_CACHE_TTL_MS) {
            setGames(cachedGamesList.games);
            setError(null);
            setLoading(false);
            const hasMyCloudGames = Boolean(user && cachedGamesList.games.some(g => g.user_id === user.id));
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

            const uniqueUserIds = Array.from(new Set(gamesData.map((g: any) => g.user_id).filter(Boolean)));
            const profilesMap: Record<string, { full_name: string | null }> = {};

            if (uniqueUserIds.length > 0) {
                const { data: profilesData, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, full_name')
                    .in('id', uniqueUserIds);

                if (!profilesError && profilesData) {
                    profilesData.forEach(p => {
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
                    opponentScore: typeof game.opponentScore === 'number' ? game.opponentScore : undefined,
                },
                profiles: profilesMap[game.user_id] || null
            }));

            cachedGamesList = { games: enrichedGames, timestamp: Date.now() };
            setGames(enrichedGames);

            // Default tab: if user has local or cloud games, 'myGames', otherwise 'community'
            const hasMyCloudGames = Boolean(user && enrichedGames.some(g => g.user_id === user.id));
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
    }, [isOnline, user]);

    useEffect(() => {
        if (isOpen) {
            fetchGames();
        }
    }, [fetchGames, isOpen]);

    const myCloudGames = useMemo(() => {
        if (!user) return [];
        return games.filter(g => g.user_id === user.id);
    }, [games, user]);

    const loadedCloudIds = useMemo(() => {
        return new Set(myCloudGames.map(g => g.id));
    }, [myCloudGames]);

    const deduplicatedLocalGames = useMemo(() => {
        return localGames.filter(lg => !(lg.cloudGameId && loadedCloudIds.has(lg.cloudGameId)));
    }, [localGames, loadedCloudIds]);

    const myGamesCount = myCloudGames.length + deduplicatedLocalGames.length;

    const communityGamesCount = useMemo(() => {
        return games.length;
    }, [games]);

    const uniqueTeams = useMemo(() => {
        const teams = new Set<string>(['Todos']);
        games.forEach(g => {
            if (g.settings?.myTeam) {
                teams.add(g.settings.myTeam);
            } else {
                teams.add('Sin Equipo');
            }
        });
        deduplicatedLocalGames.forEach(lg => {
            if (lg.myTeam) {
                teams.add(lg.myTeam);
            } else {
                teams.add('Sin Equipo');
            }
        });
        return Array.from(teams);
    }, [games, deduplicatedLocalGames]);

    const visibleLocalGames = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return deduplicatedLocalGames.filter(lg => {
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
        return games.filter(game => {
            // Tab filter
            if (activeTab === 'myGames') {
                if (!user || game.user_id !== user.id) return false;
            }

            // Search filter
            const matchesSearch =
                !term ||
                (game.settings?.gameName || '').toLowerCase().includes(term) ||
                (game.profiles?.full_name || '').toLowerCase().includes(term) ||
                (game.settings?.myTeam || '').toLowerCase().includes(term);

            // Team filter
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
                    setGames(prev => {
                        const updated = prev.filter(g => g.id !== gameId);
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

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-50 transition-opacity p-3 sm:p-4 animate-fade-in"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <div
                className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-700 overflow-hidden relative"
                onClick={e => e.stopPropagation()}
            >
                {/* --- HEADER --- */}
                <div className="flex justify-between items-center p-4 sm:p-5 border-b border-slate-700 bg-slate-800 flex-shrink-0">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                            <span>📂</span> Historial de Partidos
                        </h2>
                        <p className="text-slate-400 text-xs mt-0.5">
                            Recuperá partidos anteriores, consultá estadísticas o continuá anotando
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
                        aria-label="Cerrar"
                    >
                        <XIcon />
                    </button>
                </div>

                {/* --- TABS --- */}
                <div className="flex border-b border-slate-700 bg-slate-800/80 shrink-0">
                    <button
                        onClick={() => setActiveTab('myGames')}
                        className={`flex-1 py-3 px-2.5 sm:px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all border-b-2 ${
                            activeTab === 'myGames'
                                ? 'text-cyan-400 border-cyan-400 bg-slate-800'
                                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-700/80'
                        }`}
                    >
                        <span>⭐ Mis Partidos</span>
                        {(user || myGamesCount > 0) && (
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                                activeTab === 'myGames' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-700 text-slate-400'
                            }`}>
                                {myGamesCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('community')}
                        className={`flex-1 py-3 px-2.5 sm:px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all border-b-2 ${
                            activeTab === 'community'
                                ? 'text-cyan-400 border-cyan-400 bg-slate-800'
                                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-700/80'
                        }`}
                    >
                        <span className="sm:hidden">🌐 Comunidad</span>
                        <span className="hidden sm:inline">🌐 Partidos de la Comunidad</span>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                            activeTab === 'community' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-700 text-slate-400'
                        }`}>
                            {communityGamesCount}
                        </span>
                    </button>
                </div>

                {/* --- FILTERS & SEARCH --- */}
                <div className="p-3 sm:p-4 bg-slate-800/40 border-b border-slate-700 space-y-3 flex-shrink-0">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <SearchIcon />
                        </div>
                        <input
                            type="text"
                            className="bg-slate-900 border border-slate-600 text-white text-sm rounded-xl focus:ring-cyan-500 focus:border-cyan-500 block w-full pl-10 p-2.5 placeholder-slate-500 transition-colors"
                            placeholder="Buscar por partido, rival, equipo o creador..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {uniqueTeams.length > 2 && (
                        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                            {uniqueTeams.map(team => (
                                <button
                                    key={team}
                                    onClick={() => setSelectedTeam(team)}
                                    className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                        selectedTeam === team
                                            ? 'bg-cyan-600 text-white shadow-lg ring-1 ring-cyan-400'
                                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                                    }`}
                                >
                                    {team}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* --- GAMES LIST --- */}
                <div className="flex-grow overflow-y-auto custom-scrollbar p-3 sm:p-4 bg-slate-900 space-y-4">
                    {/* Non-blocking error banner (keeps local matches visible and accessible offline) */}
                    {error && !loading && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-200 p-4 bg-red-950/30 rounded-xl border border-red-800/60">
                            <div className="flex items-start gap-2.5 text-xs sm:text-sm">
                                <span className="shrink-0">⚠️</span>
                                <span>{error}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => fetchGames(true)}
                                className="self-start sm:self-auto shrink-0 min-h-[40px] px-3.5 py-2 bg-red-600/80 hover:bg-red-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors"
                            >
                                🔄 Reintentar
                            </button>
                        </div>
                    )}

                    {/* LOCAL MATCHES ON THIS DEVICE ("Mis Partidos" tab — available offline & without login) */}
                    {activeTab === 'myGames' && visibleLocalGames.length > 0 && (
                        <section className="space-y-2.5">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                                    <span>📱</span>
                                    <span>En este dispositivo (Local)</span>
                                </h3>
                                <span className="text-[11px] font-bold text-slate-400">
                                    {visibleLocalGames.length} {visibleLocalGames.length === 1 ? 'planilla' : 'planillas'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {visibleLocalGames.map(lg => {
                                    const matchTitle =
                                        lg.myTeam && lg.gameName
                                            ? `${lg.myTeam} vs ${lg.gameName}`
                                            : lg.gameName || lg.myTeam || 'Partido sin nombre';

                                    return (
                                        <div
                                            key={lg.localId}
                                            className="bg-slate-800/95 hover:bg-slate-800 border border-amber-700/40 hover:border-cyan-500/50 p-3.5 sm:p-4 rounded-xl transition-all duration-200 flex flex-col sm:flex-row gap-3 items-start sm:items-center shadow-md"
                                        >
                                            <div className="flex-shrink-0 hidden sm:block">
                                                <TeamLogo
                                                    teamName={lg.myTeam || ''}
                                                    className="h-12 w-12"
                                                    fallbackClassName="bg-slate-700"
                                                />
                                            </div>

                                            <div className="flex-grow min-w-0 w-full">
                                                <div className="flex items-center gap-2 mb-1 min-w-0">
                                                    <div className="sm:hidden shrink-0">
                                                        <TeamLogo teamName={lg.myTeam || ''} className="h-6 w-6" />
                                                    </div>
                                                    <h4 className="font-black text-white text-sm sm:text-base truncate min-w-0 flex-1">
                                                        {matchTitle}
                                                    </h4>
                                                    <span className="shrink-0 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-700/60">
                                                        Local
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <CalendarIcon className="h-3.5 w-3.5 text-slate-500" />
                                                        <span>
                                                            {new Date(lg.updatedAt || lg.createdAt).toLocaleDateString('es-AR', {
                                                                day: 'numeric', month: 'short', year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>

                                                    <span>{PERIOD_NAMES[lg.currentPeriod] || 'Primer Tiempo'}</span>

                                                    {lg.tournamentName && (
                                                        <span className="text-slate-400 font-medium truncate max-w-[180px]">
                                                            🏆 {lg.tournamentName}
                                                        </span>
                                                    )}

                                                    <span className="bg-cyan-950/60 text-cyan-300 font-bold px-2 py-0.5 rounded border border-cyan-800/50">
                                                        Score: {lg.myScore} - {lg.opponentScore}
                                                    </span>

                                                    <span className="text-slate-500 font-medium">
                                                        {lg.eventsCount} {lg.eventsCount === 1 ? 'acción' : 'acciones'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/60">
                                                <button
                                                    type="button"
                                                    onClick={() => onLoadGame(lg.localId, true)}
                                                    className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black py-2 px-3.5 min-h-[40px] rounded-xl shadow-md text-xs uppercase tracking-wider transition-all"
                                                    title="Reanudar y continuar registrando jugadas"
                                                >
                                                    <span>✏️</span> Continuar
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => onLoadGame(lg.localId, false)}
                                                    className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-2 px-3 min-h-[40px] rounded-xl border border-slate-600 text-xs transition-colors"
                                                    title="Ver estadísticas y análisis"
                                                >
                                                    📊 Stats
                                                </button>

                                                {confirmDeleteId === lg.localId ? (
                                                    <div className="flex items-center gap-1 bg-red-950/80 p-1 rounded-lg border border-red-800 animate-fade-in">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(lg.localId)}
                                                            disabled={deletingId === lg.localId}
                                                            className="px-2.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black rounded"
                                                        >
                                                            {deletingId === lg.localId ? '...' : 'Sí'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setConfirmDeleteId(null)}
                                                            className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px] font-bold rounded"
                                                        >
                                                            No
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setConfirmDeleteId(lg.localId)}
                                                        className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
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
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Loader />
                            <p className="mt-4 animate-pulse text-sm">Cargando partidos en la nube...</p>
                        </div>
                    )}

                    {!loading && activeTab === 'myGames' && !user && visibleLocalGames.length > 0 && onLogin && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-800/70 rounded-xl border border-slate-700/80 text-left">
                            <div className="text-xs sm:text-sm text-slate-300">
                                <p className="font-bold text-white">¿Querés respaldar estas planillas en la nube?</p>
                                <p className="text-slate-400 text-xs mt-0.5">
                                    Iniciá sesión para acceder a tus partidos desde cualquier celular o computadora.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onLogin}
                                className="shrink-0 w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black px-4 py-2.5 min-h-[44px] rounded-xl text-xs uppercase tracking-wider shadow transition-transform active:scale-95"
                            >
                                Iniciar Sesión
                            </button>
                        </div>
                    )}

                    {!loading && !error && activeTab === 'myGames' && !user && visibleLocalGames.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-3xl mb-3">
                                🔒
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">Iniciá sesión para ver tus partidos en la nube</h3>
                            <p className="text-slate-400 text-sm max-w-sm mb-5">
                                {deduplicatedLocalGames.length > 0
                                    ? 'No se encontraron partidos locales con los filtros actuales.'
                                    : 'Accedé con tu cuenta para guardar, reanudar y consultar tu historial personal desde cualquier dispositivo.'}
                            </p>
                            {onLogin && (
                                <button
                                    type="button"
                                    onClick={onLogin}
                                    className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black px-6 py-2.5 min-h-[44px] rounded-full text-sm transition-transform hover:scale-105 shadow-lg inline-flex items-center gap-2 cursor-pointer"
                                >
                                    <span>🔐</span>
                                    <span>Iniciar Sesión</span>
                                </button>
                            )}
                        </div>
                    )}

                    {!loading && !error && activeTab === 'myGames' && user && filteredGames.length === 0 && visibleLocalGames.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-slate-400">
                            <span className="text-4xl mb-3">📋</span>
                            <h3 className="text-lg font-bold text-white mb-1">Aún no tenés partidos guardados</h3>
                            <p className="text-slate-400 text-sm max-w-sm mb-4">
                                Los partidos que anotes o guardes aparecerán acá para que los continúes cuando quieras.
                            </p>
                            <button
                                onClick={() => setActiveTab('community')}
                                className="text-cyan-400 hover:text-cyan-300 font-bold text-xs uppercase tracking-wider underline underline-offset-4"
                            >
                                Explorar partidos de la comunidad →
                            </button>
                        </div>
                    )}

                    {!loading && !error && activeTab === 'community' && filteredGames.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                            <p className="text-lg font-semibold">No se encontraron partidos</p>
                            <p className="text-sm">Probá cambiando los filtros o el término de búsqueda.</p>
                        </div>
                    )}

                    {!loading && !error && filteredGames.length > 0 && (
                        <section className="space-y-2.5">
                            {activeTab === 'myGames' && visibleLocalGames.length > 0 && (
                                <div className="flex items-center justify-between px-1 pt-1">
                                    <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                                        <span>☁️</span>
                                        <span>En la nube</span>
                                    </h3>
                                </div>
                            )}
                            <div className="grid grid-cols-1 gap-3">
                                {filteredGames.map(game => {
                                    const isMyGame = Boolean(user && game.user_id === user.id);
                                    const hasScore = game.settings?.myScore !== undefined;

                                    return (
                                        <div
                                            key={game.id}
                                            className="group bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 p-4 rounded-xl transition-all duration-200 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center relative overflow-hidden shadow-md"
                                        >
                                            <div className="flex-shrink-0 hidden sm:block">
                                                <TeamLogo
                                                    teamName={game.settings?.myTeam || ''}
                                                    className="h-12 w-12 opacity-90 group-hover:opacity-100 transition-opacity"
                                                    fallbackClassName="bg-slate-700"
                                                />
                                            </div>

                                            <div className="flex-grow min-w-0 w-full">
                                                <div className="flex items-center justify-between sm:justify-start gap-2 mb-1">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className="sm:hidden shrink-0">
                                                            <TeamLogo teamName={game.settings?.myTeam || ''} className="h-6 w-6" />
                                                        </div>
                                                        <h3 className="font-black text-white text-base sm:text-lg truncate group-hover:text-cyan-400 transition-colors">
                                                            {game.settings?.gameName || 'Partido sin nombre'}
                                                        </h3>
                                                    </div>

                                                    {/* Creator badge */}
                                                    {!isMyGame && game.profiles && (
                                                        <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-700 whitespace-nowrap shrink-0">
                                                            por {game.profiles.full_name?.split(' ')[0] || 'Anónimo'}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <CalendarIcon className="h-3.5 w-3.5 text-slate-500" />
                                                        <span>
                                                            {new Date(game.created_at).toLocaleDateString('es-AR', {
                                                                day: 'numeric', month: 'short', year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`w-2 h-2 rounded-full ${game.game_mode === 'shot-chart' ? 'bg-purple-500' : 'bg-emerald-500'}`}></span>
                                                        <span>{getGameModeLabel(game.game_mode)}</span>
                                                    </div>

                                                    {game.settings?.tournamentName && (
                                                        <span className="text-slate-400 font-medium">
                                                            🏆 {game.settings.tournamentName}
                                                        </span>
                                                    )}

                                                    {hasScore && (
                                                        <span className="bg-cyan-950/60 text-cyan-300 font-bold px-2 py-0.5 rounded border border-cyan-800/50">
                                                            Score: {game.settings.myScore} - {game.settings.opponentScore || 0}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-row flex-wrap sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto mt-2 sm:mt-0 justify-between sm:justify-center shrink-0">
                                                <div className="flex items-center gap-1 text-slate-500 text-[11px] font-medium" title="Visualizaciones">
                                                    <EyeIcon className="h-3 w-3" />
                                                    <span>{game.views || 0}</span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2">
                                                    {isMyGame ? (
                                                        <>
                                                            {/* Continuar Anotando (Modo Edición) */}
                                                            <button
                                                                onClick={() => onLoadGame(game.id, true)}
                                                                className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black py-2 px-3.5 rounded-xl shadow-md hover:shadow-cyan-500/20 text-xs uppercase tracking-wider transition-all"
                                                                title="Reanudar y continuar registrando jugadas"
                                                            >
                                                                <span>✏️</span> Continuar
                                                            </button>

                                                            {/* Ver Estadísticas (Modo Lectura) */}
                                                            <button
                                                                onClick={() => onLoadGame(game.id, false)}
                                                                className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-2 px-3 rounded-xl border border-slate-600 text-xs transition-colors"
                                                                title="Ver estadísticas y análisis"
                                                            >
                                                                📊 Stats
                                                            </button>

                                                            {/* Eliminar Partido */}
                                                            {confirmDeleteId === game.id ? (
                                                                <div className="flex items-center gap-1 bg-red-950/80 p-1 rounded-lg border border-red-800 animate-fade-in">
                                                                    <button
                                                                        onClick={() => handleDelete(game.id)}
                                                                        disabled={deletingId === game.id}
                                                                        className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black rounded"
                                                                    >
                                                                        {deletingId === game.id ? '...' : 'Sí'}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setConfirmDeleteId(null)}
                                                                        className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px] font-bold rounded"
                                                                    >
                                                                        No
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setConfirmDeleteId(game.id)}
                                                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                                                                    title="Eliminar partido"
                                                                >
                                                                    <TrashIcon className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        /* Partido ajeno: solo lectura */
                                                        <button
                                                            onClick={() => onLoadGame(game.id, false)}
                                                            className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-2 px-4 rounded-xl border border-slate-600 text-xs transition-colors"
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

                {/* --- FOOTER --- */}
                <div className="bg-slate-800 px-4 py-2.5 text-center text-xs text-slate-400 border-t border-slate-700 flex flex-wrap justify-between items-center gap-2 flex-shrink-0">
                    <span>
                        {activeTab === 'myGames'
                            ? `Mostrando ${visibleLocalGames.length + (user ? filteredGames.length : 0)} de ${myGamesCount} partidos`
                            : `Mostrando ${filteredGames.length} de ${communityGamesCount} partidos`}
                    </span>
                    {(user || deduplicatedLocalGames.length > 0) && (
                        <span className="text-cyan-400 font-medium text-[11px]">
                            {user
                                ? `${myGamesCount} en tus partidos`
                                : `${deduplicatedLocalGames.length} guardado(s) en este dispositivo`}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoadGameModal;
