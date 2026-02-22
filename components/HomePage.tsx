
import React, { useState } from 'react';
import { RosterPlayer } from '../types';
import { useNavigate } from 'react-router-dom';
import PhoneMockup from './PhoneMockup';
import { FeatureMapIcon } from './icons';
import { FeatureTrophyIcon } from './icons';
import { FeatureTapIcon } from './icons';
import { ChevronDownIcon } from './icons';
import { WhatsappIcon } from './icons';
import { faqData } from './faqData';
import { GoogleIcon } from './icons';
import { UsersIcon } from './icons';
import { CalendarIcon } from './icons';
import UserProfileModal from './UserProfileModal';
import { supabase } from '../utils/supabaseClient';
import { useProfile } from '../hooks/useProfile';
import InstallApp from './InstallApp';
import TeamSelectorModal from './TeamSelectorModal';
import TeamLogo from './TeamLogo';
import { useNextMatch } from '../hooks/useNextMatch';
import { useCommunityStats } from '../hooks/useCommunityStats';

const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.07 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.359 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.359-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.359-2.618-6.78-6.98-6.98C15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" />
    </svg>
);

const CloudDownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 17l-4-4m0 0l4-4m-4 4h12" />
    </svg>
);

const TrendingUpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
);

const TallyMockup = () => (
    <PhoneMockup>
        <div className="flex flex-col h-full bg-slate-800 p-3">
            <div className="bg-slate-900 p-2 rounded mb-3 text-center border border-slate-700">
                <p className="text-xs text-slate-400">Jugador seleccionado</p>
                <p className="text-lg font-bold text-cyan-400">#10</p>
            </div>
            <div className="flex gap-2 h-full">
                <div className="grid grid-cols-2 gap-2 w-2/3">
                    {['Recupero', 'Pérdida', 'Asistencia', 'Rebote', 'Falta', 'Tapa'].map(label => (
                        <div key={label} className="bg-slate-700 rounded flex items-center justify-center text-[10px] font-bold text-slate-300">
                            {label}
                        </div>
                    ))}
                </div>
                <div className="flex flex-col gap-2 w-1/3">
                    <div className="bg-green-600 rounded flex-1 flex flex-col items-center justify-center shadow-lg">
                        <span className="text-xl font-bold text-white">GOL</span>
                    </div>
                    <div className="bg-red-600 rounded flex-1 flex flex-col items-center justify-center shadow-lg">
                        <span className="text-xl font-bold text-white">FALLO</span>
                    </div>
                </div>
            </div>
            <div className="mt-3 bg-slate-900 p-2 rounded border border-slate-700">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Última acción:</span>
                    <span>Hace 2s</span>
                </div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="text-green-400">[GOL]</span> #10
                </div>
            </div>
        </div>
    </PhoneMockup>
);


// ── Next Match / Last Game Widget ──────────────────────────────────────
const NextMatchWidget: React.FC<{
    user: HomePageProps['user'];
    onFixtureClick: () => void;
    onLoadGameClick: () => void;
    onLoadGame: (id: string) => void;
}> = ({ user, onFixtureClick, onLoadGameClick, onLoadGame }) => {
    const { nextMatch, lastGame, loading } = useNextMatch(user?.id);

    if (loading) {
        return (
            <div className="h-20 rounded-2xl bg-slate-800/50 border border-slate-700/50 animate-pulse" />
        );
    }

    // ── Próximo partido del fixture ──
    if (nextMatch) {
        const matchDate = new Date(`${nextMatch.date}T00:00:00`);
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const diffDays = Math.round((matchDate.getTime() - today.getTime()) / 86_400_000);

        const hasScore = nextMatch.scoreHome !== '' && nextMatch.scoreAway !== '';
        const isFinished = hasScore || nextMatch.status === 'finished';
        const isToday = diffDays === 0;
        const isTomorrow = diffDays === 1;

        const dayLabel = isToday ? '🔴 Hoy'
            : isTomorrow ? '📅 Mañana'
                : `📅 ${matchDate.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}`;

        return (
            <button
                onClick={onFixtureClick}
                className="group w-full text-left bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 hover:border-cyan-500/50 rounded-[2rem] p-5 transition-all duration-300 backdrop-blur-md shadow-xl overflow-hidden relative"
            >
                <div className="absolute top-0 right-10 w-20 h-20 bg-cyan-500/5 blur-2xl rounded-full"></div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        {isToday && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping"></span>}
                        <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${isToday ? 'text-red-400' : 'text-slate-500'}`}>
                            {isFinished ? 'Finalizado' : `${dayLabel} • ${nextMatch.time}hs`}
                        </span>
                    </div>
                    {nextMatch.round && (
                        <span className="text-[10px] text-slate-500 font-bold bg-slate-900/50 px-2 py-0.5 rounded-full border border-slate-700/50">{nextMatch.round}</span>
                    )}
                </div>

                <div className="flex items-center justify-between gap-4 py-2">
                    {/* Local */}
                    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                        <TeamLogo teamName={nextMatch.homeTeam} className="h-12 w-12 flex-shrink-0 drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-xs font-black text-slate-200 truncate w-full text-center uppercase tracking-tighter">
                            {nextMatch.homeTeam}
                        </span>
                    </div>

                    {/* Score / vs */}
                    <div className="flex-shrink-0 flex flex-col items-center justify-center">
                        {isFinished ? (
                            <div className="flex items-center gap-2">
                                <span className="text-3xl font-black text-white px-2">
                                    {nextMatch.scoreHome}
                                </span>
                                <span className="text-slate-700 font-black">:</span>
                                <span className="text-3xl font-black text-white px-2">
                                    {nextMatch.scoreAway}
                                </span>
                            </div>
                        ) : (
                            <div className="bg-slate-900/80 px-4 py-1.5 rounded-2xl border border-slate-700 font-black text-[10px] text-slate-500 tracking-[0.3em]">VS</div>
                        )}
                    </div>

                    {/* Visitante */}
                    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                        <TeamLogo teamName={nextMatch.awayTeam} className="h-12 w-12 flex-shrink-0 drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-xs font-black text-slate-200 truncate w-full text-center uppercase tracking-tighter">
                            {nextMatch.awayTeam}
                        </span>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-700/30">
                    <span className="text-[10px] text-slate-600 font-bold tracking-wider truncate max-w-[70%]">{nextMatch.tournament}</span>
                    <span className="text-[10px] text-cyan-400 font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                        Fixture →
                    </span>
                </div>
            </button>
        );
    }

    // ── Último partido guardado del usuario (fallback) ──
    if (lastGame && user) {
        const relDate = new Date(lastGame.createdAt).toLocaleDateString('es-AR', {
            day: 'numeric', month: 'short'
        });
        return (
            <button
                onClick={() => onLoadGame(lastGame.id)}
                className="group w-full text-left bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 rounded-2xl p-4 transition-all duration-200"
            >
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                        🕐 Último partido guardado
                    </span>
                    <span className="text-[10px] text-slate-600">{relDate}</span>
                </div>
                <div className="flex items-center gap-3">
                    <TeamLogo teamName={lastGame.myTeam} className="h-8 w-8 flex-shrink-0" />
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{lastGame.gameName}</p>
                        <p className="text-xs text-slate-500">{lastGame.myTeam || 'Sin equipo'}</p>
                    </div>
                    <span className="ml-auto text-[10px] text-emerald-400 font-bold group-hover:text-emerald-300">
                        Retomar →
                    </span>
                </div>
            </button>
        );
    }

    return null; // No data yet
};

interface HomePageProps {
    onStart: (teamName?: string, roster?: RosterPlayer[]) => void;
    onLoadGameClick: () => void;
    onManageTeamsClick: () => void;
    user?: any;
    onLogin?: () => void;
    onLoadGame: (gameId: string, asOwner: boolean) => void;
}

const HomePage: React.FC<HomePageProps> = React.memo(({ onStart, onLoadGameClick, onManageTeamsClick, user, onLogin, onLoadGame }) => {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // New state for direct team selection flow
    const [isTeamSelectorOpen, setIsTeamSelectorOpen] = useState(false);
    const communityStats = useCommunityStats();
    const { profile } = useProfile();
    // Permissions: use DB-sourced is_admin
    const isOwner = user && profile?.is_admin === true;
    const canEditFixture = isOwner || profile?.permission_role === 'admin' || profile?.permission_role === 'fixture_manager';

    const handleLogout = async () => {
        await (supabase.auth as any).signOut();
        setIsProfileOpen(false);
    };

    const handleFixtureClick = () => {
        navigate('/fixture');
    };

    const handleStartClick = () => {
        setIsTeamSelectorOpen(true);
    };

    const handleTeamSelected = (name: string, roster?: RosterPlayer[]) => {
        setIsTeamSelectorOpen(false);
        onStart(name, roster);
    };

    const handleCloseTeamSelector = () => {
        setIsTeamSelectorOpen(false);
        // If the user closes the modal without selecting, default to their favorite club if available.
        onStart(profile?.favorite_club || undefined);
    };

    // --- ANIMATIONS & STYLES ---
    const gridItemClass = "flex flex-col items-center justify-center gap-2 p-5 rounded-3xl bg-slate-800/40 border border-slate-700/50 hover:border-cyan-500/40 hover:bg-slate-800/60 backdrop-blur-md transition-all duration-300 group active:scale-95 cursor-pointer shadow-xl relative overflow-hidden";
    const iconContainerClass = "p-4 bg-slate-950/50 rounded-2xl group-hover:bg-slate-900/50 transition-all duration-300 ring-1 ring-slate-800 group-hover:ring-cyan-500/30";
    const labelClass = "text-sm font-black text-slate-400 group-hover:text-white tracking-wide uppercase transition-colors";

    return (
        <div className="min-h-screen bg-[#0a0f18] text-slate-200 flex flex-col font-sans overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">

            {/* ── Background Glows ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
                <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-emerald-500/10 blur-[120px] rounded-full animate-float"></div>
                <div className="absolute top-[30%] right-[10%] w-[20%] h-[20%] bg-purple-500/5 blur-[100px] rounded-full"></div>
            </div>

            {/* Navbar */}
            <nav className="sticky top-0 z-50 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🏐</span>
                    <h1 className="font-extrabold text-lg tracking-tight text-white">Cesto Tracker</h1>
                </div>
                <div className="flex items-center gap-3">
                    {canEditFixture && (
                        <button
                            onClick={() => navigate('/admin')}
                            className="hidden sm:flex items-center gap-2 bg-red-900/20 border border-red-900/50 text-red-500 hover:text-white hover:bg-red-600 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all"
                        >
                            <span>🛡️ Panel Admin</span>
                        </button>
                    )}
                    {user ? (
                        <div
                            onClick={() => setIsProfileOpen(true)}
                            className="flex items-center gap-3 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 cursor-pointer hover:bg-slate-750 transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold uppercase overflow-hidden relative ring-2 ring-transparent group-hover:ring-cyan-400 transition-all">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    user.email?.charAt(0) || 'U'
                                )}
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={onLogin}
                            className="flex items-center gap-2 bg-white text-slate-900 hover:bg-gray-100 font-bold px-4 py-2 rounded-full text-sm transition-transform hover:scale-105"
                        >
                            <GoogleIcon className="h-4 w-4" />
                            <span>Ingresar</span>
                        </button>
                    )}
                </div>
            </nav>

            <main className="flex-grow flex flex-col relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-20">

                    {/* LEFT COLUMN: User Dashboard / CTA */}
                    <div className="flex-1 w-full max-w-lg mx-auto lg:mx-0 flex flex-col gap-8">

                        {/* Welcome Header */}
                        <div className="text-center lg:text-left space-y-4">
                            {user && profile && (
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-2">
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                                    <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">En línea</span>
                                    <span className="text-slate-500 px-1">•</span>
                                    <span className="text-xs font-bold text-slate-300">{profile.full_name || user.email?.split('@')[0]}</span>
                                </div>
                            )}
                            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.8] lg:leading-[0.8]">
                                El Cestoball, <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 bg-[length:200%_auto] animate-text-shimmer">
                                    transformado en datos.
                                </span>
                            </h1>
                            <p className="text-lg sm:text-xl text-slate-400 max-w-md mx-auto lg:mx-0 pt-4 leading-relaxed font-medium">
                                Estadísticas en vivo, mapas de calor y gestión profesional. <br className="hidden sm:block" />
                                <span className="text-slate-200">Creado por y para la comunidad del Cesto.</span>
                            </p>

                            {/* ── Option C: Animated counters ── */}
                            {communityStats.totalGames !== null && communityStats.totalGames > 0 && (
                                <div className="flex flex-wrap gap-3 pt-2 justify-center lg:justify-start">
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                                        <span className="text-xl font-black text-cyan-400 tabular-nums">
                                            {communityStats.totalGames.toLocaleString('es-AR')}
                                        </span>
                                        <span className="text-xs text-slate-400 font-bold">partidos registrados 🏐</span>
                                    </div>
                                    {communityStats.topTeams.length > 0 && (
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                            <span className="text-xl font-black text-emerald-400">{communityStats.topTeams.length}</span>
                                            <span className="text-xs text-slate-400 font-bold">equipos activos esta semana</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Option B: Latest registered game ── */}
                            {communityStats.latestGame && (
                                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-800/40 border border-slate-700/40 max-w-sm mx-auto lg:mx-0">
                                    <span className="text-slate-500 shrink-0 text-xs">⚡ Último registro</span>
                                    <TeamLogo teamName={communityStats.latestGame.myTeam} className="h-6 w-6 shrink-0" />
                                    <span className="text-sm font-bold text-slate-300 truncate">
                                        {communityStats.latestGame.myTeam}
                                        <span className="text-slate-500 font-normal"> vs </span>
                                        {communityStats.latestGame.opponentName}
                                    </span>
                                    <span className="text-[10px] text-slate-600 shrink-0 ml-auto">
                                        {(() => {
                                            const d = new Date(communityStats.latestGame.createdAt);
                                            const diffH = Math.round((Date.now() - d.getTime()) / 3_600_000);
                                            return diffH < 1 ? 'hace menos de 1h' : diffH < 24 ? `hace ${diffH}h` : `hace ${Math.round(diffH / 24)}d`;
                                        })()}
                                    </span>
                                </div>
                            )}

                            {/* ── Option D: Top teams this week ── */}
                            {communityStats.topTeams.length > 0 && (
                                <div className="space-y-2 max-w-sm mx-auto lg:mx-0">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">🏆 Equipo más activo esta semana</p>
                                    {communityStats.topTeams.map((team, idx) => (
                                        <div key={team.teamName} className="flex items-center gap-3">
                                            <span className="text-sm w-5 shrink-0 text-center">
                                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                                            </span>
                                            <TeamLogo teamName={team.teamName} className="h-6 w-6 shrink-0" />
                                            <span className="text-sm font-bold text-slate-300 flex-grow truncate">{team.teamName}</span>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <div
                                                    className="h-1.5 bg-cyan-500/50 rounded-full"
                                                    style={{ width: `${Math.max(24, (team.gameCount / communityStats.topTeams[0].gameCount) * 64)}px` }}
                                                />
                                                <span className="text-[10px] text-slate-500 font-bold w-12 text-right">
                                                    {team.gameCount} {team.gameCount === 1 ? 'partido' : 'partidos'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>{/* end Welcome Header */}

                        {/* ── Next Match / Last Game Widget ── */}
                        <NextMatchWidget
                            user={user}
                            onFixtureClick={handleFixtureClick}
                            onLoadGameClick={onLoadGameClick}
                            onLoadGame={(id) => onLoadGame(id, true)}
                        />

                        {/* --- NEW STRIKING ACTION CENTER --- */}
                        <div className="w-full grid grid-cols-6 gap-3 sm:gap-4 mt-4">
                            <div className="col-span-6 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 mb-2 shadow-sm pointer-events-none">
                                <div className="flex-shrink-0 w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                    <CloudDownloadIcon className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div className="flex-grow">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Reporte para la Federación</h4>
                                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-[8px] font-bold text-emerald-300 uppercase">Oficial</span>
                                    </div>
                                    <p className="text-xs text-slate-300 font-medium leading-tight">
                                        Genera automáticamente la planilla de estadísticas para enviar a la Federación.
                                    </p>
                                </div>
                            </div>

                            {/* NEW MATCH CARD (MAIN CTA) */}
                            <div
                                onClick={handleStartClick}
                                className="col-span-6 group relative h-40 rounded-[2.5rem] bg-slate-900 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-500 cursor-pointer overflow-hidden shadow-2xl"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-cyan-500/10 blur-3xl group-hover:bg-cyan-500/20 transition-all duration-500"></div>

                                <div className="relative h-full flex flex-col justify-center px-8">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 bg-cyan-500 rounded-2xl shadow-lg shadow-cyan-500/30 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                            <FeatureTapIcon className="h-8 w-8 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Empezar Partido</h3>
                                            <p className="text-cyan-400/80 text-xs font-bold uppercase tracking-widest">Planilla digital en vivo</p>
                                        </div>
                                    </div>
                                    <p className="text-slate-400 text-sm max-w-[240px] leading-snug">Planifica, registra y analiza cada jugada con herramientas profesionales.</p>
                                </div>
                                <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500">
                                    <svg className="h-12 w-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>

                            {/* FIXTURE CARD (MEDIUM) */}
                            <div
                                onClick={handleFixtureClick}
                                className="col-span-3 sm:col-span-3 group relative h-48 rounded-[2rem] bg-slate-800/40 border border-slate-700/50 hover:border-yellow-500/50 transition-all duration-500 cursor-pointer overflow-hidden backdrop-blur-md"
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/5 to-transparent" />
                                <div className="p-6 flex flex-col h-full">
                                    <div className="p-3 bg-slate-900 rounded-xl w-fit mb-auto group-hover:scale-110 transition-transform">
                                        <CalendarIcon className="h-6 w-6 text-yellow-500" />
                                    </div>
                                    <h4 className="text-lg font-black text-white mb-1 uppercase tracking-tighter">Fixture</h4>
                                    <p className="text-slate-500 text-[10px] uppercase font-black leading-none">Calendario de juegos</p>
                                </div>
                            </div>

                            {/* STANDINGS CARD (MEDIUM) */}
                            <div
                                onClick={() => navigate('/standings')}
                                className="col-span-3 sm:col-span-3 group relative h-48 rounded-[2rem] bg-slate-800/40 border border-slate-700/50 hover:border-cyan-400/50 transition-all duration-500 cursor-pointer overflow-hidden backdrop-blur-md"
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-cyan-400/5 to-transparent" />
                                <div className="p-6 flex flex-col h-full">
                                    <div className="p-3 bg-slate-900 rounded-xl w-fit mb-auto group-hover:scale-110 transition-transform">
                                        <span className="text-2xl">🏆</span>
                                    </div>
                                    <h4 className="text-lg font-black text-white mb-1 uppercase tracking-tighter">Tabla</h4>
                                    <p className="text-slate-500 text-[10px] uppercase font-black leading-none">Posiciones & Playoffs</p>
                                </div>
                            </div>

                            {/* TEAMS CARD (SMALL) */}
                            <div
                                onClick={user ? onManageTeamsClick : onLogin}
                                className="col-span-3 group relative h-32 rounded-[2rem] bg-slate-800/40 border border-slate-700/50 hover:border-blue-400/50 transition-all duration-500 cursor-pointer overflow-hidden backdrop-blur-md"
                            >
                                <div className="p-5 flex items-center gap-4 h-full">
                                    <div className="p-3 bg-slate-900 rounded-xl group-hover:bg-blue-500/10 transition-colors">
                                        <UsersIcon className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h5 className="font-black text-white uppercase tracking-tighter">Equipos</h5>
                                        {!user && <span className="text-[9px] text-slate-600 block flex items-center gap-1 font-bold"><LockIcon className="h-2 w-2" /> REQUERIDO</span>}
                                    </div>
                                </div>
                            </div>

                            {/* HISTORY CARD (SMALL) */}
                            <div
                                onClick={user ? onLoadGameClick : onLogin}
                                className="col-span-3 group relative h-32 rounded-[2rem] bg-slate-800/40 border border-slate-700/50 hover:border-emerald-400/50 transition-all duration-500 cursor-pointer overflow-hidden backdrop-blur-md"
                            >
                                <div className="p-5 flex items-center gap-4 h-full">
                                    <div className="p-3 bg-slate-900 rounded-xl group-hover:bg-emerald-500/10 transition-colors">
                                        <CloudDownloadIcon className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h5 className="font-black text-white uppercase tracking-tighter">Historial</h5>
                                        {!user && <span className="text-[9px] text-slate-600 block flex items-center gap-1 font-bold"><LockIcon className="h-2 w-2" /> REQUERIDO</span>}
                                    </div>
                                </div>
                            </div>

                            {/* PWA INSTALL (SMALL / WIDE) */}
                            <div className="col-span-6">
                                <InstallApp variant="card" />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Visuals (Desktop only or stacked below) */}
                    <div className="flex-1 w-full flex flex-col items-center lg:items-end mt-8 lg:mt-0 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-cyan-500/10 to-emerald-500/10 blur-[80px] rounded-full pointer-events-none"></div>

                        {/* This section disappears on small screens to prioritize the dashboard grid */}
                        <div className="hidden lg:block relative transition-transform duration-500 ease-out hover:scale-105 cursor-pointer">
                            <TallyMockup />
                            <div className="absolute -right-12 top-20 bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl border border-slate-600/50 shadow-2xl flex items-center gap-3 animate-float" style={{ animationDelay: '1s' }}>
                                <div className="bg-green-500/20 p-2 rounded-xl">
                                    <TrendingUpIcon className="h-6 w-6 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Efectividad</p>
                                    <p className="text-xl font-bold text-white leading-none">+85%</p>
                                </div>
                            </div>
                        </div>

                        {/* Mobile PWA Text */}
                        <div className="lg:hidden mt-8 w-full bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl text-center backdrop-blur-sm">
                            <p className="text-slate-200 font-bold text-lg mb-1">Planilla digital y mapa de calor en tu bolsillo.</p>
                            <p className="text-cyan-400 text-sm font-medium">PWA · Sin instalar desde la tienda.</p>
                        </div>
                    </div>
                </div>

                {/* FEATURE HIGHLIGHTS */}
                <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="group bg-slate-900/40 p-10 rounded-[2.5rem] border border-slate-800/50 flex flex-col items-center text-center transition-all duration-500 hover:bg-slate-800/40 hover:-translate-y-2">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-6 ring-1 ring-emerald-500/20 group-hover:ring-emerald-500/40 transition-all duration-500">
                            <FeatureTapIcon className="h-8 w-8 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-4 tracking-tight">Experiencia Fluida</h3>
                        <p className="text-slate-400 leading-relaxed">Interfaz optimizada para un registro táctil veloz sin despegar la vista de la jugada.</p>
                    </div>

                    <div className="group bg-slate-900/40 p-10 rounded-[2.5rem] border border-slate-800/50 flex flex-col items-center text-center transition-all duration-500 hover:bg-slate-800/40 hover:-translate-y-2">
                        <div className="w-16 h-16 bg-cyan-500/10 rounded-3xl flex items-center justify-center mb-6 ring-1 ring-cyan-500/20 group-hover:ring-cyan-500/40 transition-all duration-500">
                            <span className="text-3xl">🏆</span>
                        </div>
                        <h3 className="text-xl font-black text-white mb-4 tracking-tight">Reportes de Elite</h3>
                        <p className="text-slate-400 leading-relaxed">Genera automáticamente el <strong>Excel oficial para la Federación</strong> y resúmenes visuales listos para compartir.</p>
                    </div>

                    <div className="group bg-slate-900/40 p-10 rounded-[2.5rem] border border-slate-800/50 flex flex-col items-center text-center transition-all duration-500 hover:bg-slate-800/40 hover:-translate-y-2">
                        <div className="w-16 h-16 bg-purple-500/10 rounded-3xl flex items-center justify-center mb-6 ring-1 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all duration-500">
                            <FeatureMapIcon className="h-8 w-8 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-4 tracking-tight">Foco Táctico</h3>
                        <p className="text-slate-400 leading-relaxed">Entiende el flujo de tu equipo con mapas de calor y zonas de efectividad precisas.</p>
                    </div>
                </div>

                {/* FAQ SECTION */}
                <section className="mt-24 max-w-3xl mx-auto w-full px-4">
                    <h2 className="text-2xl font-black text-white mb-8 text-center uppercase tracking-tight">Preguntas Frecuentes</h2>
                    <div className="space-y-3">
                        {faqData.slice(0, 5).map((faq, index) => (
                            <div key={index} className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden transition-all hover:border-slate-600">
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full flex justify-between items-center text-left p-4 font-bold text-slate-200 hover:bg-slate-800/50 transition-colors"
                                >
                                    <span className="text-sm">{faq.question}</span>
                                    <ChevronDownIcon className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                                </button>
                                {openFaq === index && (
                                    <div className="px-4 pb-4 text-sm text-slate-400 leading-relaxed border-t border-slate-700/30 pt-3">
                                        <div dangerouslySetInnerHTML={{ __html: faq.answer }}></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 flex flex-col items-center gap-4">
                        <button
                            onClick={() => navigate('/faq')}
                            className="text-cyan-400 hover:text-cyan-300 font-black text-xs uppercase tracking-widest bg-cyan-900/20 border border-cyan-500/20 px-6 py-3 rounded-full transition-all"
                        >
                            Ver FAQ Completa
                        </button>
                        <a
                            href="https://api.whatsapp.com/send/?phone=5491163303194&text=Hola!%20Tengo%20una%20consulta..."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-bold text-xs uppercase tracking-wide"
                        >
                            <WhatsappIcon className="h-4 w-4" />
                            ¿Tenés dudas? Escribinos
                        </a>
                    </div>
                </section>

                {/* HECHO A PULMON SECTION */}
                <section className="mt-32 max-w-2xl mx-auto px-6 text-center">
                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-b from-slate-800/40 to-transparent border border-slate-800/50">
                        <span className="text-4xl mb-4 block">🏐❤️</span>
                        <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tighter">Hecho a pulmón para el Cestoball</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            Cesto Tracker es un proyecto independiente desarrollado para jerarquizar el deporte.
                            Sin sponsors ni publicidades, solo código y pasión. Si te sirve el proyecto, ¡compartilo en tu club!
                        </p>
                        <div className="flex justify-center gap-6">
                            <a href="https://instagram.com/gresolutions" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                                <InstagramIcon className="h-4 w-4" /> Instagram
                            </a>
                            <a href="https://api.whatsapp.com/send/?phone=5491163303194&text=Hola!%20Te%20escribo%20porque%20me%20encant%C3%B3%20la%20app..." target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                                <WhatsappIcon className="h-4 w-4" /> Feedback
                            </a>
                        </div>
                    </div>
                </section>
            </main >

            <footer className="w-full py-12 text-center border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-md">
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Cesto Tracker © 2026</p>
                <p className="text-slate-500 text-[10px] items-center justify-center gap-1 hidden sm:flex">
                    Desarrollado con pasión por <a href="https://instagram.com/gresolutions" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400 transition-colors underline decoration-slate-700 underline-offset-4">Gresolutions</a>
                </p>
            </footer>

            {
                user && (
                    <UserProfileModal
                        isOpen={isProfileOpen}
                        onClose={() => setIsProfileOpen(false)}
                        user={user}
                        onLogout={handleLogout}
                        onLoadGame={onLoadGame}
                    />
                )
            }


            {
                isTeamSelectorOpen && (
                    <TeamSelectorModal
                        isOpen={isTeamSelectorOpen}
                        onClose={handleCloseTeamSelector}
                        onSelectTeam={handleTeamSelected}
                        currentTeam={profile?.favorite_club || ''}
                    />
                )
            }
        </div >
    );
});

export default HomePage;
