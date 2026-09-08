import React from 'react';
import { TallyStats } from '../../types';
import { useGameContext } from '../../context/GameContext';
import { generateFederationExcel } from '../../utils/exportToExcel';
import { FederationExportBanner } from './statistics/FederationExportBanner';
import { TallyStatisticsView } from './statistics/TallyStatisticsView';

export interface StatisticsViewProps {
  onShareClick?: () => void;
  isSharing?: boolean;
  externalPlayerNames?: Record<string, string>;
  externalTallyStats?: Record<string, TallyStats>;
}

const StatisticsView: React.FC<StatisticsViewProps> = React.memo(({
  onShareClick,
  isSharing = false,
  externalPlayerNames,
  externalTallyStats,
}) => {
  const { gameState } = useGameContext();

  const playerNames = externalPlayerNames || gameState.playerNames;
  const tallyStats = externalTallyStats || gameState.tallyStats;

  const handleExportExcel = () => {
    if (!isSharing) {
      generateFederationExcel(gameState);
    }
  };

  const hasShareableData = !!(tallyStats && Object.keys(tallyStats).length > 0);

  return (
    <>
      {!isSharing && (
        <FederationExportBanner
          onExportExcel={handleExportExcel}
          onShareClick={onShareClick}
          hasShareableData={hasShareableData}
        />
      )}

      {tallyStats && (
        <div className="pt-4">
          <TallyStatisticsView
            tallyStats={tallyStats}
            playerNames={playerNames}
            isSharing={isSharing}
          />
        </div>
      )}
    </>
  );
});

export default StatisticsView;
