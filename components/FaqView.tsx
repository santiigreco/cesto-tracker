import React, { useState } from 'react';
import { ChevronDownIcon } from './icons';
import { WhatsappIcon } from './icons';
import { faqData } from './faqData';

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
            <div className="border border-slate-700/50 rounded-2xl p-5 bg-slate-900/40 text-center space-y-2">
                <p className="text-2xl">🏐❤️</p>
                <p className="text-white font-bold text-base">Hecha a pulmón, para la comunidad del Cesto</p>
                <p className="text-slate-400 text-sm leading-relaxed">
                    Cesto Tracker es un proyecto independiente, sin sponsors ni financiamiento.
                    Nació de la necesidad de tener una herramienta digital pensada para el cestoball argentino.
                    Si te sirve, compartila con tu equipo. 🙌
                </p>
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