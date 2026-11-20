import React, { useRef, useState } from 'react';
import { Download, Moon, RotateCcw, Save, Shield, Sun, Upload } from 'lucide-react';
import {
  ClassFeeConfig,
  SCHOOL_CLASSES,
  SchoolClass,
  SchoolDatabase,
  SchoolSettings,
} from '../types/school';
import { SchoolLogo } from './SchoolLogo';

interface SettingsViewProps {
  database: SchoolDatabase;
  onUpdateSettings: (next: SchoolSettings) => void;
  onImportDatabase: (nextDb: SchoolDatabase) => void;
  onResetDemoData: () => void;
}

type SettingsTab = 'profile' | 'fees' | 'security' | 'backup';

export const SettingsView: React.FC<SettingsViewProps> = ({
  database,
  onUpdateSettings,
  onImportDatabase,
  onResetDemoData,
}) => {
  const { settings } = database;
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [draft, setDraft] = useState<SchoolSettings>(settings);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const notifySaved = (msg: string) => {
    setErrorMessage('');
    setStatusMessage(msg);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.schoolName.trim() || !draft.principalName.trim() || !draft.address.trim()) {
      setErrorMessage('School name, Principal name, and address are required.');
      return;
    }
    onUpdateSettings(draft);
    notifySaved('School profile and branding updated successfully.');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_500_000) {
      setErrorMessage('Please choose a logo image smaller than 1.5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : null;
      if (dataUrl) {
        const updated = { ...draft, customLogoDataUrl: dataUrl };
        setDraft(updated);
        onUpdateSettings(updated);
        notifySaved('Custom school logo uploaded and applied across portal and printouts.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFeeChange = (
    cls: SchoolClass,
    field: keyof ClassFeeConfig,
    value: string
  ) => {
    const num = Math.max(0, Number(value) || 0);
    setDraft((prev) => ({
      ...prev,
      feeStructure: {
        ...prev.feeStructure,
        [cls]: {
          ...prev.feeStructure[cls],
          [field]: num,
        },
      },
    }));
  };

  const handleSaveFees = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(draft);
    notifySaved('Class-wise fee structure saved and synced with Fee Ledger.');
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.adminEmail.trim() || draft.adminPassword.length < 4) {
      setErrorMessage('Enter a valid Principal ID and a password of at least 4 characters.');
      return;
    }
    onUpdateSettings(draft);
    notifySaved('Principal login credentials and preferences updated.');
  };

  const handleExportBackup = () => {
    const json = JSON.stringify(database, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HNM-Public-School-Backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    notifySaved('Full school backup (.json) downloaded.');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as SchoolDatabase;
        if (!parsed.settings || !Array.isArray(parsed.students) || !Array.isArray(parsed.staff)) {
          throw new Error('Invalid backup format');
        }
        onImportDatabase(parsed);
        notifySaved('School records restored from backup file.');
      } catch {
        setErrorMessage('Could not restore backup. Please choose a valid HNM School JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          School Settings &amp; Control Center
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Configure school identity, custom logo, class fee structure, Principal security, and device backup
        </p>
      </div>

      {/* Settings Sub-Navigation Tabs */}
      <div
        className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg"
        role="tablist"
        aria-label="Settings sections"
      >
        {(
          [
            { id: 'profile', label: 'School Profile & Logo' },
            { id: 'fees', label: 'Class Fee Structure' },
            { id: 'security', label: 'Security & Appearance' },
            { id: 'backup', label: 'Backup & Portability' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={activeTab === t.id}
            onClick={() => {
              setActiveTab(t.id);
              setStatusMessage('');
              setErrorMessage('');
            }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === t.id
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {statusMessage && (
        <div
          role="status"
          className="px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-sm font-medium text-emerald-800 dark:text-emerald-300"
        >
          {statusMessage}
        </div>
      )}
      {errorMessage && (
        <div
          role="alert"
          className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-sm font-medium text-red-700 dark:text-red-400"
        >
          {errorMessage}
        </div>
      )}

      {/* TAB 1: School Profile & Logo */}
      {activeTab === 'profile' && (
        <form
          onSubmit={handleSaveProfile}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6"
        >
          {/* Logo Uploader */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-slate-200 dark:border-slate-800">
            <SchoolLogo
              customLogoDataUrl={draft.customLogoDataUrl}
              schoolName={draft.schoolName}
              size="lg"
            />
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                School Crest / Official Logo
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Displayed on the launch loading screen, sidebar, fee receipts, student ID cards, and CBSE report cards.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  aria-label="Upload custom school logo"
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Upload School Logo</span>
                </button>
                {draft.customLogoDataUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...draft, customLogoDataUrl: null };
                      setDraft(updated);
                      onUpdateSettings(updated);
                      notifySaved('Reverted to default HNM crest.');
                    }}
                    className="px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                  >
                    Use Default Crest
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="set-name" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                School Name
              </label>
              <input
                id="set-name"
                type="text"
                value={draft.schoolName}
                onChange={(e) => setDraft({ ...draft, schoolName: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label htmlFor="set-board" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Board / Curriculum
              </label>
              <input
                id="set-board"
                type="text"
                value={draft.board}
                onChange={(e) => setDraft({ ...draft, board: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label htmlFor="set-principal" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Principal Name
              </label>
              <input
                id="set-principal"
                type="text"
                value={draft.principalName}
                onChange={(e) => setDraft({ ...draft, principalName: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label htmlFor="set-session" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Academic Session
              </label>
              <input
                id="set-session"
                type="text"
                value={draft.academicSession}
                onChange={(e) => setDraft({ ...draft, academicSession: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label htmlFor="set-phone" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Office Contact Number
              </label>
              <input
                id="set-phone"
                type="text"
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label htmlFor="set-capacity" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Campus Student Capacity
              </label>
              <input
                id="set-capacity"
                type="number"
                value={draft.studentCapacity}
                onChange={(e) => setDraft({ ...draft, studentCapacity: Number(e.target.value) || 500 })}
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="set-address" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                School Full Address
              </label>
              <input
                id="set-address"
                type="text"
                value={draft.address}
                onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F5132] hover:bg-[#0B3D26] text-white text-sm font-semibold cursor-pointer"
            >
              <Save className="w-4 h-4" aria-hidden="true" />
              <span>Save School Profile</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Class Fee Structure */}
      {activeTab === 'fees' && (
        <form
          onSubmit={handleSaveFees}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Class-Wise Tuition &amp; Annual Fee Schedule (INR)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Single section per grade (Nursery to Class 8)
              </p>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F5132] hover:bg-[#0B3D26] text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
            >
              <Save className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Save Fee Schedule</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40">
                  <th className="py-3 px-6">Class</th>
                  <th className="py-3 px-4">Monthly Tuition (₹)</th>
                  <th className="py-3 px-6">Annual Charges (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {SCHOOL_CLASSES.map((cls) => (
                  <tr key={cls}>
                    <td className="py-2.5 px-6 font-medium text-slate-900 dark:text-slate-100">
                      {cls}
                    </td>
                    <td className="py-2.5 px-4">
                      <input
                        type="number"
                        min="0"
                        aria-label={`${cls} monthly tuition`}
                        value={draft.feeStructure[cls].monthlyTuition}
                        onChange={(e) => handleFeeChange(cls, 'monthlyTuition', e.target.value)}
                        className="w-32 px-3 py-1.5 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                      />
                    </td>
                    <td className="py-2.5 px-6">
                      <input
                        type="number"
                        min="0"
                        aria-label={`${cls} annual charges`}
                        value={draft.feeStructure[cls].annualCharges}
                        onChange={(e) => handleFeeChange(cls, 'annualCharges', e.target.value)}
                        className="w-32 px-3 py-1.5 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </form>
      )}

      {/* TAB 3: Security & Appearance */}
      {activeTab === 'security' && (
        <form
          onSubmit={handleSaveSecurity}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <Shield className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" aria-hidden="true" />
              <span>Principal Login Account</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="sec-email" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Admin Login ID
                </label>
                <input
                  id="sec-email"
                  type="email"
                  value={draft.adminEmail}
                  onChange={(e) => setDraft({ ...draft, adminEmail: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label htmlFor="sec-pass" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Admin Password
                </label>
                <input
                  id="sec-pass"
                  type="text"
                  value={draft.adminPassword}
                  onChange={(e) => setDraft({ ...draft, adminPassword: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Display &amp; Launch Preferences
            </h3>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Show School Logo Loading Screen on Launch
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Displays HNM Public School crest whenever the software is opened
                </p>
              </div>
              <input
                type="checkbox"
                aria-label="Show school logo loading screen on launch"
                checked={draft.showSplashOnLaunch}
                onChange={(e) => setDraft({ ...draft, showSplashOnLaunch: e.target.checked })}
                className="w-5 h-5 accent-[#0F5132] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Interface Theme
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Switch between crisp daylight mode and low-glare dark mode
                </p>
              </div>
              <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...draft, theme: 'light' as const };
                    setDraft(updated);
                    onUpdateSettings(updated);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
                    draft.theme === 'light'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...draft, theme: 'dark' as const };
                    setDraft(updated);
                    onUpdateSettings(updated);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
                    draft.theme === 'dark'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Dark</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F5132] hover:bg-[#0B3D26] text-white text-sm font-semibold cursor-pointer"
            >
              <Save className="w-4 h-4" aria-hidden="true" />
              <span>Save Security Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: Data Backup & Portability */}
      {activeTab === 'backup' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Device Portability &amp; Disaster Recovery
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Export all students, fee receipts, attendance logs, staff records, and exam marks as a single backup file. If you switch laptops, desktops, or phones, restore the file in one click.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportBackup}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F5132] hover:bg-[#0B3D26] text-white text-sm font-semibold cursor-pointer"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>Download Full Backup (.json)</span>
            </button>

            <input
              ref={backupInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportBackup}
              className="hidden"
              aria-label="Restore backup JSON file"
            />
            <button
              type="button"
              onClick={() => backupInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm font-medium cursor-pointer"
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              <span>Restore from Backup</span>
            </button>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Reset Demo Records
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Restores the original HNM Public School sample dataset (44 students, 15 teachers + 1 helper).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-red-300 dark:border-red-900 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {confirmReset && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-demo-title"
        >
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <h2 id="reset-demo-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
              Reset All School Records?
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              This will replace current changes with the default HNM Public School demo records.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetDemoData();
                  setConfirmReset(false);
                  notifySaved('Demo database reset to initial state.');
                }}
                className="px-3.5 py-2 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};