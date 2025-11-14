

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../App';
import XIcon from './XIcon';
import Loader from './Loader';
import { GameMode, Settings } from '../types';

interface SavedGame {
    id: string;
    created_at: string;
    game_mode: GameMode;
    player_names: Record<string, string>;
    settings: Settings;
}

interface LoadGameModalProps {
    onClose: () => void;
    onLoadGame: (gameId: string) => void;
}

const LoadGameModal: React.FC<LoadGameModalProps> = ({ onClose, onLoadGame }) => {
    const [games, setGames] = useState<SavedGame[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGames = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('games')
                .select('id, created_at, game_mode, player_names, settings')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setGames(data || []);
        } catch (err: any) {
            setError('No se pudieron cargar los partidos. Inténtalo de nuevo.');
            console.error('Error fetching games:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGames();
    }, [fetchGames]);

    const getGameModeLabel = (mode: GameMode) => {
        if (mode === 'shot-chart') return 'Registro de Tiros';
        if (mode === 'stats-tally') return 'Anotador de Estadísticas';
        return 'Modo Desconocido';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity p-4">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-cyan-400">Partidos Guardados en la Nube</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Cerrar">
                        <XIcon />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto custom-scrollbar p-6">
                    {loading && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <Loader />
                            <p className="mt-4">Buscando partidos...</p>
                        </div>
                    )}
                    {error && <p className="text-red-400 text-center">{error}</p>}
                    {!loading && !error && games.length === 0 && (
                        <p className="text-slate-400 text-center py-10">No has guardado ningún partido en la nube todavía.</p>
                    )}
                    {!loading && !error && games.length > 0 && (
                        <div className="space-y-4">
                            {games.map(game => (
                                <div key={game.id} className="bg-slate-700/50 p-4 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                    <div className="flex-grow">
                                        <p className="font-bold text-white truncate">{game.settings?.gameName || 'Partido sin nombre'}</p>
                                        <p className="text-sm text-slate-400">
                                            {getGameModeLabel(game.game_mode)} - {new Date(game.created_at).toLocaleDateString('es-AR', {
                                                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                        {Object.values(game.player_names).length > 0 && (
                                            <p className="text-xs text-slate-500 mt-1 truncate">
                                                Equipo: {Object.values(game.player_names).join(', ')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex-shrink-0 flex gap-2">
                                        <button
                                            onClick={() => onLoadGame(game.id)}
                                            className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                        >
                                            Cargar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoadGameModal;