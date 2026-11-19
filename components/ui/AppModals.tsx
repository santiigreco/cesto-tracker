import React, { Suspense, lazy, useMemo, useState, useCallback } from 'react';
import { AppTab, Settings, GameEvent, SavedTeam } from '../../types';
import { useUI, MatchMetadataIntent } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import { useGameContext } from '../../context/GameContext';
import { useGameLogic } from '../../hooks/useGameLogic';
import { useNavigate } from 'react-router-dom';
import { useSync } from '../../context/SyncContext';
import { generateFederationExcel } from '../../utils/exportToExcel';
import { getActivePlayersFromMatch, hasCompleteMatchMetadata } from '../../utils/matchMetadata';
import { InfoCircleIcon } from '../icons';
import ModalShell from './ModalShell';

const MobileMenu = lazy(() => import('@/components/ui/MobileMenu'));
const PlayerSelectionModal = lazy(() => import('@/components/modals/PlayerSelectionModal'));
const LoadGameModal = lazy(() => import('@/components/modals/LoadGameModal'));
const SaveGameModal = lazy(() => import('@/components/modals/SaveGameModal'));
const SettingsModal = lazy(() => import('@/components/modals/SettingsModal'));
const ShareModal = lazy(() => import('@/components/modals/ShareModal'));
const ConfirmationModal = lazy(() => import('@/components/modals/ConfirmationModal'));
const NotificationPopup = lazy(() => import('@/components/ui/NotificationPopup'));
const GameEventEditModal = lazy(() => import('@/components/modals/GameEventEditModal'));
const MatchMetadataModal = lazy(() => import('@/components/modals/MatchMetadataModal'));

interface AppModalsProps {
    tabTranslations: { [key in AppTab]: string };
    tabs: AppTab[];
    playersForTally: string[];
    actionLabel?: string;

    editingEvent: GameEvent | null;
    setEditingEvent: (e: GameEvent | null) => void;

    handleTeamLoadedFromHome?: (team: SavedTeam) => void;
}

const EMPTY_PLAYERS: string[] = [];
const EMPTY_STATUSES: Record<string, string[]> = {};

const AppModals: React.FC<AppModalsProps> = React.memo((props) => {
    const {
        activeTab,
        setActiveTab,
        modals,
        openModal,
        closeModal,
        actionToAssign,
        setActionToAssign,
        notificationPopup,
        setNotificationPopup,
        handleShare,
        showToast
    } = useUI();
    const navigate = useNavigate();
    const { user, handleLogout } = useAuth();
    const { gameState, setGameState } = useGameContext();
    const { syncState, setSyncState, handleSyncToSupabase, handleLoadGame } = useSync();

    const {
        handleUpdateTallyStat,
        handleClearSheet,
        handleDeleteGameEvent,
        handleEditGameEvent,
        updatePlayerName,
        startQuickMatch,
        addPlayerToMatch,
    } = useGameLogic();

    const handleAssignActionToPlayer = useCallback((playerNumber: string) => {
        if (actionToAssign) {
            handleUpdateTallyStat(playerNumber, actionToAssign, 1);
        }
        closeModal('playerSelection');
        setActionToAssign(null);
    }, [actionToAssign, handleUpdateTallyStat, closeModal, setActionToAssign]);

    const handleConfirmClearSheet = useCallback(() => {
        handleClearSheet();
        closeModal('clearSheet');
    }, [handleClearSheet, closeModal]);

    const handleConfirmNewGameWrapper = useCallback(() => {
        startQuickMatch({ useLastSetup: true });
        closeModal('newGame');
        navigate('/match/new', { replace: true });
    }, [startQuickMatch, closeModal, navigate]);

    const handleConfirmReselectPlayers = useCallback(() => {
        closeModal('reselect');
        navigate('/setup', { state: { mode: 'edit' } });
    }, [closeModal, navigate]);

    const handleRequestReturnHome = useCallback(() => {
        closeModal('returnHome');
        navigate('/');
    }, [closeModal, navigate]);

    const handleRequestNewGame = useCallback(() => {
        closeModal('settings');
        openModal('newGame');
    }, [closeModal, openModal]);

    const handleRequestReselectPlayers = useCallback(() => {
        closeModal('settings');
        openModal('reselect');
    }, [closeModal, openModal]);

    const [isFinalizing, setIsFinalizing] = useState(false);

    const runFinalizeMatch = useCallback(async (stateOverride?: { settings: Settings; playerNames: Record<string, string> }) => {
        if (isFinalizing) return;
        setIsFinalizing(true);
        showToast('Finalizando y guardando partido...', 'info');
        try {
            const savedGameId = await handleSyncToSupabase(
                stateOverride?.settings.gameName ?? false,
                false,
                stateOverride
            );
            closeModal('finishMatch');
            setActiveTab('statistics');
            if (savedGameId) {
                showToast('¡Partido finalizado y guardado en la nube con éxito!', 'success');
            } else {
                showToast('Partido finalizado localmente. Verificá tu conexión o sesión para sincronizarlo.', 'warning');
            }
        } catch (err: any) {
            closeModal('finishMatch');
            showToast(`Error al guardar: ${err.message}`, 'error');
            setActiveTab('statistics');
        } finally {
            setIsFinalizing(false);
        }
    }, [isFinalizing, showToast, handleSyncToSupabase, closeModal, setActiveTab]);

    const handleConfirmFinalize = useCallback(() => {
        runFinalizeMatch();
    }, [runFinalizeMatch]);

    const handleGoToEditNames = useCallback(() => {
        closeModal('finishMatch');
        openModal('completeNames');
    }, [closeModal, openModal]);

    const isFinishMatchOpen = Boolean(modals.finishMatch?.isOpen);
    const playersForNameCompletion = useMemo(() => {
        const active = getActivePlayersFromMatch(gameState);
        if (active.length > 0) return active;
        return [...gameState.availablePlayers].sort((a, b) => Number(a) - Number(b));
    }, [gameState]);

    const hasMissingNames = useMemo(() => {
        if (!isFinishMatchOpen) return false;
        return playersForNameCompletion.some(p => {
            const name = gameState.playerNames?.[p] || '';
            return !name || name === `Jugador #${p}` || name.includes('Jugador #');
        });
    }, [isFinishMatchOpen, playersForNameCompletion, gameState.playerNames]);

    const handleRequestSaveGame = useCallback(() => {
        closeModal('settings');
        if (!hasCompleteMatchMetadata(gameState.settings)) {
            openModal('matchMetadata', { intent: 'save' });
            return;
        }
        openModal('saveGame');
        setSyncState({ status: 'idle', message: '' });
    }, [closeModal, openModal, setSyncState, gameState.settings]);

    const handleMatchMetadataConfirm = useCallback(async (
        updatedSettings: Settings,
        updatedPlayerNames: Record<string, string>
    ) => {
        setGameState(prev => ({
            ...prev,
            settings: updatedSettings,
            playerNames: updatedPlayerNames,
        }));

        const intent: MatchMetadataIntent = modals.matchMetadata?.params?.intent || 'edit';
        closeModal('matchMetadata');

        if (intent === 'edit') {
            showToast('Datos del partido actualizados', 'success');
            return;
        }

        if (intent === 'save') {
            if (!user) {
                openModal('saveGame');
                setSyncState({ status: 'idle', message: '' });
            } else {
                await handleSyncToSupabase(updatedSettings.gameName, false, {
                    settings: updatedSettings,
                    playerNames: updatedPlayerNames,
                });
            }
            return;
        }

        if (intent === 'finish') {
            await runFinalizeMatch({
                settings: updatedSettings,
                playerNames: updatedPlayerNames,
            });
            return;
        }

        if (intent === 'excel') {
            showToast('Generando planilla técnica oficial en Excel...', 'info');
            try {
                await generateFederationExcel({
                    ...gameState,
                    settings: updatedSettings,
                    playerNames: updatedPlayerNames,
                });
                showToast('¡Planilla oficial descargada con éxito!', 'success');
            } catch (err: any) {
                console.error('[EXCEL_EXPORT_ERROR]', err);
                showToast(`Error al exportar planilla: ${err?.message || 'Error desconocido'}`, 'error');
            }
            return;
        }

        if (intent === 'share') {
            openModal('share');
        }
    }, [
        setGameState,
        modals.matchMetadata?.params?.intent,
        closeModal,
        showToast,
        user,
        openModal,
        setSyncState,
        handleSyncToSupabase,
        runFinalizeMatch,
        gameState,
    ]);

    const isPlayerSelectionOpen = Boolean(modals.playerSelection?.isOpen && actionToAssign);

    // --- Dynamic Player Ordering Logic (computed ONLY when PlayerSelectionModal is open) ---
    const { sortedPlayersByRecentUsage, recentCount, playerStatuses } = useMemo(() => {
        if (!isPlayerSelectionOpen) {
            return {
                sortedPlayersByRecentUsage: EMPTY_PLAYERS,
                recentCount: 0,
                playerStatuses: EMPTY_STATUSES
            };
        }

        const log = gameState.gameLog || [];
        const usedSet = new Set<string>();
        const foulsByPlayer: Record<string, number> = {};
        const recentShotsByPlayer: Record<string, string[]> = {};

        for (let i = 0; i < log.length; i++) {
            const entry = log[i];
            const p = entry.playerNumber;
            if (!p) continue;
            usedSet.add(p);
            if (entry.action === 'faltasPersonales') {
                foulsByPlayer[p] = (foulsByPlayer[p] || 0) + 1;
            } else if (entry.action === 'goles' || entry.action === 'triples' || entry.action === 'fallos') {
                const arr = recentShotsByPlayer[p] || (recentShotsByPlayer[p] = []);
                if (arr.length < 3) {
                    arr.push(entry.action);
                }
            }
        }

        const usedPlayerNumbers = Array.from(usedSet).sort((a, b) => Number(a) - Number(b));
        const unusedPlayers = gameState.availablePlayers
            .filter(p => !usedSet.has(p))
            .sort((a, b) => Number(a) - Number(b));

        const statuses: Record<string, string[]> = {};
        for (let i = 0; i < gameState.availablePlayers.length; i++) {
            const p = gameState.availablePlayers[i];
            const list: string[] = [];
            const playerFouls = foulsByPlayer[p] || 0;
            if (playerFouls === 5) list.push('foul-warning');
            if (playerFouls >= 6) list.push('foul-out');

            const shots = recentShotsByPlayer[p];
            if (shots && shots.length === 3) {
                if (shots.every(a => a === 'goles' || a === 'triples')) list.push('hot');
                else if (shots.every(a => a === 'fallos')) list.push('cold');
            }
            statuses[p] = list;
        }

        return {
            sortedPlayersByRecentUsage: [...usedPlayerNumbers, ...unusedPlayers],
            recentCount: usedPlayerNumbers.length,
            playerStatuses: statuses
        };
    }, [isPlayerSelectionOpen, gameState.gameLog, gameState.availablePlayers]);

    const handleSettingsChange = useCallback((newSettings: Settings) => {
        setGameState(prev => ({ ...prev, settings: newSettings }));
    }, [setGameState]);

    return (
        <Suspense fallback={null}>
            {modals.mobileMenu?.isOpen && (
                <MobileMenu
                    isOpen={modals.mobileMenu?.isOpen}
                    onClose={() => closeModal('mobileMenu')}
                    activeTab={activeTab}
                    onSelectTab={(tab) => { setActiveTab(tab); closeModal('mobileMenu'); }}
                    onShare={handleShare}
                    tabTranslations={props.tabTranslations}
                    tabs={props.tabs}
                />
            )}

            {isPlayerSelectionOpen && (
                <PlayerSelectionModal
                    isOpen={true}
                    onClose={() => { closeModal('playerSelection'); setActionToAssign(null); }}
                    onSelectPlayer={handleAssignActionToPlayer}
                    onAddPlayer={addPlayerToMatch}
                    players={sortedPlayersByRecentUsage}
                    playerNames={gameState.playerNames}
                    actionLabel={props.actionLabel || ''}
                    actionKey={actionToAssign}
                    playerStatuses={playerStatuses}
                    recentCount={recentCount}
                />
            )}

            {modals.matchMetadata?.isOpen && (
                <MatchMetadataModal
                    isOpen={true}
                    intent={modals.matchMetadata.params?.intent || 'edit'}
                    gameState={gameState}
                    onClose={() => closeModal('matchMetadata')}
                    onConfirm={handleMatchMetadataConfirm}
                />
            )}

            {modals.loadGame?.isOpen && (
                <LoadGameModal
                    isOpen={modals.loadGame?.isOpen}
                    onClose={() => closeModal('loadGame')}
                    onLoadGame={async (id, editable) => {
                        closeModal('loadGame');
                        try {
                            const res = await handleLoadGame(id, !!editable);
                            if (!res) return;
                            if (editable) {
                                setActiveTab('tally');
                            } else {
                                setActiveTab('statistics');
                            }
                            navigate(`/match/${id}${editable ? '?edit=true' : ''}`);
                        } catch (err: any) {
                            showToast(`No se pudo cargar el partido: ${err.message}`, 'error');
                        }
                    }}
                    user={user}
                    onLogin={() => openModal('auth', { initialMode: 'login' })}
                />
            )}

            {modals.saveGame?.isOpen && (
                <SaveGameModal
                    isOpen={modals.saveGame?.isOpen}
                    onClose={() => closeModal('saveGame')}
                    onSave={handleSyncToSupabase}
                    syncState={syncState}
                    initialGameName={gameState.settings.gameName}
                />
            )}

            {modals.settings?.isOpen && (
                <SettingsModal
                    settings={gameState.settings}
                    setSettings={handleSettingsChange}
                    onClose={() => closeModal('settings')}
                    onRequestNewGame={handleRequestNewGame}
                    onRequestReselectPlayers={handleRequestReselectPlayers}
                    onRequestSaveGame={handleRequestSaveGame}
                    user={user}
                    onLogout={handleLogout}
                    onLogin={() => openModal('auth', { initialMode: 'login' })}
                />
            )}

            {modals.share?.isOpen && (
                <ShareModal
                    isOpen={modals.share?.isOpen}
                    onClose={() => closeModal('share')}
                    gameState={gameState}
                    playerStats={[]}
                />
            )}

            {modals.clearSheet?.isOpen && (
                <ConfirmationModal
                    title="Limpiar Planilla"
                    message="¿Borrar todas las estadísticas registradas en este partido?"
                    confirmText="Sí, borrar"
                    cancelText="Cancelar"
                    onConfirm={handleConfirmClearSheet}
                    onClose={() => closeModal('clearSheet')}
                />
            )}

            {modals.newGame?.isOpen && (
                <ConfirmationModal
                    title="Nuevo Partido"
                    message="Se perderán los datos actuales."
                    confirmText="Sí, nuevo partido"
                    cancelText="Cancelar"
                    onConfirm={handleConfirmNewGameWrapper}
                    onClose={() => closeModal('newGame')}
                />
            )}

            {modals.returnHome?.isOpen && (
                <ConfirmationModal
                    title="Volver al Inicio"
                    message="Tu partido actual seguirá guardado localmente en este dispositivo hasta que inicies uno nuevo."
                    confirmText="Volver al Inicio"
                    cancelText="Cancelar"
                    onConfirm={handleRequestReturnHome}
                    onClose={() => closeModal('returnHome')}
                    confirmButtonColor="bg-cyan-600 hover:bg-cyan-500"
                />
            )}

            {modals.reselect?.isOpen && (
                <ConfirmationModal
                    title="Editar Datos del Partido"
                    message="Podrás modificar equipos, torneo o configuración sin perder las estadísticas registradas."
                    confirmText="Editar"
                    cancelText="Cancelar"
                    onConfirm={handleConfirmReselectPlayers}
                    onClose={() => closeModal('reselect')}
                    confirmButtonColor="bg-yellow-600 hover:bg-yellow-700"
                />
            )}

            {isFinishMatchOpen && (
                <ConfirmationModal
                    title="¿Finalizar Partido?"
                    message={
                        <div className="flex flex-col gap-3 text-left">
                            <p className="text-center">Se guardarán los resultados finales en la nube y se generará el resumen estadístico.</p>
                            {hasMissingNames && (
                                <div className="bg-brand/10 border border-brand/30 p-3 rounded-xl flex items-start gap-2.5 text-xs sm:text-sm">
                                    <InfoCircleIcon className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                                    <p className="text-ink-secondary leading-snug">
                                        <strong className="text-ink-primary">Sugerencia:</strong> Algunas jugadoras todavía no tienen nombre cargado. Completarlas ahora deja la planilla Excel lista para presentar.
                                    </p>
                                </div>
                            )}
                        </div>
                    }
                    confirmText="Finalizar y Guardar"
                    cancelText="Cancelar"
                    onConfirm={handleConfirmFinalize}
                    onClose={() => closeModal('finishMatch')}
                    confirmButtonColor="bg-sport-miss hover:bg-red-500"
                    extraButtonText={hasMissingNames ? "Completar Nombres" : undefined}
                    onExtraClick={hasMissingNames ? handleGoToEditNames : undefined}
                    extraButtonColor="bg-surface-elevated hover:bg-surface-hover border border-border-strong"
                    isLoading={isFinalizing}
                />
            )}

            {modals.completeNames?.isOpen && (
                <ModalShell
                    isOpen={true}
                    onClose={() => { closeModal('completeNames'); openModal('finishMatch'); }}
                    title="Completar Nombres"
                    subtitle="Asigná nombres reales a los dorsales para el reporte oficial."
                    maxWidth="lg"
                    zIndexClass="z-[110]"
                    footer={
                        <button
                            type="button"
                            onClick={() => { closeModal('completeNames'); openModal('finishMatch'); }}
                            className="w-full min-h-[48px] bg-brand hover:bg-brand-hover text-ink-inverse font-extrabold rounded-xl transition-all active:scale-[0.98] tracking-wider uppercase text-xs sm:text-sm"
                        >
                            Listo, volver al cierre
                        </button>
                    }
                >
                    <div className="space-y-2.5">
                        {playersForNameCompletion.map(num => (
                            <div key={num} className="flex items-center gap-3 bg-surface-elevated/70 p-2 rounded-xl border border-border-subtle">
                                <div className="w-10 h-10 bg-brand/15 border border-brand/30 rounded-lg flex items-center justify-center font-extrabold text-brand text-xs tabular-nums shrink-0">
                                    #{num}
                                </div>
                                <input
                                    type="text"
                                    maxLength={40}
                                    placeholder={`Nombre jugadora #${num}`}
                                    aria-label={`Nombre jugadora #${num}`}
                                    className="flex-grow min-w-0 bg-surface-canvas border border-border-strong rounded-xl px-3 py-2 text-ink-primary text-base sm:text-sm focus:border-brand transition-colors font-medium placeholder-ink-muted"
                                    value={gameState.playerNames[num] || ''}
                                    onChange={(e) => updatePlayerName(num, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </ModalShell>
            )}

            {notificationPopup && (
                <NotificationPopup
                    type={notificationPopup.type}
                    playerNumber={notificationPopup.playerNumber}
                    playerName={gameState.playerNames[notificationPopup.playerNumber] || ''}
                    threshold={notificationPopup.type === 'caliente' ? gameState.settings.manoCalienteThreshold : gameState.settings.manoFriaThreshold}
                    onClose={() => setNotificationPopup(null)}
                />
            )}

            {props.editingEvent && (
                <GameEventEditModal
                    isOpen={!!props.editingEvent}
                    onClose={() => props.setEditingEvent(null)}
                    event={props.editingEvent}
                    onSave={handleEditGameEvent}
                    onDelete={handleDeleteGameEvent}
                    playerNames={gameState.playerNames}
                    availablePlayers={props.playersForTally}
                />
            )}
        </Suspense>
    );
});

export default AppModals;
