
import React from 'react';

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
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = React.memo(({ 
  title, 
  message, 
  confirmText, 
  cancelText, 
  onConfirm, 
  onClose,
  confirmButtonColor = 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  extraButtonText,
  onExtraClick,
  extraButtonColor = 'bg-slate-600 hover:bg-slate-700'
}) => {
  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] transition-opacity"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-6 sm:p-8 m-4 max-w-sm w-full text-center animate-in fade-in zoom-in duration-200">
        <h2 id="modal-title" className="text-2xl font-black text-white mb-4 tracking-tight italic drop-shadow-md">{title}</h2>
        <div className="text-slate-300 mb-8 leading-relaxed font-medium">
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex justify-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-xl transition-all active:scale-95 shadow-lg border border-slate-600/50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 text-white font-bold py-3 px-4 rounded-xl transition-all active:scale-95 shadow-lg ${confirmButtonColor}`}
            >
              {confirmText}
            </button>
          </div>
          {extraButtonText && onExtraClick && (
            <button
              onClick={onExtraClick}
              className={`w-full text-white font-bold py-3 px-4 rounded-xl transition-all active:scale-95 shadow-md border border-slate-600/30 ${extraButtonColor}`}
            >
              {extraButtonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default ConfirmationModal;