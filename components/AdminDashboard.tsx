
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../utils/supabaseClient';
import XIcon from './XIcon';
import TrashIcon from './TrashIcon';
import CheckIcon from './CheckIcon';
import Loader from './Loader';
import PencilIcon from './PencilIcon';
import PlusIcon from './PlusIcon';
import RefreshIcon from './RefreshIcon';
import SearchIcon from './SearchIcon';
import UsersIcon from './UsersIcon';
import TrophyIcon from './TrophyIcon';
import CalendarIcon from './CalendarIcon';
import EyeIcon from './EyeIcon';
import { UserRole } from '../types';
import { TEAMS_CONFIG } from '../constants';

interface AdminDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    isOwner: boolean; 
    onLoadGame: (gameId: string, asOwner: boolean) => void;
}

type AdminTab = 'dashboard' | 'users' | 'tournaments' | 'games';

const ROLES: { value: UserRole; label: string; color: string }[] = [
    { value: 'jugador', label: 'Jugador', color: 'bg-slate-700 text-slate-300' },
    { value: 'entrenador', label: 'Entrenador', color: 'bg-indigo-900/50 text-indigo-300 border-indigo-700' },
    { value: 'dirigente', label: 'Dirigente', color: 'bg-purple-900/50 text-purple-300 border-purple-700' },
    { value: 'periodista', label: 'Prensa', color: 'bg-pink-900/50 text-pink-300 border-pink-700' },
    { value: 'admin', label: 'Admin', color: 'bg-red-900/50 text-red-300 border-red-500 font-bold' },
    { value: 'otro', label: 'Otro', color: 'bg-slate-700 text-slate-400' },
];

// --- SUB-COMPONENTS ---

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className={`bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex items-center gap-4`}>
        <div className={`p-4 rounded-full ${color} bg-opacity-20`}>
            {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: `h-8 w-8 ${color.replace('bg-', 'text-')}` })}
        </div>
        <div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-extrabold text-white">{value}</p>
        </div>
    </div>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose, isOwner, onLoadGame }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    
    // Data States
    const [users, setUsers] = useState<any[]>([]);
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [games, setGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Filters & Search
    const [userSearch, setUserSearch] = useState('');
    const [newItemValue, setNewItemValue] = useState('');
    const [gameSearch, setGameSearch] = useState('');

    // Editing States
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Record<string, any>>({});

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Users (Profiles) - Only if Owner
            if (isOwner) {
                // Fetch up to 5000 profiles (pagination override) and sort client-side to ensure robustness
                const { data: userData, error: userError } = await supabase
                    .from('profiles')
                    .select('*')
                    .range(0, 4999);
                
                if (userError) {
                    console.error("Error fetching profiles:", userError);
                    alert("Error cargando usuarios (Verifica Permisos RLS): " + userError.message);
                } else if (userData) {
                    const sortedUsers = userData.sort((a, b) => {
                        return new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime();
                    });
                    setUsers(sortedUsers);
                }
            }

            // Fetch Tournaments
            const { data: tourData, error: tourError } = await supabase.from('tournaments').select('*').order('created_at', { ascending: false });
            if (!tourError) setTournaments(tourData || []);

            // Fetch Games (Limit 100 for perf, join with profiles to get user email)
            const { data: gameData, error: gameError } = await supabase
                .from('games')
                .select('*, profiles(email, full_name)')
                .order('created_at', { ascending: false })
                .limit(100);

            if (!gameError) setGames(gameData || []);

        } catch (error: any) {
            console.error("Admin Fetch Error:", error);
            alert("Error general en Admin Dashboard: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchData();
            setActiveTab('dashboard');
        }
    }, [isOpen]);

    // --- LOGIC ---

    const filteredUsers = useMemo(() => {
        return users.filter(u => 
            (u.full_name?.toLowerCase() || '').includes(userSearch.toLowerCase()) ||
            (u.email?.toLowerCase() || '').includes(userSearch.toLowerCase()) || // Note: email might not be in profiles table depending on trigger setup
            (u.id || '').includes(userSearch)
        );
    }, [users, userSearch]);

    const filteredGames = useMemo(() => {
        return games.filter(g => 
            (g.settings?.gameName || '').toLowerCase().includes(gameSearch.toLowerCase()) ||
            (g.settings?.myTeam || '').toLowerCase().includes(gameSearch.toLowerCase()) ||
            (g.profiles?.email || '').toLowerCase().includes(gameSearch.toLowerCase())
        );
    }, [games, gameSearch]);

    const handleUpdateUserRole = async (id: string, newRole: string) => {
        if (!confirm(`¿Cambiar rol de usuario a ${newRole}?`)) return;
        try {
            const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', id);
            if (error) throw error;
            setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
        } catch (err: any) {
            alert("Error: " + err.message);
        }
    };

    const handleUpdateUserClub = async (id: string, newClub: string) => {
        try {
            const { error } = await supabase.from('profiles').update({ favorite_club: newClub }).eq('id', id);
            if (error) throw error;
            setUsers(prev => prev.map(u => u.id === id ? { ...u, favorite_club: newClub } : u));
            setEditingId(null);
        } catch (err: any) {
            alert("Error: " + err.message);
        }
    };

    const handleDelete = async (table: string, id: string) => {
        if (!confirm("⚠️ ¿Eliminar permanentemente? Esta acción no se puede deshacer.")) return;
        try {
            const { error } = await supabase.from(table).delete().eq('id', id);
            if (error) throw error;
            
            // Optimistic UI Update
            if (table === 'profiles') setUsers(prev => prev.filter(x => x.id !== id));
            if (table === 'tournaments') setTournaments(prev => prev.filter(x => x.id !== id));
            if (table === 'games') setGames(prev => prev.filter(x => x.id !== id));
            
        } catch (err: any) {
            alert("Error: " + err.message);
        }
    };

    const handleCreateTournament = async () => {
        if (!newItemValue.trim()) return;
        try {
            const { data, error } = await supabase.from('tournaments').insert([{ name: newItemValue.trim() }]).select().single();
            if (error) throw error;
            setTournaments(prev => [data, ...prev]);
            setNewItemValue('');
        } catch (err: any) {
            alert("Error: " + err.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[60] p-4 animate-fade-in backdrop-blur-md">
            <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col border border-slate-700 overflow-hidden">
                
                {/* --- HEADER --- */}
                <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-800">
                    <div>
                        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-3">
                            CONTROL DE MANDO {isOwner && <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] rounded uppercase tracking-widest">Owner</span>}
                        </h2>
                        <p className="text-slate-400 text-xs mt-1">Gestión integral del sistema Cesto Tracker</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={fetchData} 
                            className={`p-2 rounded-lg bg-slate-700 hover:bg-cyan-600 text-white transition-all ${loading ? 'animate-spin' : ''}`}
                            title="Recargar Datos"
                        >
                            <RefreshIcon className="h-5 w-5" />
                        </button>
                        <button onClick={onClose} className="p-2 rounded-lg bg-slate-700 hover:bg-red-600 text-white transition-colors">
                            <XIcon />
                        </button>
                    </div>
                </div>

                <div className="flex flex-grow overflow-hidden">
                    
                    {/* --- SIDEBAR --- */}
                    <div className="w-20 lg:w-64 bg-slate-800 border-r border-slate-700 flex flex-col py-6 gap-2">
                        <button 
                            onClick={() => setActiveTab('dashboard')}
                            className={`flex items-center gap-4 px-6 py-3 mx-2 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                        >
                            <div className="h-6 w-6"><UsersIcon /></div>
                            <span className="hidden lg:block font-bold">Resumen</span>
                        </button>
                        
                        {isOwner && (
                            <button 
                                onClick={() => setActiveTab('users')}
                                className={`flex items-center gap-4 px-6 py-3 mx-2 rounded-lg transition-all ${activeTab === 'users' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                            >
                                <div className="h-6 w-6"><UsersIcon /></div>
                                <span className="hidden lg:block font-bold">Usuarios</span>
                            </button>
                        )}

                        <button 
                            onClick={() => setActiveTab('tournaments')}
                            className={`flex items-center gap-4 px-6 py-3 mx-2 rounded-lg transition-all ${activeTab === 'tournaments' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                        >
                            <div className="h-6 w-6"><TrophyIcon rank={1} /></div>
                            <span className="hidden lg:block font-bold">Torneos</span>
                        </button>

                        <button 
                            onClick={() => setActiveTab('games')}
                            className={`flex items-center gap-4 px-6 py-3 mx-2 rounded-lg transition-all ${activeTab === 'games' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                        >
                            <div className="h-6 w-6"><CalendarIcon /></div>
                            <span className="hidden lg:block font-bold">Partidos</span>
                        </button>
                    </div>

                    {/* --- MAIN CONTENT AREA --- */}
                    <div className="flex-grow bg-slate-900 p-6 overflow-y-auto custom-scrollbar">
                        
                        {/* VIEW: DASHBOARD */}
                        {activeTab === 'dashboard' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <StatCard title="Usuarios Totales" value={users.length} icon={<UsersIcon />} color="text-purple-400" />
                                    <StatCard title="Partidos Jugados" value={games.length} icon={<CalendarIcon />} color="text-cyan-400" />
                                    <StatCard title="Torneos Activos" value={tournaments.length} icon={<TrophyIcon rank={1} />} color="text-yellow-400" />
                                </div>
                                
                                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                                    <h3 className="text-xl font-bold text-white mb-4">Actividad Reciente</h3>
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
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* VIEW: USERS MANAGEMENT */}
                        {activeTab === 'users' && isOwner && (
                            <div className="flex flex-col h-full">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="relative w-full max-w-md">
                                        <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                                        <input 
                                            type="text" 
                                            placeholder="Buscar usuario por nombre o ID..." 
                                            value={userSearch}
                                            onChange={(e) => setUserSearch(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                                        />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-slate-400 text-sm">
                                            {filteredUsers.length} usuarios
                                        </div>
                                        {users.length === 1 && (
                                            <div className="text-xs text-yellow-500 bg-yellow-900/20 px-2 py-1 rounded border border-yellow-700">
                                                ⚠️ Posible error RLS (Solo te ves a ti mismo)
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-700/50 text-slate-300 text-xs uppercase tracking-wider font-bold">
                                            <tr>
                                                <th className="p-4">Usuario</th>
                                                <th className="p-4">Rol (Permisos)</th>
                                                <th className="p-4">Club Favorito</th>
                                                <th className="p-4 text-center">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700">
                                            {filteredUsers.map(user => (
                                                <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                                                    <td className="p-4">
                                                        <div className="font-bold text-white">{user.full_name || 'Sin Nombre'}</div>
                                                        <div className="text-xs text-slate-500 font-mono">{user.id}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <select 
                                                            value={user.role || 'jugador'} 
                                                            onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                                                            className={`bg-slate-900 border border-slate-600 text-xs rounded px-2 py-1 focus:ring-cyan-500 outline-none font-bold uppercase tracking-wide cursor-pointer hover:border-slate-400 transition-colors ${ROLES.find(r => r.value === user.role)?.color || 'text-white'}`}
                                                        >
                                                            {ROLES.map(r => (
                                                                <option key={r.value} value={r.value}>{r.label}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="p-4">
                                                        {editingId === user.id ? (
                                                            <div className="flex gap-2">
                                                                <select 
                                                                    className="bg-slate-900 border border-slate-600 text-white text-xs rounded px-2 py-1"
                                                                    defaultValue={user.favorite_club || ''}
                                                                    onChange={(e) => setEditValues({ ...editValues, club: e.target.value })}
                                                                >
                                                                    <option value="">-</option>
                                                                    {TEAMS_CONFIG.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                                                                </select>
                                                                <button onClick={() => handleUpdateUserClub(user.id, editValues.club)} className="text-green-400 hover:text-green-300"><CheckIcon className="h-4 w-4"/></button>
                                                                <button onClick={() => setEditingId(null)} className="text-red-400 hover:text-red-300"><XIcon className="h-4 w-4"/></button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setEditingId(user.id)}>
                                                                <span className="text-sm text-slate-300">{user.favorite_club || '-'}</span>
                                                                <PencilIcon className="h-3 w-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <button 
                                                            onClick={() => handleDelete('profiles', user.id)}
                                                            className="p-2 hover:bg-red-900/30 rounded-full text-slate-500 hover:text-red-500 transition-colors"
                                                            title="Eliminar Usuario"
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredUsers.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="p-8 text-center text-slate-500">
                                                        <p>No se encontraron usuarios.</p>
                                                        {isOwner && <p className="text-xs mt-2 text-yellow-600">Nota: Si la tabla está vacía en Supabase, revisa las políticas RLS.</p>}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* VIEW: TOURNAMENTS */}
                        {activeTab === 'tournaments' && (
                            <div className="space-y-6">
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={newItemValue}
                                        onChange={(e) => setNewItemValue(e.target.value)}
                                        placeholder="Nombre nuevo torneo..."
                                        className="bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2 flex-grow focus:ring-cyan-500 outline-none"
                                    />
                                    <button onClick={handleCreateTournament} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg">
                                        <PlusIcon className="h-5 w-5" /> Crear
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {tournaments.map(t => (
                                        <div key={t.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center shadow-md group">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-900 rounded-lg text-yellow-500"><TrophyIcon rank={1} /></div>
                                                <span className="font-bold text-white text-lg">{t.name}</span>
                                            </div>
                                            <button onClick={() => handleDelete('tournaments', t.id)} className="text-slate-600 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* VIEW: GAMES */}
                        {activeTab === 'games' && (
                            <div className="flex flex-col h-full">
                                <div className="mb-4">
                                    <div className="relative w-full max-w-md">
                                        <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                                        <input 
                                            type="text" 
                                            placeholder="Buscar por partido, equipo o usuario..." 
                                            value={gameSearch}
                                            onChange={(e) => setGameSearch(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-700/50 text-slate-300 text-xs uppercase font-bold">
                                            <tr>
                                                <th className="p-4">Fecha</th>
                                                <th className="p-4">Partido</th>
                                                <th className="p-4">Usuario (Creador)</th>
                                                <th className="p-4 text-center">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700">
                                            {filteredGames.map(g => (
                                                <tr key={g.id} className="hover:bg-slate-700/30">
                                                    <td className="p-4 text-slate-400 text-sm whitespace-nowrap">{new Date(g.created_at).toLocaleDateString()}</td>
                                                    <td className="p-4">
                                                        <div className="font-bold text-white">{g.settings?.gameName || 'Sin Nombre'}</div>
                                                        <div className="text-xs text-cyan-400">{g.settings?.myTeam}</div>
                                                        <div className="text-[10px] text-slate-500 uppercase mt-1">{g.game_mode}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        {g.profiles ? (
                                                            <>
                                                                <div className="text-white text-sm">{g.profiles.full_name || 'Anónimo'}</div>
                                                                <div className="text-xs text-slate-500">{g.profiles.email}</div>
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
                                                                onClick={() => handleDelete('games', g.id)} 
                                                                className="p-2 hover:bg-red-900/30 rounded-full text-slate-500 hover:text-red-500 transition-colors"
                                                                title="Eliminar Partido"
                                                            >
                                                                <TrashIcon className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
