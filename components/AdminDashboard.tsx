
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import XIcon from './XIcon';
import TrashIcon from './TrashIcon';
import CheckIcon from './CheckIcon';
import Loader from './Loader';
import PencilIcon from './PencilIcon';
import PlusIcon from './PlusIcon';
import RefreshIcon from './RefreshIcon';
import { UserRole } from '../types';

interface AdminDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    isOwner: boolean; // Only owners can manage users
}

type AdminTab = 'users' | 'tournaments' | 'games';

const ROLES: UserRole[] = ['jugador', 'entrenador', 'dirigente', 'hincha', 'periodista', 'admin', 'otro'];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose, isOwner }) => {
    // If not owner, default to tournaments, they shouldn't see users
    const [activeTab, setActiveTab] = useState<AdminTab>(isOwner ? 'users' : 'tournaments');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Edit States
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Record<string, any>>({});
    const [newItemValue, setNewItemValue] = useState('');

    const fetchData = async () => {
        setLoading(true);
        // Don't clear data immediately to avoid flickering if it's just a refresh
        // setData([]); 
        try {
            let query;
            if (activeTab === 'users') {
                if (!isOwner) throw new Error("Acceso denegado a usuarios.");
                // Fetch profiles
                query = supabase.from('profiles').select('*').order('updated_at', { ascending: false });
            } else if (activeTab === 'tournaments') {
                query = supabase.from('tournaments').select('*').order('created_at', { ascending: false });
            } else if (activeTab === 'games') {
                // Fetch last 50 games. 
                query = supabase.from('games').select('*').order('created_at', { ascending: false }).limit(50);
            }

            if (query) {
                const { data: result, error } = await query;
                if (error) throw error;
                setData(result || []);
            }
        } catch (error: any) {
            console.error("Admin Fetch Error:", error);
            if (error.code === '42P01') {
                alert("Error: La tabla no existe o no tienes permisos.");
            } else if (error.code === 'PGRST116') {
                alert("Error: Problema con la relación de datos (Foreign Key).");
            } else {
                alert(`Error cargando datos: ${error.message || 'Verifica permisos RLS'}.`);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            // Reset tab if user is not owner but somehow 'users' was selected
            if (!isOwner && activeTab === 'users') {
                setActiveTab('tournaments');
            } else {
                fetchData();
            }
        }
    }, [isOpen, activeTab, isOwner]);

    // --- REALTIME SUBSCRIPTION ---
    useEffect(() => {
        if (!isOpen) return;

        const tableName = activeTab === 'users' ? 'profiles' : activeTab; // 'profiles', 'tournaments', 'games'

        const channel = supabase
            .channel('admin_realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: tableName },
                () => {
                    console.log(`Change detected in ${tableName}, refreshing...`);
                    fetchData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isOpen, activeTab]);

    // --- ACTIONS ---

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este registro? Esta acción es irreversible.")) return;
        
        const table = activeTab === 'games' ? 'games' : (activeTab === 'tournaments' ? 'tournaments' : null);
        if (!table) return; 

        try {
            const { error } = await supabase.from(table).delete().eq('id', id);
            if (error) throw error;
            // Optimistic update
            setData(prev => prev.filter(item => item.id !== id));
        } catch (err: any) {
            alert("Error al eliminar: " + err.message);
            fetchData(); // Revert/Refresh on error
        }
    };

    const startEditing = (item: any) => {
        setEditingId(item.id);
        if (activeTab === 'users') {
            setEditValues({ role: item.role, favorite_club: item.favorite_club });
        } else if (activeTab === 'tournaments') {
            setEditValues({ name: item.name });
        } else if (activeTab === 'games') {
            setEditValues({ 
                opponent_name: item.opponent_name || item.settings?.gameName || '',
                my_team_name: item.my_team_name || item.settings?.myTeam || ''
            });
        }
    }

    const handleUpdate = async (id: string) => {
        const table = activeTab; // users (profiles), tournaments, games
        const dbTable = table === 'users' ? 'profiles' : table;
        
        let updates: any = {};
        
        if (activeTab === 'users') {
            updates = { role: editValues.role, favorite_club: editValues.favorite_club };
        } else if (activeTab === 'tournaments') {
            updates = { name: editValues.name };
        } else if (activeTab === 'games') {
            updates = { 
                opponent_name: editValues.opponent_name,
                my_team_name: editValues.my_team_name
            };
            const currentGame = data.find(g => g.id === id);
            if(currentGame) {
                const newSettings = { 
                    ...currentGame.settings, 
                    gameName: editValues.opponent_name,
                    myTeam: editValues.my_team_name
                };
                updates.settings = newSettings;
            }
        }

        try {
            const { error } = await supabase.from(dbTable).update(updates).eq('id', id);
            if (error) throw error;
            
            setData(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
            setEditingId(null);
            setEditValues({});
        } catch (err: any) {
            alert("Error al actualizar: " + err.message);
        }
    };

    const handleCreateTournament = async () => {
        if (!newItemValue.trim()) return;
        try {
            const { data: newT, error } = await supabase.from('tournaments').insert([{ name: newItemValue.trim() }]).select().single();
            if (error) throw error;
            setData(prev => [newT, ...prev]);
            setNewItemValue('');
        } catch (err: any) {
            alert("Error: " + err.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4 animate-fade-in backdrop-blur-sm">
            <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col border border-slate-700">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-red-500 flex items-center gap-2">
                            🛡️ Panel Admin {isOwner ? '(Owner)' : ''}
                        </h2>
                        <button 
                            onClick={() => fetchData()} 
                            disabled={loading}
                            className={`p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Actualizar datos"
                        >
                            <RefreshIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors text-slate-400 hover:text-white">
                        <XIcon />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-700 bg-slate-800/50 overflow-x-auto">
                    {isOwner && (
                        <button 
                            onClick={() => setActiveTab('users')} 
                            className={`px-6 py-3 font-bold transition-colors whitespace-nowrap ${activeTab === 'users' ? 'text-white border-b-2 border-cyan-500 bg-slate-700/50' : 'text-slate-400 hover:text-white'}`}
                        >
                            Usuarios
                        </button>
                    )}
                    <button 
                        onClick={() => setActiveTab('tournaments')} 
                        className={`px-6 py-3 font-bold transition-colors whitespace-nowrap ${activeTab === 'tournaments' ? 'text-white border-b-2 border-cyan-500 bg-slate-700/50' : 'text-slate-400 hover:text-white'}`}
                    >
                        Torneos
                    </button>
                    <button 
                        onClick={() => setActiveTab('games')} 
                        className={`px-6 py-3 font-bold transition-colors whitespace-nowrap ${activeTab === 'games' ? 'text-white border-b-2 border-cyan-500 bg-slate-700/50' : 'text-slate-400 hover:text-white'}`}
                    >
                        Gestión Partidos
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-hidden flex flex-col p-4 bg-slate-900">
                    
                    {/* Add Toolbar for Tournaments */}
                    {activeTab === 'tournaments' && (
                        <div className="flex gap-2 mb-4 pb-4 border-b border-slate-800">
                            <input 
                                type="text" 
                                value={newItemValue}
                                onChange={(e) => setNewItemValue(e.target.value)}
                                placeholder="Nombre nuevo torneo..."
                                className="bg-slate-800 border border-slate-600 text-white rounded px-3 py-2 flex-grow focus:border-cyan-500 outline-none"
                            />
                            <button onClick={handleCreateTournament} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold flex items-center gap-2">
                                <PlusIcon className="h-5 w-5" /> Crear
                            </button>
                        </div>
                    )}

                    {/* Table Container */}
                    <div className="flex-grow overflow-auto custom-scrollbar border border-slate-700 rounded-lg relative">
                        {loading && data.length === 0 ? (
                            <div className="flex justify-center items-center h-full"><Loader /></div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-800 sticky top-0 z-10">
                                    <tr>
                                        {activeTab === 'users' && isOwner && (
                                            <>
                                                <th className="p-3 text-slate-300 font-semibold border-b border-slate-700">Email (ID)</th>
                                                <th className="p-3 text-slate-300 font-semibold border-b border-slate-700">Nombre</th>
                                                <th className="p-3 text-slate-300 font-semibold border-b border-slate-700">Rol</th>
                                                <th className="p-3 text-slate-300 font-semibold border-b border-slate-700">Club</th>
                                                <th className="p-3 text-slate-300 font-semibold border-b border-slate-700 w-20">Edit</th>
                                            </>
                                        )}
                                        {activeTab === 'tournaments' && (
                                            <>
                                                <th className="p-3 text-slate-300 font-semibold border-b border-slate-700">Nombre</th>
                                                <th className="p-3 text-slate-300 font-semibold border-b border-slate-700 w-24">Acciones</th>
                                            </>
                                        )}
                                        {activeTab === 'games' && (
                                            <>
                                                <th className="p-3 text-slate-300 font-semibold border-b border-slate-700 w-24">Fecha</th>
                                                <th className="p-3 text-slate-300 font-semibold border-b border-slate-700">Usuario</th>
                                                <th className="p-3 text-slate-300 font-semibold border-b border-slate-700">Partido (Nombre)</th>
                                                <th className="p-3 text-slate-300 font-semibold border-b border-slate-700">Equipo</th>
                                                <th className="p-3 text-slate-300 font-semibold border-b border-slate-700 w-24">Acciones</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item) => (
                                        <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                                            {activeTab === 'users' && isOwner && (
                                                <>
                                                    <td className="p-3 text-xs text-slate-400 font-mono" title={item.id}>{item.id.substring(0, 8)}...</td>
                                                    <td className="p-3 text-white">{item.full_name || '-'}</td>
                                                    <td className="p-3">
                                                        {editingId === item.id ? (
                                                            <select 
                                                                value={editValues.role || ''} 
                                                                onChange={(e) => setEditValues({...editValues, role: e.target.value})}
                                                                className="bg-slate-700 text-white rounded p-1 text-sm border border-slate-600"
                                                            >
                                                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                                            </select>
                                                        ) : (
                                                            <span className={`text-sm font-bold ${item.role === 'admin' ? 'text-red-400' : 'text-cyan-400'}`}>{item.role || 'Usuario'}</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-slate-300">{item.favorite_club || '-'}</td>
                                                    <td className="p-3">
                                                        {editingId === item.id ? (
                                                            <div className="flex gap-1">
                                                                <button onClick={() => handleUpdate(item.id)} className="text-green-500 hover:text-green-400 p-1"><CheckIcon /></button>
                                                                <button onClick={() => setEditingId(null)} className="text-red-500 hover:text-red-400 p-1"><XIcon /></button>
                                                            </div>
                                                        ) : (
                                                            <button onClick={() => startEditing(item)} className="text-slate-500 hover:text-white p-1"><PencilIcon /></button>
                                                        )}
                                                    </td>
                                                </>
                                            )}

                                            {activeTab === 'tournaments' && (
                                                <>
                                                    <td className="p-3 text-white">
                                                        {editingId === item.id ? (
                                                            <div className="flex gap-2">
                                                                <input 
                                                                    className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white w-full"
                                                                    value={editValues.name}
                                                                    onChange={(e) => setEditValues({...editValues, name: e.target.value})}
                                                                />
                                                                <button onClick={() => handleUpdate(item.id)} className="text-green-500 hover:text-green-400"><CheckIcon /></button>
                                                                <button onClick={() => setEditingId(null)} className="text-red-500 hover:text-red-400"><XIcon /></button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 group">
                                                                {item.name}
                                                                <button 
                                                                    onClick={() => startEditing(item)}
                                                                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-cyan-400 transition-opacity"
                                                                >
                                                                    <PencilIcon className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-400 p-1 bg-slate-800 rounded hover:bg-slate-700">
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </td>
                                                </>
                                            )}

                                            {activeTab === 'games' && (
                                                <>
                                                    <td className="p-3 text-xs text-slate-400">{new Date(item.created_at).toLocaleDateString()}</td>
                                                    <td className="p-3 text-xs text-cyan-300 font-mono" title={item.user_id}>
                                                        {item.user_id ? item.user_id.substring(0, 8) + '...' : 'Anon'}
                                                    </td>
                                                    <td className="p-3 text-white">
                                                        {editingId === item.id ? (
                                                            <input 
                                                                className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white w-full text-sm"
                                                                value={editValues.opponent_name}
                                                                onChange={(e) => setEditValues({...editValues, opponent_name: e.target.value})}
                                                            />
                                                        ) : (
                                                            <span className="font-bold">{item.settings?.gameName || item.opponent_name || 'Sin Nombre'}</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-slate-300">
                                                        {editingId === item.id ? (
                                                            <input 
                                                                className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white w-full text-sm"
                                                                value={editValues.my_team_name}
                                                                onChange={(e) => setEditValues({...editValues, my_team_name: e.target.value})}
                                                            />
                                                        ) : (
                                                            <span>{item.settings?.myTeam || item.my_team_name || '-'}</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        {editingId === item.id ? (
                                                            <div className="flex gap-1">
                                                                <button onClick={() => handleUpdate(item.id)} className="text-green-500 hover:text-green-400 p-1"><CheckIcon /></button>
                                                                <button onClick={() => setEditingId(null)} className="text-red-500 hover:text-red-400 p-1"><XIcon /></button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex gap-2">
                                                                <button onClick={() => startEditing(item)} className="text-slate-500 hover:text-white p-1"><PencilIcon /></button>
                                                                <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-400 p-1 bg-slate-800 rounded hover:bg-slate-700">
                                                                    <TrashIcon className="h-5 w-5" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                    {data.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-500">No hay datos para mostrar.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                        {/* Dimmer Overlay for Refresh Loading */}
                        {loading && data.length > 0 && (
                            <div className="absolute inset-0 bg-slate-900/50 flex justify-center items-center z-20">
                                <Loader />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
