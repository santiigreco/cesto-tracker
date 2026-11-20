import React from 'react';
import { UsersIcon, CalendarIcon, ChartBarIcon } from '../../icons';
import { AdminTab } from '../types';

interface AdminSidebarProps {
    activeTab: AdminTab;
    setActiveTab: (tab: AdminTab) => void;
    isOwner?: boolean;
    isAdmin?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, isOwner, isAdmin }) => {
    const desktopContainer = 'hidden lg:flex w-64 bg-surface-card border-r border-border-subtle flex-col py-5 px-3 gap-1.5 h-full';
    const desktopBtnBase = 'min-h-[44px] flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-colors w-full text-left text-sm font-bold';
    const desktopActive = 'bg-brand text-ink-inverse shadow-card';
    const desktopInactive = 'text-ink-secondary hover:bg-surface-elevated hover:text-ink-primary';

    const mobileContainer = 'lg:hidden w-full bg-surface-card border-t border-border-subtle flex justify-around items-center h-16 safe-area-bottom z-50';
    const mobileBtnBase = 'flex flex-col items-center justify-center w-full h-full p-1 transition-colors';
    const mobileActive = 'text-brand';
    const mobileInactive = 'text-ink-muted hover:text-ink-secondary';

    const canViewUsers = isAdmin ?? isOwner ?? true;

    const tabs = [
        { id: 'dashboard' as AdminTab, label: 'Resumen', icon: <ChartBarIcon className="h-5 w-5 shrink-0" /> },
        ...(canViewUsers ? [{ id: 'users' as AdminTab, label: 'Usuarios', icon: <UsersIcon className="h-5 w-5 shrink-0" /> }] : []),
        { id: 'games' as AdminTab, label: 'Historial', icon: <CalendarIcon className="h-5 w-5 shrink-0" /> },
    ];

    return (
        <>
            {/* Desktop View */}
            <nav aria-label="Navegación de administración" className={desktopContainer}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        aria-current={activeTab === tab.id ? 'page' : undefined}
                        className={`${desktopBtnBase} ${activeTab === tab.id ? desktopActive : desktopInactive}`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </nav>

            {/* Mobile View */}
            <nav aria-label="Navegación móvil de administración" className={mobileContainer}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        aria-current={activeTab === tab.id ? 'page' : undefined}
                        className={`${mobileBtnBase} ${activeTab === tab.id ? mobileActive : mobileInactive}`}
                    >
                        <div className={`${activeTab === tab.id ? 'scale-110' : ''} transition-transform`}>
                            {React.cloneElement(tab.icon as React.ReactElement<{ className?: string }>, { className: 'h-6 w-6' })}
                        </div>
                        <span className="text-[10px] font-bold mt-1">{tab.label}</span>
                    </button>
                ))}
            </nav>
        </>
    );
};
