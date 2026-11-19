import React from 'react';
import ModalShell from './ModalShell';
import { FlameIcon, SnowflakeIcon } from '../icons';

interface NotificationPopupProps {
  type: 'caliente' | 'fria';
  playerNumber: string;
  playerName: string;
  threshold: number;
  onClose: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = React.memo(
  ({ type, playerNumber, playerName, threshold, onClose }) => {
    const isCaliente = type === 'caliente';
    const playerLabel = playerName || `Jugadora #${playerNumber}`;

    return (
      <ModalShell
        isOpen={true}
        onClose={onClose}
        title={isCaliente ? 'Mano Caliente' : 'Mano Fría'}
        subtitle="Racha detectada en cancha"
        titleId="notification-title"
        maxWidth="sm"
        zIndexClass="z-[100]"
        headerLeading={
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isCaliente
                ? 'bg-sport-warn/15 border-sport-warn/40 text-sport-warn-light'
                : 'bg-sport-triple/15 border-sport-triple/40 text-sport-triple-light'
            }`}
          >
            {isCaliente ? (
              <FlameIcon className="h-5 w-5" />
            ) : (
              <SnowflakeIcon className="h-5 w-5" />
            )}
          </div>
        }
        footer={
          <button
            type="button"
            onClick={onClose}
            className={`w-full min-h-[44px] font-bold text-sm rounded-xl transition-colors active:scale-[0.98] touch-manipulation ${
              isCaliente
                ? 'bg-sport-warn hover:bg-amber-500 text-ink-inverse'
                : 'bg-sport-triple hover:bg-sky-500 text-white'
            }`}
          >
            Entendido
          </button>
        }
      >
        <p className="text-ink-secondary text-sm sm:text-base leading-relaxed">
          {isCaliente
            ? `${playerLabel} convirtió ${threshold} tiros seguidos.`
            : `${playerLabel} falló ${threshold} tiros seguidos.`}
        </p>
      </ModalShell>
    );
  }
);

export default NotificationPopup;
