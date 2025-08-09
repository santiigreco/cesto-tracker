
import React from 'react';
import { Shot } from '../types';

interface ShotLogProps {
  shots: Shot[];
  onDeleteShot: (shotId: string) => void;
  onClearAllShots: () => void;
  playerNames: Record<string, string>;
}

const TrashIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);

const DownloadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.293a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

/**
 * Displays a log of all recorded shots in a table.
 * Newest shots are shown first.
 */
const ShotLog: React.FC<ShotLogProps> = ({ shots, onDeleteShot, onClearAllShots, playerNames }) => {
  /**
   * Generates a CSV file from the shot data and triggers a download.
   */
  const handleExportCSV = () => {
    if (shots.length === 0) {
      alert("No hay tiros para exportar.");
      return;
    }

    const headers = ['ID Tiro', 'Jugador', 'Nombre Jugador', 'Período', 'Posición X', 'Posición Y', 'Resultado', 'Puntos'];
    const csvRows = [headers.join(',')];

    // Create a row for each shot
    shots.forEach(shot => {
      const row = [
        `"${shot.id}"`,
        shot.playerNumber,
        playerNames[shot.playerNumber] || '',
        shot.period === 'First Half' ? 'Primer Tiempo' : 'Segundo Tiempo',
        shot.position.x.toFixed(2),
        shot.position.y.toFixed(2),
        shot.isGol ? 'Gol' : 'Fallo',
        shot.golValue.toString()
      ];
      csvRows.push(row.join(','));
    });

    // Create a Blob and download link
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'cestoball_registro_tiros.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(url);
  };
  
  const periodTranslations = {
      'First Half': 'Primer Tiempo',
      'Second Half': 'Segundo Tiempo'
  };

  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-cyan-400">Registro de Tiros</h2>
        {shots.length > 0 && (
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
              aria-label="Exportar todos los tiros como CSV"
            >
              <DownloadIcon className="h-4 w-4 sm:h-5 sm:w-5"/>
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
            <button
              onClick={onClearAllShots}
              className="flex items-center gap-2 bg-red-800 hover:bg-red-700 text-red-100 font-semibold py-2 px-3 sm:px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-600"
              aria-label="Borrar todos los tiros"
            >
              <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5"/>
              <span className="hidden sm:inline">Borrar Todo</span>
            </button>
          </div>
        )}
      </div>
      <div className="max-h-[28rem] overflow-y-auto pr-2">
        {shots.length === 0 ? (
          <p className="text-gray-400 text-center py-4">Aún no hay tiros registrados.</p>
        ) : (
          <div className="w-full">
            <table className="w-full text-left table-auto">
              <thead className="sticky top-0 bg-gray-800 z-10">
                <tr className="border-b-2 border-gray-600">
                  <th className="p-3 text-sm font-semibold tracking-wider w-[20%]">Jugador</th>
                  <th className="p-3 text-sm font-semibold tracking-wider w-[20%]">Posición (m)</th>
                  <th className="p-3 text-sm font-semibold tracking-wider w-[20%]">Período</th>
                  <th className="p-3 text-sm font-semibold tracking-wider w-[15%]">Resultado</th>
                  <th className="p-3 text-sm font-semibold tracking-wider w-[15%] text-center">Puntos</th>
                  <th className="p-3 text-sm font-semibold tracking-wider w-[10%] text-right"></th>
                </tr>
              </thead>
              <tbody>
                {[...shots].reverse().map((shot) => (
                  <tr key={shot.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors duration-150">
                    <td className="p-3 font-mono text-cyan-300">
                      {playerNames[shot.playerNumber] || `#${shot.playerNumber}`}
                      {playerNames[shot.playerNumber] && <span className="block text-xs text-gray-400 font-sans">#{shot.playerNumber}</span>}
                    </td>
                    <td className="p-3 font-mono text-gray-300">{`(${shot.position.x.toFixed(1)}, ${shot.position.y.toFixed(1)})`}</td>
                    <td className="p-3 text-gray-300">{periodTranslations[shot.period]}</td>
                    <td className={`p-3 font-semibold ${shot.isGol ? 'text-green-400' : 'text-red-400'}`}>
                      {shot.isGol ? 'Gol' : 'Fallo'}
                    </td>
                    <td className="p-3 font-mono text-white text-center">
                      {shot.golValue > 0 ? shot.golValue : '-'}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onDeleteShot(shot.id)}
                        className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                        aria-label={`Eliminar tiro del jugador ${shot.playerNumber}`}
                      >
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShotLog;
