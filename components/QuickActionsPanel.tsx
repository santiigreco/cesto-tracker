
import React from 'react';
import { StatAction } from '../types';

interface QuickActionsPanelProps {
    onActionSelect: (action: StatAction) => void;
}

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({ onActionSelect }) => {
    const mainActions: { action: StatAction, label: string }[] = [
        { action: 'recuperos', label: 'Recupero' },
        { action: 'perdidas', label: 'Pérdida' },
        { action: 'asistencias', label: 'Asistencia' },
        { action: 'faltasPersonales', label: 'Falta' },
        { action: 'reboteOfensivo', label: 'Reb. Of.' },
        { action: 'reboteDefensivo', label: 'Reb. Def.' },
    ];

    return (
        <div className="w-full bg-slate-800 p-4 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-cyan-400 mb-4 text-center">Acción de juego</h3>
            <div className="flex gap-3">
                {/* Left Side: Grid of stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 flex-grow">
                    {mainActions.map(({ action, label }) => (
                        <button
                            key={action}
                            onClick={() => onActionSelect(action)}
                            className="p-3 rounded-lg text-white font-bold text-xs sm:text-sm transition-colors bg-slate-700 hover:bg-slate-600 flex items-center justify-center h-full"
                        >
                            {label}
                        </button>
                    ))}
                </div>
                
                {/* Right Side: Big Scoring Buttons */}
                <div className="flex flex-col gap-2 w-1/3 min-w-[100px]">
                    <button
                        onClick={() => onActionSelect('goles')}
                        className="flex-1 p-3 rounded-lg text-white font-bold text-sm sm:text-base transition-colors bg-green-600 hover:bg-green-700 flex items-center justify-center shadow-lg"
                    >
                        GOL
                    </button>
                    <button
                        onClick={() => onActionSelect('fallos')}
                        className="flex-1 p-3 rounded-lg text-white font-bold text-sm sm:text-base transition-colors bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-lg"
                    >
                        FALLO
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuickActionsPanel;
