import React, { useState } from 'react';
import { RosterPlayer } from '../../types';
import UserProfileModal from '@/components/modals/UserProfileModal';
import TeamSelectorModal from '@/components/modals/TeamSelectorModal';
import { supabase } from '../../utils/supabaseClient';
import { useProfile } from '../../hooks/useProfile';
import InstallApp from '@/components/views/InstallApp';

import { HomeNavbar } from './home/HomeNavbar';
import { HomeHero } from './home/HomeHero';
import { HomeVisualShowcase } from './home/HomeVisualShowcase';
import { HomeFeatures } from './home/HomeFeatures';
import { HomeFaqSection } from './home/HomeFaqSection';
import { HomeFooter } from './home/HomeFooter';
import { LastSetupData } from './home/HomeActionGrid';

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
        {/* Subtle Ambient Background Gradients */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-emerald-500/10 blur-[120px] rounded-full"></div>
        </div>

        {/* 1. Header Simplificado: Logo limpio + Solo CTA claro 'Anotar Partido' */}
        <HomeNavbar
          canAccessAdmin={canAccessAdmin}
          user={user}
          profile={profile}
          onLogin={onLogin}
          onOpenProfile={() => setIsProfileOpen(true)}
          onStartClick={handleStartClick}
        />

        {/* Main Content Flow: Top-to-Bottom */}
        <main className="flex-grow flex flex-col relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 z-10">
          {/* 2. Hero Section Deportiva: Titular conciso + Subtítulo 2 líneas + CTA Grande Centrado */}
          <HomeHero
            user={user}
            profile={profile}
            lastSetup={lastSetup}
            onStartClick={handleStartClick}
            onQuickStart={handleQuickStart}
            onLoadGameClick={onLoadGameClick}
            onLogin={onLogin}
          />

          {/* 3. Visual Showcase Minimalista: Mockup limpio de la interfaz de anotación */}
          <section className="my-6 sm:my-10 w-full">
            <HomeVisualShowcase />
          </section>

          {/* 4. Bento Grid de 3 Pilares Deportivos: Anotación Ágil, Precisión Técnica, Estadísticas Consolidadas */}
          <HomeFeatures />

          {/* Discreet PWA Install Banner */}
          <div className="max-w-xl mx-auto w-full px-4 mt-16 sm:mt-20">
            <InstallApp variant="card" />
          </div>

          {/* FAQ & Support */}
          <HomeFaqSection />

          {/* Clean Community Footer */}
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
