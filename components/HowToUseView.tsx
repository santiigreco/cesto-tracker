
import React, { useState, useEffect } from 'react';
import Court from './Court';
import TapIcon from './TapIcon';
import { Shot, ShotPosition } from '../types';

const HowToUseView: React.FC = () => {
    const [demoStep, setDemoStep] = useState(0);
    const demoPositions: ShotPosition[] = [
        { x: 12, y: 7 }, // Media distancia
        { x: 18, y: 14 } // Triple
    ];
    const [currentDemoPosition, setCurrentDemoPosition] = useState<ShotPosition>(demoPositions[0]);
    const [demoShot, setDemoShot] = useState<Shot | null>(null);
    const [showTap, setShowTap] = useState(false);
    const [showPress, setShowPress] = useState(false);

    useEffect(() => {
        const sequence = [
            // Step 0: Show tap icon
            () => { 
                setCurrentDemoPosition(demoPositions[0]);
                setShowTap(true); 
                setShowPress(false); 
                setDemoShot(null); 
            },
            // Step 1: Show press indicator
            () => { 
                setShowTap(false); 
                setShowPress(true); 
            },
            // Step 2: Show Gol
            () => { 
                setShowPress(false); 
                setDemoShot({ id: 'demo-gol', playerNumber: '7', position: demoPositions[0], isGol: true, golValue: 2, period: 'First Half' }); 
            },
            // Step 3: Show tap for Fallo (from a different position)
            () => {
                setCurrentDemoPosition(demoPositions[1]);
                setShowTap(true);
                setShowPress(false);
                setDemoShot(null);
            },
             // Step 4: Show Fallo result
            () => {
                setShowTap(false);
                setDemoShot({ id: 'demo-miss', playerNumber: '7', position: demoPositions[1], isGol: false, golValue: 0, period: 'First Half' });
            }
        ];

        const sequenceTimings = [2500, 2000, 2500, 2500, 2500];
        let stepIndex = 0;
        let timeoutId: number;

        const runSequence = () => {
            sequence[stepIndex]();
            setDemoStep(stepIndex);
            
            const nextDelay = sequenceTimings[stepIndex];
            stepIndex = (stepIndex + 1) % sequence.length;

            timeoutId = window.setTimeout(runSequence, nextDelay);
        };

        runSequence();

        return () => clearTimeout(timeoutId);
    }, []);

    const demoText = [
        "1. Toca en cualquier lugar de la cancha para marcar la posición del tiro.",
        "2. El círculo azul confirma la posición y el jugador seleccionado.",
        "3. Selecciona 'Gol' en el menú que aparece para registrar un acierto.",
        "4. Para registrar un fallo, simplemente toca otra posición y...",
        "5. ...selecciona 'Fallo'. ¡Así de fácil!",
    ];

    return (
        <div className="bg-gray-800 p-4 sm:p-8 rounded-lg shadow-lg text-gray-300 space-y-8">
            <h2 className="text-3xl font-bold text-cyan-400 text-center">Cómo Usar Cesto Tracker</h2>

            {/* Step 1 */}
            <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-white">Paso 1: Configuración Inicial</h3>
                <p>
                    Al abrir la aplicación por primera vez, verás una pantalla para configurar tu partido.
                    Simplemente <span className="text-cyan-400 font-semibold">selecciona los números de los jugadores</span> que participarán.
                    Puedes agregarlos o quitarlos más tarde desde el menú de configuración.
                </p>
            </div>

            {/* Step 2 - Visual Demo */}
            <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-white">Paso 2: Registrar un Tiro</h3>
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-full max-w-xs mx-auto md:w-1/2 md:max-w-none flex-shrink-0">
                        <div className="relative w-full aspect-[4/5]">
                            <Court shots={demoShot ? [demoShot] : []} showShotMarkers={true} />
                            
                            {showTap && (
                                <div
                                    className="absolute pointer-events-none"
                                    style={{
                                        left: `${(currentDemoPosition.x / 20) * 100}%`,
                                        top: `${((16 - currentDemoPosition.y) / 16) * 100}%`,
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                >
                                    <TapIcon />
                                </div>
                            )}

                            {showPress && (
                                <div
                                    className="absolute w-14 h-14 rounded-full bg-cyan-500/60 backdrop-blur-sm border-2 border-cyan-300 flex items-center justify-center font-bold text-white text-2xl pointer-events-none shadow-lg"
                                    style={{
                                        left: `${(currentDemoPosition.x / 20) * 100}%`,
                                        top: `${((16 - currentDemoPosition.y) / 16) * 100}%`,
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                >
                                    7
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="md:w-1/2 text-lg space-y-4">
                        <p>
                            En la pestaña <span className="font-semibold text-cyan-400">'Registro de tiros'</span>, selecciona un jugador y sigue estos pasos:
                        </p>
                        <div className="relative p-4 bg-gray-700/50 rounded-lg h-32 flex items-center">
                           <p>
                                {demoText[demoStep]}
                           </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Step 3 */}
            <div className="space-y-2 border-t border-gray-700 pt-6">
                <h3 className="text-2xl font-semibold text-white">Paso 3: Analizar los Datos</h3>
                <p>
                    Una vez que hayas registrado algunos tiros, explora las otras pestañas:
                </p>
                <ul className="list-disc list-inside pl-4 space-y-1">
                    <li><span className="font-semibold text-cyan-400">Análisis de Cancha:</span> Visualiza mapas de calor, mapas de tiros y un gráfico de zonas de efectividad. Usa los filtros para analizar por jugador, período o resultado.</li>
                    <li><span className="font-semibold text-cyan-400">Estadísticas:</span> Revisa un resumen completo del rendimiento del equipo y de los jugadores, y comparte una imagen de las estadísticas.</li>
                </ul>
            </div>
        </div>
    );
};

export default HowToUseView;
