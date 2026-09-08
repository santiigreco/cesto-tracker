import React, { useState } from 'react';
import { RosterPlayer } from '../../types';
import UserProfileModal from '@/components/modals/UserProfileModal';
import TeamSelectorModal from '@/components/modals/TeamSelectorModal';
import { supabase } from '../../utils/supabaseClient';
import { useProfile } from '../../hooks/useProfile';
import { useCommunityStats } from '../../hooks/useCommunityStats';

import { HomeNavbar } from './home/HomeNavbar';
import { HomeHero } from './home/HomeHero';
import { HomeActionGrid, LastSetupData } from './home/HomeActionGrid';
import { HomePhonePreview } from './home/HomePhonePreview';
import { HomeFeatures } from './home/HomeFeatures';
import { HomeFaqSection } from './home/HomeFaqSection';
import { HomeFooter } from './home/HomeFooter';

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
  ({ onStart, onLoadGameClick, user, onLogin, onLoadGame, canAccessAdmin }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isTeamSelectorOpen, setIsTeamSelectorOpen] = useState(false);

    const communityStats = useCommunityStats();
    const { profile } = useProfile();

    // Último setup guardado en localStorage
    const lastSetup: LastSetupData | null = (() => {
      try {
        const raw = localStorage.getItem(LAST_SETUP_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed?.myTeam) return parsed as LastSetupData;
      } catch {
        /* ignore */
      }
      return null;
    })();

    const handleLogout = async () => {
      await (supabase.auth as any).signOut();
      setIsProfileOpen(false);
    };

    const handleStartClick = () => {
      setIsTeamSelectorOpen(true);
    };

    const handleQuickStart = () => {
      if (!lastSetup) return;
      const roster: RosterPlayer[] = (lastSetup.players || []).map(num => ({
        number: num,
        name: lastSetup.playerNames?.[num] || '',
      }));
      onStart(lastSetup.myTeam, roster.length > 0 ? roster : undefined);
    };

    const handleTeamSelected = (name: string, roster?: RosterPlayer[]) => {
      setIsTeamSelectorOpen(false);
      onStart(name, roster);
    };

    const handleCloseTeamSelector = () => {
      setIsTeamSelectorOpen(false);
      onStart(profile?.favorite_club || undefined);
    };

    return (
      <div className="min-h-screen bg-[#0a0f18] text-slate-200 flex flex-col font-sans overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Background Gradients */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-emerald-500/10 blur-[120px] rounded-full animate-float"></div>
          <div className="absolute top-[30%] right-[10%] w-[20%] h-[20%] bg-purple-500/5 blur-[100px] rounded-full"></div>
        </div>

        {/* Navigation Bar */}
        <HomeNavbar
          canAccessAdmin={canAccessAdmin}
          user={user}
          profile={profile}
          onLogin={onLogin}
          onOpenProfile={() => setIsProfileOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-20">
            <div className="flex-1 w-full max-w-lg mx-auto lg:mx-0 flex flex-col gap-8">
              <HomeHero user={user} profile={profile} communityStats={communityStats} />
              <HomeActionGrid
                onStartClick={handleStartClick}
                lastSetup={lastSetup}
                onQuickStart={handleQuickStart}
                onLoadGameClick={onLoadGameClick}
                user={user}
                onLogin={onLogin}
              />
            </div>
            <HomePhonePreview />
          </div>

          <HomeFeatures />
          <HomeFaqSection />
          <HomeFooter />
        </main>

        {/* Modals */}
        {user && (
          <UserProfileModal
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            user={user}
            onLogout={handleLogout}
            onLoadGame={onLoadGame}
          />
        )}

        {isTeamSelectorOpen && (
          <TeamSelectorModal
            isOpen={isTeamSelectorOpen}
            onClose={handleCloseTeamSelector}
            onSelectTeam={handleTeamSelected}
            currentTeam={profile?.favorite_club || ''}
          />
        )}
      </div>
    );
  }
);

export default HomePage;
