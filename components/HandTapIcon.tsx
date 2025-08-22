import React from 'react';

const HandTapIcon: React.FC<{ className?: string }> = ({ className }) => {
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

export default HandTapIcon;
