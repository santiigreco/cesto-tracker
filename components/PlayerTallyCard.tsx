
import React from 'react';
import { TallyStatsPeriod, StatAction } from '../types';
import { CheckIcon } from './icons';
import { XIcon } from './icons';

// --- Re-added these icons as they are used internally ---
const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
);

const CompactTallyStat: React.FC<{ label: string; value: number; onIncrement: () => void; readOnly?: boolean }> = React.memo(({ label, value, onIncrement, readOnly }) => (
    <div className="flex flex-col items-center p-2 bg-slate-700/50 rounded-md gap-2">
        <span className="text-xs sm:text-sm text-slate-300 text-center font-semibold">{label}</span>
        <div className="flex items-center gap-3">
            <span className="w-8 text-center text-xl font-bold font-mono text-white">{value}</span>
            {!readOnly && (
                <button
                    onClick={onIncrement}
                    className="w-7 h-7 flex items-center justify-center bg-green-600 hover:bg-green-700 rounded-full text-white font-bold transition-colors"
                    aria-label={`Incrementar ${label}`}
                >
                    <PlusIcon className="w-4 h-4" />
                </button>
            )}
        </div>
    </div>
));

const statLabels: Record<keyof TallyStatsPeriod, string> = {
    goles: 'Goles',
    triples: 'Triples',
    fallos: 'Fallos',
    recuperos: 'Recuperos',
    perdidas: 'Pérdidas',
    reboteOfensivo: 'Reb. Of.',
    reboteDefensivo: 'Reb. Def.',
    asistencias: 'Asist.',
    golesContra: 'G. Contra',
    faltasPersonales: 'Faltas',
};

const PlayerTallyCard: React.FC<{
    playerNumber: string;
    playerName: string;
    isEditing: boolean;
    tempPlayerName: string;
    setTempPlayerName: (name: string) => void;
    onStartEdit: (player: string) => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    playerTally: TallyStatsPeriod;
    onUpdate: (playerNumber: string, stat: StatAction, change: 1) => void;
    isReadOnly?: boolean;
}> = React.memo(({ playerNumber, playerName, isEditing, tempPlayerName, setTempPlayerName, onStartEdit, onSaveEdit, onCancelEdit, playerTally, onUpdate, isReadOnly }) => {
    const isTeamCard = playerNumber === 'Equipo';
    const playerStatsToShow: StatAction[] = ['goles', 'triples', 'fallos', 'recuperos', 'perdidas', 'reboteOfensivo', 'reboteDefensivo', 'asistencias', 'faltasPersonales'];
    const teamStatsToShow: (keyof TallyStatsPeriod)[] = ['recuperos', 'perdidas', 'golesContra'];

    return (
        <div 
            className={`bg-slate-800 p-4 rounded-lg shadow-lg transition-all duration-200`}
        >
            <div className="mb-4" style={{ minHeight: '40px' }}>
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={tempPlayerName}
                            onChange={(e) => setTempPlayerName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') onSaveEdit();
                                if (e.key === 'Escape') onCancelEdit();
                            }}
                            autoFocus
                            className="bg-slate-700 border border-slate-600 text-white text-xl rounded-lg focus:ring-cyan-500 focus:border-cyan-500 p-2 w-full"
                            placeholder={`Nombre para #${playerNumber}`}
                        />
                        <button onClick={onSaveEdit} className="p-2 rounded-full bg-green-600 hover:bg-green-700 text-white transition-colors" title="Guardar nombre" aria-label="Guardar nombre">
                            <CheckIcon className="h-5 w-5" />
                        </button>
                        <button onClick={onCancelEdit} className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors" title="Cancelar edición" aria-label="Cancelar edición">
                            <XIcon className="h-5 w-5" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={(e) => { e.stopPropagation(); if(!isReadOnly) onStartEdit(playerNumber); }}
                        disabled={isTeamCard || isReadOnly}
                        className="group text-2xl font-bold text-cyan-400 p-2 -m-2 rounded-lg hover:bg-slate-700/50 transition-colors w-full text-left disabled:cursor-default disabled:hover:bg-transparent"
                        title={isTeamCard ? "Estadísticas del Equipo" : (isReadOnly ? "Jugador (Modo Lectura)" : "Editar nombre del jugador")}
                    >
                        <span className={`${!isTeamCard && !isReadOnly && 'group-hover:underline'} decoration-dotted underline-offset-4`}>
                            {isTeamCard ? 'Equipo' : (playerName || `Jugador #${playerNumber}`)}
                        </span>
                    </button>
                )}
            </div>
            {!isTeamCard && (
                <div className="flex items-center gap-1.5 mb-3" title={`${playerTally.faltasPersonales} faltas personales`}>
                    <span className="text-xs font-semibold text-slate-400 mr-1">Faltas:</span>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div 
                            key={i} 
                            className={`w-4 h-4 rounded-full border border-slate-600 transition-colors ${i < playerTally.faltasPersonales ? 'bg-red-500' : 'bg-slate-700'}`}
                        ></div>
                    ))}
                </div>
            )}
            <div className="grid grid-cols-2 gap-3">
                {(isTeamCard ? teamStatsToShow : playerStatsToShow).map(statKey => (
                    <CompactTallyStat
                        key={statKey}
                        label={statLabels[statKey as keyof TallyStatsPeriod]}
                        value={playerTally[statKey as keyof TallyStatsPeriod]}
                        onIncrement={() => onUpdate(playerNumber, statKey as StatAction, 1)}
                        readOnly={isReadOnly}
                    />
                ))}
            </div>
        </div>
    );
});

export default PlayerTallyCard;