import React, { useMemo } from 'react';
import { useGameContext } from '../../context/GameContext';
import { useUI } from '../../context/UIContext';

const Scoreboard: React.FC = React.memo(() => {
  const { gameState, setGameState } = useGameContext();
  const { activeTab, setActiveTab, openModal } = useUI();
  const { gameMode, shots, tallyStats, currentPeriod } = gameState;

  const totalPoints = useMemo(() => {
    if (gameMode === 'shot-chart') {
      return shots.reduce((acc, shot) => acc + (shot.isGol ? shot.golValue : 0), 0);
    }

    if (gameMode === 'stats-tally') {
      // Calculate total points from individual players only, excluding 'Equipo' to prevent double counting
      return Object.entries(tallyStats).reduce((total: number, [playerNumber, playerTally]) => {
        if (playerNumber === 'Equipo') return total;

        let playerTotal = 0;
        Object.values(playerTally).forEach(periodStats => {
          playerTotal += ((periodStats?.goles || 0) * 2) + ((periodStats?.triples || 0) * 3);
        });

        return total + playerTotal;
      }, 0);
    }
    return 0;
  }, [shots, tallyStats, gameMode]);

  return (
    <div className="sticky top-0 z-50 -mx-4 px-4 sm:mx-0 sm:px-0 w-auto sm:w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-700 shadow-xl mb-4 py-3 flex items-center justify-between transition-all max-w-4xl mx-auto">
      {/* Spacer para centrar el score */}
      <div className="flex-1"></div>
      
      {/* Score */}
      <div className="flex items-center gap-3 sm:gap-4 justify-center sm:flex-1">
        <span className="text-[10px] sm:text-sm font-bold text-cyan-400 uppercase tracking-widest mt-1">Score</span>
        <span className="text-3xl sm:text-4xl font-black text-white leading-none">
          {totalPoints}
        </span>
      </div>

      {/* Botones Accionables (Terminar 1er tiempo / Partido) (Solo se muestran si no estamos en estadísticas) */}
      <div className="flex-1 flex justify-end gap-2">
        {activeTab !== 'statistics' && (
          <>
            {currentPeriod === 'First Half' ? (
              <button
                onClick={() => setGameState(prev => ({ ...prev, currentPeriod: 'Second Half' }))}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-emerald-500/30 text-emerald-400 active:scale-95 transition-all outline-none rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/10"
              >
                FIN 1° T <span className="text-lg leading-none">»</span>
              </button>
            ) : currentPeriod === 'Second Half' ? (
              <>
                <button
                  onClick={() => setGameState(prev => ({ ...prev, currentPeriod: 'First Overtime' }))}
                  className="hidden sm:flex items-center bg-slate-800 hover:bg-slate-700 border border-slate-600/50 text-slate-300 active:scale-95 transition-all outline-none rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-wider"
                >
                  SUPLEMENTARIO
                </button>
                <button
                  onClick={() => openModal('finishMatch')}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-red-600/90 to-red-500/90 hover:from-red-500 hover:to-red-400 text-white active:scale-95 transition-all outline-none rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-lg shadow-red-900/50"
                  title="Finalizar e ir a estadísticas"
                >
                  <span>🏁 FIN PARTIDO</span>
                </button>
              </>
            ) : currentPeriod === 'First Overtime' ? (
              <>
                <button
                  onClick={() => setGameState(prev => ({ ...prev, currentPeriod: 'Second Overtime' }))}
                  className="hidden sm:flex items-center bg-slate-800 hover:bg-slate-700 border border-slate-600/50 text-slate-300 active:scale-95 transition-all outline-none rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-wider"
                >
                  FIN 1° S (+S)
                </button>
                <button
                  onClick={() => openModal('finishMatch')}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-red-600/90 to-red-500/90 hover:from-red-500 hover:to-red-400 text-white active:scale-95 transition-all outline-none rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-lg shadow-red-900/50"
                  title="Finalizar e ir a estadísticas"
                >
                  <span>🏁 FIN PARTIDO</span>
                </button>
              </>
            ) : currentPeriod === 'Second Overtime' ? (
              <button
                onClick={() => openModal('finishMatch')}
                className="flex items-center gap-1.5 bg-gradient-to-r from-red-600/90 to-red-500/90 hover:from-red-500 hover:to-red-400 text-white active:scale-95 transition-all outline-none rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-lg shadow-red-900/50"
                title="Finalizar e ir a estadísticas"
              >
                <span>🏁 FIN PARTIDO</span>
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
});

export default Scoreboard;