
import React from 'react';
import { StatAction } from '../types';
import { handleActionFeedback } from '../utils/haptics';

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

    const handleActionClick = (action: StatAction) => {
        handleActionFeedback(action);
        onActionSelect(action);
    };

    return (
        <div className="w-full bg-slate-800 p-4 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-cyan-400 mb-4 text-center">Acción de juego</h3>
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Left Side: Grid of stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-grow">
                    {mainActions.map(({ action, label }) => (
                        <button
                            key={action}
                            onClick={() => handleActionClick(action)}
                            className="h-20 sm:h-24 px-2 rounded-lg text-white font-bold text-sm sm:text-base transition-all bg-slate-700 hover:bg-slate-600 flex items-center justify-center shadow-sm active:bg-slate-500 active:scale-95 transform duration-100 border-b-4 border-slate-900/50 active:border-b-0 active:translate-y-1"
                        >
                            {label}
                        </button>
                    ))}
                </div>
                
                {/* Right Side: Scoring Buttons - Made Larger */}
                <div className="flex sm:flex-col gap-3 w-full sm:w-1/3 min-w-[120px]">
                    <button
                        onClick={() => handleActionClick('triples')}
                        className="flex-1 py-4 sm:py-6 rounded-xl text-white font-black text-base sm:text-xl transition-all bg-blue-600 hover:bg-blue-700 flex items-center justify-center shadow-lg border-b-[6px] border-blue-800 active:border-b-0 active:translate-y-1.5 active:scale-95 transform duration-100"
                    >
                        TRIPLE (+3)
                    </button>
                    <button
                        onClick={() => handleActionClick('goles')}
                        className="flex-1 py-4 sm:py-6 rounded-xl text-white font-black text-lg sm:text-2xl transition-all bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center shadow-lg border-b-[6px] border-emerald-700 active:border-b-0 active:translate-y-1.5 active:scale-95 transform duration-100"
                    >
                        GOL (+2)
                    </button>
                    <button
                        onClick={() => handleActionClick('fallos')}
                        className="flex-1 py-4 sm:py-6 rounded-xl text-white font-black text-lg sm:text-2xl transition-all bg-rose-600 hover:bg-rose-700 flex items-center justify-center shadow-lg border-b-[6px] border-rose-800 active:border-b-0 active:translate-y-1.5 active:scale-95 transform duration-100"
                    >
                        FALLO
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuickActionsPanel;
