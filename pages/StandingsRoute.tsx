
import React from 'react';
import { useNavigate } from 'react-router-dom';
import StandingsView from '../components/StandingsView';

export default function StandingsRoute() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
            {/* Top nav bar — identical pattern to FixtureRoute */}
            <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 px-4 py-3 flex items-center gap-3">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm font-semibold"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver
                </button>
                <span className="text-slate-700">|</span>
                <span className="text-white font-black text-sm tracking-widest uppercase">🏐 Cesto Tracker</span>
                <span className="ml-auto text-[10px] text-slate-600 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    Tabla de Posiciones
                </span>
            </div>

            <div className="max-w-3xl mx-auto px-4 pb-8">
                <StandingsView />
            </div>
        </div>
    );
}
