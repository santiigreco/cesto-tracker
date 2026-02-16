
import React from 'react';
import UsersIcon from '../../UsersIcon';
import TrophyIcon from '../../TrophyIcon';
import CalendarIcon from '../../CalendarIcon';
import ChartBarIcon from '../../ChartBarIcon';
import { AdminTab } from '../types';

interface AdminSidebarProps {
    activeTab: AdminTab;
    setActiveTab: (tab: AdminTab) => void;
    isOwner: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, isOwner }) => {
    
    // Desktop Classes
    const desktopContainer = "hidden lg:flex w-64 bg-slate-800 border-r border-slate-700 flex-col py-6 gap-2 h-full";
    const desktopBtnBase = "flex items-center gap-4 px-6 py-3 mx-2 rounded-lg transition-all w-auto text-left";
    const desktopActive = "bg-cyan-600 text-white shadow-lg shadow-cyan-900/50";
    const desktopInactive = "text-slate-400 hover:bg-slate-700 hover:text-white";

    // Mobile Classes (Bottom Navigation)
    const mobileContainer = "lg:hidden w-full bg-slate-800 border-t border-slate-700 flex justify-around items-center h-16 safe-area-bottom z-50";
    const mobileBtnBase = "flex flex-col items-center justify-center w-full h-full p-1";
    const mobileActive = "text-cyan-400";
    const mobileInactive = "text-slate-500";

    const tabs = [
        { id: 'dashboard' as AdminTab, label: 'Resumen', icon: <ChartBarIcon className="h-6 w-6" /> },
        ...(isOwner ? [{ id: 'users' as AdminTab, label: 'Usuarios', icon: <UsersIcon className="h-6 w-6" /> }] : []),
        { id: 'tournaments' as AdminTab, label: 'Torneos', icon: <TrophyIcon rank={1} /> },
        { id: 'games' as AdminTab, label: 'Partidos', icon: <CalendarIcon className="h-6 w-6" /> },
    ];

    return (
        <>
            {/* Desktop View */}
            <div className={desktopContainer}>
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`${desktopBtnBase} ${activeTab === tab.id ? desktopActive : desktopInactive}`}
                    >
                        {tab.icon}
                        <span className="font-bold">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Mobile View */}
            <div className={mobileContainer}>
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`${mobileBtnBase} ${activeTab === tab.id ? mobileActive : mobileInactive}`}
                    >
                        <div className={`${activeTab === tab.id ? 'transform scale-110' : ''} transition-transform`}>
                            {/* Force Icon Size Consistency */}
                            {React.cloneElement(tab.icon as React.ReactElement<{ className?: string }>, { className: "h-6 w-6" })}
                        </div>
                        <span className="text-[10px] font-bold mt-1">{tab.label}</span>
                    </button>
                ))}
            </div>
        </>
    );
};
