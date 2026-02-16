
import React, { useState } from 'react';
import XIcon from './XIcon';
import RefreshIcon from './RefreshIcon';
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
    // Simple refresh trigger that can be passed down if needed, 
    // though hooks handle their own initial fetch.
    // Ideally, a context or query client handles this, but forcing a remount of components works for simple refresh.
    const [refreshKey, setRefreshKey] = useState(0); 

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[60] p-4 animate-fade-in backdrop-blur-md">
            <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col border border-slate-700 overflow-hidden focus-trap">
                
                {/* --- HEADER --- */}
                <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-800 shrink-0">
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
                            aria-label="Refrescar datos"
                        >
                            <RefreshIcon className="h-5 w-5" />
                        </button>
                        <button 
                            onClick={onClose} 
                            className="p-2 rounded-lg bg-slate-700 hover:bg-red-600 text-white transition-colors active:scale-95"
                            aria-label="Cerrar panel"
                        >
                            <XIcon />
                        </button>
                    </div>
                </div>

                <div className="flex flex-grow overflow-hidden">
                    {/* --- SIDEBAR --- */}
                    <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} isOwner={isOwner} />

                    {/* --- MAIN CONTENT AREA --- */}
                    <div className="flex-grow bg-slate-900 p-6 overflow-hidden relative" key={refreshKey}>
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
