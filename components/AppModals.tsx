import React from 'react';
import { AppTab, Settings, GameState, StatAction, GameEvent, ShotPosition, SavedTeam } from '../types';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { useGameContext, initialGameState } from '../context/GameContext';
import { useSupabaseSync } from '../hooks/useSupabaseSync';
import { useGameLogic } from '../hooks/useGameLogic';

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
import TeamRosterModal from './TeamRosterModal';

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

    handleTeamLoadedFromHome: (team: SavedTeam) => void;
}

const AppModals: React.FC<AppModalsProps> = (props) => {
    const {
        activeTab, setActiveTab,
        modals, closeModal,
        actionToAssign, setActionToAssign,
        notificationPopup, setNotificationPopup,
        handleShare
    } = useUI();

    const { user, handleLogout, handleLogin } = useAuth();
    const { gameState, setGameState } = useGameContext();
    const { syncState, setSyncState, handleSyncToSupabase, handleLoadGame } = useSupabaseSync();

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
    };

    const handleRequestNewGame = () => {
        closeModal('settings');
        useUI().openModal('newGame');
    };

    const handleRequestReselectPlayers = () => {
        closeModal('settings');
        useUI().openModal('reselect');
    };

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
                        await handleLoadGame(id, false);
                        setActiveTab('statistics');
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

            {user && (
                <UserProfileModal
                    isOpen={false}
                    onClose={() => { }}
                    user={user}
                    onLogout={handleLogout}
                    onLoadGame={async (id, asOwner) => {
                        await handleLoadGame(id, asOwner);
                        setActiveTab('logger');
                    }}
                />
            )}

            {modals.teamManager?.isOpen && (
                <TeamRosterModal
                    isOpen={modals.teamManager?.isOpen}
                    onClose={() => closeModal('teamManager')}
                    onLoadTeam={props.handleTeamLoadedFromHome}
                    currentSelection={{ name: '', players: [] }}
                />
            )}
        </>
    );
};

export default AppModals;
