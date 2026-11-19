import React, { Suspense, lazy, useState, useEffect } from 'react';
import {
  ArrowRightIcon,
  ChevronDownIcon,
  JerseySvgIcon,
  ShieldIcon,
  TrophyIcon,
} from '../icons';
import { Settings, GameMode, RosterPlayer } from '../../types';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import TeamLogo from '@/components/ui/TeamLogo';

import { TEAMS_CONFIG, CATEGORIES_CONFIG } from '../../constants';
import { findBestTeamMatch } from '../../utils/teamUtils';

const TeamSelectorModal = lazy(() => import('@/components/modals/TeamSelectorModal'));
const TournamentSelectorModal = lazy(() => import('@/components/modals/TournamentSelectorModal'));

const LAST_TEAM_STORAGE_KEY = 'cesto_last_team_setup';
const allPlayers = Array.from({ length: 15 }, (_, i) => String(i + 1));

const defaultSettings: Settings = {
    gameName: '',
    myTeam: '',
    tournamentId: '',
    tournamentName: 'Primera A - Apertura 2026', // Pre-selected tournament
    categoryName: 'Primera A',
    gameDate: new Date().toISOString().split('T')[0],
    isManoCalienteEnabled: true,
    manoCalienteThreshold: 5,
    isManoFriaEnabled: true,
    manoFriaThreshold: 5,
};

interface PlayerSetupProps {
    onSetupComplete: (selectedPlayers: string[], settings: Settings, gameMode: GameMode, initialPlayerNames?: Record<string, string>) => void;
    onBack: () => void;
    initialSelectedPlayers?: string[];
    initialSettings?: Settings;
    initialGameMode?: GameMode | null;
    initialPlayerNames?: Record<string, string>;
    isEditMode?: boolean;
}

export const PlayerSetup: React.FC<PlayerSetupProps> = ({
    onSetupComplete,
    onBack,
    initialSelectedPlayers = [],
    initialSettings = defaultSettings,
    initialPlayerNames = {},
    isEditMode = false,
}) => {
    // ── State ──
    const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(() => {
        if (initialSelectedPlayers.length > 0) return new Set(initialSelectedPlayers);
        if (!isEditMode) {
            // Restore players from last saved team only if team matches (or none chosen yet)
            try {
                const saved = localStorage.getItem(LAST_TEAM_STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    const matchesTeam = !initialSettings.myTeam || parsed.myTeam === initialSettings.myTeam;
                    if (matchesTeam && Array.isArray(parsed.players) && parsed.players.length > 0) {
                        return new Set(parsed.players);
                    }
                }
            } catch (e) { /* ignore */ }
        }
        return new Set(allPlayers);
    });

    // Local state to hold player names when a team is loaded
    const [localPlayerNames, setLocalPlayerNames] = useState<Record<string, string>>(() => {
        if (Object.keys(initialPlayerNames).length > 0) return initialPlayerNames;
        if (!isEditMode) {
            // Restore from last saved team only if team matches (or none chosen yet)
            try {
                const saved = localStorage.getItem(LAST_TEAM_STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    const matchesTeam = !initialSettings.myTeam || parsed.myTeam === initialSettings.myTeam;
                    if (matchesTeam && parsed.playerNames) {
                        return parsed.playerNames;
                    }
                }
            } catch (e) { /* ignore */ }
        }
        return {};
    });

    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [isTeamSelectorOpen, setIsTeamSelectorOpen] = useState(false);
    const [isRivalSelectorOpen, setIsRivalSelectorOpen] = useState(false); // State for Rival selector
    const [isTournamentSelectorOpen, setIsTournamentSelectorOpen] = useState(false);
    const [settings, setSettings] = useState<Settings>(() => {
        // Only auto-restore myTeam for fresh games (no initialSettings provided)
        if (isEditMode || initialSettings.myTeam) return initialSettings;
        try {
            const saved = localStorage.getItem(LAST_TEAM_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return { ...initialSettings, myTeam: parsed.myTeam || initialSettings.myTeam || '' };
            }
        } catch (e) { /* ignore */ }
        return initialSettings;
    });

    // Unified handler for loading a team (either from "My Teams" modal or "Team Selector")
    const applyTeamRoster = (name: string, players: RosterPlayer[]) => {
        // 1. Set Team Name
        setSettings(prev => ({ ...prev, myTeam: name }));

        // 2. Set Players
        const newSelected = new Set<string>();
        const newNames: Record<string, string> = {};

        players.forEach(p => {
            newSelected.add(p.number);
            if (p.name) newNames[p.number] = p.name;
        });

        setSelectedPlayers(newSelected);
        setLocalPlayerNames(newNames);
    };

    useEffect(() => {
        if (!settings.tournamentName) {
            setSettings(prev => ({
                ...prev,
                tournamentName: defaultSettings.tournamentName
            }));
        }
    }, [settings.tournamentName]);

    // Apply smart name matching using TEAMS_CONFIG once settings are available
    useEffect(() => {
        if (TEAMS_CONFIG.length === 0) return;

        let nextMyTeam = settings.myTeam;
        let nextGameName = settings.gameName;
        let mappingChanged = false;

        if (settings.myTeam) {
            const leagueMatch = findBestTeamMatch(settings.myTeam, TEAMS_CONFIG);
            if (leagueMatch) { nextMyTeam = leagueMatch.name; mappingChanged = true; }
        }
        if (settings.gameName) {
            const leagueMatch = findBestTeamMatch(settings.gameName, TEAMS_CONFIG);
            if (leagueMatch) { nextGameName = leagueMatch.name; mappingChanged = true; }
        }

        if (mappingChanged) {
            setSettings(prev => ({ ...prev, myTeam: nextMyTeam, gameName: nextGameName }));
        }
    }, [initialSettings.myTeam, initialSettings.gameName]);

    const handleStart = () => {
        if (selectedPlayers.size < 1) {
            alert("Debés seleccionar al menos una jugadora.");
            return;
        }

        const sortedPlayers = Array.from(selectedPlayers).sort((a, b) => Number(a) - Number(b));

        // Set default name if empty and cap length
        const finalSettings = {
            ...settings,
            myTeam: settings.myTeam?.trim().slice(0, 50) || '',
            gameName: (settings.gameName?.trim() || 'Equipo Rival').slice(0, 50)
        };

        // Save this team config for next time
        try {
            localStorage.setItem(LAST_TEAM_STORAGE_KEY, JSON.stringify({
                players: sortedPlayers,
                playerNames: localPlayerNames,
                myTeam: settings.myTeam,
            }));
        } catch (e) { /* ignore */ }

        onSetupComplete(sortedPlayers, finalSettings, 'stats-tally', localPlayerNames);
    };

    const handleThresholdChange = (key: 'manoCalienteThreshold' | 'manoFriaThreshold', value: string) => {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
            setSettings({ ...settings, [key]: numValue });
        }
    };

    const handleTeamSelectedFromDropdown = (name: string, roster?: RosterPlayer[]) => {
        if (roster && roster.length > 0) {
            // If roster data came from the selector (because it was a saved team), apply it directly
            applyTeamRoster(name, roster);
        } else {
            // Just set the name if it's a generic team
            setSettings(prev => ({ ...prev, myTeam: name }));
        }
        setIsTeamSelectorOpen(false);
    };

    const isCorrection = Boolean(isEditMode);

    return (
        <div className="min-h-screen bg-surface-canvas text-ink-primary flex flex-col items-center justify-center p-4 sm:p-6 font-sans overflow-x-hidden selection:bg-brand/25 selection:text-ink-primary">

            <div className="w-full max-w-xl space-y-6">
                {/* ── Header ── */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-brand/10 border border-brand/25 text-brand text-[11px] font-extrabold uppercase tracking-widest mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                        <span>Configuración del Encuentro</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-ink-primary tracking-tight leading-tight">
                        {isCorrection ? 'Editar Partido' : 'Nuevo Partido'}
                    </h1>
                    <p className="text-ink-muted text-sm sm:text-base font-medium">
                        Definí los equipos y jugadoras para empezar.
                    </p>
                </div>

                {/* ── Main Setup Card ── */}
                <div className="bg-surface-card rounded-2xl border border-border-subtle p-5 sm:p-7 shadow-card space-y-6 relative">
                    {/* ── Advanced Settings Trigger ── */}
                    <button
                        type="button"
                        onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                        className="absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-surface-elevated text-ink-secondary hover:text-ink-primary hover:bg-surface-hover transition-colors border border-border-strong z-20"
                        title="Opciones avanzadas"
                        aria-label="Opciones avanzadas"
                        aria-expanded={isAdvancedOpen}
                    >
                        <ChevronDownIcon className={`h-5 w-5 transition-transform duration-200 ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* ── Advanced Settings Panel ── */}
                    {isAdvancedOpen && (
                        <div className="space-y-4 animate-fade-in bg-surface-elevated/50 p-4 rounded-xl border border-border-subtle mt-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider px-0.5 block">Mano Caliente</label>
                                    <div className="bg-surface-card p-3.5 rounded-xl border border-border-subtle space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-ink-secondary">Activar detección</span>
                                            <ToggleSwitch
                                                isEnabled={settings.isManoCalienteEnabled}
                                                onToggle={() => setSettings(prev => ({ ...prev, isManoCalienteEnabled: !prev.isManoCalienteEnabled }))}
                                            />
                                        </div>
                                        {settings.isManoCalienteEnabled && (
                                            <div className="flex items-center justify-between gap-4 animate-fade-in">
                                                <span className="text-xs font-medium text-ink-muted">Umbral (goles)</span>
                                                <input
                                                    type="number"
                                                    value={settings.manoCalienteThreshold}
                                                    onChange={(e) => handleThresholdChange('manoCalienteThreshold', e.target.value)}
                                                    className="w-16 bg-surface-elevated text-center text-brand font-extrabold rounded-lg py-1 border border-border-strong focus:border-brand text-base sm:text-sm tabular-nums"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider px-0.5 block">Mano Fría</label>
                                    <div className="bg-surface-card p-3.5 rounded-xl border border-border-subtle space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-ink-secondary">Activar detección</span>
                                            <ToggleSwitch
                                                isEnabled={settings.isManoFriaEnabled}
                                                onToggle={() => setSettings(prev => ({ ...prev, isManoFriaEnabled: !prev.isManoFriaEnabled }))}
                                            />
                                        </div>
                                        {settings.isManoFriaEnabled && (
                                            <div className="flex items-center justify-between gap-4 animate-fade-in">
                                                <span className="text-xs font-medium text-ink-muted">Umbral (fallos)</span>
                                                <input
                                                    type="number"
                                                    value={settings.manoFriaThreshold}
                                                    onChange={(e) => handleThresholdChange('manoFriaThreshold', e.target.value)}
                                                    className="w-16 bg-surface-elevated text-center text-sport-triple-light font-extrabold rounded-lg py-1 border border-border-strong focus:border-sport-triple-light text-base sm:text-sm tabular-nums"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Teams Selection ── */}
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!isAdvancedOpen ? 'pt-6' : ''}`}>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider px-0.5 block">Tu Equipo</label>
                            <button
                                type="button"
                                onClick={() => setIsTeamSelectorOpen(true)}
                                className="w-full min-h-[56px] flex items-center justify-between gap-2 bg-surface-elevated hover:bg-surface-hover border border-border-strong hover:border-brand/50 text-ink-primary rounded-xl px-4 py-3 transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    {settings.myTeam ? (
                                        <TeamLogo teamName={settings.myTeam} className="w-8 h-8 shrink-0" />
                                    ) : (
                                        <div className="p-2 bg-brand/15 border border-brand/25 rounded-lg text-brand shrink-0">
                                            <JerseySvgIcon className="h-4 w-4" />
                                        </div>
                                    )}
                                    <span className={`font-bold text-sm sm:text-base truncate ${settings.myTeam ? 'text-ink-primary' : 'text-ink-muted'}`}>
                                        {settings.myTeam || 'Seleccioná equipo'}
                                    </span>
                                </div>
                                <ChevronDownIcon className="h-4 w-4 text-ink-muted shrink-0" />
                            </button>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider px-0.5 block">Rival</label>
                            <button
                                type="button"
                                onClick={() => setIsRivalSelectorOpen(true)}
                                className="w-full min-h-[56px] flex items-center justify-between gap-2 bg-surface-elevated hover:bg-surface-hover border border-border-strong hover:border-brand/50 text-ink-primary rounded-xl px-4 py-3 transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    {settings.gameName ? (
                                        <TeamLogo teamName={settings.gameName} className="w-8 h-8 shrink-0" />
                                    ) : (
                                        <div className="p-2 bg-surface-card border border-border-subtle rounded-lg text-ink-muted shrink-0">
                                            <ShieldIcon className="h-4 w-4" />
                                        </div>
                                    )}
                                    <span className={`font-bold text-sm sm:text-base truncate ${settings.gameName ? 'text-ink-primary' : 'text-ink-muted'}`}>
                                        {settings.gameName || 'Nombre del rival'}
                                    </span>
                                </div>
                                <ChevronDownIcon className="h-4 w-4 text-ink-muted shrink-0" />
                            </button>
                        </div>
                    </div>

                    {/* ── Tournament Selection ── */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider px-0.5 block">Competencia / Torneo</label>
                        <button
                            type="button"
                            onClick={() => setIsTournamentSelectorOpen(true)}
                            className="w-full min-h-[52px] flex items-center justify-between gap-2 bg-surface-elevated hover:bg-surface-hover border border-border-strong hover:border-brand/50 text-ink-primary rounded-xl px-4 py-3 transition-colors"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <TrophyIcon className="h-5 w-5 text-sport-warn-light shrink-0" />
                                <span className="font-bold text-sm sm:text-base truncate">{settings.tournamentName || 'Todos'}</span>
                            </div>
                            <ChevronDownIcon className="h-4 w-4 text-ink-muted shrink-0" />
                        </button>
                    </div>

                    {/* ── Category and Date ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider px-0.5 block">Categoría</label>
                            <div className="relative">
                                <select
                                    value={settings.categoryName || ''}
                                    onChange={(e) => setSettings({ ...settings, categoryName: e.target.value })}
                                    className="w-full min-h-[52px] bg-surface-elevated hover:bg-surface-hover border border-border-strong focus:border-brand text-ink-primary rounded-xl px-4 py-3 transition-colors appearance-none font-bold text-base sm:text-sm cursor-pointer"
                                >
                                    <option value="" disabled>Seleccionar Categoría</option>
                                    {CATEGORIES_CONFIG.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider px-0.5 block">Fecha</label>
                            <input
                                type="date"
                                value={settings.gameDate || ''}
                                onChange={(e) => setSettings({ ...settings, gameDate: e.target.value })}
                                className="w-full min-h-[52px] bg-surface-elevated hover:bg-surface-hover border border-border-strong focus:border-brand text-ink-primary rounded-xl px-4 py-3 transition-colors font-bold text-base sm:text-sm tabular-nums [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    {/* ── Start Button ── */}
                    <div className="pt-2 space-y-2">
                        <button
                            type="button"
                            onClick={handleStart}
                            className="w-full min-h-[52px] py-3.5 rounded-xl bg-brand hover:bg-brand-hover text-ink-inverse font-black text-sm sm:text-base uppercase tracking-wider shadow-card active:scale-[0.98] transition-all flex items-center justify-center gap-2 group/start"
                        >
                            <span>{isCorrection ? 'Guardar Cambios' : 'Comenzar Seguimiento'}</span>
                            <ArrowRightIcon className="h-4 w-4 group-hover/start:translate-x-0.5 transition-transform" />
                        </button>
                        <button
                            type="button"
                            onClick={onBack}
                            className="w-full min-h-[44px] text-ink-muted hover:text-ink-primary font-bold text-xs uppercase tracking-wider transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Modals (Mounted on demand) ── */}
            <Suspense fallback={null}>
                {isTeamSelectorOpen && (
                    <TeamSelectorModal
                        isOpen={isTeamSelectorOpen}
                        onClose={() => setIsTeamSelectorOpen(false)}
                        onSelectTeam={handleTeamSelectedFromDropdown}
                        currentTeam={settings.myTeam || ''}
                        title="Seleccioná tu Equipo"
                        isRival={false}
                    />
                )}

                {isRivalSelectorOpen && (
                    <TeamSelectorModal
                        isOpen={isRivalSelectorOpen}
                        onClose={() => setIsRivalSelectorOpen(false)}
                        onSelectTeam={(name) => {
                            setSettings({ ...settings, gameName: name });
                            setIsRivalSelectorOpen(false);
                        }}
                        currentTeam={settings.gameName || ''}
                        title="Seleccioná el Rival"
                        isRival={true}
                    />
                )}

                {isTournamentSelectorOpen && (
                    <TournamentSelectorModal
                        isOpen={isTournamentSelectorOpen}
                        onClose={() => setIsTournamentSelectorOpen(false)}
                        onSelectTournament={(id, name) => {
                            setSettings({ ...settings, tournamentId: id, tournamentName: name });
                            setIsTournamentSelectorOpen(false);
                        }}
                        currentTournamentId={settings.tournamentId}
                    />
                )}
            </Suspense>

        </div>
    );
};

export default PlayerSetup;
