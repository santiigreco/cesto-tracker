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
    <div className="sticky top-0 z-50 -mx-4 px-4 sm:mx-0 sm:px-0 w-auto sm:w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-700 shadow-xl mb-4 py-3 flex justify-center items-center gap-4 transition-all">
      <span className="text-sm font-bold text-cyan-400 uppercase tracking-widest mt-1">Score</span>
      <span className="text-4xl font-black text-white leading-none">
        {totalPoints}
      </span>
    </div>
  );
});

export default Scoreboard;