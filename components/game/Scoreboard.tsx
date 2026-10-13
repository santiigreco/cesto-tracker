import React, { useMemo } from 'react';
import { useGameContext } from '../../context/GameContext';
import { useUI } from '../../context/UIContext';

const Scoreboard: React.FC = React.memo(() => {
  const { gameState, setGameState } = useGameContext();
  const { activeTab, setActiveTab, openModal } = useUI();
  const { tallyStats, currentPeriod } = gameState;

  const totalPoints = useMemo(() => {
    return Object.entries(tallyStats || {}).reduce((total: number, [playerNumber, playerTally]) => {
      if (playerNumber === 'Equipo') return total;

      let playerTotal = 0;
      Object.values(playerTally).forEach(periodStats => {
        playerTotal += ((periodStats?.goles || 0) * 2) + ((periodStats?.triples || 0) * 3);
      });

      return total + playerTotal;
    }, 0);
  }, [tallyStats]);

  return (
    <div className="sticky top-0 z-30 -mx-4 px-4 sm:mx-0 sm:px-0 w-auto sm:w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-700/80 shadow-xl mb-3 py-2.5 sm:py-3 flex items-center justify-between transition-all max-w-4xl mx-auto gap-2">
      {/* Score */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <span className="px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-800/50 text-[10px] sm:text-xs font-bold text-cyan-400 uppercase tracking-wider">
          Score
        </span>
        <span className="text-2xl sm:text-4xl font-black text-white leading-none font-mono">
          {totalPoints}
        </span>
      </div>

      {/* Botones Accionables (Terminar 1er tiempo / Partido) (Solo se muestran si no estamos en estadísticas) */}
      <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
        {activeTab !== 'statistics' && (
          <>
            {currentPeriod === 'First Half' ? (
              <button
                onClick={() => setGameState(prev => ({ ...prev, currentPeriod: 'Second Half' }))}
                className="min-h-[40px] sm:min-h-[44px] flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-emerald-500/40 text-emerald-400 active:scale-95 transition-all outline-none rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-black uppercase tracking-wider shadow-md touch-manipulation whitespace-nowrap"
              >
                <span>FIN 1° T</span> <span className="text-base leading-none">»</span>
              </button>
            ) : currentPeriod === 'Second Half' ? (
              <>
                <button
                  onClick={() => setGameState(prev => ({ ...prev, currentPeriod: 'First Overtime' }))}
                  className="hidden sm:flex min-h-[44px] items-center bg-slate-800 hover:bg-slate-700 border border-slate-600/50 text-slate-300 active:scale-95 transition-all outline-none rounded-xl px-3.5 py-2 text-xs font-black uppercase tracking-wider touch-manipulation whitespace-nowrap"
                >
                  SUPLEMENTARIO
                </button>
                <button
                  onClick={() => openModal('finishMatch')}
                  className="min-h-[40px] sm:min-h-[44px] flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 active:from-red-700 active:to-red-600 text-white active:scale-95 transition-all outline-none rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg shadow-red-900/50 touch-manipulation whitespace-nowrap"
                  title="Finalizar e ir a estadísticas"
                >
                  <span>🏁 FIN PARTIDO</span>
                </button>
              </>
            ) : currentPeriod === 'First Overtime' ? (
              <>
                <button
                  onClick={() => setGameState(prev => ({ ...prev, currentPeriod: 'Second Overtime' }))}
                  className="hidden sm:flex min-h-[44px] items-center bg-slate-800 hover:bg-slate-700 border border-slate-600/50 text-slate-300 active:scale-95 transition-all outline-none rounded-xl px-3.5 py-2 text-xs font-black uppercase tracking-wider touch-manipulation whitespace-nowrap"
                >
                  FIN 1° S (+S)
                </button>
                <button
                  onClick={() => openModal('finishMatch')}
                  className="min-h-[40px] sm:min-h-[44px] flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 active:from-red-700 active:to-red-600 text-white active:scale-95 transition-all outline-none rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg shadow-red-900/50 touch-manipulation whitespace-nowrap"
                  title="Finalizar e ir a estadísticas"
                >
                  <span>🏁 FIN PARTIDO</span>
                </button>
              </>
            ) : currentPeriod === 'Second Overtime' ? (
              <button
                onClick={() => openModal('finishMatch')}
                className="min-h-[40px] sm:min-h-[44px] flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 active:from-red-700 active:to-red-600 text-white active:scale-95 transition-all outline-none rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg shadow-red-900/50 touch-manipulation whitespace-nowrap"
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