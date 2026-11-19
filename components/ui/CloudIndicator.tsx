import React from 'react';
import { SyncStatus } from '../../context/SyncContext';
import { AlertTriangleIcon, CloudCheckIcon, SpinnerIcon, WifiOffIcon } from '../icons';

interface CloudIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  gameId: string | null;
  syncStatus?: SyncStatus;
  hasUnsavedChanges?: boolean;
  isOnline?: boolean;
  isAuthenticated?: boolean;
}

const CloudIndicator: React.FC<CloudIndicatorProps> = ({
  isSaving,
  lastSaved,
  gameId,
  syncStatus = 'idle',
  hasUnsavedChanges = false,
  isOnline = true,
  isAuthenticated = true,
}) => {
  if (!isOnline) {
    return (
      <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-sport-warn/15 text-sport-warn-light px-2.5 py-1 rounded-lg border border-sport-warn/35 animate-fade-in">
        <WifiOffIcon className="h-3.5 w-3.5 shrink-0" />
        <span>Sin conexión · Respaldo local</span>
      </div>
    );
  }

  if (syncStatus === 'error') {
    return (
      <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-sport-miss/15 text-sport-miss-light px-2.5 py-1 rounded-lg border border-sport-miss/35 animate-fade-in">
        <AlertTriangleIcon className="h-3.5 w-3.5 shrink-0" />
        <span>Error al sincronizar · Respaldo local</span>
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-surface-elevated text-brand px-2.5 py-1 rounded-lg border border-brand/30 animate-fade-in">
        <SpinnerIcon className="h-3.5 w-3.5 shrink-0" />
        <span>Guardando en la nube...</span>
      </div>
    );
  }

  if (hasUnsavedChanges && isAuthenticated) {
    return (
      <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-surface-elevated text-sport-warn-light px-2.5 py-1 rounded-lg border border-sport-warn/35 animate-fade-in">
        <span className="inline-block w-2 h-2 rounded-full bg-sport-warn-light animate-pulse" />
        <span>Cambios pendientes</span>
      </div>
    );
  }

  if (lastSaved && gameId) {
    return (
      <div className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-surface-card text-ink-secondary px-2.5 py-1 rounded-lg border border-border-subtle animate-fade-in tabular-nums">
        <CloudCheckIcon className="h-3.5 w-3.5 text-sport-goal-light shrink-0" />
        <span>
          Sincronizado {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    );
  }

  return null;
};

export default CloudIndicator;
