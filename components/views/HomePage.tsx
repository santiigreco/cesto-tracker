import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LastSetupData } from '../../types';
import { useProfile } from '../../hooks/useProfile';
import { readLastTeamSetup } from '../../utils/matchMetadata';

import { HomeNavbar } from './home/HomeNavbar';
import { HomeHero } from './home/HomeHero';
import { HomeFooter } from './home/HomeFooter';
import { HomeShowcase } from './home/HomeShowcase';

export interface ActiveMatchSummary {
  myTeam: string;
  opponentName: string;
  myScore: number;
  opponentScore: number;
}

interface HomePageProps {
  onInstantStart: () => void;
  onConfigureSetup: () => void;
  onLoadGameClick: () => void;
  user?: any;
  onLogin?: () => void;
  onLoadGame: (gameId: string, asOwner: boolean) => void;
  canAccessAdmin: boolean;
  activeMatchSummary?: ActiveMatchSummary | null;
  localGamesCount?: number;
  onResumeActiveMatch?: () => void;
}

const HomePage: React.FC<HomePageProps> = React.memo(
  ({
    onInstantStart,
    onConfigureSetup,
    onLoadGameClick,
    user,
    onLogin,
    canAccessAdmin,
    activeMatchSummary,
    localGamesCount,
    onResumeActiveMatch,
  }) => {
    const navigate = useNavigate();
    const { profile } = useProfile();

    // Último setup guardado en localStorage (memoizado al montar)
    const lastSetup = useMemo<LastSetupData | null>(() => readLastTeamSetup(), []);

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
            onInstantStart={onInstantStart}
            onConfigureSetup={onConfigureSetup}
            onLoadGameClick={onLoadGameClick}
            onLogin={onLogin}
            activeMatchSummary={activeMatchSummary}
            localGamesCount={localGamesCount}
            onResumeActiveMatch={onResumeActiveMatch}
          />

          <HomeShowcase />

          {/* Clean Community Footer */}
          <HomeFooter />
        </main>
      </div>
    );
  }
);

export default HomePage;
