import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppTab, StatAction } from '../types';

export type ModalName =
    | 'clearSheet'
    | 'newGame'
    | 'returnHome'
    | 'reselect'
    | 'settings'
    | 'saveGame'
    | 'substitution'
    | 'share'
    | 'loadGame'
    | 'teamManager'
    | 'mobileMenu'
    | 'playerSelection'
    | 'profile';

export interface ModalState {
    isOpen: boolean;
    params?: any;
}

interface UIContextType {
    activeTab: AppTab;
    setActiveTab: (tab: AppTab) => void;

    // Modal Manager
    modals: Record<ModalName, ModalState>;
    openModal: (name: ModalName, params?: any) => void;
    closeModal: (name: ModalName) => void;

    // Actions
    actionToAssign: StatAction | null;
    setActionToAssign: (action: StatAction | null) => void;
    // Notification
    notificationPopup: { type: 'caliente' | 'fria'; playerNumber: string } | null;
    setNotificationPopup: (popup: { type: 'caliente' | 'fria'; playerNumber: string } | null) => void;

    // Toast
    toast: { message: string; type: 'success' | 'error' | 'info' } | null;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

    // General actions
    handleShare: () => Promise<void>;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeTab, setActiveTab] = useState<AppTab>('logger');
    const [actionToAssign, setActionToAssign] = useState<StatAction | null>(null);
    const [notificationPopup, setNotificationPopup] = useState<{ type: 'caliente' | 'fria'; playerNumber: string } | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Modal Manager State
    const [modals, setModals] = useState<Record<ModalName, ModalState>>({
        clearSheet: { isOpen: false },
        newGame: { isOpen: false },
        returnHome: { isOpen: false },
        reselect: { isOpen: false },
        settings: { isOpen: false },
        saveGame: { isOpen: false },
        substitution: { isOpen: false },
        share: { isOpen: false },
        loadGame: { isOpen: false },
        teamManager: { isOpen: false },
        mobileMenu: { isOpen: false },
        playerSelection: { isOpen: false },
        profile: { isOpen: false }
    });

    const openModal = (name: ModalName, params?: any) => {
        setModals(prev => ({
            ...prev,
            [name]: { isOpen: true, params }
        }));
    };

    const closeModal = (name: ModalName) => {
        setModals(prev => ({
            ...prev,
            [name]: { isOpen: false }
        }));
    };

    const handleShare = async () => {
        const shareData = {
            title: 'Cesto Tracker App',
            text: '¡Prueba Cesto Tracker para registrar y analizar los tiros de Cestoball!',
            url: window.location.href,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                navigator.clipboard.writeText(shareData.url);
                alert('Enlace de la app copiado al portapapeles.');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <UIContext.Provider value={{
            activeTab, setActiveTab,
            modals, openModal, closeModal,
            actionToAssign, setActionToAssign,
            notificationPopup, setNotificationPopup,
            toast, showToast,
            handleShare
        }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (context === undefined) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};
