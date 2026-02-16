
import { useState, useCallback } from 'react';
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
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isAutoSaving, setIsAutoSaving] = useState(false);

    // Modified to support auto-save (silent mode)
    const handleSyncToSupabase = useCallback(async (gameName: string, isAutoSave: boolean = false) => {
        if (isAutoSave) {
            setIsAutoSaving(true);
        } else {
            setSyncState({ status: 'syncing', message: 'Sincronizando con la nube...' });
        }

        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error("Usuario no autenticado");

            // 1. Prepare and Upsert Game data
            const gamePayload = {
                id: gameState.gameId || undefined, // Let Supabase generate UUID on first sync
                game_mode: gameState.gameMode,
                settings: { ...gameState.settings, gameName: gameName.trim() },
                player_names: gameState.playerNames,
                available_players: gameState.availablePlayers,
                // New Fields for Database Relation
                tournament_id: gameState.settings.tournamentId || null,
                my_team_name: gameState.settings.myTeam || null,
                opponent_name: gameName.trim(), 
                user_id: user.id, // Associate with user
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
                // Delete existing shots to replace with current state (simple sync strategy)
                // In a more complex app, we would diff this, but for this scale, delete-insert is safer for consistency
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
                    
                    // Iterate dynamically over periods to support OTs without hardcoding
                    Object.keys(playerTally).forEach(periodKey => {
                        const periodStats = playerTally[periodKey as GamePeriod];
                        // Sync everything to ensure consistency
                        statsPayload.push({ 
                            game_id: newGameId, 
                            player_number: playerNumber, 
                            period: periodKey, 
                            ...mapTallyPeriodToDb(periodStats) 
                        });
                    });
                }
                const { error: statsError } = await supabase.from('tally_stats').upsert(statsPayload, { onConflict: 'game_id,player_number,period' });
                if (statsError) throw statsError;
            }
    
            // Update local state only if needed (e.g. first save generated an ID)
            if (gameState.gameId !== newGameId) {
                setGameState(prev => ({ ...prev, gameId: newGameId, settings: { ...prev.settings, gameName: gameName.trim() } }));
            }
            
            setLastSaved(new Date());

            if (!isAutoSave) {
                setSyncState({ status: 'success', message: '¡Partido guardado en la nube!' });
            }
    
        } catch (error: any) {
            console.error('Error syncing with Supabase:', error);
            if (!isAutoSave) {
                setSyncState({ status: 'error', message: `Error: ${error.message}` });
            }
        } finally {
            if (isAutoSave) {
                setIsAutoSaving(false);
            }
        }
    }, [gameState, setGameState]);

    const handleLoadGame = async (gameId: string, enableEditing: boolean = false) => {
        setIsLoading(true);
        try {
            const [gameRes, shotsRes, tallyRes] = await Promise.all([
                supabase.from('games').select('*, tournaments(name)').eq('id', gameId).single(),
                supabase.from('shots').select('*').eq('game_id', gameId),
                supabase.from('tally_stats').select('*').eq('game_id', gameId),
            ]);

            if (gameRes.error) throw gameRes.error;
            if (shotsRes.error) throw shotsRes.error;
            if (tallyRes.error) throw tallyRes.error;
            
            const gameData = gameRes.data;

            // Increment view count in background only if reading
            if (!enableEditing) {
                try {
                    const currentViews = gameData.views || 0;
                    await supabase.from('games').update({ views: currentViews + 1 }).eq('id', gameId);
                } catch (err) {
                    console.warn('Could not increment view count', err);
                }
            }
            
            const loadedShots: Shot[] = (shotsRes.data || []).map(mapShotFromDb);
            
            const loadedTallyStats: Record<string, TallyStats> = {};
            (tallyRes.data || []).forEach((stat: any) => {
                const player = stat.player_number;
                if (!loadedTallyStats[player]) {
                    loadedTallyStats[player] = JSON.parse(JSON.stringify(initialPlayerTally));
                }
                loadedTallyStats[player][stat.period as GamePeriod] = mapTallyPeriodFromDb(stat);
            });
            
            // Enrich settings with DB data if missing in JSON
            const enrichedSettings = {
                ...gameData.settings,
                tournamentId: gameData.tournament_id || gameData.settings?.tournamentId,
                tournamentName: gameData.tournaments?.name || gameData.settings?.tournamentName
            };

            const loadedGameState: GameState = {
                ...initialGameState,
                gameId: gameData.id,
                gameMode: gameData.game_mode,
                isSetupComplete: true,
                hasSeenHomepage: true,
                settings: enrichedSettings,
                availablePlayers: gameData.available_players,
                playerNames: gameData.player_names,
                activePlayers: gameData.available_players.slice(0, 6),
                shots: loadedShots,
                tallyStats: loadedTallyStats,
                playerStreaks: {},
                tutorialStep: 3,
                isReadOnly: !enableEditing, // Crucial change: allows editing if requested
            };
            
            setGameState(loadedGameState);
            // If loaded for editing, set lastSaved to now to start clean
            if (enableEditing) setLastSaved(new Date());

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
        isAutoSaving,
        lastSaved,
        handleSyncToSupabase,
        handleLoadGame
    };
};
