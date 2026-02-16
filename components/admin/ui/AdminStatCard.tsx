
import React from 'react';

interface AdminStatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    colorClass: string; // e.g. 'text-purple-400'
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({ title, value, icon, colorClass }) => {
    // Generate background color based on text color (heuristic: replace 'text-' with 'bg-')
    // Fallback if custom class format
    const bgClass = colorClass.replace('text-', 'bg-');

    return (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex items-center gap-4">
            <div className={`p-4 rounded-full bg-opacity-20 ${bgClass} ${colorClass}`}>
                {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: `h-8 w-8 ${colorClass}` })}
            </div>
            <div>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">{title}</p>
                <p className="text-3xl font-extrabold text-white">{value}</p>
            </div>
        </div>
    );
};
