

import React from 'react';

interface TutorialOverlayProps {
    step: number;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ step }) => {
    // Common backdrop style
    const backdropStyle = "fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300";

    if (step === 1) {
        return (
            <div className={backdropStyle} role="presentation">
                <div className="relative w-full h-full flex flex-col items-center justify-end pb-16 sm:pb-24">
                    {/* Text positioned at the bottom */}
                    <div className="text-center text-white p-4 bg-gray-900/50 rounded-lg">
                        <h2 className="text-3xl sm:text-4xl font-bold">¡Vamos a empezar!</h2>
                        <p className="text-xl sm:text-2xl mt-2 px-4">Primero, selecciona el jugador que va a tirar.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 2) {
        return (
            <div 
                className={backdropStyle}
                role="presentation"
                aria-label="Tutorial: Registrar tiro"
            >
                <div className="relative w-full h-full flex flex-col items-center justify-start">
                     {/* Text positioned above the court */}
                    <div className="text-center text-white mt-[35vh] sm:mt-[40vh] p-4 bg-gray-900/50 rounded-lg">
                        <h2 className="text-3xl sm:text-4xl font-bold">¡Perfecto!</h2>
                        <p className="text-xl sm:text-2xl mt-2 px-4">Ahora, toca en la cancha para finalizar el tutorial.</p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default TutorialOverlay;