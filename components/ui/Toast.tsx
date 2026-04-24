
import React, { useEffect, useState } from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
}

const Toast: React.FC<ToastProps> = ({ message, type }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => setIsVisible(false), 2700);
        return () => clearTimeout(timer);
    }, []);

    const bgColor = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-red-600' : 'bg-cyan-600';

    return (
        <div className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className={`${bgColor} text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/20 backdrop-blur-md`}>
                {type === 'success' && <span>✅</span>}
                {type === 'error' && <span>⚠️</span>}
                {type === 'info' && <span>ℹ️</span>}
                <span className="font-bold text-sm sm:text-base whitespace-nowrap">{message}</span>
            </div>
        </div>
    );
};

export default Toast;
