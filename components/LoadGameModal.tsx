
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../utils/supabaseClient';
import XIcon from './XIcon';
import EyeIcon from './EyeIcon';
import SearchIcon from './SearchIcon';
import CalendarIcon from './CalendarIcon';
import Loader from './Loader';
import TeamLogo from './TeamLogo';
import TrophyIcon from './TrophyIcon';
import ChevronDownIcon from './ChevronDownIcon';
import { GameMode, Settings } from '../types';

interface SavedGame {
    id: string;
    created_at: string;
    game_mode: GameMode;
    player_names: Record<string, string>;
    settings: Settings;
    views: number;
    tournament_id: string | null;
}

interface TournamentSummary {
    id: string | 'all' | 'none';
    name: string;
}

interface LoadGameModalProps {
    onClose: () => void;
    onLoadGame: (gameId: string) => void;
}

const LoadGameModal: React.FC<LoadGameModalProps> = ({ onClose, onLoadGame }) => {
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
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('tournaments')
                .select('id, name')
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            // Add static options
            const allTournaments: TournamentSummary[] = [
                { id: 'all', name: 'Todos los Partidos' },
                ...(data || []),
                { id: 'none', name: 'Partidos Sin Torneo' }
            ];
            
            setTournaments(allTournaments);
        } catch (err: any) {
            setError('No se pudieron cargar los torneos.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchGames = useCallback(async (tournamentId: string) => {
        setLoading(true);
        setError(null);
        try {
            let query = supabase
                .from('games')
                .select('id, created_at, game_mode, player_names, settings, views, tournament_id')
                .order('created_at', { ascending: false });

            // Apply filters based on tournament selection
            if (tournamentId === 'none') {
                query = query.is('tournament_id', null);
            } else if (tournamentId !== 'all') {
                query = query.eq('tournament_id', tournamentId);
            }

            const { data, error } = await query;

            if (error) throw error;
            setGames(data || []);
        } catch (err: any) {
            setError('No se pudieron cargar los partidos.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial Load
    useEffect(() => {
        if (view === 'tournaments') {
            fetchTournaments();
        }
    }, [view, fetchTournaments]);

    // Handle Tournament Selection
    const handleTournamentSelect = (tournament: TournamentSummary) => {
        setSelectedTournament(tournament);
        setView('games');
        fetchGames(tournament.id);
        // Reset filters when entering a new tournament
        setSearchTerm('');
        setSelectedTeam('Todos');
    };

    const handleBackToTournaments = () => {
        setView('tournaments');
        setSelectedTournament(null);
        setGames([]);
    };

    // --- FILTER LOGIC (For Games View) ---
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
            const matchesSearch = (game.settings?.gameName || '').toLowerCase().includes(searchTerm.toLowerCase());
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 transition-opacity p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-slate-700 overflow-hidden">
                
                {/* --- HEADER --- */}
                <div className="flex justify-between items-center p-5 border-b border-slate-700 bg-slate-800 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {view === 'games' && (
                            <button 
                                onClick={handleBackToTournaments}
                                className="p-1.5 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                            >
                                <ChevronDownIcon className="h-6 w-6 rotate-90" />
                            </button>
                        )}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                                {view === 'tournaments' ? 'Seleccionar Torneo' : selectedTournament?.name}
                            </h2>
                            {view === 'games' && <p className="text-slate-400 text-xs">Mostrando partidos del torneo</p>}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors text-slate-400 hover:text-white" aria-label="Cerrar">
                        <XIcon />
                    </button>
                </div>

                {/* --- CONTENT: TOURNAMENTS GRID --- */}
                {view === 'tournaments' && (
                    <div className="flex-grow overflow-y-auto custom-scrollbar p-6 bg-slate-900">
                        {loading ? (
                            <div className="flex justify-center py-10"><Loader /></div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {tournaments.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => handleTournamentSelect(t)}
                                        className={`group relative p-6 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 hover:border-cyan-500/50 transition-all text-left shadow-lg ${t.id === 'all' ? 'col-span-1 sm:col-span-2 bg-gradient-to-r from-slate-800 to-slate-800/50' : ''}`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-lg ${t.id === 'all' ? 'bg-cyan-900/30 text-cyan-400' : 'bg-slate-900 text-slate-400 group-hover:text-cyan-400'} transition-colors`}>
                                                {t.id === 'all' ? <SearchIcon className="h-6 w-6" /> : <TrophyIcon rank={1} />}
                                            </div>
                                            <div>
                                                <h3 className={`font-bold text-lg ${t.id === 'all' ? 'text-cyan-400' : 'text-white group-hover:text-cyan-300'}`}>
                                                    {t.name}
                                                </h3>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    {t.id === 'all' ? 'Ver historial completo' : t.id === 'none' ? 'Partidos sueltos' : 'Ver partidos'}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        {error && <div className="text-center text-red-400 mt-4">{error}</div>}
                    </div>
                )}

                {/* --- CONTENT: GAMES LIST --- */}
                {view === 'games' && (
                    <>
                        {/* Filters */}
                        <div className="p-4 bg-slate-800/50 border-b border-slate-700 space-y-4 flex-shrink-0">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <SearchIcon />
                                </div>
                                <input
                                    type="text"
                                    className="bg-slate-900 border border-slate-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full pl-10 p-2.5 placeholder-slate-500"
                                    placeholder="Buscar partido..."
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

                                            <div className="flex-grow min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="sm:hidden">
                                                         <TeamLogo teamName={game.settings?.myTeam || ''} className="h-6 w-6" />
                                                    </div>
                                                    <h3 className="font-bold text-white text-lg truncate group-hover:text-cyan-400 transition-colors">
                                                        {game.settings?.gameName || 'Partido sin nombre'}
                                                    </h3>
                                                </div>
                                                
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <CalendarIcon className="h-3.5 w-3.5" />
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
                                                    <EyeIcon className="h-3 w-3" />
                                                    <span>{game.views || 0}</span>
                                                </div>
                                                <button
                                                    onClick={() => onLoadGame(game.id)}
                                                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:shadow-cyan-500/20 transition-all text-sm w-auto"
                                                >
                                                    Cargar
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
