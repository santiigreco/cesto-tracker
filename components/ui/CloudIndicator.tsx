
import React from 'react';

interface CloudIndicatorProps {
    isSaving: boolean;
    lastSaved: Date | null;
    gameId: string | null;
}

const CloudIndicator: React.FC<CloudIndicatorProps> = ({ isSaving, lastSaved, gameId }) => {
    if (!gameId) return null;

    return (
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium bg-slate-800/80 px-2 py-1 rounded-full border border-slate-700 animate-fade-in">
            {isSaving ? (
                <>
                    <div className="w-3 h-3 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                    <span className="text-cyan-400">Guardando...</span>
                </>
            ) : lastSaved ? (
                <>
                    <span className="text-green-400">☁️</span>
                    <span className="text-slate-400">
                        Guardado {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </>
            ) : (
                <span className="text-slate-500">Sin guardar cambios</span>
            )}
        </div>
    );
};

export default CloudIndicator;
