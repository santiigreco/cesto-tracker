import React from 'react';
import ModalShell from '../ui/ModalShell';

interface ConfirmationModalProps {
  title: string;
  message: string | React.ReactNode;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmButtonColor?: string;
  extraButtonText?: string;
  onExtraClick?: () => void;
  extraButtonColor?: string;
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = React.memo(
  ({
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onClose,
    confirmButtonColor = 'bg-sport-miss hover:bg-red-500',
    extraButtonText,
    onExtraClick,
    extraButtonColor = 'bg-surface-elevated hover:bg-surface-hover border border-border-strong',
    isLoading = false,
  }) => {
    const modalFooter = (
      <div className="flex flex-col gap-2.5">
        <div className="flex justify-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 min-h-[44px] bg-surface-elevated hover:bg-surface-hover disabled:opacity-50 text-ink-primary font-bold py-2.5 px-4 rounded-xl transition-colors active:scale-[0.98] border border-border-strong text-sm touch-manipulation"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 min-h-[44px] text-white font-bold py-2.5 px-4 rounded-xl transition-colors active:scale-[0.98] disabled:opacity-50 text-sm touch-manipulation ${confirmButtonColor}`}
          >
            {isLoading ? 'Guardando...' : confirmText}
          </button>
        </div>
        {extraButtonText && onExtraClick && (
          <button
            type="button"
            onClick={onExtraClick}
            disabled={isLoading}
            className={`w-full min-h-[44px] text-ink-primary font-bold py-2.5 px-4 rounded-xl transition-colors active:scale-[0.98] disabled:opacity-50 text-sm touch-manipulation ${extraButtonColor}`}
          >
            {extraButtonText}
          </button>
        )}
      </div>
    );

    return (
      <ModalShell
        isOpen={true}
        onClose={onClose}
        title={title}
        titleId="modal-title"
        maxWidth="sm"
        zIndexClass="z-[100]"
        disableClose={isLoading}
        footer={modalFooter}
      >
        <div className="text-ink-secondary text-sm sm:text-base leading-relaxed font-medium text-center">
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>
      </ModalShell>
    );
  }
);

export default ConfirmationModal;
