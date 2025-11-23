import React, { useState } from 'react';
import { Shot, PlayerStats } from '../types';
import Court from './Court';
import HeatmapOverlay from './HeatmapOverlay';
import PhoneMockup from './PhoneMockup';
import FeatureMapIcon from './FeatureMapIcon';
import FeatureTrophyIcon from './FeatureTrophyIcon';
import FeatureTapIcon from './FeatureTapIcon';
import ChevronDownIcon from './ChevronDownIcon';
import WhatsappIcon from './WhatsappIcon';
import CheckIcon from './CheckIcon';
import { faqData } from './faqData';

const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.07 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.359 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.359-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.359-2.618-6.78-6.98-6.98C15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/>
    </svg>
);

const CloudDownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 17l-4-4m0 0l4-4m-4 4h12" />
    </svg>
);

// --- Mock Data for Visuals ---
const sampleShots: Shot[] = [
  { id: 's1', playerNumber: '10', position: { x: 10, y: 3 }, isGol: true, golValue: 2, period: 'First Half' },
  { id: 's2', playerNumber: '10', position: { x: 12, y: 4 }, isGol: true, golValue: 2, period: 'First Half' },
  { id: 's3', playerNumber: '10', position: { x: 8, y: 4 }, isGol: true, golValue: 2, period: 'First Half' },
  { id: 's4', playerNumber: '10', position: { x: 5, y: 2 }, isGol: false, golValue: 0, period: 'First Half' },
  { id: 's5', playerNumber: '10', position: { x: 15, y: 2 }, isGol: false, golValue: 0, period: 'First Half' },
];

// --- Mockups Components ---

const TallyMockup = () => (
    <PhoneMockup>
        <div className="flex flex-col h-full bg-slate-800 p-3">
            <div className="bg-slate-900 p-2 rounded mb-3 text-center border border-slate-700">
                <p className="text-xs text-slate-400">Jugador seleccionado</p>
                <p className="text-lg font-bold text-cyan-400">#10</p>
            </div>
            <div className="flex gap-2 h-full">
                {/* Left Actions */}
                <div className="grid grid-cols-2 gap-2 w-2/3">
                    {['Recupero', 'Pérdida', 'Asistencia', 'Rebote', 'Falta', 'Tapa'].map(label => (
                        <div key={label} className="bg-slate-700 rounded flex items-center justify-center text-[10px] font-bold text-slate-300">
                            {label}
                        </div>
                    ))}
                </div>
                {/* Right Scoring */}
                <div className="flex flex-col gap-2 w-1/3">
                    <div className="bg-green-600 rounded flex-1 flex flex-col items-center justify-center shadow-lg">
                        <span className="text-xl font-bold text-white">GOL</span>
                    </div>
                    <div className="bg-red-600 rounded flex-1 flex flex-col items-center justify-center shadow-lg">
                        <span className="text-xl font-bold text-white">FALLO</span>
                    </div>
                </div>
            </div>
            <div className="mt-3 bg-slate-900 p-2 rounded border border-slate-700">
                 <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Última acción:</span>
                    <span>Hace 2s</span>
                 </div>
                 <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="text-green-400">[GOL]</span> #10
                 </div>
            </div>
        </div>
    </PhoneMockup>
);

const StatsMockup = () => (
     <PhoneMockup>
        <div className="p-3 w-full h-full flex flex-col bg-slate-900 text-white overflow-hidden">
            <div className="text-center mb-3">
                <h2 className="text-sm font-bold text-cyan-400">Resumen</h2>
                <p className="text-[10px] text-slate-400">Final del Partido</p>
            </div>
            
            <div className="flex justify-around mb-4 px-2">
                <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">86</p>
                    <p className="text-[10px] text-slate-400">Puntos</p>
                </div>
                 <div className="text-center">
                    <p className="text-2xl font-bold text-white">12</p>
                    <p className="text-[10px] text-slate-400">Recuperos</p>
                </div>
            </div>

            <div className="space-y-2">
                {[
                    { id: '10', name: 'Sofía', pts: 24, perc: 80, color: 'cyan' },
                    { id: '7', name: 'Lucía', pts: 18, perc: 65, color: 'emerald' },
                    { id: '5', name: 'Martina', pts: 12, perc: 50, color: 'amber' },
                ].map((p) => (
                    <div key={p.id} className="bg-slate-800 p-2 rounded border border-slate-700">
                        <div className="flex justify-between items-center mb-1">
                            <span className={`font-bold text-${p.color}-300 text-xs`}>#{p.id} {p.name}</span>
                            <span className="text-xs font-bold">{p.pts} Pts</span>
                        </div>
                         <div className="w-full bg-slate-700 rounded-full h-1">
                            <div className={`bg-${p.color}-500 h-1 rounded-full`} style={{ width: `${p.perc}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </PhoneMockup>
);


const HomePage: React.FC<{ onStart: () => void; onLoadGameClick: () => void; }> = React.memo(({ onStart, onLoadGameClick }) => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center font-sans overflow-x-hidden bg-pattern-hoops">
             <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-700/[0.05] pointer-events-none"></div>
             <div className="absolute top-0 left-0 w-full h-2/3 bg-gradient-to-b from-slate-900 via-slate-900/90 to-transparent pointer-events-none"></div>
            
            {/* --- HERO SECTION --- */}
            <div className="relative w-full max-w-5xl mx-auto text-center flex flex-col items-center px-4 pt-16 sm:pt-24 pb-12">
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6 text-white">
                    Cesto Tracker
                </h1>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-cyan-400">
                    Tu planilla digital.
                </h2>
                <p className="text-xl sm:text-2xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                    Chau papel y lápiz 👋. Registra goles, faltas y estadísticas al instante desde tu celular.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
                    <button
                        onClick={onStart}
                        className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.3)] text-xl flex items-center justify-center gap-2"
                    >
                        <FeatureTapIcon className="h-6 w-6" />
                        Empezar Partido
                    </button>
                     <button
                        onClick={onLoadGameClick}
                        className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                        <CloudDownloadIcon className="h-6 w-6" />
                        Ver partidos anteriores
                    </button>
                </div>
                <p className="mt-4 text-sm text-slate-500">
                    Es gratis y no necesita internet.
                </p>
            </div>

            {/* --- HOW IT WORKS (3 STEPS) --- */}
            <div className="w-full bg-slate-800/50 border-y border-slate-700/50 py-12">
                <div className="max-w-5xl mx-auto px-4">
                    <h2 className="text-center text-2xl font-bold text-white mb-10">Tan fácil como usar WhatsApp</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                        {/* Step 1 */}
                        <div className="flex flex-row md:flex-col items-start md:items-center gap-4 p-4 md:p-0 bg-slate-900/50 md:bg-transparent rounded-xl md:rounded-none border border-slate-700/50 md:border-none">
                            <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-cyan-900/50 rounded-full flex items-center justify-center text-cyan-400 border border-cyan-500/30 mb-0 md:mb-4">
                                <span className="text-xl md:text-2xl font-bold">1</span>
                            </div>
                            <div className="text-left md:text-center">
                                <h3 className="text-lg md:text-xl font-semibold text-white mb-1 md:mb-2">Elegí tu equipo</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">Seleccioná los números de las jugadoras que entran a la cancha.</p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-row md:flex-col items-start md:items-center gap-4 p-4 md:p-0 bg-slate-900/50 md:bg-transparent rounded-xl md:rounded-none border border-slate-700/50 md:border-none">
                            <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-cyan-900/50 rounded-full flex items-center justify-center text-cyan-400 border border-cyan-500/30 mb-0 md:mb-4">
                                <span className="text-xl md:text-2xl font-bold">2</span>
                            </div>
                            <div className="text-left md:text-center">
                                <h3 className="text-lg md:text-xl font-semibold text-white mb-1 md:mb-2">Tocá los botones</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">GOL verde, FALLO rojo. Así de simple. Olvidate de sumar con los dedos.</p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-row md:flex-col items-start md:items-center gap-4 p-4 md:p-0 bg-slate-900/50 md:bg-transparent rounded-xl md:rounded-none border border-slate-700/50 md:border-none">
                            <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-cyan-900/50 rounded-full flex items-center justify-center text-cyan-400 border border-cyan-500/30 mb-0 md:mb-4">
                                <span className="text-xl md:text-2xl font-bold">3</span>
                            </div>
                            <div className="text-left md:text-center">
                                <h3 className="text-lg md:text-xl font-semibold text-white mb-1 md:mb-2">Mirá el resultado</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">La app calcula todo sola. Al final, compartí la imagen del partido.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- FEATURES DEEP DIVE --- */}
            <div className="max-w-5xl mx-auto px-4 py-16 space-y-24">
                
                {/* Feature 1: Tally */}
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-6 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
                            <FeatureTapIcon className="h-4 w-4" /> Anotador Rápido
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Botones Grandes y Fáciles.</h2>
                        <p className="text-lg text-slate-400 leading-relaxed">
                            Diseñamos una pantalla especial para que no tengas que mirar el celular. 
                            Los botones de <strong>GOL</strong> y <strong>FALLO</strong> están ubicados a la derecha para usar con una sola mano.
                        </p>
                        <ul className="space-y-3 text-slate-300 inline-block text-left">
                            <li className="flex items-center gap-3"><CheckIcon className="h-5 w-5 text-emerald-500"/> Registra Recuperos y Pérdidas</li>
                            <li className="flex items-center gap-3"><CheckIcon className="h-5 w-5 text-emerald-500"/> Control de Faltas por jugadora</li>
                            <li className="flex items-center gap-3"><CheckIcon className="h-5 w-5 text-emerald-500"/> Historial para deshacer errores</li>
                        </ul>
                    </div>
                    <div className="flex-1 flex justify-center relative">
                        <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full"></div>
                        <TallyMockup />
                    </div>
                </div>

                {/* Feature 2: Stats */}
                <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                     <div className="flex-1 space-y-6 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-900/30 border border-amber-500/30 text-amber-400 text-sm font-medium">
                            <FeatureTrophyIcon className="h-4 w-4" /> Reportes Automáticos
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">La matemática la hacemos nosotros.</h2>
                        <p className="text-lg text-slate-400 leading-relaxed">
                            ¿Cuántos puntos hizo la 10? ¿Quién tiene más recuperos? 
                            Al terminar el partido, tenés todas las estadísticas listas.
                        </p>
                         <p className="text-lg text-slate-400 leading-relaxed">
                            Generamos una imagen resumen perfecta para mandar al grupo de <strong>WhatsApp</strong> del equipo.
                        </p>
                    </div>
                    <div className="flex-1 flex justify-center relative">
                        <div className="absolute inset-0 bg-amber-500/10 blur-3xl rounded-full"></div>
                        <StatsMockup />
                    </div>
                </div>

                {/* Feature 3: Maps (Bonus) */}
                 <div className="bg-slate-800/40 rounded-3xl p-8 md:p-12 border border-slate-700 text-center">
                    <FeatureMapIcon className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">¿Querés ir más allá?</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto mb-8">
                        Si te gusta la táctica, usá el modo "Registro de Tiros" para marcar exactamente dónde pica la pelota en la cancha y ver Mapas de Calor.
                    </p>
                    <div className="inline-block relative rounded-xl overflow-hidden border-2 border-slate-600 shadow-2xl">
                         <div className="w-64 h-48 bg-slate-800 relative">
                            <Court shots={[]}>
                                <HeatmapOverlay shots={sampleShots} />
                            </Court>
                         </div>
                    </div>
                </div>
            </div>

            {/* --- FAQ SECTION --- */}
             <section className="w-full bg-slate-900 py-16 px-4 border-t border-slate-800">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-slate-100 mb-8 text-center">Preguntas Frecuentes</h2>
                    <div className="space-y-4">
                        {faqData.slice(0, 4).map((faq, index) => (
                            <div key={index} className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full flex justify-between items-center text-left p-5 font-semibold text-lg hover:bg-slate-700 transition-colors text-slate-200"
                                    aria-expanded={openFaq === index}
                                >
                                    <span>{faq.question}</span>
                                    <ChevronDownIcon className={`h-6 w-6 text-slate-400 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                                </button>
                                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaq === index ? 'max-h-48' : 'max-h-0'}`}>
                                    <div className="p-5 pt-0 text-slate-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: faq.answer }}>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                     <div className="mt-12 text-center">
                        <p className="text-slate-400 mb-4">¿Tenés alguna duda o sugerencia?</p>
                        <a
                           href="https://api.whatsapp.com/send/?phone=5491163303194&text=Hola!%20Tengo%20una%20consulta%20sobre%20Cesto%20Tracker..."
                           target="_blank"
                           rel="noopener noreferrer"
                           className="inline-flex items-center justify-center gap-2 text-green-400 hover:text-green-300 font-semibold transition-colors"
                        >
                            <WhatsappIcon className="h-5 w-5" />
                            Escribime por WhatsApp
                        </a>
                     </div>
                </div>
            </section>

             <footer className="w-full py-8 text-center text-slate-600 text-sm border-t border-slate-800 bg-slate-950">
                <div className="flex justify-center gap-6 mb-4">
                     <a href="https://instagram.com/gresolutions" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors" aria-label="Instagram"><InstagramIcon /></a>
                </div>
                <p>Santiago Greco - Gresolutions © 2025</p>
            </footer>
        </div>
    );
});

export default HomePage;