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

    // Last setup saved in localStorage (memoized on mount)
    const lastSetup = useMemo<LastSetupData | null>(() => readLastTeamSetup(), []);

    const handleOpenProfile = useCallback(() => {
      navigate('/perfil');
    }, [navigate]);

    return (
      <div className="min-h-screen bg-surface-canvas text-ink-primary flex flex-col font-sans overflow-x-hidden selection:bg-brand/25 selection:text-ink-primary">
        {/* 1. Minimal navbar: brand mark + profile/auth */}
        <HomeNavbar
          canAccessAdmin={canAccessAdmin}
          user={user}
          profile={profile}
          onLogin={onLogin}
          onOpenProfile={handleOpenProfile}
        />

        {/* Main Content Flow: Top-to-Bottom */}
        <main className="flex-grow flex flex-col justify-center w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          {/* 2. Hero: headline + single primary CTA + active match shortcut */}
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
