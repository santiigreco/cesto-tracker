import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleIcon, ShieldIcon } from '@/components/icons';
import { UserProfile } from '@/types';
import { useUI } from '@/context/UIContext';

interface HomeNavbarProps {
  canAccessAdmin: boolean;
  user?: any;
  profile?: UserProfile | null;
  onLogin?: () => void;
  onOpenProfile: () => void;
}

export const HomeNavbar: React.FC<HomeNavbarProps> = React.memo(
  ({ canAccessAdmin, user, profile, onLogin, onOpenProfile }) => {
    const navigate = useNavigate();
    const { openAuthModal } = useUI();

    const handleLoginClick = () => {
      if (onLogin) {
        onLogin();
      } else {
        openAuthModal({ initialMode: 'login' });
      }
    };

    return (
      <header className="sticky top-0 z-50 w-full bg-surface-canvas/95 border-b border-border-subtle px-4 sm:px-8 py-3 flex justify-between items-center">
        {/* Brand Logo */}
        <button
          type="button"
          className="flex items-center gap-2.5 min-h-[44px] px-1 -ml-1 rounded-xl text-left select-none transition-opacity hover:opacity-90"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className="text-2xl leading-none select-none shrink-0" aria-hidden="true">🏐</span>
          <span className="font-extrabold text-lg tracking-tight text-ink-primary leading-none">
            Cesto Tracker
          </span>
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {canAccessAdmin && (
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="hidden sm:inline-flex items-center gap-1.5 bg-sport-miss/15 border border-sport-miss/40 text-sport-miss-light hover:bg-sport-miss/25 px-3 min-h-[44px] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
              title="Panel de Administración"
            >
              <ShieldIcon className="h-4 w-4" />
              <span>Admin</span>
            </button>
          )}

          {user ? (
            <button
              type="button"
              onClick={onOpenProfile}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-surface-card transition-colors active:scale-95 touch-manipulation"
              title={profile?.full_name || user.email || 'Mi Perfil'}
              aria-label="Ir a mi perfil"
            >
              <span className="w-9 h-9 rounded-full bg-surface-elevated border border-border-strong hover:border-brand flex items-center justify-center text-xs font-bold text-ink-primary overflow-hidden transition-colors">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Perfil"
                    loading="lazy"
                    decoding="async"
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'
                )}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLoginClick}
              className="flex items-center gap-2 text-ink-primary hover:bg-surface-elevated text-sm font-bold px-3.5 min-h-[44px] rounded-xl bg-surface-card border border-border-strong hover:border-brand/50 transition-colors active:scale-95 touch-manipulation"
              title="Iniciar sesión o crear cuenta"
            >
              <GoogleIcon className="h-4 w-4" />
              <span>Ingresar</span>
            </button>
          )}
        </div>
      </header>
    );
  }
);
