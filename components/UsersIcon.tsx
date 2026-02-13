
import React from 'react';

const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.08.051c-.569.312-1.182.534-1.817.66a6.719 6.719 0 00-4.978 0 8.74 8.74 0 01-7.375-.714zM22.5 19.125a7.125 7.125 0 01-14.25 0v.003l.08.051c.569.312 1.182.534 1.817.66a6.719 6.719 0 004.978 0 8.74 8.74 0 017.375-.714z" />
    </svg>
);

export default UsersIcon;
