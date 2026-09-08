import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { faqData } from '@/components/faqData';
import { ChevronDownIcon, WhatsappIcon } from '@/components/icons';

export const HomeFaqSection: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section className="mt-24 max-w-3xl mx-auto w-full px-4">
      <h2 className="text-2xl font-black text-white mb-8 text-center uppercase tracking-tight">
        Preguntas Frecuentes
      </h2>
      <div className="space-y-3">
        {faqData.slice(0, 5).map((faq, index) => (
          <div
            key={index}
            className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden transition-all hover:border-slate-600"
          >
            <button
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
              className="w-full flex justify-between items-center text-left p-4 font-bold text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              <span className="text-sm">{faq.question}</span>
              <ChevronDownIcon
                className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${
                  openFaq === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openFaq === index && (
              <div className="px-4 pb-4 text-sm text-slate-400 leading-relaxed border-t border-slate-700/30 pt-3">
                <div dangerouslySetInnerHTML={{ __html: faq.answer }}></div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-col items-center gap-4">
        <button
          onClick={() => navigate('/faq')}
          className="text-cyan-400 hover:text-cyan-300 font-black text-xs uppercase tracking-widest bg-cyan-900/20 border border-cyan-500/20 px-6 py-3 rounded-full transition-all"
        >
          Ver FAQ Completa
        </button>
        <a
          href="https://api.whatsapp.com/send/?phone=5491163303194&text=Hola!%20Tengo%20una%20consulta..."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-bold text-xs uppercase tracking-wide"
        >
          <WhatsappIcon className="h-4 w-4" />
          ¿Tenés dudas? Escribinos
        </a>
      </div>
    </section>
  );
};
