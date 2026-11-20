import React, { Suspense, lazy, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import Loader from '@/components/ui/Loader';
import { AdminSidebar } from '../components/admin/ui/AdminSidebar';
import { AdminTab } from '../components/admin/types';
import { RefreshIcon, XIcon } from '../components/icons';

const AdminOverview = lazy(() =>
    import('../components/admin/views/AdminOverview').then(m => ({ default: m.AdminOverview }))
);
const AdminUsersView = lazy(() =>
    import('../components/admin/views/AdminUsersView').then(m => ({ default: m.AdminUsersView }))
);
const AdminGamesView = lazy(() =>
    import('../components/admin/views/AdminGamesView').then(m => ({ default: m.AdminGamesView }))
);

const AdminRoute: React.FC = () => {
    const { user, authLoading } = useAuth();
    const { profile, loading: profileLoading } = useProfile();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = React.useState<AdminTab>('dashboard');
    const [refreshKey, setRefreshKey] = React.useState(0);

    const isOwner = profile?.is_admin === true;
    const canAccessAdmin = isOwner || profile?.permission_role === 'admin';

    useEffect(() => {
        // Only redirect once we are sure loading is finished
        if (authLoading === false && profileLoading === false) {
            if (!user || !canAccessAdmin) {
                navigate('/', { replace: true });
            }
        }
    }, [user, canAccessAdmin, authLoading, profileLoading, navigate]);

    const handleRefresh = useCallback(() => setRefreshKey(prev => prev + 1), []);
    const handleClose = useCallback(() => navigate('/'), [navigate]);
    const handleLoadAdminGame = useCallback((id: string, asOwner: boolean) => {
        navigate(`/match/${id}${asOwner ? '?edit=true' : ''}`);
    }, [navigate]);

    if (authLoading || profileLoading) {
        return (
            <div className="min-h-screen bg-surface-canvas flex flex-col items-center justify-center">
                <Loader />
                <p className="text-ink-secondary mt-4 text-sm font-medium">Verificando credenciales...</p>
            </div>
        );
    }

    if (!user || !canAccessAdmin) {
        return null;
    }

    const headerBtnClass =
        'min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-surface-elevated hover:bg-surface-hover border border-border-strong text-ink-secondary hover:text-ink-primary transition-colors active:scale-95';

    return (
        <div className="min-h-screen bg-surface-canvas text-ink-primary flex flex-col lg:flex-row overflow-hidden">
            {/* --- MOBILE HEADER --- */}
            <div className="lg:hidden flex justify-between items-center px-4 py-3 border-b border-border-subtle bg-surface-card shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                    <h2 className="text-base font-black text-ink-primary tracking-tight uppercase truncate">
                        Panel de Control
                    </h2>
                    {isOwner ? (
                        <span className="px-2 py-0.5 bg-sport-miss/15 text-sport-miss-light border border-sport-miss/40 text-[10px] rounded-md uppercase tracking-widest font-extrabold shrink-0">
                            Owner
                        </span>
                    ) : (
                        <span className="px-2 py-0.5 bg-brand/15 text-brand border border-brand/35 text-[10px] rounded-md uppercase tracking-widest font-extrabold shrink-0">
                            Admin
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
                        onClick={handleClose}
                        className={`${headerBtnClass} hover:text-sport-miss-light`}
                        title="Volver al inicio"
                        aria-label="Volver al inicio"
                    >
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* --- SIDEBAR --- */}
            <div className="order-2 lg:order-1 shrink-0">
                <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} isOwner={isOwner} isAdmin={canAccessAdmin} />
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-grow bg-surface-canvas overflow-hidden relative order-1 lg:order-2 flex flex-col h-screen">
                {/* Desktop Header */}
                <div className="hidden lg:flex justify-between items-center px-6 py-4 border-b border-border-subtle bg-surface-card shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-ink-primary tracking-tight flex items-center gap-2.5">
                            <span>CONTROL DE MANDO</span>
                            {isOwner ? (
                                <span className="px-2 py-0.5 bg-sport-miss/15 text-sport-miss-light border border-sport-miss/40 text-[10px] rounded-md uppercase tracking-widest font-extrabold">
                                    Owner
                                </span>
                            ) : (
                                <span className="px-2 py-0.5 bg-brand/15 text-brand border border-brand/35 text-[10px] rounded-md uppercase tracking-widest font-extrabold">
                                    Admin
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
                            onClick={handleClose}
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
                    <Suspense fallback={<div className="flex justify-center items-center h-48"><Loader /></div>}>
                        {activeTab === 'dashboard' && <AdminOverview isOwner={isOwner} isAdmin={canAccessAdmin} />}
                        {activeTab === 'users' && canAccessAdmin && <AdminUsersView isOwner={isOwner} isAdmin={canAccessAdmin} />}
                        {activeTab === 'games' && <AdminGamesView onLoadGame={handleLoadAdminGame} />}
                    </Suspense>
                </div>
            </div>
        </div>
    );
};

export default AdminRoute;
