import React, { useState } from 'react';
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { SchoolSettings } from '../types/school';
import { SchoolLogo } from './SchoolLogo';

interface LoginScreenProps {
  settings: SchoolSettings;
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ settings, onLoginSuccess }) => {
  const [email, setEmail] = useState(settings.adminEmail);
  const [password, setPassword] = useState(settings.adminPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const expectedEmail = settings.adminEmail.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Enter both Admin ID and password to continue.');
      return;
    }
    if (cleanEmail !== expectedEmail || password !== settings.adminPassword) {
      setError('Incorrect Principal credentials. Check your ID or password.');
      return;
    }
    setError('');
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row">
      <div className="lg:w-5/12 bg-[#0F5132] text-white p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3.5">
            <SchoolLogo
              customLogoDataUrl={settings.customLogoDataUrl}
              schoolName={settings.schoolName}
              size="md"
              className="ring-2 ring-white/30"
            />
            <div>
              <p className="text-lg font-bold tracking-tight text-white">{settings.schoolName}</p>
              <p className="text-xs text-emerald-100/90">
                Hafiz Nazair-ul-Islam Memorial Public School
              </p>
              <p className="text-[11px] text-emerald-100/75">{settings.board}</p>
            </div>
          </div>

          <div className="mt-12 lg:mt-16 max-w-md">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Complete School Administration Portal
            </h1>
            <p className="mt-4 text-sm sm:text-base text-emerald-50/85 leading-relaxed">
              Manage Nursery to Class 8 admissions, fee receipts, daily attendance, teaching staff payroll, CBSE report cards, and school notices from your laptop or phone.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/15 text-xs text-emerald-100/80 space-y-1">
          <p className="font-medium text-white">Principal: {settings.principalName}</p>
          <p>{settings.address}</p>
          <p>Academic Session {settings.academicSession}</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-7 sm:p-9">
          <div className="flex items-center gap-2 text-xs font-medium text-[#0F5132] dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Principal &amp; Admin Access Only</span>
          </div>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            Sign in to School ERP
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Welcome back, {settings.principalName}. Enter your administrator credentials.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Principal Login ID
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0F5132] focus:border-[#0F5132]"
                placeholder="principal@hnmpublicschool.in"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full pl-3.5 pr-11 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0F5132] focus:border-[#0F5132]"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-md"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3.5 py-2.5"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#0F5132] hover:bg-[#0B3D26] text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Lock className="w-4 h-4" aria-hidden="true" />
              <span>Sign In as Principal</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p className="font-medium text-slate-700 dark:text-slate-300">Demo Credentials (Editable in Settings)</p>
            <p className="font-mono">ID: {settings.adminEmail}</p>
            <p className="font-mono">Password: {settings.adminPassword}</p>
          </div>
        </div>
      </div>
    </div>
  );
};