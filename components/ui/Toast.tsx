import React, { useEffect, useState } from 'react';
import { AlertTriangleIcon, CheckCircleIcon, InfoCircleIcon } from '../icons';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

const TOAST_STYLES: Record<
  ToastProps['type'],
  { border: string; iconColor: string; Icon: React.FC<{ className?: string }> }
> = {
  success: {
    border: 'border-sport-goal/50',
    iconColor: 'text-sport-goal-light',
    Icon: CheckCircleIcon,
  },
  error: {
    border: 'border-sport-miss/50',
    iconColor: 'text-sport-miss-light',
    Icon: AlertTriangleIcon,
  },
  warning: {
    border: 'border-sport-warn/50',
    iconColor: 'text-sport-warn-light',
    Icon: AlertTriangleIcon,
  },
  info: {
    border: 'border-brand/40',
    iconColor: 'text-brand',
    Icon: InfoCircleIcon,
  },
};

const Toast: React.FC<ToastProps> = ({ message, type }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => setIsVisible(false), 2700);
    return () => clearTimeout(timer);
  }, [message, type]);

  const { border, iconColor, Icon } = TOAST_STYLES[type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[110] max-w-[calc(100vw-2rem)] w-max transition-all duration-200 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      <div
        className={`bg-surface-elevated text-ink-primary px-4 py-3 rounded-xl shadow-modal flex items-center gap-2.5 border ${border}`}
      >
        <Icon className={`h-5 w-5 shrink-0 ${iconColor}`} />
        <span className="font-semibold text-sm sm:text-base break-words leading-snug">
          {message}
        </span>
      </div>
    </div>
  );
};

export default Toast;
