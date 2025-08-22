import React from 'react';
import { Shot } from '../types';
import Court from './Court';
import HeatmapOverlay from './HeatmapOverlay';
import ZoneChart from './ZoneChart';

// Sample data for visual examples
const sampleShots: Shot[] = [
  { id: 's1', playerNumber: '7', position: { x: 10, y: 10 }, isGol: true, golValue: 2, period: 'First Half' },
  { id: 's2', playerNumber: '7', position: { x: 11, y: 9.5 }, isGol: false, golValue: 0, period: 'First Half' },
  { id: 's3', playerNumber: '5', position: { x: 9, y: 10.5 }, isGol: true, golValue: 2, period: 'First Half' },
  { id: 's4', playerNumber: '5', position: { x: 15, y: 5 }, isGol: true, golValue: 2, period: 'First Half' },
  { id: 's5', playerNumber: '10', position: { x: 5, y: 5 }, isGol: false, golValue: 0, period: 'First Half' },
  { id: 's6', playerNumber: '10', position: { x: 18, y: 0.5 }, isGol: true, golValue: 3, period: 'First Half' },
  { id: 's7', playerNumber: '8', position: { x: 2, y: 0.5 }, isGol: false, golValue: 0, period: 'First Half' },
  { id: 's8', playerNumber: '8', position: { x: 10, y: 13 }, isGol: true, golValue: 2, period: 'First Half' },
  { id: 's9', playerNumber: '8', position: { x: 10, y: 13.5 }, isGol: false, golValue: 0, period: 'First Half' },
];


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
                
                <main className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center mb-12">
                    {/* Feature 1: Heatmap */}
                    <div className="flex flex-col items-center gap-4">
                        <h3 className="text-2xl font-semibold text-cyan-400">Identifica Zonas Clave</h3>
                        <p className="text-gray-300 h-12">Visualiza al instante las áreas de tiro más calientes con los Mapas de Calor.</p>
                        <div className="w-full max-w-[220px] transform scale-90">
                            <Court shots={[]}>
                                <HeatmapOverlay shots={sampleShots} />
                            </Court>
                        </div>
                    </div>

                    {/* Feature 2: Zone Chart */}
                    <div className="flex flex-col items-center gap-4">
                        <h3 className="text-2xl font-semibold text-cyan-400">Analiza la Efectividad</h3>
                         <p className="text-gray-300 h-12">Mide el rendimiento por zonas para tomar decisiones basadas en datos.</p>
                        <div className="w-full max-w-[220px] transform scale-90">
                           <Court shots={[]}>
                                <ZoneChart shots={sampleShots} />
                            </Court>
                        </div>
                    </div>
                </main>
            </div>
             <div className="w-full text-center text-gray-500 text-xs mt-12 pb-4">
                Santiago Greco - Gresolutions © 2025
            </div>
        </div>
    );
};

export default HomePage;
