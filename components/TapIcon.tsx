
import React from 'react';

const TapIcon: React.FC = () => (
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

export default TapIcon;
