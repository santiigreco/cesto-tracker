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
    <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6 shadow-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="flex items-center gap-5 relative z-10 w-full md:w-auto">
        <div className="p-4 bg-emerald-500/20 rounded-2xl shadow-inner border border-emerald-500/30 flex-shrink-0">
          <DownloadIcon className="h-8 w-8 text-emerald-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight leading-tight">
            Reporte para la Federación
          </h3>
          <p className="text-emerald-400/80 text-xs sm:text-sm font-bold mt-1">
            Descargá el Excel oficial (FCCF) listo para enviar.
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto relative z-10">
        <button
          onClick={onExportExcel}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-6 sm:px-8 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-900/50 uppercase tracking-widest border border-emerald-400/30"
        >
          <DownloadIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="whitespace-nowrap">Generar Excel</span>
        </button>
        {onShareClick && hasShareableData && (
          <button
            onClick={onShareClick}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-4 sm:px-6 rounded-xl transition-all shadow-md border border-slate-600 hover:border-cyan-500/50"
            aria-label="Compartir Resumen"
            title="Compartir resumen para WhatsApp"
          >
            <ShareIcon className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
            <span className="hidden sm:inline whitespace-nowrap">Compartir</span>
          </button>
        )}
      </div>
    </div>
  );
};
