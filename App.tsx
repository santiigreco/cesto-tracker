import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loader from '@/components/ui/Loader';

const HomeRoute = lazy(() => import('./pages/HomeRoute'));
const SetupRoute = lazy(() => import('./pages/SetupRoute'));
const MatchRoute = lazy(() => import('./pages/MatchRoute'));
const StandingsRoute = lazy(() => import('./pages/StandingsRoute'));
const AdminRoute = lazy(() => import('./pages/AdminRoute'));
const FaqRoute = lazy(() => import('./pages/FaqRoute'));

const RouteLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
    <Loader />
  </div>
);

function App() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/setup" element={<SetupRoute />} />
      <Route path="/match/:id" element={<MatchRoute />} />

      {/* Standings routes with parameters */}
      <Route path="/standings" element={<Navigate to={`/standings/${new Date().getFullYear()}`} replace />} />
      <Route path="/standings/:year" element={<StandingsRoute />} />
      <Route path="/standings/:year/:tournament" element={<StandingsRoute />} />
      <Route path="/standings/:year/:tournament/:category" element={<StandingsRoute />} />

      <Route path="/admin" element={<AdminRoute />} />
      <Route path="/faq" element={<FaqRoute />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}

export default App;
