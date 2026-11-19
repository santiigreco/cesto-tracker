import React from 'react';
import { AppTab, GameMode } from '../../types';
import { ClipboardIcon, ChartBarIcon } from '../icons';

interface BottomNavigationProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  gameMode?: GameMode;
}

const ALL_TABS = [
  { id: 'tally' as AppTab, label: 'Planilla', Icon: ClipboardIcon },
  { id: 'statistics' as AppTab, label: 'Estadísticas', Icon: ChartBarIcon },
];

const BottomNavigation: React.FC<BottomNavigationProps> = React.memo(
  ({ activeTab, onSelectTab }) => {
    return (
      <nav
        aria-label="Navegación principal del partido"
        className="md:hidden fixed bottom-0 left-0 z-40 w-full h-16 bg-surface-card border-t border-border-subtle shadow-sticky safe-area-bottom"
      >
        <div className="grid h-full grid-cols-2 mx-auto w-full">
          {ALL_TABS.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectTab(id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative inline-flex flex-col items-center justify-center px-4 transition-colors touch-manipulation ${
                  isActive
                    ? 'text-brand bg-surface-elevated/40'
                    : 'text-ink-muted hover:text-ink-primary'
                }`}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute top-0 inset-x-8 h-0.5 rounded-full bg-brand"
                  />
                )}
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-bold leading-none">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }
);

export default BottomNavigation;
