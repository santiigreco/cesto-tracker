import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomeRoute from './pages/HomeRoute';
import SetupRoute from './pages/SetupRoute';
import MatchRoute from './pages/MatchRoute';
import FixtureRoute from './pages/FixtureRoute';
import StandingsRoute from './pages/StandingsRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/setup" element={<SetupRoute />} />
      <Route path="/match/:id" element={<MatchRoute />} />
      <Route path="/fixture" element={<FixtureRoute />} />
      <Route path="/standings" element={<StandingsRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
