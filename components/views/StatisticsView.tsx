import React from 'react';
import { TallyStats } from '../../types';
import { useGameContext } from '../../context/GameContext';
import { useUI } from '../../context/UIContext';
import { generateFederationExcel } from '../../utils/exportToExcel';
import { hasCompleteMatchMetadata } from '../../utils/matchMetadata';
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
  const { openModal } = useUI();

  const playerNames = externalPlayerNames || gameState.playerNames;
  const tallyStats = externalTallyStats || gameState.tallyStats;

  const handleExportExcel = () => {
    if (isSharing) return;
    if (!gameState.isReadOnly && !hasCompleteMatchMetadata(gameState.settings)) {
      openModal('matchMetadata', { intent: 'excel' });
      return;
    }
    generateFederationExcel(gameState);
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
            currentPeriod={gameState.currentPeriod}
          />
        </div>
      )}
    </>
  );
});

export default StatisticsView;
