import React, { useMemo } from 'react';
import { useGameContext } from '../context/GameContext';
import { GamePeriod } from '../types';
import { PERIOD_NAMES } from '../constants';

const Scoreboard: React.FC = React.memo(() => {
  const { gameState, setGameState } = useGameContext();
  const { gameMode, shots, tallyStats, currentPeriod, isReadOnly } = gameState;

  const totalPoints = useMemo(() => {
    if (gameMode === 'shot-chart') {
      return shots.reduce((acc, shot) => acc + (shot.isGol ? shot.golValue : 0), 0);
    }
    
    if (gameMode === 'stats-tally') {
      // Calculate total points from individual players only, excluding 'Equipo' to prevent double counting
      return Object.entries(tallyStats).reduce((total: number, [playerNumber, playerTally]) => {
          if (playerNumber === 'Equipo') return total;
          
          const fh = playerTally['First Half'];
          const sh = playerTally['Second Half'];
          
          // Goles = 2pts, Triples = 3pts.
          // Explicitly access properties to avoid object prototype issues
          const pointsFH = ((fh?.goles || 0) * 2) + ((fh?.triples || 0) * 3);
          const pointsSH = ((sh?.goles || 0) * 2) + ((sh?.triples || 0) * 3);
          
          return total + pointsFH + pointsSH;
      }, 0);
    }
    return 0;
  }, [shots, tallyStats, gameMode]);

  return (
    <div className="sticky top-0 z-40 w-full bg-slate-800/95 backdrop-blur-md p-3 sm:p-4 rounded-b-2xl sm:rounded-2xl shadow-xl border-b border-slate-700/50 flex flex-row justify-between items-center mb-4">
      <div className="flex flex-col gap-2">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-cyan-400 uppercase tracking-wider">Tablero</h2>
          <p className="text-xs text-slate-400">Puntos Totales</p>
        </div>
        
        {/* Period Selector integrated into Scoreboard */}
        <div className="flex items-center gap-2">
            <select
                value={currentPeriod}
                onChange={(e) => setGameState((prev: any) => ({...prev, currentPeriod: e.target.value as GamePeriod}))}
                className="bg-slate-700/80 border border-slate-600 text-cyan-300 text-xs sm:text-sm font-semibold rounded-md focus:ring-cyan-500 focus:border-cyan-500 block p-1.5 cursor-pointer hover:bg-slate-600 transition-colors"
            >
                {Object.entries(PERIOD_NAMES).map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                ))}
            </select>
        </div>
      </div>
      
      <div className="text-4xl sm:text-5xl font-black text-white tracking-wider drop-shadow-md">
        {totalPoints}
      </div>
    </div>
  );
});

export default Scoreboard;