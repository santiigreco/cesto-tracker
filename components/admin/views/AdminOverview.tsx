
import React, { useEffect } from 'react';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { useAdminTournaments } from '../hooks/useAdminTournaments';
import { useAdminGames } from '../hooks/useAdminGames';
import { AdminStatCard } from '../ui/AdminStatCard';
import UsersIcon from '../../UsersIcon';
import TrophyIcon from '../../TrophyIcon';
import CalendarIcon from '../../CalendarIcon';
import Loader from '../../Loader';

interface AdminOverviewProps {
    isOwner: boolean;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ isOwner }) => {
    const { users, fetchUsers, loading: l1 } = useAdminUsers(isOwner);
    const { tournaments, fetchTournaments, loading: l2 } = useAdminTournaments();
    const { games, fetchGames, loading: l3 } = useAdminGames();

    useEffect(() => {
        fetchUsers();
        fetchTournaments();
        fetchGames();
    }, [fetchUsers, fetchTournaments, fetchGames]);

    const loading = l1 || l2 || l3;

    if (loading && users.length === 0 && games.length === 0) {
        return <div className="flex justify-center items-center h-48"><Loader /></div>;
    }

    return (
        <div className="space-y-6 lg:space-y-8 animate-fade-in pb-20 lg:pb-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <AdminStatCard 
                    title="Usuarios" 
                    value={isOwner ? users.length : '-'} 
                    icon={<UsersIcon />} 
                    colorClass="text-purple-400" 
                />
                <AdminStatCard 
                    title="Partidos" 
                    value={games.length >= 100 ? '100+' : games.length} 
                    icon={<CalendarIcon />} 
                    colorClass="text-cyan-400" 
                />
                <AdminStatCard 
                    title="Torneos" 
                    value={tournaments.length} 
                    icon={<TrophyIcon rank={1} />} 
                    colorClass="text-yellow-400" 
                />
            </div>
            
            <div className="bg-slate-800/50 p-4 lg:p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg lg:text-xl font-bold text-white mb-4">Actividad Reciente</h3>
                <div className="space-y-3">
                    {games.slice(0, 5).map(g => (
                        <div key={g.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700 gap-2">
                            <div>
                                <p className="font-bold text-white text-sm sm:text-base">{g.settings?.gameName || 'Partido'}</p>
                                <p className="text-xs text-slate-400">{new Date(g.created_at).toLocaleString()}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold w-fit ${g.game_mode === 'shot-chart' ? 'bg-purple-900 text-purple-200' : 'bg-green-900 text-green-200'}`}>
                                {g.game_mode}
                            </span>
                        </div>
                    ))}
                    {games.length === 0 && <p className="text-slate-500">No hay actividad reciente.</p>}
                </div>
            </div>
        </div>
    );
};
