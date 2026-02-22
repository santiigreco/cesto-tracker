import React, { useState } from 'react';
import { ChevronDownIcon, CoffeeIcon } from './icons';
import { WhatsappIcon } from './icons';
import { faqData } from './faqData';

const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.07 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.359 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.359-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.359-2.618-6.78-6.98-6.98C15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" />
    </svg>
);

const FaqView: React.FC = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    return (
        <div className="bg-slate-800 p-4 sm:p-8 rounded-2xl shadow-lg text-slate-300 space-y-8">

            {/* Header */}
            <div className="text-center">
                <h2 className="text-3xl font-bold text-cyan-400">Preguntas Frecuentes</h2>
                <p className="text-slate-500 text-sm mt-1">Todo lo que necesitás saber para sacarle el jugo a la app</p>
            </div>

            {/* FAQ items */}
            <div className="space-y-3">
                {faqData.map((faq, index) => (
                    <div key={index} className="bg-slate-700/40 border border-slate-600/50 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setOpenFaq(openFaq === index ? null : index)}
                            className="w-full flex justify-between items-center text-left p-4 font-semibold text-base hover:bg-slate-700/30 transition-colors"
                            aria-expanded={openFaq === index}
                        >
                            <span className="pr-4">{faq.question}</span>
                            <ChevronDownIcon className={`h-5 w-5 text-slate-400 flex-shrink-0 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaq === index ? 'max-h-96' : 'max-h-0'}`}>
                            <div
                                className="px-4 pb-4 text-slate-400 leading-relaxed text-sm"
                                dangerouslySetInnerHTML={{ __html: faq.answer }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Hecho a pulmón */}
            <div className="border border-slate-700/50 rounded-2xl p-6 bg-slate-900/40 text-center space-y-4">
                <p className="text-3xl">🏐❤️</p>
                <p className="text-white font-black text-lg uppercase tracking-tight">Cesto Tracker es de todos</p>
                <p className="text-slate-400 text-sm leading-relaxed">
                    Este es un proyecto independiente desarrollado para jerarquizar el deporte.
                    Sin sponsors ni financiamiento, solo código y pasión.
                    ¡Sumate como colaborador o compartí la app en tu club!
                </p>
                <div className="flex flex-wrap justify-center gap-4 pt-2">
                    <a href="https://api.whatsapp.com/send/?phone=5491163303194&text=Hola!%20Me%20gustar%C3%ADa%20ayudar%20como%20admin%20o%20aportar%20ideas..." target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
                        <span>🛠️</span> Sumate como Colaborador
                    </a>
                    <a href="https://instagram.com/gresolutions" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
                        <InstagramIcon className="h-4 w-4" /> Instagram
                    </a>
                </div>
            </div>

            {/* Contact */}
            <div className="text-center border-t border-slate-700 pt-6">
                <p className="text-slate-400 mb-4 text-sm">¿Alguna pregunta, idea o bug para reportar?</p>
                <a
                    href="https://api.whatsapp.com/send/?phone=5491163303194&text=Hola!%20Tengo%20una%20consulta%20sobre%20Cesto%20Tracker..."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-green-500/20"
                >
                    <WhatsappIcon className="h-5 w-5" />
                    <span>Escribinos por WhatsApp</span>
                </a>
            </div>
        </div>
    );
};

export default FaqView;