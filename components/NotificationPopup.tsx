


import React from 'react';

interface NotificationPopupProps {
  type: 'caliente' | 'fria';
  playerNumber: string;
  playerName: string;
  threshold: number;
  onClose: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = React.memo(({ type, playerNumber, playerName, threshold, onClose }) => {
  const isCaliente = type === 'caliente';
  
  const content = {
    caliente: {
      title: 'Mano Caliente 🔥',
      message: `${playerName || `Jugador #${playerNumber}`} ha metido ${threshold} tiros seguidos. ¡Está imparable!`,
      buttonColor: 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-400',
    },
    fria: {
      title: 'Mano Fría ❄️',
      message: `${playerName || `Jugador #${playerNumber}`} ha fallado ${threshold} tiros seguidos. ¡Necesita recuperar la confianza!`,
      buttonColor: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-400',
    }
  };

  const { title, message, buttonColor } = content[type];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity"
      aria-labelledby="notification-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-slate-800 rounded-xl shadow-2xl p-6 sm:p-8 m-4 max-w-sm w-full text-center transform transition-all scale-100">
        <h2 id="notification-title" className="text-3xl font-bold text-white mb-4">{title}</h2>
        <p className="text-slate-300 text-lg mb-8">{message}</p>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className={`flex-1 ${buttonColor} text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800`}
          >
            ¡Entendido!
          </button>
        </div>
      </div>
    </div>
  );
});

export default NotificationPopup;