
import React, { useEffect, useState, useMemo } from 'react';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { SearchIcon } from '../../icons';
import { TrashIcon } from '../../icons';
import { PencilIcon } from '../../icons';
import { CheckIcon } from '../../icons';
import { XIcon } from '../../icons';
import Loader from '../../Loader';
import { TEAMS_CONFIG } from '../../../constants';
import { IdentityRole, PermissionRole } from '../../../types';

const IDENTITY_OPTIONS: { value: IdentityRole; label: string; color: string }[] = [
    { value: 'jugador', label: 'Jugador', color: 'bg-slate-700 text-slate-300' },
    { value: 'entrenador', label: 'Entrenador', color: 'bg-indigo-900/50 text-indigo-300 border-indigo-700' },
    { value: 'dirigente', label: 'Dirigente', color: 'bg-purple-900/50 text-purple-300 border-purple-700' },
    { value: 'periodista', label: 'Prensa', color: 'bg-pink-900/50 text-pink-300 border-pink-700' },
    { value: 'otro', label: 'Otro', color: 'bg-slate-700 text-slate-400' },
];

const PERMISSION_OPTIONS: { value: PermissionRole | 'user'; label: string; color: string }[] = [
    { value: 'user', label: 'Usuario', color: 'bg-slate-800 text-slate-500 border-slate-700' }, 
    { value: 'fixture_manager', label: 'Gestor Fixture', color: 'bg-yellow-900/50 text-yellow-300 border-yellow-600 font-bold' },
    { value: 'admin', label: 'Admin', color: 'bg-red-900/50 text-red-300 border-red-500 font-bold' },
];

export const AdminUsersView: React.FC<{ isOwner: boolean }> = ({ isOwner }) => {
    const { users, fetchUsers, loading, error, deleteUser, updateUserIdentity, updateUserPermission, updateUserClub } = useAdminUsers(isOwner);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempClub, setTempClub] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const filteredUsers = useMemo(() => {
        return users.filter(u => 
            (u.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            u.id.includes(searchTerm)
        );
    }, [users, searchTerm]);

    const startEditing = (id: string, currentClub: string | null) => {
        setEditingId(id);
        setTempClub(currentClub || '');
    };

    const saveClub = async (id: string) => {
        await updateUserClub(id, tempClub);
        setEditingId(null);
    };

    if (error) return <div className="text-red-400 p-4 border border-red-900 bg-red-900/10 rounded">Error: {error}</div>;

    return (
        <div className="flex flex-col h-full animate-fade-in pb-20 lg:pb-0">
            {/* Header / Filter */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 lg:mb-6 gap-2">
                <div className="relative w-full sm:max-w-md">
                    <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Buscar usuario..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                </div>
                <div className="text-slate-400 text-sm">
                    {loading ? <Loader className="h-5 w-5" /> : `${filteredUsers.length} usuarios`}
                </div>
            </div>

            {/* --- MOBILE LIST (CARDS) --- */}
            <div className="block lg:hidden space-y-3">
                {filteredUsers.map(user => (
                    <div key={user.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-bold text-white text-lg">{user.full_name || 'Sin Nombre'}</div>
                                <div className="text-xs text-cyan-500/80 truncate max-w-[200px]">{user.email}</div>
                                <div className="text-[10px] text-slate-500 font-mono mt-1">{user.id.substring(0, 8)}...</div>
                            </div>
                            <button 
                                onClick={() => deleteUser(user.id)}
                                className="p-2 bg-red-900/20 text-red-400 rounded-lg border border-red-900/50"
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-slate-400 uppercase font-bold">Identidad</span>
                                <select 
                                    value={user.role || 'jugador'} 
                                    onChange={(e) => updateUserIdentity(user.id, e.target.value as IdentityRole)}
                                    className="bg-slate-900 border border-slate-600 rounded p-1 text-white text-xs"
                                >
                                    {IDENTITY_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-slate-400 uppercase font-bold">Permiso</span>
                                <select 
                                    value={user.permission_role || 'user'} 
                                    onChange={(e) => updateUserPermission(user.id, e.target.value === 'user' ? null : e.target.value as PermissionRole)}
                                    className="bg-slate-900 border border-slate-600 rounded p-1 text-white text-xs"
                                >
                                    {PERMISSION_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="border-t border-slate-700 pt-2 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Club</span>
                            {editingId === user.id ? (
                                <div className="flex gap-2 items-center">
                                    <select 
                                        className="bg-slate-900 border border-slate-600 text-white text-xs rounded px-2 py-1 max-w-[120px]"
                                        value={tempClub}
                                        onChange={(e) => setTempClub(e.target.value)}
                                    >
                                        <option value="">-</option>
                                        {TEAMS_CONFIG.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                                    </select>
                                    <button onClick={() => saveClub(user.id)} className="text-green-400"><CheckIcon className="h-5 w-5"/></button>
                                    <button onClick={() => setEditingId(null)} className="text-red-400"><XIcon className="h-5 w-5"/></button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2" onClick={() => startEditing(user.id, user.favorite_club)}>
                                    <span className="text-sm text-slate-200 font-medium">{user.favorite_club || '-'}</span>
                                    <PencilIcon className="h-4 w-4 text-slate-500" />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* --- DESKTOP TABLE --- */}
            <div className="hidden lg:block bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg flex-grow overflow-y-auto custom-scrollbar">
                <table className="w-full text-left">
                    <thead className="bg-slate-700/50 text-slate-300 text-xs uppercase tracking-wider font-bold sticky top-0 backdrop-blur-sm">
                        <tr>
                            <th className="p-4">Usuario</th>
                            <th className="p-4">Identidad</th>
                            <th className="p-4">Permisos App</th>
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
                                    {user.email && <div className="text-xs text-cyan-500/80">{user.email}</div>}
                                </td>
                                
                                <td className="p-4">
                                    <select 
                                        value={user.role || 'jugador'} 
                                        onChange={(e) => updateUserIdentity(user.id, e.target.value as IdentityRole)}
                                        className={`bg-slate-900 border border-slate-600 text-xs rounded px-2 py-1 focus:ring-cyan-500 outline-none font-bold uppercase tracking-wide cursor-pointer hover:border-slate-400 transition-colors ${IDENTITY_OPTIONS.find(r => r.value === user.role)?.color || 'text-white'}`}
                                    >
                                        {IDENTITY_OPTIONS.map(r => (
                                            <option key={r.value} value={r.value}>{r.label}</option>
                                        ))}
                                    </select>
                                </td>

                                <td className="p-4">
                                    <select 
                                        value={user.permission_role || 'user'} 
                                        onChange={(e) => {
                                            const val = e.target.value === 'user' ? null : e.target.value as PermissionRole;
                                            updateUserPermission(user.id, val);
                                        }}
                                        className={`bg-slate-900 border border-slate-600 text-xs rounded px-2 py-1 focus:ring-cyan-500 outline-none font-bold uppercase tracking-wide cursor-pointer hover:border-slate-400 transition-colors ${PERMISSION_OPTIONS.find(r => r.value === (user.permission_role || 'user'))?.color || 'text-white'}`}
                                    >
                                        {PERMISSION_OPTIONS.map(r => (
                                            <option key={r.value} value={r.value}>{r.label}</option>
                                        ))}
                                    </select>
                                </td>

                                <td className="p-4">
                                    {editingId === user.id ? (
                                        <div className="flex gap-2">
                                            <select 
                                                className="bg-slate-900 border border-slate-600 text-white text-xs rounded px-2 py-1"
                                                value={tempClub}
                                                onChange={(e) => setTempClub(e.target.value)}
                                                autoFocus
                                            >
                                                <option value="">-</option>
                                                {TEAMS_CONFIG.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                                            </select>
                                            <button onClick={() => saveClub(user.id)} className="text-green-400 hover:text-green-300"><CheckIcon className="h-4 w-4"/></button>
                                            <button onClick={() => setEditingId(null)} className="text-red-400 hover:text-red-300"><XIcon className="h-4 w-4"/></button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => startEditing(user.id, user.favorite_club)}>
                                            <span className="text-sm text-slate-300">{user.favorite_club || '-'}</span>
                                            <PencilIcon className="h-3 w-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    )}
                                </td>
                                <td className="p-4 text-center">
                                    <button 
                                        onClick={() => deleteUser(user.id)}
                                        className="p-2 hover:bg-red-900/30 rounded-full text-slate-500 hover:text-red-500 transition-colors"
                                        title="Eliminar Usuario"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && !loading && (
                    <div className="p-8 text-center text-slate-500">No se encontraron usuarios.</div>
                )}
            </div>
        </div>
    );
};
