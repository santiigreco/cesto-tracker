
import React from 'react';
import { GameEvent, StatAction } from '../types';

interface GameLogViewProps {
    log: GameEvent[];
    playerNames: Record<string, string>;
}

const GameLogView: React.FC<GameLogViewProps> = ({ log, playerNames }) => {
    const getActionLabel = (action: StatAction) => {
        const labels: Record<StatAction, string> = {
            goles: "GOL",
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
                        <div key={event.id} className="flex justify-between items-center bg-slate-700/50 p-1.5 rounded-md text-sm">
                            <span className="font-bold text-cyan-300">{`[${getActionLabel(event.action)}]`}</span>
                            <span className="text-white font-semibold">
                                {playerNames[event.playerNumber] || (event.playerNumber === 'Equipo' ? 'Equipo' : `#${event.playerNumber}`)}
                            </span>
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
