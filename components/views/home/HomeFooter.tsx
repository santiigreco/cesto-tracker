import React from 'react';
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

export const HomeFooter: React.FC = () => {
  return (
    <>
      <section className="mt-32 max-w-2xl mx-auto px-6 text-center">
        <div className="p-8 rounded-[2.5rem] bg-gradient-to-b from-slate-800/40 to-transparent border border-slate-800/50">
          <span className="text-4xl mb-4 block">🏐❤️</span>
          <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tighter">
            Hecho a pulmón para el Cestoball
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Cesto Tracker es un proyecto independiente desarrollado para jerarquizar el deporte. Sin sponsors ni
            publicidades, solo código y pasión. Si te sirve el proyecto, ¡compartilo en tu club!
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <a
              href="https://api.whatsapp.com/send/?phone=5491163303194&text=Hola!%20Quiero%20sumarme%20como%20admin..."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
            >
              <span>🛠️</span> Sumate como Admin
            </a>
            <a
              href="https://api.whatsapp.com/send/?phone=5491163303194&text=Hola!%20Tengo%20una%20idea%20o%20comentario%20sobre%20la%20app..."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
            >
              <WhatsappIcon className="h-4 w-4" /> Ideas & Feedback
            </a>
            <a
              href="https://instagram.com/gresolutions"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
            >
              <InstagramIcon className="h-4 w-4" /> Instagram
            </a>
          </div>
        </div>
      </section>

      <footer className="w-full py-12 text-center border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-md">
        <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
          Cesto Tracker © 2026
        </p>
        <p className="text-slate-500 text-[10px] items-center justify-center gap-1 hidden sm:flex">
          Desarrollado con pasión por{' '}
          <a
            href="https://instagram.com/gresolutions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-cyan-400 transition-colors underline decoration-slate-700 underline-offset-4"
          >
            Gresolutions
          </a>
        </p>
      </footer>
    </>
  );
};
