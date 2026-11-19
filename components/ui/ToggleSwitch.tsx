import React from 'react';

interface ToggleSwitchProps {
  isEnabled: boolean;
  onToggle: () => void;
  ariaLabel?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = React.memo(({ isEnabled, onToggle, ariaLabel }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={ariaLabel}
      className="min-h-[36px] min-w-[48px] inline-flex items-center justify-center rounded-full touch-manipulation"
      role="switch"
      aria-checked={isEnabled}
    >
      <span
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 border ${
          isEnabled
            ? 'bg-brand-strong border-brand/40'
            : 'bg-surface-elevated border-border-strong'
        }`}
      >
        <span
          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ${
            isEnabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </span>
    </button>
  );
});

export default ToggleSwitch;
