import React from 'react';
import { StatAction } from '../../types';

interface QuickActionsPanelProps {
    onActionSelect: (action: StatAction) => void;
}

const MAIN_ACTIONS: { action: StatAction, label: string }[] = [
    { action: 'recuperos', label: 'Recupero' },
    { action: 'perdidas', label: 'Pérdida' },
    { action: 'asistencias', label: 'Asistencia' },
    { action: 'faltasPersonales', label: 'Falta' },
    { action: 'reboteOfensivo', label: 'Reb. Of.' },
    { action: 'reboteDefensivo', label: 'Reb. Def.' },
];

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = React.memo(({ onActionSelect }) => {
    return (
        <div className="w-full bg-slate-800 p-3 sm:p-4 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-cyan-400 mb-3 sm:mb-4 text-center">Acción de juego</h3>
            <div className="flex gap-2 sm:gap-3">
                {/* Left Side: Grid of stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 flex-grow">
                    {MAIN_ACTIONS.map(({ action, label }) => (
                        <button
                            key={action}
                            type="button"
                            onClick={() => onActionSelect(action)}
                            className="h-20 sm:h-24 px-1.5 sm:px-2 rounded-lg text-white font-bold text-xs xs:text-sm sm:text-base text-center leading-tight transition-all bg-slate-700 hover:bg-slate-600 flex items-center justify-center shadow-sm active:bg-slate-500 active:scale-95 transform duration-100 border-b-4 border-slate-900/50 active:border-b-0 active:translate-y-1 touch-manipulation"
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Right Side: Scoring Buttons */}
                <div className="flex flex-col gap-2 w-[34%] min-w-[96px] sm:w-1/3 sm:min-w-[110px]">
                    <button
                        type="button"
                        onClick={() => onActionSelect('triples')}
                        className="flex-1 p-2 rounded-lg text-white font-bold text-xs xs:text-sm sm:text-base transition-all bg-blue-600 hover:bg-blue-700 flex items-center justify-center shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 active:scale-95 transform duration-100 touch-manipulation"
                    >
                        <span className="flex flex-col sm:flex-row items-center justify-center sm:gap-1 leading-tight">
                            <span>TRIPLE</span>
                            <span className="text-[11px] sm:text-sm opacity-90">(+3)</span>
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onActionSelect('goles')}
                        className="flex-1 p-3 rounded-lg text-white font-bold text-xs xs:text-sm sm:text-base transition-all bg-green-600 hover:bg-green-700 flex items-center justify-center shadow-lg border-b-4 border-green-800 active:border-b-0 active:translate-y-1 active:scale-95 transform duration-100 touch-manipulation"
                    >
                        GOL
                    </button>
                    <button
                        type="button"
                        onClick={() => onActionSelect('fallos')}
                        className="flex-1 p-3 rounded-lg text-white font-bold text-xs xs:text-sm sm:text-base transition-all bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-lg border-b-4 border-red-800 active:border-b-0 active:translate-y-1 active:scale-95 transform duration-100 touch-manipulation"
                    >
                        FALLO
                    </button>
                </div>
            </div>
        </div>
    );
});

export default QuickActionsPanel;
