import React from 'react';
import ShieldIcon from './ShieldIcon';

interface TeamLogoProps {
    teamName: string;
    className?: string;
    fallbackClassName?: string;
}

// --- SVG LOGO DEFINITIONS ---

// Base Shield Path for consistent shape
const ShieldShape = ({ children, fill = "white" }: { children?: React.ReactNode, fill?: string }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <clipPath id="shieldClip">
                <path d="M50 0 C95 0 100 25 100 45 C100 80 50 100 50 100 C50 100 0 80 0 45 C0 25 5 0 50 0 Z" />
            </clipPath>
        </defs>
        <g clipPath="url(#shieldClip)">
            <rect width="100" height="100" fill={fill} />
            {children}
            {/* Shield Border/Gloss */}
            <path d="M50 0 C95 0 100 25 100 45 C100 80 50 100 50 100 C50 100 0 80 0 45 C0 25 5 0 50 0 Z" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="2" />
            <path d="M50 0 C95 0 100 25 100 45 C100 80 50 100 50 100 C50 100 0 80 0 45 C0 25 5 0 50 0 Z" fill="url(#gloss)" style={{ mixBlendMode: 'overlay', opacity: 0.3 }} />
        </g>
        <defs>
            <linearGradient id="gloss" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                <stop offset="50%" stopColor="white" stopOpacity="0" />
            </linearGradient>
        </defs>
    </svg>
);

const Logos: Record<string, React.FC> = {
    "Vélez": () => (
        <ShieldShape fill="white">
            <path d="M0 0 L35 0 L50 65 L65 0 L100 0 L50 100 Z" fill="#003399" />
        </ShieldShape>
    ),
    "Ciudad": () => (
        <ShieldShape fill="#0EA5E9"> {/* Light Blue */}
            <rect y="33" width="100" height="34" fill="white" />
            <rect y="45" width="100" height="10" fill="#0EA5E9" />
        </ShieldShape>
    ),
    "Ballester": () => (
        <ShieldShape fill="#171717"> {/* Black */}
            <rect x="33" width="34" height="100" fill="white" />
            <rect x="45" width="10" height="100" fill="#171717" />
        </ShieldShape>
    ),
    "APV": () => (
        <ShieldShape fill="#0EA5E9"> {/* Celeste (same as Ciudad) */}
            <rect x="33" width="34" height="100" fill="white" />
            <rect x="67" width="33" height="100" fill="#FACC15" /> {/* Yellow */}
        </ShieldShape>
    ),
    "SITAS": () => (
        <ShieldShape fill="white">
            <rect width="33" height="100" fill="#16A34A" /> {/* Green */}
            <rect x="67" width="33" height="100" fill="#DC2626" /> {/* Red */}
            <text x="50" y="30" fontSize="20" textAnchor="middle" fill="#333" fontWeight="bold">S</text>
        </ShieldShape>
    ),
    "GEVP": () => (
        <ShieldShape fill="#0EA5E9"> {/* Light Blue */}
            <path d="M0 0 L100 100" stroke="white" strokeWidth="25" />
        </ShieldShape>
    ),
    "Hacoaj": () => (
        <ShieldShape fill="#1E3A8A"> {/* Navy Blue */}
            <circle cx="50" cy="40" r="15" stroke="white" strokeWidth="6" fill="none" />
            <path d="M50 55 V85 M35 70 H65" stroke="white" strokeWidth="6" strokeLinecap="round"/>
            <path d="M0 60 Q25 50 50 60 T100 60 V100 H0 Z" fill="white" />
            <path d="M0 70 Q25 60 50 70 T100 70 V100 H0 Z" fill="#3B82F6" />
        </ShieldShape>
    ),
    "Social Parque": () => (
        <ShieldShape fill="#15803d"> {/* Green (Top) */}
            <rect x="0" y="30" width="100" height="40" fill="white" />
            <rect x="0" y="70" width="100" height="30" fill="#DC2626" /> {/* Red (Bottom) */}
            <text x="50" y="58" fontSize="18" textAnchor="middle" fill="black" fontWeight="bold">PARQUE</text>
        </ShieldShape>
    ),
    "Avellaneda": () => (
        <ShieldShape fill="#16A34A"> {/* Green Left */}
             <rect x="50" width="50" height="100" fill="#38BDF8" /> {/* Celeste Right */}
        </ShieldShape>
    ),
    "CEF": () => (
        <ShieldShape fill="#F59E0B"> {/* Amber */}
            <circle cx="50" cy="50" r="30" fill="none" stroke="white" strokeWidth="8" />
            <text x="50" y="58" fontSize="25" textAnchor="middle" fill="white" fontWeight="bold">CEF</text>
        </ShieldShape>
    )
};

const TeamLogo: React.FC<TeamLogoProps> = ({ teamName, className = "h-12 w-12", fallbackClassName }) => {
    // Normalize string slightly for matching (case insensitive, trim)
    const normalizedName = Object.keys(Logos).find(key => key.toLowerCase() === teamName.trim().toLowerCase());
    
    const LogoComponent = normalizedName ? Logos[normalizedName] : null;

    if (LogoComponent) {
        return (
            <div className={`${className} flex items-center justify-center drop-shadow-md transition-transform hover:scale-105`}>
                <LogoComponent />
            </div>
        );
    }

    // Generic Fallback
    return (
        <div className={`${className} flex items-center justify-center bg-slate-700/50 rounded-full ${fallbackClassName} border-2 border-slate-600`}>
            <ShieldIcon className="h-3/5 w-3/5 text-slate-400" />
        </div>
    );
};

export default TeamLogo;
