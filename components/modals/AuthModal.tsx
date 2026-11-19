import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import ModalShell from '../ui/ModalShell';
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  BrandLogoMark,
  ChartBarIcon,
  CheckIcon,
  CloudCheckIcon,
  EyeIcon,
  EyeOffIcon,
  GoogleIcon,
  SmartphoneIcon,
  SpinnerIcon,
} from '../icons';
import {
  getFriendlyAuthErrorMessage,
  isValidEmail,
  isValidPassword,
} from '../../utils/authErrors';

type AuthViewMode = 'signup' | 'login' | 'reset';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signup' | 'login' | 'reset';
  title?: string;
  subtitle?: string;
  redirectPath?: string;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signup',
  title,
  subtitle,
  redirectPath,
  onSuccess,
}) => {
  const { signInWithGoogle, signInWithPassword, signUpWithPassword, resetPassword } =
    useAuth();
  const { showToast } = useUI();

  const [mode, setMode] = useState<AuthViewMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'signup');
      setEmail('');
      setPassword('');
      setFullName('');
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsSubmitting(false);
      setIsGoogleSubmitting(false);
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialMode]);

  const handleGoogleAuth = async () => {
    if (isSubmitting || isGoogleSubmitting) return;
    setIsGoogleSubmitting(true);
    setErrorMessage(null);

    try {
      const { error } = await signInWithGoogle(redirectPath);
      if (error) {
        setErrorMessage(getFriendlyAuthErrorMessage(error));
        setIsGoogleSubmitting(false);
      }
    } catch (err: any) {
      setErrorMessage(getFriendlyAuthErrorMessage(err));
      setIsGoogleSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isGoogleSubmitting) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isValidEmail(email)) {
      setErrorMessage('Ingresá un correo electrónico válido (ej: usuario@ejemplo.com).');
      return;
    }

    if (mode === 'reset') {
      setIsSubmitting(true);
      const { error } = await resetPassword(email);
      setIsSubmitting(false);

      if (error) {
        setErrorMessage(getFriendlyAuthErrorMessage(error));
      } else {
        setSuccessMessage('Te enviamos un enlace de recuperación a tu correo electrónico.');
      }
      return;
    }

    if (!isValidPassword(password)) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);

    if (mode === 'signup') {
      const { error } = await signUpWithPassword(email, password, fullName);
      setIsSubmitting(false);

      if (error) {
        setErrorMessage(getFriendlyAuthErrorMessage(error));
      } else {
        showToast('¡Cuenta creada con éxito! Bienvenido/a a Cesto Tracker.', 'success');
        if (onSuccess) onSuccess();
        onClose();
      }
    } else {
      const { error } = await signInWithPassword(email, password);
      setIsSubmitting(false);

      if (error) {
        setErrorMessage(getFriendlyAuthErrorMessage(error));
      } else {
        showToast('¡Sesión iniciada correctamente!', 'success');
        if (onSuccess) onSuccess();
        onClose();
      }
    }
  };

  const resolvedTitle =
    title ||
    (mode === 'signup'
      ? 'Creá tu Cuenta Gratis'
      : mode === 'login'
        ? 'Iniciar Sesión'
        : 'Recuperar Contraseña');

  const resolvedSubtitle =
    subtitle ||
    (mode === 'signup'
      ? 'Unite a la comunidad de Cestoball y guardá tus estadísticas'
      : mode === 'login'
        ? 'Accedé a tus partidos y reportes sincronizados'
        : 'Ingresá tu correo para restablecer tu contraseña');

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={resolvedTitle}
      subtitle={resolvedSubtitle}
      headerLeading={<BrandLogoMark className="h-9 w-9" />}
      maxWidth="md"
      zIndexClass="z-[100]"
      disableClose={isSubmitting || isGoogleSubmitting}
    >
      <div>
        {/* Mode Switcher */}
        {mode !== 'reset' && (
          <div className="flex bg-surface-canvas p-1 rounded-xl border border-border-subtle mb-4">
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 min-h-[40px] py-2 text-xs font-bold rounded-lg transition-colors ${
                mode === 'signup'
                  ? 'bg-surface-elevated text-ink-primary border border-border-strong font-extrabold'
                  : 'text-ink-muted hover:text-ink-primary border border-transparent'
              }`}
            >
              Crear Cuenta
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 min-h-[40px] py-2 text-xs font-bold rounded-lg transition-colors ${
                mode === 'login'
                  ? 'bg-surface-elevated text-ink-primary border border-border-strong font-extrabold'
                  : 'text-ink-muted hover:text-ink-primary border border-transparent'
              }`}
            >
              Ya tengo cuenta
            </button>
          </div>
        )}

        {/* Feedback Banners */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-sport-miss/15 border border-sport-miss/40 rounded-xl text-sport-miss-light text-xs flex items-start gap-2 animate-shake">
            <AlertTriangleIcon className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-sport-goal/15 border border-sport-goal/40 rounded-xl text-sport-goal-light text-xs flex items-start gap-2">
            <CheckIcon className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{successMessage}</div>
          </div>
        )}

        {/* Google One-Tap */}
        {mode !== 'reset' && (
          <>
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isSubmitting || isGoogleSubmitting}
              className="w-full min-h-[48px] flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-bold py-2.5 px-4 rounded-xl transition-colors active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGoogleSubmitting ? (
                <SpinnerIcon className="h-5 w-5 text-slate-900" />
              ) : (
                <GoogleIcon className="h-5 w-5 flex-shrink-0" />
              )}
              <span className="text-sm font-extrabold tracking-tight">
                {isGoogleSubmitting ? 'Conectando con Google...' : 'Continuar con Google'}
              </span>
              <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider bg-slate-200 px-2 py-0.5 rounded text-slate-700">
                1 toque
              </span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-subtle" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                <span className="bg-surface-card px-3 text-ink-muted font-bold">
                  o con tu correo
                </span>
              </div>
            </div>
          </>
        )}

        {/* Email / Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          {mode === 'signup' && (
            <div>
              <label
                htmlFor="auth-fullname"
                className="block text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1.5"
              >
                Nombre o Apodo <span className="text-ink-muted font-normal">(Opcional)</span>
              </label>
              <input
                ref={emailInputRef}
                id="auth-fullname"
                name="fullname"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej: Lucía Rodríguez"
                disabled={isSubmitting || isGoogleSubmitting}
                className="w-full min-h-[44px] bg-surface-canvas border border-border-strong rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-ink-primary placeholder-ink-muted focus:border-brand transition-colors disabled:opacity-50"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="block text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1.5"
            >
              Correo Electrónico
            </label>
            <input
              ref={mode !== 'signup' ? emailInputRef : undefined}
              id="auth-email"
              name="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tunombre@club.com"
              required
              disabled={isSubmitting || isGoogleSubmitting}
              className="w-full min-h-[44px] bg-surface-canvas border border-border-strong rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-ink-primary placeholder-ink-muted focus:border-brand transition-colors disabled:opacity-50"
            />
          </div>

          {mode !== 'reset' && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor="auth-password"
                  className="block text-xs font-bold uppercase tracking-wider text-ink-secondary"
                >
                  Contraseña
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs text-brand hover:text-brand-hover font-semibold hover:underline"
                  >
                    ¿La olvidaste?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="auth-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : '••••••••'}
                  required
                  disabled={isSubmitting || isGoogleSubmitting}
                  className="w-full min-h-[44px] bg-surface-canvas border border-border-strong rounded-xl px-3.5 py-2.5 pr-12 text-base sm:text-sm text-ink-primary placeholder-ink-muted focus:border-brand transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 min-w-[44px] flex items-center justify-center text-ink-muted hover:text-ink-primary transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-[11px] text-ink-muted mt-1.5">
                  {password.length >= 6 ? (
                    <span className="text-sport-goal-light inline-flex items-center gap-1 font-semibold">
                      <CheckIcon className="h-3.5 w-3.5" /> Longitud adecuada
                    </span>
                  ) : (
                    'Debe contener al menos 6 caracteres'
                  )}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isGoogleSubmitting}
            className="w-full min-h-[48px] mt-1 bg-brand hover:bg-brand-hover text-ink-inverse font-black py-3 px-4 rounded-xl text-sm uppercase tracking-wider transition-colors active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && <SpinnerIcon className="h-4 w-4" />}
            <span>
              {isSubmitting
                ? 'Procesando...'
                : mode === 'signup'
                  ? 'Crear Cuenta Gratis'
                  : mode === 'login'
                    ? 'Iniciar Sesión'
                    : 'Enviar Instrucciones'}
            </span>
          </button>
        </form>

        {mode === 'reset' && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="min-h-[40px] inline-flex items-center gap-1.5 text-xs text-brand hover:text-brand-hover font-bold hover:underline"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              <span>Volver a Iniciar Sesión</span>
            </button>
          </div>
        )}

        {/* Value Props */}
        <div className="mt-5 pt-4 border-t border-border-subtle">
          <p className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-2.5 text-center">
            Ventajas de tu cuenta
          </p>
          <div className="grid grid-cols-1 gap-2 text-xs text-ink-secondary">
            <div className="flex items-center gap-2.5">
              <CloudCheckIcon className="h-4 w-4 text-brand shrink-0" />
              <span>
                <strong className="text-ink-primary">Guardado en la nube:</strong> Tus partidos respaldados siempre.
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <ChartBarIcon className="h-4 w-4 text-sport-goal-light shrink-0" />
              <span>
                <strong className="text-ink-primary">Historial y efectividad:</strong> Estadísticas de jugadoras y equipo.
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <SmartphoneIcon className="h-4 w-4 text-sport-warn-light shrink-0" />
              <span>
                <strong className="text-ink-primary">Multi-dispositivo:</strong> Seguí anotando desde tu celular o PC.
              </span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-ink-muted">
          100% gratuito para clubes y federaciones de Cestoball.
        </p>
      </div>
    </ModalShell>
  );
};

export default AuthModal;
