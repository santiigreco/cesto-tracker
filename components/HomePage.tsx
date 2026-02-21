
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, CloudDownload, ChevronDown } from 'lucide-react';
import { RosterPlayer } from '../types';
import PhoneMockup from './PhoneMockup';
import { 
    FeatureMapIcon, 
    FeatureTrophyIcon, 
    FeatureTapIcon, 
    InstagramIcon, 
    WhatsappIcon, 
    GoogleIcon, 
    TrendingUpIcon, 
    LockIcon 
} from './Icons';
import { faqData } from './faqData';
import UserProfileModal from './UserProfileModal';
import { supabase } from '../utils/supabaseClient';
import { useProfile } from '../hooks/useProfile';
import { ADMIN_EMAILS } from '../constants';
import FixtureView from './FixtureView';
import InstallApp from './InstallApp';
import TeamSelectorModal from './TeamSelectorModal';
import TeamLogo from './TeamLogo';

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
    const [isFixtureOpen, setIsFixtureOpen] = useState(false);
    
    // New state for direct team selection flow
    const [isTeamSelectorOpen, setIsTeamSelectorOpen] = useState(false);

    const { profile } = useProfile();

    // Permissions Logic: Owner OR Permission='admin' OR Permission='fixture_manager'
    // This is now used only for EDITING privileges, not viewing
    const isOwner = user && ADMIN_EMAILS.map(e => e.toLowerCase()).includes((user.email || '').toLowerCase());
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
    const gridItemClass = "flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-750 transition-all group active:scale-95 cursor-pointer shadow-lg";
    const iconContainerClass = "p-3 bg-slate-900 rounded-full group-hover:bg-slate-800 transition-colors";
    const labelClass = "text-sm font-bold text-slate-300 group-hover:text-white";

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col font-sans overflow-x-hidden bg-pattern-hoops selection:bg-cyan-500 selection:text-white">
             
             {/* Navbar */}
             <nav className="sticky top-0 z-50 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🏐</span>
                    <h1 className="font-extrabold text-lg tracking-tight text-white">Cesto Tracker</h1>
                </div>
                <div>
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
                        <div className="text-center lg:text-left space-y-2">
                            {user && profile && (
                                <h2 className="text-2xl font-medium text-slate-400">Hola, <span className="text-white font-bold">{profile.full_name || user.email?.split('@')[0]}</span> 👋</h2>
                            )}
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-none">
                                Domina la cancha <br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">con datos reales.</span>
                            </h1>
                            <p className="text-lg text-slate-400 max-w-md mx-auto lg:mx-0 pt-2">
                                La app definitiva para el <strong>Cestoball</strong>. Planilla digital, estadísticas en vivo y gestión de equipos.
                            </p>
                        </div>

                        {/* How it works steps */}
                        <div className="flex flex-row justify-between items-start gap-2 pt-4 pb-2 px-1">
                            {[
                                { step: 1, text: "Elegí equipo" },
                                { step: 2, text: "Marcá tiros y estadísticas" },
                                { step: 3, text: "Analizá y compartí" }
                            ].map((item) => (
                                <div key={item.step} className="flex flex-col items-center text-center gap-2 flex-1">
                                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-sm border border-cyan-500/30">
                                        {item.step}
                                    </div>
                                    <p className="text-xs text-slate-400 leading-tight font-medium max-w-[100px]">{item.text}</p>
                                </div>
                            ))}
                        </div>

                        {/* --- BENTO GRID ACTION CENTER --- */}
                        <div className="w-full bg-slate-800/30 p-4 rounded-3xl border border-slate-700/50 backdrop-blur-sm">
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                {/* Primary Action: New Game (Full Width) */}
                                <button
                                    onClick={handleStartClick}
                                    className="col-span-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold py-5 px-6 rounded-2xl shadow-lg shadow-cyan-900/20 transform transition-all hover:scale-[1.02] flex items-center justify-center gap-3 group"
                                >
                                    <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition-colors">
                                        <FeatureTapIcon className="h-6 w-6" />
                                    </div>
                                    <span className="text-xl tracking-tight">Empezar Partido</span>
                                </button>

                                {/* Secondary Actions Grid */}
                                <button
                                    onClick={user ? onLoadGameClick : onLogin}
                                    className={gridItemClass}
                                >
                                    <div className={iconContainerClass}>
                                        <CloudDownload className="h-6 w-6 text-slate-400 group-hover:text-emerald-400" />
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className={labelClass}>Historial</span>
                                        {!user && <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1"><LockIcon className="h-3 w-3"/> Login</span>}
                                    </div>
                                </button>

                                <button
                                    onClick={user ? onManageTeamsClick : onLogin}
                                    className={gridItemClass}
                                >
                                    <div className={iconContainerClass}>
                                        <Users className="h-6 w-6 text-slate-400 group-hover:text-blue-400" />
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className={labelClass}>Mis Equipos</span>
                                        {!user && <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1"><LockIcon className="h-3 w-3"/> Login</span>}
                                    </div>
                                </button>

                                <button
                                    onClick={handleFixtureClick}
                                    className={gridItemClass}
                                >
                                    <div className={iconContainerClass}>
                                        <Calendar className="h-6 w-6 text-slate-400 group-hover:text-yellow-400" />
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className={labelClass}>Fixture</span>
                                    </div>
                                </button>

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
                                    <TrendingUpIcon className="h-6 w-6 text-green-400"/>
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

                {/* FEATURE HIGHLIGHTS (Mini) */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-80">
                    <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 flex flex-col items-center text-center">
                        <FeatureTapIcon className="h-10 w-10 text-emerald-400 mb-3" />
                        <h3 className="font-bold text-white mb-2">Fácil de usar</h3>
                        <p className="text-sm text-slate-400">Interfaz diseñada con botones grandes para no perder detalle del juego.</p>
                    </div>
                    <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 flex flex-col items-center text-center">
                        <FeatureTrophyIcon className="h-10 w-10 text-amber-400 mb-3" />
                        <h3 className="font-bold text-white mb-2">Reportes Pro</h3>
                        <p className="text-sm text-slate-400">Genera imágenes con las estadísticas listas para compartir en WhatsApp.</p>
                    </div>
                    <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 flex flex-col items-center text-center">
                        <FeatureMapIcon className="h-10 w-10 text-purple-400 mb-3" />
                        <h3 className="font-bold text-white mb-2">Análisis Táctico</h3>
                        <p className="text-sm text-slate-400">Mapas de calor y gráficos de zonas para entender dónde tira tu equipo.</p>
                    </div>
                </div>

                {/* FAQ SECTION */}
                <section className="mt-24 max-w-3xl mx-auto w-full">
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">Preguntas Frecuentes</h2>
                    <div className="space-y-3">
                        {faqData.slice(0, 4).map((faq, index) => (
                            <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full flex justify-between items-center text-left p-4 font-medium text-slate-200 hover:bg-slate-800 transition-colors"
                                >
                                    <span>{faq.question}</span>
                                    <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                                </button>
                                {openFaq === index && (
                                    <div className="p-4 pt-0 text-sm text-slate-400 border-t border-slate-700/50 mt-2">
                                        <div dangerouslySetInnerHTML={{ __html: faq.answer }}></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 text-center">
                        <a
                           href="https://api.whatsapp.com/send/?phone=5491163303194&text=Hola!%20Tengo%20una%20consulta..."
                           target="_blank"
                           rel="noopener noreferrer"
                           className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-semibold text-sm"
                        >
                            <WhatsappIcon className="h-4 w-4" />
                            Tienes dudas? Escríbeme
                        </a>
                     </div>
                </section>
            </main>

             <footer className="w-full py-8 text-center text-slate-600 text-xs border-t border-slate-800 bg-slate-950">
                <div className="flex justify-center gap-4 mb-3">
                     <a href="https://instagram.com/gresolutions" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors" aria-label="Instagram"><InstagramIcon className="h-5 w-5"/></a>
                </div>
                <p>Santiago Greco - Gresolutions © 2026</p>
            </footer>

            {user && (
                <UserProfileModal 
                    isOpen={isProfileOpen} 
                    onClose={() => setIsProfileOpen(false)} 
                    user={user}
                    onLogout={handleLogout}
                    onLoadGame={onLoadGame}
                />
            )}

            {isTeamSelectorOpen && (
                <TeamSelectorModal 
                    isOpen={isTeamSelectorOpen} 
                    onClose={handleCloseTeamSelector} 
                    onSelectTeam={handleTeamSelected}
                    currentTeam={profile?.favorite_club || ''}
                />
            )}
        </div>
    );
});

export default HomePage;
