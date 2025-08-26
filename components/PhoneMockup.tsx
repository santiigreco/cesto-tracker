import React from 'react';

const PhoneMockup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="relative mx-auto border-slate-700 bg-slate-700 border-[8px] rounded-[2.5rem] h-[380px] w-[210px] shadow-xl">
            <div className="absolute top-0 w-[100px] h-[22px] -translate-x-1/2 left-1/2 bg-slate-700 rounded-b-[1rem]"></div>
            <div className="rounded-[2rem] overflow-hidden w-full h-full bg-slate-900">
                {children}
            </div>
        </div>
    );
};

export default PhoneMockup;