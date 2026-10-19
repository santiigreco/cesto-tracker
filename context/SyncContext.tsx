import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo, ReactNode } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useGameContext, initialPlayerTally, initialGameState } from './GameContext';
import { useUI } from './UIContext';
import { GamePeriod, GameMode, GameState } from '../types';
import { mapTallyPeriodToDb, mapTallyPeriodFromDb, computeGameStateSignature } from '../utils/dbAdapters';

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
    isOnline: boolean;
    hasUnsavedChanges: boolean;
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
    const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

    // Track last saved signature to prevent duplicate background syncs
    const lastSavedSignatureRef = useRef<string>('');
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isSyncingRef = useRef<boolean>(false);
    const hasPendingChangesRef = useRef<boolean>(false);

    // Keep an up-to-date ref of gameState for async operations, unload listeners and offline recovery
    const latestGameStateRef = useRef<GameState>(gameState);
    useEffect(() => {
        latestGameStateRef.current = gameState;
    }, [gameState]);

    // Check if current state has unsaved changes compared to last successful cloud sync
    const currentSignature = useMemo(() => computeGameStateSignature(gameState), [gameState]);
    const hasUnsavedChanges = Boolean(
        gameState.isSetupComplete &&
        !gameState.isReadOnly &&
        ((gameState.gameLog && gameState.gameLog.length > 0) || !!gameState.gameId) &&
        currentSignature !== lastSavedSignatureRef.current
    );

    const handleSyncToSupabase = useCallback(async (gameNameInput?: any, isAutoSaveInput?: boolean): Promise<string | null> => {
        const isAutoSave = (typeof gameNameInput === 'boolean') ? gameNameInput : (isAutoSaveInput === true);
        const currentState = latestGameStateRef.current;

        // Mutex lock: if already syncing, queue a follow-up sync instead of silently dropping data
        if (isSyncingRef.current) {
            hasPendingChangesRef.current = true;
            console.warn('[PERSISTENCE_MUTEX] Sincronización en curso. Se programó guardado automático para los cambios pendientes.');
            return null;
        }
        isSyncingRef.current = true;

        // Snapshot current signature to lock on success
        const targetSignature = computeGameStateSignature(currentState);

        // 1. Calculate current myScore for quick preview in lists
        let myScore = 0;
        Object.entries(currentState.tallyStats || {}).forEach(([playerNumber, playerTally]) => {
            if (playerNumber === 'Equipo') return;
            Object.values(playerTally).forEach(periodStats => {
                myScore += ((periodStats?.goles || 0) * 2) + ((periodStats?.triples || 0) * 3);
            });
        });

        // 2. Build clean game name without duplicating "vs" or date
        const myTeam = currentState.settings.myTeam?.trim() || '';
        const existingName = currentState.settings.gameName?.trim() || '';
        let rival = (typeof gameNameInput === 'string' && gameNameInput.trim().length > 0)
            ? gameNameInput.trim()
            : existingName;

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
            // Check online state
            if (typeof navigator !== 'undefined' && !navigator.onLine) {
                throw new Error("Sin conexión a internet. Los datos están a salvo en este dispositivo.");
            }

            const { data: { session } } = await supabase.auth.getSession();
            let user = session?.user ?? null;
            if (!user) {
                const { data: userData, error: authError } = await supabase.auth.getUser();
                if (authError && !isAutoSave) throw authError;
                user = userData?.user ?? null;
            }

            if (!user) {
                if (!isAutoSave) {
                    showToast('Iniciá sesión para guardar tu partido en la nube', 'warning');
                    setSyncState({ status: 'idle', message: 'No autenticado' });
                }
                return null;
            }

            const gamePayload = {
                id: currentState.gameId || undefined,
                game_mode: 'stats-tally',
                settings: {
                    ...currentState.settings,
                    gameName: gameName.trim(),
                    myScore,
                    opponentScore: currentState.opponentScore,
                    currentPeriod: currentState.currentPeriod,
                    teamFouls: currentState.teamFouls,
                    gameLog: currentState.gameLog,
                },
                player_names: currentState.playerNames,
                available_players: currentState.availablePlayers,
                my_team_name: currentState.settings.myTeam || null,
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

            // Sync Tally Stats via unified dbAdapter
            if (currentState.tallyStats && Object.keys(currentState.tallyStats).length > 0) {
                const statsPayload: any[] = [];
                for (const playerNumber in currentState.tallyStats) {
                    const playerTally = currentState.tallyStats[playerNumber];
                    Object.keys(playerTally).forEach(periodKey => {
                        const periodStats = playerTally[periodKey as GamePeriod];
                        statsPayload.push({
                            game_id: newGameId,
                            player_number: playerNumber,
                            period: periodKey,
                            ...mapTallyPeriodToDb(periodStats)
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

            // Sync URL if this was a new match (/match/new)
            if (typeof window !== 'undefined' && window.location.pathname.startsWith('/match/new')) {
                window.history.replaceState(null, '', `/match/${newGameId}?edit=true`);
            }

            // Update gameId and userId in local state if newly assigned
            setGameState(prev => ({
                ...prev,
                gameId: newGameId,
                userId: user.id,
                settings: { ...prev.settings, gameName: gameName.trim() }
            }));

            // Mark successful save signature ONLY upon verified DB success
            lastSavedSignatureRef.current = targetSignature;
            setLastSaved(new Date());

            // Telemetría de éxito
            console.log(`[PERSISTENCE_SUCCESS] ${isAutoSave ? '[AUTOSAVE]' : '[MANUAL]'}`, {
                timestamp: new Date().toISOString(),
                gameId: newGameId,
                userId: user.id,
                match: `${currentState.settings.myTeam || 'Equipo'} vs ${gameName}`,
                period: currentState.currentPeriod,
                score: `${myScore} - ${currentState.opponentScore}`,
                eventsCount: currentState.gameLog?.length || 0
            });

            // Registro de auditoría asíncrono en Supabase
            supabase
                .from('match_activity_logs')
                .insert({
                    game_id: newGameId,
                    user_id: user.id,
                    action: isAutoSave ? 'AUTO_SAVE' : 'MANUAL_SAVE',
                    payload: {
                        match: `${currentState.settings.myTeam || 'Equipo'} vs ${gameName}`,
                        period: currentState.currentPeriod,
                        myScore,
                        opponentScore: currentState.opponentScore,
                        eventsCount: currentState.gameLog?.length || 0
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
                gameId: currentState.gameId,
                isAutoSave,
                error: error.message || error
            });
            // DO NOT update lastSavedSignatureRef on failure; ensure system knows changes remain unsaved
            setSyncState({ status: 'error', message: error.message || 'Error al sincronizar con la nube' });

            if (!isAutoSave) {
                showToast(`Error al guardar: ${error.message}`, 'error');
            } else {
                // Throttle toasts: only show warning toast if previously not in error state
                showToast(`Aviso de sincronización: ${error.message}. Tus datos siguen respaldados localmente en este dispositivo.`, 'warning');
            }
            return null;
        } finally {
            isSyncingRef.current = false;
            setIsAutoSaving(false);

            // If changes arrived while this sync was in progress, trigger the pending sync
            if (hasPendingChangesRef.current) {
                hasPendingChangesRef.current = false;
                setTimeout(() => {
                    handleSyncToSupabase(undefined, true);
                }, 400);
            }
        }
    }, [setGameState, showToast]);

    // Background Debounced Auto-Save
    useEffect(() => {
        if (!gameState.isSetupComplete || gameState.isReadOnly) return;
        const hasActions = (gameState.gameLog && gameState.gameLog.length > 0) || (gameState.shots && gameState.shots.length > 0) || !!gameState.gameId;
        if (!hasActions) return;

        if (currentSignature === lastSavedSignatureRef.current) return;

        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        autoSaveTimerRef.current = setTimeout(async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
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
        gameState.gameLog,
        gameState.shots,
        gameState.gameId,
        currentSignature,
        handleSyncToSupabase
    ]);

    // Online / Offline Listeners & Automatic Sync Recovery
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            console.log('[PERSISTENCE] Conexión recuperada. Verificando cambios pendientes...');
            const curSig = computeGameStateSignature(latestGameStateRef.current);
            if (curSig !== lastSavedSignatureRef.current) {
                handleSyncToSupabase(undefined, true);
            }
        };

        const handleOffline = () => {
            setIsOnline(false);
            console.warn('[PERSISTENCE] Conexión perdida. Operando en modo local resiliente.');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [handleSyncToSupabase]);

    // Resiliencia ante F5 / Cierre de Pestaña y Cambio de Visibilidad (Mobile Sleep)
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            const curSig = computeGameStateSignature(latestGameStateRef.current);
            const hasUnsaved = curSig !== lastSavedSignatureRef.current;
            if (hasUnsaved || isSyncingRef.current || hasPendingChangesRef.current) {
                // Prevent silent data loss: prompt user that pending cloud changes exist
                e.preventDefault();
                e.returnValue = '';
            }
        };

        const handleVisibilityChange = () => {
            // When user switches apps or locks phone, trigger cloud sync if changes are pending
            if (document.visibilityState === 'hidden') {
                const curSig = computeGameStateSignature(latestGameStateRef.current);
                if (curSig !== lastSavedSignatureRef.current && !isSyncingRef.current) {
                    handleSyncToSupabase(undefined, true);
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [handleSyncToSupabase]);

    const handleLoadGame = useCallback(async (gameId: string, enableEditing: boolean = false): Promise<LoadGameResult | null> => {
        setIsLoading(true);
        console.log(`[SyncContext] Cargando partido: ${gameId} (editar: ${enableEditing})`);
        try {
            const [sessionRes, gameRes, tallyRes] = await Promise.all([
                supabase.auth.getSession(),
                supabase.from('games').select('*').eq('id', gameId).single(),
                supabase.from('tally_stats').select('*').eq('game_id', gameId),
            ]);

            if (gameRes.error) throw gameRes.error;
            if (tallyRes.error) throw tallyRes.error;

            const user = sessionRes.data?.session?.user ?? null;
            const gameData = gameRes.data;
            const isOwner = Boolean(user && gameData.user_id === user.id);

            // Increment views asynchronously in background if someone is just viewing (read-only)
            if (!enableEditing) {
                const currentViews = gameData.views || 0;
                supabase
                    .from('games')
                    .update({ views: currentViews + 1 })
                    .eq('id', gameId)
                    .then(({ error: viewErr }) => {
                        if (viewErr) console.warn('Could not increment view count', viewErr);
                    });
            }

            const loadedTallyStats: any = {};

            // 1. Load from relational tally_stats table via dbAdapter
            if (tallyRes.data && tallyRes.data.length > 0) {
                tallyRes.data.forEach((stat: any) => {
                    const player = stat.player_number?.toString();
                    if (!player) return;

                    if (!loadedTallyStats[player]) {
                        loadedTallyStats[player] = JSON.parse(JSON.stringify(initialPlayerTally));
                    }

                    const period = stat.period;
                    if (loadedTallyStats[player][period]) {
                        loadedTallyStats[player][period] = mapTallyPeriodFromDb(stat);
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

            // Sync signature of loaded match to avoid redundant auto-save on load
            lastSavedSignatureRef.current = computeGameStateSignature(loadedGameState);
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
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;
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
            if (latestGameStateRef.current.gameId === gameId) {
                setGameState(initialGameState);
            }

            showToast('Partido eliminado correctamente', 'success');
            return true;
        } catch (error: any) {
            console.error('Delete Game Error:', error);
            showToast(`Error al eliminar: ${error.message}`, 'error');
            return false;
        }
    }, [setGameState, showToast]);

    const contextValue = useMemo<SyncContextType>(() => ({
        syncState,
        setSyncState,
        isAutoSaving,
        isLoading,
        lastSaved,
        isOnline,
        hasUnsavedChanges,
        handleSyncToSupabase,
        handleLoadGame,
        handleDeleteGame
    }), [
        syncState,
        isAutoSaving,
        isLoading,
        lastSaved,
        isOnline,
        hasUnsavedChanges,
        handleSyncToSupabase,
        handleLoadGame,
        handleDeleteGame
    ]);

    return (
        <SyncContext.Provider value={contextValue}>
            {children}
        </SyncContext.Provider>
    );
};

export const useSync = () => {
    const context = useContext(SyncContext);
    if (!context) throw new Error('useSync must be used within SyncProvider');
    return context;
};
