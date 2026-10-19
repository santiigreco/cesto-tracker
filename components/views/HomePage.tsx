import React, { Suspense, lazy, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RosterPlayer, LastSetupData } from '../../types';
import { useProfile } from '../../hooks/useProfile';

import { HomeNavbar } from './home/HomeNavbar';
import { HomeHero } from './home/HomeHero';
import { HomeFooter } from './home/HomeFooter';
import { HomeShowcase } from './home/HomeShowcase';

const TeamSelectorModal = lazy(() => import('@/components/modals/TeamSelectorModal'));

interface HomePageProps {
  onStart: (teamName?: string, roster?: RosterPlayer[]) => void;
  onLoadGameClick: () => void;
  user?: any;
  onLogin?: () => void;
  onLoadGame: (gameId: string, asOwner: boolean) => void;
  canAccessAdmin: boolean;
}

const LAST_SETUP_KEY = 'cesto_last_team_setup';

const HomePage: React.FC<HomePageProps> = React.memo(
  ({ onStart, onLoadGameClick, user, onLogin, canAccessAdmin }) => {
    const navigate = useNavigate();
    const [isTeamSelectorOpen, setIsTeamSelectorOpen] = useState(false);

    const { profile } = useProfile();

    // Último setup guardado en localStorage (memoizado al montar)
    const lastSetup = useMemo<LastSetupData | null>(() => {
      try {
        const raw = localStorage.getItem(LAST_SETUP_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed?.myTeam) return parsed as LastSetupData;
      } catch {
        /* ignore */
      }
      return null;
    }, []);

    const handleStartClick = useCallback(() => {
      setIsTeamSelectorOpen(true);
    }, []);

    const handleQuickStart = useCallback(() => {
      if (!lastSetup) return;
      const roster: RosterPlayer[] = (lastSetup.players || []).map(num => ({
        number: num,
        name: lastSetup.playerNames?.[num] || '',
      }));
      onStart(lastSetup.myTeam, roster.length > 0 ? roster : undefined);
    }, [lastSetup, onStart]);

    const handleTeamSelected = useCallback((name: string, roster?: RosterPlayer[]) => {
      setIsTeamSelectorOpen(false);
      onStart(name, roster);
    }, [onStart]);

    // Closing the selector only dismisses it; it must not start a new sheet.
    const handleCloseTeamSelector = useCallback(() => {
      setIsTeamSelectorOpen(false);
    }, []);

    const handleOpenProfile = useCallback(() => {
      navigate('/perfil');
    }, [navigate]);

    return (
      <div className="min-h-screen bg-[#0a0f18] text-slate-200 flex flex-col font-sans overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Static ambient gradient (no blur filters for mobile performance) */}
        <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.10),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.08),transparent_45%)]" />

        {/* 1. Header minimalista: logo + acceso/perfil */}
        <HomeNavbar
          canAccessAdmin={canAccessAdmin}
          user={user}
          profile={profile}
          onLogin={onLogin}
          onOpenProfile={handleOpenProfile}
        />

        {/* Main Content Flow: Top-to-Bottom */}
        <main className="flex-grow flex flex-col justify-center relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 z-10">
          {/* 2. Hero: titular + CTA único + vista previa de la planilla */}
          <HomeHero
            user={user}
            profile={profile}
            lastSetup={lastSetup}
            onStartClick={handleStartClick}
            onQuickStart={handleQuickStart}
            onLoadGameClick={onLoadGameClick}
            onLogin={onLogin}
          />

          <HomeShowcase />

          {/* Clean Community Footer */}
          <HomeFooter />
        </main>

        {isTeamSelectorOpen && (
          <Suspense fallback={null}>
            <TeamSelectorModal
              isOpen={isTeamSelectorOpen}
              onClose={handleCloseTeamSelector}
              onSelectTeam={handleTeamSelected}
              currentTeam={profile?.favorite_club || ''}
            />
          </Suspense>
        )}
      </div>
    );
  }
);

export default HomePage;
