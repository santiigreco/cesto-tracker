
import React, { useEffect, useState, useMemo } from 'react';
import { useAdminGames } from '../hooks/useAdminGames';
import { SearchIcon } from '../../icons';
import { TrashIcon } from '../../icons';
import { EyeIcon } from '../../icons';
import Loader from '../../Loader';

interface AdminGamesViewProps {
    onLoadGame: (gameId: string, asOwner: boolean) => void;
}

export const AdminGamesView: React.FC<AdminGamesViewProps> = ({ onLoadGame }) => {
    const { games, fetchGames, deleteGame, loading, error } = useAdminGames();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        fetchGames();
    }, [fetchGames]);

    const filteredGames = useMemo(() => {
        return games.filter(g =>
            (g.settings?.gameName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (g.settings?.myTeam || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (g.profiles?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
    }, [games, searchTerm, sortOrder]);

    return (
        <div className="flex flex-col h-full animate-fade-in pb-20 lg:pb-0">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-grow">
                    <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar por partido, equipo o usuario..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                </div>
                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-cyan-500 font-bold"
                >
                    <option value="asc">📅 Antiguos primero</option>
                    <option value="desc">📅 Recientes primero</option>
                </select>
            </div>

            {error && <div className="text-red-400 mb-2">{error}</div>}

            {loading ? (
                <div className="flex justify-center items-center h-48"><Loader /></div>
            ) : (
                <>
                    {/* --- MOBILE LIST --- */}
                    <div className="block lg:hidden space-y-3">
                        {filteredGames.map(g => (
                            <div key={g.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-xs text-slate-400">{new Date(g.created_at).toLocaleDateString()}</div>
                                        <div className="font-bold text-white text-lg">{g.settings?.gameName || 'Sin Nombre'}</div>
                                        <div className="text-sm text-cyan-400">{g.settings?.myTeam}</div>
                                    </div>
                                    <div className="text-[10px] bg-slate-700 text-slate-300 px-2 py-1 rounded uppercase font-bold">
                                        {g.game_mode}
                                    </div>
                                </div>

                                <div className="border-t border-slate-700 pt-2 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 uppercase">Creado por</span>
                                        <span className="text-sm text-white">{g.profiles?.full_name || 'Anónimo'}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onLoadGame(g.id, true)}
                                            className="p-2 bg-cyan-900/30 text-cyan-400 rounded-lg border border-cyan-900/50"
                                        >
                                            <EyeIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => deleteGame(g.id)}
                                            className="p-2 bg-red-900/20 text-red-400 rounded-lg border border-red-900/50"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredGames.length === 0 && (
                            <div className="p-8 text-center text-slate-500">No se encontraron partidos.</div>
                        )}
                    </div>

                    {/* --- DESKTOP TABLE --- */}
                    <div className="hidden lg:block bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg flex-grow overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-slate-700/50 text-slate-300 text-xs uppercase font-bold sticky top-0 backdrop-blur-sm">
                                <tr>
                                    <th className="p-4">Fecha</th>
                                    <th className="p-4">Partido</th>
                                    <th className="p-4">Creador</th>
                                    <th className="p-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {filteredGames.map(g => (
                                    <tr key={g.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="p-4 text-slate-400 text-sm whitespace-nowrap">
                                            {new Date(g.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-white">{g.settings?.gameName || 'Sin Nombre'}</div>
                                            <div className="text-xs text-cyan-400">{g.settings?.myTeam}</div>
                                            <div className="text-[10px] text-slate-500 uppercase mt-1">{g.game_mode}</div>
                                        </td>
                                        <td className="p-4">
                                            {g.profiles ? (
                                                <>
                                                    <div className="text-white text-sm">{g.profiles.full_name || 'Anónimo'}</div>
                                                    <div className="text-xs text-slate-500">{g.profiles.email || 'Email oculto'}</div>
                                                </>
                                            ) : (
                                                <span className="text-slate-500 text-xs italic">Desconocido</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => onLoadGame(g.id, true)}
                                                    className="p-2 hover:bg-cyan-900/30 rounded-full text-slate-500 hover:text-cyan-400 transition-colors"
                                                    title="Abrir y Editar (Modo Owner)"
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => deleteGame(g.id)}
                                                    className="p-2 hover:bg-red-900/30 rounded-full text-slate-500 hover:text-red-500 transition-colors"
                                                    title="Eliminar Partido"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredGames.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-slate-500">No se encontraron partidos.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};
