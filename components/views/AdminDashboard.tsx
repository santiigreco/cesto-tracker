import React, { useState } from 'react';
import { XIcon, RefreshIcon } from '../icons';
import { AdminTab } from '../admin/types';
import { AdminSidebar } from '../admin/ui/AdminSidebar';
import { AdminOverview } from '../admin/views/AdminOverview';
import { AdminUsersView } from '../admin/views/AdminUsersView';
import { AdminGamesView } from '../admin/views/AdminGamesView';

interface AdminDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    isOwner: boolean;
    onLoadGame: (gameId: string, asOwner: boolean) => void;
}

const headerBtnClass =
    'min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-surface-elevated hover:bg-surface-hover border border-border-strong text-ink-secondary hover:text-ink-primary transition-colors active:scale-95';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose, isOwner, onLoadGame }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#05080F]/85 flex items-center justify-center z-[60] p-0 sm:p-4 animate-fade-in">
            <div className="bg-surface-canvas rounded-none sm:rounded-2xl shadow-modal w-full max-w-7xl h-full sm:h-[95vh] flex flex-col lg:flex-row border-0 sm:border border-border-subtle overflow-hidden focus-trap">
                {/* --- MOBILE HEADER --- */}
                <div className="lg:hidden flex justify-between items-center px-4 py-3 border-b border-border-subtle bg-surface-card shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <h2 className="text-base font-black text-ink-primary tracking-tight uppercase truncate">
                            Panel de Control
                        </h2>
                        {isOwner && (
                            <span className="px-2 py-0.5 bg-sport-miss/15 text-sport-miss-light border border-sport-miss/40 text-[10px] rounded-md uppercase tracking-widest font-extrabold shrink-0">
                                Owner
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={handleRefresh}
                            className={headerBtnClass}
                            title="Recargar vista actual"
                            aria-label="Recargar vista actual"
                        >
                            <RefreshIcon className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`${headerBtnClass} hover:text-sport-miss-light`}
                            title="Cerrar panel"
                            aria-label="Cerrar panel"
                        >
                            <XIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* --- SIDEBAR / BOTTOM NAV --- */}
                <div className="order-2 lg:order-1 shrink-0">
                    <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} isOwner={isOwner} />
                </div>

                {/* --- MAIN CONTENT AREA --- */}
                <div className="flex-grow bg-surface-canvas overflow-hidden relative order-1 lg:order-2 flex flex-col">
                    {/* Desktop Header */}
                    <div className="hidden lg:flex justify-between items-center px-6 py-4 border-b border-border-subtle bg-surface-card shrink-0">
                        <div>
                            <h2 className="text-xl font-black text-ink-primary tracking-tight flex items-center gap-2.5">
                                <span>CONTROL DE MANDO</span>
                                {isOwner && (
                                    <span className="px-2 py-0.5 bg-sport-miss/15 text-sport-miss-light border border-sport-miss/40 text-[10px] rounded-md uppercase tracking-widest font-extrabold">
                                        Owner
                                    </span>
                                )}
                            </h2>
                            <p className="text-ink-muted text-xs mt-0.5">Gestión integral del sistema Cesto Tracker</p>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={handleRefresh}
                                className={headerBtnClass}
                                title="Recargar vista actual"
                                aria-label="Recargar vista actual"
                            >
                                <RefreshIcon className="h-5 w-5" />
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className={`${headerBtnClass} hover:text-sport-miss-light`}
                                title="Cerrar panel"
                                aria-label="Cerrar panel"
                            >
                                <XIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-grow overflow-y-auto custom-scrollbar p-4 lg:p-6" key={refreshKey}>
                        {activeTab === 'dashboard' && <AdminOverview isOwner={isOwner} />}
                        {activeTab === 'users' && isOwner && <AdminUsersView isOwner={isOwner} />}
                        {activeTab === 'games' && <AdminGamesView onLoadGame={onLoadGame} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
