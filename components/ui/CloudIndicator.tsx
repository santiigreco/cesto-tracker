import React from 'react';
import { SyncStatus } from '../../context/SyncContext';

interface CloudIndicatorProps {
    isSaving: boolean;
    lastSaved: Date | null;
    gameId: string | null;
    syncStatus?: SyncStatus;
    hasUnsavedChanges?: boolean;
    isOnline?: boolean;
    isAuthenticated?: boolean;
}

const CloudIndicator: React.FC<CloudIndicatorProps> = ({
    isSaving,
    lastSaved,
    gameId,
    syncStatus = 'idle',
    hasUnsavedChanges = false,
    isOnline = true,
    isAuthenticated = true,
}) => {
    if (!isOnline) {
        return (
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium bg-amber-950/70 text-amber-300 px-2.5 py-1 rounded-full border border-amber-700/60 animate-fade-in shadow-sm">
                <span>📶</span>
                <span>Modo sin conexión (respaldo local)</span>
            </div>
        );
    }

    if (syncStatus === 'error') {
        return (
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium bg-red-950/70 text-red-300 px-2.5 py-1 rounded-full border border-red-700/60 animate-fade-in shadow-sm">
                <span>⚠️</span>
                <span>Error de sincronización (respaldo local)</span>
            </div>
        );
    }

    if (isSaving) {
        return (
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium bg-slate-800/80 px-2.5 py-1 rounded-full border border-cyan-500/40 animate-fade-in shadow-sm">
                <div className="w-3 h-3 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                <span className="text-cyan-400">Guardando en la nube...</span>
            </div>
        );
    }

    if (hasUnsavedChanges && isAuthenticated) {
        return (
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium bg-slate-800/80 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/40 animate-fade-in shadow-sm">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Cambios pendientes de sincronizar...</span>
            </div>
        );
    }

    if (lastSaved && gameId) {
        return (
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700 animate-fade-in shadow-sm">
                <span className="text-green-400">☁️</span>
                <span className="text-slate-300">
                    Sincronizado {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        );
    }

    return null;
};

export default CloudIndicator;
