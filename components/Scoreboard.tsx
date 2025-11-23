import React, { useMemo } from 'react';
import { useGameContext } from '../context/GameContext';

const Scoreboard: React.FC = React.memo(() => {
  const { gameState } = useGameContext();
  const { gameMode, shots, tallyStats } = gameState;

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
    <div className="w-full bg-slate-800 p-4 rounded-lg shadow-lg flex flex-col items-center">
      <h2 className="text-xl font-bold text-cyan-400 mb-2 text-center">Tablero</h2>
      <div className="text-6xl font-bold text-white tracking-wider">
        {totalPoints}
      </div>
      <p className="text-sm text-slate-400 mt-1">Puntos Totales</p>
    </div>
  );
});

export default Scoreboard;