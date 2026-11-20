import React, { useMemo, useState } from 'react';
import { FileSpreadsheet, Pencil, Printer, X } from 'lucide-react';
import {
  ExamRecord,
  ExamTerm,
  SCHOOL_CLASSES,
  SchoolClass,
  SchoolSettings,
  Student,
  SubjectMark,
} from '../types/school';
import { calculateReportCardSummary, getSubjectsForClass } from '../utils/schoolLogic';
import { SchoolLogo } from './SchoolLogo';

interface ExamsViewProps {
  settings: SchoolSettings;
  students: Student[];
  exams: ExamRecord[];
  onSaveExamRecord: (record: ExamRecord) => void;
}

const TERMS: ExamTerm[] = ['Unit Test 1', 'Half Yearly', 'Annual Exam'];

export const ExamsView: React.FC<ExamsViewProps> = ({
  settings,
  students,
  exams,
  onSaveExamRecord,
}) => {
  const [selectedTerm, setSelectedTerm] = useState<ExamTerm>('Half Yearly');
  const [selectedClass, setSelectedClass] = useState<SchoolClass>('Class 8');

  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [draftMarks, setDraftMarks] = useState<SubjectMark[]>([]);
  const [draftRemarks, setDraftRemarks] = useState('');
  const [reportCardStudent, setReportCardStudent] = useState<{
    student: Student;
    record: ExamRecord;
  } | null>(null);

  const classStudents = useMemo(
    () =>
      students
        .filter((s) => s.className === selectedClass && s.status === 'Active')
        .sort((a, b) => a.rollNo - b.rollNo),
    [students, selectedClass]
  );

  const findRecord = (studentId: string): ExamRecord | undefined =>
    exams.find((e) => e.studentId === studentId && e.term === selectedTerm);

  const openMarksEditor = (student: Student) => {
    const existing = findRecord(student.id);
    if (existing) {
      setDraftMarks(existing.marks.map((m) => ({ ...m })));
      setDraftRemarks(existing.remarks);
    } else {
      const subjects = getSubjectsForClass(student.className);
      setDraftMarks(subjects.map((subject) => ({ subject, obtained: 75, maxMarks: 100 })));
      setDraftRemarks('Good performance.');
    }
    setEditingStudent(student);
  };

  const handleSaveMarks = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    const existing = findRecord(editingStudent.id);
    const cleanedMarks = draftMarks.map((m) => ({
      ...m,
      obtained: Math.min(m.maxMarks, Math.max(0, Number(m.obtained) || 0)),
    }));
    onSaveExamRecord({
      id: existing?.id ?? `exm-${selectedTerm.replace(/\s+/g, '')}-${editingStudent.id}`,
      studentId: editingStudent.id,
      term: selectedTerm,
      className: editingStudent.className,
      marks: cleanedMarks,
      remarks: draftRemarks.trim() || 'Satisfactory progress.',
    });
    setEditingStudent(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Exams &amp; CBSE Report Cards
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Enter subject-wise marks, compute automatic CBSE grades (A1–E), and print official report cards
        </p>
      </div>

      {/* Term & Class Selectors */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {TERMS.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => setSelectedTerm(term)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md cursor-pointer whitespace-nowrap ${
                selectedTerm === term
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {term}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="exam-class" className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Class:
          </label>
          <select
            id="exam-class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value as SchoolClass)}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
          >
            {SCHOOL_CLASSES.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40">
                <th className="py-3 px-4">Roll</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4 text-right">Total Marks</th>
                <th className="py-3 px-4 text-right">Percentage</th>
                <th className="py-3 px-4">CBSE Grade</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {classStudents.map((stu) => {
                const record = findRecord(stu.id);
                const summary = record ? calculateReportCardSummary(record.marks) : null;
                return (
                  <tr
                    key={stu.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      #{stu.rollNo}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{stu.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {stu.admissionNo} · {stu.fatherName}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {summary ? `${summary.totalObtained} / ${summary.totalMax}` : 'Not entered'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-medium text-slate-900 dark:text-slate-100">
                      {summary ? `${summary.percentage}%` : '—'}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {summary ? `${summary.grade} · ${summary.remark}` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      {summary ? (
                        <span
                          className={`text-xs font-semibold ${
                            summary.passed
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-red-700 dark:text-red-400'
                          }`}
                        >
                          {summary.passed ? 'Pass' : 'Needs Improvement'}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openMarksEditor(stu)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F5132] dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{record ? 'Edit Marks' : 'Enter Marks'}</span>
                        </button>
                        {record && (
                          <button
                            type="button"
                            onClick={() => setReportCardStudent({ student: stu, record })}
                            className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:underline cursor-pointer"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Report Card</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Marks Entry Modal */}
      {editingStudent && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="marks-modal-title"
        >
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden my-auto">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 id="marks-modal-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {editingStudent.name} — {selectedTerm}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {editingStudent.className} · Roll #{editingStudent.rollNo}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                aria-label="Close marks editor"
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMarks} className="p-6 space-y-4">
              <div className="space-y-3">
                {draftMarks.map((item, idx) => (
                  <div key={item.subject} className="flex items-center justify-between gap-4">
                    <label
                      htmlFor={`mark-input-${idx}`}
                      className="text-sm font-medium text-slate-800 dark:text-slate-200 flex-1"
                    >
                      {item.subject}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id={`mark-input-${idx}`}
                        type="number"
                        min="0"
                        max={item.maxMarks}
                        value={item.obtained}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setDraftMarks((prev) =>
                            prev.map((m, i) => (i === idx ? { ...m, obtained: val } : m))
                          );
                        }}
                        className="w-20 px-2.5 py-1.5 text-sm font-mono text-right rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                      />
                      <span className="text-xs font-mono text-slate-500">/ {item.maxMarks}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label htmlFor="exam-remarks" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Teacher / Principal Remarks
                </label>
                <input
                  id="exam-remarks"
                  type="text"
                  value={draftRemarks}
                  onChange={(e) => setDraftRemarks(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#0F5132] hover:bg-[#0B3D26] text-white cursor-pointer"
                >
                  Save Marks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable CBSE Report Card Preview */}
      {reportCardStudent && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="CBSE Report Card Preview"
        >
          {(() => {
            const { student, record } = reportCardStudent;
            const summary = calculateReportCardSummary(record.marks);
            return (
              <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden my-auto">
                <div className="no-print px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Progress Report Card — {student.name}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setReportCardStudent(null)}
                    aria-label="Close report card preview"
                    className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="print-only-sheet border-2 border-[#0F5132] rounded-lg p-6 bg-white text-slate-900">
                    <div className="flex items-center gap-4 border-b-2 border-[#0F5132] pb-4">
                      <SchoolLogo
                        customLogoDataUrl={settings.customLogoDataUrl}
                        schoolName={settings.schoolName}
                        size="md"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#0F5132]">{settings.schoolName}</h3>
                        <p className="text-xs text-slate-600">
                          {settings.board} · {settings.address}
                        </p>
                        <p className="text-xs font-semibold text-slate-800 mt-0.5">
                          ACADEMIC PROGRESS REPORT — {record.term.toUpperCase()} ({settings.academicSession})
                        </p>
                      </div>
                    </div>

                    <dl className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-md border border-slate-200">
                      <div>
                        <dt className="text-slate-500">Student Name</dt>
                        <dd className="font-bold text-slate-900">{student.name}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Class &amp; Roll No.</dt>
                        <dd className="font-semibold text-slate-900">
                          {student.className} · Roll #{student.rollNo}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Admission No.</dt>
                        <dd className="font-mono text-slate-900">{student.admissionNo}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Father&apos;s Name</dt>
                        <dd className="font-medium text-slate-900">{student.fatherName}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Mother&apos;s Name</dt>
                        <dd className="font-medium text-slate-900">{student.motherName}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Date of Birth</dt>
                        <dd className="font-mono text-slate-900">{student.dob}</dd>
                      </div>
                    </dl>

                    <table className="mt-5 w-full text-sm border border-slate-300 border-collapse">
                      <thead>
                        <tr className="bg-[#0F5132] text-white text-xs">
                          <th className="py-2 px-3 text-left">Subject</th>
                          <th className="py-2 px-3 text-right">Max Marks</th>
                          <th className="py-2 px-3 text-right">Marks Obtained</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {record.marks.map((m) => (
                          <tr key={m.subject}>
                            <td className="py-2 px-3 font-medium">{m.subject}</td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums">{m.maxMarks}</td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold">
                              {m.obtained}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-slate-100 font-bold">
                          <td className="py-2.5 px-3">Grand Total</td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                            {summary.totalMax}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                            {summary.totalObtained}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                      <div className="p-2.5 border border-slate-200 rounded-md">
                        <p className="text-slate-500">Percentage</p>
                        <p className="mt-0.5 text-base font-bold font-mono">{summary.percentage}%</p>
                      </div>
                      <div className="p-2.5 border border-slate-200 rounded-md">
                        <p className="text-slate-500">CBSE Grade</p>
                        <p className="mt-0.5 text-base font-bold font-mono text-[#0F5132]">
                          {summary.grade}
                        </p>
                      </div>
                      <div className="p-2.5 border border-slate-200 rounded-md">
                        <p className="text-slate-500">Result</p>
                        <p className="mt-0.5 text-base font-bold">
                          {summary.passed ? 'PASS' : 'REPEAT'}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-xs text-slate-700">
                      <strong>Remarks:</strong> {record.remarks}
                    </p>

                    <div className="mt-10 pt-4 border-t border-slate-200 flex items-end justify-between text-xs text-slate-600">
                      <span>Class Teacher</span>
                      <span>Parent / Guardian</span>
                      <span className="font-semibold text-slate-900">
                        Principal ({settings.principalName})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="no-print px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReportCardStudent(null)}
                    className="px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#0F5132] hover:bg-[#0B3D26] text-white cursor-pointer"
                  >
                    <Printer className="w-4 h-4" aria-hidden="true" />
                    <span>Print Report Card</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};