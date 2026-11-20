import React, { useEffect, useState, useMemo } from 'react';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { SearchIcon, TrashIcon, PencilIcon, CheckIcon, XIcon } from '../../icons';
import Loader from '@/components/ui/Loader';
import { TEAMS_CONFIG } from '../../../constants';
import { IdentityRole, PermissionRole } from '../../../types';

const IDENTITY_OPTIONS: { value: IdentityRole; label: string; toneClass: string }[] = [
    { value: 'jugador', label: 'Jugador', toneClass: 'text-ink-primary' },
    { value: 'entrenador', label: 'Entrenador', toneClass: 'text-brand border-brand/40' },
    { value: 'dirigente', label: 'Dirigente', toneClass: 'text-sport-triple-light border-sport-triple/40' },
    { value: 'periodista', label: 'Prensa', toneClass: 'text-sport-warn-light border-sport-warn/40' },
    { value: 'otro', label: 'Otro', toneClass: 'text-ink-secondary' },
];

const PERMISSION_OPTIONS: { value: PermissionRole | 'user'; label: string; toneClass: string }[] = [
    { value: 'user', label: 'Usuario', toneClass: 'text-ink-secondary' },
    { value: 'admin', label: 'Admin', toneClass: 'text-sport-miss-light border-sport-miss/50 font-bold' },
];

export const AdminUsersView: React.FC<{ isOwner: boolean; isAdmin?: boolean }> = ({ isOwner, isAdmin }) => {
    const canManageUsers = isAdmin ?? isOwner ?? true;
    const { users, fetchUsers, loading, error, deleteUser, updateUserIdentity, updateUserPermission, updateUserClub } = useAdminUsers(canManageUsers);
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

    if (error) {
        return (
            <div className="text-sport-miss-light p-4 border border-sport-miss/40 bg-sport-miss/15 rounded-xl text-sm font-medium">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full animate-fade-in pb-20 lg:pb-0">
            {/* Header / Filter */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 lg:mb-6 gap-2.5">
                <div className="relative w-full sm:max-w-md">
                    <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Buscar usuario..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full min-h-[44px] bg-surface-card border border-border-strong rounded-xl pl-10 pr-4 py-2 text-base sm:text-sm text-ink-primary placeholder-ink-muted focus:border-brand outline-none transition-colors"
                    />
                </div>
                <div className="text-ink-muted text-sm font-semibold tabular-nums">
                    {loading ? <Loader className="h-5 w-5" /> : `${filteredUsers.length} usuarios`}
                </div>
            </div>

            {/* --- MOBILE LIST (CARDS) --- */}
            <div className="block lg:hidden space-y-3">
                {filteredUsers.map(user => (
                    <div key={user.id} className="bg-surface-card p-4 rounded-2xl border border-border-subtle shadow-card flex flex-col gap-3">
                        <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                                <div className="font-bold text-ink-primary text-base flex items-center gap-2 flex-wrap">
                                    <span className="truncate">{user.full_name || 'Sin Nombre'}</span>
                                    {user.is_admin && (
                                        <span className="px-1.5 py-0.5 bg-sport-miss/15 text-sport-miss-light border border-sport-miss/40 text-[9px] font-extrabold rounded uppercase tracking-wider shrink-0">
                                            Owner
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-brand truncate max-w-[220px] mt-0.5">{user.email || 'Sin email'}</div>
                                <div className="text-[10px] text-ink-muted font-mono mt-1">{user.id.substring(0, 8)}...</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => deleteUser(user.id)}
                                className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-sport-miss/15 hover:bg-sport-miss/25 text-sport-miss-light rounded-xl border border-sport-miss/40 shrink-0 transition-colors"
                                title="Eliminar Usuario"
                                aria-label="Eliminar Usuario"
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 text-sm">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-ink-muted uppercase font-bold tracking-wider">Identidad</span>
                                <select
                                    aria-label={`Identidad de ${user.full_name || user.id}`}
                                    value={user.role || 'jugador'}
                                    onChange={(e) => updateUserIdentity(user.id, e.target.value as IdentityRole)}
                                    className="min-h-[40px] bg-surface-elevated border border-border-strong rounded-xl px-2.5 py-1.5 text-ink-primary text-base sm:text-xs font-semibold focus:border-brand outline-none"
                                >
                                    {IDENTITY_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-ink-muted uppercase font-bold tracking-wider">Permiso</span>
                                <select
                                    aria-label={`Permiso de ${user.full_name || user.id}`}
                                    value={user.permission_role === 'admin' ? 'admin' : 'user'}
                                    onChange={(e) => updateUserPermission(user.id, e.target.value === 'user' ? null : 'admin')}
                                    className="min-h-[40px] bg-surface-elevated border border-border-strong rounded-xl px-2.5 py-1.5 text-ink-primary text-base sm:text-xs font-semibold focus:border-brand outline-none"
                                >
                                    {PERMISSION_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="border-t border-border-subtle pt-2.5 flex items-center justify-between gap-2">
                            <span className="text-[10px] text-ink-muted uppercase font-bold tracking-wider">Club</span>
                            {editingId === user.id ? (
                                <div className="flex gap-1.5 items-center">
                                    <select
                                        aria-label="Seleccionar club favorito"
                                        className="min-h-[40px] bg-surface-elevated border border-border-strong text-ink-primary text-base sm:text-xs rounded-xl px-2.5 py-1.5 max-w-[160px] focus:border-brand outline-none"
                                        value={tempClub}
                                        onChange={(e) => setTempClub(e.target.value)}
                                    >
                                        <option value="">-</option>
                                        {TEAMS_CONFIG.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => saveClub(user.id)}
                                        className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-sport-goal/15 text-sport-goal-light border border-sport-goal/40"
                                        aria-label="Guardar club"
                                    >
                                        <CheckIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingId(null)}
                                        className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-sport-miss/15 text-sport-miss-light border border-sport-miss/40"
                                        aria-label="Cancelar"
                                    >
                                        <XIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className="min-h-[36px] flex items-center gap-2 px-2 rounded-lg hover:bg-surface-elevated transition-colors"
                                    onClick={() => startEditing(user.id, user.favorite_club)}
                                >
                                    <span className="text-sm text-ink-primary font-medium">{user.favorite_club || '-'}</span>
                                    <PencilIcon className="h-4 w-4 text-ink-muted" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* --- DESKTOP TABLE --- */}
            <div className="hidden lg:block bg-surface-card rounded-2xl border border-border-subtle overflow-hidden shadow-card flex-grow overflow-y-auto custom-scrollbar">
                <table className="w-full text-left">
                    <thead className="bg-surface-elevated text-ink-muted text-xs uppercase tracking-wider font-bold sticky top-0 border-b border-border-subtle">
                        <tr>
                            <th className="p-4">Usuario</th>
                            <th className="p-4">Identidad</th>
                            <th className="p-4">Permisos App</th>
                            <th className="p-4">Club Favorito</th>
                            <th className="p-4 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-surface-elevated/60 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-ink-primary flex items-center gap-2">
                                        <span>{user.full_name || 'Sin Nombre'}</span>
                                        {user.is_admin && (
                                            <span className="px-1.5 py-0.5 bg-sport-miss/15 text-sport-miss-light border border-sport-miss/40 text-[9px] font-extrabold rounded uppercase tracking-wider">
                                                Owner
                                            </span>
                                        )}
                                    </div>
                                    {user.email && <div className="text-xs text-brand mt-0.5">{user.email}</div>}
                                    <div className="text-[10px] text-ink-muted font-mono mt-0.5">{user.id.substring(0, 16)}…</div>
                                    {(user.last_seen_at || user.last_sign_in_at) && (
                                        <div className="text-[10px] text-ink-muted mt-0.5 tabular-nums">
                                            Última actividad: {new Date((user.last_seen_at || user.last_sign_in_at) as string).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    )}
                                    {user.last_game_at && (
                                        <div className="text-[10px] text-ink-muted tabular-nums">
                                            Último partido: {new Date(user.last_game_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    )}
                                    {user.created_at && (
                                        <div className="text-[10px] text-ink-muted tabular-nums">
                                            Registrado: {new Date(user.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    )}
                                </td>

                                <td className="p-4">
                                    <select
                                        aria-label={`Identidad de ${user.full_name || user.id}`}
                                        value={user.role || 'jugador'}
                                        onChange={(e) => updateUserIdentity(user.id, e.target.value as IdentityRole)}
                                        className={`bg-surface-elevated border border-border-strong text-base sm:text-xs rounded-xl px-2.5 py-1.5 focus:border-brand outline-none font-bold uppercase tracking-wide cursor-pointer hover:border-ink-muted transition-colors ${IDENTITY_OPTIONS.find(r => r.value === user.role)?.toneClass || 'text-ink-primary'}`}
                                    >
                                        {IDENTITY_OPTIONS.map(r => (
                                            <option key={r.value} value={r.value}>{r.label}</option>
                                        ))}
                                    </select>
                                </td>

                                <td className="p-4">
                                    <select
                                        aria-label={`Permisos de ${user.full_name || user.id}`}
                                        value={user.permission_role === 'admin' ? 'admin' : 'user'}
                                        onChange={(e) => {
                                            const val = e.target.value === 'user' ? null : 'admin';
                                            updateUserPermission(user.id, val);
                                        }}
                                        className={`bg-surface-elevated border border-border-strong text-base sm:text-xs rounded-xl px-2.5 py-1.5 focus:border-brand outline-none font-bold uppercase tracking-wide cursor-pointer hover:border-ink-muted transition-colors ${PERMISSION_OPTIONS.find(r => r.value === (user.permission_role === 'admin' ? 'admin' : 'user'))?.toneClass || 'text-ink-primary'}`}
                                    >
                                        {PERMISSION_OPTIONS.map(r => (
                                            <option key={r.value} value={r.value}>{r.label}</option>
                                        ))}
                                    </select>
                                </td>

                                <td className="p-4">
                                    {editingId === user.id ? (
                                        <div className="flex items-center gap-1.5">
                                            <select
                                                aria-label="Seleccionar club favorito"
                                                className="bg-surface-elevated border border-border-strong text-ink-primary text-base sm:text-xs rounded-xl px-2.5 py-1.5 focus:border-brand outline-none"
                                                value={tempClub}
                                                onChange={(e) => setTempClub(e.target.value)}
                                                autoFocus
                                            >
                                                <option value="">-</option>
                                                {TEAMS_CONFIG.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => saveClub(user.id)}
                                                className="p-1.5 rounded-lg text-sport-goal-light hover:bg-sport-goal/15 transition-colors"
                                                aria-label="Guardar club"
                                            >
                                                <CheckIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditingId(null)}
                                                className="p-1.5 rounded-lg text-sport-miss-light hover:bg-sport-miss/15 transition-colors"
                                                aria-label="Cancelar"
                                            >
                                                <XIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            className="flex items-center gap-2 group cursor-pointer text-left"
                                            onClick={() => startEditing(user.id, user.favorite_club)}
                                        >
                                            <span className="text-sm text-ink-secondary group-hover:text-ink-primary transition-colors">
                                                {user.favorite_club || '-'}
                                            </span>
                                            <PencilIcon className="h-3.5 w-3.5 text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    )}
                                </td>
                                <td className="p-4 text-center">
                                    <button
                                        type="button"
                                        onClick={() => deleteUser(user.id)}
                                        className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center hover:bg-sport-miss/15 rounded-xl text-ink-muted hover:text-sport-miss-light transition-colors"
                                        title="Eliminar Usuario"
                                        aria-label="Eliminar Usuario"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && !loading && (
                    <div className="p-8 text-center text-ink-muted text-sm">No se encontraron usuarios.</div>
                )}
            </div>
        </div>
    );
};
