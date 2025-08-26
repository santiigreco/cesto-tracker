


import React from 'react';
import { Shot } from '../types';

interface ShotLogProps {
  shots: Shot[];
  playerNames: Record<string, string>;
}

/**
 * Displays a chronological log of all shots registered during the game.
 */
const ShotLog: React.FC<ShotLogProps> = React.memo(({ shots, playerNames }) => {
  return (
    <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
      <h3 className="text-3xl font-bold text-cyan-400 mb-4">Registro de Tiros</h3>
      {shots.length > 0 ? (
        <div className="max-h-96 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {shots.slice().reverse().map(shot => (
            <div key={shot.id} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-md animate-fade-in">
              <div>
                <p className="font-bold text-white">{playerNames[shot.playerNumber] || `Jugador #${shot.playerNumber}`}</p>
                <p className="text-sm text-slate-400">{shot.period === 'First Half' ? 'Primer Tiempo' : 'Segundo Tiempo'}</p>
              </div>
              <div className="text-right">
                {shot.isGol ? (
                  <span className="font-semibold text-green-400">Gol (+{shot.golValue} pts)</span>
                ) : (
                  <span className="font-semibold text-red-400">Fallo</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400 text-center py-4">Aún no hay tiros registrados.</p>
      )}
    </div>
  );
});

export default ShotLog;