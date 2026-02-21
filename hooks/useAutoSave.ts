import { useEffect, useRef } from 'react';
import { GameState } from '../types';

export const useAutoSave = (
  user: any,
  gameState: GameState,
  handleSyncToSupabase: (gameName: string, isAutoSave: boolean) => void
) => {
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
      if (user && gameState.gameId && !gameState.isReadOnly) {
          if (autoSaveTimeoutRef.current) {
              clearTimeout(autoSaveTimeoutRef.current);
          }
          autoSaveTimeoutRef.current = setTimeout(() => {
              handleSyncToSupabase(gameState.settings.gameName || 'Partido sin nombre', true);
          }, 4000);
      }
      return () => {
          if (autoSaveTimeoutRef.current) {
              clearTimeout(autoSaveTimeoutRef.current);
          }
      };
  }, [
      gameState.shots, 
      gameState.tallyStats, 
      gameState.settings, 
      gameState.playerNames, 
      gameState.activePlayers, 
      user, 
      gameState.gameId, 
      gameState.isReadOnly,
      handleSyncToSupabase
  ]);
};
