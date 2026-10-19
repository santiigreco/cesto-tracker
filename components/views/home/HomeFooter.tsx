import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WhatsappIcon } from '@/components/icons';

const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className || 'h-6 w-6'}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.07 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.359 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.359-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.359-2.618-6.78-6.98-6.98C15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" />
  </svg>
);

const LINK_CLASS =
  'flex items-center gap-2 min-h-[44px] px-2 text-slate-400 hover:text-white transition-colors text-sm font-bold';

/** Single-line footer: secondary links only. Admin recruitment and the project story live in /faq. */
export const HomeFooter: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="w-full mt-12 py-6 border-t border-slate-800/50 text-center">
      <div className="flex flex-wrap justify-center items-center gap-x-4">
        <button onClick={() => navigate('/faq')} className={LINK_CLASS}>
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
      <p className="text-slate-500 text-xs mt-2">Cesto Tracker © 2026 · Proyecto independiente</p>
    </footer>
  );
};
