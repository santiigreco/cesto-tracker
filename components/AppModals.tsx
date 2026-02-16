
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

interface AppModalsProps {
    // UI States
    activeTab: AppTab;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
    isPlayerSelectionModalOpen: boolean;
    setIsPlayerSelectionModalOpen: (isOpen: boolean) => void;
    isLoadGameModalOpen: boolean;
    setIsLoadGameModalOpen: (isOpen: boolean) => void;
    isSaveGameModalOpen: boolean;
    setIsSaveGameModalOpen: (isOpen: boolean) => void;
    isSettingsModalOpen: boolean;
    setIsSettingsModalOpen: (isOpen: boolean) => void;
    isShareModalOpen: boolean;
    setIsShareModalOpen: (isOpen: boolean) => void;
    isSubstitutionModalOpen: boolean;
    setIsSubstitutionModalOpen: (isOpen: boolean) => void;
    isClearSheetModalOpen: boolean;
    setIsClearSheetModalOpen: (isOpen: boolean) => void;
    isNewGameConfirmOpen: boolean;
    setIsNewGameConfirmOpen: (isOpen: boolean) => void;
    isReturnHomeConfirmOpen: boolean;
    setIsReturnHomeConfirmOpen: (isOpen: boolean) => void;
    isReselectConfirmOpen: boolean;
    setIsReselectConfirmOpen: (isOpen: boolean) => void;
    isTeamManagerOpen: boolean;
    setIsTeamManagerOpen: (isOpen: boolean) => void;
    
    // Data & Handlers
    onSelectTab: (tab: AppTab) => void;
    onShare: () => void;
    tabTranslations: { [key in AppTab]: string };
    tabs: AppTab[];
    
    actionToAssign: StatAction | null;
    setActionToAssign: (action: StatAction | null) => void;
    handleAssignActionToPlayer: (playerNumber: string) => void;
    playersForTally: string[];
    playerNames: Record<string, string>;
    actionLabel?: string;
    
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
    
    editingEvent: GameEvent | null;
    setEditingEvent: (e: GameEvent | null) => void;
    handleEditGameEvent: (id: string, player: string, action: StatAction) => void;
    handleDeleteGameEvent: (id: string) => void;
    
    handleTeamLoadedFromHome: (team: any) => void;
    
    setActiveTab: (tab: AppTab) => void;
}

const AppModals: React.FC<AppModalsProps> = (props) => {
    return (
        <>
            <MobileMenu 
                isOpen={props.isMobileMenuOpen} 
                onClose={() => props.setIsMobileMenuOpen(false)} 
                activeTab={props.activeTab} 
                onSelectTab={(tab) => { props.onSelectTab(tab); props.setIsMobileMenuOpen(false); }} 
                onShare={props.onShare} 
                tabTranslations={props.tabTranslations} 
                tabs={props.tabs} 
            />
            
            {props.isPlayerSelectionModalOpen && props.actionToAssign && (
                <PlayerSelectionModal 
                    isOpen={props.isPlayerSelectionModalOpen} 
                    onClose={() => { props.setIsPlayerSelectionModalOpen(false); props.setActionToAssign(null); }} 
                    onSelectPlayer={props.handleAssignActionToPlayer} 
                    players={props.playersForTally} 
                    playerNames={props.playerNames} 
                    actionLabel={props.actionLabel || ''} 
                />
            )}

            {props.isLoadGameModalOpen && (
                <LoadGameModal 
                    onClose={() => props.setIsLoadGameModalOpen(false)} 
                    onLoadGame={async (id) => { 
                        props.setIsLoadGameModalOpen(false); 
                        await props.handleLoadGame(id, false); 
                        props.setActiveTab('statistics');
                    }} 
                    user={props.user}
                />
            )}

            {props.isSaveGameModalOpen && (
                <SaveGameModal 
                    isOpen={props.isSaveGameModalOpen} 
                    onClose={() => props.setIsSaveGameModalOpen(false)} 
                    onSave={props.handleSyncToSupabase} 
                    syncState={props.syncState} 
                    initialGameName={props.gameName} 
                />
            )}
            
            {props.isSettingsModalOpen && (
                <SettingsModal 
                    settings={props.settings} 
                    setSettings={props.handleSettingsChange} 
                    onClose={() => props.setIsSettingsModalOpen(false)} 
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
                isOpen={props.isShareModalOpen} 
                onClose={() => props.setIsShareModalOpen(false)} 
                gameState={props.gameState} 
                playerStats={[]} 
            />

            {props.isSubstitutionModalOpen && (
                <SubstitutionModal 
                    isOpen={props.isSubstitutionModalOpen} 
                    onClose={() => props.setIsSubstitutionModalOpen(false)} 
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
            
            {props.isClearSheetModalOpen && (
                <ConfirmationModal 
                    title="Limpiar Planilla" 
                    message="¿Borrar todos los tiros?" 
                    confirmText="Sí, borrar" 
                    cancelText="Cancelar" 
                    onConfirm={props.handleConfirmClearSheet} 
                    onClose={() => props.setIsClearSheetModalOpen(false)} 
                />
            )}

            {props.isNewGameConfirmOpen && (
                <ConfirmationModal 
                    title="Nuevo Partido" 
                    message="Se perderán los datos actuales." 
                    confirmText="Sí, nuevo partido" 
                    cancelText="Cancelar" 
                    onConfirm={props.handleConfirmNewGameWrapper} 
                    onClose={() => props.setIsNewGameConfirmOpen(false)} 
                />
            )}

            {props.isReturnHomeConfirmOpen && (
                <ConfirmationModal 
                    title="Volver al Inicio" 
                    message="Se perderán los datos no guardados." 
                    confirmText="Volver" 
                    cancelText="Cancelar" 
                    onConfirm={props.handleConfirmReturnHome} 
                    onClose={() => props.setIsReturnHomeConfirmOpen(false)} 
                />
            )}

            {props.isReselectConfirmOpen && (
                <ConfirmationModal 
                    title="Corregir Jugadores" 
                    message="Volver a selección de equipo." 
                    confirmText="Volver" 
                    cancelText="Cancelar" 
                    onConfirm={props.handleConfirmReselectPlayers} 
                    onClose={() => props.setIsReselectConfirmOpen(false)} 
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

            {props.editingEvent && (
                <GameEventEditModal
                    isOpen={!!props.editingEvent}
                    onClose={() => props.setEditingEvent(null)}
                    event={props.editingEvent}
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

            {props.isTeamManagerOpen && (
                <TeamRosterModal
                    isOpen={props.isTeamManagerOpen}
                    onClose={() => props.setIsTeamManagerOpen(false)}
                    onLoadTeam={props.handleTeamLoadedFromHome}
                    currentSelection={{ name: '', players: [] }}
                />
            )}
        </>
    );
};

export default AppModals;
