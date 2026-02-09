
import React, { useState, useEffect } from 'react';
import { getTeamLogo } from '../constants';
import ShieldIcon from './ShieldIcon';

interface TeamLogoProps {
    teamName: string;
    className?: string;
    fallbackClassName?: string;
}

const TeamLogo: React.FC<TeamLogoProps> = ({ teamName, className = "h-12 w-12", fallbackClassName }) => {
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const logoPath = getTeamLogo(teamName);
        if (logoPath) {
            setImgSrc(logoPath);
            setHasError(false);
        } else {
            setImgSrc(null);
        }
    }, [teamName]);

    if (imgSrc && !hasError) {
        return (
            <img 
                src={imgSrc} 
                alt={`Escudo de ${teamName}`} 
                className={`${className} object-contain`}
                onError={() => setHasError(true)}
            />
        );
    }

    return (
        <div className={`${className} flex items-center justify-center bg-slate-700/50 rounded-full ${fallbackClassName}`}>
            <ShieldIcon className="h-3/5 w-3/5 text-slate-400" />
        </div>
    );
};

export default TeamLogo;
