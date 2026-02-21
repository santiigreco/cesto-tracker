


import React, { useState, useEffect } from 'react';
import { handleActionFeedback } from '../utils/haptics';

interface OutcomeModalProps {
  onOutcomeSelect: (isGol: boolean) => void;
  onClose: () => void;
}

/**
 * A modal that appears after a shot location is selected,
 * asking the user to confirm the outcome.
 */
const OutcomeModal: React.FC<OutcomeModalProps> = React.memo(({ onOutcomeSelect, onClose }) => {
  const [isClickable, setIsClickable] = useState(false);

  useEffect(() => {
    // Prevent immediate click-through by delaying clickability of the modal.
    const timer = setTimeout(() => {
      setIsClickable(true);
    }, 100); // A small delay is enough for the initial click event to pass.

    return () => clearTimeout(timer);
  }, []);

  const handleOutcomeClick = (isGol: boolean) => {
    handleActionFeedback(isGol);
    onOutcomeSelect(isGol);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      style={{ pointerEvents: isClickable ? 'auto' : 'none' }}
    >
      <div className="bg-slate-800 rounded-xl shadow-2xl p-6 sm:p-8 m-4 max-w-sm w-full text-center transform transition-all scale-100">
        <h2 id="modal-title" className="text-2xl font-bold text-white mb-8">Resultado del Tiro</h2>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => handleOutcomeClick(true)}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xl py-4 px-6 rounded-xl transition duration-300 ease-in-out transform hover:scale-105 shadow-lg border-b-[6px] border-emerald-700 active:border-b-0 active:translate-y-1.5 active:scale-95 focus:outline-none"
          >
            GOL
          </button>
          <button
            onClick={() => handleOutcomeClick(false)}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-black text-xl py-4 px-6 rounded-xl transition duration-300 ease-in-out transform hover:scale-105 shadow-lg border-b-[6px] border-rose-800 active:border-b-0 active:translate-y-1.5 active:scale-95 focus:outline-none"
          >
            FALLO
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-8 text-slate-500 hover:text-white transition duration-300"
          aria-label="Cancelar tiro"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
});

export default OutcomeModal;