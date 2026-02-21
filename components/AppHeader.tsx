
import React from 'react';
import { HamburgerIcon } from './icons';
import { GearIcon } from './icons';
import { useNavigate } from 'react-router-dom';
import CloudIndicator from './CloudIndicator';
import { GameMode, GamePeriod } from '../types';
import { PERIOD_NAMES } from '../constants';

interface AppHeaderProps {
    onOpenMobileMenu: () => void;
    onRequestReturnHome: () => void;
    isSetupComplete: boolean;
    gameName?: string;
    gameMode: GameMode;
    isAutoSaving: boolean;
    lastSaved: Date | null;
    gameId: string | null;
    onOpenSettings: () => void;
    isReadOnly: boolean;
    isAdmin?: boolean;
    currentPeriod?: GamePeriod;
    onPeriodChange?: (period: GamePeriod) => void;
    user?: any;
    onLogin?: () => void;
    onSave?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
    onOpenMobileMenu,
    onRequestReturnHome,
    isSetupComplete,
    gameName,
    gameMode,
    isAutoSaving,
    lastSaved,
    gameId,
    onOpenSettings,
    isReadOnly,
    isAdmin,
    currentPeriod,
    onPeriodChange,
    user,
    onLogin,
    onSave
}) => {
    const navigate = useNavigate();
    return (
        <div className="w-full relative z-50">
            {isReadOnly && (
                <div className="w-full bg-amber-600 text-white text-center py-2 px-4 rounded-lg mb-4 font-bold shadow-lg">
                    ⚠️ Modo Lectura: Estás viendo un partido guardado. No se pueden hacer cambios.
                </div>
            )}

            <header className="flex flex-col gap-4 mb-2">
                <div className="flex items-center justify-between gap-4">
                    {/* Left: Hamburger (mobile) or spacer */}
                    <div className="flex-none w-10 md:hidden">
                        <button
                            className="p-2 -ml-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                            onClick={onOpenMobileMenu}
                            aria-label="Abrir menú"
                        >
                            <HamburgerIcon />
                        </button>
                    </div>

                    {/* Center: Hero Logo */}
                    <div className="flex-grow flex justify-center">
                        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tighter whitespace-nowrap">
                            <button
                                onClick={onRequestReturnHome}
                                className="group flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-100 disabled:cursor-default"
                                disabled={!isSetupComplete}
                                title={isSetupComplete ? "Volver a la página de inicio" : ""}
                            >
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 bg-[length:200%_auto] animate-text-shimmer drop-shadow-sm">
                                    Cesto Tracker
                                </span>
                                <span className="text-xl sm:text-2xl group-hover:rotate-12 transition-transform">🏐{'\uFE0F'}</span>
                            </button>
                        </h1>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex-none flex items-center gap-1 sm:gap-2">
                        {user ? (
                            <button
                                onClick={onSave}
                                className={`p-2 rounded-full transition-all duration-300 ${isAutoSaving ? 'text-cyan-400 animate-pulse' : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800'}`}
                                title="Sincronizar ahora"
                                disabled={isAutoSaving}
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </button>
                        ) : (
                            <button
                                onClick={onLogin}
                                className="px-3 py-1 bg-white text-slate-900 rounded-full text-[10px] font-black uppercase tracking-tighter hover:bg-slate-100 transition-all flex items-center gap-1 shadow-lg"
                            >
                                <span className="hidden sm:inline">Guardar</span> ☁️
                            </button>
                        )}

                        {isAdmin && (
                            <button
                                onClick={() => navigate('/admin')}
                                className="p-2 rounded-full text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
                                title="Panel de Administración"
                            >
                                <span className="text-xl">🛡️</span>
                            </button>
                        )}

                        <button
                            onClick={onOpenSettings}
                            className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                            aria-label="Abrir configuración"
                        >
                            <GearIcon className="h-7 w-7" />
                        </button>
                    </div>
                </div>

                {/* Subtitle / Period Selector Row */}
                <div className="flex flex-col items-center gap-1">
                    {gameName && <p className="text-lg font-bold text-white truncate max-w-[90vw]">{gameName}</p>}
                    <div className="flex items-center gap-3">
                        <p className="text-xs sm:text-base text-slate-400 font-medium">
                            {gameMode === 'stats-tally' ? 'Estadísticas y Tanteador' : 'Registro de Tiros y Mapa'}
                        </p>
                    </div>

                    {currentPeriod && onPeriodChange && (
                        <div className="mt-2 inline-block">
                            <select
                                value={currentPeriod}
                                onChange={(e) => onPeriodChange(e.target.value as GamePeriod)}
                                disabled={isReadOnly}
                                className="bg-slate-800 text-cyan-400 font-bold border border-cyan-700/50 rounded-full px-4 py-1.5 text-sm sm:text-base outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer shadow-lg hover:bg-slate-700 transition-colors appearance-none text-center"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2322d3ee' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                            >
                                {Object.entries(PERIOD_NAMES).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Status Row (Cloud Sync Info) */}
                <div className="flex justify-center">
                    <CloudIndicator isSaving={isAutoSaving} lastSaved={lastSaved} gameId={gameId} />
                </div>
            </header>
        </div>
    );
};

export default AppHeader;
