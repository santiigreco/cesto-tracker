import React from 'react';
import { useNavigate } from 'react-router-dom';
import FaqView from '@/components/views/FaqView';
import { ArrowLeftIcon, BrandLogoMark } from '@/components/icons';

export default function FaqRoute() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-canvas text-ink-primary font-sans">
      {/* Top nav bar */}
      <div className="sticky top-0 z-30 bg-surface-canvas/95 border-b border-border-subtle px-4 sm:px-6 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="min-h-[44px] px-2 -ml-2 flex items-center gap-1.5 text-ink-secondary hover:text-ink-primary transition-colors text-sm font-bold rounded-xl"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Volver</span>
        </button>
        <span className="text-border-strong">|</span>
        <div className="flex items-center gap-2">
          <BrandLogoMark className="h-6 w-6" />
          <span className="text-ink-primary font-extrabold text-sm tracking-tight">
            Cesto Tracker
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
        <FaqView />
      </div>

      <footer className="py-10 text-center text-ink-muted text-xs uppercase tracking-[0.15em] font-bold">
        Cesto Tracker © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
