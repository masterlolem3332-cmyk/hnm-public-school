import React, { useMemo, useState } from 'react';
import { Download, IndianRupee, Printer, ReceiptText, Search, X } from 'lucide-react';
import {
  FeeReceipt,
  PaymentMode,
  SCHOOL_CLASSES,
  SchoolClass,
  SchoolSettings,
  Student,
} from '../types/school';
import {
  buildCsvContent,
  computeStudentFeeSummary,
  formatINR,
  generateNextReceiptNo,
  validateFeeCollection,
} from '../utils/schoolLogic';
import { TODAY_ISO } from '../data/seedData';
import { SchoolLogo } from './SchoolLogo';

interface FeesViewProps {
  settings: SchoolSettings;
  students: Student[];
  receipts: FeeReceipt[];
  autoOpenCollectModal?: boolean;
  onAutoOpenConsumed?: () => void;
  onAddReceipt: (receipt: FeeReceipt) => void;
}

export const FeesView: React.FC<FeesViewProps> = ({
  settings,
  students,
  receipts,
  autoOpenCollectModal = false,
  onAutoOpenConsumed,
  onAddReceipt,
}) => {
  const [tab, setTab] = useState<'ledger' | 'receipts'>('ledger');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Partial' | 'Pending'>('All');
  const [classFilter, setClassFilter] = useState<SchoolClass | 'All'>('All');
  const [search, setSearch] = useState('');

  const [showCollectModal, setShowCollectModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id ?? '');
  const [amountInput, setAmountInput] = useState('');
  const [monthLabel, setMonthLabel] = useState('November 2026');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [paymentDate, setPaymentDate] = useState(TODAY_ISO);
  const [remarks, setRemarks] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [previewReceipt, setPreviewReceipt] = useState<FeeReceipt | null>(null);

  React.useEffect(() => {
    if (autoOpenCollectModal) {
      openCollectForStudent(students[0]);
      onAutoOpenConsumed?.();
    }
  }, [autoOpenCollectModal]);

  const ledgerRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students
      .map((student) => ({
        student,
        summary: computeStudentFeeSummary(student, receipts, settings.feeStructure),
      }))
      .filter(({ student, summary }) => {
        if (classFilter !== 'All' && student.className !== classFilter) return false;
        if (statusFilter !== 'All' && summary.status !== statusFilter) return false;
        if (!q) return true;
        return (
          student.name.toLowerCase().includes(q) ||
          student.admissionNo.toLowerCase().includes(q) ||
          student.fatherName.toLowerCase().includes(q)
        );
      });
  }, [students, receipts, settings.feeStructure, classFilter, statusFilter, search]);

  const totals = useMemo(() => {
    return ledgerRows.reduce(
      (acc, r) => {
        acc.expected += r.summary.expectedToDate;
        acc.paid += r.summary.totalPaid;
        acc.pending += r.summary.pendingBalance;
        return acc;
      },
      { expected: 0, paid: 0, pending: 0 }
    );
  }, [ledgerRows]);

  const openCollectForStudent = (student?: Student) => {
    const target = student ?? students[0];
    if (target) {
      const summary = computeStudentFeeSummary(target, receipts, settings.feeStructure);
      setSelectedStudentId(target.id);
      setAmountInput(
        String(
          summary.pendingBalance > 0
            ? Math.min(summary.pendingBalance, summary.monthlyFee * 2)
            : summary.monthlyFee
        )
      );
    } else {
      setSelectedStudentId('');
      setAmountInput('');
    }
    setMonthLabel('November 2026');
    setPaymentMode('Cash');
    setPaymentDate(TODAY_ISO);
    setRemarks('');
    setFormErrors({});
    setShowCollectModal(true);
  };

  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(amountInput);
    const validation = validateFeeCollection({
      studentId: selectedStudentId,
      amount: numericAmount,
      monthLabel,
      date: paymentDate,
    });
    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    const stu = students.find((s) => s.id === selectedStudentId);
    if (!stu) return;

    const newReceipt: FeeReceipt = {
      id: `rcp-${Date.now()}`,
      receiptNo: generateNextReceiptNo(receipts),
      studentId: stu.id,
      studentName: stu.name,
      admissionNo: stu.admissionNo,
      className: stu.className,
      monthLabel: monthLabel.trim(),
      amount: numericAmount,
      paymentMode,
      date: paymentDate,
      remarks: remarks.trim() || 'Tuition fee received',
    };

    onAddReceipt(newReceipt);
    setShowCollectModal(false);
    setPreviewReceipt(newReceipt);
  };

  const handleExportFeesCsv = () => {
    const csv = buildCsvContent(
      ['Receipt No', 'Date', 'Admission No', 'Student Name', 'Class', 'Fee Period', 'Mode', 'Amount (INR)', 'Remarks'],
      receipts.map((r) => [
        r.receiptNo,
        r.date,
        r.admissionNo,
        r.studentName,
        r.className,
        r.monthLabel,
        r.paymentMode,
        r.amount,
        r.remarks,
      ])
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HNM-Fee-Receipts-${TODAY_ISO}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Fees &amp; Accounts
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Track tuition collection, clear balances, and print official school receipts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportFeesCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium cursor-pointer whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Export Receipts CSV</span>
          </button>
          <button
            type="button"
            onClick={() => openCollectForStudent()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F5132] hover:bg-[#0B3D26] text-white text-sm font-medium cursor-pointer whitespace-nowrap shrink-0"
          >
            <IndianRupee className="w-4 h-4" aria-hidden="true" />
            <span>Collect Fee</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Expected (Filtered)</p>
          <p className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {formatINR(totals.expected)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Collected</p>
          <p className="mt-1 text-2xl font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
            {formatINR(totals.paid)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Pending Dues</p>
          <p className="mt-1 text-2xl font-bold font-mono tabular-nums text-amber-700 dark:text-amber-400">
            {formatINR(totals.pending)}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg self-start">
          <button
            type="button"
            onClick={() => setTab('ledger')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              tab === 'ledger'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Student Fee Ledger ({ledgerRows.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('receipts')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              tab === 'receipts'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Receipts ({receipts.length})
          </button>
        </div>

        {tab === 'ledger' && (
          <div className="flex flex-wrap items-center gap-2.5 flex-1 lg:justify-end">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search student fee ledger"
                placeholder="Search student or admission no..."
                className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>

            <select
              aria-label="Filter fee ledger by class"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value as SchoolClass | 'All')}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            >
              <option value="All">All Classes</option>
              {SCHOOL_CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>

            <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {(['All', 'Paid', 'Partial', 'Pending'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {tab === 'ledger' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4 text-right">Due to Date</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Balance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {ledgerRows.map(({ student, summary }) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{student.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {student.admissionNo} · {student.fatherName}
                      </p>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      {student.className}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {formatINR(summary.expectedToDate)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                      {formatINR(summary.totalPaid)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-medium text-slate-900 dark:text-slate-100">
                      {formatINR(summary.pendingBalance)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-xs font-semibold ${
                          summary.status === 'Paid'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : summary.status === 'Partial'
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-red-700 dark:text-red-400'
                        }`}
                      >
                        {summary.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openCollectForStudent(student)}
                        className="text-xs font-semibold text-[#0F5132] dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        Collect Fee
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40">
                  <th className="py-3 px-4">Receipt No.</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Period &amp; Mode</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {[...receipts]
                  .sort((a, b) => b.receiptNo.localeCompare(a.receiptNo))
                  .map((rcp) => (
                    <tr
                      key={rcp.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono tabular-nums text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {rcp.receiptNo}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{rcp.studentName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {rcp.className} · {rcp.admissionNo}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-slate-800 dark:text-slate-200">{rcp.monthLabel}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{rcp.paymentMode}</p>
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {rcp.date}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        {formatINR(rcp.amount)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setPreviewReceipt(rcp)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F5132] dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          <ReceiptText className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Print Slip</span>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCollectModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="collect-fee-title"
        >
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 id="collect-fee-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Collect Tuition Fee
              </h2>
              <button
                type="button"
                onClick={() => setShowCollectModal(false)}
                aria-label="Close collect fee modal"
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCollectSubmit} className="p-6 space-y-4" noValidate>
              <div>
                <label htmlFor="fee-student" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Select Student *
                </label>
                <select
                  id="fee-student"
                  value={selectedStudentId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedStudentId(id);
                    const stu = students.find((s) => s.id === id);
                    if (stu) {
                      const summary = computeStudentFeeSummary(stu, receipts, settings.feeStructure);
                      setAmountInput(
                        String(
                          summary.pendingBalance > 0
                            ? Math.min(summary.pendingBalance, summary.monthlyFee * 2)
                            : summary.monthlyFee
                        )
                      );
                    }
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.className} ({s.admissionNo})
                    </option>
                  ))}
                </select>
                {formErrors.studentId && <p className="mt-1 text-xs text-red-600">{formErrors.studentId}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fee-amount" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Amount Received (INR) *
                  </label>
                  <input
                    id="fee-amount"
                    type="number"
                    min="1"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                  {formErrors.amount && <p className="mt-1 text-xs text-red-600">{formErrors.amount}</p>}
                </div>

                <div>
                  <label htmlFor="fee-mode" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Payment Mode
                  </label>
                  <select
                    id="fee-mode"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="fee-period" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Fee Month / Term *
                  </label>
                  <input
                    id="fee-period"
                    type="text"
                    value={monthLabel}
                    onChange={(e) => setMonthLabel(e.target.value)}
                    placeholder="e.g. Oct – Nov 2026"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                  {formErrors.monthLabel && <p className="mt-1 text-xs text-red-600">{formErrors.monthLabel}</p>}
                </div>

                <div>
                  <label htmlFor="fee-date" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Receipt Date *
                  </label>
                  <input
                    id="fee-date"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                  {formErrors.date && <p className="mt-1 text-xs text-red-600">{formErrors.date}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="fee-remarks" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Remarks (Optional)
                </label>
                <input
                  id="fee-remarks"
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Paid by father at school counter"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCollectModal(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#0F5132] hover:bg-[#0B3D26] text-white cursor-pointer"
                >
                  Generate Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewReceipt && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Official Fee Receipt Preview"
        >
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="no-print px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Fee Receipt — {previewReceipt.receiptNo}
              </h2>
              <button
                type="button"
                onClick={() => setPreviewReceipt(null)}
                aria-label="Close fee receipt preview"
                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              <div className="print-only-sheet border border-slate-300 rounded-lg p-6 bg-white text-slate-900">
                <div className="flex items-start justify-between gap-4 border-b border-slate-300 pb-4">
                  <div className="flex items-center gap-3.5">
                    <SchoolLogo
                      customLogoDataUrl={settings.customLogoDataUrl}
                      schoolName={settings.schoolName}
                      size="md"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{settings.schoolName}</h3>
                      <p className="text-xs text-slate-600">{settings.board}</p>
                      <p className="text-xs text-slate-600">{settings.address}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-semibold text-slate-900">OFFICIAL FEE RECEIPT</p>
                    <p className="mt-1 font-mono text-slate-700">{previewReceipt.receiptNo}</p>
                    <p className="font-mono text-slate-600">Date: {previewReceipt.date}</p>
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-slate-500">Student Name</dt>
                    <dd className="text-sm font-semibold text-slate-900">{previewReceipt.studentName}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Admission No. &amp; Class</dt>
                    <dd className="text-sm font-medium text-slate-900">
                      {previewReceipt.admissionNo} · {previewReceipt.className}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Fee Period</dt>
                    <dd className="font-medium text-slate-900">{previewReceipt.monthLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Payment Mode</dt>
                    <dd className="font-medium text-slate-900">{previewReceipt.paymentMode}</dd>
                  </div>
                </dl>

                <table className="mt-5 w-full text-sm border border-slate-300 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-xs text-slate-700">
                      <th className="py-2 px-3 text-left border-b border-slate-300">Particulars</th>
                      <th className="py-2 px-3 text-right border-b border-slate-300">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2.5 px-3 border-b border-slate-200">
                        Tuition &amp; Academic Fee ({previewReceipt.monthLabel})
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums border-b border-slate-200">
                        {formatINR(previewReceipt.amount)}
                      </td>
                    </tr>
                    <tr className="font-bold bg-slate-50">
                      <td className="py-2.5 px-3">Total Received</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                        {formatINR(previewReceipt.amount)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {previewReceipt.remarks && (
                  <p className="mt-3 text-xs text-slate-600">Remarks: {previewReceipt.remarks}</p>
                )}

                <div className="mt-8 pt-4 border-t border-slate-200 flex items-end justify-between text-xs text-slate-600">
                  <div>
                    <p>Contact: {settings.phone}</p>
                    <p>Session {settings.academicSession}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{settings.principalName}</p>
                    <p>Principal / Authorized Signatory</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="no-print px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPreviewReceipt(null)}
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
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};