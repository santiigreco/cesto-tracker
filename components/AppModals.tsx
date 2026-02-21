
import React from 'react';
import { AppTab, Settings, GameState, StatAction, GameEvent } from '../types';
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
import { SyncState } from '../hooks/useSupabaseSync';
import { ModalType } from '../hooks/useAppModals';

interface AppModalsProps {
    // Modal Manager
    activeModal: ModalType;
    modalProps: any;
    closeModal: () => void;
    
    // UI States
    activeTab: AppTab;
    
    // Data & Handlers
    onSelectTab: (tab: AppTab) => void;
    onShare: () => void;
    tabTranslations: { [key in AppTab]: string };
    tabs: AppTab[];
    
    handleAssignActionToPlayer: (playerNumber: string) => void;
    playersForTally: string[];
    playerNames: Record<string, string>;
    
    handleLoadGame: (id: string, asOwner: boolean) => Promise<void>;
    user: any;
    
    handleSyncToSupabase: (name: string) => void;
    syncState: SyncState;
    gameName?: string;
    
    settings: Settings;
    handleSettingsChange: (s: Settings) => void;
    handleRequestNewGame: () => void;
    handleRequestReselectPlayers: () => void;
    handleChangeMode: () => void;
    handleRequestSaveGame: () => void;
    handleLogout: () => void;
    handleLogin: () => void;
    
    gameState: GameState;
    
    handleSubstitution: (out: string, inp: string) => void;
    activePlayers: string[];
    availablePlayers: string[];
    
    pendingShotPosition: any;
    setPendingShotPosition: (pos: any) => void;
    onOutcomeSelect: (isGol: boolean) => void;
    
    handleConfirmClearSheet: () => void;
    handleConfirmNewGameWrapper: () => void;
    handleConfirmReturnHome: () => void;
    handleConfirmReselectPlayers: () => void;
    
    notificationPopup: any;
    setNotificationPopup: (val: any) => void;
    
    handleEditGameEvent: (id: string, player: string, action: StatAction) => void;
    handleDeleteGameEvent: (id: string) => void;
    
    handleTeamLoadedFromHome: (team: any) => void;
    
    setActiveTab: (tab: AppTab) => void;
}

const AppModals: React.FC<AppModalsProps> = (props) => {
    return (
        <>
            <MobileMenu 
                isOpen={props.activeModal === 'mobileMenu'} 
                onClose={props.closeModal} 
                activeTab={props.activeTab} 
                onSelectTab={(tab) => { props.onSelectTab(tab); props.closeModal(); }} 
                onShare={props.onShare} 
                tabTranslations={props.tabTranslations} 
                tabs={props.tabs} 
            />
            
            {props.activeModal === 'playerSelection' && (
                <PlayerSelectionModal 
                    isOpen={true} 
                    onClose={props.closeModal} 
                    onSelectPlayer={props.handleAssignActionToPlayer} 
                    players={props.playersForTally} 
                    playerNames={props.playerNames} 
                    actionLabel={props.modalProps.actionLabel || ''} 
                />
            )}

            {props.activeModal === 'loadGame' && (
                <LoadGameModal 
                    onClose={props.closeModal} 
                    onLoadGame={async (id) => { 
                        props.closeModal(); 
                        await props.handleLoadGame(id, false); 
                        props.setActiveTab('statistics');
                    }} 
                    user={props.user}
                />
            )}

            {props.activeModal === 'saveGame' && (
                <SaveGameModal 
                    isOpen={true} 
                    onClose={props.closeModal} 
                    onSave={props.handleSyncToSupabase} 
                    syncState={props.syncState} 
                    initialGameName={props.gameName} 
                />
            )}
            
            {props.activeModal === 'settings' && (
                <SettingsModal 
                    settings={props.settings} 
                    setSettings={props.handleSettingsChange} 
                    onClose={props.closeModal} 
                    onRequestNewGame={props.handleRequestNewGame} 
                    onRequestReselectPlayers={props.handleRequestReselectPlayers} 
                    onRequestChangeMode={props.handleChangeMode} 
                    onRequestSaveGame={props.handleRequestSaveGame}
                    user={props.user}
                    onLogout={props.handleLogout}
                    onLogin={props.handleLogin}
                />
            )}
            
            <ShareModal 
                isOpen={props.activeModal === 'share'} 
                onClose={props.closeModal} 
                gameState={props.gameState} 
                playerStats={[]} 
            />

            {props.activeModal === 'substitution' && (
                <SubstitutionModal 
                    isOpen={true} 
                    onClose={props.closeModal} 
                    onSubstitute={props.handleSubstitution} 
                    activePlayers={props.activePlayers} 
                    availablePlayers={props.availablePlayers} 
                    playerNames={props.playerNames} 
                />
            )}

            {props.pendingShotPosition && (
                <OutcomeModal 
                    onOutcomeSelect={props.onOutcomeSelect} 
                    onClose={() => props.setPendingShotPosition(null)} 
                />
            )}
            
            {props.activeModal === 'clearSheet' && (
                <ConfirmationModal 
                    title="Limpiar Planilla" 
                    message="¿Borrar todos los tiros?" 
                    confirmText="Sí, borrar" 
                    cancelText="Cancelar" 
                    onConfirm={props.handleConfirmClearSheet} 
                    onClose={props.closeModal} 
                />
            )}

            {props.activeModal === 'newGameConfirm' && (
                <ConfirmationModal 
                    title="Nuevo Partido" 
                    message="Se perderán los datos actuales." 
                    confirmText="Sí, nuevo partido" 
                    cancelText="Cancelar" 
                    onConfirm={props.handleConfirmNewGameWrapper} 
                    onClose={props.closeModal} 
                />
            )}

            {props.activeModal === 'returnHomeConfirm' && (
                <ConfirmationModal 
                    title="Volver al Inicio" 
                    message="Se perderán los datos no guardados." 
                    confirmText="Volver" 
                    cancelText="Cancelar" 
                    onConfirm={props.handleConfirmReturnHome} 
                    onClose={props.closeModal} 
                />
            )}

            {props.activeModal === 'reselectConfirm' && (
                <ConfirmationModal 
                    title="Corregir Jugadores" 
                    message="Volver a selección de equipo." 
                    confirmText="Volver" 
                    cancelText="Cancelar" 
                    onConfirm={props.handleConfirmReselectPlayers} 
                    onClose={props.closeModal} 
                    confirmButtonColor="bg-yellow-600 hover:bg-yellow-700" 
                />
            )}
            
            {props.notificationPopup && (
                <NotificationPopup 
                    type={props.notificationPopup.type} 
                    playerNumber={props.notificationPopup.playerNumber} 
                    playerName={props.playerNames[props.notificationPopup.playerNumber] || ''} 
                    threshold={props.notificationPopup.type === 'caliente' ? props.settings.manoCalienteThreshold : props.settings.manoFriaThreshold} 
                    onClose={() => props.setNotificationPopup(null)} 
                />
            )}

            {props.activeModal === 'editEvent' && props.modalProps.event && (
                <GameEventEditModal
                    isOpen={true}
                    onClose={props.closeModal}
                    event={props.modalProps.event}
                    onSave={props.handleEditGameEvent}
                    onDelete={props.handleDeleteGameEvent}
                    playerNames={props.playerNames}
                    availablePlayers={props.playersForTally}
                />
            )}
            
            {props.user && (
                <UserProfileModal 
                    isOpen={false} 
                    onClose={() => {}} 
                    user={props.user}
                    onLogout={props.handleLogout}
                    onLoadGame={async (id, asOwner) => {
                        await props.handleLoadGame(id, asOwner);
                        props.setActiveTab('logger');
                    }}
                />
            )}

            {props.activeModal === 'teamManager' && (
                <TeamRosterModal
                    isOpen={true}
                    onClose={props.closeModal}
                    onLoadTeam={props.handleTeamLoadedFromHome}
                    currentSelection={{ name: '', players: [] }}
                />
            )}
        </>
    );
};

export default AppModals;
