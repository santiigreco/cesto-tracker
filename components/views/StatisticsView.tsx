import React, { useMemo } from 'react';
import { PlayerStats, Shot, GameMode, TallyStats } from '../../types';
import { useGameContext } from '../../context/GameContext';
import { generateFederationExcel } from '../../utils/exportToExcel';
import { FederationExportBanner } from './statistics/FederationExportBanner';
import { TallyStatisticsView } from './statistics/TallyStatisticsView';
import { ShotChartStatisticsView } from './statistics/ShotChartStatisticsView';

export interface StatisticsViewProps {
  onShareClick?: () => void;
  isSharing?: boolean;
  // Optional overrides for Share Report mode (still needed for snapshot sharing)
  externalStats?: PlayerStats[];
  externalPlayerNames?: Record<string, string>;
  externalShots?: Shot[];
  externalGameMode?: GameMode;
  externalTallyStats?: Record<string, TallyStats>;
}

const StatisticsView: React.FC<StatisticsViewProps> = React.memo(({
  onShareClick,
  isSharing = false,
  externalStats,
  externalPlayerNames,
  externalShots,
  externalGameMode,
  externalTallyStats,
}) => {
  const { gameState } = useGameContext();

  const gameMode = externalGameMode || gameState.gameMode;
  const shots = externalShots || gameState.shots;
  const playerNames = externalPlayerNames || gameState.playerNames;
  const tallyStats = externalTallyStats || gameState.tallyStats;

  const handleExportExcel = () => {
    if (!isSharing) {
      generateFederationExcel(gameState);
    }
  };

  const shotStats: PlayerStats[] = useMemo(() => {
    if (externalStats) return externalStats;
    if (gameMode === 'shot-chart') {
      const statsMap = new Map<string, { totalShots: number; totalGoles: number; totalPoints: number }>();
      shots.forEach(shot => {
        const pStats = statsMap.get(shot.playerNumber) || { totalShots: 0, totalGoles: 0, totalPoints: 0 };
        pStats.totalShots += 1;
        if (shot.isGol) {
          pStats.totalGoles += 1;
          pStats.totalPoints += shot.golValue;
        }
        statsMap.set(shot.playerNumber, pStats);
      });
      return Array.from(statsMap.entries()).map(([playerNumber, data]) => ({
        playerNumber,
        ...data,
        golPercentage: data.totalShots > 0 ? (data.totalGoles / data.totalShots) * 100 : 0,
      }));
    }
    return [];
  }, [shots, gameMode, externalStats]);

  const hasTallyData = gameMode === 'stats-tally' && tallyStats && Object.keys(tallyStats).length > 0;
  const hasShotData = gameMode === 'shot-chart' && shotStats.length > 0;
  const hasShareableData = hasTallyData || hasShotData;

  return (
    <>
      {!isSharing && (
        <FederationExportBanner
          onExportExcel={handleExportExcel}
          onShareClick={onShareClick}
          hasShareableData={hasShareableData}
        />
      )}

      {gameMode === 'stats-tally' && tallyStats ? (
        <div className="pt-4">
          <TallyStatisticsView
            tallyStats={tallyStats}
            playerNames={playerNames}
            isSharing={isSharing}
          />
        </div>
      ) : (
        <ShotChartStatisticsView
          stats={shotStats}
          shots={shots}
          playerNames={playerNames}
          isSharing={isSharing}
        />
      )}
    </>
  );
});

export default StatisticsView;
