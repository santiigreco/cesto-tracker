import React, { Suspense, lazy, useState, useEffect } from 'react';
import { ArrowRightIcon, ChevronDownIcon } from '../icons';
import { Settings, GameMode, RosterPlayer } from '../../types';
import { TEAMS_CONFIG } from '../../constants';
import { findBestTeamMatch } from '../../utils/teamUtils';
import AdvancedStreakSettings from './setup/AdvancedStreakSettings';
import MatchSetupFormFields from './setup/MatchSetupFormFields';

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
    const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(() => {
        if (initialSelectedPlayers.length > 0) return new Set(initialSelectedPlayers);
        if (!isEditMode) {
            try {
                const saved = localStorage.getItem(LAST_TEAM_STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    const matchesTeam = !initialSettings.myTeam || parsed.myTeam === initialSettings.myTeam;
                    if (matchesTeam && Array.isArray(parsed.players) && parsed.players.length > 0) {
                        return new Set(parsed.players);
                    }
                }
            } catch { /* ignore */ }
        }
        return new Set(allPlayers);
    });

    const [localPlayerNames, setLocalPlayerNames] = useState<Record<string, string>>(() => {
        if (Object.keys(initialPlayerNames).length > 0) return initialPlayerNames;
        if (!isEditMode) {
            try {
                const saved = localStorage.getItem(LAST_TEAM_STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    const matchesTeam = !initialSettings.myTeam || parsed.myTeam === initialSettings.myTeam;
                    if (matchesTeam && parsed.playerNames) {
                        return parsed.playerNames;
                    }
                }
            } catch { /* ignore */ }
        }
        return {};
    });

    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [isTeamSelectorOpen, setIsTeamSelectorOpen] = useState(false);
    const [isRivalSelectorOpen, setIsRivalSelectorOpen] = useState(false);
    const [isTournamentSelectorOpen, setIsTournamentSelectorOpen] = useState(false);
    const [settings, setSettings] = useState<Settings>(() => {
        if (isEditMode || initialSettings.myTeam) return initialSettings;
        try {
            const saved = localStorage.getItem(LAST_TEAM_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return { ...initialSettings, myTeam: parsed.myTeam || initialSettings.myTeam || '' };
            }
        } catch { /* ignore */ }
        return initialSettings;
    });

    const applyTeamRoster = (name: string, players: RosterPlayer[]) => {
        setSettings(prev => ({ ...prev, myTeam: name }));
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
            alert('Debés seleccionar al menos una jugadora.');
            return;
        }

        const sortedPlayers = Array.from(selectedPlayers).sort((a, b) => Number(a) - Number(b));

        const finalSettings = {
            ...settings,
            myTeam: settings.myTeam?.trim().slice(0, 50) || '',
            gameName: (settings.gameName?.trim() || 'Equipo Rival').slice(0, 50)
        };

        try {
            localStorage.setItem(LAST_TEAM_STORAGE_KEY, JSON.stringify({
                players: sortedPlayers,
                playerNames: localPlayerNames,
                myTeam: settings.myTeam,
            }));
        } catch { /* ignore */ }

        onSetupComplete(sortedPlayers, finalSettings, 'stats-tally', localPlayerNames);
    };

    const handleThresholdChange = (key: 'manoCalienteThreshold' | 'manoFriaThreshold', value: string) => {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
            setSettings(prev => ({ ...prev, [key]: numValue }));
        }
    };

    const handleTeamSelectedFromDropdown = (name: string, roster?: RosterPlayer[]) => {
        if (roster && roster.length > 0) {
            applyTeamRoster(name, roster);
        } else {
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

                    {isAdvancedOpen && (
                        <AdvancedStreakSettings
                            settings={settings}
                            onToggleManoCaliente={() => setSettings(prev => ({ ...prev, isManoCalienteEnabled: !prev.isManoCalienteEnabled }))}
                            onToggleManoFria={() => setSettings(prev => ({ ...prev, isManoFriaEnabled: !prev.isManoFriaEnabled }))}
                            onThresholdChange={handleThresholdChange}
                        />
                    )}

                    <MatchSetupFormFields
                        settings={settings}
                        isAdvancedOpen={isAdvancedOpen}
                        onOpenTeamSelector={() => setIsTeamSelectorOpen(true)}
                        onOpenRivalSelector={() => setIsRivalSelectorOpen(true)}
                        onOpenTournamentSelector={() => setIsTournamentSelectorOpen(true)}
                        onCategoryChange={(categoryName) => setSettings(prev => ({ ...prev, categoryName }))}
                        onDateChange={(gameDate) => setSettings(prev => ({ ...prev, gameDate }))}
                    />

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
                            setSettings(prev => ({ ...prev, gameName: name }));
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
                            setSettings(prev => ({ ...prev, tournamentId: id, tournamentName: name }));
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
