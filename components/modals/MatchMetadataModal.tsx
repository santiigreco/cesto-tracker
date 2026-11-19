import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { CATEGORIES_CONFIG } from '../../constants';
import type { MatchMetadataIntent } from '../../context/UIContext';
import { GameState, RosterPlayer, Settings } from '../../types';
import { getActivePlayersFromMatch, saveLastTeamSetup } from '../../utils/matchMetadata';
import { ChevronDownIcon, JerseySvgIcon, XIcon } from '../icons';
import TeamLogo from '../ui/TeamLogo';
import TeamSelectorModal from './TeamSelectorModal';
import TournamentSelectorModal from './TournamentSelectorModal';

interface MatchMetadataModalProps {
    isOpen: boolean;
    intent: MatchMetadataIntent;
    gameState: GameState;
    onClose: () => void;
    onConfirm: (updatedSettings: Settings, updatedPlayerNames: Record<string, string>) => void;
}

const INTENT_COPY: Record<MatchMetadataIntent, { title: string; subtitle: string; cta: string }> = {
    edit: {
        title: 'Datos del Partido',
        subtitle: 'Cargá tu equipo, el rival y opcionalmente los nombres de las jugadoras.',
        cta: 'Guardar datos',
    },
    save: {
        title: 'Completá los datos antes de guardar',
        subtitle: 'Para respaldar el partido en la nube necesitamos identificar a los dos equipos.',
        cta: 'Guardar en la nube',
    },
    finish: {
        title: 'Completá los datos para finalizar',
        subtitle: 'Identificá tu equipo y el rival antes de cerrar y guardar el partido.',
        cta: 'Completar y finalizar',
    },
    excel: {
        title: 'Completá los datos para el Excel',
        subtitle: 'La planilla oficial de la Federación incluye equipo, rival, torneo y categoría.',
        cta: 'Guardar y descargar Excel',
    },
    share: {
        title: 'Completá los datos para el reporte',
        subtitle: 'Indicá tu equipo y el rival para generar la placa e imagen del partido.',
        cta: 'Guardar y ver reporte',
    },
};

const MatchMetadataModal: React.FC<MatchMetadataModalProps> = ({
    isOpen,
    intent,
    gameState,
    onClose,
    onConfirm,
}) => {
    const [myTeam, setMyTeam] = useState(gameState.settings.myTeam || '');
    const [rival, setRival] = useState(gameState.settings.gameName || '');
    const [tournamentId, setTournamentId] = useState(gameState.settings.tournamentId || '');
    const [tournamentName, setTournamentName] = useState(
        gameState.settings.tournamentName || 'Primera A - Apertura 2026'
    );
    const [categoryName, setCategoryName] = useState(gameState.settings.categoryName || 'Primera A');
    const [playerNamesDraft, setPlayerNamesDraft] = useState<Record<string, string>>(
        gameState.playerNames || {}
    );

    const [isMyTeamSelectorOpen, setIsMyTeamSelectorOpen] = useState(false);
    const [isRivalSelectorOpen, setIsRivalSelectorOpen] = useState(false);
    const [isTournamentSelectorOpen, setIsTournamentSelectorOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setMyTeam(gameState.settings.myTeam || '');
        setRival(gameState.settings.gameName || '');
        setTournamentId(gameState.settings.tournamentId || '');
        setTournamentName(gameState.settings.tournamentName || 'Primera A - Apertura 2026');
        setCategoryName(gameState.settings.categoryName || 'Primera A');
        setPlayerNamesDraft(gameState.playerNames || {});
        setIsMyTeamSelectorOpen(false);
        setIsRivalSelectorOpen(false);
        setIsTournamentSelectorOpen(false);
    }, [
        isOpen,
        gameState.settings.myTeam,
        gameState.settings.gameName,
        gameState.settings.tournamentId,
        gameState.settings.tournamentName,
        gameState.settings.categoryName,
        gameState.playerNames,
    ]);

    const hasSubModalOpen = isMyTeamSelectorOpen || isRivalSelectorOpen || isTournamentSelectorOpen;

    useEffect(() => {
        if (!isOpen || typeof document === 'undefined') return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !hasSubModalOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = prevOverflow;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, hasSubModalOpen, onClose]);

    const activePlayers = useMemo(
        () =>
            getActivePlayersFromMatch({
                availablePlayers: gameState.availablePlayers,
                tallyStats: gameState.tallyStats,
                gameLog: gameState.gameLog,
            }),
        [gameState.availablePlayers, gameState.tallyStats, gameState.gameLog]
    );

    if (!isOpen) return null;

    const copy = INTENT_COPY[intent] || INTENT_COPY.edit;
    const isValid = Boolean(myTeam.trim() && rival.trim());

    const handleMyTeamSelected = (teamName: string, roster?: RosterPlayer[]) => {
        setMyTeam(teamName);
        if (roster && roster.length > 0) {
            setPlayerNamesDraft((prev) => {
                const next = { ...prev };
                roster.forEach((p) => {
                    const numKey = p.number?.trim();
                    if (numKey && p.name?.trim() && !next[numKey]?.trim()) {
                        next[numKey] = p.name.trim();
                    }
                });
                return next;
            });
        }
        setIsMyTeamSelectorOpen(false);
    };

    const handleRivalSelected = (teamName: string) => {
        setRival(teamName);
        setIsRivalSelectorOpen(false);
    };

    const handleTournamentSelected = (id: string, name: string) => {
        setTournamentId(id);
        setTournamentName(name);
        setIsTournamentSelectorOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;

        const trimmedTeam = myTeam.trim();
        const trimmedRival = rival.trim();

        const updatedPlayerNames: Record<string, string> = { ...(gameState.playerNames || {}) };
        Object.entries(playerNamesDraft).forEach(([num, name]) => {
            const cleaned = name.trim();
            if (cleaned) {
                updatedPlayerNames[num] = cleaned;
            } else {
                delete updatedPlayerNames[num];
            }
        });

        const updatedSettings: Settings = {
            ...gameState.settings,
            myTeam: trimmedTeam,
            gameName: trimmedRival,
            tournamentId,
            tournamentName,
            categoryName,
            gameDate: gameState.settings.gameDate || new Date().toISOString().split('T')[0],
        };

        saveLastTeamSetup(trimmedTeam, gameState.availablePlayers, updatedPlayerNames);
        onConfirm(updatedSettings, updatedPlayerNames);
    };

    const modalContent = (
        <div
            className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-[80] p-3 sm:p-4 animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="match-metadata-modal-title"
            onClick={() => {
                if (!hasSubModalOpen) onClose();
            }}
        >
            <div
                className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-start gap-3 p-4 sm:p-5 border-b border-slate-800 bg-slate-900 flex-shrink-0">
                    <div className="min-w-0">
                        <h2 id="match-metadata-modal-title" className="text-lg sm:text-xl font-black text-cyan-400 leading-tight">
                            {copy.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1">{copy.subtitle}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
                        aria-label="Cerrar"
                    >
                        <XIcon />
                    </button>
                </div>

                {/* Body */}
                <form id="match-metadata-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto custom-scrollbar p-4 sm:p-5 space-y-4">
                    {/* Required: Teams */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300">
                                Tu Equipo <span className="text-red-400">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsMyTeamSelectorOpen(true)}
                                className="w-full min-h-[52px] flex items-center justify-between gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl px-3.5 py-2.5 text-left transition-colors"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    {myTeam ? (
                                        <TeamLogo teamName={myTeam} className="h-7 w-7 shrink-0" />
                                    ) : (
                                        <div className="p-1.5 bg-cyan-950/80 rounded-lg text-cyan-400 shrink-0">
                                            <JerseySvgIcon className="h-4 w-4" />
                                        </div>
                                    )}
                                    <span className={`text-sm font-bold truncate ${myTeam ? 'text-white' : 'text-slate-400'}`}>
                                        {myTeam || 'Seleccionar equipo'}
                                    </span>
                                </div>
                                <ChevronDownIcon className="h-4 w-4 text-slate-400 shrink-0" />
                            </button>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300">
                                Rival <span className="text-red-400">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsRivalSelectorOpen(true)}
                                className="w-full min-h-[52px] flex items-center justify-between gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl px-3.5 py-2.5 text-left transition-colors"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    {rival ? (
                                        <TeamLogo teamName={rival} className="h-7 w-7 shrink-0" />
                                    ) : (
                                        <span className="text-lg shrink-0">🛡️</span>
                                    )}
                                    <span className={`text-sm font-bold truncate ${rival ? 'text-white' : 'text-slate-400'}`}>
                                        {rival || 'Nombre del rival'}
                                    </span>
                                </div>
                                <ChevronDownIcon className="h-4 w-4 text-slate-400 shrink-0" />
                            </button>
                        </div>
                    </div>

                    {/* Optional / Preloaded: Tournament & Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Torneo (opcional)
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsTournamentSelectorOpen(true)}
                                className="w-full min-h-[46px] flex items-center justify-between gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl px-3.5 py-2 text-left transition-colors"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-base shrink-0">🏆</span>
                                    <span className="text-sm font-semibold text-slate-200 truncate">
                                        {tournamentName || 'Apertura 2026'}
                                    </span>
                                </div>
                                <ChevronDownIcon className="h-4 w-4 text-slate-400 shrink-0" />
                            </button>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="metadata-category" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Categoría (opcional)
                            </label>
                            <select
                                id="metadata-category"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                className="w-full min-h-[46px] bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            >
                                {CATEGORIES_CONFIG.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Optional: Active players' names */}
                    {activePlayers.length > 0 && (
                        <div className="space-y-2.5 pt-2 border-t border-slate-800">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                                    Nombres (opcional · solo jugadoras con actividad)
                                </h3>
                                <span className="text-[11px] font-bold text-slate-500 shrink-0">
                                    {activePlayers.length}
                                </span>
                            </div>

                            <div className="space-y-2">
                                {activePlayers.map((num) => (
                                    <div
                                        key={num}
                                        className="flex items-center gap-2.5 bg-slate-800/70 p-2 rounded-xl border border-slate-700/60"
                                    >
                                        <div className="w-9 h-9 bg-cyan-600/90 rounded-lg flex items-center justify-center font-black text-white text-xs shrink-0">
                                            #{num}
                                        </div>
                                        <input
                                            type="text"
                                            maxLength={40}
                                            value={playerNamesDraft[num] || ''}
                                            onChange={(e) =>
                                                setPlayerNamesDraft((prev) => ({
                                                    ...prev,
                                                    [num]: e.target.value,
                                                }))
                                            }
                                            placeholder={`Nombre jugadora #${num}`}
                                            aria-label={`Nombre de jugadora #${num}`}
                                            className="flex-1 min-w-0 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-base font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </form>

                {/* Sticky Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-900 space-y-2 flex-shrink-0">
                    {!isValid && (
                        <p className="text-xs text-amber-300 text-center font-medium">
                            Seleccioná tu equipo y el rival para continuar
                        </p>
                    )}
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 min-h-[48px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm border border-slate-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            form="match-metadata-form"
                            disabled={!isValid}
                            className="flex-1 min-h-[48px] rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg transition-all"
                        >
                            {copy.cta}
                        </button>
                    </div>
                </div>
            </div>

            {isMyTeamSelectorOpen && (
                <TeamSelectorModal
                    isOpen={isMyTeamSelectorOpen}
                    onClose={() => setIsMyTeamSelectorOpen(false)}
                    onSelectTeam={handleMyTeamSelected}
                    currentTeam={myTeam}
                    title="Selecciona tu Equipo"
                    isRival={false}
                />
            )}

            {isRivalSelectorOpen && (
                <TeamSelectorModal
                    isOpen={isRivalSelectorOpen}
                    onClose={() => setIsRivalSelectorOpen(false)}
                    onSelectTeam={handleRivalSelected}
                    currentTeam={rival}
                    title="Selecciona el Rival"
                    isRival={true}
                />
            )}

            {isTournamentSelectorOpen && (
                <TournamentSelectorModal
                    isOpen={isTournamentSelectorOpen}
                    onClose={() => setIsTournamentSelectorOpen(false)}
                    onSelectTournament={handleTournamentSelected}
                    currentTournamentId={tournamentId}
                />
            )}
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

export default MatchMetadataModal;
