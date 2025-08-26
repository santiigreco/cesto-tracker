

import React from 'react';

interface ScoreboardProps {
  totalPoints: number;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ totalPoints }) => {
  return (
    <div className="w-full bg-slate-800 p-4 rounded-lg shadow-lg flex flex-col items-center">
      <h2 className="text-xl font-bold text-cyan-400 mb-2 text-center">Tablero</h2>
      <div className="text-6xl font-bold text-white tracking-wider">
        {totalPoints}
      </div>
      <p className="text-sm text-slate-400 mt-1">Puntos Totales</p>
    </div>
  );
};

export default Scoreboard;
