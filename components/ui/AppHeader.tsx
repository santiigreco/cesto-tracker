import React from 'react';
import { HamburgerIcon, GearIcon } from '../icons';
import { useNavigate } from 'react-router-dom';
import CloudIndicator from '@/components/ui/CloudIndicator';
import { GameMode, GamePeriod } from '../../types';
import { PERIOD_NAMES } from '../../constants';
import { SyncStatus } from '../../context/SyncContext';

interface AppHeaderProps {
    onOpenMobileMenu: () => void;
    onRequestReturnHome: () => void;
    isSetupComplete: boolean;
    gameName?: string;
    myTeam?: string;
    gameMode: GameMode;
    isAutoSaving: boolean;
    lastSaved: Date | null;
    gameId: string | null;
    syncStatus?: SyncStatus;
    hasUnsavedChanges?: boolean;
    isOnline?: boolean;
    onOpenSettings: () => void;
    isReadOnly: boolean;
    isAdmin?: boolean;
    currentPeriod?: GamePeriod;
    onPeriodChange?: (period: GamePeriod) => void;
    user?: any;
    userAvatarUrl?: string | null;
    userInitial?: string;
    onLogin?: () => void;
    onSave?: () => void;
    onOpenProfile?: () => void;
    activeTab?: string;
}

const AppHeader: React.FC<AppHeaderProps> = React.memo(({
    onOpenMobileMenu,
    onRequestReturnHome,
    isSetupComplete,
    gameName,
    myTeam,
    isAutoSaving,
    lastSaved,
    gameId,
    syncStatus,
    hasUnsavedChanges,
    isOnline,
    onOpenSettings,
    isReadOnly,
    isAdmin,
    currentPeriod,
    onPeriodChange,
    user,
    userAvatarUrl,
    userInitial,
    onLogin,
    onSave,
    onOpenProfile,
    activeTab
}) => {
    const navigate = useNavigate();
    return (
        <div className="w-full relative z-20">
            {isReadOnly && (
                <div className="w-full bg-amber-600 text-white text-center py-2 px-4 rounded-lg mb-3 font-bold shadow-lg text-xs sm:text-sm">
                    ⚠️ Modo Lectura: Estás viendo un partido guardado. No se pueden hacer cambios.
                </div>
            )}

            <header className="flex flex-col gap-2.5 sm:gap-4 mb-2">
                <div className="flex items-center justify-between gap-1.5 sm:gap-4 w-full">
                    {/* Left: Hamburger (mobile) */}
                    <div className="flex-none flex items-center md:hidden">
                        <button
                            type="button"
                            className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors touch-manipulation"
                            onClick={onOpenMobileMenu}
                            aria-label="Abrir menú"
                        >
                            <HamburgerIcon />
                        </button>
                    </div>

                    {/* Center: Brand */}
                    <div className="flex-1 min-w-0 flex justify-center">
                        <h1 className="text-base xs:text-lg sm:text-3xl font-extrabold tracking-tighter truncate max-w-[150px] xs:max-w-[200px] sm:max-w-none">
                            <button
                                type="button"
                                onClick={onRequestReturnHome}
                                className="group flex items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-100 disabled:cursor-default truncate"
                                disabled={!isSetupComplete}
                                title={isSetupComplete ? "Volver a la página de inicio" : ""}
                            >
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 truncate">
                                    Cesto Tracker
                                </span>
                                <span className="text-base sm:text-2xl group-hover:rotate-12 transition-transform shrink-0">🏐{'\uFE0F'}</span>
                            </button>
                        </h1>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex-none flex items-center gap-0.5 sm:gap-2 shrink-0">
                        {user ? (
                            <>
                                {/* Cloud Save */}
                                <button
                                    type="button"
                                    onClick={onSave}
                                    className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-all duration-300 touch-manipulation ${isAutoSaving ? 'text-cyan-400 animate-pulse' : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800'}`}
                                    title="Sincronizar ahora"
                                    aria-label="Sincronizar ahora"
                                    disabled={isAutoSaving}
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </button>
                                {/* User Avatar — Profile access */}
                                <button
                                    type="button"
                                    onClick={onOpenProfile}
                                    className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-emerald-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm uppercase shadow-md hover:scale-105 active:scale-95 transition-transform overflow-hidden border border-slate-700 hover:border-cyan-400 shrink-0 touch-manipulation"
                                    title="Ver perfil"
                                    aria-label="Ver perfil"
                                >
                                    {userAvatarUrl
                                        ? <img src={userAvatarUrl} alt="avatar" loading="lazy" decoding="async" width={40} height={40} className="w-full h-full object-cover" />
                                        : (userInitial || user.email?.charAt(0) || 'U')
                                    }
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={onLogin}
                                className="min-h-[40px] px-2.5 sm:px-3 bg-white text-slate-900 rounded-full text-[10px] font-black uppercase tracking-tighter hover:bg-slate-100 transition-all flex items-center gap-1 shadow touch-manipulation"
                                aria-label="Iniciar sesión"
                            >
                                <span className="hidden xs:inline">Ingresar</span> 👤
                            </button>
                        )}

                        {isAdmin && (
                            <button
                                type="button"
                                onClick={() => navigate('/admin')}
                                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors touch-manipulation"
                                title="Panel de Administración"
                                aria-label="Panel de Administración"
                            >
                                <span className="text-base sm:text-xl">🛡️</span>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={onOpenSettings}
                            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors touch-manipulation"
                            aria-label="Abrir configuración"
                        >
                            <GearIcon className="h-6 w-6 sm:h-7 sm:w-7" />
                        </button>
                    </div>
                </div>

                {/* Subtitle / Period Selector Row */}
                <div className="flex flex-col items-center gap-1 px-1">
                    {gameName && (
                        <p className="text-sm sm:text-lg font-black text-white truncate max-w-[95vw] px-2 text-center tracking-tight">
                            {myTeam ? `${myTeam} vs ${gameName}` : gameName}
                        </p>
                    )}
                    <div className="hidden sm:flex items-center gap-3">
                        <p className="text-xs sm:text-base text-slate-400 font-medium">
                            Planilla Técnica y Estadísticas
                        </p>
                    </div>

                    {currentPeriod && onPeriodChange && activeTab !== 'statistics' && (
                        <div className="mt-1 sm:mt-2 inline-block">
                            <select
                                value={currentPeriod}
                                onChange={(e) => onPeriodChange(e.target.value as GamePeriod)}
                                disabled={isReadOnly}
                                className="bg-slate-800 text-cyan-400 font-bold border border-cyan-700/50 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer shadow-md hover:bg-slate-700 transition-colors appearance-none text-center"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2322d3ee' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em', paddingRight: '2rem' }}
                            >
                                {Object.entries(PERIOD_NAMES).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Status Row (Cloud Sync Info) */}
                <div className="flex justify-center mt-0.5">
                    <CloudIndicator
                        isSaving={isAutoSaving}
                        lastSaved={lastSaved}
                        gameId={gameId}
                        syncStatus={syncStatus}
                        hasUnsavedChanges={hasUnsavedChanges}
                        isOnline={isOnline}
                    />
                </div>
            </header>
        </div>
    );
});

export default AppHeader;
