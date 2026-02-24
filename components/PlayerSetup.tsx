
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

const PlayerSetup: React.FC<PlayerSetupProps> = ({
    onSetupComplete,
    onBack,
    initialSelectedPlayers = [],
    initialSettings = defaultSettings,
    initialGameMode = null,
    initialPlayerNames = {}
}) => {
    // Pre-select players: use last saved team for new games, or existing selection for corrections
    const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(() => {
        if (initialSelectedPlayers.length > 0) {
            return new Set(initialSelectedPlayers);
        }
        // Try to restore last team from localStorage
        try {
            const saved = localStorage.getItem(LAST_TEAM_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.players && Array.isArray(parsed.players) && parsed.players.length > 0) {
                    return new Set(parsed.players);
                }
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

    // Force default tournament if not set (fixing the issue where previous state might have empty tournament)
    useEffect(() => {
        if (!settings.tournamentName) {
            setSettings(prev => ({
                ...prev,
                tournamentName: defaultSettings.tournamentName
            }));
        }
    }, []); // Run once on mount

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
                <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-emerald-500/10 blur-[120px] rounded-full animate-float"></div>
                <div className="absolute top-[30%] right-[10%] w-[20%] h-[20%] bg-purple-500/5 blur-[100px] rounded-full"></div>
            </div>

            <div className="w-full max-w-2xl bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl text-center relative z-10">
                {!isCorrection && (
                    <button
                        onClick={onBack}
                        className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-black uppercase tracking-widest transition-all bg-slate-950/50 px-3 py-1.5 rounded-full border border-slate-800 hover:border-slate-600 shadow-lg"
                    >
                        <UndoIcon className="h-3 w-3" /> Volver
                    </button>
                )}

                <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter mb-4 mt-8 sm:mt-4 leading-tight">
                    {isCorrection ? 'Editar' : 'Nuevo'} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 bg-[length:200%_auto] animate-text-shimmer">
                        {isCorrection ? 'Equipo' : 'Partido'}
                    </span>
                </h1>

                {/* Last team restored hint */}
                {!isCorrection && settings.myTeam && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4 text-xs font-bold text-emerald-400">
                        <span>🔄</span> Equipo anterior restaurado: <span className="text-white">{settings.myTeam}</span>
                    </div>
                )}

                <div className="mb-6 space-y-4 max-w-sm mx-auto">
                    {/* Tournament Selector */}
                    <div className="text-left">
                        <label className="block text-xs font-semibold text-slate-400 mb-1 ml-1 uppercase tracking-wide">Torneo / Temporada</label>
                        <button
                            onClick={() => setIsTournamentSelectorOpen(true)}
                            className="w-full bg-slate-900/50 border border-slate-600 rounded-lg block p-3 text-left flex justify-between items-center transition-all hover:bg-slate-800 hover:border-cyan-500 group"
                        >
                            <span className={`text-base ${settings.tournamentName ? 'text-cyan-300 font-bold' : 'text-slate-500'}`}>
                                {settings.tournamentName || 'Seleccionar Torneo...'}
                            </span>
                            <ChevronDownIcon className="h-5 w-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                        </button>
                    </div>

                    {/* Team Selector Trigger & Roster Manager */}
                    <div className="text-left">
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-semibold text-slate-400 ml-1 uppercase tracking-wide">Tu Equipo</label>
                            {user && (
                                <button
                                    onClick={() => setIsRosterModalOpen(true)}
                                    className="text-xs flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold bg-cyan-900/30 px-2 py-0.5 rounded border border-cyan-500/30 hover:bg-cyan-900/50 transition-colors"
                                >
                                    <UsersIcon className="h-3 w-3" /> Editar Mis Planteles
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => setIsTeamSelectorOpen(true)}
                            className="w-full bg-slate-900/50 border border-slate-600 rounded-lg block p-3 text-left flex justify-between items-center transition-all hover:bg-slate-800 hover:border-cyan-500 group"
                        >
                            <span className={`text-lg ${settings.myTeam ? 'text-white font-bold' : 'text-slate-500'}`}>
                                {settings.myTeam || 'Seleccionar Equipo...'}
                            </span>
                            <ChevronDownIcon className="h-5 w-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                        </button>
                    </div>

                    {/* Rival / Game Name Input - Now a Button Selector */}
                    <div className="text-left">
                        <label className="block text-xs font-semibold text-slate-400 mb-1 ml-1 uppercase tracking-wide">Rival</label>
                        <button
                            onClick={() => setIsRivalSelectorOpen(true)}
                            className="w-full bg-slate-900/50 border border-slate-600 rounded-lg block p-3 text-left flex justify-between items-center transition-all hover:bg-slate-800 hover:border-cyan-500 group"
                        >
                            <span className={`text-lg ${settings.gameName ? 'text-white font-bold' : 'text-slate-500'}`}>
                                {settings.gameName || 'Seleccionar Rival...'}
                            </span>
                            <ChevronDownIcon className="h-5 w-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                        </button>
                    </div>
                </div>

                {/* ── Fixture Suggestion Banner ── */}
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
                        setSettings(prev => ({ ...prev, fixture_id: null }));
                        setFixtureLinked(false);
                    }}
                    onDismiss={() => setFixtureDismissed(true)}
                />

                {/* Player Selection - Express Mode */}
                <div className="mb-8">
                    <p className="text-sm text-slate-400 mb-4">Marca los jugadores que participan ({selectedPlayers.size} seleccionados)</p>

                    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center items-center bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 shadow-inner">
                        {allPlayers.map(num => (
                            <JerseyIcon
                                key={num}
                                number={num}
                                name={localPlayerNames[num]}
                                isSelected={selectedPlayers.has(num)}
                                onClick={togglePlayer}
                            />
                        ))}
                    </div>
                </div>

                {/* Big Start Button */}
                <button
                    onClick={handleStart}
                    className="w-full max-w-sm bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 ease-in-out transform hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.3)] text-xl mb-6"
                >
                    {isCorrection ? 'Guardar Cambios' : 'INICIAR PARTIDO'}
                </button>

                {/* Advanced Options Collapsible */}
                <div className="border-t border-slate-700 pt-4">
                    <button
                        onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                        className="flex items-center justify-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors mx-auto"
                        aria-expanded={isAdvancedOpen}
                    >
                        <span>Opciones Avanzadas</span>
                        <ChevronDownIcon className={`h-4 w-4 transition-transform duration-300 ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isAdvancedOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                        <div className="bg-slate-700/30 p-4 rounded-xl text-left space-y-4 border border-slate-600/30">

                            {/* Game Mode — Premium Lock for non-admins */}
                            {isAdmin ? (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-white font-semibold">Modo Mapa de Tiros</h3>
                                        <p className="text-xs text-slate-400">Registrar posición exacta en cancha (Avanzado)</p>
                                    </div>
                                    <ToggleSwitch
                                        isEnabled={selectedMode === 'shot-chart'}
                                        onToggle={() => setSelectedMode(prev => prev === 'shot-chart' ? 'stats-tally' : 'shot-chart')}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-700/50 opacity-75">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-slate-300 font-semibold">Modo Mapa de Tiros</h3>
                                            <span className="text-[9px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase tracking-widest">Próximamente</span>
                                        </div>
                                        <p className="text-xs text-slate-500">Registrar posición exacta en cancha</p>
                                    </div>
                                    <span className="text-2xl">🔒</span>
                                </div>
                            )}

                            <div className="h-px bg-slate-600/50"></div>

                            {/* Hand Hot/Cold Settings */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-300">Alerta Mano Caliente 🔥</span>
                                    <ToggleSwitch
                                        isEnabled={settings.isManoCalienteEnabled}
                                        onToggle={() => setSettings({ ...settings, isManoCalienteEnabled: !settings.isManoCalienteEnabled })}
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-300">Alerta Mano Fría ❄️</span>
                                    <ToggleSwitch
                                        isEnabled={settings.isManoFriaEnabled}
                                        onToggle={() => setSettings({ ...settings, isManoFriaEnabled: !settings.isManoFriaEnabled })}
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            <footer className="w-full text-center text-slate-500 text-xs mt-8 pb-4">
                Santiago Greco - Gresolutions © 2026
            </footer>

            {isTeamSelectorOpen && (
                <TeamSelectorModal
                    isOpen={isTeamSelectorOpen}
                    onClose={() => setIsTeamSelectorOpen(false)}
                    onSelectTeam={handleTeamSelectedFromDropdown}
                    currentTeam={settings.myTeam || ''}
                />
            )}

            {isRivalSelectorOpen && (
                <TeamSelectorModal
                    isOpen={isRivalSelectorOpen}
                    onClose={() => setIsRivalSelectorOpen(false)}
                    onSelectTeam={(team) => {
                        setSettings(prev => ({ ...prev, gameName: team }));
                        setIsRivalSelectorOpen(false);
                    }}
                    currentTeam={settings.gameName || ''}
                />
            )}

            {isTournamentSelectorOpen && (
                <TournamentSelectorModal
                    isOpen={isTournamentSelectorOpen}
                    onClose={() => setIsTournamentSelectorOpen(false)}
                    onSelectTournament={(id, name) => setSettings(prev => ({ ...prev, tournamentId: id, tournamentName: name }))}
                    currentTournamentId={settings.tournamentId}
                />
            )}

            {isRosterModalOpen && (
                <TeamRosterModal
                    isOpen={isRosterModalOpen}
                    onClose={() => setIsRosterModalOpen(false)}
                    onLoadTeam={handleTeamLoadedFromManager}
                    currentSelection={{
                        name: settings.myTeam || '',
                        players: Array.from(selectedPlayers)
                    }}
                />
            )}
        </div>
    );
};

export default PlayerSetup;
