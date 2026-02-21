
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { XIcon, CheckIcon, CameraIcon } from './icons';
import Loader from './Loader';
import TeamLogo from './TeamLogo';
import { useProfile } from '../hooks/useProfile';
import { TEAMS_CONFIG } from '../constants';
import { useNavigate } from 'react-router-dom';
import { IdentityRole } from '../types';
import { supabase } from '../utils/supabaseClient';

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onLogout: () => void;
    onLoadGame: (gameId: string, asOwner: boolean) => void;
}

const IDENTITY_ROLES: { value: IdentityRole; label: string; emoji: string }[] = [
    { value: 'jugador', label: 'Jugador/a', emoji: '🏃' },
    { value: 'entrenador', label: 'Entrenador/a', emoji: '📋' },
    { value: 'dirigente', label: 'Delegado / Mesa', emoji: '⏱️' },
    { value: 'hincha', label: 'Hincha / Familiar', emoji: '🥁' },
    { value: 'periodista', label: 'Prensa', emoji: '🎙️' },
    { value: 'otro', label: 'Otro', emoji: '🏐' },
];

interface SavedGame {
    id: string;
    opponent_name: string;
    game_mode: string;
    created_at: string;
    settings: any;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, user, onLogout, onLoadGame }) => {
    const { profile, loading: profileLoading, updateProfile, uploadAvatar } = useProfile();
    const navigate = useNavigate();

    // Tabs
    const [activeTab, setActiveTab] = useState<'profile' | 'games'>('profile');

    // Form State
    const [fullName, setFullName] = useState('');
    const [favoriteClub, setFavoriteClub] = useState<string>('');
    const [role, setRole] = useState<IdentityRole | ''>('');
    const [playerNumber, setPlayerNumber] = useState<string>('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    // UI State
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Games state
    const [savedGames, setSavedGames] = useState<SavedGame[]>([]);
    const [gamesLoading, setGamesLoading] = useState(false);

    // Admin State
    const isOwner = profile?.is_admin === true;
    const canAccessAdminPanel = isOwner || profile?.permission_role === 'admin';

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setFavoriteClub(profile.favorite_club || '');
            setRole(profile.role || '');
            setPlayerNumber(profile.player_number || '');
            setAvatarUrl(profile.avatar_url || null);
        }
    }, [profile]);

    const fetchGames = useCallback(async () => {
        if (!user) return;
        setGamesLoading(true);
        try {
            const { data, error } = await supabase
                .from('games')
                .select('id, opponent_name, game_mode, created_at, settings')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            setSavedGames(data || []);
        } catch (err) {
            console.error('Error fetching games:', err);
        } finally {
            setGamesLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (isOpen && activeTab === 'games') {
            fetchGames();
        }
    }, [isOpen, activeTab, fetchGames]);

    const handleSave = async () => {
        setIsSaving(true);
        const success = await updateProfile({
            full_name: fullName,
            favorite_club: favoriteClub,
            role: role as IdentityRole,
            player_number: role === 'jugador' ? playerNumber : null,
        });
        setIsSaving(false);
        if (success) {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) return;
        const file = event.target.files[0];
        if (file.size > 2 * 1024 * 1024) {
            alert('La imagen es demasiado grande. Máximo 2MB.');
            return;
        }
        setIsUploading(true);
        const newUrl = await uploadAvatar(file);
        setIsUploading(false);
        if (newUrl) setAvatarUrl(newUrl);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-AR', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const getGameModeLabel = (mode: string) => {
        return mode === 'shot-chart' ? '🗺️ Mapa de Tiros' : '📋 Planilla';
    };

    if (!isOpen) return null;

    const gamesCount = profile?.games_count ?? savedGames.length;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md flex flex-col border border-slate-700/80 overflow-hidden relative max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header Profile Card */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 flex flex-col items-center border-b border-slate-700 relative shrink-0">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                        <XIcon />
                    </button>

                    {/* Avatar */}
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-600 to-emerald-600 border-4 border-slate-800 flex items-center justify-center text-white font-bold text-3xl uppercase shadow-lg overflow-hidden relative">
                            {isUploading ? <Loader className="h-8 w-8 text-white" /> :
                                avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> :
                                    user.email?.charAt(0) || 'U'}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <CameraIcon className="h-7 w-7 text-white" />
                            </div>
                        </div>
                        {favoriteClub && (
                            <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-700 shadow">
                                <TeamLogo teamName={favoriteClub} className="h-6 w-6" />
                            </div>
                        )}
                    </div>

                    <h2 className="mt-3 text-lg font-bold text-white text-center">{fullName || 'Usuario de Cesto Tracker'}</h2>
                    <p className="text-xs text-slate-400">{user.email}</p>

                    <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
                        {role && (
                            <span className="px-3 py-0.5 rounded-full bg-cyan-900/30 text-cyan-400 text-xs font-bold border border-cyan-500/30 uppercase tracking-wide">
                                {IDENTITY_ROLES.find(r => r.value === role)?.emoji} {IDENTITY_ROLES.find(r => r.value === role)?.label || role}
                            </span>
                        )}
                        {role === 'jugador' && playerNumber && (
                            <span className="px-3 py-0.5 rounded-full bg-emerald-900/30 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                                #{playerNumber}
                            </span>
                        )}
                    </div>

                    {/* Gamification stat */}
                    {gamesCount > 0 && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                            <span className="text-lg">🏆</span>
                            <span><span className="font-bold text-white text-sm">{gamesCount}</span> partido{gamesCount !== 1 ? 's' : ''} registrado{gamesCount !== 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-700 shrink-0">
                    {[
                        { key: 'profile', label: '👤 Perfil' },
                        { key: 'games', label: '📂 Mis Partidos' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === tab.key
                                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/30'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="overflow-y-auto flex-grow">
                    {activeTab === 'profile' && (
                        <div className="p-5 space-y-5">
                            {/* Full Name */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    placeholder="Ej: Juan Pérez"
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-colors"
                                />
                            </div>

                            {/* Club + Role */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Club Favorito ❤️</label>
                                    <select
                                        value={favoriteClub}
                                        onChange={e => setFavoriteClub(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-colors appearance-none"
                                    >
                                        <option value="">Seleccionar...</option>
                                        {TEAMS_CONFIG.map(team => (
                                            <option key={team.name} value={team.name}>{team.name}</option>
                                        ))}
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Rol</label>
                                    <select
                                        value={role}
                                        onChange={e => setRole(e.target.value as IdentityRole)}
                                        className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-colors appearance-none"
                                    >
                                        <option value="">Seleccionar...</option>
                                        {IDENTITY_ROLES.map(r => (
                                            <option key={r.value} value={r.value}>{r.emoji} {r.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Player Number — only for 'jugador' */}
                            {role === 'jugador' && (
                                <div className="p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-lg">
                                    <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-1">Tu número de jugador 🏐</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="99"
                                        value={playerNumber}
                                        onChange={e => setPlayerNumber(e.target.value)}
                                        placeholder="Ej: 7"
                                        className="w-32 bg-slate-800 border border-slate-600 rounded-lg p-3 text-white text-center text-2xl font-bold focus:border-emerald-500 outline-none transition-colors"
                                    />
                                </div>
                            )}

                            {/* Save Button */}
                            <button
                                onClick={handleSave}
                                disabled={isSaving || profileLoading}
                                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95 ${saveSuccess
                                    ? 'bg-green-600 text-white'
                                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                                    }`}
                            >
                                {isSaving ? <Loader className="h-5 w-5 text-white" /> :
                                    saveSuccess ? <><CheckIcon className="h-5 w-5" /> Guardado</> : 'Guardar Perfil'
                                }
                            </button>

                            {/* Admin Button */}
                            {canAccessAdminPanel && (
                                <button
                                    onClick={() => { navigate('/admin'); onClose(); }}
                                    className="w-full py-2 bg-red-900/20 border border-red-900/50 text-red-400 hover:text-white hover:bg-red-900/50 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors"
                                >
                                    🛡️ Ir al Panel Admin {isOwner ? '(Owner)' : ''}
                                </button>
                            )}

                            {/* Logout */}
                            <div className="border-t border-slate-800 pt-3">
                                <button
                                    onClick={onLogout}
                                    className="w-full py-2 text-sm text-red-400 hover:text-red-300 font-semibold hover:bg-red-900/10 rounded-lg transition-colors"
                                >
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'games' && (
                        <div className="p-4">
                            {gamesLoading ? (
                                <div className="flex justify-center py-12"><Loader /></div>
                            ) : savedGames.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <p className="text-4xl mb-3">📂</p>
                                    <p className="font-semibold">No hay partidos guardados</p>
                                    <p className="text-xs mt-1">Guardá tu próximo partido en la nube para verlo acá.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {savedGames.map(game => (
                                        <div key={game.id} className="flex items-center justify-between bg-slate-800 hover:bg-slate-700/80 rounded-xl px-4 py-3 transition-colors group">
                                            <div className="flex-grow min-w-0 mr-3">
                                                <p className="font-bold text-white text-sm truncate">
                                                    {game.settings?.gameName || game.opponent_name || 'Partido sin nombre'}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {getGameModeLabel(game.game_mode)} · {formatDate(game.created_at)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    onLoadGame(game.id, true);
                                                    onClose();
                                                }}
                                                className="shrink-0 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-colors"
                                            >
                                                Editar
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
