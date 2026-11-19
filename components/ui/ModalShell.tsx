import React, { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { XIcon } from '../icons';

const MAX_WIDTH_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
} as const;

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: string;
  titleId?: string;
  headerLeading?: React.ReactNode;
  maxWidth?: keyof typeof MAX_WIDTH_CLASSES;
  zIndexClass?: string;
  disableClose?: boolean;
  disableEscape?: boolean;
  footer?: React.ReactNode;
  bodyClassName?: string;
  fullHeight?: boolean;
  children: React.ReactNode;
}

const ModalShell: React.FC<ModalShellProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  titleId,
  headerLeading,
  maxWidth = 'md',
  zIndexClass = 'z-[80]',
  disableClose = false,
  disableEscape = false,
  footer,
  bodyClassName = 'p-4 sm:p-5 overflow-y-auto custom-scrollbar',
  fullHeight = false,
  children,
}) => {
  const generatedId = useId();
  const resolvedTitleId = titleId || `modal-title-${generatedId}`;

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !disableClose && !disableEscape) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, disableClose, disableEscape, onClose]);

  if (!isOpen) return null;

  const content = (
    <div
      className={`fixed inset-0 bg-[#05080F]/85 flex items-center justify-center ${zIndexClass} p-3 sm:p-4 animate-fade-in`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={resolvedTitleId}
      onClick={() => {
        if (!disableClose && !disableEscape) onClose();
      }}
    >
      <div
        className={`bg-surface-card border border-border-strong rounded-2xl shadow-modal w-full ${MAX_WIDTH_CLASSES[maxWidth]} ${
          fullHeight ? 'h-[92vh]' : 'max-h-[90vh]'
        } flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-4 py-3.5 sm:px-5 sm:py-4 border-b border-border-subtle bg-surface-card flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {headerLeading && <div className="shrink-0">{headerLeading}</div>}
            <div className="min-w-0">
              <h2
                id={resolvedTitleId}
                className="text-lg sm:text-xl font-extrabold text-ink-primary tracking-tight leading-tight"
              >
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs sm:text-sm text-ink-muted mt-0.5 leading-snug">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={disableClose}
            className="min-w-[44px] min-h-[44px] -mr-1.5 -my-1 flex items-center justify-center rounded-xl text-ink-muted hover:text-ink-primary hover:bg-surface-elevated transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 touch-manipulation"
            aria-label="Cerrar"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className={`flex-grow ${bodyClassName}`}>{children}</div>

        {footer && (
          <div className="px-4 py-3 sm:px-5 sm:py-4 border-t border-border-subtle bg-surface-card flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};

export default ModalShell;
