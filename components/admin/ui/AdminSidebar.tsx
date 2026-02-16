
import React from 'react';
import UsersIcon from '../../UsersIcon';
import TrophyIcon from '../../TrophyIcon';
import CalendarIcon from '../../CalendarIcon';
import { AdminTab } from '../types';

interface AdminSidebarProps {
    activeTab: AdminTab;
    setActiveTab: (tab: AdminTab) => void;
    isOwner: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, isOwner }) => {
    const buttonBaseClass = "flex items-center gap-4 px-6 py-3 mx-2 rounded-lg transition-all w-full text-left";
    const activeClass = "bg-cyan-600 text-white shadow-lg shadow-cyan-900/50";
    const inactiveClass = "text-slate-400 hover:bg-slate-700 hover:text-white";

    return (
        <div className="w-20 lg:w-64 bg-slate-800 border-r border-slate-700 flex flex-col py-6 gap-2">
            <button 
                onClick={() => setActiveTab('dashboard')}
                className={`${buttonBaseClass} ${activeTab === 'dashboard' ? activeClass : inactiveClass}`}
                aria-label="Dashboard Resumen"
            >
                <div className="h-6 w-6"><UsersIcon /></div>
                <span className="hidden lg:block font-bold">Resumen</span>
            </button>
            
            {isOwner && (
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`${buttonBaseClass} ${activeTab === 'users' ? activeClass : inactiveClass}`}
                    aria-label="Gestión de Usuarios"
                >
                    <div className="h-6 w-6"><UsersIcon /></div>
                    <span className="hidden lg:block font-bold">Usuarios</span>
                </button>
            )}

            <button 
                onClick={() => setActiveTab('tournaments')}
                className={`${buttonBaseClass} ${activeTab === 'tournaments' ? activeClass : inactiveClass}`}
                aria-label="Gestión de Torneos"
            >
                <div className="h-6 w-6"><TrophyIcon rank={1} /></div>
                <span className="hidden lg:block font-bold">Torneos</span>
            </button>

            <button 
                onClick={() => setActiveTab('games')}
                className={`${buttonBaseClass} ${activeTab === 'games' ? activeClass : inactiveClass}`}
                aria-label="Gestión de Partidos"
            >
                <div className="h-6 w-6"><CalendarIcon /></div>
                <span className="hidden lg:block font-bold">Partidos</span>
            </button>
        </div>
    );
};
