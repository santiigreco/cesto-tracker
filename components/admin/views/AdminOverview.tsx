
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
    // We fetch basic stats here. In a real app we might use a dedicated RPC function for counts.
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
        return <div className="flex justify-center items-center h-full"><Loader /></div>;
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AdminStatCard 
                    title="Usuarios Totales" 
                    value={isOwner ? users.length : '-'} 
                    icon={<UsersIcon />} 
                    colorClass="text-purple-400" 
                />
                <AdminStatCard 
                    title="Partidos Jugados" 
                    value={games.length >= 100 ? '100+' : games.length} 
                    icon={<CalendarIcon />} 
                    colorClass="text-cyan-400" 
                />
                <AdminStatCard 
                    title="Torneos Activos" 
                    value={tournaments.length} 
                    icon={<TrophyIcon rank={1} />} 
                    colorClass="text-yellow-400" 
                />
            </div>
            
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4">Actividad Reciente (Últimos 5 partidos)</h3>
                <div className="space-y-3">
                    {games.slice(0, 5).map(g => (
                        <div key={g.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                            <div>
                                <p className="font-bold text-white">{g.settings?.gameName || 'Partido'}</p>
                                <p className="text-xs text-slate-400">{new Date(g.created_at).toLocaleString()}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${g.game_mode === 'shot-chart' ? 'bg-purple-900 text-purple-200' : 'bg-green-900 text-green-200'}`}>
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
