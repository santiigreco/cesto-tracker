import { useState } from 'react';
import { GameEvent, StatAction } from '../types';

export type ModalType = 
  | 'clearSheet'
  | 'newGameConfirm'
  | 'returnHomeConfirm'
  | 'reselectConfirm'
  | 'settings'
  | 'saveGame'
  | 'substitution'
  | 'share'
  | 'loadGame'
  | 'teamManager'
  | 'mobileMenu'
  | 'playerSelection'
  | 'editEvent'
  | null;

export const useAppModals = () => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalProps, setModalProps] = useState<any>({});

  const openModal = (type: ModalType, props: any = {}) => {
    setActiveModal(type);
    setModalProps(props);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalProps({});
  };

  return {
    activeModal,
    modalProps,
    openModal,
    closeModal
  };
};
