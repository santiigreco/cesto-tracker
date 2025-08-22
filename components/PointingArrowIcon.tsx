
import React from 'react';

const PointingArrowIcon: React.FC<{ className?: string }> = ({ className }) => {
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

export default PointingArrowIcon;
