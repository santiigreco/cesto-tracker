import React, { createContext, useContext, useState, useCallback, useMemo, useRef, ReactNode } from 'react';
import { AppTab, StatAction } from '../types';

export type ModalName =
    | 'auth'
    | 'clearSheet'
    | 'newGame'
    | 'returnHome'
    | 'reselect'
    | 'settings'
    | 'saveGame'
    | 'substitution'
    | 'share'
    | 'loadGame'
    | 'mobileMenu'
    | 'playerSelection'
    | 'finishMatch'
    | 'completeNames';

export interface AuthModalParams {
    initialMode?: 'login' | 'signup' | 'reset';
    title?: string;
    subtitle?: string;
    redirectPath?: string;
    onSuccess?: () => void;
}

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
    openAuthModal: (params?: AuthModalParams) => void;

    // Actions
    actionToAssign: StatAction | null;
    setActionToAssign: (action: StatAction | null) => void;
    // Notification
    notificationPopup: { type: 'caliente' | 'fria'; playerNumber: string } | null;
    setNotificationPopup: (popup: { type: 'caliente' | 'fria'; playerNumber: string } | null) => void;

    // Toast
    toast: { message: string; type: 'success' | 'error' | 'info' | 'warning' } | null;
    showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;

    // General actions
    handleShare: () => Promise<void>;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeTab, setActiveTab] = useState<AppTab>('tally');
    const [actionToAssign, setActionToAssign] = useState<StatAction | null>(null);
    const [notificationPopup, setNotificationPopup] = useState<{ type: 'caliente' | 'fria'; playerNumber: string } | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToast({ message, type });
        toastTimerRef.current = setTimeout(() => setToast(null), 3000);
    }, []);

    // Modal Manager State
    const [modals, setModals] = useState<Record<ModalName, ModalState>>({
        auth: { isOpen: false },
        clearSheet: { isOpen: false },
        newGame: { isOpen: false },
        returnHome: { isOpen: false },
        reselect: { isOpen: false },
        settings: { isOpen: false },
        saveGame: { isOpen: false },
        substitution: { isOpen: false },
        share: { isOpen: false },
        loadGame: { isOpen: false },
        mobileMenu: { isOpen: false },
        playerSelection: { isOpen: false },
        finishMatch: { isOpen: false },
        completeNames: { isOpen: false }
    });

    const openModal = useCallback((name: ModalName, params?: any) => {
        setModals(prev => ({
            ...prev,
            [name]: { isOpen: true, params }
        }));
    }, []);

    const closeModal = useCallback((name: ModalName) => {
        setModals(prev => {
            if (!prev[name]?.isOpen) return prev;
            return {
                ...prev,
                [name]: { isOpen: false, params: undefined }
            };
        });
    }, []);

    const openAuthModal = useCallback((params?: AuthModalParams) => {
        openModal('auth', params);
    }, [openModal]);

    const handleShare = useCallback(async () => {
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
    }, []);

    const contextValue = useMemo(() => ({
        activeTab, setActiveTab,
        modals, openModal, closeModal, openAuthModal,
        actionToAssign, setActionToAssign,
        notificationPopup, setNotificationPopup,
        toast, showToast,
        handleShare
    }), [
        activeTab,
        modals, openModal, closeModal, openAuthModal,
        actionToAssign,
        notificationPopup,
        toast, showToast,
        handleShare
    ]);

    return (
        <UIContext.Provider value={contextValue}>
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
