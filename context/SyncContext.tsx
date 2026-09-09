import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useGameContext, initialPlayerTally, initialGameState } from './GameContext';
import { useUI } from './UIContext';
import { GamePeriod, GameMode, GameState } from '../types';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';
export interface SyncState {
    status: SyncStatus;
    message: string;
}

export interface LoadGameResult {
    gameMode: GameMode;
    isOwner: boolean;
}

interface SyncContextType {
    syncState: SyncState;
    setSyncState: (state: SyncState) => void;
    isAutoSaving: boolean;
    isLoading: boolean;
    lastSaved: Date | null;
    handleSyncToSupabase: (gameNameInput?: any, isAutoSaveInput?: boolean) => Promise<string | null>;
    handleLoadGame: (gameId: string, enableEditing?: boolean) => Promise<LoadGameResult | null>;
    handleDeleteGame: (gameId: string) => Promise<boolean>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { gameState, setGameState } = useGameContext();
    const { showToast } = useUI();
    const [syncState, setSyncState] = useState<SyncState>({ status: 'idle', message: '' });
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Track last saved signature to prevent duplicate background syncs
    const lastSavedSignatureRef = useRef<string>('');
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

    const handleSyncToSupabase = useCallback(async (gameNameInput?: any, isAutoSaveInput?: boolean): Promise<string | null> => {
        const isAutoSave = (typeof gameNameInput === 'boolean') ? gameNameInput : (isAutoSaveInput === true);

        // 1. Calculate current myScore for quick preview in lists
        let myScore = 0;
        Object.entries(gameState.tallyStats || {}).forEach(([playerNumber, playerTally]) => {
            if (playerNumber === 'Equipo') return;
            Object.values(playerTally).forEach(periodStats => {
                myScore += ((periodStats?.goles || 0) * 2) + ((periodStats?.triples || 0) * 3);
            });
        });

        // 2. Build clean game name without duplicating "vs" or date
        const myTeam = gameState.settings.myTeam?.trim() || '';
        const existingName = gameState.settings.gameName?.trim() || '';
        let rival = (typeof gameNameInput === 'string' && gameNameInput.trim().length > 0)
            ? gameNameInput.trim()
            : existingName;

        // If rival already contains formatted match name or date, clean it up
        let gameName = rival;
        if (!gameName || gameName === 'Partido') {
            const dateStr = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
            if (myTeam) {
                gameName = `${myTeam} · ${dateStr}`;
            } else {
                gameName = `Partido · ${dateStr}`;
            }
        }

        if (isAutoSave) {
            setIsAutoSaving(true);
        } else {
            setSyncState({ status: 'syncing', message: 'Sincronizando con la nube...' });
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                if (!isAutoSave) {
                    showToast('Iniciá sesión para guardar tu partido en la nube', 'warning');
                    setSyncState({ status: 'idle', message: 'No autenticado' });
                }
                return null;
            }

            const gamePayload = {
                id: gameState.gameId || undefined,
                game_mode: 'stats-tally',
                settings: {
                    ...gameState.settings,
                    gameName: gameName.trim(),
                    myScore,
                    opponentScore: gameState.opponentScore,
                    currentPeriod: gameState.currentPeriod,
                    teamFouls: gameState.teamFouls,
                    gameLog: gameState.gameLog,
                },
                player_names: gameState.playerNames,
                available_players: gameState.availablePlayers,
                my_team_name: gameState.settings.myTeam || null,
                opponent_name: gameName.trim(),
                user_id: user.id,
            };

            const { data: gameData, error: gameError } = await supabase
                .from('games')
                .upsert(gamePayload)
                .select()
                .single();

            if (gameError) throw gameError;
            if (!gameData) throw new Error("No se pudo obtener el ID del partido guardado.");

            const newGameId = gameData.id;

            // Sync Tally Stats
            if (gameState.tallyStats && Object.keys(gameState.tallyStats).length > 0) {
                const statsPayload: any[] = [];
                for (const playerNumber in gameState.tallyStats) {
                    const playerTally = gameState.tallyStats[playerNumber];
                    Object.keys(playerTally).forEach(periodKey => {
                        const periodStats = playerTally[periodKey as GamePeriod];
                        statsPayload.push({
                            game_id: newGameId,
                            player_number: playerNumber,
                            period: periodKey,
                            goles: periodStats.goles || 0,
                            triples: periodStats.triples || 0,
                            fallos: periodStats.fallos || 0,
                            recuperos: periodStats.recuperos || 0,
                            perdidas: periodStats.perdidas || 0,
                            rebote_ofensivo: periodStats.reboteOfensivo || 0,
                            rebote_defensivo: periodStats.reboteDefensivo || 0,
                            asistencias: periodStats.asistencias || 0,
                            golescontra: periodStats.golesContra || 0,
                            faltas_personales: periodStats.faltasPersonales || 0
                        });
                    });
                }
                if (statsPayload.length > 0) {
                    const { error: tallyStatsError } = await supabase
                        .from('tally_stats')
                        .upsert(statsPayload, { onConflict: 'game_id,player_number,period' });
                    if (tallyStatsError) {
                        console.error('[PERSISTENCE_ERROR] Error al guardar tally stats:', tallyStatsError);
                        throw tallyStatsError;
                    }
                }
            }

            // Update gameId and userId in local state if newly assigned
            setGameState(prev => ({
                ...prev,
                gameId: newGameId,
                userId: user.id,
                settings: { ...prev.settings, gameName: gameName.trim() }
            }));

            setLastSaved(new Date());

            // Telemetría de éxito
            console.log(`[PERSISTENCE_SUCCESS] ${isAutoSave ? '[AUTOSAVE]' : '[MANUAL]'}`, {
                timestamp: new Date().toISOString(),
                gameId: newGameId,
                userId: user.id,
                match: `${gameState.settings.myTeam || 'Equipo'} vs ${gameName}`,
                period: gameState.currentPeriod,
                score: `${myScore} - ${gameState.opponentScore}`,
                eventsCount: gameState.gameLog?.length || 0
            });

            // Registro de auditoría asíncrono en Supabase
            supabase
                .from('match_activity_logs')
                .insert({
                    game_id: newGameId,
                    user_id: user.id,
                    action: isAutoSave ? 'AUTO_SAVE' : 'MANUAL_SAVE',
                    payload: {
                        match: `${gameState.settings.myTeam || 'Equipo'} vs ${gameName}`,
                        period: gameState.currentPeriod,
                        myScore,
                        opponentScore: gameState.opponentScore,
                        eventsCount: gameState.gameLog?.length || 0
                    }
                })
                .then(({ error: auditErr }) => {
                    if (auditErr) {
                        console.warn('[PERSISTENCE_AUDIT_WARNING] Error registrando auditoría:', auditErr.message);
                    }
                });

            if (!isAutoSave) {
                setSyncState({ status: 'success', message: '¡Partido guardado con éxito!' });
                showToast('¡Partido guardado en la nube!', 'success');
            } else {
                setSyncState({ status: 'idle', message: '' });
            }

            return newGameId;
        } catch (error: any) {
            console.error('[PERSISTENCE_ERROR]', {
                timestamp: new Date().toISOString(),
                gameId: gameState.gameId,
                isAutoSave,
                error: error.message || error
            });
            setSyncState({ status: 'error', message: error.message || 'Error al guardar en la nube' });
            if (!isAutoSave) {
                showToast(`Error al guardar: ${error.message}`, 'error');
            } else {
                // Alerta visible no bloqueante para autoguardado
                showToast(`Aviso: Falló la sincronización automática (${error.message}). Tus datos siguen respaldados localmente.`, 'warning');
            }
            return null;
        } finally {
            setIsAutoSaving(false);
        }
    }, [gameState, setGameState, showToast]);

    // Background Debounced Auto-Save
    useEffect(() => {
        if (!gameState.isSetupComplete || gameState.isReadOnly) return;
        const hasActions = (gameState.gameLog && gameState.gameLog.length > 0) || (gameState.shots && gameState.shots.length > 0) || !!gameState.gameId;
        if (!hasActions) return;

        // Firma integral que incluye cambios en estadísticas, tanteador, nombres y período
        const tallySummary = Object.entries(gameState.tallyStats || {})
            .map(([p, perMap]) => `${p}:${Object.values(perMap).map(s => `${s.goles},${s.triples},${s.fallos},${s.faltasPersonales}`).join('|')}`)
            .join(';');

        const currentSignature = JSON.stringify({
            gameId: gameState.gameId,
            logLen: gameState.gameLog?.length || 0,
            fouls: gameState.teamFouls,
            oppScore: gameState.opponentScore,
            period: gameState.currentPeriod,
            names: gameState.playerNames,
            tally: tallySummary
        });

        if (currentSignature === lastSavedSignatureRef.current) return;

        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        autoSaveTimerRef.current = setTimeout(async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                lastSavedSignatureRef.current = currentSignature;
                handleSyncToSupabase(undefined, true);
            }
        }, 2000);

        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [
        gameState.isSetupComplete,
        gameState.isReadOnly,
        gameState.gameId,
        gameState.gameLog?.length,
        gameState.shots?.length,
        gameState.teamFouls,
        gameState.opponentScore,
        gameState.currentPeriod,
        gameState.playerNames,
        gameState.tallyStats,
        handleSyncToSupabase
    ]);

    // Flush de guardado pendiente al salir o cambiar de pestaña
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
                handleSyncToSupabase(undefined, true);
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [handleSyncToSupabase]);

    const handleLoadGame = useCallback(async (gameId: string, enableEditing: boolean = false): Promise<LoadGameResult | null> => {
        setIsLoading(true);
        console.log(`[SyncContext] Cargando partido: ${gameId} (editar: ${enableEditing})`);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const [gameRes, tallyRes] = await Promise.all([
                supabase.from('games').select('*').eq('id', gameId).single(),
                supabase.from('tally_stats').select('*').eq('game_id', gameId),
            ]);

            if (gameRes.error) throw gameRes.error;
            if (tallyRes.error) throw tallyRes.error;

            const gameData = gameRes.data;
            const isOwner = Boolean(user && gameData.user_id === user.id);

            // Increment views if someone is just viewing (read-only)
            if (!enableEditing) {
                try {
                    const currentViews = gameData.views || 0;
                    await supabase.from('games').update({ views: currentViews + 1 }).eq('id', gameId);
                } catch (err) {
                    console.warn('Could not increment view count', err);
                }
            }

            const loadedTallyStats: any = {};

            // 1. Load from relational tally_stats table
            if (tallyRes.data && tallyRes.data.length > 0) {
                tallyRes.data.forEach((stat: any) => {
                    const player = stat.player_number?.toString();
                    if (!player) return;

                    if (!loadedTallyStats[player]) {
                        loadedTallyStats[player] = JSON.parse(JSON.stringify(initialPlayerTally));
                    }

                    const period = stat.period;
                    if (loadedTallyStats[player][period]) {
                        loadedTallyStats[player][period] = {
                            goles: stat.goles ?? 0,
                            triples: stat.triples ?? 0,
                            fallos: stat.fallos ?? 0,
                            recuperos: stat.recuperos ?? 0,
                            perdidas: stat.perdidas ?? 0,
                            reboteOfensivo: stat.rebote_ofensivo ?? stat.reboteOfensivo ?? 0,
                            reboteDefensivo: stat.rebote_defensivo ?? stat.reboteDefensivo ?? 0,
                            asistencias: stat.asistencias ?? 0,
                            golesContra: stat.golescontra ?? stat.goles_contra ?? stat.golesContra ?? 0,
                            faltasPersonales: stat.faltas_personales ?? stat.faltasPersonales ?? 0
                        };
                    }
                });
            }

            // 2. Fallback: JSON storage (Legacy)
            const sourceStats = gameData.settings?.tallyStats || gameData.tallyStats;
            if (sourceStats && Object.keys(sourceStats).length > 0) {
                Object.entries(sourceStats).forEach(([player, plStats]: [string, any]) => {
                    const pKey = player.toString();
                    if (!loadedTallyStats[pKey]) {
                        loadedTallyStats[pKey] = JSON.parse(JSON.stringify(initialPlayerTally));
                    }

                    if (plStats['First Half'] || plStats['Second Half']) {
                        Object.keys(plStats).forEach(period => {
                            if (loadedTallyStats[pKey][period]) {
                                const isRelationalEmpty = !tallyRes.data?.some(r => r.player_number?.toString() === pKey && r.period === period);
                                if (isRelationalEmpty) {
                                    loadedTallyStats[pKey][period] = {
                                        ...loadedTallyStats[pKey][period],
                                        ...plStats[period],
                                        reboteOfensivo: plStats[period].reboteOfensivo ?? plStats[period].rebote_ofensivo ?? 0,
                                        reboteDefensivo: plStats[period].reboteDefensivo ?? plStats[period].rebote_defensivo ?? 0,
                                        golesContra: plStats[period].golesContra ?? plStats[period].goles_contra ?? plStats[period].golescontra ?? 0,
                                        faltasPersonales: plStats[period].faltasPersonales ?? plStats[period].faltas_personales ?? 0
                                    };
                                }
                            }
                        });
                    }
                });
            }

            // Ensure every participating player and "Equipo" has initialized tally stats structure
            const availablePlayers = gameData.available_players || [];
            const allPlayerKeys = ['Equipo', ...availablePlayers];
            allPlayerKeys.forEach(p => {
                if (!loadedTallyStats[p]) {
                    loadedTallyStats[p] = JSON.parse(JSON.stringify(initialPlayerTally));
                }
            });

            // Restore complete GameState snapshot
            const loadedGameState: GameState = {
                ...initialGameState,
                gameId: gameData.id,
                userId: gameData.user_id,
                gameMode: gameData.game_mode,
                isSetupComplete: true,
                hasSeenHomepage: true,
                settings: {
                    ...gameData.settings,
                    tournamentId: gameData.settings?.tournamentId || null,
                    tournamentName: gameData.settings?.tournamentName || null
                },
                availablePlayers: availablePlayers,
                playerNames: gameData.player_names || {},
                activePlayers: availablePlayers.slice(0, 6),
                currentPeriod: gameData.settings?.currentPeriod || 'First Half',
                opponentScore: gameData.settings?.opponentScore ?? 0,
                shots: [],
                tallyStats: loadedTallyStats,
                teamFouls: gameData.settings?.teamFouls || gameData.team_fouls || initialGameState.teamFouls,
                gameLog: gameData.settings?.gameLog || [],
                tallyRedoLog: [],
                isReadOnly: !enableEditing,
            };

            setGameState(loadedGameState);
            if (enableEditing) setLastSaved(new Date());

            return {
                gameMode: gameData.game_mode,
                isOwner
            };

        } catch (error: any) {
            console.error('Load Error:', error);
            showToast(`No se pudo cargar el partido: ${error.message}`, 'error');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [setGameState, showToast]);

    const handleDeleteGame = useCallback(async (gameId: string): Promise<boolean> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuario no autenticado");

            // 1. Delete associated tally stats
            await supabase.from('tally_stats').delete().eq('game_id', gameId);

            // 2. Delete the game itself
            const { error: gameError } = await supabase
                .from('games')
                .delete()
                .eq('id', gameId)
                .eq('user_id', user.id);

            if (gameError) throw gameError;

            // Reset current game if it was the deleted one
            if (gameState.gameId === gameId) {
                setGameState(initialGameState);
            }

            showToast('Partido eliminado correctamente', 'success');
            return true;
        } catch (error: any) {
            console.error('Delete Game Error:', error);
            showToast(`Error al eliminar: ${error.message}`, 'error');
            return false;
        }
    }, [gameState.gameId, setGameState, showToast]);

    return (
        <SyncContext.Provider value={{
            syncState,
            setSyncState,
            isAutoSaving,
            isLoading,
            lastSaved,
            handleSyncToSupabase,
            handleLoadGame,
            handleDeleteGame
        }}>
            {children}
        </SyncContext.Provider>
    );
};

export const useSync = () => {
    const context = useContext(SyncContext);
    if (!context) throw new Error('useSync must be used within SyncProvider');
    return context;
};
