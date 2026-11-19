import React, { useId } from 'react';

type IconProps = { className?: string };

const BASE_SVG_PROPS = {
  xmlns: 'http://www.w3.org/2000/svg',
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
};

// --- BrandLogoMark ---
/** Vector cestoball mark aligned with public/favicon.svg using a unique gradient ID per instance. */
export const BrandLogoMark: React.FC<IconProps> = ({ className }) => {
  const uid = useId();
  const gradId = `ct-brand-grad-${uid}`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={className || 'h-7 w-7'}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="#111827" />
      <circle cx="32" cy="32" r="21" stroke={`url(#${gradId})`} strokeWidth="4" />
      <path d="M12 27.5C22 21.5 42 21.5 52 27.5" stroke={`url(#${gradId})`} strokeWidth="3" strokeLinecap="round" />
      <path d="M12 36.5C22 42.5 42 42.5 52 36.5" stroke={`url(#${gradId})`} strokeWidth="3" strokeLinecap="round" />
      <path d="M32 11V53" stroke={`url(#${gradId})`} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};

// --- AlertTriangleIcon ---
export const AlertTriangleIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

// --- ArrowLeftIcon ---
export const ArrowLeftIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </svg>
);

// --- ArrowRightIcon ---
export const ArrowRightIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M5 12h14" />
    <path d="M12 5l7 7-7 7" />
  </svg>
);

// --- AwardIcon ---
export const AwardIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

// --- BanIcon ---
export const BanIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <circle cx="12" cy="12" r="9" />
    <path d="M5.636 5.636l12.728 12.728" />
  </svg>
);

// --- BoltIcon ---
export const BoltIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
  </svg>
);

// --- CalendarIcon ---
export const CalendarIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-4 w-4'}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

// --- CameraIcon ---
export const CameraIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

// --- ChartBarIcon ---
export const ChartBarIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M18 20V10" />
    <path d="M12 20V4" />
    <path d="M6 20v-6" />
  </svg>
);

// --- ChartPieIcon ---
export const ChartPieIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M21.21 15.89A10 10 0 118 2.83" />
    <path d="M22 12A10 10 0 0012 2v10z" />
  </svg>
);

// --- CheckIcon ---
export const CheckIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

// --- CheckCircleIcon ---
export const CheckCircleIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

// --- ChevronDownIcon ---
export const ChevronDownIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

// --- ClipboardIcon ---
export const ClipboardIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
    <path d="M9 14l2 2 4-4" />
  </svg>
);

// --- ClockIcon ---
export const ClockIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

// --- CloudCheckIcon ---
export const CloudCheckIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M20 16.2A4.5 4.5 0 0017.5 8h-1.8A7 7 0 104 14.9" />
    <path d="M9 16l2.5 2.5L16 14" />
  </svg>
);

// --- CloudOffIcon ---
export const CloudOffIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M22.61 16.95A5 5 0 0018 10h-1.26a8 8 0 00-7.05-6M5 5a8 8 0 004 15h9a5 5 0 001.7-.3" />
    <path d="M2 2l20 20" />
  </svg>
);

// --- CloudUploadIcon ---
export const CloudUploadIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M4 14.9A7 7 0 1115.71 8h1.79a4.5 4.5 0 012.5 8.24" />
    <path d="M12 12v9" />
    <path d="M8 16l4-4 4 4" />
  </svg>
);

// --- CoffeeIcon ---
export const CoffeeIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M18 8h1a4 4 0 010 8h-1" />
    <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
    <path d="M6 2v3M10 2v3M14 2v3" />
  </svg>
);

// --- DownloadIcon ---
export const DownloadIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <path d="M7 10l5 5 5-5" />
    <path d="M12 15V3" />
  </svg>
);

// --- EyeIcon ---
export const EyeIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// --- EyeOffIcon ---
export const EyeOffIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M17.94 17.94A10.07 10.07 0 0112 19c-6.5 0-10-7-10-7a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 5c6.5 0 10 7 10 7a18.5 18.5 0 01-2.16 3.19" />
    <path d="M14.12 14.12a3 3 0 01-4.24-4.24" />
    <path d="M2 2l20 20" />
  </svg>
);

// --- Feature Icons (legacy compatibility) ---
export const FeatureChartIcon: React.FC<IconProps> = ({ className }) => (
  <ChartPieIcon className={className || 'h-7 w-7'} />
);

export const FeatureMapIcon: React.FC<IconProps> = ({ className }) => (
  <SparklesIcon className={className || 'h-7 w-7'} />
);

export const FeatureTapIcon: React.FC<IconProps> = ({ className }) => (
  <HandClickIcon className={className || 'h-7 w-7'} />
);

export const FeatureTrophyIcon: React.FC<IconProps> = ({ className }) => (
  <ChartBarIcon className={className || 'h-7 w-7'} />
);

// --- FlagIcon ---
export const FlagIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <path d="M4 22v-7" />
  </svg>
);

// --- FlameIcon ---
export const FlameIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M12 2c.5 3.5 3 5.5 4 8a5 5 0 01-4 8 5 5 0 01-5-5c0-2.5 1.5-4.5 2-6 .5 1.5 1.5 2 2.5 2C11 6.5 11.5 4 12 2z" />
  </svg>
);

// --- FolderIcon ---
export const FolderIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
  </svg>
);

// --- GearIcon ---
export const GearIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

// --- GitHubIcon ---
export const GitHubIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-6 w-6'} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

// --- GlobeIcon ---
export const GlobeIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3.6 9h16.8M3.6 15h16.8" />
    <path d="M12 3a13.5 13.5 0 010 18 13.5 13.5 0 010-18z" />
  </svg>
);

// --- GoogleIcon ---
export const GoogleIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-5 w-5'} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

// --- HamburgerIcon ---
export const HamburgerIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-6 w-6'}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

// --- HandClickIcon ---
export const HandClickIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-6 w-6'}>
    <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
    <path d="M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
  </svg>
);

// --- HeartIcon ---
export const HeartIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

// --- InfoCircleIcon ---
export const InfoCircleIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

// --- InstagramIcon ---
export const InstagramIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-5 w-5'} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.07 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.359 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.359-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.359-2.618-6.78-6.98-6.98C15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" />
  </svg>
);

// --- JerseySvgIcon ---
export const JerseySvgIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || 'h-6 w-6'} aria-hidden="true">
    <path d="M6,3 C7,2 17,2 18,3 L21,5 V8 H18 V21 H6 V8 H3 V5 Z" />
  </svg>
);

// --- JerseyIcon ---
export const JerseyIcon: React.FC<{
  number: string;
  name?: string;
  isSelected: boolean;
  onClick: (number: string) => void;
  disabled?: boolean;
  isBlinking?: boolean;
}> = React.memo(({ number, name, isSelected, onClick, disabled = false, isBlinking = false }) => {
  const jerseyColor = isSelected ? 'fill-cyan-500' : (disabled ? 'fill-slate-800' : 'fill-slate-700');
  const textColor = isSelected ? 'fill-white' : (disabled ? 'fill-slate-500' : 'fill-slate-200');
  const strokeColor = isSelected ? 'stroke-cyan-300' : (disabled ? 'stroke-slate-700' : 'stroke-slate-600');
  return (
    <button
      type="button"
      onClick={() => onClick(number)}
      disabled={disabled}
      className={`relative transition-transform duration-150 ease-in-out rounded-xl ${isBlinking ? 'ring-2 ring-amber-400' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 active:scale-95'}`}
      aria-pressed={isSelected}
      aria-label={`Seleccionar ${name || `Jugadora ${number}`}`}
      title={name || `Jugadora ${number}`}
    >
      <svg
        width="56"
        height="56"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-transform duration-150 ${isSelected ? 'scale-105' : ''}`}
      >
        <path
          d="M6,3 C7,2 17,2 18,3 L21,5 V8 H18 V21 H6 V8 H3 V5 Z"
          className={`transition-colors ${jerseyColor} ${strokeColor}`}
          strokeWidth="0.75"
        />
        <text
          x="12"
          y="14"
          textAnchor="middle"
          dominantBaseline="central"
          className={`transition-colors ${textColor} font-sans font-bold select-none`}
          fontSize="8.5"
        >
          {number}
        </text>
      </svg>
    </button>
  );
});

// --- LinkIcon ---
export const LinkIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
  </svg>
);

// --- LinkedInIcon ---
export const LinkedInIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-6 w-6'} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

// --- LockIcon ---
export const LockIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

// --- LogOutIcon ---
export const LogOutIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

// --- MapIcon ---
export const MapIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-6 w-6'}>
    <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
    <path d="M8 2v16M16 6v16" />
  </svg>
);

// --- MicIcon ---
export const MicIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <rect x="9" y="2" width="6" height="11" rx="3" />
    <path d="M19 10v1a7 7 0 01-14 0v-1" />
    <path d="M12 18v4M8 22h8" />
  </svg>
);

// --- PencilIcon ---
export const PencilIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

// --- PlusIcon ---
export const PlusIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

// --- QuestionMarkCircleIcon ---
export const QuestionMarkCircleIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-6 w-6'}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
);

// --- RedoIcon ---
export const RedoIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M21 7v6h-6" />
    <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3L21 13" />
  </svg>
);

// --- RefreshIcon ---
export const RefreshIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M23 4v6h-6" />
    <path d="M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
  </svg>
);

// --- SearchIcon ---
export const SearchIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

// --- ShareIcon ---
export const ShareIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
  </svg>
);

// --- ShieldIcon ---
export const ShieldIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

// --- SlidersIcon ---
export const SlidersIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
  </svg>
);

// --- SmartphoneIcon ---
export const SmartphoneIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <path d="M12 18h.01" />
  </svg>
);

// --- SnowflakeIcon ---
export const SnowflakeIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
  </svg>
);

// --- SparklesIcon ---
export const SparklesIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M12 3l1.9 5.8L20 10.7l-5.8 1.9L12 18.4l-1.9-5.8L4.3 10.7l5.8-1.9L12 3z" />
  </svg>
);

// --- SpinnerIcon ---
export const SpinnerIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={`animate-spin ${className || 'h-5 w-5'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

// --- StarIcon ---
export const StarIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

// --- SwitchIcon ---
export const SwitchIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

// --- TargetIcon ---
export const TargetIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" />
  </svg>
);

// --- TrashIcon ---
export const TrashIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

// --- TrophyIcon ---
export const TrophyIcon: React.FC<{ rank?: number; className?: string }> = ({ rank, className }) => {
  const rankColors: Record<number, string> = {
    1: 'text-amber-400',
    2: 'text-slate-300',
    3: 'text-amber-600',
  };
  const colorClass = rank ? rankColors[rank] || 'text-slate-400' : '';
  return (
    <svg {...BASE_SVG_PROPS} className={className || `h-5 w-5 ${colorClass}`}>
      <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0012 0V2z" />
    </svg>
  );
};

// --- TwitterIcon ---
export const TwitterIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-6 w-6'} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// --- UndoIcon ---
export const UndoIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
  </svg>
);

// --- UserIcon ---
export const UserIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// --- UsersIcon ---
export const UsersIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

// --- WhatsappIcon ---
export const WhatsappIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-6 w-6'} viewBox="0 0 24 24" fill="currentColor" role="img" aria-label="WhatsApp">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.52 3.48 1.45 4.93L2.2 22l5.3-1.38c1.38.84 2.95 1.28 4.54 1.28h.01c5.46 0 9.9-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zM9.81 16.3c-.23.41-.8.78-1.07.82-.26.04-.54.04-.81-.02-.34-.07-.71-.24-1.04-.46-.43-.28-.88-.66-1.28-1.11-.47-.53-.86-1.12-1.14-1.78-.28-.66-.42-1.36-.42-2.06s.15-1.41.42-2.07.64-1.25 1.11-1.76c.47-.52 1.03-.94 1.66-1.24.63-.3 1.3-.46 1.99-.46.33 0 .66.04.98.11.32.08.6.21.82.41s.4.45.51.74c.11.29.17.6.17.91 0 .04 0 .08-.01.12l-.23 1.08c-.04.18-.1.35-.18.52-.08.17-.19.32-.32.45l-.43.41c-.13.13-.26.26-.38.41-.12.15-.22.3-.3.45-.08.15-.12.3-.12.45s.03.29.08.43c.05.14.13.28.23.41.1.13.22.25.35.37.13.12.28.23.44.33s.33.19.51.26c.18.07.36.11.55.11.21 0 .42-.04.61-.13s.36-.21.5-.36.24-.33.32-.51.12-.37.15-.55l.03-.23c.02-.13.06-.25.13-.37s.16-.22.27-.3c.11-.08.24-.15.39-.2s.3-.08.47-.1c.17-.02.34-.02.5 0 .17.02.33.06.48.13s.28.16.4.27.21.25.28.4c.08.15.12.31.14.48l.01.03c.04.28.01.57-.08.85-.09.28-.24.54-.45.77z" />
  </svg>
);

// --- WifiOffIcon ---
export const WifiOffIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M1 1l22 22" />
    <path d="M16.72 11.06A10.94 10.94 0 0119 12.55" />
    <path d="M5 12.55a10.94 10.94 0 015.17-2.39" />
    <path d="M10.71 5.05A16 16 0 0122.58 9" />
    <path d="M1.42 9a15.91 15.91 0 014.7-2.88" />
    <path d="M8.53 16.11a6 6 0 016.95 0" />
    <path d="M12 20h.01" />
  </svg>
);

// --- WrenchIcon ---
export const WrenchIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
  </svg>
);

// --- XIcon ---
export const XIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...BASE_SVG_PROPS} className={className || 'h-5 w-5'}>
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);
