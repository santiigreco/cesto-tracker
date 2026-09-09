import React, { useState, useEffect, useMemo } from 'react';
import { XIcon, UsersIcon } from '../icons';
import { TEAMS_CONFIG, FederationId } from '../../constants';
import TeamLogo from '@/components/ui/TeamLogo';
import { useTeamManager } from '../../hooks/useTeamManager';
import { RosterPlayer } from '../../types';
import Loader from '@/components/ui/Loader';
import { normalizeTeamName } from '../../utils/teamUtils';

interface TeamSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTeam: (teamName: string, roster?: RosterPlayer[]) => void;
    currentTeam: string;
    title?: string;
    isRival?: boolean;
}

type TabType = 'all' | 'femece' | 'corrientes' | 'saved';

const TeamSelectorModal: React.FC<TeamSelectorModalProps> = ({
    isOpen,
    onClose,
    onSelectTeam,
    currentTeam,
    title,
    isRival = false
}) => {
    const { teams: savedTeams, loading, fetchTeams } = useTeamManager();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState<TabType>('all');
    const [customTeam, setCustomTeam] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchTeams();
            setSearchQuery('');
            setCustomTeam('');
        }
    }, [isOpen]);

    const handleSelect = (name: string, roster?: RosterPlayer[]) => {
        onSelectTeam(name, roster);
    };

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (customTeam.trim()) {
            handleSelect(customTeam.trim());
        }
    };

    // Filter teams based on search query and selected tab
    const filteredTeams = useMemo(() => {
        return TEAMS_CONFIG.filter(team => {
            const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase());
            if (!matchesSearch) return false;

            if (selectedTab === 'all') return true;
            if (selectedTab === 'femece') return team.federation === 'femece';
            if (selectedTab === 'corrientes') return team.federation === 'corrientes';
            return true;
        });
    }, [searchQuery, selectedTab]);

    const filteredSavedTeams = useMemo(() => {
        if (isRival) return []; // Don't show own rosters when selecting a rival
        return savedTeams.filter(team =>
            team.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [savedTeams, searchQuery, isRival]);

    if (!isOpen) return null;

    const modalTitle = title || (isRival ? 'Selecciona el Rival' : 'Selecciona tu Equipo');

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
                
                {/* ── Modal Header ── */}
                <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
                    <div className="flex items-center gap-2.5">
                        <span className="text-xl">🏐</span>
                        <div>
                            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                                {modalTitle}
                            </h2>
                            <p className="text-xs text-slate-400 font-medium">
                                Elige de la lista o escribe un club personalizado
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700/50"
                        aria-label="Cerrar"
                    >
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* ── Search Bar ── */}
                <div className="p-4 border-b border-slate-800/80 bg-slate-900/50">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar club por nombre..."
                            className="w-full bg-slate-800/90 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-500"
                        />
                        <svg
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold bg-slate-700 px-1.5 py-0.5 rounded"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* ── Federation Filter Tabs ── */}
                    <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 custom-scrollbar">
                        <button
                            onClick={() => setSelectedTab('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                selectedTab === 'all'
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                    : 'bg-slate-800/60 text-slate-400 hover:text-white border border-transparent'
                            }`}
                        >
                            Todos ({TEAMS_CONFIG.length})
                        </button>
                        <button
                            onClick={() => setSelectedTab('femece')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                selectedTab === 'femece'
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                    : 'bg-slate-800/60 text-slate-400 hover:text-white border border-transparent'
                            }`}
                        >
                            🏙️ FeMeCe (Metro)
                        </button>
                        <button
                            onClick={() => setSelectedTab('corrientes')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                selectedTab === 'corrientes'
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                    : 'bg-slate-800/60 text-slate-400 hover:text-white border border-transparent'
                            }`}
                        >
                            🐊 Corrientes (FeCoCe)
                        </button>
                        {!isRival && savedTeams.length > 0 && (
                            <button
                                onClick={() => setSelectedTab('saved')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                                    selectedTab === 'saved'
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-slate-800/60 text-slate-400 hover:text-white border border-transparent'
                                }`}
                            >
                                <UsersIcon className="h-3 w-3" /> Mis Planteles ({savedTeams.length})
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Content Body (Scrollable) ── */}
                <div className="p-5 overflow-y-auto custom-scrollbar flex-grow space-y-6">

                    {/* 1. SAVED ROSTERS SECTION (When applicable) */}
                    {!isRival && (selectedTab === 'all' || selectedTab === 'saved') && filteredSavedTeams.length > 0 && (
                        <div className="space-y-2.5">
                            <h3 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                <UsersIcon className="h-3.5 w-3.5" /> Mis Planteles Guardados
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {filteredSavedTeams.map(team => (
                                    <button
                                        key={team.id}
                                        onClick={() => handleSelect(team.name, team.players)}
                                        className={`p-3 rounded-2xl transition-all border text-left flex items-center gap-3 relative overflow-hidden ${
                                            normalizeTeamName(currentTeam) === normalizeTeamName(team.name)
                                                ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-400'
                                                : 'bg-slate-800/70 border-slate-700/80 hover:border-emerald-500/50 hover:bg-slate-800'
                                        }`}
                                    >
                                        <TeamLogo teamName={team.name} className="h-9 w-9 flex-shrink-0" />
                                        <div className="min-w-0 flex-grow">
                                            <span className="font-bold text-sm text-white block truncate">{team.name}</span>
                                            <span className="text-[11px] text-slate-400 block font-medium">
                                                {team.players.length} Jugadores {team.category ? `· ${team.category}` : ''}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 2. LEAGUE TEAMS SECTION */}
                    {selectedTab !== 'saved' && (
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                    {selectedTab === 'corrientes' ? 'Equipos Federación Correntina' :
                                     selectedTab === 'femece' ? 'Equipos Federación Metropolitana' : 'Equipos Federados'}
                                </h3>
                                <span className="text-[10px] font-bold text-slate-500">
                                    {filteredTeams.length} clubes
                                </span>
                            </div>

                            {filteredTeams.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 text-sm">
                                    No se encontraron clubes para "{searchQuery}". Puedes ingresarlo abajo.
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    {filteredTeams.map(team => {
                                        const isSelected = normalizeTeamName(currentTeam) === normalizeTeamName(team.name);
                                        return (
                                            <button
                                                key={team.name}
                                                onClick={() => handleSelect(team.name)}
                                                className={`p-3 rounded-2xl transition-all duration-200 shadow-sm flex flex-col items-center justify-center text-center gap-2 h-24 border ${
                                                    isSelected
                                                        ? 'bg-cyan-500/20 border-cyan-400 text-white ring-1 ring-cyan-400 shadow-cyan-500/20'
                                                        : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-750 hover:border-slate-600 hover:text-white'
                                                }`}
                                            >
                                                <TeamLogo teamName={team.name} className="h-8 w-8" />
                                                <span className="font-bold text-xs leading-tight line-clamp-2">
                                                    {team.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 3. CUSTOM TEAM INPUT SECTION (Bug fix: always available) */}
                    <div className="pt-2 border-t border-slate-800/80">
                        <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
                            <h4 className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                                <span>✏️</span> ¿No figura en la lista? Ingresar club personalizado
                            </h4>
                            <p className="text-[11px] text-slate-400 mb-3">
                                Escribe el nombre para torneos interprovinciales o amistosos:
                            </p>
                            <form onSubmit={handleCustomSubmit} className="flex gap-2">
                                <input
                                    type="text"
                                    value={customTeam}
                                    onChange={(e) => setCustomTeam(e.target.value)}
                                    placeholder="Ej: Juventus, Taraguy, Cárdenas..."
                                    className="flex-grow bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm font-medium focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!customTeam.trim()}
                                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all"
                                >
                                    Usar
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TeamSelectorModal;
