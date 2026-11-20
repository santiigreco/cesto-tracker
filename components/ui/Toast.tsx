import React, { useEffect, useState } from 'react';
import { AlertTriangleIcon, CheckCircleIcon, InfoCircleIcon } from '../icons';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  /** Total visible time in ms (fade-out starts ~300ms before). */
  durationMs?: number;
  /** Optional inline action, e.g. "Deshacer". */
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

const TOAST_STYLES: Record<
  ToastType,
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

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  durationMs = 3000,
  actionLabel,
  onAction,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => setIsVisible(false), Math.max(500, durationMs - 300));
    return () => clearTimeout(timer);
  }, [message, type, durationMs]);

  const { border, iconColor, Icon } = TOAST_STYLES[type];
  const hasAction = Boolean(actionLabel && onAction);

  const handleAction = () => {
    onAction?.();
    onDismiss?.();
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[110] max-w-[calc(100vw-2rem)] w-max transition-all duration-200 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      <div
        className={`bg-surface-elevated text-ink-primary rounded-xl shadow-modal flex items-center gap-2.5 border ${border} ${
          hasAction ? 'pl-4 pr-1.5 py-1.5' : 'px-4 py-3'
        }`}
      >
        <Icon className={`h-5 w-5 shrink-0 ${iconColor}`} />
        <span className="font-semibold text-sm sm:text-base break-words leading-snug tabular-nums">
          {message}
        </span>
        {hasAction && (
          <button
            type="button"
            onClick={handleAction}
            className="ml-1 min-h-[44px] px-3.5 rounded-lg bg-surface-hover hover:bg-surface-card border border-border-strong text-brand font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-colors active:scale-[0.97] touch-manipulation shrink-0"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;
