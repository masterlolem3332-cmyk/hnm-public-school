import React, { useState } from 'react';

interface SchoolLogoProps {
  customLogoDataUrl?: string | null;
  schoolName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<SchoolLogoProps['size']>, string> = {
  sm: 'w-9 h-9',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
  xl: 'w-28 h-28',
};

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  customLogoDataUrl,
  schoolName = 'HNM Public School',
  size = 'md',
  className = '',
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const dims = SIZE_CLASSES[size];
  const logoSrc = customLogoDataUrl || '/logo.jpg';

  if (!imgFailed) {
    return (
      <div
        className={`${dims} rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-white flex items-center justify-center shrink-0 shadow-xs ${className}`}
      >
        <img
          src={logoSrc}
          alt={`${schoolName} official logo`}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-contain p-0.5"
        />
      </div>
    );
  }

  return (
    <div
      className={`${dims} rounded-full bg-[#0F5132] flex items-center justify-center shrink-0 ring-1 ring-[#D9A441]/40 shadow-xs ${className}`}
      aria-label={`${schoolName} crest`}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[82%] h-[82%]"
        role="img"
        aria-label={`${schoolName} emblem`}
      >
        <circle cx="32" cy="32" r="27" fill="#0B3D26" stroke="#E5B95C" strokeWidth="2.2" />
        <text
          x="32"
          y="36"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="13"
          fontWeight="700"
          fontFamily="Plus Jakarta Sans, sans-serif"
          letterSpacing="1.2"
        >
          HNM
        </text>
      </svg>
    </div>
  );
};