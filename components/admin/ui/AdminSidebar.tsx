
import React from 'react';
import { UsersIcon } from '../../icons';
import { TrophyIcon } from '../../icons';
import { CalendarIcon } from '../../icons';
import { ChartBarIcon } from '../../icons';
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
        { id: 'fixture' as AdminTab, label: 'Resultados', icon: <CalendarIcon className="h-6 w-6" /> },
        { id: 'games' as AdminTab, label: 'En Vivo', icon: <div className="relative"><CalendarIcon className="h-6 w-6" /><span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span></div> },
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
