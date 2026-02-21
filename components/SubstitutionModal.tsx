import React, { useState, useMemo } from 'react';
import { JerseyIcon } from './icons';
import { SwitchIcon } from './icons';
import { XIcon } from './icons';

interface SubstitutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubstitute: (playerOut: string, playerIn: string) => void;
    activePlayers: string[];
    availablePlayers: string[];
    playerNames: Record<string, string>;
}

const SubstitutionModal: React.FC<SubstitutionModalProps> = ({
    isOpen,
    onClose,
    onSubstitute,
    activePlayers,
    availablePlayers,
    playerNames
}) => {
    const [playerOut, setPlayerOut] = useState<string | null>(null);
    const [playerIn, setPlayerIn] = useState<string | null>(null);

    const benchPlayers = useMemo(() => {
        const activeSet = new Set(activePlayers);
        return availablePlayers.filter(p => !activeSet.has(p));
    }, [activePlayers, availablePlayers]);

    const handleConfirm = () => {
        if (playerOut && playerIn) {
            onSubstitute(playerOut, playerIn);
            // Reset selections after confirming
            setPlayerOut(null);
            setPlayerIn(null);
        }
    };
    
    const handleClose = () => {
        setPlayerOut(null);
        setPlayerIn(null);
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity"
            aria-labelledby="substitution-modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-slate-800 rounded-xl shadow-2xl p-4 sm:p-6 m-4 max-w-2xl w-full transform transition-all scale-100 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 id="substitution-modal-title" className="text-2xl sm:text-3xl font-bold text-cyan-400">Cambio de Jugador</h2>
                    <button onClick={handleClose} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Cerrar modal">
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 sm:gap-6 overflow-y-auto flex-grow custom-scrollbar pr-2">
                    {/* Players on Court */}
                    <div className="flex-1 bg-slate-900/50 p-3 sm:p-4 rounded-lg border border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-200 text-center mb-3">Sale (En Cancha)</h3>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {activePlayers.map(p => (
                                <JerseyIcon
                                    key={`out-${p}`}
                                    number={p}
                                    name={playerNames[p]}
                                    isSelected={playerOut === p}
                                    onClick={() => setPlayerOut(p)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Players on Bench */}
                    <div className="flex-1 bg-slate-900/50 p-3 sm:p-4 rounded-lg border border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-200 text-center mb-3">Entra (En Banco)</h3>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {benchPlayers.length > 0 ? benchPlayers.map(p => (
                                <JerseyIcon
                                    key={`in-${p}`}
                                    number={p}
                                    name={playerNames[p]}
                                    isSelected={playerIn === p}
                                    onClick={() => setPlayerIn(p)}
                                    disabled={p === playerOut}
                                />
                            )) : <p className="text-slate-500 text-sm mt-4">No hay jugadores en el banco.</p>}
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center flex-shrink-0">
                    <button
                        onClick={handleConfirm}
                        disabled={!playerOut || !playerIn}
                        className="w-full max-w-sm bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-cyan-500/50 text-lg disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <SwitchIcon className="h-5 w-5" />
                            Confirmar Cambio
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubstitutionModal;
