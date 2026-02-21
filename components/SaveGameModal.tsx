import React, { useState, useEffect } from 'react';
import { X, Check, CloudUpload, Loader2 } from 'lucide-react';
import { SyncState } from '../hooks/useSupabaseSync';

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
                        <X />
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
                        {isSyncing && <Loader2 className="h-5 w-5 animate-spin" />}
                        {isSuccess && <Check className="h-5 w-5" />}
                        {isError && <X className="h-5 w-5" />}
                        {!isSyncing && !isSuccess && !isError && <CloudUpload className="h-5 w-5" />}
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