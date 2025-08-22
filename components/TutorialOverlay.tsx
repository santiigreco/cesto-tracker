import React from 'react';
import HandTapIcon from './HandTapIcon';

interface TutorialOverlayProps {
    step: number;
    onClose: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ step, onClose }) => {
    if (step === 1) {
        return (
            <div 
                className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-40"
                role="presentation"
            >
                <div className="text-center text-white animate-pulse" style={{ position: 'absolute', top: '28%' }}>
                    <h2 className="text-3xl sm:text-4xl font-bold">¡Vamos a empezar!</h2>
                    <p className="text-xl sm:text-2xl mt-4 px-4">Primero, selecciona el jugador que va a tirar.</p>
                </div>
                
                <HandTapIcon className="absolute top-[42%] sm:top-[45%]" />
            </div>
        );
    }

    if (step === 2) {
        return (
            <div 
                className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-40 cursor-pointer"
                onClick={onClose}
                role="button"
                aria-label="Cerrar tutorial"
            >
                <div className="text-center text-white mb-8 animate-pulse">
                    <h2 className="text-3xl sm:text-4xl font-bold">¡Perfecto!</h2>
                    <p className="text-xl sm:text-2xl mt-4 px-4">Ahora, toca en la cancha para registrar la posición.</p>
                </div>
                
                <HandTapIcon className="absolute top-[60%] sm:top-[55%]" />

                <div className="absolute bottom-10 text-center text-gray-400">
                    <p>(Toca en cualquier lugar para continuar)</p>
                </div>
            </div>
        );
    }

    return null;
};

export default TutorialOverlay;