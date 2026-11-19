import React, { useState } from 'react';
import {
  BrandLogoMark,
  ChevronDownIcon,
  InstagramIcon,
  WhatsappIcon,
  WrenchIcon,
} from '../icons';
import { faqData } from '../faqData';

const FaqView: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="bg-surface-card border border-border-subtle p-4 sm:p-7 rounded-2xl shadow-card text-ink-secondary space-y-7">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-ink-primary tracking-tight">
          Preguntas Frecuentes
        </h2>
        <p className="text-ink-muted text-sm mt-1">
          Todo lo que necesitás saber para sacarle el jugo a la app
        </p>
      </div>

      {/* FAQ items */}
      <div className="space-y-2.5">
        {faqData.map((faq, index) => {
          const isOpen = openFaq === index;
          return (
            <div
              key={index}
              className="bg-surface-elevated/60 border border-border-subtle rounded-xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(isOpen ? null : index)}
                className="w-full min-h-[52px] flex justify-between items-center text-left p-4 font-bold text-sm sm:text-base text-ink-primary hover:bg-surface-elevated transition-colors"
                aria-expanded={isOpen}
              >
                <span className="pr-4">{faq.question}</span>
                <ChevronDownIcon
                  className={`h-5 w-5 text-ink-muted flex-shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`transition-all duration-200 ease-in-out overflow-hidden ${
                  isOpen ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div
                  className="px-4 pb-4 text-ink-secondary leading-relaxed text-sm"
                  dangerouslySetInnerHTML={{ __html: faq.answer }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Community Project */}
      <div className="border border-border-subtle rounded-2xl p-5 sm:p-6 bg-surface-canvas/50 text-center space-y-3.5">
        <div className="flex justify-center">
          <BrandLogoMark className="h-10 w-10" />
        </div>
        <p className="text-ink-primary font-extrabold text-base sm:text-lg uppercase tracking-tight">
          Cesto Tracker es de todos
        </p>
        <p className="text-ink-muted text-sm leading-relaxed max-w-lg mx-auto">
          Este es un proyecto independiente desarrollado para jerarquizar el deporte. Sin sponsors ni financiamiento, solo código y pasión. ¡Sumate como colaborador o compartí la app en tu club!
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-1">
          <a
            href="https://api.whatsapp.com/send/?phone=5491163303194&text=Hola!%20Me%20gustar%C3%ADa%20ayudar%20como%20admin%20o%20aportar%20ideas..."
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] px-3 flex items-center gap-2 text-ink-secondary hover:text-ink-primary transition-colors text-xs font-bold uppercase tracking-wider"
          >
            <WrenchIcon className="h-4 w-4 text-brand" />
            <span>Sumate como Colaborador</span>
          </a>
          <a
            href="https://instagram.com/gresolutions"
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] px-3 flex items-center gap-2 text-ink-secondary hover:text-ink-primary transition-colors text-xs font-bold uppercase tracking-wider"
          >
            <InstagramIcon className="h-4 w-4" />
            <span>Instagram</span>
          </a>
        </div>
      </div>

      {/* Contact */}
      <div className="text-center border-t border-border-subtle pt-6">
        <p className="text-ink-muted mb-4 text-sm">
          ¿Alguna pregunta, idea o bug para reportar?
        </p>
        <a
          href="https://api.whatsapp.com/send/?phone=5491163303194&text=Hola!%20Tengo%20una%20consulta%20sobre%20Cesto%20Tracker..."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2.5 min-h-[48px] bg-sport-goal hover:bg-emerald-500 text-white font-bold text-sm py-3 px-6 rounded-xl transition-colors active:scale-[0.98]"
        >
          <WhatsappIcon className="h-5 w-5" />
          <span>Escribinos por WhatsApp</span>
        </a>
      </div>
    </div>
  );
};

export default FaqView;
