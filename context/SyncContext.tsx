
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useGameContext, initialPlayerTally, initialGameState } from './GameContext';
import { useUI } from './UIContext';
import { GamePeriod } from '../types';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';
export interface SyncState {
    status: SyncStatus;
    message: string;
}

interface SyncContextType {
    syncState: SyncState;
    setSyncState: (state: SyncState) => void;
    isAutoSaving: boolean;
    isLoading: boolean;
    lastSaved: Date | null;
    handleSyncToSupabase: (gameNameInput?: any, isAutoSaveInput?: boolean) => Promise<void>;
    handleLoadGame: (gameId: string, enableEditing: boolean) => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { gameState, setGameState } = useGameContext();
    const { showToast } = useUI();
    const [syncState, setSyncState] = useState<SyncState>({ status: 'idle', message: '' });
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const handleSyncToSupabase = useCallback(async (gameNameInput?: any, isAutoSaveInput?: boolean) => {
        const isAutoSave = (typeof gameNameInput === 'boolean') ? gameNameInput : (isAutoSaveInput === true);

        // Build a standardized game name: "Equipo vs Rival · DD MMM YYYY"
        const myTeam = gameState.settings.myTeam?.trim() || '';
        const rival = (typeof gameNameInput === 'string' && gameNameInput.trim().length > 0)
            ? gameNameInput.trim()
            : (gameState.settings.gameName?.trim() || '');
        const dateStr = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });

        // Build the label only with what's available — no placeholder fallbacks
        let gameNameLabel: string;
        if (myTeam && rival) {
            gameNameLabel = `${myTeam} vs ${rival}`;
        } else if (myTeam) {
            gameNameLabel = myTeam;
        } else if (rival) {
            gameNameLabel = `vs ${rival}`;
        } else {
            gameNameLabel = 'Partido';
        }
        const gameName = `${gameNameLabel} · ${dateStr}`;

        if (isAutoSave) {
            setIsAutoSaving(true);
        } else {
            setSyncState({ status: 'syncing', message: 'Sincronizando con la nube...' });
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuario no autenticado");

            const gamePayload = {
                id: gameState.gameId || undefined,
                game_mode: gameState.gameMode,
                settings: {
                    ...gameState.settings,
                    gameName: gameName.trim(),
                    teamFouls: gameState.teamFouls // Move into settings to avoid schema error
                },
                player_names: gameState.playerNames,
                available_players: gameState.availablePlayers,
                tournament_id: gameState.settings.tournamentId || null,
                my_team_name: gameState.settings.myTeam || null,
                opponent_name: gameName.trim(),
                fixture_id: gameState.settings.fixture_id || null,
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

            // Sync Shots
            if (gameState.gameMode === 'shot-chart') {
                await supabase.from('shots').delete().eq('game_id', newGameId);
                if (gameState.shots.length > 0) {
                    const shotsPayload = gameState.shots.map(shot => ({
                        game_id: newGameId,
                        player_number: shot.playerNumber,
                        x: shot.position.x,
                        y: shot.position.y,
                        is_gol: shot.isGol,
                        gol_value: shot.golValue,
                        period: shot.period
                    }));
                    await supabase.from('shots').insert(shotsPayload);
                }
            }

            // Sync Tally Stats
            if (gameState.gameMode === 'stats-tally' && Object.keys(gameState.tallyStats).length > 0) {
                const statsPayload: any[] = [];
                for (const playerNumber in gameState.tallyStats) {
                    const playerTally = gameState.tallyStats[playerNumber];
                    Object.keys(playerTally).forEach(periodKey => {
                        const periodStats = playerTally[periodKey as GamePeriod];
                        statsPayload.push({
                            game_id: newGameId,
                            player_number: playerNumber,
                            period: periodKey,
                            goles: periodStats.goles,
                            triples: periodStats.triples,
                            fallos: periodStats.fallos,
                            recuperos: periodStats.recuperos,
                            perdidas: periodStats.perdidas,
                            rebote_ofensivo: periodStats.reboteOfensivo,
                            rebote_defensivo: periodStats.reboteDefensivo,
                            asistencias: periodStats.asistencias,
                            golescontra: periodStats.golesContra,
                            faltas_personales: periodStats.faltasPersonales
                        });
                    });
                }
                const { error: tallyStatsError } = await supabase.from('tally_stats').upsert(statsPayload, { onConflict: 'game_id,player_number,period' });
                if (tallyStatsError) throw tallyStatsError;
            }

            if (gameState.gameId !== newGameId) {
                setGameState(prev => ({ ...prev, gameId: newGameId, settings: { ...prev.settings, gameName: gameName.trim() } }));
            }

            setLastSaved(new Date());
            if (!isAutoSave) {
                setSyncState({ status: 'success', message: '¡Partido guardado con éxito!' });
            }
            showToast('¡Partido guardado en la nube!', 'success');
        } catch (error: any) {
            console.error('Sync Error:', error);
            if (!isAutoSave) {
                setSyncState({ status: 'error', message: error.message });
            }
            showToast(`Error al guardar: ${error.message}`, 'error');
        } finally {
            setIsAutoSaving(false);
        }
    }, [gameState, setGameState]);

    const handleLoadGame = useCallback(async (gameId: string, enableEditing: boolean = false) => {
        setIsLoading(true);
        console.log(`[SyncContext] Cargando partido: ${gameId} (editar: ${enableEditing})`);
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
            console.log('[SyncContext] Game metadata cargada correctamente');

            if (!enableEditing) {
                try {
                    const currentViews = gameData.views || 0;
                    await supabase.from('games').update({ views: currentViews + 1 }).eq('id', gameId);
                } catch (err) {
                    console.warn('Could not increment view count', err);
                }
            }

            const loadedShots = (shotsRes.data || []).map((s: any) => ({
                id: s.id,
                playerNumber: s.player_number?.toString(),
                position: s.position || { x: s.x, y: s.y },
                isGol: s.is_gol,
                golValue: s.gol_value,
                period: s.period
            }));

            const loadedTallyStats: any = {};
            
            // 1. Prioridad: Relational DB Table (tally_stats)
            if (tallyRes.data && tallyRes.data.length > 0) {
                console.log(`[SyncContext] Cargando ${tallyRes.data.length} filas de tally_stats`);
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
            
            // 2. Fallback: JSON storage (Legacy or double-save)
            const sourceStats = gameData.settings?.tallyStats || gameData.tallyStats;
            if (sourceStats && Object.keys(sourceStats).length > 0) {
                console.log('[SyncContext] Mergeando datos de fallback JSON');
                Object.entries(sourceStats).forEach(([player, plStats]: [string, any]) => {
                    const pKey = player.toString();
                    if (!loadedTallyStats[pKey]) {
                        loadedTallyStats[pKey] = JSON.parse(JSON.stringify(initialPlayerTally));
                    }
                    
                    if (plStats['First Half'] || plStats['Second Half']) {
                        Object.keys(plStats).forEach(period => {
                            if (loadedTallyStats[pKey][period]) {
                                // Merge only if the relational table didn't already provide better data
                                // Or overwrite if relational was empty for this specific period
                                const isRelationalEmpty = !tallyRes.data?.some(r => r.player_number?.toString() === pKey && r.period === period);
                                if (isRelationalEmpty) {
                                    loadedTallyStats[pKey][period] = {
                                        ...loadedTallyStats[pKey][period],
                                        ...plStats[period],
                                        // Ensure cross-compatibility of field names in JSON
                                        reboteOfensivo: plStats[period].reboteOfensivo ?? plStats[period].rebote_ofensivo ?? 0,
                                        reboteDefensivo: plStats[period].reboteDefensivo ?? plStats[period].rebote_defensivo ?? 0,
                                        golesContra: plStats[period].golesContra ?? plStats[period].goles_contra ?? plStats[period].golescontra ?? 0,
                                        faltasPersonales: plStats[period].faltasPersonales ?? plStats[period].faltas_personales ?? 0
                                    };
                                }
                            }
                        });
                    } else if (typeof plStats === 'object') {
                        // Very old legacy format without periods
                        const isRelationalEmpty = !tallyRes.data?.some(r => r.player_number?.toString() === pKey);
                        if (isRelationalEmpty) {
                            loadedTallyStats[pKey]['First Half'] = {
                                ...loadedTallyStats[pKey]['First Half'],
                                goles: plStats.goles || 0,
                                triples: plStats.triples || 0,
                                fallos: plStats.fallos || 0,
                                recuperos: plStats.recuperos || 0,
                                perdidas: plStats.perdidas || 0,
                                reboteOfensivo: plStats.reboteOfensivo ?? plStats.rebote_ofensivo ?? 0,
                                reboteDefensivo: plStats.reboteDefensivo ?? plStats.rebote_defensivo ?? 0,
                                asistencias: plStats.asistencias || 0,
                                golesContra: plStats.golesContra ?? plStats.goles_contra ?? plStats.golescontra ?? 0,
                                faltasPersonales: plStats.faltasPersonales ?? plStats.faltas_personales ?? 0
                            };
                        }
                    }
                });
            }

            const loadedGameState = {
                ...initialGameState,
                gameId: gameData.id,
                gameMode: gameData.game_mode,
                isSetupComplete: true,
                hasSeenHomepage: true,
                settings: {
                    ...gameData.settings,
                    tournamentId: gameData.tournament_id || gameData.settings?.tournamentId,
                    tournamentName: gameData.tournaments?.name || gameData.settings?.tournamentName
                },
                availablePlayers: gameData.available_players || [],
                playerNames: gameData.player_names || {},
                activePlayers: (gameData.available_players || []).slice(0, 6),
                shots: loadedShots,
                tallyStats: loadedTallyStats,
                teamFouls: gameData.settings?.teamFouls || gameData.team_fouls || initialGameState.teamFouls,
                isReadOnly: !enableEditing,
            };

            setGameState(loadedGameState as any);
            if (enableEditing) setLastSaved(new Date());
            
            return gameData.game_mode;

        } catch (error: any) {
            console.error('Load Error:', error);
            alert(`No se pudo cargar el partido: ${error.message}`);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [setGameState, initialPlayerTally, initialGameState]);

    return (
        <SyncContext.Provider value={{ syncState, setSyncState, isAutoSaving, isLoading, lastSaved, handleSyncToSupabase, handleLoadGame }}>
            {children}
        </SyncContext.Provider>
    );
};

export const useSync = () => {
    const context = useContext(SyncContext);
    if (!context) throw new Error('useSync must be used within SyncProvider');
    return context;
};
