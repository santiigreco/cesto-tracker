
import React, { useEffect, useState } from 'react';
import DownloadIcon from './DownloadIcon';
import ShareIcon from './ShareIcon';
import XIcon from './XIcon';

const InstallApp: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);

    useEffect(() => {
        // Check if already in standalone mode
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        setIsStandalone(isStandaloneMode);

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        // Listen for installation prompt (Android/Chrome)
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = () => {
        if (isIOS) {
            setShowIOSInstructions(true);
        } else if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                    setDeferredPrompt(null);
                }
            });
        }
    };

    // If already installed, don't show anything
    if (isStandalone) return null;

    // Only show if we have a prompt (Android) or it's iOS
    if (!deferredPrompt && !isIOS) return null;

    return (
        <>
            <button
                onClick={handleInstallClick}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-600 hover:border-cyan-500/50 text-white font-semibold transition-all shadow-lg backdrop-blur-sm group"
                title="Instalar App"
            >
                <DownloadIcon className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>{isIOS ? 'Instalar en iPhone' : 'Instalar App'}</span>
            </button>

            {/* iOS Instructions Modal */}
            {showIOSInstructions && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex flex-col justify-end pb-8 animate-fade-in" onClick={() => setShowIOSInstructions(false)}>
                    <div className="bg-slate-800 m-4 p-6 rounded-2xl border border-slate-600 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button 
                            onClick={() => setShowIOSInstructions(false)}
                            className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white"
                        >
                            <XIcon />
                        </button>
                        
                        <div className="flex flex-col items-center text-center space-y-4">
                            <h3 className="text-xl font-bold text-white">Instalar en iPhone / iPad</h3>
                            <p className="text-slate-300">Cesto Tracker funciona mejor como una app. Para instalarla:</p>
                            
                            <ol className="text-left space-y-4 text-sm text-white w-full bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                <li className="flex items-center gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-cyan-600 rounded-full flex items-center justify-center font-bold text-xs">1</span>
                                    <span>Tocá el botón <span className="font-bold text-cyan-400">Compartir</span> <ShareIcon className="inline h-4 w-4 mx-1" /> en la barra de abajo.</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-cyan-600 rounded-full flex items-center justify-center font-bold text-xs">2</span>
                                    <span>Deslizá hacia abajo y elegí <span className="font-bold text-white">"Agregar a Inicio"</span> (Add to Home Screen).</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-cyan-600 rounded-full flex items-center justify-center font-bold text-xs">3</span>
                                    <span>Confirmá tocando <span className="font-bold text-white">Agregar</span> arriba a la derecha.</span>
                                </li>
                            </ol>
                        </div>
                        
                        {/* Little arrow pointing down to Safari toolbar */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-slate-800"></div>
                        <p className="text-center text-xs text-slate-500 mt-4">↓ La barra de Safari está aquí abajo ↓</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default InstallApp;
