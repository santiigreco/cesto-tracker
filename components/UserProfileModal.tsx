
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

interface UpcomingMatch {
    id: string;
    date: string;
    time: string;
    homeTeam: string;
    awayTeam: string;
    round?: string;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, user, onLogout, onLoadGame }) => {
    const { profile, loading: profileLoading, updateProfile, uploadAvatar } = useProfile();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'profile' | 'games'>('profile');

    const [fullName, setFullName] = useState('');
    const [favoriteClub, setFavoriteClub] = useState<string>('');
    const [role, setRole] = useState<IdentityRole | ''>('');
    const [playerNumber, setPlayerNumber] = useState<string>('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [copiedGameId, setCopiedGameId] = useState<string | null>(null);

    const [savedGames, setSavedGames] = useState<SavedGame[]>([]);
    const [gamesLoading, setGamesLoading] = useState(false);

    const [upcomingMatch, setUpcomingMatch] = useState<UpcomingMatch | null>(null);

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

    // Fetch upcoming fixture match for the user's favorite team
    useEffect(() => {
        if (!isOpen || !profile?.favorite_club) {
            setUpcomingMatch(null);
            return;
        }
        const today = new Date().toISOString().split('T')[0];
        supabase
            .from('fixture')
            .select('id, date, time, home_team, away_team, round')
            .gte('date', today)
            .or(`home_team.eq.${profile.favorite_club},away_team.eq.${profile.favorite_club}`)
            .neq('status', 'finished')
            .order('date', { ascending: true })
            .limit(1)
            .single()
            .then(({ data }) => {
                if (data) {
                    setUpcomingMatch({
                        id: data.id,
                        date: data.date,
                        time: data.time,
                        homeTeam: data.home_team,
                        awayTeam: data.away_team,
                        round: data.round,
                    });
                } else {
                    setUpcomingMatch(null);
                }
            });
    }, [isOpen, profile?.favorite_club]);

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
        if (isOpen && activeTab === 'games') fetchGames();
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
        if (file.size > 2 * 1024 * 1024) { alert('La imagen es demasiado grande. Máximo 2MB.'); return; }
        setIsUploading(true);
        const newUrl = await uploadAvatar(file);
        setIsUploading(false);
        if (newUrl) setAvatarUrl(newUrl);
    };

    const handleShareGame = (gameId: string) => {
        const url = `${window.location.origin}/match/${gameId}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopiedGameId(gameId);
            setTimeout(() => setCopiedGameId(null), 2000);
        });
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });

    const formatMatchDate = (dateStr: string) => {
        const d = new Date(`${dateStr}T00:00:00`);
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const diff = Math.round((d.getTime() - today.getTime()) / 86_400_000);
        if (diff === 0) return '🔴 Hoy';
        if (diff === 1) return '📅 Mañana';
        return `📅 ${d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}`;
    };

    const getGameModeLabel = (mode: string) =>
        mode === 'shot-chart' ? '🗺️ Mapa' : '📋 Planilla';

    if (!isOpen) return null;

    const gamesCount = profile?.games_count ?? savedGames.length;
    const opponent = upcomingMatch
        ? (upcomingMatch.homeTeam === profile?.favorite_club ? upcomingMatch.awayTeam : upcomingMatch.homeTeam)
        : null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md flex flex-col border border-slate-700/80 overflow-hidden relative max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
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

                    {gamesCount > 0 && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                            <span className="text-lg">🏆</span>
                            <span>
                                <span className="font-bold text-white text-sm">{gamesCount}</span>
                                {' '}partido{gamesCount !== 1 ? 's' : ''} registrado{gamesCount !== 1 ? 's' : ''}
                            </span>
                        </div>
                    )}

                    {/* Upcoming match banner */}
                    {upcomingMatch && opponent && (
                        <button
                            onClick={() => { navigate('/fixture'); onClose(); }}
                            className="mt-3 w-full flex items-center gap-3 bg-cyan-900/20 border border-cyan-500/30 hover:border-cyan-400/60 rounded-xl px-4 py-2.5 text-left transition-all group"
                        >
                            <span className="text-xl shrink-0">📣</span>
                            <div className="flex-grow min-w-0">
                                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">Próximo partido · {profile?.favorite_club}</p>
                                <p className="text-sm font-bold text-white truncate">vs {opponent}</p>
                                <p className="text-xs text-slate-400">
                                    {formatMatchDate(upcomingMatch.date)} · {upcomingMatch.time}hs
                                    {upcomingMatch.round ? ` · ${upcomingMatch.round}` : ''}
                                </p>
                            </div>
                            <span className="text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0 text-lg">›</span>
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-700 shrink-0">
                    {(['profile', 'games'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === tab
                                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/30'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            {tab === 'profile' ? '👤 Perfil' : '📂 Mis Partidos'}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="overflow-y-auto flex-grow">
                    {activeTab === 'profile' && (
                        <div className="p-5 space-y-5">
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

                            {role === 'jugador' && (
                                <div className="p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-lg">
                                    <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-2">Tu número de jugador 🏐</label>
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

                            {canAccessAdminPanel && (
                                <button
                                    onClick={() => { navigate('/admin'); onClose(); }}
                                    className="w-full py-2 bg-red-900/20 border border-red-900/50 text-red-400 hover:text-white hover:bg-red-900/50 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors"
                                >
                                    🛡️ Ir al Panel Admin {isOwner ? '(Owner)' : ''}
                                </button>
                            )}

                            <div className="border-t border-slate-800 pt-3">
                                <button onClick={onLogout} className="w-full py-2 text-sm text-red-400 hover:text-red-300 font-semibold hover:bg-red-900/10 rounded-lg transition-colors">
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
                                        <div key={game.id} className="flex items-center justify-between bg-slate-800 hover:bg-slate-700/80 rounded-xl px-4 py-3 transition-colors gap-2">
                                            <div className="flex-grow min-w-0">
                                                <p className="font-bold text-white text-sm truncate">
                                                    {game.settings?.gameName || game.opponent_name || 'Partido sin nombre'}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {getGameModeLabel(game.game_mode)} · {formatDate(game.created_at)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {/* Share / Copy Link */}
                                                <button
                                                    onClick={() => handleShareGame(game.id)}
                                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${copiedGameId === game.id
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white'
                                                        }`}
                                                    title="Copiar link del partido"
                                                >
                                                    {copiedGameId === game.id ? '✅ Copiado' : '🔗'}
                                                </button>
                                                {/* Edit */}
                                                <button
                                                    onClick={() => { onLoadGame(game.id, true); onClose(); }}
                                                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-colors"
                                                >
                                                    Editar
                                                </button>
                                            </div>
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
