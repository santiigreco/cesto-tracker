import React from 'react';
import { AppTab, GameMode } from '../types';
import { ClipboardIcon } from './icons';
import { ChartPieIcon } from './icons';
import { ChartBarIcon } from './icons';
import { QuestionMarkCircleIcon } from './icons';

interface BottomNavigationProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  gameMode: GameMode;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onSelectTab, gameMode }) => {

  // Definimos las pestañas disponibles según el modo de juego
  const allTabs = gameMode === 'shot-chart'
    ? [
      { id: 'logger' as AppTab, label: 'Cancha', Icon: ClipboardIcon },
      { id: 'courtAnalysis' as AppTab, label: 'Análisis', Icon: ChartPieIcon },
      { id: 'statistics' as AppTab, label: 'Estadísticas', Icon: ChartBarIcon },
      { id: 'faq' as AppTab, label: 'Ayuda', Icon: QuestionMarkCircleIcon },
    ]
    : [
      { id: 'tally' as AppTab, label: 'Planilla', Icon: ClipboardIcon },
      { id: 'statistics' as AppTab, label: 'Estadísticas', Icon: ChartBarIcon },
      { id: 'faq' as AppTab, label: 'Ayuda', Icon: QuestionMarkCircleIcon },
    ];

  // Calculamos la clase de la grilla dinámicamente según la cantidad de pestañas (3 o 4)
  const gridColsClass = allTabs.length === 4 ? 'grid-cols-4' : 'grid-cols-3';

  return (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-slate-800 border-t border-slate-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)] safe-area-bottom">
      <div className={`grid h-full ${gridColsClass} mx-auto font-medium w-full`}>
        {allTabs.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTab(id)}
              className={`inline-flex flex-col items-center justify-center px-5 hover:bg-slate-700/50 group transition-all duration-200 
                  ${isActive ? 'bg-slate-700/30' : ''}`}
            >
              <Icon className={`w-6 h-6 mb-1 transition-transform duration-200 ${isActive ? 'text-cyan-400 scale-110' : 'text-slate-500 group-hover:text-cyan-300'}`} />
              <span className={`text-[10px] transition-colors ${isActive ? 'text-cyan-400 font-semibold' : 'text-slate-500 group-hover:text-cyan-300'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;