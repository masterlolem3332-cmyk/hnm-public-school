import React, { useEffect, useState } from 'react';
import { SchoolSettings } from '../types/school';
import { SchoolLogo } from './SchoolLogo';

interface SplashScreenProps {
  settings: SchoolSettings;
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ settings, onComplete }) => {
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    const t1 = window.setTimeout(() => setProgress(58), 260);
    const t2 = window.setTimeout(() => setProgress(100), 740);
    const t3 = window.setTimeout(() => onComplete(), 1100);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-slate-950 px-6"
      role="status"
      aria-live="polite"
      aria-label={`Loading ${settings.schoolName}`}
    >
      <div className="flex flex-col items-center text-center max-w-md w-full">
        <SchoolLogo
          customLogoDataUrl={settings.customLogoDataUrl}
          schoolName={settings.schoolName}
          size="xl"
          className="mb-6"
        />
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {settings.schoolName}
        </h1>
        <p className="mt-1 text-xs font-semibold tracking-wide text-[#0F5132] dark:text-emerald-400">
          Hafiz Nazair-ul-Islam Memorial Public School
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {settings.board} · {settings.address}
        </p>

        <div className="mt-8 w-56 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-[#0F5132] dark:bg-emerald-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Opening Principal Workspace · Session {settings.academicSession}
        </p>
      </div>
    </div>
  );
};