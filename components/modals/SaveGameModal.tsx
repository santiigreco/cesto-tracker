import React, { useState, useEffect } from 'react';
import { SyncState } from '../../context/SyncContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import ModalShell from '../ui/ModalShell';
import { CheckIcon, CloudUploadIcon, LockIcon, SpinnerIcon, XIcon } from '../icons';

interface SaveGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (gameName: string) => void;
  syncState: SyncState;
  initialGameName?: string;
}

const SaveGameModal: React.FC<SaveGameModalProps> = ({
  isOpen,
  onClose,
  onSave,
  syncState,
  initialGameName,
}) => {
  const { user } = useAuth();
  const { openAuthModal } = useUI();
  const [gameName, setGameName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      setGameName(
        initialGameName || `Partido del ${new Date().toLocaleDateString('es-AR')}`
      );
    }
  }, [isOpen, initialGameName]);

  const handleSave = () => {
    if (
      gameName.trim() &&
      !isSubmitting &&
      syncState.status !== 'syncing' &&
      syncState.status !== 'success'
    ) {
      setIsSubmitting(true);
      onSave(gameName.trim());
    }
  };

  useEffect(() => {
    if (syncState.status === 'success') {
      const timer = setTimeout(onClose, 1500);
      return () => clearTimeout(timer);
    }
    if (syncState.status === 'error') {
      setIsSubmitting(false);
    }
  }, [syncState.status, onClose]);

  const isSyncing = syncState.status === 'syncing' || isSubmitting;
  const isSuccess = syncState.status === 'success';
  const isError = syncState.status === 'error';

  if (!user) {
    return (
      <ModalShell
        isOpen={isOpen}
        onClose={onClose}
        title="Guardar Partido"
        maxWidth="md"
        zIndexClass="z-[70]"
      >
        <div className="space-y-5">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand/15 border border-brand/30 text-brand mb-3">
              <CloudUploadIcon className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-extrabold text-ink-primary">
              Creá tu cuenta para guardar este partido
            </h3>
            <p className="text-sm text-ink-muted mt-1">
              Tu planilla se respaldará en la nube para acceder desde cualquier dispositivo.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 text-xs text-ink-secondary bg-surface-elevated/60 rounded-xl p-3.5 border border-border-subtle">
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-sport-goal-light shrink-0" />
              <span>Tus planillas guardadas para siempre</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-sport-goal-light shrink-0" />
              <span>Historial de partidos y estadísticas acumuladas</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-sport-goal-light shrink-0" />
              <span>Exportación de reportes en Excel oficial</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              openAuthModal({
                initialMode: 'signup',
                title: 'Registrate para guardar tu partido',
                subtitle: 'Creá tu cuenta en 1 clic y tu planilla se guardará automáticamente.',
                onSuccess: () => {},
              });
            }}
            className="w-full min-h-[48px] flex items-center justify-center gap-2.5 bg-brand hover:bg-brand-hover text-ink-inverse font-extrabold py-3 px-4 rounded-xl text-sm uppercase tracking-wider transition-colors active:scale-[0.98]"
          >
            <LockIcon className="h-4 w-4" />
            <span>Crear Cuenta Gratis</span>
          </button>

          <p className="text-center text-xs text-ink-muted leading-relaxed">
            También podés continuar con Google en 1 toque. Mientras tanto, tu partido se guarda en este dispositivo.
          </p>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Guardar Partido"
      maxWidth="md"
      zIndexClass="z-[70]"
      disableClose={isSyncing}
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="gameName"
            className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-ink-secondary"
          >
            Nombre del Partido
          </label>
          <input
            type="text"
            id="gameName"
            maxLength={60}
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            disabled={isSyncing || isSuccess}
            className="bg-surface-canvas border border-border-strong text-ink-primary text-base sm:text-sm rounded-xl focus:border-brand block w-full px-3.5 py-2.5 disabled:opacity-50"
            placeholder="Ej: Final vs. Vélez"
            autoFocus
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!gameName.trim() || isSyncing || isSuccess}
          className={`w-full min-h-[48px] flex items-center justify-center gap-2.5 font-extrabold py-3 px-4 rounded-xl transition-colors text-sm touch-manipulation ${
            isSyncing
              ? 'bg-surface-elevated text-ink-muted cursor-not-allowed'
              : isSuccess
                ? 'bg-sport-goal text-white'
                : isError
                  ? 'bg-sport-miss hover:bg-red-500 text-white'
                  : 'bg-brand hover:bg-brand-hover text-ink-inverse disabled:bg-surface-elevated disabled:text-ink-muted disabled:cursor-not-allowed'
          }`}
        >
          {isSyncing && <SpinnerIcon className="h-4 w-4" />}
          {isSuccess && <CheckIcon className="h-4 w-4" />}
          {isError && <XIcon className="h-4 w-4" />}
          {!isSyncing && !isSuccess && !isError && <CloudUploadIcon className="h-4 w-4" />}
          <span>
            {isSyncing
              ? 'Guardando...'
              : isSuccess
                ? '¡Guardado con éxito!'
                : isError
                  ? 'Reintentar Guardado'
                  : 'Confirmar y Guardar'}
          </span>
        </button>

        {isError && (
          <p className="text-sport-miss-light text-xs sm:text-sm text-center font-medium">
            {syncState.message}
          </p>
        )}
      </div>
    </ModalShell>
  );
};

export default SaveGameModal;
