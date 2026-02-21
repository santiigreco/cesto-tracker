
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
                            className="h-24 px-2 rounded-lg text-white font-bold text-sm sm:text-base transition-all bg-slate-700 hover:bg-slate-600 flex items-center justify-center shadow-sm active:bg-slate-500 active:scale-95 transform duration-100 border-b-4 border-slate-900/50 active:border-b-0 active:translate-y-1"
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Right Side: Scoring Buttons */}
                <div className="flex flex-col gap-2 w-1/3 min-w-[100px]">
                    <button
                        onClick={() => onActionSelect('triples')}
                        className="flex-1 p-2 rounded-lg text-white font-bold text-sm sm:text-base transition-all bg-blue-600 hover:bg-blue-700 flex items-center justify-center shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 active:scale-95 transform duration-100"
                    >
                        TRIPLE (+3)
                    </button>
                    <button
                        onClick={() => onActionSelect('goles')}
                        className="flex-1 p-3 rounded-lg text-white font-bold text-sm sm:text-base transition-all bg-green-600 hover:bg-green-700 flex items-center justify-center shadow-lg border-b-4 border-green-800 active:border-b-0 active:translate-y-1 active:scale-95 transform duration-100"
                    >
                        GOL
                    </button>
                    <button
                        onClick={() => onActionSelect('fallos')}
                        className="flex-1 p-3 rounded-lg text-white font-bold text-sm sm:text-base transition-all bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-lg border-b-4 border-red-800 active:border-b-0 active:translate-y-1 active:scale-95 transform duration-100"
                    >
                        FALLO
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuickActionsPanel;
