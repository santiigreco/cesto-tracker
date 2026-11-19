import React from 'react';
import { DownloadIcon, ShareIcon } from '@/components/icons';

interface FederationExportBannerProps {
  onExportExcel: () => void;
  onShareClick?: () => void;
  hasShareableData?: boolean;
}

export const FederationExportBanner: React.FC<FederationExportBannerProps> = ({
  onExportExcel,
  onShareClick,
  hasShareableData = true,
}) => {
  return (
    <div className="bg-surface-card border border-border-subtle rounded-2xl p-4 sm:p-5 shadow-card mb-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5 w-full md:w-auto">
        <div className="p-3 bg-sport-goal/15 rounded-xl border border-sport-goal/35 shrink-0">
          <DownloadIcon className="h-6 w-6 text-sport-goal-light" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-extrabold text-ink-primary tracking-tight leading-tight">
            Planilla Oficial para la Federación
          </h3>
          <p className="text-ink-secondary text-xs sm:text-sm font-medium mt-0.5">
            Descargá el Excel reglamentario (FCCF) listo para presentar.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto shrink-0">
        <button
          type="button"
          onClick={onExportExcel}
          className="flex-1 md:flex-none min-h-[44px] flex items-center justify-center gap-2 bg-sport-goal hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm py-2.5 px-5 rounded-xl transition-colors active:scale-[0.98] uppercase tracking-wider touch-manipulation"
        >
          <DownloadIcon className="h-4 w-4 shrink-0" />
          <span className="whitespace-nowrap">Generar Excel</span>
        </button>

        {onShareClick && hasShareableData && (
          <button
            type="button"
            onClick={onShareClick}
            className="flex-1 md:flex-none min-h-[44px] flex items-center justify-center gap-2 bg-surface-elevated hover:bg-surface-hover text-ink-primary font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl transition-colors border border-border-strong hover:border-brand/50 active:scale-[0.98] touch-manipulation"
            aria-label="Compartir Resumen"
            title="Compartir resumen para WhatsApp o Instagram"
          >
            <ShareIcon className="h-4 w-4 text-brand shrink-0" />
            <span className="whitespace-nowrap">Compartir</span>
          </button>
        )}
      </div>
    </div>
  );
};
