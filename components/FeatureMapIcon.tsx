import React from 'react';

const FeatureMapIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-7 w-7"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.452-2.452L14.25 6l1.036-.259a3.375 3.375 0 002.452-2.452L18 2.25l.259 1.035a3.375 3.375 0 002.452 2.452L21.75 6l-1.035.259a3.375 3.375 0 00-2.452 2.452zM16.5 13.5h-1.5V12h1.5v1.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.5h3v.75a3 3 0 01-3 3h-1.5a3 3 0 01-3-3v-.75h3v.75a1.5 1.5 0 001.5 1.5h1.5a1.5 1.5 0 001.5-1.5v-.75z" />
    </svg>
);

export default FeatureMapIcon;
