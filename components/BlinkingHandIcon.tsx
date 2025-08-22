
import React from 'react';

const BlinkingHandIcon: React.FC<{ className?: string }> = ({ className }) => {
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

export default BlinkingHandIcon;
