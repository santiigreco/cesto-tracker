
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import XIcon from './XIcon';
import TrashIcon from './TrashIcon';
import CheckIcon from './CheckIcon';
import Loader from './Loader';
import PencilIcon from './PencilIcon';
import PlusIcon from './PlusIcon';

interface AdminDashboardProps {
    isOpen: boolean;
    onClose: () => void;
}

type AdminTab = 'users' | 'tournaments' | 'games';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('users');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Edit States
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [newItemValue, setNewItemValue] = useState('');

    const fetchData = async () => {
        setLoading(true);
        setData([]);
        try {
            let query;
            if (activeTab === 'users') {
                // Fetch profiles
                query = supabase.from('profiles').select('*').order('updated_at', { ascending: false });
            } else if (activeTab === 'tournaments') {
                query = supabase.from('tournaments').select('*').order('created_at', { ascending: false });
            } else if (activeTab === 'games') {
                // Fetch last 50 games
                query = supabase.from('games').select('*, profiles(email)').order('created_at', { ascending: false }).limit(50);
            }

            if (query) {
                const { data: result, error } = await query;
                if (error) throw error;
                setData(result || []);
            }
        } catch (error) {
            console.error("Admin Fetch Error:", error);
            alert("Error cargando datos. Verifica permisos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) fetchData();
    }, [isOpen, activeTab]);

    // --- ACTIONS ---

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este registro? Esta acción es irreversible.")) return;
        
        const table = activeTab === 'games' ? 'games' : (activeTab === 'tournaments' ? 'tournaments' : null);
        if (!table) return; // Can't delete users directly from here usually due to auth linkage

        try {
            const { error } = await supabase.from(table).delete().eq('id', id);
            if (error) throw error;
            setData(prev => prev.filter(item => item.id !== id));
        } catch (err: any) {
            alert("Error al eliminar: " + err.message);
        }
    };

    const handleUpdate = async (id: string, field: string, value: string) => {
        const table = activeTab; // users (profiles), tournaments, games
        const dbTable = table === 'users' ? 'profiles' : table;

        try {
            const { error } = await supabase.from(dbTable).update({ [field]: value }).eq('id', id);
            if (error) throw error;
            
            setData(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
            setEditingId(null);
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
            <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col border border-slate-700">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800">
                    <h2 className="text-xl font-bold text-red-500 flex items-center gap-2">
                        🛡️ Panel de Administrador
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors text-slate-400 hover:text-white">
                        <XIcon />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-700 bg-slate-800/50">
                    <button 
                        onClick={() => setActiveTab('users')} 
                        className={`px-6 py-3 font-bold transition-colors ${activeTab === 'users' ? 'text-white border-b-2 border-cyan-500 bg-slate-700/50' : 'text-slate-400 hover:text-white'}`}
                    >
                        Usuarios
                    </button>
                    <button 
                        onClick={() => setActiveTab('tournaments')} 
                        className={`px-6 py-3 font-bold transition-colors ${activeTab === 'tournaments' ? 'text-white border-b-2 border-cyan-500 bg-slate-700/50' : 'text-slate-400 hover:text-white'}`}
                    >
                        Torneos
                    </button>
                    <button 
                        onClick={() => setActiveTab('games')} 
                        className={`px-6 py-3 font-bold transition-colors ${activeTab === 'games' ? 'text-white border-b-2 border-cyan-500 bg-slate-700/50' : 'text-slate-400 hover:text-white'}`}
                    >
                        Partidos (Últimos 50)
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
                    <div className="flex-grow overflow-auto custom-scrollbar border border-slate-700 rounded-lg">
                        {loading ? (
                            <div className="flex justify-center items-center h-full"><Loader /></div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-800 sticky top-0 z-10">
                                    <tr>
                                        {activeTab === 'users' && (
                                            <>
                                                <th className="p-3 text-slate-300 font-semibold border-b border-slate-700">Email (ID)</th>
                                                <th className="p-3 text-slate-300 font-semibold border-b border-slate-700">Nombre</th>
                                                <th className="p-3 text-slate-300 font-semibold border-b border-slate-700">Rol</th>
                                                <th className="p-3 text-slate-300 font-semibold border-b border-slate-700">Club</th>
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
                                                <th className="p-3 text-slate-300 font-semibold border-b border-slate-700">Fecha</th>
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
                                            {activeTab === 'users' && (
                                                <>
                                                    <td className="p-3 text-xs text-slate-400 font-mono">{item.id}</td>
                                                    <td className="p-3 text-white">{item.full_name || '-'}</td>
                                                    <td className="p-3 text-cyan-400">{item.role || 'Usuario'}</td>
                                                    <td className="p-3 text-slate-300">{item.favorite_club || '-'}</td>
                                                </>
                                            )}

                                            {activeTab === 'tournaments' && (
                                                <>
                                                    <td className="p-3 text-white">
                                                        {editingId === item.id ? (
                                                            <div className="flex gap-2">
                                                                <input 
                                                                    className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white w-full"
                                                                    value={editValue}
                                                                    onChange={(e) => setEditValue(e.target.value)}
                                                                />
                                                                <button onClick={() => handleUpdate(item.id, 'name', editValue)} className="text-green-500 hover:text-green-400"><CheckIcon /></button>
                                                                <button onClick={() => setEditingId(null)} className="text-red-500 hover:text-red-400"><XIcon /></button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 group">
                                                                {item.name}
                                                                <button 
                                                                    onClick={() => { setEditingId(item.id); setEditValue(item.name); }}
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
                                                    <td className="p-3 text-xs text-cyan-300">{item.profiles?.email || 'Anon'}</td>
                                                    <td className="p-3 text-white font-bold">{item.settings?.gameName || 'Sin Nombre'}</td>
                                                    <td className="p-3 text-slate-300">{item.settings?.myTeam || '-'}</td>
                                                    <td className="p-3">
                                                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-400 p-1 bg-slate-800 rounded hover:bg-slate-700">
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
