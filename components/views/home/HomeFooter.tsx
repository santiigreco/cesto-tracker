import React from 'react';
import { useNavigate } from 'react-router-dom';
import { InstagramIcon, WhatsappIcon } from '@/components/icons';

const LINK_CLASS =
  'flex items-center gap-2 min-h-[44px] px-2.5 text-ink-muted hover:text-ink-primary transition-colors text-sm font-semibold';

/** Single-line footer: secondary links only. Admin recruitment and the project story live in /faq. */
export const HomeFooter: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="w-full mt-10 py-6 border-t border-border-subtle text-center">
      <div className="flex flex-wrap justify-center items-center gap-x-4">
        <button type="button" onClick={() => navigate('/faq')} className={LINK_CLASS}>
          Preguntas frecuentes
        </button>
        <a
          href="https://api.whatsapp.com/send/?phone=5491163303194&text=Hola!%20Tengo%20una%20idea%20o%20comentario%20sobre%20la%20app..."
          target="_blank"
          rel="noopener noreferrer"
          className={LINK_CLASS}
        >
          <WhatsappIcon className="h-4 w-4" /> Feedback
        </a>
        <a
          href="https://instagram.com/gresolutions"
          target="_blank"
          rel="noopener noreferrer"
          className={LINK_CLASS}
        >
          <InstagramIcon className="h-4 w-4" /> Instagram
        </a>
      </div>
      <p className="text-ink-muted text-xs mt-2">
        Cesto Tracker © 2026 · Proyecto independiente
      </p>
    </footer>
  );
};
