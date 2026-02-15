
import React from 'react';
import { GameEvent, StatAction } from '../types';
import PencilIcon from './PencilIcon';

interface GameLogViewProps {
    log: GameEvent[];
    playerNames: Record<string, string>;
    onEventClick?: (event: GameEvent) => void;
}

const GameLogView: React.FC<GameLogViewProps> = ({ log, playerNames, onEventClick }) => {
    const getActionLabel = (action: StatAction) => {
        const labels: Record<StatAction, string> = {
            goles: "GOL",
            triples: "TRIPLE",
            fallos: "FALLO",
            recuperos: "RECUPERO",
            perdidas: "PÉRDIDA",
            reboteOfensivo: "REB. OFENSIVO",
            reboteDefensivo: "REB. DEFENSIVO",
            asistencias: "ASISTENCIA",
            golesContra: "GOL EN CONTRA",
            faltasPersonales: "FALTA PERSONAL",
        };
        return labels[action] || action.toUpperCase();
    };

    return (
        <div className="bg-slate-800 p-3 sm:p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-cyan-400 mb-2 text-center">Registro de Juego</h3>
            {log.length > 0 ? (
                <div className="max-h-32 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                    {log.map(event => (
                        <div 
                            key={event.id} 
                            onClick={() => onEventClick && onEventClick(event)}
                            className={`flex justify-between items-center bg-slate-700/50 p-2 rounded-md text-sm border border-transparent transition-all group ${onEventClick ? 'cursor-pointer hover:bg-slate-700 hover:border-slate-500' : ''}`}
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <span className="font-bold text-cyan-300 whitespace-nowrap text-xs sm:text-sm">{`[${getActionLabel(event.action)}]`}</span>
                                <span className="text-white font-semibold truncate text-xs sm:text-sm">
                                    {playerNames[event.playerNumber] || (event.playerNumber === 'Equipo' ? 'Equipo' : `#${event.playerNumber}`)}
                                </span>
                            </div>
                            
                            {/* Time or Edit Icon */}
                            <div className="text-slate-500 text-xs ml-2 flex-shrink-0">
                                {onEventClick ? (
                                    <PencilIcon className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                    <span>{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-slate-400 text-center text-sm py-2">Aún no hay acciones registradas.</p>
            )}
        </div>
    );
};

export default GameLogView;
