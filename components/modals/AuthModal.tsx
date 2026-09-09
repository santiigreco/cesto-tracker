import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { GoogleIcon, XIcon, CheckIcon } from '../icons';
import { getFriendlyAuthErrorMessage, isValidEmail, isValidPassword } from '../../utils/authErrors';

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

const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const EyeOffIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
    </svg>
);

const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={`animate-spin ${className || "h-5 w-5"}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({
    isOpen,
    onClose,
    initialMode = 'signup',
    title,
    subtitle,
    redirectPath,
    onSuccess
}) => {
    const { signInWithGoogle, signInWithPassword, signUpWithPassword, resetPassword } = useAuth();
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

    if (!isOpen) return null;

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
            // En caso exitoso, Google OAuth redirigirá el navegador
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

        // Validaciones previas
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
            // mode === 'login'
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

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
            onClick={(e) => {
                if (e.target === e.currentTarget && !isSubmitting && !isGoogleSubmitting) {
                    onClose();
                }
            }}
        >
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 transition-all">
                {/* Glow decorativo de fondo */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

                {/* Botón de Cierre */}
                <button
                    onClick={onClose}
                    disabled={isSubmitting || isGoogleSubmitting}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors disabled:opacity-50"
                    aria-label="Cerrar modal"
                >
                    <XIcon className="h-5 w-5" />
                </button>

                {/* Encabezado Deportivo */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-2xl mb-3 shadow-inner">
                        🏐
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-white">
                        {title || (mode === 'signup' ? 'Creá tu Cuenta Gratis' : mode === 'login' ? 'Iniciar Sesión' : 'Recuperar Contraseña')}
                    </h2>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1">
                        {subtitle || (mode === 'signup'
                            ? 'Unite a la comunidad de Cestoball y guardá tus estadísticas'
                            : mode === 'login'
                                ? 'Accedé a tus partidos y reportes sincronizados'
                                : 'Ingresá tu correo para restablecer tu contraseña')}
                    </p>
                </div>

                {/* Pestañas de Alternancia (Sign up / Log in) */}
                {mode !== 'reset' && (
                    <div className="flex bg-slate-950/70 p-1 rounded-xl border border-slate-800/80 mb-5">
                        <button
                            type="button"
                            onClick={() => { setMode('signup'); setErrorMessage(null); setSuccessMessage(null); }}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                mode === 'signup'
                                    ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-md font-black'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            Crear Cuenta
                        </button>
                        <button
                            type="button"
                            onClick={() => { setMode('login'); setErrorMessage(null); setSuccessMessage(null); }}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                mode === 'login'
                                    ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-md font-black'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            Ya tengo cuenta
                        </button>
                    </div>
                )}

                {/* Mensajes de Alerta / Feedback */}
                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-200 text-xs flex items-start gap-2 animate-shake">
                        <span className="text-red-400 font-bold">⚠️</span>
                        <div className="flex-1">{errorMessage}</div>
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-200 text-xs flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <div className="flex-1">{successMessage}</div>
                    </div>
                )}

                {/* Opción 1: Botón Google One-Tap (Máxima Conversión) */}
                {mode !== 'reset' && (
                    <>
                        <button
                            type="button"
                            onClick={handleGoogleAuth}
                            disabled={isSubmitting || isGoogleSubmitting}
                            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-4 rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed group"
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

                        <div className="relative my-5">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-800"></div>
                            </div>
                            <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                                <span className="bg-slate-900 px-3 text-slate-400 font-bold">o con tu correo</span>
                            </div>
                        </div>
                    </>
                )}

                {/* Formulario Email / Password */}
                <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
                    {mode === 'signup' && (
                        <div>
                            <label htmlFor="auth-fullname" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                                Nombre o Apodo <span className="text-slate-500 font-normal">(Opcional)</span>
                            </label>
                            <input
                                ref={emailInputRef}
                                id="auth-fullname"
                                name="fullname"
                                type="text"
                                autoComplete="name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Ej: Santiago Greco"
                                disabled={isSubmitting || isGoogleSubmitting}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors disabled:opacity-50"
                            />
                        </div>
                    )}

                    <div>
                        <label htmlFor="auth-email" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
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
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors disabled:opacity-50"
                        />
                    </div>

                    {mode !== 'reset' && (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label htmlFor="auth-password" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                                    Contraseña
                                </label>
                                {mode === 'login' && (
                                    <button
                                        type="button"
                                        onClick={() => { setMode('reset'); setErrorMessage(null); setSuccessMessage(null); }}
                                        className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline"
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
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors disabled:opacity-50"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                                >
                                    {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                </button>
                            </div>
                            {mode === 'signup' && (
                                <p className="text-[10px] text-slate-500 mt-1">
                                    {password.length >= 6 ? (
                                        <span className="text-emerald-400 flex items-center gap-1 font-medium">
                                            ✓ Longitud adecuada
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
                        className="w-full mt-2 bg-gradient-to-r from-cyan-500 via-cyan-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black py-3 px-4 rounded-xl text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

                {/* Volver al login desde reset */}
                {mode === 'reset' && (
                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={() => { setMode('login'); setErrorMessage(null); setSuccessMessage(null); }}
                            className="text-xs text-cyan-400 hover:text-cyan-300 font-bold hover:underline"
                        >
                            ← Volver a Iniciar Sesión
                        </button>
                    </div>
                )}

                {/* Propuesta de Valor (Bullets de Conversión) */}
                <div className="mt-6 pt-5 border-t border-slate-800/80">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 text-center">
                        Ventajas de tu cuenta oficial
                    </p>
                    <div className="grid grid-cols-1 gap-2 text-xs text-slate-300">
                        <div className="flex items-center gap-2">
                            <span className="text-cyan-400">☁️</span>
                            <span><strong>Guardado en la nube:</strong> Tus partidos seguros para siempre.</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-emerald-400">📊</span>
                            <span><strong>Historial y efectividad:</strong> Estadísticas de jugadores y equipo.</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-amber-400">📱</span>
                            <span><strong>Multi-dispositivo:</strong> Seguí anotando desde tu celular o notebook.</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 text-center">
                    <p className="text-[10px] text-slate-500">
                        Al continuar aceptás las normas de uso de Cesto Tracker. 100% gratuito para clubes y federaciones de Cestoball.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
