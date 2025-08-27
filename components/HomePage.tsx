import React, { useState } from 'react';
import { Shot, PlayerStats } from '../types';
import Court from './Court';
import HeatmapOverlay from './HeatmapOverlay';
import ZoneChart from './ZoneChart';
import PhoneMockup from './PhoneMockup';
import FeatureMapIcon from './FeatureMapIcon';
import FeatureChartIcon from './FeatureChartIcon';
import FeatureTrophyIcon from './FeatureTrophyIcon';
import FeatureTapIcon from './FeatureTapIcon';
import ChevronDownIcon from './ChevronDownIcon';
import WhatsappIcon from './WhatsappIcon';
import { faqData } from './faqData';

const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w.org/2000/svg" className={className || "h-6 w-6"} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.07 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.359 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.359-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.359-2.618-6.78-6.98-6.98C15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/>
    </svg>
);


// More realistic sample data, prioritizing doubles over triples.
const sampleShots: Shot[] = [
  // Player #10: Target -> 13 Pts, 6/10 Goles, 60% (1 triple, 5 dobles)
  { id: 'p10s1', playerNumber: '10', position: { x: 10, y: 0.5 }, isGol: true, golValue: 3, period: 'First Half' }, // The one triple
  { id: 'p10s2', playerNumber: '10', position: { x: 18, y: 2.8 }, isGol: true, golValue: 2, period: 'First Half' }, // Was triple, now double
  { id: 'p10s3', playerNumber: '10', position: { x: 2, y: 3.7 }, isGol: true, golValue: 2, period: 'First Half' }, // Was triple, now double
  { id: 'p10s4', playerNumber: '10', position: { x: 10, y: 4 }, isGol: true, golValue: 2, period: 'First Half' },
  { id: 'p10s5', playerNumber: '10', position: { x: 15, y: 6 }, isGol: true, golValue: 2, period: 'First Half' },
  { id: 'p10s6', playerNumber: '10', position: { x: 5, y: 6 }, isGol: true, golValue: 2, period: 'First Half' },
  { id: 'p10s7', playerNumber: '10', position: { x: 1, y: 0.5 }, isGol: false, golValue: 0, period: 'First Half' },
  { id: 'p10s8', playerNumber: '10', position: { x: 10, y: 11 }, isGol: false, golValue: 0, period: 'First Half' },
  { id: 'p10s9', playerNumber: '10', position: { x: 19, y: 3 }, isGol: false, golValue: 0, period: 'First Half' },
  { id: 'p10s10', playerNumber: '10', position: { x: 8, y: 8 }, isGol: false, golValue: 0, period: 'First Half' },

  // Player #7: Target -> 11 Pts, 5/8 Goles, 62.5% (1 triple, 4 dobles)
  { id: 'p7s1', playerNumber: '7', position: { x: 12, y: 0.6 }, isGol: true, golValue: 3, period: 'First Half' }, // The one triple
  { id: 'p7s2', playerNumber: '7', position: { x: 8, y: 4.9 }, isGol: true, golValue: 2, period: 'First Half' }, // Was triple, now double
  { id: 'p7s3', playerNumber: '7', position: { x: 10, y: 10.5 }, isGol: true, golValue: 2, period: 'First Half' },
  { id: 'p7s4', playerNumber: '7', position: { x: 11, y: 11.5 }, isGol: true, golValue: 2, period: 'First Half' },
  { id: 'p7s5', playerNumber: '7', position: { x: 9, y: 11 }, isGol: true, golValue: 2, period: 'First Half' },
  { id: 'p7s6', playerNumber: '7', position: { x: 4, y: 0.5 }, isGol: false, golValue: 0, period: 'First Half' },
  { id: 'p7s7', playerNumber: '7', position: { x: 16, y: 4 }, isGol: false, golValue: 0, period: 'First Half' },
  { id: 'p7s8', playerNumber: '7', position: { x: 10, y: 13 }, isGol: false, golValue: 0, period: 'First Half' },

  // Player #5: Target -> 8 Pts, 4/11 Goles, 36.3% (0 triples, 4 dobles)
  { id: 'p5s1', playerNumber: '5', position: { x: 5, y: 2.8 }, isGol: true, golValue: 2, period: 'First Half' }, // Was triple, now double
  { id: 'p5s2', playerNumber: '5', position: { x: 6, y: 9 }, isGol: true, golValue: 2, period: 'First Half' },
  { id: 'p5s3', playerNumber: '5', position: { x: 14, y: 9 }, isGol: true, golValue: 2, period: 'First Half' },
  { id: 'p5s4', playerNumber: '5', position: { x: 10, y: 7 }, isGol: true, golValue: 2, period: 'First Half' },
  { id: 'p5s5', playerNumber: '5', position: { x: 3, y: 3 }, isGol: false, golValue: 0, period: 'First Half' },
  { id: 'p5s6', playerNumber: '5', position: { x: 17, y: 3 }, isGol: false, golValue: 0, period: 'First Half' },
  { id: 'p5s7', playerNumber: '5', position: { x: 10, y: 1 }, isGol: false, golValue: 0, period: 'First Half' },
  { id: 'p5s8', playerNumber: '5', position: { x: 1, y: 10 }, isGol: false, golValue: 0, period: 'First Half' },
  { id: 'p5s9', playerNumber: '5', position: { x: 19, y: 10 }, isGol: false, golValue: 0, period: 'First Half' },
  { id: 'p5s10', playerNumber: '5', position: { x: 10, y: 12 }, isGol: false, golValue: 0, period: 'First Half' },
  { id: 'p5s11', playerNumber: '5', position: { x: 10, y: 2 }, isGol: false, golValue: 0, period: 'First Half' },
  
  // Other players to populate the court visuals
  { id: 's20', playerNumber: '2', position: { x: 4, y: 8 }, isGol: true, golValue: 2, period: 'First Half' },
  { id: 's21', playerNumber: '14', position: { x: 6, y: 9 }, isGol: false, golValue: 0, period: 'First Half' },
  { id: 's22', playerNumber: '15', position: { x: 16, y: 8 }, isGol: true, golValue: 2, period: 'First Half' },
  { id: 's23', playerNumber: '1', position: { x: 14, y: 9 }, isGol: false, golValue: 0, period: 'First Half' },
  { id: 's24', playerNumber: '3', position: { x: 10, y: 13 }, isGol: true, golValue: 2, period: 'First Half' },
];

const FeatureCard: React.FC<{ title: string; description: string; children: React.ReactNode; icon: React.ReactNode; }> = ({ title, description, children, icon }) => (
    <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-lg flex flex-col items-center text-center h-full transform transition-transform duration-300 hover:-translate-y-2">
        <div className="flex items-center gap-3 mb-3 text-cyan-400">
            {icon}
            <h3 className="text-2xl font-semibold text-slate-100">{title}</h3>
        </div>
        <p className="text-slate-400 mb-6 flex-grow max-w-xs">{description}</p>
        <div className="w-full flex-shrink-0">{children}</div>
    </div>
);

const StatsExample: React.FC<{ sampleShots: Shot[] }> = ({ sampleShots }) => {
    // Function to calculate stats for a specific player from the sample data
    const getPlayerStats = (playerNumber: string): PlayerStats => {
        const playerShots = sampleShots.filter(shot => shot.playerNumber === playerNumber);
        const totalShots = playerShots.length;
        const totalGoles = playerShots.filter(shot => shot.isGol).length;
        const totalPoints = playerShots.reduce((sum, shot) => sum + shot.golValue, 0);
        const golPercentage = totalShots > 0 ? (totalGoles / totalShots) * 100 : 0;
        return { playerNumber, totalShots, totalGoles, totalPoints, golPercentage };
    };

    const stats10 = getPlayerStats('10');
    const stats7 = getPlayerStats('7');
    const stats5 = getPlayerStats('5');
    
    const players = [
      { stats: stats10, color: 'cyan' },
      { stats: stats7, color: 'emerald' },
      { stats: stats5, color: 'amber' },
    ];

    return (
        <PhoneMockup>
            <div className="p-3 text-left w-full h-full flex flex-col justify-center bg-slate-900 text-white">
                <h2 className="text-xl font-bold text-cyan-400 text-center mb-4">Rendimiento</h2>
                <div className="space-y-3">
                    {players.map(({ stats, color }) => (
                        <div key={stats.playerNumber} className="bg-slate-800 p-2.5 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className={`font-bold text-${color}-300 text-base`}>Jugador #{stats.playerNumber}</span>
                                <span className="text-lg font-bold">{stats.totalPoints} Pts</span>
                            </div>
                            <div className="flex justify-between items-center text-xs mt-1">
                                <span className="text-slate-400">Goles: {stats.totalGoles}/{stats.totalShots}</span>
                                <span className="font-mono w-10 text-right text-slate-300">{stats.golPercentage.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-slate-600 rounded-full h-1.5 mt-1">
                                <div className={`bg-${color}-500 h-1.5 rounded-full`} style={{ width: `${stats.golPercentage}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </PhoneMockup>
    );
};


const LoggingExample = () => (
    <PhoneMockup>
        <div className="flex flex-col items-center justify-center h-full bg-slate-900">
            <div className="text-center">
                 <FeatureTapIcon className="h-16 w-16 text-cyan-400 mx-auto" />
                <p className="mt-4 font-semibold text-lg text-white">Registro Intuitivo</p>
                <p className="text-slate-400 text-sm px-2">Añade tiros con un simple toque. Rápido y fácil.</p>
            </div>
        </div>
    </PhoneMockup>
);

const HomePage: React.FC<{ onStart: () => void }> = React.memo(({ onStart }) => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans overflow-x-hidden bg-pattern-hoops">
             <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-700/[0.05]"></div>
             <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-slate-900 to-transparent"></div>
             <div className="absolute inset-0 -z-10 h-full w-full bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
            
            <div className="relative w-full max-w-5xl mx-auto text-center flex-grow flex flex-col justify-center">
                <header className="my-16">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-transparent bg-clip-text">
                    Cesto Tracker
                </span>{' '}
                🏐{'\uFE0F'}
                </h1>
                    <p className="text-lg text-slate-400 mt-6 max-w-2xl mx-auto">
                        La herramienta definitiva para registrar, analizar y mejorar el rendimiento en Cestoball.
                    </p>
                </header>

                <div className="mb-16">
                    <button
                        onClick={onStart}
                        className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-bold py-4 px-10 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-cyan-500/50 text-xl"
                    >
                        Comenzar Ahora
                    </button>
                </div>
                
                <main className="mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-12">Visualiza el Juego Como Nunca Antes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                       <FeatureCard 
                           title="Mapas de Calor" 
                           description="Identifica al instante las zonas de tiro más efectivas y las áreas a mejorar."
                           icon={<FeatureMapIcon className="h-7 w-7" />}
                        >
                           <div className="relative mx-auto rounded-2xl h-[320px] w-[280px] shadow-xl overflow-hidden border-2 border-slate-700 bg-slate-900 flex items-center justify-center">
                                <Court shots={[]}>
                                    <HeatmapOverlay shots={sampleShots} />
                                </Court>
                           </div>
                       </FeatureCard>
                       <FeatureCard 
                           title="Análisis por Zonas" 
                           description="Mide el rendimiento por zonas para tomar decisiones tácticas basadas en datos reales."
                           icon={<FeatureChartIcon className="h-7 w-7" />}
                        >
                            <div className="relative mx-auto rounded-2xl h-[320px] w-[280px] shadow-xl overflow-hidden border-2 border-slate-700 bg-slate-900 flex items-center justify-center">
                               <Court shots={[]}> 
                                    <ZoneChart shots={sampleShots} />
                                </Court>
                            </div>
                       </FeatureCard>
                       <FeatureCard 
                           title="Estadísticas Detalladas" 
                           description="Sigue el rendimiento de cada jugador: puntos, porcentajes de gol y rachas."
                           icon={<FeatureTrophyIcon className="h-7 w-7" />}
                        >
                           <StatsExample sampleShots={sampleShots} /> 
                       </FeatureCard>
                       <FeatureCard 
                           title="Registro Intuitivo" 
                           description="Añade tiros con un simple toque. Dedica más tiempo a entrenar y menos a anotar."
                           icon={<FeatureTapIcon className="h-7 w-7" />}
                        >
                            <LoggingExample />
                       </FeatureCard>
                    </div>
                </main>

                 <section className="mb-16 text-left max-w-3xl mx-auto w-full">
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-8 text-center">Preguntas Frecuentes</h2>
                    <div className="space-y-4">
                        {faqData.map((faq, index) => (
                            <div key={index} className="bg-slate-800/60 border border-slate-700 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full flex justify-between items-center text-left p-5 font-semibold text-lg hover:bg-slate-700/50 transition-colors"
                                    aria-expanded={openFaq === index}
                                >
                                    <span>{faq.question}</span>
                                    <ChevronDownIcon className={`h-6 w-6 text-slate-400 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                                </button>
                                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaq === index ? 'max-h-96' : 'max-h-0'}`}>
                                    <div className="p-5 pt-0 text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: faq.answer }}>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                     <div className="mt-10 text-center">
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
                </section>
            </div>
             <footer className="relative w-full max-w-5xl mx-auto border-t border-slate-700/50 pt-8 pb-4 text-center text-slate-500 text-sm">
                <div className="flex justify-center gap-6 mb-4">
                     <a href="https://instagram.com/gresolutions" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors" aria-label="Instagram"><InstagramIcon /></a>
                </div>
                <p>Santiago Greco - Gresolutions © 2025</p>
            </footer>
        </div>
    );
});

export default HomePage;