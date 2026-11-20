import React from 'react';
import { ArrowRight, CalendarCheck, IndianRupee, Megaphone, UserPlus } from 'lucide-react';
import {
  AttendanceRecord,
  FeeReceipt,
  NavSection,
  SchoolClass,
  SchoolNotice,
  SchoolSettings,
  StaffMember,
  Student,
} from '../types/school';
import { computeDashboardMetrics, formatINR } from '../utils/schoolLogic';
import { TODAY_ISO } from '../data/seedData';

interface DashboardViewProps {
  settings: SchoolSettings;
  students: Student[];
  staff: StaffMember[];
  receipts: FeeReceipt[];
  attendance: AttendanceRecord[];
  notices: SchoolNotice[];
  onNavigate: (section: NavSection) => void;
  onQuickAction: (action: 'new-admission' | 'collect-fee' | 'mark-attendance' | 'new-notice') => void;
  onSelectClassFilter: (cls: SchoolClass) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  settings,
  students,
  staff,
  receipts,
  attendance,
  notices,
  onNavigate,
  onQuickAction,
  onSelectClassFilter,
}) => {
  const metrics = computeDashboardMetrics(
    students,
    staff,
    receipts,
    attendance,
    settings.feeStructure,
    TODAY_ISO
  );

  const recentReceipts = [...receipts]
    .sort((a, b) => b.date.localeCompare(a.date) || b.receiptNo.localeCompare(a.receiptNo))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#0F5132] dark:text-emerald-400">
            Session {settings.academicSession} · {settings.board}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
            Assalamu Alaikum, {settings.principalName}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {settings.schoolName} · {settings.address}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onQuickAction('new-admission')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F5132] hover:bg-[#0B3D26] text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            <span>New Admission</span>
          </button>
          <button
            type="button"
            onClick={() => onQuickAction('collect-fee')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <IndianRupee className="w-4 h-4" aria-hidden="true" />
            <span>Collect Fee</span>
          </button>
          <button
            type="button"
            onClick={() => onQuickAction('mark-attendance')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <CalendarCheck className="w-4 h-4" aria-hidden="true" />
            <span>Attendance</span>
          </button>
          <button
            type="button"
            onClick={() => onQuickAction('new-notice')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Megaphone className="w-4 h-4" aria-hidden="true" />
            <span>Post Notice</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Students</p>
          <p className="mt-2 text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {metrics.activeStudents}
          </p>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            11 classes · Capacity {settings.studentCapacity}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Fees Collected</p>
          <p className="mt-2 text-3xl font-bold font-mono tabular-nums text-[#0F5132] dark:text-emerald-400">
            {formatINR(metrics.totalCollected)}
          </p>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            {metrics.collectionRate}% collected · Due {formatINR(metrics.totalPending)}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Today&apos;s Attendance</p>
          <p className="mt-2 text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {metrics.todayAttendanceRate}%
          </p>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            {metrics.todayPresent} of {metrics.todayRecorded} marked today
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Staff Roster</p>
          <p className="mt-2 text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {metrics.teacherCount + metrics.supportStaffCount}
          </p>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            {metrics.teacherCount} teachers · {metrics.supportStaffCount} helper
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <section className="xl:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Class-Wise Strength &amp; Fee Dues
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Single section per grade from Nursery to Class 8
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('students')}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#0F5132] dark:text-emerald-400 hover:underline cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>All Students</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40">
                  <th className="py-2.5 px-5">Class</th>
                  <th className="py-2.5 px-4 text-right">Students</th>
                  <th className="py-2.5 px-4 text-right">Monthly Fee</th>
                  <th className="py-2.5 px-4 text-right">Pending Dues</th>
                  <th className="py-2.5 px-5 text-right">Directory</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {metrics.classCounts.map((row) => (
                  <tr
                    key={row.className}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-2.5 px-5 font-medium text-slate-900 dark:text-slate-100">
                      {row.className}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {row.count}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      {formatINR(settings.feeStructure[row.className].monthlyTuition)}
                    </td>
                    <td
                      className={`py-2.5 px-4 text-right font-mono tabular-nums font-medium ${
                        row.pendingAmount > 0
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {row.pendingAmount > 0 ? formatINR(row.pendingAmount) : 'Cleared'}
                    </td>
                    <td className="py-2.5 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectClassFilter(row.className)}
                        className="text-xs font-medium text-[#0F5132] dark:text-emerald-400 hover:underline cursor-pointer whitespace-nowrap"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="xl:col-span-5 space-y-6">
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Recent Fee Receipts
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Latest office transactions
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('fees')}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#0F5132] dark:text-emerald-400 hover:underline cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Fee Register</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentReceipts.length === 0 ? (
                <p className="p-5 text-sm text-slate-500 dark:text-slate-400">
                  No fee receipts recorded yet.
                </p>
              ) : (
                recentReceipts.map((rcp) => (
                  <div
                    key={rcp.id}
                    className="px-5 py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {rcp.studentName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {rcp.className} · {rcp.receiptNo} · {rcp.paymentMode}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                        {formatINR(rcp.amount)}
                      </p>
                      <p className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        {rcp.date}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Notice Board
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Latest circulars issued by Principal
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('notices')}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#0F5132] dark:text-emerald-400 hover:underline cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {notices.slice(0, 3).map((notice) => (
                <div key={notice.id} className="px-5 py-3.5">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {notice.category} · {notice.audience} · {notice.date}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {notice.title}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};