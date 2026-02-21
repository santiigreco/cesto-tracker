
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
    onPeriodChange
}) => {
    const navigate = useNavigate();
    return (
        <>
            {isReadOnly && (
                <div className="w-full bg-amber-600 text-white text-center py-2 px-4 rounded-lg mb-4 font-bold shadow-lg">
                    ⚠️ Modo Lectura: Estás viendo un partido guardado. No se pueden hacer cambios.
                </div>
            )}

            <header className="relative flex items-center mb-4">
                <div className="flex-none w-12 md:w-0">
                    <button
                        className="p-2 -ml-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors md:hidden"
                        onClick={onOpenMobileMenu}
                        aria-label="Abrir menú"
                    >
                        <HamburgerIcon />
                    </button>
                </div>
                <div className="flex-grow text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-cyan-400 tracking-tight whitespace-nowrap">
                        <button
                            onClick={onRequestReturnHome}
                            className="transition-opacity hover:opacity-80 disabled:opacity-100 disabled:cursor-default"
                            disabled={!isSetupComplete}
                            title={isSetupComplete ? "Volver a la página de inicio" : ""}
                        >
                            Cesto Tracker 🏐{'\uFE0F'}
                        </button>
                    </h1>
                    {gameName && <p className="text-lg font-semibold text-white -mb-1 mt-1 truncate">{gameName}</p>}
                    <div className="flex justify-center items-center gap-3 mt-1">
                        <p className="text-base text-slate-400">
                            {gameMode === 'stats-tally' ? 'Estadísticas y Tanteador' : 'Registro de Tiros y Mapa'}
                        </p>
                    </div>
                    {currentPeriod && onPeriodChange && (
                        <div className="mt-3 inline-block">
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
                <div className="flex-none w-24 flex justify-end items-center gap-2">
                    {isAdmin && (
                        <button
                            onClick={() => navigate('/admin')}
                            className="p-2 rounded-full text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
                            title="Panel de Administración"
                        >
                            <span className="text-xl">🛡️</span>
                        </button>
                    )}
                    <div className="hidden sm:block">
                        <CloudIndicator isSaving={isAutoSaving} lastSaved={lastSaved} gameId={gameId} />
                    </div>
                    <button
                        onClick={onOpenSettings}
                        className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                        aria-label="Abrir configuración"
                    >
                        <GearIcon className="h-7 w-7" />
                    </button>
                </div>
            </header>

            {/* Mobile visible Cloud Indicator */}
            <div className="sm:hidden flex justify-center mb-4">
                <CloudIndicator isSaving={isAutoSaving} lastSaved={lastSaved} gameId={gameId} />
            </div>
        </>
    );
};

export default AppHeader;
