import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomeRoute from './pages/HomeRoute';
import SetupRoute from './pages/SetupRoute';
import MatchRoute from './pages/MatchRoute';
import FixtureRoute from './pages/FixtureRoute';
import StandingsRoute from './pages/StandingsRoute';
import AdminRoute from './pages/AdminRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/setup" element={<SetupRoute />} />
      <Route path="/match/:id" element={<MatchRoute />} />

      {/* Fixture routes with parameters */}
      <Route path="/fixture" element={<Navigate to={`/fixture/${new Date().getFullYear()}`} replace />} />
      <Route path="/fixture/:year" element={<FixtureRoute />} />
      <Route path="/fixture/:year/:tournament" element={<FixtureRoute />} />
      <Route path="/fixture/:year/:tournament/:category" element={<FixtureRoute />} />

      {/* Standings routes with parameters */}
      <Route path="/standings" element={<Navigate to={`/standings/${new Date().getFullYear()}`} replace />} />
      <Route path="/standings/:year" element={<StandingsRoute />} />
      <Route path="/standings/:year/:tournament" element={<StandingsRoute />} />
      <Route path="/standings/:year/:tournament/:category" element={<StandingsRoute />} />

      <Route path="/admin" element={<AdminRoute />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
