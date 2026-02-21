import React from 'react';

// --- BlinkingHandIcon ---
export const BlinkingHandIcon : React.FC<{ className?: string }> = ({ className }) => {
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


// --- CalendarIcon ---
export const CalendarIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);


// --- CameraIcon ---
export const CameraIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


// --- ChartBarIcon ---
export const ChartBarIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);


// --- ChartPieIcon ---
export const ChartPieIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
);


// --- CheckIcon ---
export const CheckIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);


// --- ChevronDownIcon ---
export const ChevronDownIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);


// --- ClipboardIcon ---
export const ClipboardIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
);


// --- DownloadIcon ---
export const DownloadIcon : React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.293a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);


// --- EyeIcon ---
export const EyeIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
);


// --- FeatureChartIcon ---
export const FeatureChartIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-7 w-7"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
    </svg>
);


// --- FeatureMapIcon ---
export const FeatureMapIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-7 w-7"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.452-2.452L14.25 6l1.036-.259a3.375 3.375 0 002.452-2.452L18 2.25l.259 1.035a3.375 3.375 0 002.452 2.452L21.75 6l-1.035.259a3.375 3.375 0 00-2.452 2.452zM16.5 13.5h-1.5V12h1.5v1.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.5h3v.75a3 3 0 01-3 3h-1.5a3 3 0 01-3-3v-.75h3v.75a1.5 1.5 0 001.5 1.5h1.5a1.5 1.5 0 001.5-1.5v-.75z" />
    </svg>
);


// --- FeatureTapIcon ---
export const FeatureTapIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-7 w-7"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
    </svg>
);


// --- FeatureTrophyIcon ---
export const FeatureTrophyIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-7 w-7"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);


// --- GearIcon ---
export const GearIcon : React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);


// --- GithubIcon ---
export const GithubIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.168 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.942.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
    </svg>
);


// --- GoogleIcon ---
export const GoogleIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);


// --- HamburgerIcon ---
export const HamburgerIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-7 w-7"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);


// --- HandClickIcon ---
export const HandClickIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
    </svg>
);


// --- HandTapIcon ---
export const HandTapIcon : React.FC<{ className?: string }> = ({ className }) => {
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
                {/* Ripple Effect */}
                <div className="absolute w-full h-full rounded-full border-2 border-white animate-ripple-circle"></div>
                {/* Hand Icon */}
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


// --- JerseyIcon ---
/**
 * A reusable SVG icon component for a player jersey, styled as a T-shirt.
 */
export const JerseyIcon : React.FC<{
  number: string;
  name?: string;
  isSelected: boolean;
  onClick: (number: string) => void;
  disabled?: boolean;
  isBlinking?: boolean;
}> = React.memo(({ number, name, isSelected, onClick, disabled = false, isBlinking = false }) => {
  const jerseyColor = isSelected ? 'fill-cyan-500' : (disabled ? 'fill-slate-800' : 'fill-slate-700');
  const textColor = isSelected ? 'fill-white' : (disabled ? 'fill-slate-500' : 'fill-slate-200');
  const strokeColor = isSelected ? 'stroke-cyan-300' : (disabled ? 'stroke-slate-700' : 'stroke-slate-600');
  return (
    <>
      <style>
        {`
            @keyframes pulse-jersey {
              0%, 100% {
                transform: scale(1);
              }
              50% {
                transform: scale(1.15);
              }
            }
            .animate-pulse-jersey {
              animation: pulse-jersey 1.5s infinite ease-in-out;
            }
            @keyframes border-pulse {
              0% { stroke-opacity: 1; transform: scale(1.05); }
              50% { stroke-opacity: 0.5; transform: scale(1.1); }
              100% { stroke-opacity: 1; transform: scale(1.05); }
            }
            .animate-border-pulse {
              animation: border-pulse 1.5s infinite ease-in-out;
              transform-origin: center center;
            }
        `}
      </style>
      <button
        onClick={() => onClick(number)}
        disabled={disabled}
        className={`relative transition-transform duration-200 ease-in-out transform focus:outline-none rounded-lg ${isBlinking ? 'animate-pulse-jersey' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}`}
        aria-pressed={isSelected}
        aria-label={`Seleccionar ${name || `Jugador ${number}`}`}
        title={name || `Jugador ${number}`}
      >
        <svg
          width="56"
          height="56"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          className={`drop-shadow-lg transition-all duration-200 ${isSelected ? 'scale-110' : ''}`}
        >
          {isBlinking && (
              <circle
                cx="12"
                cy="12"
                r="11"
                fill="none"
                stroke="#FBBF24" // Tailwind amber-400
                strokeWidth="1.5"
                strokeDasharray="4 2"
                className="animate-border-pulse"
              />
          )}
          <path
            d="M6,3 C7,2 17,2 18,3 L21,5 V8 H18 V21 H6 V8 H3 V5 Z"
            className={`transition-colors ${jerseyColor} ${strokeColor}`}
            strokeWidth="0.75"
          />
          <text
            x="12"
            y="14"
            textAnchor="middle"
            dominantBaseline="central"
            className={`transition-colors ${textColor} font-sans font-bold select-none`}
            fontSize="8.5"
          >
            {number}
          </text>
        </svg>
      </button>
    </>
  );
});


// --- LinkedInIcon ---
export const LinkedInIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
);


// --- MapIcon ---
export const MapIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 10V7" />
    </svg>
);


// --- PencilIcon ---
export const PencilIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor">
      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
      <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
);


// --- PlusIcon ---
export const PlusIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);


// --- PointingArrowIcon ---
export const PointingArrowIcon : React.FC<{ className?: string }> = ({ className }) => {
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


// --- QuestionMarkCircleIcon ---
export const QuestionMarkCircleIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


// --- RedoIcon ---
export const RedoIcon : React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 24 24" fill="currentColor" style={{ transform: 'scaleX(-1)' }}>
    <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
  </svg>
);


// --- RefreshIcon ---
export const RefreshIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);


// --- SearchIcon ---
export const SearchIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);


// --- ShareIcon ---
export const ShareIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor">
        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
    </svg>
);


// --- ShieldIcon ---
export const ShieldIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.67-3.13 8.96-7 10.16-3.87-1.2-7-5.49-7-10.16v-4.7l7-3.12z" />
    </svg>
);


// --- SparklesIcon ---
export const SparklesIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);


// --- SwitchIcon ---
export const SwitchIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
);


// --- TapIcon ---
export const TapIcon : React.FC = () => (
    <div className="relative w-16 h-16">
        <style>
            {`
                @keyframes ripple {
                    0% {
                        transform: scale(0.8);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
                .animate-ripple {
                    animation: ripple 1.5s infinite ease-out;
                }
            `}
        </style>
        <div className="absolute top-1/2 left-1/2 w-8 h-8 -mt-4 -ml-4 rounded-full bg-white opacity-75"></div>
        <div className="absolute top-1/2 left-1/2 w-8 h-8 -mt-4 -ml-4 rounded-full border-4 border-white animate-ripple"></div>
    </div>
);


// --- TrashIcon ---
export const TrashIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);


// --- TrophyIcon ---
export const TrophyIcon : React.FC<{ rank: number }> = ({ rank }) => {
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


// --- TwitterIcon ---
export const TwitterIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);


// --- UndoIcon ---
export const UndoIcon : React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
  </svg>
);


// --- UsersIcon ---
export const UsersIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.08.051c-.569.312-1.182.534-1.817.66a6.719 6.719 0 00-4.978 0 8.74 8.74 0 01-7.375-.714zM22.5 19.125a7.125 7.125 0 01-14.25 0v.003l.08.051c.569.312 1.182.534 1.817.66a6.719 6.719 0 004.978 0 8.74 8.74 0 017.375-.714z" />
    </svg>
);


// --- WhatsappIcon ---
export const WhatsappIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-8 w-8"} viewBox="0 0 24 24" fill="currentColor" role="img" aria-label="WhatsApp Icon">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.52 3.48 1.45 4.93L2.2 22l5.3-1.38c1.38.84 2.95 1.28 4.54 1.28h.01c5.46 0 9.9-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zM9.81 16.3c-.23.41-.8.78-1.07.82-.26.04-.54.04-.81-.02-.34-.07-.71-.24-1.04-.46-.43-.28-.88-.66-1.28-1.11-.47-.53-.86-1.12-1.14-1.78-.28-.66-.42-1.36-.42-2.06s.15-1.41.42-2.07.64-1.25 1.11-1.76c.47-.52 1.03-..94 1.66-1.24.63-.3 1.3-.46 1.99-.46.33 0 .66.04.98.11.32.08.6.21.82.41s.4.45.51.74c.11.29.17.6.17.91 0 .04 0 .08-.01.12l-.23 1.08c-.04.18-.1.35-.18.52-.08.17-.19.32-.32.45l-.43.41c-.13.13-.26.26-.38.41-.12.15-.22.3-.3.45-.08.15-.12.3-.12.45s.03.29.08.43c.05.14.13.28.23.41.1.13.22.25.35.37.13.12.28.23.44.33s.33.19.51.26c.18.07.36.11.55.11.21 0 .42-.04.61-.13s.36-.21.5-.36.24-.33.32-.51.12-.37.15-.55l.03-.23c.02-.13.06-.25.13-.37s.16-.22.27-.3c.11-.08.24-.15.39-.2s.3-.08.47-.1c.17-.02.34-.02.5 0 .17.02.33.06.48.13s.28.16.4.27.21.25.28.4c.08.15.12.31.14.48l.01.03c.04.28.01.57-.08.85-.09.28-.24.54-.45.77z"/>
    </svg>
);


// --- XIcon ---
export const XIcon : React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);


