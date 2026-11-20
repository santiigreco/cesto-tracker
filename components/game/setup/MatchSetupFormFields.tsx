import React from 'react';
import { Settings } from '../../../types';
import { CATEGORIES_CONFIG } from '../../../constants';
import {
    ChevronDownIcon,
    JerseySvgIcon,
    ShieldIcon,
    TrophyIcon,
} from '../../icons';
import TeamLogo from '@/components/ui/TeamLogo';

interface MatchSetupFormFieldsProps {
    settings: Settings;
    isAdvancedOpen: boolean;
    onOpenTeamSelector: () => void;
    onOpenRivalSelector: () => void;
    onOpenTournamentSelector: () => void;
    onCategoryChange: (categoryName: string) => void;
    onDateChange: (gameDate: string) => void;
}

const MatchSetupFormFields: React.FC<MatchSetupFormFieldsProps> = ({
    settings,
    isAdvancedOpen,
    onOpenTeamSelector,
    onOpenRivalSelector,
    onOpenTournamentSelector,
    onCategoryChange,
    onDateChange,
}) => (
    <>
        {/* ── Teams Selection ── */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!isAdvancedOpen ? 'pt-6' : ''}`}>
            <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider px-0.5 block">
                    Tu Equipo
                </label>
                <button
                    type="button"
                    onClick={onOpenTeamSelector}
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
                <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider px-0.5 block">
                    Rival
                </label>
                <button
                    type="button"
                    onClick={onOpenRivalSelector}
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
            <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider px-0.5 block">
                Competencia / Torneo
            </label>
            <button
                type="button"
                onClick={onOpenTournamentSelector}
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
                <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider px-0.5 block">
                    Categoría
                </label>
                <div className="relative">
                    <select
                        aria-label="Categoría del partido"
                        value={settings.categoryName || ''}
                        onChange={(e) => onCategoryChange(e.target.value)}
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
                <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider px-0.5 block">
                    Fecha
                </label>
                <input
                    type="date"
                    aria-label="Fecha del partido"
                    value={settings.gameDate || ''}
                    onChange={(e) => onDateChange(e.target.value)}
                    className="w-full min-h-[52px] bg-surface-elevated hover:bg-surface-hover border border-border-strong focus:border-brand text-ink-primary rounded-xl px-4 py-3 transition-colors font-bold text-base sm:text-sm tabular-nums [color-scheme:dark]"
                />
            </div>
        </div>
    </>
);

export default MatchSetupFormFields;
