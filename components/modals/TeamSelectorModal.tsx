import React, { useState, useEffect, useMemo } from 'react';
import {
  BrandLogoMark,
  PencilIcon,
  SearchIcon,
  UsersIcon,
  XIcon,
} from '../icons';
import { TEAMS_CONFIG } from '../../constants';
import TeamLogo from '@/components/ui/TeamLogo';
import ModalShell from '@/components/ui/ModalShell';
import { useTeamManager } from '../../hooks/useTeamManager';
import { RosterPlayer } from '../../types';
import { normalizeTeamName } from '../../utils/teamUtils';

interface TeamSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTeam: (teamName: string, roster?: RosterPlayer[]) => void;
  currentTeam: string;
  title?: string;
  isRival?: boolean;
}

type TabType = 'all' | 'capital' | 'corrientes' | 'saved';

const TeamSelectorModal: React.FC<TeamSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectTeam,
  currentTeam,
  title,
  isRival = false,
}) => {
  const { teams: savedTeams, fetchTeams } = useTeamManager();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<TabType>('all');
  const [customTeam, setCustomTeam] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (!isRival) {
        fetchTeams();
      }
      setSearchQuery('');
      setCustomTeam('');
    }
  }, [isOpen, isRival, fetchTeams]);

  const handleSelect = (name: string, roster?: RosterPlayer[]) => {
    onSelectTeam(name, roster);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTeam.trim()) {
      handleSelect(customTeam.trim());
    }
  };

  const filteredTeams = useMemo(() => {
    return TEAMS_CONFIG.filter((team) => {
      const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (selectedTab === 'all') return true;
      if (selectedTab === 'capital') return team.federation === 'capital';
      if (selectedTab === 'corrientes') return team.federation === 'corrientes';
      return true;
    });
  }, [searchQuery, selectedTab]);

  const filteredSavedTeams = useMemo(() => {
    if (isRival) return [];
    return savedTeams.filter((team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [savedTeams, searchQuery, isRival]);

  const modalTitle = title || (isRival ? 'Seleccioná el Rival' : 'Seleccioná tu Equipo');

  const getTabClass = (tab: TabType) =>
    `px-3 min-h-[40px] rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 border ${
      selectedTab === tab
        ? 'bg-brand/15 text-brand border-brand/45'
        : 'bg-surface-elevated text-ink-secondary hover:text-ink-primary border-border-subtle'
    }`;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      subtitle="Elegí de la lista o escribí un club personalizado"
      titleId="team-selector-modal-title"
      headerLeading={<BrandLogoMark className="h-8 w-8" />}
      maxWidth="xl"
      zIndexClass="z-[90]"
      bodyClassName="flex flex-col min-h-0 overflow-hidden p-0"
    >
      {/* Search & Federation Filter Tabs */}
      <div className="p-4 border-b border-border-subtle bg-surface-card flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar club por nombre..."
            className="w-full min-h-[44px] bg-surface-elevated border border-border-strong text-ink-primary rounded-xl pl-10 pr-10 py-2.5 text-base sm:text-sm font-medium focus:border-brand transition-colors placeholder:text-ink-muted"
          />
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center text-ink-muted hover:text-ink-primary rounded-lg hover:bg-surface-hover"
              aria-label="Limpiar búsqueda"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-0.5 custom-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedTab('all')}
            className={getTabClass('all')}
          >
            <span className="tabular-nums">Todos ({TEAMS_CONFIG.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('capital')}
            className={getTabClass('capital')}
          >
            Capital
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('corrientes')}
            className={getTabClass('corrientes')}
          >
            Corrientes
          </button>
          {!isRival && savedTeams.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedTab('saved')}
              className={getTabClass('saved')}
            >
              <UsersIcon className="h-3.5 w-3.5" />
              <span className="tabular-nums">Mis Planteles ({savedTeams.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex-grow space-y-6 bg-surface-canvas">
        {/* Saved Rosters */}
        {!isRival &&
          (selectedTab === 'all' || selectedTab === 'saved') &&
          filteredSavedTeams.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-bold text-sport-goal-light uppercase tracking-wider flex items-center gap-1.5">
                <UsersIcon className="h-3.5 w-3.5" />
                <span>Mis Planteles Guardados</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredSavedTeams.map((team) => {
                  const isSelected =
                    normalizeTeamName(currentTeam) === normalizeTeamName(team.name);
                  return (
                    <button
                      type="button"
                      key={team.id}
                      onClick={() => handleSelect(team.name, team.players)}
                      className={`p-3 rounded-xl transition-colors border text-left flex items-center gap-3 ${
                        isSelected
                          ? 'bg-sport-goal/15 border-sport-goal ring-1 ring-sport-goal/60'
                          : 'bg-surface-card border-border-subtle hover:border-sport-goal/50 hover:bg-surface-elevated'
                      }`}
                    >
                      <TeamLogo teamName={team.name} className="h-9 w-9 flex-shrink-0" />
                      <div className="min-w-0 flex-grow">
                        <span className="font-bold text-sm text-ink-primary block truncate">
                          {team.name}
                        </span>
                        <span className="text-xs text-ink-muted block font-medium tabular-nums">
                          {team.players.length} jugadoras
                          {team.category ? ` · ${team.category}` : ''}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        {/* League Teams */}
        {selectedTab !== 'saved' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                {selectedTab === 'corrientes'
                  ? 'Equipos de Corrientes'
                  : selectedTab === 'capital'
                    ? 'Equipos de Capital'
                    : 'Equipos Federados'}
              </h3>
              <span className="text-xs font-semibold text-ink-muted tabular-nums">
                {filteredTeams.length} clubes
              </span>
            </div>

            {filteredTeams.length === 0 ? (
              <div className="text-center py-8 text-ink-muted text-sm">
                No se encontraron clubes para "{searchQuery}". Podés ingresarlo abajo.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {filteredTeams.map((team) => {
                  const isSelected =
                    normalizeTeamName(currentTeam) === normalizeTeamName(team.name);
                  return (
                    <button
                      type="button"
                      key={team.name}
                      onClick={() => handleSelect(team.name)}
                      className={`p-3 rounded-xl transition-colors flex flex-col items-center justify-center text-center gap-2 min-h-[96px] border ${
                        isSelected
                          ? 'bg-brand/15 border-brand text-ink-primary ring-1 ring-brand/60'
                          : 'bg-surface-card text-ink-secondary border-border-subtle hover:bg-surface-elevated hover:border-border-strong hover:text-ink-primary'
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

        {/* Custom Team Input */}
        <div className="pt-3 border-t border-border-subtle">
          <div className="bg-surface-card border border-border-subtle rounded-xl p-4">
            <h4 className="text-xs font-bold text-ink-primary mb-1 flex items-center gap-1.5">
              <PencilIcon className="h-3.5 w-3.5 text-brand shrink-0" />
              <span>¿No figura en la lista? Ingresá un club personalizado</span>
            </h4>
            <p className="text-xs text-ink-muted mb-3">
              Escribí el nombre para torneos interprovinciales o amistosos:
            </p>
            <form onSubmit={handleCustomSubmit} className="flex gap-2">
              <input
                type="text"
                maxLength={50}
                value={customTeam}
                onChange={(e) => setCustomTeam(e.target.value)}
                placeholder="Ej: Juventus, Taraguy, Cárdenas..."
                className="flex-grow min-w-0 min-h-[44px] bg-surface-elevated border border-border-strong text-ink-primary rounded-xl px-3.5 py-2 text-base sm:text-sm font-medium focus:border-brand transition-colors placeholder:text-ink-muted"
              />
              <button
                type="submit"
                disabled={!customTeam.trim()}
                className="shrink-0 min-h-[44px] px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover disabled:opacity-40 disabled:hover:bg-brand text-ink-inverse font-extrabold text-xs uppercase tracking-wider transition-colors"
              >
                Usar
              </button>
            </form>
          </div>
        </div>
      </div>
    </ModalShell>
  );
};

export default TeamSelectorModal;
