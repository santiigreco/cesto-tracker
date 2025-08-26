import React, { useState } from 'react';
import ChevronDownIcon from './ChevronDownIcon';
import WhatsappIcon from './WhatsappIcon';
import { faqData } from './faqData';

const FaqView: React.FC = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    return (
        <div className="bg-slate-800 p-4 sm:p-8 rounded-lg shadow-lg text-slate-300 space-y-8">
            <h2 className="text-3xl font-bold text-cyan-400 text-center">Preguntas Frecuentes</h2>
            <div className="space-y-4">
                {faqData.map((faq, index) => (
                    <div key={index} className="bg-slate-700/50 border border-slate-600 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setOpenFaq(openFaq === index ? null : index)}
                            className="w-full flex justify-between items-center text-left p-5 font-semibold text-lg hover:bg-slate-700/25 transition-colors"
                            aria-expanded={openFaq === index}
                        >
                            <span>{faq.question}</span>
                            <ChevronDownIcon className={`h-6 w-6 text-slate-400 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaq === index ? 'max-h-60' : 'max-h-0'}`}>
                            <div className="p-5 pt-0 text-slate-300">
                                <p>{faq.answer}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
             <div className="text-center border-t border-slate-700 pt-8">
                <p className="text-slate-400 mb-4">¿No encontraste lo que buscabas?</p>
                <a
                   href="https://api.whatsapp.com/send/?phone=5491163303194&text=Hola!%20Tengo%20una%20consulta%20sobre%20Cesto%20Tracker..."
                   target="_blank"
                   rel="noopener noreferrer"
                   className="inline-flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors transform hover:scale-105"
                >
                    <WhatsappIcon className="h-5 w-5" />
                    <span>Enviar Feedback</span>
                </a>
             </div>
        </div>
    );
};

export default FaqView;