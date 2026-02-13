
import React, { useState } from 'react';
import XIcon from './XIcon';
import TeamLogo from './TeamLogo';
import CalendarIcon from './CalendarIcon';

interface Match {
    id: string;
    tournament: string;
    date: string;
    time: string;
    homeTeam: string;
    awayTeam: string;
    scoreHome?: number;
    scoreAway?: number;
    status: 'scheduled' | 'live' | 'finished';
}

const mockMatches: Match[] = [
    { id: '1', tournament: 'Liga Nacional A', date: 'Hoy', time: '20:30', homeTeam: 'Ciudad', awayTeam: 'Vélez', status: 'scheduled' },
    { id: '2', tournament: 'Liga Nacional A', date: 'Hoy', time: '21:00', homeTeam: 'Ballester', awayTeam: 'GEVP', status: 'scheduled' },
    { id: '3', tournament: 'Torneo Apertura', date: 'Mañana', time: '19:00', homeTeam: 'SITAS', awayTeam: 'Social Parque', status: 'scheduled' },
    { id: '4', tournament: 'Torneo Apertura', date: 'Mañana', time: '20:30', homeTeam: 'Hacoaj', awayTeam: 'Avellaneda', status: 'scheduled' },
    { id: '5', tournament: 'Amistoso', date: 'Ayer', time: 'Final', homeTeam: 'CEF', awayTeam: 'APV', scoreHome: 86, scoreAway: 92, status: 'finished' },
];

interface FixtureViewProps {
    isOpen: boolean;
    onClose: () => void;
    isAdmin: boolean;
}

const FixtureView: React.FC<FixtureViewProps> = ({ isOpen, onClose, isAdmin }) => {
    if (!isOpen) return null;

    // Group matches by Tournament and Date
    const groupedMatches = mockMatches.reduce((acc, match) => {
        const key = `${match.tournament} - ${match.date}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(match);
        return acc;
    }, {} as Record<string, Match[]>);

    return (
        <div className="fixed inset-0 bg-slate-900 z-50 overflow-y-auto animate-fade-in flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-4 shadow-md flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    <CalendarIcon className="h-6 w-6 text-cyan-400" />
                    <h1 className="text-xl font-bold text-white tracking-wide">FIXTURE</h1>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 rounded-full bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600 transition-colors"
                >
                    <XIcon className="h-6 w-6" />
                </button>
            </div>

            {/* Content - Promiedos Style */}
            <div className="flex-grow p-2 sm:p-4 max-w-3xl mx-auto w-full space-y-6">
                
                {isAdmin && (
                    <div className="bg-yellow-900/20 border border-yellow-600/50 p-3 rounded-lg text-yellow-200 text-sm text-center mb-4">
                        🛠️ Estás viendo esto porque eres Administrador. (Edición próximamente)
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
                                <div key={match.id} className="flex items-center justify-between p-3 hover:bg-slate-800/50 transition-colors">
                                    
                                    {/* Home Team */}
                                    <div className="flex-1 flex items-center justify-end gap-2 text-right">
                                        <span className={`font-semibold ${match.scoreHome && match.scoreHome > (match.scoreAway || 0) ? 'text-white' : 'text-slate-300'} text-sm sm:text-base`}>
                                            {match.homeTeam}
                                        </span>
                                        <TeamLogo teamName={match.homeTeam} className="h-6 w-6 sm:h-8 sm:w-8" />
                                    </div>

                                    {/* Score / Time */}
                                    <div className="w-20 sm:w-24 text-center flex flex-col items-center justify-center bg-slate-800/80 rounded py-1 mx-2 sm:mx-4 border border-slate-700">
                                        {match.status === 'finished' ? (
                                            <div className="font-bold text-lg text-white font-mono leading-none">
                                                {match.scoreHome} - {match.scoreAway}
                                            </div>
                                        ) : (
                                            <span className="text-cyan-400 font-bold text-lg font-mono">{match.time}</span>
                                        )}
                                        <span className="text-[10px] text-slate-500 uppercase mt-0.5">{match.status === 'finished' ? 'Final' : ''}</span>
                                    </div>

                                    {/* Away Team */}
                                    <div className="flex-1 flex items-center justify-start gap-2 text-left">
                                        <TeamLogo teamName={match.awayTeam} className="h-6 w-6 sm:h-8 sm:w-8" />
                                        <span className={`font-semibold ${match.scoreAway && match.scoreAway > (match.scoreHome || 0) ? 'text-white' : 'text-slate-300'} text-sm sm:text-base`}>
                                            {match.awayTeam}
                                        </span>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="text-center text-slate-500 text-xs py-8">
                    Datos provistos por Cesto Tracker - Actualizado hace 5 min
                </div>
            </div>
        </div>
    );
};

export default FixtureView;
