
import React, { useEffect, useState } from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

const Toast: React.FC<ToastProps> = ({ message, type }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => setIsVisible(false), 2700);
        return () => clearTimeout(timer);
    }, [message, type]);

    const bgColor =
        type === 'success'
            ? 'bg-emerald-600'
            : type === 'error'
                ? 'bg-red-600'
                : type === 'warning'
                    ? 'bg-amber-600'
                    : 'bg-cyan-600';

    return (
        <div
            role="status"
            aria-live="polite"
            className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[100] max-w-[calc(100vw-2rem)] w-max transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
            <div className={`${bgColor} text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-white/20 backdrop-blur-md`}>
                {type === 'success' && <span className="shrink-0">✅</span>}
                {(type === 'error' || type === 'warning') && <span className="shrink-0">⚠️</span>}
                {type === 'info' && <span className="shrink-0">ℹ️</span>}
                <span className="font-bold text-sm sm:text-base break-words leading-snug">{message}</span>
            </div>
        </div>
    );
};

export default Toast;
