import React, { useEffect, useMemo, useState } from 'react';
import { CATEGORIES_CONFIG } from '../../constants';
import type { MatchMetadataIntent } from '../../context/UIContext';
import { GameState, RosterPlayer, Settings } from '../../types';
import { getActivePlayersFromMatch, saveLastTeamSetup } from '../../utils/matchMetadata';
import { ChevronDownIcon, JerseySvgIcon, ShieldIcon, TrophyIcon } from '../icons';
import ModalShell from '../ui/ModalShell';
import TeamLogo from '../ui/TeamLogo';
import TeamSelectorModal from './TeamSelectorModal';
import TournamentSelectorModal from './TournamentSelectorModal';

interface MatchMetadataModalProps {
  isOpen: boolean;
  intent: MatchMetadataIntent;
  gameState: GameState;
  onClose: () => void;
  onConfirm: (
    updatedSettings: Settings,
    updatedPlayerNames: Record<string, string>
  ) => void;
}

const INTENT_COPY: Record<
  MatchMetadataIntent,
  { title: string; subtitle: string; cta: string }
> = {
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
  const [categoryName, setCategoryName] = useState(
    gameState.settings.categoryName || 'Primera A'
  );
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

  const hasSubModalOpen =
    isMyTeamSelectorOpen || isRivalSelectorOpen || isTournamentSelectorOpen;

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

  const modalFooter = (
    <div className="space-y-2">
      {!isValid && (
        <p className="text-xs text-sport-warn-light text-center font-medium">
          Seleccioná tu equipo y el rival para continuar
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 min-h-[48px] rounded-xl bg-surface-elevated hover:bg-surface-hover text-ink-secondary font-bold text-xs sm:text-sm border border-border-strong transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          form="match-metadata-form"
          disabled={!isValid}
          className="flex-1 min-h-[48px] rounded-xl bg-brand hover:bg-brand-hover disabled:bg-surface-elevated disabled:text-ink-muted disabled:cursor-not-allowed text-ink-inverse font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-colors"
        >
          {copy.cta}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <ModalShell
        isOpen={isOpen}
        onClose={onClose}
        title={copy.title}
        subtitle={copy.subtitle}
        titleId="match-metadata-modal-title"
        maxWidth="lg"
        zIndexClass="z-[80]"
        disableEscape={hasSubModalOpen}
        footer={modalFooter}
      >
        <form id="match-metadata-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Required: Teams */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-secondary">
                Tu Equipo <span className="text-sport-miss-light">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsMyTeamSelectorOpen(true)}
                className="w-full min-h-[52px] flex items-center justify-between gap-2 bg-surface-elevated hover:bg-surface-hover border border-border-strong hover:border-brand/50 rounded-xl px-3.5 py-2.5 text-left transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {myTeam ? (
                    <TeamLogo teamName={myTeam} className="h-7 w-7 shrink-0" />
                  ) : (
                    <div className="p-1.5 bg-brand/15 rounded-lg text-brand shrink-0">
                      <JerseySvgIcon className="h-4 w-4" />
                    </div>
                  )}
                  <span
                    className={`text-sm font-bold truncate ${
                      myTeam ? 'text-ink-primary' : 'text-ink-muted'
                    }`}
                  >
                    {myTeam || 'Seleccionar equipo'}
                  </span>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-ink-muted shrink-0" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-secondary">
                Rival <span className="text-sport-miss-light">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsRivalSelectorOpen(true)}
                className="w-full min-h-[52px] flex items-center justify-between gap-2 bg-surface-elevated hover:bg-surface-hover border border-border-strong hover:border-brand/50 rounded-xl px-3.5 py-2.5 text-left transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {rival ? (
                    <TeamLogo teamName={rival} className="h-7 w-7 shrink-0" />
                  ) : (
                    <div className="p-1.5 bg-surface-card border border-border-subtle rounded-lg text-ink-muted shrink-0">
                      <ShieldIcon className="h-4 w-4" />
                    </div>
                  )}
                  <span
                    className={`text-sm font-bold truncate ${
                      rival ? 'text-ink-primary' : 'text-ink-muted'
                    }`}
                  >
                    {rival || 'Nombre del rival'}
                  </span>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-ink-muted shrink-0" />
              </button>
            </div>
          </div>

          {/* Optional: Tournament & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                Torneo (opcional)
              </label>
              <button
                type="button"
                onClick={() => setIsTournamentSelectorOpen(true)}
                className="w-full min-h-[48px] flex items-center justify-between gap-2 bg-surface-elevated hover:bg-surface-hover border border-border-strong rounded-xl px-3.5 py-2 text-left transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <TrophyIcon className="h-4 w-4 text-sport-warn-light shrink-0" />
                  <span className="text-sm font-semibold text-ink-primary truncate">
                    {tournamentName || 'Apertura 2026'}
                  </span>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-ink-muted shrink-0" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="metadata-category"
                className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted"
              >
                Categoría (opcional)
              </label>
              <select
                id="metadata-category"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full min-h-[48px] bg-surface-elevated border border-border-strong rounded-xl px-3.5 py-2 text-base sm:text-sm font-semibold text-ink-primary focus:border-brand"
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
            <div className="space-y-2.5 pt-3 border-t border-border-subtle">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-secondary">
                  Nombres (opcional · jugadoras activas)
                </h3>
                <span className="text-xs font-bold text-ink-muted tabular-nums shrink-0">
                  {activePlayers.length}
                </span>
              </div>

              <div className="space-y-2">
                {activePlayers.map((num) => (
                  <div
                    key={num}
                    className="flex items-center gap-2.5 bg-surface-elevated/70 p-2 rounded-xl border border-border-subtle"
                  >
                    <div className="w-9 h-9 bg-brand/15 border border-brand/30 rounded-lg flex items-center justify-center font-extrabold text-brand text-xs tabular-nums shrink-0">
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
                      className="flex-1 min-w-0 bg-surface-canvas border border-border-strong rounded-xl px-3 py-2 text-base sm:text-sm font-medium text-ink-primary placeholder-ink-muted focus:border-brand"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      </ModalShell>

      {isMyTeamSelectorOpen && (
        <TeamSelectorModal
          isOpen={isMyTeamSelectorOpen}
          onClose={() => setIsMyTeamSelectorOpen(false)}
          onSelectTeam={handleMyTeamSelected}
          currentTeam={myTeam}
          title="Seleccioná tu Equipo"
          isRival={false}
        />
      )}

      {isRivalSelectorOpen && (
        <TeamSelectorModal
          isOpen={isRivalSelectorOpen}
          onClose={() => setIsRivalSelectorOpen(false)}
          onSelectTeam={handleRivalSelected}
          currentTeam={rival}
          title="Seleccioná el Rival"
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
    </>
  );
};

export default MatchMetadataModal;
