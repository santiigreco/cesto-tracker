import { useState } from 'react';
import { AppTab, HeatmapFilter, MapPeriodFilter, ShotPosition } from '../types';

export const useAppUI = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('logger');
  
  // Header Player Name Editing (for Logger Mode)
  const [isEditingHeaderPlayer, setIsEditingHeaderPlayer] = useState(false);
  const [headerPlayerName, setHeaderPlayerName] = useState('');

  const [isCorrectionsVisible, setIsCorrectionsVisible] = useState(false);

  // Analysis Tab State
  const [mapView, setMapView] = useState<'shotmap' | 'heatmap' | 'zonemap'>('heatmap');
  const [analysisPlayer, setAnalysisPlayer] = useState<string>('Todos');
  const [analysisResultFilter, setAnalysisResultFilter] = useState<HeatmapFilter>('all');
  const [analysisPeriodFilter, setAnalysisPeriodFilter] = useState<MapPeriodFilter>('all');

  const [pendingShotPosition, setPendingShotPosition] = useState<ShotPosition | null>(null);

  // Preloaded data from Home selection
  const [initialSetupData, setInitialSetupData] = useState<{
      teamName?: string;
      selectedPlayers?: string[];
      playerNames?: Record<string, string>;
  } | null>(null);

  return {
    activeTab, setActiveTab,
    isEditingHeaderPlayer, setIsEditingHeaderPlayer,
    headerPlayerName, setHeaderPlayerName,
    isCorrectionsVisible, setIsCorrectionsVisible,
    mapView, setMapView,
    analysisPlayer, setAnalysisPlayer,
    analysisResultFilter, setAnalysisResultFilter,
    analysisPeriodFilter, setAnalysisPeriodFilter,
    pendingShotPosition, setPendingShotPosition,
    initialSetupData, setInitialSetupData
  };
};
