import React, { useState, useEffect } from 'react';
import { SyncState } from '../hooks/useSupabaseSync';
import { XIcon } from './icons';
import { CheckIcon } from './icons';

const CloudUploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9m-4-4l4-4 4 4" />
    </svg>
);

const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={`animate-spin ${className || "h-5 w-5"}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

interface SaveGameModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (gameName: string) => void;
    syncState: SyncState;
    initialGameName?: string;
}

const SaveGameModal: React.FC<SaveGameModalProps> = ({ isOpen, onClose, onSave, syncState, initialGameName }) => {
    const [gameName, setGameName] = useState('');

    useEffect(() => {
        if (isOpen) {
            setGameName(initialGameName || `Partido del ${new Date().toLocaleDateString('es-AR')}`);
        }
    }, [isOpen, initialGameName]);

    const handleSave = () => {
        if (gameName.trim()) {
            onSave(gameName.trim());
        }
    };
    
    useEffect(() => {
        if(syncState.status === 'success') {
            const timer = setTimeout(onClose, 1500);
            return () => clearTimeout(timer);
        }
    }, [syncState.status, onClose]);


    if (!isOpen) return null;

    const isSyncing = syncState.status === 'syncing';
    const isSuccess = syncState.status === 'success';
    const isError = syncState.status === 'error';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-2xl font-bold text-cyan-400">Guardar Partido</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Cerrar">
                        <XIcon />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="gameName" className="block mb-2 text-sm font-medium text-slate-300">Nombre del Partido</label>
                        <input
                            type="text"
                            id="gameName"
                            value={gameName}
                            onChange={(e) => setGameName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            disabled={isSyncing || isSuccess}
                            className="bg-slate-700 border border-slate-600 text-white text-base rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 disabled:opacity-50"
                            placeholder="Ej: Final vs. Vélez"
                            autoFocus
                        />
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={!gameName.trim() || isSyncing || isSuccess}
                        className={`w-full flex items-center justify-center gap-3 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform ${
                            isSyncing ? 'bg-slate-600 cursor-not-allowed' :
                            isSuccess ? 'bg-green-600' :
                            isError ? 'bg-red-600 hover:bg-red-700' :
                            'bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed'
                        }`}
                    >
                        {isSyncing && <SpinnerIcon className="h-5 w-5" />}
                        {isSuccess && <CheckIcon className="h-5 w-5" />}
                        {isError && <XIcon className="h-5 w-5" />}
                        {!isSyncing && !isSuccess && !isError && <CloudUploadIcon className="h-5 w-5" />}
                        <span>
                            {isSyncing ? 'Guardando...' :
                            isSuccess ? '¡Guardado con éxito!' :
                            isError ? 'Reintentar Guardado' :
                            'Confirmar y Guardar'}
                        </span>
                    </button>
                    {isError && <p className="text-red-400 text-sm text-center">{syncState.message}</p>}
                </div>
            </div>
        </div>
    );
};

export default SaveGameModal;