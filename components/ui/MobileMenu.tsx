import React, { useEffect } from 'react';
import { AppTab } from '../../types';
import {
  BrandLogoMark,
  ChartBarIcon,
  ClipboardIcon,
  ShareIcon,
  WhatsappIcon,
  XIcon,
} from '../icons';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onShare: () => void;
  tabTranslations: { [key in AppTab]: string };
  tabs: AppTab[];
}

const MobileMenu: React.FC<MobileMenuProps> = React.memo(
  ({ isOpen, onClose, activeTab, onSelectTab, onShare, tabTranslations, tabs }) => {
    const tabIcons: Record<AppTab, React.FC<{ className?: string }>> = {
      tally: ClipboardIcon,
      statistics: ChartBarIcon,
    };

    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      if (isOpen) {
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleEscape);
      } else {
        document.body.style.overflow = '';
      }

      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
      };
    }, [isOpen, onClose]);

    const menuContainerClass = `fixed inset-0 z-50 transform transition-transform duration-200 ease-out ${
      isOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
    }`;
    const backdropClass = `absolute inset-0 bg-[#05080F]/80 transition-opacity duration-200 ${
      isOpen ? 'opacity-100' : 'opacity-0'
    }`;

    return (
      <div
        className={menuContainerClass}
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-title"
        aria-hidden={!isOpen}
      >
        <div className={backdropClass} onClick={onClose} aria-hidden="true" />
        <div className="relative z-10 w-72 h-full bg-surface-card border-r border-border-subtle shadow-modal flex flex-col">
          <div className="flex justify-between items-center px-4 py-3.5 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <BrandLogoMark className="h-6 w-6" />
              <h2 id="menu-title" className="text-base font-extrabold text-ink-primary">
                Menú
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-ink-muted hover:text-ink-primary hover:bg-surface-elevated transition-colors"
              aria-label="Cerrar menú"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-grow p-3 space-y-1.5 overflow-y-auto">
            {tabs.map((tab) => {
              const Icon = tabIcons[tab];
              if (!Icon) return null;
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => onSelectTab(tab)}
                  className={`w-full min-h-[48px] flex items-center text-left text-sm font-bold px-3.5 rounded-xl transition-colors border ${
                    isActive
                      ? 'bg-surface-elevated text-brand border-brand/40'
                      : 'text-ink-secondary hover:bg-surface-elevated/60 hover:text-ink-primary border-transparent'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3 shrink-0" />
                  <span className="flex-grow">{tabTranslations[tab]}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border-subtle space-y-2.5">
            <button
              type="button"
              onClick={onShare}
              className="w-full min-h-[44px] flex items-center justify-center gap-2.5 bg-surface-elevated hover:bg-surface-hover border border-border-strong text-ink-primary font-bold text-sm px-4 rounded-xl transition-colors"
            >
              <ShareIcon className="h-4 w-4 text-brand" />
              <span>Compartir App</span>
            </button>
            <a
              href="https://api.whatsapp.com/send/?phone=5491163303194&text=Hola!%20Estuve%20probando%20la%20app%20Cesto%20Tracker%20y...."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[44px] flex items-center justify-center gap-2.5 bg-sport-goal/15 hover:bg-sport-goal/25 border border-sport-goal/40 text-sport-goal-light font-bold text-sm px-4 rounded-xl transition-colors"
            >
              <WhatsappIcon className="h-4 w-4" />
              <span>Enviar Feedback</span>
            </a>
          </div>
        </div>
      </div>
    );
  }
);

export default MobileMenu;
