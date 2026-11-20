import React, { useMemo, useState } from 'react';
import { Pencil, Plus, Printer, Search, X } from 'lucide-react';
import {
  SCHOOL_CLASSES,
  SchoolClass,
  SchoolSettings,
  StaffCategory,
  StaffMember,
} from '../types/school';
import { formatINR } from '../utils/schoolLogic';
import { TODAY_ISO } from '../data/seedData';
import { SchoolLogo } from './SchoolLogo';

interface StaffViewProps {
  settings: SchoolSettings;
  staff: StaffMember[];
  onAddStaff: (member: StaffMember) => void;
  onUpdateStaff: (member: StaffMember) => void;
  onToggleSalaryPaid: (staffId: string) => void;
}

interface StaffFormState {
  name: string;
  category: StaffCategory;
  designation: string;
  subject: string;
  classTeacherOf: SchoolClass | 'None';
  qualification: string;
  phone: string;
  monthlySalary: string;
}

const EMPTY_STAFF: StaffFormState = {
  name: '',
  category: 'Teacher',
  designation: 'Assistant Teacher',
  subject: '',
  classTeacherOf: 'None',
  qualification: '',
  phone: '',
  monthlySalary: '12000',
};

export const StaffView: React.FC<StaffViewProps> = ({
  settings,
  staff,
  onAddStaff,
  onUpdateStaff,
  onToggleSalaryPaid,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | StaffCategory>('All');
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [form, setForm] = useState<StaffFormState>(EMPTY_STAFF);
  const [error, setError] = useState('');
  const [slipMember, setSlipMember] = useState<StaffMember | null>(null);

  const filteredStaff = useMemo(() => {
    const q = search.trim().toLowerCase();
    return staff.filter((m) => {
      if (categoryFilter !== 'All' && m.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.designation.toLowerCase().includes(q) ||
        m.employeeId.toLowerCase().includes(q)
      );
    });
  }, [staff, search, categoryFilter]);

  const teacherCount = staff.filter((s) => s.category === 'Teacher').length;
  const helperCount = staff.filter((s) => s.category === 'Support Staff').length;
  const totalPayroll = staff.reduce((sum, s) => sum + s.monthlySalary, 0);
  const paidPayroll = staff
    .filter((s) => s.salaryPaidThisMonth)
    .reduce((sum, s) => sum + s.monthlySalary, 0);

  const openAddModal = () => {
    setEditingMember(null);
    setForm(EMPTY_STAFF);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (member: StaffMember) => {
    setEditingMember(member);
    setForm({
      name: member.name,
      category: member.category,
      designation: member.designation,
      subject: member.subject,
      classTeacherOf: member.classTeacherOf,
      qualification: member.qualification,
      phone: member.phone,
      monthlySalary: String(member.monthlySalary),
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const salary = Number(form.monthlySalary);
    if (!form.name.trim() || !form.designation.trim() || form.phone.replace(/\D/g, '').length !== 10 || !Number.isFinite(salary) || salary <= 0) {
      setError('Enter valid name, designation, 10-digit phone number, and monthly salary.');
      return;
    }

    if (editingMember) {
      onUpdateStaff({
        ...editingMember,
        name: form.name.trim(),
        category: form.category,
        designation: form.designation.trim(),
        subject: form.subject.trim() || 'General',
        classTeacherOf: form.category === 'Support Staff' ? 'None' : form.classTeacherOf,
        qualification: form.qualification.trim() || 'Graduate',
        phone: form.phone.replace(/\D/g, ''),
        monthlySalary: salary,
      });
    } else {
      const prefix = form.category === 'Teacher' ? 'HNM-T' : 'HNM-S';
      const nextNum = String(staff.length + 1).padStart(2, '0');
      onAddStaff({
        id: `stf-${Date.now()}`,
        employeeId: `${prefix}${nextNum}`,
        name: form.name.trim(),
        category: form.category,
        designation: form.designation.trim(),
        subject: form.subject.trim() || 'General',
        classTeacherOf: form.category === 'Support Staff' ? 'None' : form.classTeacherOf,
        qualification: form.qualification.trim() || 'Graduate',
        phone: form.phone.replace(/\D/g, ''),
        joiningDate: TODAY_ISO,
        monthlySalary: salary,
        salaryPaidThisMonth: false,
        status: 'Active',
      });
    }

    setShowModal(false);
    setEditingMember(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Teachers &amp; Support Staff
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {teacherCount} teaching staff · {helperCount} support staff (Helper / Aaya) · Monthly payroll {formatINR(totalPayroll)}
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F5132] hover:bg-[#0B3D26] text-white text-sm font-medium cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Payroll Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Monthly Payroll</p>
          <p className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {formatINR(totalPayroll)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Disbursed (Nov 2026)</p>
          <p className="mt-1 text-2xl font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
            {formatINR(paidPayroll)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Pending Salary</p>
          <p className="mt-1 text-2xl font-bold font-mono tabular-nums text-amber-700 dark:text-amber-400">
            {formatINR(totalPayroll - paidPayroll)}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search staff members"
            placeholder="Search by teacher name, subject, or ID..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg self-start">
          {(['All', 'Teacher', 'Support Staff'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {cat === 'All' ? `All (${staff.length})` : cat === 'Teacher' ? `Teachers (${teacherCount})` : `Support (${helperCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Name &amp; Qualification</th>
                <th className="py-3 px-4">Role &amp; Subject</th>
                <th className="py-3 px-4">Class Teacher</th>
                <th className="py-3 px-4 text-right">Monthly Salary</th>
                <th className="py-3 px-4">Nov Payroll</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filteredStaff.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 px-4 font-mono tabular-nums text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {member.employeeId}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{member.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {member.qualification} · {member.phone}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-slate-800 dark:text-slate-200">{member.designation}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{member.subject}</p>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                    {member.classTeacherOf}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {formatINR(member.monthlySalary)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onToggleSalaryPaid(member.id)}
                      className={`text-xs font-semibold hover:underline cursor-pointer ${
                        member.salaryPaidThisMonth
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {member.salaryPaidThisMonth ? 'Paid (Mark Unpaid)' : 'Pending (Mark Paid)'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSlipMember(member)}
                        aria-label={`Print salary slip for ${member.name}`}
                        title="Salary Slip"
                        className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(member)}
                        aria-label={`Edit ${member.name}`}
                        title="Edit Staff"
                        className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Staff Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="staff-modal-title"
        >
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden my-auto">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 id="staff-modal-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {editingMember ? `Edit Staff — ${editingMember.employeeId}` : 'Add Staff Member'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close staff modal"
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="stf-name" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    id="stf-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label htmlFor="stf-cat" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    id="stf-cat"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as StaffCategory })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Teacher">Teacher</option>
                    <option value="Support Staff">Support Staff (Helper / Aaya)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="stf-desig" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Designation *
                  </label>
                  <input
                    id="stf-desig"
                    type="text"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label htmlFor="stf-sub" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Subject / Duty
                  </label>
                  <input
                    id="stf-sub"
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="e.g. Science, Mathematics"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label htmlFor="stf-ct" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Class Teacher Of
                  </label>
                  <select
                    id="stf-ct"
                    value={form.classTeacherOf}
                    onChange={(e) => setForm({ ...form, classTeacherOf: e.target.value as SchoolClass | 'None' })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    <option value="None">None</option>
                    {SCHOOL_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="stf-qual" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Qualification
                  </label>
                  <input
                    id="stf-qual"
                    type="text"
                    value={form.qualification}
                    onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                    placeholder="e.g. M.Sc., B.Ed."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label htmlFor="stf-phone" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number (10 digits) *
                  </label>
                  <input
                    id="stf-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label htmlFor="stf-salary" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Salary (INR) *
                  </label>
                  <input
                    id="stf-salary"
                    type="number"
                    min="1"
                    value={form.monthlySalary}
                    onChange={(e) => setForm({ ...form, monthlySalary: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#0F5132] hover:bg-[#0B3D26] text-white cursor-pointer"
                >
                  {editingMember ? 'Save Changes' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Salary Slip Modal */}
      {slipMember && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Salary Slip Preview"
        >
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="no-print px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Salary Voucher — {slipMember.name}
              </h2>
              <button
                type="button"
                onClick={() => setSlipMember(null)}
                aria-label="Close salary slip preview"
                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <div className="print-only-sheet border border-slate-300 rounded-lg p-6 bg-white text-slate-900">
                <div className="flex items-center gap-3 border-b border-slate-300 pb-4">
                  <SchoolLogo
                    customLogoDataUrl={settings.customLogoDataUrl}
                    schoolName={settings.schoolName}
                    size="sm"
                  />
                  <div>
                    <h3 className="text-base font-bold">{settings.schoolName}</h3>
                    <p className="text-xs text-slate-600">{settings.address}</p>
                  </div>
                </div>
                <p className="mt-4 text-xs font-semibold tracking-wide text-slate-700">
                  MONTHLY SALARY SLIP — NOVEMBER 2026
                </p>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-slate-500">Staff Name</dt>
                    <dd className="font-semibold text-sm">{slipMember.name}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Employee ID</dt>
                    <dd className="font-mono">{slipMember.employeeId}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Designation</dt>
                    <dd>{slipMember.designation}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Status</dt>
                    <dd className="font-semibold">
                      {slipMember.salaryPaidThisMonth ? 'Paid' : 'Pending'}
                    </dd>
                  </div>
                </dl>
                <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between text-sm">
                  <span className="font-medium">Net Monthly Salary</span>
                  <span className="font-mono font-bold text-base">
                    {formatINR(slipMember.monthlySalary)}
                  </span>
                </div>
                <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-600">
                  <span>Receiver&apos;s Signature</span>
                  <span className="font-semibold text-slate-900">
                    Principal ({settings.principalName})
                  </span>
                </div>
              </div>
            </div>
            <div className="no-print px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSlipMember(null)}
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
                <span>Print Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};