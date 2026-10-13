import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loader from '@/components/ui/Loader';

import AuthModal from '@/components/modals/AuthModal';
import Toast from '@/components/ui/Toast';
import { useUI } from '@/context/UIContext';

const HomeRoute = lazy(() => import('./pages/HomeRoute'));
const SetupRoute = lazy(() => import('./pages/SetupRoute'));
const MatchRoute = lazy(() => import('./pages/MatchRoute'));
const AdminRoute = lazy(() => import('./pages/AdminRoute'));
const FaqRoute = lazy(() => import('./pages/FaqRoute'));

const RouteLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
    <Loader />
  </div>
);

function App() {
  const { modals, closeModal, toast } = useUI();

  return (
    <>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/setup" element={<SetupRoute />} />
          <Route path="/match/:id" element={<MatchRoute />} />

          <Route path="/admin" element={<AdminRoute />} />
          <Route path="/faq" element={<FaqRoute />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {modals.auth?.isOpen && (
        <AuthModal
          isOpen={modals.auth.isOpen}
          onClose={() => closeModal('auth')}
          initialMode={modals.auth.params?.initialMode}
          title={modals.auth.params?.title}
          subtitle={modals.auth.params?.subtitle}
          redirectPath={modals.auth.params?.redirectPath}
          onSuccess={modals.auth.params?.onSuccess}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}

export default App;
