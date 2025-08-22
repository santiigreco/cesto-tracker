

import React from 'react';
import { Shot } from '../types';
import Court from './Court';
import HeatmapOverlay from './HeatmapOverlay';
import ZoneChart from './ZoneChart';
import TapIcon from './TapIcon';
import MapIcon from './MapIcon';
import ChartPieIcon from './ChartPieIcon';
import TrophyIcon from './TrophyIcon';
import HandClickIcon from './HandClickIcon';

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
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center text-center h-full">
        <div className="flex items-center gap-3 mb-3">
            {icon}
            <h3 className="text-2xl font-semibold text-cyan-400">{title}</h3>
        </div>
        <p className="text-gray-300 mb-4 flex-grow">{description}</p>
        <div className="w-full flex-shrink-0">{children}</div>
    </div>
);

const StatsExample = () => (
    <div className="bg-gray-700/50 p-4 rounded-lg text-left w-full max-w-xs mx-auto">
        <div className="flex justify-between items-center border-b border-gray-600 pb-2 mb-2">
            <span className="font-bold text-cyan-300 text-lg">Jugador #10</span>
            <span className="text-xl font-bold text-white">15 Pts</span>
        </div>
        <div className="flex justify-between text-sm">
            <span className="text-gray-400">Tiros (G/T)</span>
            <span className="font-mono">6/10</span>
        </div>
        <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-gray-400">% Goles</span>
            <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-600 rounded-full h-2">
                    <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <span className="font-mono w-10 text-right">60.0%</span>
            </div>
        </div>
    </div>
);

const LoggingExample = () => (
    <div className="flex flex-col items-center justify-center h-full pt-8">
        <TapIcon />
        <p className="mt-4 font-semibold text-lg">Un toque para registrar.</p>
        <p className="text-gray-400">Así de simple.</p>
    </div>
);


const HomePage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 font-sans">
            <div className="w-full max-w-4xl mx-auto text-center">
                <header className="mb-8">
                    <h1 className="text-5xl sm:text-6xl font-bold text-cyan-400 tracking-tight">
                        Cesto Tracker 🏐
                    </h1>
                    <p className="text-xl text-gray-400 mt-4 max-w-2xl mx-auto">
                        La herramienta definitiva para registrar, analizar y mejorar el rendimiento en Cestoball.
                    </p>
                </header>

                <div className="mb-12">
                    <button
                        onClick={onStart}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500 text-xl"
                    >
                        Comenzar
                    </button>
                </div>
                
                <main className="mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <FeatureCard 
                           title="Identifica Zonas Clave" 
                           description="Visualiza al instante las áreas de tiro más calientes con los Mapas de Calor."
                           icon={<MapIcon className="h-7 w-7 text-cyan-400" />}
                        >
                           <div className="w-full max-w-[220px] mx-auto">
                                <Court shots={[]}>
                                    <HeatmapOverlay shots={sampleShots} />
                                </Court>
                            </div>
                       </FeatureCard>
                       <FeatureCard 
                           title="Analiza la Efectividad" 
                           description="Mide el rendimiento por zonas para tomar decisiones basadas en datos."
                           icon={<ChartPieIcon className="h-7 w-7 text-cyan-400" />}
                        >
                            <div className="w-full max-w-[220px] mx-auto">
                               <Court shots={[]}> 
                                    <ZoneChart shots={sampleShots} />
                                </Court>
                            </div>
                       </FeatureCard>
                       <FeatureCard 
                           title="Estadísticas Detalladas" 
                           description="Sigue el rendimiento de cada jugador: puntos, porcentajes de gol y más."
                           icon={<TrophyIcon rank={1} />}
                        >
                            <div className="pt-8">
                                <StatsExample />
                            </div>
                       </FeatureCard>
                       <FeatureCard 
                           title="Registro Intuitivo" 
                           description="Añade tiros con un simple toque en la cancha. Rápido, fácil e intuitivo."
                           icon={<HandClickIcon className="h-7 w-7 text-cyan-400" />}
                        >
                            <LoggingExample />
                       </FeatureCard>
                    </div>
                </main>
            </div>
             <div className="w-full text-center text-gray-500 text-xs mt-auto pb-4">
                Santiago Greco - Gresolutions © 2025
            </div>
        </div>
    );
};

export default HomePage;