import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { supabase } from '@/utils/supabaseClient';
import Loader from '@/components/ui/Loader';
import { GoogleIcon } from '@/components/icons';
import { ProfileHeader } from '@/components/views/profile/ProfileHeader';
import { ProfileMatchesTab, UserSavedGame } from '@/components/views/profile/ProfileMatchesTab';
import { ProfileTeamsTab } from '@/components/views/profile/ProfileTeamsTab';
import { ProfileStatsTab } from '@/components/views/profile/ProfileStatsTab';
import { ProfileSettingsTab } from '@/components/views/profile/ProfileSettingsTab';

type ProfileActiveTab = 'matches' | 'teams' | 'stats' | 'settings';

export default function ProfileRoute() {
  const navigate = useNavigate();
  const { user, authLoading, profile, refreshProfile } = useAuth();
  const { openAuthModal } = useUI();

  const [activeTab, setActiveTab] = useState<ProfileActiveTab>('matches');
  const [games, setGames] = useState<UserSavedGame[]>([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [teamsCount, setTeamsCount] = useState(0);

  // Fetch games owned by this user
  const fetchUserGames = useCallback(async () => {
    if (!user) {
      setGames([]);
      return;
    }
    setGamesLoading(true);
    try {
      const { data, error } = await supabase
        .from('games')
        .select('id, opponent_name, game_mode, created_at, player_names, settings, views')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGames((data as UserSavedGame[]) || []);
    } catch (err) {
      console.error('[PROFILE_GAMES_FETCH_ERROR]', err);
    } finally {
      setGamesLoading(false);
    }
  }, [user]);

  // Fetch count of saved teams
  const fetchTeamsCount = useCallback(async () => {
    if (!user) return;
    try {
      const { count, error } = await supabase
        .from('saved_teams')
        .select('*', { count: 'exact', head: true })
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
      fetchUserGames();
      fetchTeamsCount();
    }
  }, [user, fetchUserGames, fetchTeamsCount]);

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-400">
        <Loader className="h-10 w-10 text-cyan-400 mb-3" />
        <p className="text-sm font-semibold">Cargando tu perfil...</p>
      </div>
    );
  }

  // Unauthenticated screen
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Top Navbar */}
        <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm font-bold"
          >
            <span>←</span>
            <span>Volver al Inicio</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏐</span>
            <span className="text-white font-black text-sm tracking-tight">Cesto Tracker</span>
          </div>
        </div>

        {/* Hero Card for Auth */}
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-600 flex items-center justify-center mx-auto text-3xl shadow-lg">
              👤
            </div>

            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Accedé a tu Perfil</h2>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                Iniciá sesión para guardar y administrar tus planillas técnicas oficiales, pre-configurar tus planteles de club y acumular estadísticas.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => openAuthModal({ initialMode: 'login' })}
                className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black py-3 rounded-xl text-sm uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 active:scale-95 flex items-center justify-center gap-2"
              >
                <GoogleIcon className="h-4 w-4" />
                <span>Ingresar con Google o Email</span>
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full py-2.5 text-slate-400 hover:text-white text-xs font-bold transition-colors"
              >
                Volver a la página principal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs sm:text-sm font-bold bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl active:scale-95"
        >
          <span>←</span>
          <span>Volver al Inicio</span>
        </button>

        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => navigate('/')}>
          <span className="text-xl">🏐</span>
          <span className="font-black text-sm tracking-tight text-white hidden xs:inline">
            Cesto Tracker
          </span>
          <span className="text-slate-600 hidden xs:inline">|</span>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
            Mi Perfil
          </span>
        </div>

        <button
          onClick={() => navigate('/setup')}
          className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs uppercase tracking-wider shadow active:scale-95 flex items-center gap-1.5"
        >
          <span>⚡</span>
          <span className="hidden sm:inline">Anotar Partido</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Profile Card Header */}
        <ProfileHeader
          profile={profile}
          user={user}
          matchesCount={games.length}
          teamsCount={teamsCount}
        />

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'matches'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>📋</span>
            <span>Mis Planillas</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-slate-300">
              {games.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'teams'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>👥</span>
            <span>Mis Planteles</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-slate-300">
              {teamsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'stats'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>📊</span>
            <span>Mis Métricas & Insignias</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>⚙️</span>
            <span>Ajustes & Cuenta</span>
          </button>
        </div>

        {/* Tab Views Content */}
        <div className="pt-2">
          {activeTab === 'matches' && (
            <ProfileMatchesTab
              games={games}
              loading={gamesLoading}
              onRefresh={fetchUserGames}
            />
          )}

          {activeTab === 'teams' && (
            <ProfileTeamsTab
              onTeamsCountChange={count => setTeamsCount(count)}
            />
          )}

          {activeTab === 'stats' && (
            <ProfileStatsTab
              games={games}
              loading={gamesLoading}
            />
          )}

          {activeTab === 'settings' && (
            <ProfileSettingsTab
              profile={profile}
              user={user}
              onProfileUpdated={refreshProfile}
            />
          )}
        </div>
      </main>
    </div>
  );
}
