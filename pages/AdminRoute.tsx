
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import Loader from '../components/Loader';
import { AdminOverview } from '../components/admin/views/AdminOverview';
import { AdminUsersView } from '../components/admin/views/AdminUsersView';
import { AdminTournamentsView } from '../components/admin/views/AdminTournamentsView';
import { AdminGamesView } from '../components/admin/views/AdminGamesView';
import { AdminFixtureView } from '../components/admin/views/AdminFixtureView';
import { AdminSidebar } from '../components/admin/ui/AdminSidebar';
import { AdminTab } from '../components/admin/types';
import { RefreshIcon, XIcon } from '../components/icons';

const AdminRoute: React.FC = () => {
    const { user, authLoading } = useAuth();
    const { profile, loading: profileLoading } = useProfile();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = React.useState<AdminTab>('dashboard');
    const [refreshKey, setRefreshKey] = React.useState(0);

    const isOwner = profile?.is_admin === true;
    const canAccessAdmin = isOwner || profile?.permission_role === 'admin';

    useEffect(() => {
        if (!authLoading && !profileLoading) {
            if (!user || !canAccessAdmin) {
                navigate('/', { replace: true });
            }
        }
    }, [user, canAccessAdmin, authLoading, profileLoading, navigate]);

    if (authLoading || profileLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
                <Loader />
                <p className="text-slate-400 mt-4">Verificando credenciales...</p>
            </div>
        );
    }

    if (!user || !canAccessAdmin) {
        return null;
    }

    const handleRefresh = () => setRefreshKey(prev => prev + 1);
    const handleClose = () => navigate('/');

    return (
        <div className="min-h-screen bg-[#0a0f18] flex flex-col lg:flex-row overflow-hidden">
            {/* --- MOBILE HEADER --- */}
            <div className="lg:hidden flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800 shrink-0">
                <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    PANEL DE CONTROL
                </h2>
                <div className="flex gap-3">
                    <button onClick={handleRefresh} className="text-slate-400 hover:text-white"><RefreshIcon className="h-6 w-6" /></button>
                    <button onClick={handleClose} className="text-slate-400 hover:text-red-500"><XIcon className="h-6 w-6" /></button>
                </div>
            </div>

            {/* --- SIDEBAR --- */}
            <div className="order-2 lg:order-1 shrink-0">
                <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} isOwner={isOwner} />
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-grow bg-slate-900 overflow-hidden relative order-1 lg:order-2 flex flex-col h-screen">

                {/* Desktop Header */}
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
                            onClick={handleClose}
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
                    {activeTab === 'fixture' && <AdminFixtureView />}
                    {activeTab === 'games' && <AdminGamesView onLoadGame={(id) => navigate(`/match/${id}`)} />}
                </div>
            </div>
        </div>
    );
};

export default AdminRoute;
