
import React, { useRef, useState } from 'react';
import { GameState, PlayerStats } from '../types';
import XIcon from './XIcon';
import ShareIcon from './ShareIcon';
import ShareReport from './ShareReport';

// TypeScript declaration for html2canvas global variable
declare const html2canvas: any;

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameState: GameState;
    playerStats: PlayerStats[];
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, gameState, playerStats }) => {
    const reportRef = useRef<HTMLDivElement>(null);
    const [isCapturing, setIsCapturing] = useState(false);

    const handleShare = async () => {
        if (!reportRef.current || isCapturing) return;
        setIsCapturing(true);
        try {
            const canvas = await html2canvas(reportRef.current, {
                backgroundColor: '#0f172a',
                useCORS: true,
                scale: 2,
            });
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
            if (!blob) throw new Error('No se pudo crear la imagen.');
            
            const file = new File([blob], 'reporte-cestotracker.png', { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Reporte de Partido de Cesto Tracker',
                    text: 'Aquí están las estadísticas completas del partido de Cestoball.',
                });
            } else {
                alert('La función de compartir archivos no está disponible en este navegador.');
            }
        } catch (error) {
            console.error('Error al compartir:', error);
            alert('Ocurrió un error al intentar compartir el reporte.');
        } finally {
            setIsCapturing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-cyan-400">Compartir Reporte Completo</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Cerrar">
                        <XIcon />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto custom-scrollbar">
                    <div ref={reportRef}>
                        <ShareReport gameState={gameState} playerStats={playerStats} />
                    </div>
                </div>
                <div className="p-4 border-t border-slate-700 flex-shrink-0">
                    <button
                        onClick={handleShare}
                        disabled={isCapturing}
                        className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 disabled:bg-slate-600 disabled:opacity-50"
                    >
                        <ShareIcon />
                        {isCapturing ? 'Generando imagen...' : 'Compartir como Imagen'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
