import React, { useEffect } from 'react';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { useAdminGames } from '../hooks/useAdminGames';
import { AdminStatCard } from '../ui/AdminStatCard';
import { AlertTriangleIcon, CalendarIcon, UsersIcon } from '../../icons';
import Loader from '@/components/ui/Loader';

interface AdminOverviewProps {
    isOwner: boolean;
    isAdmin?: boolean;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ isOwner, isAdmin }) => {
    const canAccessUsers = isAdmin ?? isOwner ?? true;
    const { users, fetchUsers, loading: l1, error: usersError } = useAdminUsers(canAccessUsers);
    const { games, fetchGames, loading: l3, error: gamesError } = useAdminGames();

    useEffect(() => {
        fetchUsers();
        fetchGames();
    }, [fetchUsers, fetchGames]);

    const loading = l1 || l3;

    if (loading && users.length === 0 && games.length === 0) {
        return <div className="flex justify-center items-center h-48"><Loader /></div>;
    }

    return (
        <div className="space-y-6 lg:space-y-8 animate-fade-in pb-20 lg:pb-0">
            {(usersError || gamesError) && (
                <div className="bg-sport-miss/15 border border-sport-miss/40 p-3.5 rounded-xl text-sport-miss-light text-xs flex flex-col gap-1.5">
                    {usersError && (
                        <p className="flex items-center gap-2 font-semibold">
                            <AlertTriangleIcon className="h-4 w-4 shrink-0" />
                            <span>Error al sincronizar usuarios: {usersError}</span>
                        </p>
                    )}
                    {gamesError && (
                        <p className="flex items-center gap-2 font-semibold">
                            <AlertTriangleIcon className="h-4 w-4 shrink-0" />
                            <span>Error al sincronizar partidos: {gamesError}</span>
                        </p>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <AdminStatCard
                    title="Usuarios"
                    value={canAccessUsers ? users.length : '-'}
                    icon={<UsersIcon />}
                    colorClass="text-brand"
                />
                <AdminStatCard
                    title="Partidos"
                    value={games.length >= 100 ? '100+' : games.length}
                    icon={<CalendarIcon />}
                    colorClass="text-sport-goal-light"
                />
            </div>

            <div className="bg-surface-card p-4 lg:p-6 rounded-2xl border border-border-subtle shadow-card">
                <h3 className="text-base lg:text-lg font-extrabold text-ink-primary mb-4">Actividad Reciente</h3>
                <div className="space-y-2.5">
                    {games.slice(0, 5).map(g => (
                        <div
                            key={g.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-surface-elevated rounded-xl border border-border-subtle gap-2"
                        >
                            <div className="min-w-0">
                                <p className="font-bold text-ink-primary text-sm sm:text-base truncate">
                                    {g.settings?.gameName || 'Partido'}
                                </p>
                                <p className="text-xs text-ink-muted tabular-nums mt-0.5">
                                    {new Date(g.created_at).toLocaleString()}
                                </p>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider w-fit bg-brand/15 text-brand border border-brand/30 shrink-0">
                                {g.game_mode === 'stats-tally' ? 'Planilla técnica' : g.game_mode}
                            </span>
                        </div>
                    ))}
                    {games.length === 0 && (
                        <p className="text-ink-muted text-sm py-4 text-center">No hay actividad reciente.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
