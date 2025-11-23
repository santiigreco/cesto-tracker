import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useGameContext, initialGameState, initialPlayerTally } from '../context/GameContext';
import { mapShotToDb, mapShotFromDb, mapTallyPeriodToDb, mapTallyPeriodFromDb } from '../utils/dbAdapters';
import { Shot, GameState, TallyStats, GamePeriod, PlayerStreak } from '../types';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';
export interface SyncState {
    status: SyncStatus;
    message: string;
}

export const useSupabaseSync = () => {
    const { gameState, setGameState } = useGameContext();
    const [syncState, setSyncState] = useState<SyncState>({ status: 'idle', message: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSyncToSupabase = async (gameName: string) => {
        setSyncState({ status: 'syncing', message: 'Sincronizando con la nube...' });
        try {
            // 1. Prepare and Upsert Game data
            const gamePayload = {
                id: gameState.gameId || undefined, // Let Supabase generate UUID on first sync
                game_mode: gameState.gameMode,
                settings: { ...gameState.settings, gameName: gameName.trim() },
                player_names: gameState.playerNames,
                available_players: gameState.availablePlayers,
            };

            const { data: gameData, error: gameError } = await supabase
                .from('games')
                .upsert(gamePayload)
                .select()
                .single();

            if (gameError) throw gameError;
            if (!gameData) throw new Error("No se pudo obtener el ID del partido guardado.");
    
            const newGameId = gameData.id;
    
            // 2. Sync Shots if in shot-chart mode
            if (gameState.gameMode === 'shot-chart') {
                const { error: deleteError } = await supabase.from('shots').delete().eq('game_id', newGameId);
                if (deleteError) throw deleteError;
    
                if (gameState.shots.length > 0) {
                    const shotsPayload = gameState.shots.map(shot => mapShotToDb(shot, newGameId));
                    const { error: shotsError } = await supabase.from('shots').insert(shotsPayload);
                    if (shotsError) throw shotsError;
                }
            }
    
            // 3. Sync Tally Stats if in stats-tally mode
            if (gameState.gameMode === 'stats-tally' && Object.keys(gameState.tallyStats).length > 0) {
                const statsPayload: any[] = [];
                
                for (const playerNumber in gameState.tallyStats) {
                    const playerTally = gameState.tallyStats[playerNumber];
                    statsPayload.push({ 
                        game_id: newGameId, 
                        player_number: playerNumber, 
                        period: 'First Half', 
                        ...mapTallyPeriodToDb(playerTally['First Half']) 
                    });
                    statsPayload.push({ 
                        game_id: newGameId, 
                        player_number: playerNumber, 
                        period: 'Second Half', 
                        ...mapTallyPeriodToDb(playerTally['Second Half']) 
                    });
                }
                const { error: statsError } = await supabase.from('tally_stats').upsert(statsPayload, { onConflict: 'game_id,player_number,period' });
                if (statsError) throw statsError;
            }
    
            setGameState(prev => ({ ...prev, gameId: newGameId, settings: { ...prev.settings, gameName: gameName.trim() } }));
            setSyncState({ status: 'success', message: '¡Partido guardado en la nube!' });
    
        } catch (error: any) {
            console.error('Error syncing with Supabase:', error);
            setSyncState({ status: 'error', message: `Error: ${error.message}` });
        }
    };

    const handleLoadGame = async (gameId: string) => {
        setIsLoading(true);
        try {
            const [gameRes, shotsRes, tallyRes] = await Promise.all([
                supabase.from('games').select('*').eq('id', gameId).single(),
                supabase.from('shots').select('*').eq('game_id', gameId),
                supabase.from('tally_stats').select('*').eq('game_id', gameId),
            ]);

            if (gameRes.error) throw gameRes.error;
            if (shotsRes.error) throw shotsRes.error;
            if (tallyRes.error) throw tallyRes.error;
            
            const gameData = gameRes.data;
            
            const loadedShots: Shot[] = (shotsRes.data || []).map(mapShotFromDb);
            
            const loadedTallyStats: Record<string, TallyStats> = {};
            (tallyRes.data || []).forEach((stat: any) => {
                const player = stat.player_number;
                if (!loadedTallyStats[player]) {
                    loadedTallyStats[player] = JSON.parse(JSON.stringify(initialPlayerTally));
                }
                loadedTallyStats[player][stat.period as GamePeriod] = mapTallyPeriodFromDb(stat);
            });
            
            const loadedPlayerStreaks: Record<string, PlayerStreak> = {};
            
            const loadedGameState: GameState = {
                ...initialGameState,
                gameId: gameData.id,
                gameMode: gameData.game_mode,
                isSetupComplete: true,
                hasSeenHomepage: true,
                settings: gameData.settings,
                availablePlayers: gameData.available_players,
                playerNames: gameData.player_names,
                activePlayers: gameData.available_players.slice(0, 6),
                shots: loadedShots,
                tallyStats: loadedTallyStats,
                playerStreaks: loadedPlayerStreaks,
                tutorialStep: 3,
                isReadOnly: true,
            };
            
            setGameState(loadedGameState);

        } catch (error: any) {
            console.error('Error loading game:', error);
            alert(`No se pudo cargar el partido: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        syncState,
        setSyncState,
        isLoading,
        handleSyncToSupabase,
        handleLoadGame
    };
};
