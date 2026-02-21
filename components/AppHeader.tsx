
import React from 'react';
import { Menu, Settings } from 'lucide-react';
import CloudIndicator from './CloudIndicator';
import { GameMode } from '../types';

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
    isReadOnly
}) => {
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
                        <Menu />
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
                </div>
                <div className="flex-none w-12 flex justify-end items-center gap-2">
                    <div className="hidden sm:block">
                        <CloudIndicator isSaving={isAutoSaving} lastSaved={lastSaved} gameId={gameId} />
                    </div>
                    <button
                        onClick={onOpenSettings}
                        className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                        aria-label="Abrir configuración"
                    >
                        <Settings className="h-7 w-7" />
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
