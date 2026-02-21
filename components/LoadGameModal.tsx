
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Eye, Search, Calendar, ChevronDown, Users, ChevronRight, Folder } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import Loader from './Loader';
import TeamLogo from './TeamLogo';
import { TrophyIcon } from './Icons';
import { GameMode, Settings } from '../types';

interface SavedGame {
    id: string;
    created_at: string;
    game_mode: GameMode;
    player_names: Record<string, string>;
    settings: Settings;
    views: number;
    tournament_id: string | null;
    user_id: string;
    profiles?: { full_name: string | null } | null;
}

interface TournamentSummary {
    id: string | 'all' | 'none';
    name: string;
}

interface LoadGameModalProps {
    onClose: () => void;
    onLoadGame: (gameId: string) => void;
    user: any;
}

const LoadGameModal: React.FC<LoadGameModalProps> = ({ onClose, onLoadGame, user }) => {
    // Navigation State
    const [view, setView] = useState<'tournaments' | 'games'>('tournaments');
    const [selectedTournament, setSelectedTournament] = useState<TournamentSummary | null>(null);

    // Data State
    const [tournaments, setTournaments] = useState<TournamentSummary[]>([]);
    const [games, setGames] = useState<SavedGame[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Game Filtering State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTeam, setSelectedTeam] = useState<string>('Todos');

    // --- FETCH DATA ---

    const fetchTournaments = useCallback(async () => {
        if (!user) return;
        
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('tournaments')
                .select('id, name')
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            // Only store actual DB tournaments here
            setTournaments(data || []);
        } catch (err: any) {
            setError('No se pudieron cargar los torneos.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const fetchGames = useCallback(async (tournamentId: string) => {
        if (!user) return;

        setLoading(true);
        setError(null);
        try {
            let query = supabase
                .from('games')
                .select('id, created_at, game_mode, player_names, settings, views, tournament_id, user_id')
                .order('created_at', { ascending: false });

            if (tournamentId === 'all') {
                query = query.eq('user_id', user.id);
            } else if (tournamentId === 'none') {
                query = query.eq('user_id', user.id).is('tournament_id', null);
            } else {
                query = query.eq('tournament_id', tournamentId);
            }

            const { data: gamesData, error: gamesError } = await query;

            if (gamesError) throw gamesError;
            
            if (!gamesData || gamesData.length === 0) {
                setGames([]);
                return;
            }

            const uniqueUserIds = Array.from(new Set(gamesData.map(g => g.user_id).filter(Boolean)));
            let profilesMap: Record<string, { full_name: string | null }> = {};

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

            const enrichedGames: SavedGame[] = gamesData.map(game => ({
                ...game,
                profiles: profilesMap[game.user_id] || null
            }));

            setGames(enrichedGames);
        } catch (err: any) {
            setError('No se pudieron cargar los partidos.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (view === 'tournaments' && user) {
            fetchTournaments();
        }
    }, [view, fetchTournaments, user]);

    const handleTournamentSelect = (tournament: TournamentSummary) => {
        setSelectedTournament(tournament);
        setView('games');
        fetchGames(tournament.id);
        setSearchTerm('');
        setSelectedTeam('Todos');
    };

    const handleBackToTournaments = () => {
        setView('tournaments');
        setSelectedTournament(null);
        setGames([]);
    };

    const uniqueTeams = useMemo(() => {
        const teams = new Set<string>(['Todos']);
        games.forEach(g => {
            if (g.settings?.myTeam) {
                teams.add(g.settings.myTeam);
            } else {
                teams.add('Sin Equipo');
            }
        });
        return Array.from(teams);
    }, [games]);

    const filteredGames = useMemo(() => {
        return games.filter(game => {
            const matchesSearch = 
                (game.settings?.gameName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (game.profiles?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
            
            const teamName = game.settings?.myTeam || 'Sin Equipo';
            const matchesTeam = selectedTeam === 'Todos' || teamName === selectedTeam;
            
            return matchesSearch && matchesTeam;
        });
    }, [games, searchTerm, selectedTeam]);

    const getGameModeLabel = (mode: GameMode) => {
        if (mode === 'shot-chart') return 'Mapa de Tiros';
        if (mode === 'stats-tally') return 'Anotador';
        return 'Desconocido';
    };

    if (!user) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
                <div className="bg-slate-900 rounded-xl shadow-2xl p-8 max-w-sm w-full text-center border border-slate-700">
                    <h2 className="text-2xl font-bold text-white mb-4">Iniciar Sesión</h2>
                    <p className="text-slate-400 mb-6">Necesitas ingresar con tu cuenta para ver el historial de partidos.</p>
                    <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                        Cerrar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 transition-opacity p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-700 overflow-hidden">
                
                {/* --- HEADER --- */}
                <div className="flex justify-between items-center p-5 border-b border-slate-700 bg-slate-800 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {view === 'games' && (
                            <button 
                                onClick={handleBackToTournaments}
                                className="p-1.5 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                            >
                                <ChevronDown className="h-6 w-6 rotate-90" />
                            </button>
                        )}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                                {view === 'tournaments' ? 'Historial de Partidos' : selectedTournament?.name}
                            </h2>
                            {view === 'games' && (
                                <p className="text-slate-400 text-xs">
                                    {selectedTournament?.id === 'all' || selectedTournament?.id === 'none' ? 'Historial personal' : 'Historial global del torneo'}
                                </p>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors text-slate-400 hover:text-white" aria-label="Cerrar">
                        <X />
                    </button>
                </div>

                {/* --- CONTENT: EXPLORER DASHBOARD --- */}
                {view === 'tournaments' && (
                    <div className="flex-grow overflow-y-auto custom-scrollbar p-6 bg-slate-900">
                        {loading ? (
                            <div className="flex justify-center py-20"><Loader /></div>
                        ) : (
                            <div className="space-y-10">
                                
                                {/* Section: My Activity */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Users className="h-4 w-4"/> Tu Actividad
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        
                                        {/* Main Card: All My Games */}
                                        <button
                                            onClick={() => handleTournamentSelect({ id: 'all', name: 'Todos mis partidos' })}
                                            className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] border border-slate-700 hover:border-cyan-500/50 bg-gradient-to-br from-slate-800 to-slate-900"
                                        >
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Folder className="h-24 w-24 text-cyan-400" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-110 transition-transform">
                                                    <Users className="h-6 w-6" />
                                                </div>
                                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">Mis Partidos</h3>
                                                <p className="text-sm text-slate-400">Ver todo tu historial de juegos guardados.</p>
                                            </div>
                                            <div className="absolute bottom-6 right-6 text-cyan-500 transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                                                <ChevronRight />
                                            </div>
                                        </button>

                                        {/* Secondary Card: Untracked Games */}
                                        <button
                                            onClick={() => handleTournamentSelect({ id: 'none', name: 'Partidos sin torneo' })}
                                            className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 border border-slate-700 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-800"
                                        >
                                            <div className="relative z-10">
                                                <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center mb-4 text-slate-400 group-hover:text-white transition-colors">
                                                    <Calendar className="h-6 w-6" />
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-200 mb-1 group-hover:text-white">Partidos Sueltos</h3>
                                                <p className="text-sm text-slate-500">Amistosos y juegos sin torneo asignado.</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Section: Global Tournaments */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <TrophyIcon rank={1} /> Torneos y Ligas
                                    </h3>
                                    {tournaments.length === 0 ? (
                                        <div className="text-slate-500 text-sm italic bg-slate-800/30 p-4 rounded-lg border border-slate-800">
                                            No hay torneos activos en este momento.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {tournaments.map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => handleTournamentSelect(t)}
                                                    className="group flex items-center justify-between p-4 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-750 transition-all text-left"
                                                >
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-yellow-500 group-hover:border-yellow-500/50 transition-colors shrink-0">
                                                            <TrophyIcon rank={3} /> 
                                                        </div>
                                                        <span className="font-semibold text-slate-200 group-hover:text-white truncate">
                                                            {t.name}
                                                        </span>
                                                    </div>
                                                    <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </div>
                        )}
                        {error && <div className="text-center text-red-400 mt-4 bg-red-900/10 p-2 rounded border border-red-900/20">{error}</div>}
                    </div>
                )}

                {/* --- CONTENT: GAMES LIST --- */}
                {view === 'games' && (
                    <>
                        {/* Filters */}
                        <div className="p-4 bg-slate-800/50 border-b border-slate-700 space-y-4 flex-shrink-0">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Search />
                                </div>
                                <input
                                    type="text"
                                    className="bg-slate-900 border border-slate-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full pl-10 p-2.5 placeholder-slate-500 transition-colors"
                                    placeholder="Buscar por partido, equipo o creador..."
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
                                            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                                selectedTeam === team 
                                                ? 'bg-cyan-600 text-white shadow-lg ring-1 ring-cyan-400' 
                                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                            }`}
                                        >
                                            {team}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* List */}
                        <div className="flex-grow overflow-y-auto custom-scrollbar p-4 bg-slate-900">
                            {loading && (
                                <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                                    <Loader />
                                    <p className="mt-4 animate-pulse">Cargando partidos...</p>
                                </div>
                            )}
                            
                            {error && !loading && (
                                <div className="text-center text-red-400 py-10 bg-red-900/10 rounded-lg border border-red-900/50">
                                    <p>{error}</p>
                                </div>
                            )}

                            {!loading && !error && filteredGames.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                                    <p className="text-lg font-semibold">No se encontraron partidos</p>
                                    <p className="text-sm">Prueba cambiando los filtros de búsqueda.</p>
                                </div>
                            )}

                            {!loading && !error && filteredGames.length > 0 && (
                                <div className="grid grid-cols-1 gap-3">
                                    {filteredGames.map(game => (
                                        <div key={game.id} className="group bg-slate-800 hover:bg-slate-700/80 border border-slate-700 hover:border-cyan-500/50 p-4 rounded-xl transition-all duration-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center relative overflow-hidden">
                                            <div className="flex-shrink-0 hidden sm:block">
                                                <TeamLogo 
                                                    teamName={game.settings?.myTeam || ''} 
                                                    className="h-12 w-12 opacity-80 group-hover:opacity-100 transition-opacity" 
                                                    fallbackClassName="bg-slate-700"
                                                />
                                            </div>

                                            <div className="flex-grow min-w-0 w-full">
                                                <div className="flex items-center justify-between sm:justify-start gap-2 mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="sm:hidden">
                                                             <TeamLogo teamName={game.settings?.myTeam || ''} className="h-6 w-6" />
                                                        </div>
                                                        <h3 className="font-bold text-white text-lg truncate group-hover:text-cyan-400 transition-colors">
                                                            {game.settings?.gameName || 'Partido sin nombre'}
                                                        </h3>
                                                    </div>
                                                    
                                                    {/* User Indicator */}
                                                    {game.profiles && game.user_id !== user.id && (
                                                        <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-700 whitespace-nowrap">
                                                            por {game.profiles.full_name?.split(' ')[0] || 'Anónimo'}
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5" />
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
                                                    {game.settings?.myTeam && (
                                                        <span className="text-slate-500 px-2 py-0.5 bg-slate-900 rounded-md text-xs">
                                                            {game.settings.myTeam}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto mt-2 sm:mt-0 justify-between">
                                                <div className="flex items-center gap-1 bg-slate-900/50 px-2 py-1 rounded text-slate-500 text-xs font-medium" title="Veces visto">
                                                    <Eye className="h-3 w-3" />
                                                    <span>{game.views || 0}</span>
                                                </div>
                                                <button
                                                    onClick={() => onLoadGame(game.id)}
                                                    className={`font-bold py-2 px-6 rounded-lg shadow-lg transition-all text-sm w-auto ${
                                                        game.user_id === user.id 
                                                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white hover:shadow-cyan-500/20' 
                                                        : 'bg-slate-600 hover:bg-slate-500 text-slate-200 border border-slate-500' 
                                                    }`}
                                                >
                                                    {game.user_id === user.id ? 'Cargar' : 'Ver'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
                
                {view === 'games' && (
                    <div className="bg-slate-800 p-2 text-center text-xs text-slate-500 border-t border-slate-700 flex-shrink-0">
                        Mostrando {filteredGames.length} de {games.length} partidos
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoadGameModal;
