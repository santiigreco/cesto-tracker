import React, { Suspense, lazy, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { useGameLogic } from '@/hooks/useGameLogic';
import { supabase, isSupabaseConfigured } from '@/utils/supabaseClient';
import { getFriendlySupabaseErrorMessage } from '@/utils/supabaseErrors';
import Loader from '@/components/ui/Loader';
import {
  ArrowLeftIcon,
  BoltIcon,
  ChartBarIcon,
  ClipboardIcon,
  GearIcon,
  GoogleIcon,
  UserIcon,
  UsersIcon,
} from '@/components/icons';
import { ProfileHeader } from '@/components/views/profile/ProfileHeader';
import type { UserSavedGame } from '@/components/views/profile/ProfileMatchesTab';

const ProfileMatchesTab = lazy(() =>
  import('@/components/views/profile/ProfileMatchesTab').then((m) => ({
    default: m.ProfileMatchesTab,
  }))
);
const ProfileTeamsTab = lazy(() =>
  import('@/components/views/profile/ProfileTeamsTab').then((m) => ({
    default: m.ProfileTeamsTab,
  }))
);
const ProfileStatsTab = lazy(() =>
  import('@/components/views/profile/ProfileStatsTab').then((m) => ({
    default: m.ProfileStatsTab,
  }))
);
const ProfileSettingsTab = lazy(() =>
  import('@/components/views/profile/ProfileSettingsTab').then((m) => ({
    default: m.ProfileSettingsTab,
  }))
);

type ProfileActiveTab = 'matches' | 'teams' | 'stats' | 'settings';

export default function ProfileRoute() {
  const navigate = useNavigate();
  const { user, authLoading, profile, refreshProfile } = useAuth();
  const { openAuthModal } = useUI();
  const { startQuickMatch } = useGameLogic();

  const [activeTab, setActiveTab] = useState<ProfileActiveTab>('matches');
  const [games, setGames] = useState<UserSavedGame[]>([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [gamesError, setGamesError] = useState<string | null>(null);
  const [teamsCount, setTeamsCount] = useState(0);

  const fetchUserGames = useCallback(async () => {
    if (!user) {
      setGames([]);
      setGamesError(null);
      return;
    }
    setGamesError(null);
    const onlineNow = typeof navigator !== 'undefined' ? navigator.onLine : true;
    if (!isSupabaseConfigured || !onlineNow) {
      setGamesError(getFriendlySupabaseErrorMessage(null, onlineNow));
      setGamesLoading(false);
      return;
    }

    setGamesLoading(true);
    try {
      const { data, error } = await supabase
        .from('games')
        .select('id, opponent_name, game_mode, created_at, settings, views')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGames((data as UserSavedGame[]) || []);
    } catch (err) {
      console.error('[PROFILE_GAMES_FETCH_ERROR]', err);
      setGamesError(getFriendlySupabaseErrorMessage(err));
    } finally {
      setGamesLoading(false);
    }
  }, [user]);

  const fetchTeamsCount = useCallback(async () => {
    if (!user) return;
    try {
      const { count, error } = await supabase
        .from('saved_teams')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (!error && typeof count === 'number') {
        setTeamsCount(count);
      }
    } catch (e) {
      console.warn('[PROFILE_TEAMS_COUNT_ERROR]', e);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      Promise.all([fetchUserGames(), fetchTeamsCount()]);
    }
  }, [user, fetchUserGames, fetchTeamsCount]);

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface-canvas text-ink-muted">
        <Loader className="h-10 w-10 text-brand mb-3" />
        <p className="text-sm font-semibold">Cargando tu perfil...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface-canvas text-ink-primary flex flex-col font-sans selection:bg-brand/25 selection:text-ink-primary">
        <div className="sticky top-0 z-30 bg-surface-canvas/95 border-b border-border-subtle px-4 sm:px-8 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="min-h-[44px] px-2 -ml-2 flex items-center gap-1.5 text-ink-secondary hover:text-ink-primary transition-colors text-sm font-bold rounded-xl"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Volver al Inicio</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none select-none shrink-0" aria-hidden="true">🏐</span>
            <span className="text-ink-primary font-extrabold text-sm tracking-tight">
              Cesto Tracker
            </span>
          </div>
        </div>

        <div className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface-card border border-border-subtle rounded-2xl p-7 shadow-card text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-brand/15 border border-brand/30 text-brand flex items-center justify-center mx-auto">
              <UserIcon className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-ink-primary tracking-tight">
                Accedé a tu Perfil
              </h2>
              <p className="text-ink-muted text-sm mt-2 leading-relaxed">
                Iniciá sesión para guardar y administrar tus planillas técnicas oficiales, pre-configurar tus planteles de club y acumular estadísticas.
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => openAuthModal({ initialMode: 'login' })}
                className="w-full min-h-[48px] bg-brand hover:bg-brand-hover text-ink-inverse font-extrabold py-3 px-4 rounded-xl text-sm uppercase tracking-wider transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <GoogleIcon className="h-4 w-4" />
                <span>Ingresar con Google o Email</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full min-h-[44px] text-ink-muted hover:text-ink-primary text-xs font-bold transition-colors"
              >
                Volver a la página principal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getTabClass = (tab: ProfileActiveTab) =>
    `min-h-[44px] px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors whitespace-nowrap flex items-center gap-2 border ${
      activeTab === tab
        ? 'bg-surface-elevated text-ink-primary border-brand/50'
        : 'bg-transparent text-ink-muted hover:text-ink-primary hover:bg-surface-card border-transparent'
    }`;

  return (
    <div className="min-h-screen bg-surface-canvas text-ink-primary flex flex-col font-sans selection:bg-brand/25 selection:text-ink-primary pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-surface-canvas/95 border-b border-border-subtle px-4 sm:px-8 py-2.5 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="min-h-[44px] flex items-center gap-2 text-ink-secondary hover:text-ink-primary transition-colors text-xs sm:text-sm font-bold bg-surface-card border border-border-subtle px-3 rounded-xl active:scale-[0.98]"
        >
          <ArrowLeftIcon className="h-4 w-4 shrink-0" />
          <span>Inicio</span>
        </button>

        <button
          type="button"
          className="flex items-center gap-2 min-h-[44px] px-2 rounded-xl select-none"
          onClick={() => navigate('/')}
        >
          <span className="text-xl leading-none select-none shrink-0" aria-hidden="true">🏐</span>
          <span className="font-extrabold text-sm tracking-tight text-ink-primary hidden xs:inline">
            Cesto Tracker
          </span>
          <span className="text-border-strong hidden xs:inline">|</span>
          <span className="text-xs font-bold text-brand uppercase tracking-wider">
            Mi Perfil
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            startQuickMatch({
              teamName: profile?.favorite_club || undefined,
              useLastSetup: true,
            });
            navigate('/match/new');
          }}
          className="min-h-[44px] bg-brand hover:bg-brand-hover text-ink-inverse font-extrabold px-3.5 rounded-xl text-xs uppercase tracking-wider transition-colors active:scale-[0.98] flex items-center gap-1.5"
        >
          <BoltIcon className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Anotar Partido</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <ProfileHeader
          profile={profile}
          user={user}
          matchesCount={games.length}
          teamsCount={teamsCount}
        />

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-border-subtle pb-3 overflow-x-auto custom-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('matches')}
            className={getTabClass('matches')}
          >
            <ClipboardIcon
              className={`h-4 w-4 shrink-0 ${
                activeTab === 'matches' ? 'text-brand' : 'text-ink-muted'
              }`}
            />
            <span>Mis Planillas</span>
            <span className="px-1.5 py-0.5 rounded-md text-[11px] font-extrabold bg-surface-card border border-border-subtle text-ink-secondary tabular-nums">
              {games.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('teams')}
            className={getTabClass('teams')}
          >
            <UsersIcon
              className={`h-4 w-4 shrink-0 ${
                activeTab === 'teams' ? 'text-brand' : 'text-ink-muted'
              }`}
            />
            <span>Mis Planteles</span>
            <span className="px-1.5 py-0.5 rounded-md text-[11px] font-extrabold bg-surface-card border border-border-subtle text-ink-secondary tabular-nums">
              {teamsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={getTabClass('stats')}
          >
            <ChartBarIcon
              className={`h-4 w-4 shrink-0 ${
                activeTab === 'stats' ? 'text-brand' : 'text-ink-muted'
              }`}
            />
            <span>Métricas e Insignias</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={getTabClass('settings')}
          >
            <GearIcon
              className={`h-4 w-4 shrink-0 ${
                activeTab === 'settings' ? 'text-brand' : 'text-ink-muted'
              }`}
            />
            <span>Ajustes y Cuenta</span>
          </button>
        </div>

        {/* Tab Views Content */}
        <div>
          <Suspense
            fallback={
              <div className="flex justify-center items-center py-16">
                <Loader className="h-8 w-8 text-brand" />
              </div>
            }
          >
            {activeTab === 'matches' && (
              <ProfileMatchesTab
                games={games}
                loading={gamesLoading}
                error={gamesError}
                onRefresh={fetchUserGames}
              />
            )}

            {activeTab === 'teams' && (
              <ProfileTeamsTab onTeamsCountChange={(count) => setTeamsCount(count)} />
            )}

            {activeTab === 'stats' && (
              <ProfileStatsTab games={games} loading={gamesLoading} />
            )}

            {activeTab === 'settings' && (
              <ProfileSettingsTab
                profile={profile}
                user={user}
                onProfileUpdated={refreshProfile}
              />
            )}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
