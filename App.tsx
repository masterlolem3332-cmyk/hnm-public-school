import React, { useEffect, useState } from 'react';
import {
  BookOpenCheck,
  CalendarCheck,
  GraduationCap,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Settings as SettingsIcon,
  Users,
  X,
} from 'lucide-react';
import {
  AttendanceRecord,
  ExamRecord,
  FeeReceipt,
  NavSection,
  SchoolClass,
  SchoolDatabase,
  SchoolNotice,
  SchoolSettings,
  StaffMember,
  Student,
} from './types/school';
import { createSeedDatabase } from './data/seedData';
import { SchoolLogo } from './components/SchoolLogo';
import { SplashScreen } from './components/SplashScreen';
import { LoginScreen } from './components/LoginScreen';
import { DashboardView } from './components/DashboardView';
import { StudentsView } from './components/StudentsView';
import { FeesView } from './components/FeesView';
import { AttendanceView } from './components/AttendanceView';
import { StaffView } from './components/StaffView';
import { ExamsView } from './components/ExamsView';
import { NoticesView } from './components/NoticesView';
import { SettingsView } from './components/SettingsView';

const STORAGE_KEY = 'hnm_public_school_erp_v1';
const AUTH_KEY = 'hnm_public_school_auth_v1';

interface NavItem {
  id: NavSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'students', label: 'Students', icon: GraduationCap },
  { id: 'fees', label: 'Fees & Accounts', icon: IndianRupee },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { id: 'staff', label: 'Teachers & Staff', icon: Users },
  { id: 'exams', label: 'Exams & Reports', icon: BookOpenCheck },
  { id: 'notices', label: 'Notices', icon: Megaphone },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

function loadInitialDatabase(): SchoolDatabase {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SchoolDatabase;
      if (parsed && parsed.settings && Array.isArray(parsed.students)) {
        return parsed;
      }
    }
  } catch {
    // Fallback to clean seed database
  }
  return createSeedDatabase();
}

export default function App() {
  const autostart =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  const [db, setDb] = useState<SchoolDatabase>(() => loadInitialDatabase());
  const [showSplash, setShowSplash] = useState<boolean>(
    () => !autostart && loadInitialDatabase().settings.showSplashOnLaunch
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (autostart) return true;
    try {
      return window.localStorage.getItem(AUTH_KEY) === '1';
    } catch {
      return false;
    }
  });

  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cross-view triggers for Dashboard quick actions
  const [studentClassFilter, setStudentClassFilter] = useState<SchoolClass | 'All'>('All');
  const [pendingQuickAction, setPendingQuickAction] = useState<
    'new-admission' | 'collect-fee' | 'new-notice' | null
  >(null);

  // Persist database changes
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {
      // Ignore quota errors gracefully
    }
  }, [db]);

  // Sync dark theme class on document root
  useEffect(() => {
    const root = document.documentElement;
    if (db.settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [db.settings.theme]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    try {
      window.localStorage.setItem(AUTH_KEY, '1');
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setMobileMenuOpen(false);
    try {
      window.localStorage.removeItem(AUTH_KEY);
    } catch {
      // ignore
    }
  };

  const handleNavigate = (section: NavSection) => {
    setPendingQuickAction(null);
    if (section === 'students') {
      setStudentClassFilter('All');
    }
    setActiveSection(section);
    setMobileMenuOpen(false);
  };

  const handleQuickAction = (
    action: 'new-admission' | 'collect-fee' | 'mark-attendance' | 'new-notice'
  ) => {
    if (action === 'new-admission') {
      setStudentClassFilter('All');
      setPendingQuickAction('new-admission');
      setActiveSection('students');
    } else if (action === 'collect-fee') {
      setPendingQuickAction('collect-fee');
      setActiveSection('fees');
    } else if (action === 'mark-attendance') {
      setPendingQuickAction(null);
      setActiveSection('attendance');
    } else if (action === 'new-notice') {
      setPendingQuickAction('new-notice');
      setActiveSection('notices');
    }
  };

  const handleSelectClassFromDashboard = (cls: SchoolClass) => {
    setPendingQuickAction(null);
    setStudentClassFilter(cls);
    setActiveSection('students');
  };

  // Database mutation handlers
  const handleAddStudent = (student: Student) => {
    setDb((prev) => ({ ...prev, students: [student, ...prev.students] }));
  };

  const handleUpdateStudent = (student: Student) => {
    setDb((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === student.id ? student : s)),
    }));
  };

  const handleDeleteStudent = (studentId: string) => {
    setDb((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== studentId),
    }));
  };

  const handleAddReceipt = (receipt: FeeReceipt) => {
    setDb((prev) => ({ ...prev, receipts: [receipt, ...prev.receipts] }));
  };

  const handleSaveAttendance = (record: AttendanceRecord) => {
    setDb((prev) => {
      const others = prev.attendance.filter(
        (a) => !(a.date === record.date && a.className === record.className)
      );
      return { ...prev, attendance: [...others, record] };
    });
  };

  const handleAddStaff = (member: StaffMember) => {
    setDb((prev) => ({ ...prev, staff: [...prev.staff, member] }));
  };

  const handleUpdateStaff = (member: StaffMember) => {
    setDb((prev) => ({
      ...prev,
      staff: prev.staff.map((m) => (m.id === member.id ? member : m)),
    }));
  };

  const handleToggleSalaryPaid = (staffId: string) => {
    setDb((prev) => ({
      ...prev,
      staff: prev.staff.map((m) =>
        m.id === staffId ? { ...m, salaryPaidThisMonth: !m.salaryPaidThisMonth } : m
      ),
    }));
  };

  const handleSaveExamRecord = (record: ExamRecord) => {
    setDb((prev) => {
      const others = prev.exams.filter(
        (e) => !(e.studentId === record.studentId && e.term === record.term)
      );
      return { ...prev, exams: [...others, record] };
    });
  };

  const handleAddNotice = (notice: SchoolNotice) => {
    setDb((prev) => ({ ...prev, notices: [notice, ...prev.notices] }));
  };

  const handleDeleteNotice = (noticeId: string) => {
    setDb((prev) => ({
      ...prev,
      notices: prev.notices.filter((n) => n.id !== noticeId),
    }));
  };

  const handleUpdateSettings = (settings: SchoolSettings) => {
    setDb((prev) => ({ ...prev, settings }));
  };

  const handleResetDemoData = () => {
    setDb(createSeedDatabase());
  };

  if (showSplash) {
    return <SplashScreen settings={db.settings} onComplete={() => setShowSplash(false)} />;
  }

  if (!isAuthenticated) {
    return <LoginScreen settings={db.settings} onLoginSuccess={handleLoginSuccess} />;
  }

  const activeNavLabel = NAV_ITEMS.find((item) => item.id === activeSection)?.label ?? 'Dashboard';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      {/* Desktop Sidebar */}
      <aside
        className="no-print hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800"
        aria-label="Primary sidebar navigation"
      >
        <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <SchoolLogo
            customLogoDataUrl={db.settings.customLogoDataUrl}
            schoolName={db.settings.schoolName}
            size="sm"
          />
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
              {db.settings.schoolName}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Sambhal · CBSE ERP
            </p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#0F5132] text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-600 dark:text-slate-400 mb-3">
            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
              {db.settings.principalName}
            </p>
            <p>Principal · Session {db.settings.academicSession}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Lock / Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="no-print fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <div
            className="fixed inset-0 bg-slate-950/50"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[82vw] bg-white dark:bg-slate-900 h-full flex flex-col border-r border-slate-200 dark:border-slate-800 z-10">
            <div className="h-14 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <SchoolLogo
                  customLogoDataUrl={db.settings.customLogoDataUrl}
                  schoolName={db.settings.schoolName}
                  size="sm"
                />
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {db.settings.schoolName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    aria-current={active ? 'page' : undefined}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#0F5132] text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>Lock / Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Context Header (Single-Row, Compact for Mobile & Desktop) */}
        <header className="no-print sticky top-0 z-30 h-14 lg:h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {db.settings.schoolName}
              </span>
              <span className="text-slate-400" aria-hidden="true">/</span>
              <span className="text-slate-600 dark:text-slate-400 truncate">
                {activeNavLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Principal: <strong className="text-slate-800 dark:text-slate-200">{db.settings.principalName}</strong>
            </span>
            <button
              type="button"
              onClick={() => handleNavigate('settings')}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
            >
              Settings
            </button>
          </div>
        </header>

        {/* Active Module Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeSection === 'dashboard' && (
            <DashboardView
              settings={db.settings}
              students={db.students}
              staff={db.staff}
              receipts={db.receipts}
              attendance={db.attendance}
              notices={db.notices}
              onNavigate={handleNavigate}
              onQuickAction={handleQuickAction}
              onSelectClassFilter={handleSelectClassFromDashboard}
            />
          )}

          {activeSection === 'students' && (
            <StudentsView
              settings={db.settings}
              students={db.students}
              initialClassFilter={studentClassFilter}
              autoOpenNewModal={pendingQuickAction === 'new-admission'}
              onAutoOpenConsumed={() => setPendingQuickAction(null)}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
            />
          )}

          {activeSection === 'fees' && (
            <FeesView
              settings={db.settings}
              students={db.students}
              receipts={db.receipts}
              autoOpenCollectModal={pendingQuickAction === 'collect-fee'}
              onAutoOpenConsumed={() => setPendingQuickAction(null)}
              onAddReceipt={handleAddReceipt}
            />
          )}

          {activeSection === 'attendance' && (
            <AttendanceView
              students={db.students}
              attendance={db.attendance}
              onSaveAttendance={handleSaveAttendance}
            />
          )}

          {activeSection === 'staff' && (
            <StaffView
              settings={db.settings}
              staff={db.staff}
              onAddStaff={handleAddStaff}
              onUpdateStaff={handleUpdateStaff}
              onToggleSalaryPaid={handleToggleSalaryPaid}
            />
          )}

          {activeSection === 'exams' && (
            <ExamsView
              settings={db.settings}
              students={db.students}
              exams={db.exams}
              onSaveExamRecord={handleSaveExamRecord}
            />
          )}

          {activeSection === 'notices' && (
            <NoticesView
              settings={db.settings}
              notices={db.notices}
              autoOpenNewModal={pendingQuickAction === 'new-notice'}
              onAutoOpenConsumed={() => setPendingQuickAction(null)}
              onAddNotice={handleAddNotice}
              onDeleteNotice={handleDeleteNotice}
            />
          )}

          {activeSection === 'settings' && (
            <SettingsView
              database={db}
              onUpdateSettings={handleUpdateSettings}
              onImportDatabase={(nextDb) => setDb(nextDb)}
              onResetDemoData={handleResetDemoData}
            />
          )}
        </main>
      </div>
    </div>
  );
}