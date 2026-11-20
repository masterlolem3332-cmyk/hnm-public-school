import React, { useEffect, useMemo, useState } from 'react';
import { Check, CheckCheck } from 'lucide-react';
import {
  AttendanceRecord,
  AttendanceStatus,
  SCHOOL_CLASSES,
  SchoolClass,
  Student,
} from '../types/school';
import { TODAY_ISO } from '../data/seedData';

interface AttendanceViewProps {
  students: Student[];
  attendance: AttendanceRecord[];
  onSaveAttendance: (record: AttendanceRecord) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  students,
  attendance,
  onSaveAttendance,
}) => {
  const [selectedClass, setSelectedClass] = useState<SchoolClass>('Class 8');
  const [selectedDate, setSelectedDate] = useState(TODAY_ISO);
  const [entries, setEntries] = useState<Record<string, AttendanceStatus>>({});
  const [savedMessage, setSavedMessage] = useState('');

  const classStudents = useMemo(
    () =>
      students
        .filter((s) => s.className === selectedClass && s.status === 'Active')
        .sort((a, b) => a.rollNo - b.rollNo),
    [students, selectedClass]
  );

  useEffect(() => {
    const existing = attendance.find(
      (a) => a.date === selectedDate && a.className === selectedClass
    );
    const next: Record<string, AttendanceStatus> = {};
    for (const stu of classStudents) {
      next[stu.id] = existing?.entries[stu.id] ?? 'Present';
    }
    setEntries(next);
  }, [attendance, selectedDate, selectedClass, classStudents]);

  useEffect(() => {
    setSavedMessage('');
  }, [selectedDate, selectedClass]);

  const counts = useMemo(() => {
    const vals = Object.values(entries);
    const present = vals.filter((v) => v === 'Present').length;
    const absent = vals.filter((v) => v === 'Absent').length;
    const leave = vals.filter((v) => v === 'Leave').length;
    const total = classStudents.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, leave, total, rate };
  }, [entries, classStudents.length]);

  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setEntries((prev) => ({ ...prev, [studentId]: status }));
    setSavedMessage('');
  };

  const handleMarkAllPresent = () => {
    const next: Record<string, AttendanceStatus> = {};
    for (const stu of classStudents) {
      next[stu.id] = 'Present';
    }
    setEntries(next);
    setSavedMessage('');
  };

  const handleSave = () => {
    onSaveAttendance({
      date: selectedDate,
      className: selectedClass,
      entries,
    });
    setSavedMessage(`Attendance saved for ${selectedClass} (${selectedDate}).`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Daily Attendance Register
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Mark class-wise student attendance from Nursery to Class 8
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium cursor-pointer whitespace-nowrap"
          >
            <CheckCheck className="w-4 h-4" aria-hidden="true" />
            <span>Mark All Present</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F5132] hover:bg-[#0B3D26] text-white text-sm font-medium cursor-pointer whitespace-nowrap"
          >
            <Check className="w-4 h-4" aria-hidden="true" />
            <span>Save Attendance</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label htmlFor="att-class" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Class
            </label>
            <select
              id="att-class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value as SchoolClass)}
              className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            >
              {SCHOOL_CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="att-date" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Date
            </label>
            <input
              id="att-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-sm font-mono tabular-nums">
          <div>
            <span className="text-xs font-sans text-slate-500 dark:text-slate-400 block">Present</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">{counts.present}</span>
          </div>
          <div>
            <span className="text-xs font-sans text-slate-500 dark:text-slate-400 block">Absent</span>
            <span className="font-bold text-red-700 dark:text-red-400">{counts.absent}</span>
          </div>
          <div>
            <span className="text-xs font-sans text-slate-500 dark:text-slate-400 block">Leave</span>
            <span className="font-bold text-amber-700 dark:text-amber-400">{counts.leave}</span>
          </div>
          <div>
            <span className="text-xs font-sans text-slate-500 dark:text-slate-400 block">Attendance</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{counts.rate}%</span>
          </div>
        </div>
      </div>

      {savedMessage && (
        <div
          role="status"
          className="px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-sm font-medium text-emerald-800 dark:text-emerald-300"
        >
          {savedMessage}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {classStudents.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            No active students enrolled in {selectedClass}.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {classStudents.map((stu) => {
              const current = entries[stu.id] ?? 'Present';
              return (
                <div
                  key={stu.id}
                  className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400 mr-2">
                        #{stu.rollNo}
                      </span>
                      {stu.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {stu.admissionNo} · Father: {stu.fatherName} · {stu.phone}
                    </p>
                  </div>

                  <div
                    className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg self-start sm:self-auto"
                    role="group"
                    aria-label={`Attendance status for ${stu.name}`}
                  >
                    {(['Present', 'Absent', 'Leave'] as const).map((status) => {
                      const active = current === status;
                      const activeClasses =
                        status === 'Present'
                          ? 'bg-[#0F5132] text-white'
                          : status === 'Absent'
                            ? 'bg-red-600 text-white'
                            : 'bg-amber-600 text-white';
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setStudentStatus(stu.id, status)}
                          aria-pressed={active}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                            active
                              ? activeClasses
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {status}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};