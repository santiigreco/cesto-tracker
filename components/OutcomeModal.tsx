

import React, { useState, useEffect } from 'react';

interface OutcomeModalProps {
  onOutcomeSelect: (isGol: boolean) => void;
  onClose: () => void;
}

/**
 * A modal that appears after a shot location is selected,
 * asking the user to confirm the outcome.
 */
const OutcomeModal: React.FC<OutcomeModalProps> = ({ onOutcomeSelect, onClose }) => {
  const [isClickable, setIsClickable] = useState(false);

  useEffect(() => {
    // Prevent immediate click-through by delaying clickability of the modal.
    const timer = setTimeout(() => {
      setIsClickable(true);
    }, 100); // A small delay is enough for the initial click event to pass.

    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      style={{ pointerEvents: isClickable ? 'auto' : 'none' }}
    >
      <div className="bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 m-4 max-w-sm w-full text-center transform transition-all scale-100">
        <h2 id="modal-title" className="text-2xl font-bold text-white mb-8">Resultado del Tiro</h2>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => onOutcomeSelect(true)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500"
          >
            Gol
          </button>
          <button
            onClick={() => onOutcomeSelect(false)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500"
          >
            Fallo
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-8 text-gray-500 hover:text-white transition duration-300"
          aria-label="Cancelar tiro"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default OutcomeModal;