

import React from 'react';
import { Shot } from '../types';
import Court from './Court';
import HeatmapOverlay from './HeatmapOverlay';
import ZoneChart from './ZoneChart';
import MapIcon from './MapIcon';
import ChartPieIcon from './ChartPieIcon';
import TrophyIcon from './TrophyIcon';
import HandClickIcon from './HandClickIcon';
import PhoneMockup from './PhoneMockup'; // New

const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.07 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.359 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.359-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.359-2.618-6.78-6.98-6.98C15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/>
    </svg>
);


// Sample data for visual examples, crafted to show varied effectiveness and wide distribution
const sampleShots: Shot[] = [
  // ARO (near basket): High effectiveness (4/5 = 80%)
  { id: 's1', playerNumber: '7', position: { x: 10, y: 10.5 }, isGol: true, golValue: 2, period: 'First Half' },
  { id: 's2', playerNumber: '5', position: { x: 9.5, y: 11 }, isGol: true, golValue: 2, period: 'First Half' },
  { id: 's3', playerNumber: '8', position: { x: 10.5, y: 11.5 }, isGol: true, golValue: 2, period: 'First Half' },
  { id: 's4', playerNumber: '10', position: { x: 10, y: 10 }, isGol: true, golValue: 2, period: 'First Half' },
  { id: 's5', playerNumber: '7', position: { x: 11, y: 11 }, isGol: false, golValue: 0, period: 'First Half' },

  // TRIPLE (far): Low effectiveness (2/6 = 33%) - Spread out
  { id: 's6', playerNumber: '10', position: { x: 18, y: 0.5 }, isGol: true, golValue: 3, period: 'First Half' }, // Right corner
  { id: 's7', playerNumber: '8', position: { x: 2, y: 0.5 }, isGol: false, golValue: 0, period: 'First Half' },  // Left corner
  { id: 's8', playerNumber: '11', position: { x: 10, y: 0.2 }, isGol: false, golValue: 0, period: 'First Half' }, // Center top
  { id: 's9', playerNumber: '12', position: { x: 15, y: 0.8 }, isGol: false, golValue: 0, period: 'First Half' },// Right wing
  { id: 's17', playerNumber: '9', position: { x: 5, y: 0.7 }, isGol: true, golValue: 3, period: 'First Half' }, // Left wing
  { id: 's18', playerNumber: '4', position: { x: 19, y: 0.3 }, isGol: false, golValue: 0, period: 'First Half' }, // Deep right corner

  // MEDIA_DISTANCIA (mid-range): Medium effectiveness (3/5 = 60%) - Spread out
  { id: 's10', playerNumber: '5', position: { x: 15, y: 5 }, isGol: true, golValue: 2, period: 'First Half' }, // Right baseline
  { id: 's11', playerNumber: '9', position: { x: 5, y: 5 }, isGol: true, golValue: 2, period: 'First Half' }, // Left baseline
  { id: 's12', playerNumber: '6', position: { x: 17, y: 3 }, isGol: false, golValue: 0, period: 'First Half' }, // Right elbow
  { id: 's13', playerNumber: '4', position: { x: 3, y: 3 }, isGol: false, golValue: 0, period: 'First Half' }, // Left elbow
  { id: 's19', playerNumber: '13', position: { x: 10, y: 4 }, isGol: true, golValue: 2, period: 'First Half' }, // Free throw line

  // SIDES & CENTER: Fill out the court
  // IZQUIERDA (1/2 = 50%)
  { id: 's20', playerNumber: '2', position: { x: 4, y: 8 }, isGol: true, golValue: 2, period: 'First Half' },
  { id: 's21', playerNumber: '14', position: { x: 6, y: 9 }, isGol: false, golValue: 0, period: 'First Half' },
  // DERECHA (1/2 = 50%)
  { id: 's22', playerNumber: '15', position: { x: 16, y: 8 }, isGol: true, golValue: 2, period: 'First Half' },
  { id: 's23', playerNumber: '1', position: { x: 14, y: 9 }, isGol: false, golValue: 0, period: 'First Half' },
  
  // FONDO (under basket) (1/1 = 100%)
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

const StatsExample = () => (
    <PhoneMockup>
        <div className="p-3 text-left w-full h-full flex flex-col justify-center bg-slate-900 text-white">
            <h2 className="text-xl font-bold text-cyan-400 text-center mb-4">Rendimiento</h2>
            <div className="space-y-3">
                {/* Player 1 */}
                <div className="bg-slate-800 p-2.5 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-cyan-300 text-base">Jugador #10</span>
                        <span className="text-lg font-bold">15 Pts</span>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-1">
                        <span className="text-slate-400">Goles: 6/10</span>
                        <span className="font-mono w-10 text-right text-slate-300">60%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-1.5 mt-1">
                        <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `60%` }}></div>
                    </div>
                </div>
                {/* Player 2 */}
                <div className="bg-slate-800 p-2.5 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-emerald-300 text-base">Jugador #7</span>
                        <span className="text-lg font-bold">12 Pts</span>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-1">
                        <span className="text-slate-400">Goles: 5/8</span>
                        <span className="font-mono w-10 text-right text-slate-300">63%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-1.5 mt-1">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `62.5%` }}></div>
                    </div>
                </div>
                {/* Player 3 */}
                 <div className="bg-slate-800 p-2.5 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-amber-300 text-base">Jugador #5</span>
                        <span className="text-lg font-bold">9 Pts</span>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-1">
                        <span className="text-slate-400">Goles: 4/11</span>
                        <span className="font-mono w-10 text-right text-slate-300">36%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-1.5 mt-1">
                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `36.3%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    </PhoneMockup>
);


const LoggingExample = () => (
    <PhoneMockup>
        <div className="flex flex-col items-center justify-center h-full bg-slate-900">
            <div className="text-center">
                <HandClickIcon className="h-16 w-16 text-cyan-400 mx-auto" />
                <p className="mt-4 font-semibold text-lg text-white">Registro Intuitivo</p>
                <p className="text-slate-400 text-sm px-2">Añade tiros con un simple toque. Rápido y fácil.</p>
            </div>
        </div>
    </PhoneMockup>
);

const HomePage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans overflow-x-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-700/[0.05]"></div>
             <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-slate-900 to-transparent"></div>
             <div className="absolute inset-0 -z-10 h-full w-full bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
            
            <div className="relative w-full max-w-5xl mx-auto text-center flex-grow flex flex-col justify-center">
                <header className="my-16">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-transparent bg-clip-text">
                    Cesto Tracker
                </span>{' '}
                🏐
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
                           icon={<MapIcon className="h-7 w-7" />}
                        >
                           <div className="relative mx-auto rounded-2xl h-[400px] w-[220px] shadow-xl overflow-hidden border-2 border-slate-700 bg-slate-900">
                                <Court shots={[]}>
                                    <HeatmapOverlay shots={sampleShots} />
                                </Court>
                           </div>
                       </FeatureCard>
                       <FeatureCard 
                           title="Análisis por Zonas" 
                           description="Mide el rendimiento por zonas para tomar decisiones tácticas basadas en datos reales."
                           icon={<ChartPieIcon className="h-7 w-7" />}
                        >
                            <div className="relative mx-auto rounded-2xl h-[400px] w-[220px] shadow-xl overflow-hidden border-2 border-slate-700 bg-slate-900">
                               <Court shots={[]}> 
                                    <ZoneChart shots={sampleShots} />
                                </Court>
                            </div>
                       </FeatureCard>
                       <FeatureCard 
                           title="Estadísticas Detalladas" 
                           description="Sigue el rendimiento de cada jugador: puntos, porcentajes de gol y rachas."
                           icon={<TrophyIcon rank={1} />}
                        >
                           <StatsExample /> 
                       </FeatureCard>
                       <FeatureCard 
                           title="Registro Intuitivo" 
                           description="Añade tiros con un simple toque. Dedica más tiempo a entrenar y menos a anotar."
                           icon={<HandClickIcon className="h-7 w-7" />}
                        >
                            <LoggingExample />
                       </FeatureCard>
                    </div>
                </main>
            </div>
             <footer className="relative w-full max-w-5xl mx-auto border-t border-slate-700/50 pt-8 pb-4 text-center text-slate-500 text-sm">
                <div className="flex justify-center gap-6 mb-4">
                     <a href="https://instagram.com/gresolutions" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors" aria-label="Instagram"><InstagramIcon /></a>
                </div>
                <p>Santiago Greco - Gresolutions © 2025</p>
            </footer>
        </div>
    );
};

export default HomePage;