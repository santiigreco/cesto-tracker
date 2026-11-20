import React, { useEffect, useState, useMemo } from 'react';
import { useAdminGames } from '../hooks/useAdminGames';
import { SearchIcon, TrashIcon, EyeIcon } from '../../icons';
import Loader from '@/components/ui/Loader';

interface AdminGamesViewProps {
    onLoadGame: (gameId: string, asOwner: boolean) => void;
}

export const AdminGamesView: React.FC<AdminGamesViewProps> = ({ onLoadGame }) => {
    const { games, fetchGames, deleteGame, loading, error } = useAdminGames();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
            <div className="flex flex-col md:flex-row gap-3 mb-4">
                <div className="relative flex-grow">
                    <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Buscar por partido, equipo o usuario..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full min-h-[44px] bg-surface-card border border-border-strong rounded-xl pl-10 pr-4 py-2 text-base sm:text-sm text-ink-primary placeholder-ink-muted focus:border-brand outline-none transition-colors"
                    />
                </div>
                <select
                    aria-label="Ordenar partidos"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className="min-h-[44px] bg-surface-card border border-border-strong rounded-xl px-4 py-2 text-base sm:text-sm text-ink-primary outline-none focus:border-brand font-bold cursor-pointer transition-colors"
                >
                    <option value="desc">Recientes primero</option>
                    <option value="asc">Antiguos primero</option>
                </select>
            </div>

            {error && (
                <div className="bg-sport-miss/15 border border-sport-miss/40 text-sport-miss-light text-xs font-semibold px-3.5 py-2.5 rounded-xl mb-3">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-48"><Loader /></div>
            ) : (
                <>
                    {/* --- MOBILE LIST --- */}
                    <div className="block lg:hidden space-y-3">
                        {filteredGames.map(g => (
                            <div key={g.id} className="bg-surface-card p-4 rounded-2xl border border-border-subtle shadow-card flex flex-col gap-3">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="min-w-0">
                                        <div className="text-xs text-ink-muted tabular-nums">
                                            {new Date(g.created_at).toLocaleDateString()}
                                        </div>
                                        <div className="font-bold text-ink-primary text-base truncate mt-0.5">
                                            {g.settings?.gameName || 'Sin Nombre'}
                                        </div>
                                        <div className="text-sm text-brand font-semibold truncate">
                                            {g.settings?.myTeam}
                                        </div>
                                    </div>
                                    <div className="text-[10px] bg-surface-elevated border border-border-strong text-ink-secondary px-2 py-1 rounded-lg uppercase font-bold shrink-0">
                                        {g.game_mode === 'stats-tally' ? 'Planilla' : g.game_mode}
                                    </div>
                                </div>

                                <div className="border-t border-border-subtle pt-2.5 flex items-center justify-between gap-2">
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[10px] text-ink-muted uppercase font-bold tracking-wider">Creado por</span>
                                        <span className="text-sm text-ink-primary font-medium truncate">
                                            {g.profiles?.full_name || 'Anónimo'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => onLoadGame(g.id, true)}
                                            className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-brand/15 hover:bg-brand/25 text-brand rounded-xl border border-brand/35 transition-colors"
                                            title="Abrir y editar"
                                            aria-label="Abrir y editar partido"
                                        >
                                            <EyeIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => deleteGame(g.id)}
                                            className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-sport-miss/15 hover:bg-sport-miss/25 text-sport-miss-light rounded-xl border border-sport-miss/40 transition-colors"
                                            title="Eliminar partido"
                                            aria-label="Eliminar partido"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredGames.length === 0 && (
                            <div className="p-8 text-center text-ink-muted text-sm">No se encontraron partidos.</div>
                        )}
                    </div>

                    {/* --- DESKTOP TABLE --- */}
                    <div className="hidden lg:block bg-surface-card rounded-2xl border border-border-subtle overflow-hidden shadow-card flex-grow overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-surface-elevated text-ink-muted text-xs uppercase tracking-wider font-bold sticky top-0 border-b border-border-subtle">
                                <tr>
                                    <th className="p-4">Fecha</th>
                                    <th className="p-4">Partido</th>
                                    <th className="p-4">Creador</th>
                                    <th className="p-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle">
                                {filteredGames.map(g => (
                                    <tr key={g.id} className="hover:bg-surface-elevated/60 transition-colors">
                                        <td className="p-4 text-ink-secondary text-sm whitespace-nowrap tabular-nums">
                                            {new Date(g.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-ink-primary">{g.settings?.gameName || 'Sin Nombre'}</div>
                                            <div className="text-xs text-brand font-semibold mt-0.5">{g.settings?.myTeam}</div>
                                            <div className="text-[10px] text-ink-muted uppercase mt-1 tracking-wider font-bold">
                                                {g.game_mode === 'stats-tally' ? 'Planilla técnica' : g.game_mode}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {g.profiles ? (
                                                <>
                                                    <div className="text-ink-primary text-sm font-medium">{g.profiles.full_name || 'Anónimo'}</div>
                                                    <div className="text-xs text-ink-muted">{g.profiles.email || 'Email oculto'}</div>
                                                </>
                                            ) : (
                                                <span className="text-ink-muted text-xs italic">Desconocido</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => onLoadGame(g.id, true)}
                                                    className="min-w-[40px] min-h-[40px] flex items-center justify-center hover:bg-brand/15 rounded-xl text-ink-muted hover:text-brand transition-colors"
                                                    title="Abrir y Editar (Modo Owner)"
                                                    aria-label="Abrir y editar partido"
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteGame(g.id)}
                                                    className="min-w-[40px] min-h-[40px] flex items-center justify-center hover:bg-sport-miss/15 rounded-xl text-ink-muted hover:text-sport-miss-light transition-colors"
                                                    title="Eliminar Partido"
                                                    aria-label="Eliminar partido"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredGames.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-ink-muted text-sm">No se encontraron partidos.</td>
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
