import React from 'react';

interface AdminStatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    colorClass: string; // e.g. 'text-brand'
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({ title, value, icon, colorClass }) => {
    return (
        <div className="bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-surface-elevated border border-border-strong flex items-center justify-center shrink-0 ${colorClass}`}>
                {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: `h-6 w-6 ${colorClass}` })}
            </div>
            <div className="min-w-0">
                <p className="text-ink-muted text-xs font-bold uppercase tracking-wider">{title}</p>
                <p className="text-2xl sm:text-3xl font-black text-ink-primary tabular-nums mt-0.5">{value}</p>
            </div>
        </div>
    );
};
