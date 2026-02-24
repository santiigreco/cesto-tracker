
import React, { useState, useEffect } from 'react';
import { JerseyIcon } from './icons';
import { Settings, GameMode, SavedTeam, RosterPlayer } from '../types';
import ToggleSwitch from './ToggleSwitch';
import { ChevronDownIcon } from './icons';
import { UndoIcon } from './icons';
import { UsersIcon } from './icons';
import TeamSelectorModal from './TeamSelectorModal';
import TournamentSelectorModal from './TournamentSelectorModal';
import TeamRosterModal from './TeamRosterModal';
import { supabase } from '../utils/supabaseClient';
import { useFixtureSuggestion } from '../hooks/useFixtureSuggestion';
import { useTeamManager } from '../hooks/useTeamManager';
import { TEAMS_CONFIG } from '../constants';
import { findBestTeamMatch } from '../utils/teamUtils';

const LAST_TEAM_STORAGE_KEY = 'cesto_last_team_setup';
const allPlayers = Array.from({ length: 15 }, (_, i) => String(i + 1));

const defaultSettings: Settings = {
    gameName: '',
    myTeam: '',
    tournamentId: '',
    tournamentName: 'Primera A - Apertura 2026', // Pre-selected tournament
    isManoCalienteEnabled: true,
    manoCalienteThreshold: 5,
    isManoFriaEnabled: true,
    manoFriaThreshold: 5,
};

// ── Fixture Suggestion Banner ─────────────────────────────────────────────────
interface FixtureSuggestionBannerProps {
    myTeam?: string;
    rival?: string;
    dismissed: boolean;
    linked: boolean;
    onLink: (fixtureId: string) => void;
    onUnlink: () => void;
    onDismiss: () => void;
}

const FixtureSuggestionBanner: React.FC<FixtureSuggestionBannerProps> = ({
    myTeam, rival, dismissed, linked, onLink, onUnlink, onDismiss
}) => {
    const { suggestion, loading } = useFixtureSuggestion(myTeam, rival);

    if (!myTeam || !rival || dismissed || loading || !suggestion) return null;

    const matchDate = new Date(`${suggestion.date}T00:00:00`);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((matchDate.getTime() - today.getTime()) / 86_400_000);
    const dayLabel = diffDays === 0 ? 'HOY' : diffDays === 1 ? 'MAÑANA'
        : diffDays < 0 ? `hace ${Math.abs(diffDays)}d`
            : matchDate.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();

    if (linked) {
        return (
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 mb-2">
                <span className="text-lg shrink-0">🔗</span>
                <div className="flex-grow min-w-0">
                    <p className="text-xs font-black text-emerald-400 uppercase tracking-wider">Vinculado al fixture</p>
                    <p className="text-sm text-white font-bold truncate">
                        {suggestion.homeTeam} vs {suggestion.awayTeam}
                        {suggestion.round ? ` · ${suggestion.round}` : ''}
                    </p>
                </div>
                <button
                    onClick={onUnlink}
                    className="text-[10px] text-slate-500 hover:text-slate-300 underline shrink-0"
                >
                    Desvincular
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 mb-2">
            <span className="text-lg shrink-0">📅</span>
            <div className="flex-grow min-w-0">
                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">
                    Partido encontrado en fixture · {dayLabel}{suggestion.time ? ` · ${suggestion.time}hs` : ''}
                </p>
                <p className="text-sm text-white font-bold truncate">
                    {suggestion.homeTeam} vs {suggestion.awayTeam}
                    {suggestion.round ? ` · ${suggestion.round}` : ''}
                </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <button
                    onClick={() => onLink(suggestion.id)}
                    className="text-xs font-black bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                    Vincular
                </button>
                <button
                    onClick={onDismiss}
                    className="text-slate-500 hover:text-slate-300 text-lg leading-none"
                    aria-label="Ignorar"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

interface PlayerSetupProps {
    onSetupComplete: (selectedPlayers: string[], settings: Settings, gameMode: GameMode, initialPlayerNames?: Record<string, string>) => void;
    onBack: () => void;
    initialSelectedPlayers?: string[];
    initialSettings?: Settings;
    initialGameMode?: GameMode | null;
    initialPlayerNames?: Record<string, string>;
}

export const PlayerSetup: React.FC<PlayerSetupProps> = ({
    onSetupComplete,
    onBack,
    initialSelectedPlayers = [],
    initialSettings = defaultSettings,
    initialGameMode = null,
    initialPlayerNames = {}
}) => {
    // ── State ──
    const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(() => {
        if (initialSelectedPlayers.length > 0) return new Set(initialSelectedPlayers);
        // Restore players from last saved team
        try {
            const saved = localStorage.getItem(LAST_TEAM_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.players) return new Set(parsed.players);
            }
        } catch (e) { /* ignore */ }
        return new Set(allPlayers);
    });

    // Local state to hold player names when a team is loaded
    const [localPlayerNames, setLocalPlayerNames] = useState<Record<string, string>>(() => {
        if (Object.keys(initialPlayerNames).length > 0) return initialPlayerNames;
        // Restore from last saved team
        try {
            const saved = localStorage.getItem(LAST_TEAM_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed.playerNames || {};
            }
        } catch (e) { /* ignore */ }
        return {};
    });

    const { teams: savedTeams, fetchTeams } = useTeamManager();

    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [isTeamSelectorOpen, setIsTeamSelectorOpen] = useState(false);
    const [isRivalSelectorOpen, setIsRivalSelectorOpen] = useState(false); // State for Rival selector
    const [isTournamentSelectorOpen, setIsTournamentSelectorOpen] = useState(false);
    const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);

    const [settings, setSettings] = useState<Settings>(() => {
        // Only auto-restore myTeam for fresh games (no initialSettings provided)
        if (initialSettings.myTeam) return initialSettings;
        try {
            const saved = localStorage.getItem(LAST_TEAM_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return { ...initialSettings, myTeam: parsed.myTeam || initialSettings.myTeam || '' };
            }
        } catch (e) { /* ignore */ }
        return initialSettings;
    });
    const [fixtureLinked, setFixtureLinked] = useState(!!initialSettings.fixture_id); // User confirmed the fixture link
    const [fixtureDismissed, setFixtureDismissed] = useState(false);


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

    // ── Smart Team Mapping ──
    useEffect(() => {
        fetchTeams();
    }, []);

    useEffect(() => {
        if (!settings.tournamentName) {
            setSettings(prev => ({
                ...prev,
                tournamentName: defaultSettings.tournamentName
            }));
        }
    }, [settings.tournamentName]);

    // Apply smart mapping once teams are loaded
    useEffect(() => {
        if (savedTeams.length === 0 && TEAMS_CONFIG.length === 0) return;

        // This effect should only run once to initialize from fixture names
        // or when savedTeams are first loaded.

        let nextMyTeam = settings.myTeam;
        let nextGameName = settings.gameName;
        let teamToApply: SavedTeam | null = null;
        let mappingChanged = false;

        // 1. Resolve My Team
        if (settings.myTeam) {
            const savedMatch = findBestTeamMatch<SavedTeam>(settings.myTeam, savedTeams);
            if (savedMatch) {
                nextMyTeam = savedMatch.name;
                mappingChanged = true;
                // Auto-apply roster if empty or default
                if (selectedPlayers.size === 0 || selectedPlayers.size === allPlayers.length) {
                    teamToApply = savedMatch as SavedTeam;
                }
            } else {
                const leagueMatch = findBestTeamMatch(settings.myTeam, TEAMS_CONFIG);
                if (leagueMatch) {
                    nextMyTeam = leagueMatch.name;
                    mappingChanged = true;
                }
            }
        }

        // 2. Resolve Rival Team
        if (settings.gameName) {
            const leagueMatch = findBestTeamMatch(settings.gameName, TEAMS_CONFIG);
            if (leagueMatch) {
                nextGameName = leagueMatch.name;
                mappingChanged = true;
            }
        }

        if (mappingChanged) {
            setSettings(prev => ({ ...prev, myTeam: nextMyTeam, gameName: nextGameName }));
        }

        if (teamToApply) {
            applyTeamRoster(teamToApply.name, teamToApply.players);
        }

    }, [savedTeams, initialSettings.myTeam, initialSettings.gameName]);

    // Default to 'stats-tally' (Anotador) if no mode provided
    const [selectedMode, setSelectedMode] = useState<GameMode>(initialGameMode || 'stats-tally');

    const togglePlayer = (playerNumber: string) => {
        setSelectedPlayers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(playerNumber)) {
                newSet.delete(playerNumber);
            } else {
                newSet.add(playerNumber);
            }
            return newSet;
        });
    };

    const handleStart = () => {
        if (selectedPlayers.size < 1) {
            alert("Debes seleccionar al menos un jugador.");
            return;
        }
        if (selectedMode === 'shot-chart' && selectedPlayers.size < 6) {
            alert('El modo "Registro de Tiros" requiere un equipo de al menos 6 jugadores.');
            return;
        }

        const sortedPlayers = Array.from(selectedPlayers).sort((a, b) => Number(a) - Number(b));

        // Set default name if empty
        const finalSettings = {
            ...settings,
            gameName: settings.gameName?.trim() || `Partido del ${new Date().toLocaleDateString()}`
        };

        // Save this team config for next time
        try {
            localStorage.setItem(LAST_TEAM_STORAGE_KEY, JSON.stringify({
                players: sortedPlayers,
                playerNames: localPlayerNames,
                myTeam: settings.myTeam,
            }));
        } catch (e) { /* ignore */ }

        onSetupComplete(sortedPlayers, finalSettings, selectedMode || 'stats-tally', localPlayerNames);
    };

    const handleThresholdChange = (key: 'manoCalienteThreshold' | 'manoFriaThreshold', value: string) => {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
            setSettings({ ...settings, [key]: numValue });
        }
    };

    const handleTeamLoadedFromManager = (team: SavedTeam) => {
        applyTeamRoster(team.name, team.players);
        setIsRosterModalOpen(false);
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

    const isCorrection = initialSelectedPlayers.length > 0;
    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    React.useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
            if (user) {
                // Check if admin via profile
                supabase
                    .from('profiles')
                    .select('is_admin, permission_role')
                    .eq('id', user.id)
                    .single()
                    .then(({ data }) => {
                        if (data) {
                            setIsAdmin(data.is_admin === true || data.permission_role === 'admin');
                        }
                    });
            }
        });
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0f18] text-slate-200 flex flex-col items-center justify-center p-4 sm:p-6 font-sans overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200 relative">

            {/* ── Background Glows ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full animate-pulse-slow opacity-50"></div>
            </div>

            <div className="w-full max-w-xl z-10 space-y-6">
                {/* ── Header ── */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        Configuración del Encuentro
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                        {isCorrection ? 'Editar Partido' : 'Nuevo Partido'}
                    </h1>
                    <p className="text-slate-500 text-sm sm:text-base font-medium">
                        Define los equipos y jugadores para comenzar.
                    </p>
                </div>

                {/* ── Main Setup Card ── */}
                <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-700/50 p-6 sm:p-8 shadow-2xl space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                        <JerseyIcon className="w-32 h-32 rotate-12" />
                    </div>

                    <FixtureSuggestionBanner
                        myTeam={settings.myTeam}
                        rival={settings.gameName}
                        dismissed={fixtureDismissed}
                        linked={fixtureLinked}
                        onLink={(fixtureId) => {
                            setSettings(prev => ({ ...prev, fixture_id: fixtureId }));
                            setFixtureLinked(true);
                        }}
                        onUnlink={() => {
                            setSettings(prev => ({ ...prev, fixture_id: undefined }));
                            setFixtureLinked(false);
                        }}
                        onDismiss={() => setFixtureDismissed(true)}
                    />

                    {/* ── Advanced Settings Trigger ── */}
                    <button
                        onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                        className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all border border-slate-700/50 z-20"
                        title="Opciones Avanzadas"
                    >
                        <ChevronDownIcon className={`h-5 w-5 transition-transform duration-300 ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* ── Advanced Settings Panel ── */}
                    {isAdvancedOpen && (
                        <div className="space-y-6 animate-slide-down bg-slate-800/30 p-5 rounded-2xl border border-slate-700/30 mb-8 mt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Mano Caliente</label>
                                    <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/50 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-300">Activar detección</span>
                                            <ToggleSwitch
                                                checked={settings.isManoCalienteEnabled}
                                                onChange={(val) => setSettings({ ...settings, isManoCalienteEnabled: val })}
                                            />
                                        </div>
                                        {settings.isManoCalienteEnabled && (
                                            <div className="flex items-center justify-between gap-4 animate-fade-in">
                                                <span className="text-[10px] font-medium text-slate-400">Umbral (goles)</span>
                                                <input
                                                    type="number"
                                                    value={settings.manoCalienteThreshold}
                                                    onChange={(e) => handleThresholdChange('manoCalienteThreshold', e.target.value)}
                                                    className="w-16 bg-slate-800 text-center text-cyan-400 font-black rounded-lg py-1 border border-slate-700 focus:border-cyan-500 outline-none"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Mano Fría</label>
                                    <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/50 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-300">Activar detección</span>
                                            <ToggleSwitch
                                                checked={settings.isManoFriaEnabled}
                                                onChange={(val) => setSettings({ ...settings, isManoFriaEnabled: val })}
                                            />
                                        </div>
                                        {settings.isManoFriaEnabled && (
                                            <div className="flex items-center justify-between gap-4 animate-fade-in">
                                                <span className="text-[10px] font-medium text-slate-400">Umbral (fallos)</span>
                                                <input
                                                    type="number"
                                                    value={settings.manoFriaThreshold}
                                                    onChange={(e) => handleThresholdChange('manoFriaThreshold', e.target.value)}
                                                    className="w-16 bg-slate-800 text-center text-blue-400 font-black rounded-lg py-1 border border-slate-700 focus:border-blue-500 outline-none"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* ── Teams Selection ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Tu Equipo</label>
                            <div className="relative group/field">
                                <button
                                    onClick={() => setIsTeamSelectorOpen(true)}
                                    className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white rounded-2xl px-5 py-4 transition-all group-hover/field:border-cyan-500/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-cyan-900/30 rounded-xl text-cyan-400">
                                            <JerseyIcon className="h-5 w-5" />
                                        </div>
                                        <span className="font-bold text-sm sm:text-base">{settings.myTeam || 'Selecciona equipo'}</span>
                                    </div>
                                    <ChevronDownIcon className="h-4 w-4 text-slate-500" />
                                </button>
                                {user && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setIsRosterModalOpen(true); }}
                                        className="mt-2 w-full flex items-center justify-center gap-2 text-[10px] font-black text-cyan-500 hover:text-cyan-400 uppercase tracking-widest py-2 rounded-xl bg-cyan-500/5 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20 transition-all"
                                    >
                                        <UsersIcon className="h-3 w-3" /> Mis Planteles
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Rival</label>
                            <button
                                onClick={() => setIsRivalSelectorOpen(true)}
                                className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white rounded-2xl px-5 py-4 transition-all group-hover/field:border-cyan-500/50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-900/80 rounded-xl text-slate-500">
                                        <span className="text-xl">🛡️</span>
                                    </div>
                                    <span className="font-bold text-sm sm:text-base truncate max-w-[150px]">{settings.gameName || 'Nombre del Rival'}</span>
                                </div>
                                <ChevronDownIcon className="h-4 w-4 text-slate-500" />
                            </button>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="O escribe nombre personalizado..."
                                    value={settings.gameName}
                                    onChange={(e) => setSettings({ ...settings, gameName: e.target.value })}
                                    className="w-full bg-transparent border-b border-slate-800 text-xs text-slate-500 px-4 py-2 focus:border-cyan-500 outline-none transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Tournament Selection ── */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Competencia / Torneo</label>
                        <button
                            onClick={() => setIsTournamentSelectorOpen(true)}
                            className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white rounded-2xl px-5 py-4 transition-all group-hover:border-cyan-500/50"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl">🏆</span>
                                <span className="font-bold text-sm sm:text-base">{settings.tournamentName || 'Todos'}</span>
                            </div>
                            <ChevronDownIcon className="h-4 w-4 text-slate-500" />
                        </button>
                    </div>

                    {/* ── Mode Selection ── */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 block text-center">Modo de Seguimiento</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setSelectedMode('stats-tally')}
                                className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all gap-2 relative group-mode ${selectedMode === 'stats-tally'
                                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                                    : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400'
                                    }`}
                            >
                                <span className="text-2xl sm:text-3xl">🗒️</span>
                                <span className="font-black text-[10px] sm:text-xs uppercase tracking-wider">Anotador</span>
                                {selectedMode === 'stats-tally' && <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-cyan-500"></span>}
                            </button>

                            <button
                                onClick={() => setSelectedMode('shot-chart')}
                                className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all gap-2 relative group-mode ${selectedMode === 'shot-chart'
                                    ? 'bg-purple-500/10 border-purple-500 text-purple-400'
                                    : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400'
                                    }`}
                            >
                                <span className="text-2xl sm:text-3xl">🎯</span>
                                <span className="font-black text-[10px] sm:text-xs uppercase tracking-wider group-mode-hover:text-purple-400">Tiro a Tiro</span>
                                {selectedMode === 'shot-chart' && <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-purple-500"></span>}
                            </button>
                        </div>
                    </div>

                    {/* ── Player Selection ── */}
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                Jugadores ({selectedPlayers.size})
                            </label>
                            <button
                                onClick={() => setSelectedPlayers(new Set())}
                                className="text-[10px] font-bold text-red-500/70 hover:text-red-400 flex items-center gap-1.5 transition-colors"
                            >
                                <UndoIcon className="h-3 w-3" /> Limpiar
                            </button>
                        </div>
                        <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2 sm:gap-3">
                            {allPlayers.map((num) => (
                                <button
                                    key={num}
                                    onClick={() => togglePlayer(num)}
                                    className={`aspect-square sm:h-12 flex flex-col items-center justify-center rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black transition-all border shadow-sm ${selectedPlayers.has(num)
                                        ? 'bg-cyan-600 border-cyan-400 text-white shadow-cyan-900/50 scale-105'
                                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:border-slate-600'
                                        }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Start Button ── */}
                    <div className="pt-6">
                        <button
                            onClick={handleStart}
                            className="w-full py-4 sm:py-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-sm sm:text-base uppercase tracking-[0.2em] shadow-xl shadow-cyan-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group/start"
                        >
                            {isCorrection ? 'Guardar Cambios' : 'Comenzar Seguimiento'}
                            <span className="group-hover/start:translate-x-1 transition-transform">→</span>
                        </button>
                        <button
                            onClick={onBack}
                            className="w-full py-3 text-slate-500 hover:text-slate-300 font-bold text-xs uppercase tracking-widest transition-colors mt-2"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Modals ── */}
            <TeamSelectorModal
                isOpen={isTeamSelectorOpen}
                onClose={() => setIsTeamSelectorOpen(false)}
                onSelectTeam={handleTeamSelectedFromDropdown}
                currentTeam={settings.myTeam || ''}
            />

            <TeamSelectorModal
                isOpen={isRivalSelectorOpen}
                onClose={() => setIsRivalSelectorOpen(false)}
                onSelectTeam={(name) => {
                    setSettings({ ...settings, gameName: name });
                    setIsRivalSelectorOpen(false);
                }}
                currentTeam={settings.gameName || ''}
            />

            <TournamentSelectorModal
                isOpen={isTournamentSelectorOpen}
                onClose={() => setIsTournamentSelectorOpen(false)}
                onSelectTournament={(id, name) => {
                    setSettings({ ...settings, tournamentId: id, tournamentName: name });
                    setIsTournamentSelectorOpen(false);
                }}
                currentTournamentId={settings.tournamentId}
            />

            <TeamRosterModal
                isOpen={isRosterModalOpen}
                onClose={() => setIsRosterModalOpen(false)}
                onSelectTeam={handleTeamLoadedFromManager}
            />
        </div>
    );
};
