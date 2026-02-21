
import React, { useState } from 'react';
import { XIcon } from './icons';
import { RefreshIcon } from './icons';
import { AdminTab } from './admin/types';
import { AdminSidebar } from './admin/ui/AdminSidebar';
import { AdminOverview } from './admin/views/AdminOverview';
import { AdminUsersView } from './admin/views/AdminUsersView';
import { AdminTournamentsView } from './admin/views/AdminTournamentsView';
import { AdminGamesView } from './admin/views/AdminGamesView';

interface AdminDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    isOwner: boolean; 
    onLoadGame: (gameId: string, asOwner: boolean) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose, isOwner, onLoadGame }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const [refreshKey, setRefreshKey] = useState(0); 

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[60] p-0 sm:p-4 animate-fade-in backdrop-blur-md">
            <div className="bg-slate-900 rounded-none sm:rounded-2xl shadow-2xl w-full max-w-7xl h-full sm:h-[95vh] flex flex-col lg:flex-row border-0 sm:border border-slate-700 overflow-hidden focus-trap">
                
                {/* --- MOBILE HEADER (Solo visible en móvil) --- */}
                <div className="lg:hidden flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800 shrink-0">
                    <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        PANEL DE CONTROL
                    </h2>
                    <div className="flex gap-3">
                        <button onClick={handleRefresh} className="text-slate-400 hover:text-white"><RefreshIcon className="h-6 w-6" /></button>
                        <button onClick={onClose} className="text-slate-400 hover:text-red-500"><XIcon className="h-6 w-6" /></button>
                    </div>
                </div>

                {/* --- SIDEBAR / BOTTOM NAV --- */}
                {/* En Desktop es Sidebar (izquierda), en Mobile es Bottom Nav (abajo) */}
                <div className="order-2 lg:order-1 shrink-0">
                    <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} isOwner={isOwner} />
                </div>

                {/* --- MAIN CONTENT AREA --- */}
                <div className="flex-grow bg-slate-900 overflow-hidden relative order-1 lg:order-2 flex flex-col">
                    
                    {/* Desktop Header (Oculto en móvil) */}
                    <div className="hidden lg:flex justify-between items-center p-6 border-b border-slate-700 bg-slate-800 shrink-0">
                        <div>
                            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-3">
                                CONTROL DE MANDO {isOwner && <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] rounded uppercase tracking-widest font-sans">Owner</span>}
                            </h2>
                            <p className="text-slate-400 text-xs mt-1">Gestión integral del sistema Cesto Tracker</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={handleRefresh} 
                                className="p-2 rounded-lg bg-slate-700 hover:bg-cyan-600 text-white transition-all active:scale-95"
                                title="Recargar vista actual"
                            >
                                <RefreshIcon className="h-5 w-5" />
                            </button>
                            <button 
                                onClick={onClose} 
                                className="p-2 rounded-lg bg-slate-700 hover:bg-red-600 text-white transition-colors active:scale-95"
                            >
                                <XIcon />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-grow overflow-y-auto custom-scrollbar p-4 lg:p-6" key={refreshKey}>
                        {activeTab === 'dashboard' && <AdminOverview isOwner={isOwner} />}
                        {activeTab === 'users' && isOwner && <AdminUsersView isOwner={isOwner} />}
                        {activeTab === 'tournaments' && <AdminTournamentsView />}
                        {activeTab === 'games' && <AdminGamesView onLoadGame={onLoadGame} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
