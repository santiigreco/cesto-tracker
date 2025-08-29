import React, { useEffect } from 'react';
import { AppTab } from '../types';
import ShareIcon from './ShareIcon';
import XIcon from './XIcon';
import WhatsappIcon from './WhatsappIcon';
import ClipboardIcon from './ClipboardIcon';
import ChartPieIcon from './ChartPieIcon';
import ChartBarIcon from './ChartBarIcon';
import QuestionMarkCircleIcon from './QuestionMarkCircleIcon';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onShare: () => void;
  tabTranslations: { [key in AppTab]: string };
}

const MobileMenu: React.FC<MobileMenuProps> = React.memo(({ isOpen, onClose, activeTab, onSelectTab, onShare, tabTranslations }) => {
  const mainTabs: AppTab[] = ['logger', 'courtAnalysis', 'statistics'];
  const tabIcons: Record<AppTab, React.FC<{ className?: string }>> = {
    logger: ClipboardIcon,
    courtAnalysis: ChartPieIcon,
    statistics: ChartBarIcon,
    faq: QuestionMarkCircleIcon,
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
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const menuContainerClass = `fixed inset-0 z-40 transform transition-all duration-300 ease-out ${
    isOpen ? 'translate-x-0' : '-translate-x-full'
  }`;
  const backdropClass = `absolute inset-0 bg-black transition-opacity duration-300 ease-out ${
    isOpen ? 'opacity-60' : 'opacity-0'
  }`;
  const menuClass = 'relative z-10 w-64 h-full bg-slate-800 shadow-xl flex flex-col';

  return (
    <div className={menuContainerClass} role="dialog" aria-modal="true" aria-labelledby="menu-title">
      <div className={backdropClass} onClick={onClose} aria-hidden="true"></div>
      <div className={menuClass}>
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 id="menu-title" className="text-xl font-bold text-cyan-400">Menú</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Cerrar menú">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-grow p-2 overflow-y-auto">
          {mainTabs.map((tab) => {
            const Icon = tabIcons[tab];
            return (
              <button
                key={tab}
                onClick={() => onSelectTab(tab)}
                className={`w-full flex items-center text-left text-lg font-semibold px-4 py-3 my-1 rounded-md transition-colors ${
                  activeTab === tab
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className="h-6 w-6 mr-4" />
                <span className="flex-grow">{tabTranslations[tab]}</span>
              </button>
            );
          })}
          
          <div className="my-2 border-t border-slate-700 mx-2"></div>

          <button
            onClick={() => onSelectTab('faq')}
            className={`w-full flex items-center text-left text-lg font-semibold px-4 py-3 my-1 rounded-md transition-colors ${
              activeTab === 'faq'
                ? 'bg-cyan-600 text-white'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <QuestionMarkCircleIcon className="h-6 w-6 mr-4" />
            <span>{tabTranslations['faq']}</span>
          </button>
        </nav>
        <div className="p-4 border-t border-slate-700 space-y-2">
          <button
            onClick={onShare}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            <ShareIcon className="h-5 w-5" />
            <span>Compartir App</span>
          </button>
           <a
            href="https://api.whatsapp.com/send/?phone=5491163303194&text=Hola!%20Estuve%20probando%20la%20app%20Cesto%20Tracker%20y...."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
           >
            <WhatsappIcon className="h-5 w-5" />
            <span>Enviar Feedback</span>
          </a>
        </div>
      </div>
    </div>
  );
});

export default MobileMenu;
