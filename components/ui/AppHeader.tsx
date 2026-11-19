import React from 'react';
import {
  CloudUploadIcon,
  EyeIcon,
  GearIcon,
  HamburgerIcon,
  PencilIcon,
  ShieldIcon,
  UserIcon,
} from '../icons';
import { useNavigate } from 'react-router-dom';
import CloudIndicator from '@/components/ui/CloudIndicator';
import { GameMode, GamePeriod } from '../../types';
import { SyncStatus } from '../../context/SyncContext';

interface AppHeaderProps {
  onOpenMobileMenu: () => void;
  onRequestReturnHome: () => void;
  isSetupComplete: boolean;
  gameName?: string;
  myTeam?: string;
  gameMode: GameMode;
  isAutoSaving: boolean;
  lastSaved: Date | null;
  gameId: string | null;
  syncStatus?: SyncStatus;
  hasUnsavedChanges?: boolean;
  isOnline?: boolean;
  onOpenSettings: () => void;
  isReadOnly: boolean;
  isAdmin?: boolean;
  currentPeriod?: GamePeriod;
  onPeriodChange?: (period: GamePeriod) => void;
  user?: any;
  userAvatarUrl?: string | null;
  userInitial?: string;
  onLogin?: () => void;
  onSave?: () => void;
  onOpenProfile?: () => void;
  activeTab?: string;
  hasMissingMetadata?: boolean;
  onEditMetadata?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = React.memo(
  ({
    onOpenMobileMenu,
    onRequestReturnHome,
    isSetupComplete,
    gameName,
    myTeam,
    isAutoSaving,
    lastSaved,
    gameId,
    syncStatus,
    hasUnsavedChanges,
    isOnline,
    onOpenSettings,
    isReadOnly,
    isAdmin,
    user,
    userAvatarUrl,
    userInitial,
    onLogin,
    onSave,
    onOpenProfile,
    hasMissingMetadata = false,
    onEditMetadata,
  }) => {
    const navigate = useNavigate();

    return (
      <div className="w-full max-w-4xl relative z-20 mb-2">
        {isReadOnly && (
          <div className="w-full bg-sport-warn/15 border border-sport-warn/40 text-sport-warn-light text-center py-2 px-3 rounded-xl mb-2.5 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2">
            <EyeIcon className="h-4 w-4 shrink-0" />
            <span>Modo lectura: estás viendo un partido guardado.</span>
          </div>
        )}

        <header className="flex flex-col gap-2">
          {/* Primary Bar */}
          <div className="flex items-center justify-between gap-2 min-h-[48px] w-full">
            {/* Left: Hamburger (mobile) + Brand */}
            <div className="flex items-center gap-1.5 min-w-0">
              <button
                type="button"
                className="md:hidden min-w-[44px] min-h-[44px] -ml-1.5 flex items-center justify-center rounded-xl text-ink-secondary hover:bg-surface-elevated hover:text-ink-primary transition-colors touch-manipulation"
                onClick={onOpenMobileMenu}
                aria-label="Abrir menú"
              >
                <HamburgerIcon className="h-6 w-6" />
              </button>

              <button
                type="button"
                onClick={onRequestReturnHome}
                className="flex items-center gap-2 min-h-[44px] px-1 rounded-xl text-left transition-opacity hover:opacity-90 disabled:opacity-100 disabled:cursor-default min-w-0"
                disabled={!isSetupComplete}
                title={isSetupComplete ? 'Volver al inicio' : undefined}
              >
                <span className="text-xl sm:text-2xl leading-none select-none shrink-0" aria-hidden="true">🏐</span>
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-ink-primary truncate">
                  Cesto Tracker
                </span>
              </button>
            </div>

            {/* Right: Utility Actions */}
            <div className="flex items-center gap-1 shrink-0">
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={onSave}
                    className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-colors touch-manipulation ${
                      isAutoSaving
                        ? 'text-brand animate-pulse bg-surface-elevated'
                        : 'text-ink-secondary hover:text-brand hover:bg-surface-elevated'
                    }`}
                    title="Sincronizar ahora"
                    aria-label="Sincronizar ahora"
                    disabled={isAutoSaving}
                  >
                    <CloudUploadIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={onOpenProfile}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-surface-elevated transition-colors touch-manipulation"
                    title="Ver perfil"
                    aria-label="Ver perfil"
                  >
                    <span className="w-8 h-8 rounded-full bg-surface-elevated border border-border-strong flex items-center justify-center text-ink-primary font-bold text-xs uppercase overflow-hidden">
                      {userAvatarUrl ? (
                        <img
                          src={userAvatarUrl}
                          alt="Perfil"
                          loading="lazy"
                          decoding="async"
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        userInitial || user.email?.charAt(0) || 'U'
                      )}
                    </span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onLogin}
                  className="min-h-[44px] px-3 bg-surface-card hover:bg-surface-elevated text-ink-primary border border-border-strong rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 touch-manipulation"
                  aria-label="Iniciar sesión"
                >
                  <UserIcon className="h-4 w-4 text-brand" />
                  <span className="hidden xs:inline">Ingresar</span>
                </button>
              )}

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-sport-miss-light hover:bg-sport-miss/15 transition-colors touch-manipulation"
                  title="Panel de Administración"
                  aria-label="Panel de Administración"
                >
                  <ShieldIcon className="h-5 w-5" />
                </button>
              )}

              <button
                type="button"
                onClick={onOpenSettings}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-ink-secondary hover:bg-surface-elevated hover:text-ink-primary transition-colors touch-manipulation"
                aria-label="Abrir configuración"
              >
                <GearIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Secondary Compact Row: Match Context + Cloud Status */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
            {!isReadOnly && hasMissingMetadata && onEditMetadata ? (
              <button
                type="button"
                onClick={onEditMetadata}
                className="min-h-[36px] px-3 py-1 rounded-xl bg-sport-warn/15 hover:bg-sport-warn/25 border border-sport-warn/35 text-sport-warn-light text-xs font-bold flex items-center gap-1.5 max-w-full transition-colors"
                title="Completar equipo y rival del partido"
              >
                <PencilIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {myTeam
                    ? `${myTeam} vs Rival · Completar datos`
                    : 'Partido rápido · Completar equipo y rival'}
                </span>
              </button>
            ) : gameName ? (
              !isReadOnly && onEditMetadata ? (
                <button
                  type="button"
                  onClick={onEditMetadata}
                  className="group inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-ink-secondary hover:text-ink-primary truncate max-w-full px-2 py-1 -ml-2 rounded-lg hover:bg-surface-card transition-colors"
                  title="Editar equipos o nombres del partido"
                >
                  <span className="truncate">
                    {myTeam ? `${myTeam} vs ${gameName}` : gameName}
                  </span>
                  <PencilIcon className="h-3.5 w-3.5 text-ink-muted group-hover:text-brand shrink-0" />
                </button>
              ) : (
                <p className="text-sm sm:text-base font-bold text-ink-secondary truncate max-w-full">
                  {myTeam ? `${myTeam} vs ${gameName}` : gameName}
                </p>
              )
            ) : (
              <span className="text-xs font-semibold text-ink-muted">
                Planilla Técnica en Vivo
              </span>
            )}

            <CloudIndicator
              isSaving={isAutoSaving}
              lastSaved={lastSaved}
              gameId={gameId}
              syncStatus={syncStatus}
              hasUnsavedChanges={hasUnsavedChanges}
              isOnline={isOnline}
              isAuthenticated={Boolean(user)}
            />
          </div>
        </header>
      </div>
    );
  }
);

export default AppHeader;
