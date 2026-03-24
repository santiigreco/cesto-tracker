import React from 'react';
import { AppTab, Settings, GameState, StatAction, GameEvent, ShotPosition, SavedTeam } from '../types';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { useGameContext, initialGameState } from '../context/GameContext';
import { useGameLogic } from '../hooks/useGameLogic';
import { useNavigate } from 'react-router-dom';

import MobileMenu from './MobileMenu';
import PlayerSelectionModal from './PlayerSelectionModal';
import LoadGameModal from './LoadGameModal';
import SaveGameModal from './SaveGameModal';
import SettingsModal from './SettingsModal';
import ShareModal from './ShareModal';
import SubstitutionModal from './SubstitutionModal';
import OutcomeModal from './OutcomeModal';
import ConfirmationModal from './ConfirmationModal';
import NotificationPopup from './NotificationPopup';
import GameEventEditModal from './GameEventEditModal';
import UserProfileModal from './UserProfileModal';
import Toast from './Toast';

interface AppModalsProps {
    tabTranslations: { [key in AppTab]: string };
    tabs: AppTab[];
    playersForTally: string[];
    actionLabel?: string;

    pendingShotPosition: ShotPosition | null;
    setPendingShotPosition: (pos: ShotPosition | null) => void;
    onOutcomeSelect: (isGol: boolean) => void;

    editingEvent: GameEvent | null;
    setEditingEvent: (e: GameEvent | null) => void;

    handleTeamLoadedFromHome?: (team: SavedTeam) => void;
}

import { useSync } from '../context/SyncContext';

const AppModals: React.FC<AppModalsProps> = (props) => {
    const { activeTab, setActiveTab, modals, openModal, closeModal, actionToAssign, setActionToAssign, notificationPopup, setNotificationPopup, toast, handleShare, showToast } = useUI();
    const navigate = useNavigate();
    const { user, handleLogout, handleLogin } = useAuth();
    const { gameState, setGameState } = useGameContext();
    const { syncState, setSyncState, handleSyncToSupabase, handleLoadGame } = useSync();

    const {
        handleSubstitution,
        handleUpdateTallyStat,
        handleClearSheet,
        handleConfirmNewGame,
        handleDeleteGameEvent,
        handleEditGameEvent
    } = useGameLogic();

    // Reconstruct wrappers from App logic to avoid passing down
    const handleAssignActionToPlayer = (playerNumber: string) => {
        if (actionToAssign) {
            handleUpdateTallyStat(playerNumber, actionToAssign, 1);
        }
        closeModal('playerSelection');
        setActionToAssign(null);
    };

    const handleConfirmClearSheet = () => {
        handleClearSheet();
        closeModal('clearSheet');
    };

    const handleConfirmNewGameWrapper = () => {
        handleConfirmNewGame();
        closeModal('newGame');
    };

    const handleConfirmReselectPlayers = () => {
        setGameState(prev => ({ ...prev, isSetupComplete: false }));
        closeModal('reselect');
    };

    const handleChangeMode = () => {
        setGameState(prev => ({ ...prev, isSetupComplete: false, gameMode: null }));
        closeModal('settings');
    };

    const handleRequestReturnHome = () => {
        setGameState({ ...initialGameState, hasSeenHomepage: false, tutorialStep: 1 });
        closeModal('returnHome');
        navigate('/');
    };

    const handleRequestNewGame = () => {
        closeModal('settings');
        useUI().openModal('newGame');
    };

    const handleRequestReselectPlayers = () => {
        closeModal('settings');
        useUI().openModal('reselect');
    };

    const handleConfirmFinalize = async () => {
        closeModal('finishMatch');
        showToast('Finalizando y guardando partido...', 'info');
        try {
            await handleSyncToSupabase(true);
            setActiveTab('statistics');
            showToast('¡Partido finalizado y guardado con éxito!', 'success');
        } catch (err: any) {
            showToast(`Error al guardar: ${err.message}`, 'error');
            setActiveTab('statistics');
        }
    };

    const handleGoToEditNames = () => {
        closeModal('finishMatch');
        openModal('substitution'); // Open substitution modal to edit names quickly
    };

    const hasMissingNames = gameState.availablePlayers.some(p => {
        const name = gameState.playerNames[p] || '';
        return !name || name === `Jugador #${p}` || name.includes('Jugador #');
    });


    const handleRequestSaveGame = () => {
        closeModal('settings');
        useUI().openModal('saveGame');
        setSyncState({ status: 'idle', message: '' });
    };

    const handleSettingsChange = (newSettings: Settings) => {
        setGameState(prev => ({ ...prev, settings: newSettings }));
    };

    return (
        <>
            <MobileMenu
                isOpen={modals.mobileMenu?.isOpen}
                onClose={() => closeModal('mobileMenu')}
                activeTab={activeTab}
                onSelectTab={(tab) => { setActiveTab(tab); closeModal('mobileMenu'); }}
                onShare={handleShare}
                tabTranslations={props.tabTranslations}
                tabs={props.tabs}
            />

            {modals.playerSelection?.isOpen && actionToAssign && (
                <PlayerSelectionModal
                    isOpen={modals.playerSelection?.isOpen}
                    onClose={() => { closeModal('playerSelection'); setActionToAssign(null); }}
                    onSelectPlayer={handleAssignActionToPlayer}
                    players={props.playersForTally}
                    playerNames={gameState.playerNames}
                    actionLabel={props.actionLabel || ''}
                />
            )}

            {modals.loadGame?.isOpen && (
                <LoadGameModal
                    isOpen={modals.loadGame?.isOpen}
                    onClose={() => closeModal('loadGame')}
                    onLoadGame={async (id) => {
                        closeModal('loadGame');
                        try {
                            await handleLoadGame(id, false);
                            setActiveTab('statistics');
                        } catch (err: any) {
                            showToast(`No se pudo cargar el partido: ${err.message}`, 'error');
                        }
                    }}
                    user={user}
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
                    onRequestChangeMode={handleChangeMode}
                    onRequestSaveGame={handleRequestSaveGame}
                    user={user}
                    onLogout={handleLogout}
                    onLogin={handleLogin}
                />
            )}

            <ShareModal
                isOpen={modals.share?.isOpen}
                onClose={() => closeModal('share')}
                gameState={gameState}
                playerStats={[]}
            />

            {modals.substitution?.isOpen && (
                <SubstitutionModal
                    isOpen={modals.substitution?.isOpen}
                    onClose={() => closeModal('substitution')}
                    onSubstitute={handleSubstitution}
                    activePlayers={gameState.activePlayers}
                    availablePlayers={gameState.availablePlayers}
                    playerNames={gameState.playerNames}
                />
            )}

            {props.pendingShotPosition && (
                <OutcomeModal
                    onOutcomeSelect={props.onOutcomeSelect}
                    onClose={() => props.setPendingShotPosition(null)}
                />
            )}

            {modals.clearSheet?.isOpen && (
                <ConfirmationModal
                    title="Limpiar Planilla"
                    message="¿Borrar todos los tiros?"
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
                    message="Se perderán los datos no guardados."
                    confirmText="Volver"
                    cancelText="Cancelar"
                    onConfirm={handleRequestReturnHome}
                    onClose={() => closeModal('returnHome')}
                />
            )}

            {modals.reselect?.isOpen && (
                <ConfirmationModal
                    title="Corregir Jugadores"
                    message="Volver a selección de equipo."
                    confirmText="Volver"
                    cancelText="Cancelar"
                    onConfirm={handleConfirmReselectPlayers}
                    onClose={() => closeModal('reselect')}
                    confirmButtonColor="bg-yellow-600 hover:bg-yellow-700"
                />
            )}

            {modals.finishMatch?.isOpen && (
                <ConfirmationModal
                    title="¿Finalizar Partido?"
                    message={
                        <div className="flex flex-col gap-4">
                            <p>Se guardarán los resultados finales en la nube y se generará el resumen estadístico.</p>
                            {hasMissingNames && (
                                <div className="bg-cyan-900/40 border border-cyan-500/30 p-3 rounded-lg flex gap-3 text-sm">
                                    <span className="text-xl">💡</span>
                                    <p className="text-cyan-100 italic">
                                        <strong>Sugerencia:</strong> Notamos que algunos jugadores no tienen nombre real cargado. 
                                        Cargarlos ahora asegurará un reporte Excel impecable.
                                    </p>
                                </div>
                            )}
                        </div>
                    }
                    confirmText="Finalizar y Guardar"
                    cancelText="Cancelar"
                    onConfirm={handleConfirmFinalize}
                    onClose={() => closeModal('finishMatch')}
                    confirmButtonColor="bg-red-600 hover:bg-red-700"
                    extraButtonText={hasMissingNames ? "Completar Nombres" : undefined}
                    onExtraClick={hasMissingNames ? handleGoToEditNames : undefined}
                    extraButtonColor="bg-slate-700 hover:bg-slate-600"
                />
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

            {user && modals.profile?.isOpen && (
                <UserProfileModal
                    isOpen={modals.profile.isOpen}
                    onClose={() => closeModal('profile')}
                    user={user}
                    onLogout={handleLogout}
                    onLoadGame={async (id, asOwner) => {
                        try {
                            await handleLoadGame(id, asOwner);
                            closeModal('profile');
                            setActiveTab('statistics');
                        } catch (err: any) {
                            showToast(`No se pudo cargar el partido: ${err.message}`, 'error');
                        }
                    }}
                />
            )}


            {toast && <Toast message={toast.message} type={toast.type} />}
        </>
    );
};

export default AppModals;
