

import React from 'react';

interface TutorialOverlayProps {
    step: number;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ step }) => {
    const backdropStyle = "fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300";

    if (step === 1) {
        return (
            <>
                <div className={backdropStyle} role="presentation" />
                <div className="fixed inset-0 z-40 pointer-events-none flex items-end justify-center">
                    <div className="pointer-events-auto mb-24 sm:mb-32 w-full max-w-md text-center text-white p-4 bg-slate-900/50 rounded-lg">
                        <h2 className="text-3xl sm:text-4xl font-bold">¡Vamos a empezar!</h2>
                        <p className="text-xl sm:text-2xl mt-2 px-4">Primero, selecciona el jugador que va a tirar.</p>
                    </div>
                </div>
            </>
        );
    }

    if (step === 2) {
        return (
            <>
                <div 
                    className={backdropStyle}
                    role="presentation"
                    aria-label="Tutorial: Registrar tiro"
                />
                <div className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center">
                    <div className="pointer-events-auto w-full max-w-md text-center text-white p-4 bg-slate-900/50 rounded-lg">
                        <h2 className="text-3xl sm:text-4xl font-bold">¡Perfecto!</h2>
                        <p className="text-xl sm:text-2xl mt-2 px-4">Ahora, toca en la cancha para finalizar el tutorial.</p>
                    </div>
                </div>
            </>
        );
    }

    return null;
};

export default TutorialOverlay;