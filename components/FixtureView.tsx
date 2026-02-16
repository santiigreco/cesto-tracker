
import React, { useState } from 'react';
import XIcon from './XIcon';
import TeamLogo from './TeamLogo';
import CalendarIcon from './CalendarIcon';
import PencilIcon from './PencilIcon';
import CheckIcon from './CheckIcon';

interface Match {
    id: string;
    tournament: string;
    date: string;
    time: string;
    homeTeam: string;
    awayTeam: string;
    scoreHome?: number | '';
    scoreAway?: number | '';
    status: 'scheduled' | 'live' | 'finished';
}

// Mock Data Initial State
const initialMatches: Match[] = [
    { id: '1', tournament: 'Liga Nacional A', date: 'Hoy', time: '20:30', homeTeam: 'Ciudad', awayTeam: 'Vélez', status: 'scheduled', scoreHome: '', scoreAway: '' },
    { id: '2', tournament: 'Liga Nacional A', date: 'Hoy', time: '21:00', homeTeam: 'Ballester', awayTeam: 'GEVP', status: 'scheduled', scoreHome: '', scoreAway: '' },
    { id: '3', tournament: 'Torneo Apertura', date: 'Mañana', time: '19:00', homeTeam: 'SITAS', awayTeam: 'Social Parque', status: 'scheduled', scoreHome: '', scoreAway: '' },
    { id: '4', tournament: 'Torneo Apertura', date: 'Mañana', time: '20:30', homeTeam: 'Hacoaj', awayTeam: 'Avellaneda', status: 'scheduled', scoreHome: '', scoreAway: '' },
    { id: '5', tournament: 'Amistoso', date: 'Ayer', time: 'Final', homeTeam: 'CEF', awayTeam: 'APV', scoreHome: 86, scoreAway: 92, status: 'finished' },
];

interface FixtureViewProps {
    isOpen: boolean;
    onClose: () => void;
    isAdmin: boolean;
}

const FixtureView: React.FC<FixtureViewProps> = ({ isOpen, onClose, isAdmin }) => {
    const [matches, setMatches] = useState<Match[]>(initialMatches);
    const [isEditMode, setIsEditMode] = useState(false);

    if (!isOpen) return null;

    // Group matches by Tournament and Date
    const groupedMatches = matches.reduce((acc, match) => {
        const key = `${match.tournament} - ${match.date}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(match);
        return acc;
    }, {} as Record<string, Match[]>);

    const handleUpdateMatch = (id: string, field: keyof Match, value: any) => {
        setMatches(prev => prev.map(m => {
            if (m.id === id) {
                return { ...m, [field]: value };
            }
            return m;
        }));
    };

    return (
        <div className="fixed inset-0 bg-slate-900 z-50 overflow-y-auto animate-fade-in flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-4 shadow-md flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    <CalendarIcon className="h-6 w-6 text-cyan-400" />
                    <h1 className="text-xl font-bold text-white tracking-wide">FIXTURE</h1>
                </div>
                <div className="flex items-center gap-3">
                    {isAdmin && (
                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                                isEditMode 
                                ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg' 
                                : 'bg-slate-700 text-cyan-400 hover:bg-slate-600 border border-cyan-900/50'
                            }`}
                        >
                            {isEditMode ? <><CheckIcon className="h-4 w-4" /> Listo</> : <><PencilIcon className="h-4 w-4" /> Editar</>}
                        </button>
                    )}
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600 transition-colors"
                    >
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-grow p-2 sm:p-4 max-w-3xl mx-auto w-full space-y-6">
                
                {isEditMode && (
                    <div className="bg-cyan-900/20 border border-cyan-500/30 p-3 rounded-lg text-cyan-200 text-sm text-center mb-4 animate-fade-in">
                        ✏️ Modo Edición Activo: Puedes modificar horarios, resultados y estados de los partidos.
                    </div>
                )}

                {Object.entries(groupedMatches).map(([groupTitle, matches]) => (
                    <div key={groupTitle} className="rounded-lg overflow-hidden border border-slate-700 shadow-lg">
                        {/* Tournament Header */}
                        <div className="bg-slate-800 p-2 border-b border-slate-700 flex justify-between items-center">
                            <span className="font-bold text-cyan-400 text-sm uppercase tracking-wider pl-2">{groupTitle}</span>
                        </div>
                        
                        {/* Matches List */}
                        <div className="bg-slate-900 divide-y divide-slate-800">
                            {matches.map(match => (
                                <div key={match.id} className={`flex items-center justify-between p-3 transition-colors ${isEditMode ? 'bg-slate-800/30' : 'hover:bg-slate-800/50'}`}>
                                    
                                    {/* Home Team */}
                                    <div className="flex-1 flex items-center justify-end gap-2 text-right">
                                        <span className={`font-semibold ${match.scoreHome !== '' && (match.scoreHome || 0) > (match.scoreAway || 0) ? 'text-white' : 'text-slate-300'} text-sm sm:text-base hidden sm:block`}>
                                            {match.homeTeam}
                                        </span>
                                        <span className="sm:hidden font-bold text-white text-xs">{match.homeTeam.substring(0,3).toUpperCase()}</span>
                                        <TeamLogo teamName={match.homeTeam} className="h-6 w-6 sm:h-8 sm:w-8" />
                                    </div>

                                    {/* Score / Time / Inputs */}
                                    <div className="w-32 sm:w-40 text-center flex flex-col items-center justify-center bg-slate-800/80 rounded py-1 mx-2 border border-slate-700 relative">
                                        
                                        {isEditMode ? (
                                            <div className="flex flex-col gap-1 w-full px-1">
                                                <div className="flex justify-center items-center gap-1">
                                                    <input 
                                                        type="number" 
                                                        value={match.scoreHome}
                                                        onChange={(e) => handleUpdateMatch(match.id, 'scoreHome', e.target.value ? parseInt(e.target.value) : '')}
                                                        placeholder="L"
                                                        className="w-8 h-8 bg-slate-900 border border-slate-600 text-center text-white font-bold rounded focus:border-cyan-500 outline-none p-0 text-sm"
                                                    />
                                                    <span className="text-slate-500">-</span>
                                                    <input 
                                                        type="number" 
                                                        value={match.scoreAway}
                                                        onChange={(e) => handleUpdateMatch(match.id, 'scoreAway', e.target.value ? parseInt(e.target.value) : '')}
                                                        placeholder="V"
                                                        className="w-8 h-8 bg-slate-900 border border-slate-600 text-center text-white font-bold rounded focus:border-cyan-500 outline-none p-0 text-sm"
                                                    />
                                                </div>
                                                <div className="flex gap-1">
                                                    <input 
                                                        type="text" 
                                                        value={match.time}
                                                        onChange={(e) => handleUpdateMatch(match.id, 'time', e.target.value)}
                                                        className="w-full bg-slate-900 text-xs text-center text-white border border-slate-600 rounded py-0.5"
                                                    />
                                                </div>
                                                <select 
                                                    value={match.status}
                                                    onChange={(e) => handleUpdateMatch(match.id, 'status', e.target.value)}
                                                    className={`w-full text-[10px] uppercase font-bold text-center rounded py-0.5 cursor-pointer outline-none border border-slate-600 ${
                                                        match.status === 'live' ? 'bg-red-900 text-red-200' : 
                                                        match.status === 'finished' ? 'bg-slate-700 text-slate-400' : 'bg-slate-900 text-cyan-400'
                                                    }`}
                                                >
                                                    <option value="scheduled">Programado</option>
                                                    <option value="live">En Vivo 🔴</option>
                                                    <option value="finished">Finalizado</option>
                                                </select>
                                            </div>
                                        ) : (
                                            <>
                                                {match.status === 'scheduled' ? (
                                                    <span className="text-cyan-400 font-bold text-lg font-mono">{match.time}</span>
                                                ) : (
                                                    <div className="font-bold text-lg text-white font-mono leading-none">
                                                        {match.scoreHome ?? '-'} - {match.scoreAway ?? '-'}
                                                    </div>
                                                )}
                                                
                                                {match.status === 'live' && (
                                                    <span className="text-[10px] text-red-500 font-bold uppercase mt-0.5 animate-pulse">En Vivo 🔴</span>
                                                )}
                                                {match.status === 'finished' && (
                                                    <span className="text-[10px] text-slate-500 uppercase mt-0.5">Final</span>
                                                )}
                                                {match.status === 'scheduled' && (
                                                    <span className="text-[10px] text-slate-500 uppercase mt-0.5">Programado</span>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* Away Team */}
                                    <div className="flex-1 flex items-center justify-start gap-2 text-left">
                                        <TeamLogo teamName={match.awayTeam} className="h-6 w-6 sm:h-8 sm:w-8" />
                                        <span className={`font-semibold ${match.scoreAway !== '' && (match.scoreAway || 0) > (match.scoreHome || 0) ? 'text-white' : 'text-slate-300'} text-sm sm:text-base hidden sm:block`}>
                                            {match.awayTeam}
                                        </span>
                                        <span className="sm:hidden font-bold text-white text-xs">{match.awayTeam.substring(0,3).toUpperCase()}</span>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="text-center text-slate-500 text-xs py-8">
                    Datos provistos por Cesto Tracker - Actualizado hace un instante
                </div>
            </div>
        </div>
    );
};

export default FixtureView;
