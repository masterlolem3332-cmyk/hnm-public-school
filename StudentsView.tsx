import React, { useMemo, useState } from 'react';
import { Download, IdCard, Pencil, Plus, Printer, Search, Trash2, X } from 'lucide-react';
import {
  Gender,
  SCHOOL_CLASSES,
  SchoolClass,
  SchoolSettings,
  Student,
} from '../types/school';
import {
  buildCsvContent,
  formatINR,
  generateNextAdmissionNo,
  getNextRollNoForClass,
  validateAdmissionForm,
} from '../utils/schoolLogic';
import { TODAY_ISO } from '../data/seedData';
import { SchoolLogo } from './SchoolLogo';

interface StudentsViewProps {
  settings: SchoolSettings;
  students: Student[];
  initialClassFilter?: SchoolClass | 'All';
  autoOpenNewModal?: boolean;
  onAutoOpenConsumed?: () => void;
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
}

interface FormState {
  name: string;
  fatherName: string;
  motherName: string;
  className: SchoolClass;
  gender: Gender;
  dob: string;
  phone: string;
  address: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  fatherName: '',
  motherName: '',
  className: 'Nursery',
  gender: 'Male',
  dob: '',
  phone: '',
  address: '',
};

export const StudentsView: React.FC<StudentsViewProps> = ({
  settings,
  students,
  initialClassFilter = 'All',
  autoOpenNewModal = false,
  onAutoOpenConsumed,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
}) => {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState<SchoolClass | 'All'>(initialClassFilter);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [idCardStudent, setIdCardStudent] = useState<Student | null>(null);
  const [confirmDeleteStudent, setConfirmDeleteStudent] = useState<Student | null>(null);

  React.useEffect(() => {
    setClassFilter(initialClassFilter);
  }, [initialClassFilter]);

  React.useEffect(() => {
    if (autoOpenNewModal) {
      setEditingStudent(null);
      setForm(EMPTY_FORM);
      setErrors({});
      setShowModal(true);
      onAutoOpenConsumed?.();
    }
  }, [autoOpenNewModal, onAutoOpenConsumed]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      if (classFilter !== 'All' && s.className !== classFilter) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.admissionNo.toLowerCase().includes(q) ||
        s.fatherName.toLowerCase().includes(q) ||
        s.phone.includes(q)
      );
    });
  }, [students, search, classFilter]);

  const openCreateModal = () => {
    setEditingStudent(null);
    setForm({
      ...EMPTY_FORM,
      className: classFilter === 'All' ? 'Class 1' : classFilter,
    });
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setForm({
      name: student.name,
      fatherName: student.fatherName,
      motherName: student.motherName,
      className: student.className,
      gender: student.gender,
      dob: student.dob,
      phone: student.phone,
      address: student.address,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateAdmissionForm(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    if (editingStudent) {
      onUpdateStudent({
        ...editingStudent,
        name: form.name.trim(),
        fatherName: form.fatherName.trim(),
        motherName: form.motherName.trim(),
        className: form.className,
        gender: form.gender,
        dob: form.dob,
        phone: form.phone.replace(/\D/g, ''),
        address: form.address.trim(),
      });
    } else {
      const newStudent: Student = {
        id: `stu-${Date.now()}`,
        admissionNo: generateNextAdmissionNo(students),
        rollNo: getNextRollNoForClass(students, form.className),
        name: form.name.trim(),
        fatherName: form.fatherName.trim(),
        motherName: form.motherName.trim(),
        className: form.className,
        gender: form.gender,
        dob: form.dob,
        phone: form.phone.replace(/\D/g, ''),
        address: form.address.trim(),
        admissionDate: TODAY_ISO,
        status: 'Active',
      };
      onAddStudent(newStudent);
    }

    setShowModal(false);
    setEditingStudent(null);
    setErrors({});
  };

  const handleExportCsv = () => {
    const csv = buildCsvContent(
      ['Admission No', 'Roll No', 'Student Name', 'Class', 'Gender', 'Father Name', 'Mother Name', 'DOB', 'Phone', 'Address', 'Status'],
      filteredStudents.map((s) => [
        s.admissionNo,
        s.rollNo,
        s.name,
        s.className,
        s.gender,
        s.fatherName,
        s.motherName,
        s.dob,
        s.phone,
        s.address,
        s.status,
      ])
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HNM-Students-${classFilter.replace(/\s+/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Students &amp; Admissions
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Showing {filteredStudents.length} of {students.length} enrolled records · Nursery to Class 8
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F5132] hover:bg-[#0B3D26] text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>New Admission</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search students by name, admission number, father name, or phone"
            placeholder="Search by student name, admission no., father's name, or mobile..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="student-class-filter" className="text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
            Class:
          </label>
          <select
            id="student-class-filter"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value as SchoolClass | 'All')}
            className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
          >
            <option value="All">All Classes (Nursery – 8th)</option>
            {SCHOOL_CLASSES.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
              No matching student records
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Adjust your search filter or register a new admission for HNM Public School.
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F5132] text-white text-sm font-medium hover:bg-[#0B3D26] cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add First Student</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40">
                  <th className="py-3 px-4">Adm. No.</th>
                  <th className="py-3 px-4">Student &amp; Parents</th>
                  <th className="py-3 px-4">Class / Roll</th>
                  <th className="py-3 px-4">Parent Contact</th>
                  <th className="py-3 px-4 text-right">Monthly Fee</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredStudents.map((stu) => {
                  const monthlyFee =
                    stu.monthlyFeeOverride ?? settings.feeStructure[stu.className].monthlyTuition;
                  return (
                    <tr
                      key={stu.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono tabular-nums text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {stu.admissionNo}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{stu.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          S/D of {stu.fatherName} &amp; {stu.motherName}
                        </p>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <p className="font-medium text-slate-800 dark:text-slate-200">{stu.className}</p>
                        <p className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                          Roll #{stu.rollNo} · {stu.gender}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
                          {stu.phone}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                          {stu.address}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {formatINR(monthlyFee)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setIdCardStudent(stu)}
                            aria-label={`Print ID Card for ${stu.name}`}
                            title="ID Card"
                            className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0F5132] cursor-pointer"
                          >
                            <IdCard className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(stu)}
                            aria-label={`Edit ${stu.name}`}
                            title="Edit Student"
                            className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteStudent(stu)}
                            aria-label={`Remove ${stu.name}`}
                            title="Remove Student"
                            className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admission-modal-title"
        >
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden my-auto">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 id="admission-modal-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {editingStudent ? `Edit Student — ${editingStudent.admissionNo}` : 'New Student Admission'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close admission modal"
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="adm-name" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    id="adm-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Ayaan Siddiqui"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="adm-class" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Class *
                  </label>
                  <select
                    id="adm-class"
                    value={form.className}
                    onChange={(e) => setForm({ ...form, className: e.target.value as SchoolClass })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
                  >
                    {SCHOOL_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls} ({formatINR(settings.feeStructure[cls].monthlyTuition)}/mo)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="adm-father" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Father&apos;s Name *
                  </label>
                  <input
                    id="adm-father"
                    type="text"
                    value={form.fatherName}
                    onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                    placeholder="e.g. Imran Siddiqui"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
                  />
                  {errors.fatherName && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.fatherName}</p>}
                </div>

                <div>
                  <label htmlFor="adm-mother" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Mother&apos;s Name *
                  </label>
                  <input
                    id="adm-mother"
                    type="text"
                    value={form.motherName}
                    onChange={(e) => setForm({ ...form, motherName: e.target.value })}
                    placeholder="e.g. Farhana Begum"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
                  />
                  {errors.motherName && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.motherName}</p>}
                </div>

                <div>
                  <label htmlFor="adm-gender" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    id="adm-gender"
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="adm-dob" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    id="adm-dob"
                    type="date"
                    value={form.dob}
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
                  />
                  {errors.dob && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.dob}</p>}
                </div>

                <div>
                  <label htmlFor="adm-phone" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Parent Mobile (10 digits) *
                  </label>
                  <input
                    id="adm-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="9837011223"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="adm-address" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Residential Address *
                  </label>
                  <input
                    id="adm-address"
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Deepa Sarai, Sambhal, UP"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
                  />
                  {errors.address && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.address}</p>}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#0F5132] hover:bg-[#0B3D26] text-white cursor-pointer"
                >
                  {editingStudent ? 'Save Changes' : 'Confirm Admission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {idCardStudent && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Student ID Card Preview"
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="no-print px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Student Identity Card
              </h2>
              <button
                type="button"
                onClick={() => setIdCardStudent(null)}
                aria-label="Close ID card preview"
                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              <div className="print-only-sheet border-2 border-[#0F5132] rounded-xl overflow-hidden bg-white text-slate-900">
                <div className="bg-[#0F5132] text-white px-4 py-3.5 flex items-center gap-3">
                  <SchoolLogo
                    customLogoDataUrl={settings.customLogoDataUrl}
                    schoolName={settings.schoolName}
                    size="sm"
                    className="ring-white/30"
                  />
                  <div>
                    <p className="text-sm font-bold leading-tight">{settings.schoolName}</p>
                    <p className="text-[11px] text-emerald-100">{settings.address}</p>
                  </div>
                </div>
                <div className="p-5 space-y-3 text-sm">
                  <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                    <div>
                      <p className="text-xs text-slate-500">Student Name</p>
                      <p className="text-lg font-bold text-slate-900">{idCardStudent.name}</p>
                      <p className="text-xs font-medium text-[#0F5132]">
                        {idCardStudent.className} · Roll #{idCardStudent.rollNo}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-slate-500">Session</p>
                      <p className="text-xs font-mono font-semibold text-slate-900">
                        {settings.academicSession}
                      </p>
                      <p className="mt-1 text-[11px] font-mono text-slate-600">
                        {idCardStudent.admissionNo}
                      </p>
                    </div>
                  </div>
                  <dl className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs">
                    <div>
                      <dt className="text-slate-500">Father&apos;s Name</dt>
                      <dd className="font-medium text-slate-900">{idCardStudent.fatherName}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Date of Birth</dt>
                      <dd className="font-mono text-slate-900">{idCardStudent.dob}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Parent Phone</dt>
                      <dd className="font-mono text-slate-900">{idCardStudent.phone}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Address</dt>
                      <dd className="text-slate-900">{idCardStudent.address}</dd>
                    </div>
                  </dl>
                  <div className="pt-4 mt-2 border-t border-slate-200 flex items-end justify-between text-[11px] text-slate-600">
                    <span>Ph: {settings.phone}</span>
                    <span className="font-semibold text-slate-900">
                      Principal ({settings.principalName})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="no-print px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIdCardStudent(null)}
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
                <span>Print ID Card</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteStudent && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-student-title"
        >
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <h2 id="delete-student-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
              Remove Student Record?
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to remove <strong>{confirmDeleteStudent.name}</strong> ({confirmDeleteStudent.admissionNo}) from {confirmDeleteStudent.className}?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteStudent(null)}
                className="px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteStudent(confirmDeleteStudent.id);
                  setConfirmDeleteStudent(null);
                }}
                className="px-3.5 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              >
                Remove Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};