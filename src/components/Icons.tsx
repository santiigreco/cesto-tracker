
import React from 'react';

// --- BRAND ICONS ---

export const WhatsappIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-8 w-8"} viewBox="0 0 24 24" fill="currentColor" role="img" aria-label="WhatsApp Icon">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.52 3.48 1.45 4.93L2.2 22l5.3-1.38c1.38.84 2.95 1.28 4.54 1.28h.01c5.46 0 9.9-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zM9.81 16.3c-.23.41-.8.78-1.07.82-.26.04-.54.04-.81-.02-.34-.07-.71-.24-1.04-.46-.43-.28-.88-.66-1.28-1.11-.47-.53-.86-1.12-1.14-1.78-.28-.66-.42-1.36-.42-2.06s.15-1.41.42-2.07.64-1.25 1.11-1.76c.47-.52 1.03-.94 1.66-1.24.63-.3 1.3-.46 1.99-.46.33 0 .66.04.98.11.32.08.6.21.82.41s.4.45.51.74c.11.29.17.6.17.91 0 .04 0 .08-.01.12l-.23 1.08c-.04.18-.1.35-.18.52-.08.17-.19.32-.32.45l-.43.41c-.13.13-.26.26-.38.41-.12.15-.22.3-.3.45-.08.15-.12.3-.12.45s.03.29.08.43c.05.14.13.28.23.41.1.13.22.25.35.37.13.12.28.23.44.33s.33.19.51.26c.18.07.36.11.55.11.21 0 .42-.04.61-.13s.36-.21.5-.36.24-.33.32-.51.12-.37.15-.55l.03-.23c.02-.13.06-.25.13-.37s.16-.22.27-.3c.11-.08.24-.15.39-.2s.3-.08.47-.1c.17-.02.34-.02.5 0 .17.02.33.06.48.13s.28.16.4.27.21.25.28.4c.08.15.12.31.14.48l.01.03c.04.28.01.57-.08.85-.09.28-.24.54-.45.77z"/>
    </svg>
);

export const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

export const LinkedInIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
);

export const TwitterIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

export const GithubIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.168 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.942.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
    </svg>
);

export const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.07 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.359 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.359-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.359-2.618-6.78-6.98-6.98C15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/>
    </svg>
);

// --- SPECIALIZED ICONS ---

export const TrophyIcon: React.FC<{ rank: number }> = ({ rank }) => {
  const colors: { [key: number]: string } = {
    1: 'text-yellow-400', // Gold
    2: 'text-gray-300',   // Silver
    3: 'text-yellow-600', // Bronze
  };
  const color = colors[rank] || 'text-gray-500';

  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${color}`} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2a6 6 0 00-6 6c0 1.887.646 3.633 1.726 5H4a1 1 0 00-1 1v2a1 1 0 001 1h1.583A6.012 6.012 0 0010 18a6.012 6.012 0 004.417-2H16a1 1 0 001-1v-2a1 1 0 00-1-1h-1.726A5.969 5.969 0 0016 8a6 6 0 00-6-6zm-3.293 9.293a1 1 0 010 1.414L5 14.414A3.99 3.99 0 0110 16a3.99 3.99 0 015-1.707l-1.707-1.707a1 1 0 010-1.414L15 10.293A4.004 4.004 0 0114 8c0-1.312-.636-2.5-1.682-3.268L10 7.05l-2.318-2.318C6.636 5.5 6 6.688 6 8c0 .79.23 1.523.634 2.121L3.293 11.293z" />
    </svg>
  );
};

export const BlinkingHandIcon: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={`relative w-24 h-24 ${className}`}>
            <style>
                {`
                    @keyframes pulse-hand {
                        0%, 100% {
                            transform: scale(1);
                            opacity: 1;
                        }
                        50% {
                            transform: scale(1.1);
                            opacity: 0.8;
                        }
                    }
                    .animate-pulse-hand {
                        animation: pulse-hand 2s infinite ease-in-out;
                    }
                `}
            </style>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-full h-full text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] animate-pulse-hand"
            >
                <path d="M8.25 2.25a.75.75 0 000 1.5h.585A8.24 8.24 0 002.25 12.25v.585a.75.75 0 001.5 0v-.585a6.74 6.74 0 015.415-6.585V15a.75.75 0 001.5 0V5.415A6.74 6.74 0 0118.165 12v.585a.75.75 0 001.5 0v-.585A8.24 8.24 0 0014.585 3.75h.585a.75.75 0 000-1.5h-.585A8.25 8.25 0 008.25 2.25z" />
                <path d="M9 12.75a.75.75 0 000 1.5h6a.75.75 0 000-1.5H9zM3.75 15.75a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5H3.75zM4.5 19.5a.75.75 0 000 1.5h15a.75.75 0 000-1.5h-15z" />
            </svg>
        </div>
    );
};

export const PointingArrowIcon: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={`relative w-24 h-24 ${className}`}>
            <style>
                {`
                    @keyframes arrow-pulse {
                        0% {
                            transform: scale(1);
                            opacity: 0.8;
                        }
                        50% {
                            transform: scale(1.1);
                            opacity: 1;
                        }
                        100% {
                            transform: scale(1);
                            opacity: 0.8;
                        }
                    }
                    .animate-arrow-pulse {
                        animation: arrow-pulse 1.5s infinite ease-in-out;
                    }
                `}
            </style>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                className="w-full h-full animate-arrow-pulse"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.7))' }}
            >
                <path
                    d="M 80,80 Q 50,95 20,80 Q -10,65 15,30"
                    stroke="white"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                />
                <path
                    d="M 15,30 L 5,45 M 15,30 L 35,35"
                    stroke="white"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
};

export const HandTapIcon: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={`relative w-24 h-24 ${className}`}>
            <style>
                {`
                    @keyframes tap-and-ripple {
                        0% {
                            transform: scale(0.95);
                            opacity: 1;
                        }
                        50% {
                            transform: scale(1.05);
                            opacity: 1;
                        }
                        100% {
                            transform: scale(0.95);
                            opacity: 1;
                        }
                    }
                    @keyframes ripple-effect {
                        0% {
                            transform: scale(1);
                            opacity: 0.6;
                        }
                        100% {
                            transform: scale(2.5);
                            opacity: 0;
                        }
                    }
                    .animate-tap-icon {
                        animation: tap-and-ripple 1.5s infinite ease-in-out;
                    }
                    .animate-ripple-circle {
                        animation: ripple-effect 1.5s infinite ease-out;
                    }
                `}
            </style>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute w-full h-full rounded-full border-2 border-white animate-ripple-circle"></div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-full h-full text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] animate-tap-icon"
                >
                    <path d="M21.23 8.15l-1.85-2.06c-.39-.43-1.05-.48-1.5-.11L13 9.49V4c0-.55-.45-1-1-1s-1 .45-1 1v8.51l-4.75-4.75c-.39-.39-1.02-.39-1.41 0s-.39 1.02 0 1.41l6.36 6.36c.39.39 1.02.39 1.41 0l7.35-7.35c.4-.38.43-1.01.07-1.42z"/>
                </svg>
            </div>
        </div>
    );
};

// --- FEATURE ICONS ---

export const FeatureTapIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-7 w-7"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
    </svg>
);

export const FeatureChartIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-7 w-7"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
    </svg>
);

export const FeatureMapIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-7 w-7"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.452-2.452L14.25 6l1.036-.259a3.375 3.375 0 002.452-2.452L18 2.25l.259 1.035a3.375 3.375 0 002.452 2.452L21.75 6l-1.035.259a3.375 3.375 0 00-2.452 2.452zM16.5 13.5h-1.5V12h1.5v1.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.5h3v.75a3 3 0 01-3 3h-1.5a3 3 0 01-3-3v-.75h3v.75a1.5 1.5 0 001.5 1.5h1.5a1.5 1.5 0 001.5-1.5v-.75z" />
    </svg>
);

export const FeatureTrophyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-7 w-7"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);

export const TrendingUpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

export const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
);
