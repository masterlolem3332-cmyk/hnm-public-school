import {
  AttendanceRecord,
  ClassFeeConfig,
  FeeReceipt,
  SCHOOL_CLASSES,
  SchoolClass,
  StaffMember,
  Student,
  SubjectMark,
} from '../types/school';

export interface AdmissionFormInput {
  name: string;
  fatherName: string;
  motherName: string;
  className: SchoolClass;
  phone: string;
  dob: string;
  address: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateAdmissionForm(input: AdmissionFormInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.name.trim() || input.name.trim().length < 2) {
    errors.name = 'Enter student full name (at least 2 characters).';
  }
  if (!input.fatherName.trim() || input.fatherName.trim().length < 2) {
    errors.fatherName = "Enter father's full name.";
  }
  if (!input.motherName.trim() || input.motherName.trim().length < 2) {
    errors.motherName = "Enter mother's full name.";
  }
  const cleanPhone = input.phone.replace(/\D/g, '');
  if (cleanPhone.length !== 10) {
    errors.phone = 'Enter a valid 10-digit parent mobile number.';
  }
  if (!input.dob.trim()) {
    errors.dob = 'Select date of birth.';
  }
  if (!input.address.trim() || input.address.trim().length < 4) {
    errors.address = 'Enter residential address.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export interface FeeCollectionInput {
  studentId: string;
  amount: number;
  monthLabel: string;
  date: string;
}

export function validateFeeCollection(input: FeeCollectionInput): ValidationResult {
  const errors: Record<string, string> = {};
  if (!input.studentId) {
    errors.studentId = 'Select a student.';
  }
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    errors.amount = 'Enter a valid fee amount greater than ₹0.';
  }
  if (!input.monthLabel.trim()) {
    errors.monthLabel = 'Specify fee month or term.';
  }
  if (!input.date.trim()) {
    errors.date = 'Select payment date.';
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function calculateCbseGrade(percentage: number): { grade: string; remark: string } {
  if (percentage >= 91) return { grade: 'A1', remark: 'Outstanding' };
  if (percentage >= 81) return { grade: 'A2', remark: 'Excellent' };
  if (percentage >= 71) return { grade: 'B1', remark: 'Very Good' };
  if (percentage >= 61) return { grade: 'B2', remark: 'Good' };
  if (percentage >= 51) return { grade: 'C1', remark: 'Satisfactory' };
  if (percentage >= 41) return { grade: 'C2', remark: 'Fair' };
  if (percentage >= 33) return { grade: 'D', remark: 'Needs Improvement' };
  return { grade: 'E', remark: 'Essential Repeat' };
}

export interface ReportCardSummary {
  totalObtained: number;
  totalMax: number;
  percentage: number;
  grade: string;
  remark: string;
  passed: boolean;
}

export function calculateReportCardSummary(marks: SubjectMark[]): ReportCardSummary {
  const totalObtained = marks.reduce((sum, item) => sum + Math.max(0, item.obtained), 0);
  const totalMax = marks.reduce((sum, item) => sum + Math.max(1, item.maxMarks), 0);
  const percentage = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(1)) : 0;
  const { grade, remark } = calculateCbseGrade(percentage);
  const passedAllSubjects =
    marks.length > 0 && marks.every((item) => item.maxMarks > 0 && item.obtained / item.maxMarks >= 0.33);

  return {
    totalObtained,
    totalMax,
    percentage,
    grade,
    remark,
    passed: passedAllSubjects && percentage >= 33,
  };
}

export interface StudentFeeSummary {
  monthlyFee: number;
  expectedToDate: number;
  totalPaid: number;
  pendingBalance: number;
  status: 'Paid' | 'Partial' | 'Pending';
}

export function computeStudentFeeSummary(
  student: Student,
  receipts: FeeReceipt[],
  feeStructure: Record<SchoolClass, ClassFeeConfig>,
  monthsElapsed = 8
): StudentFeeSummary {
  const config = feeStructure[student.className];
  const monthlyFee = student.monthlyFeeOverride ?? config.monthlyTuition;
  const expectedToDate = monthlyFee * monthsElapsed + config.annualCharges;
  const totalPaid = receipts
    .filter((r) => r.studentId === student.id)
    .reduce((sum, r) => sum + r.amount, 0);
  const pendingBalance = Math.max(0, expectedToDate - totalPaid);

  let status: 'Paid' | 'Partial' | 'Pending' = 'Pending';
  if (pendingBalance === 0 && expectedToDate > 0) {
    status = 'Paid';
  } else if (totalPaid > 0) {
    status = 'Partial';
  }

  return {
    monthlyFee,
    expectedToDate,
    totalPaid,
    pendingBalance,
    status,
  };
}

export function generateNextAdmissionNo(students: Student[], year = 2026): string {
  const maxNum = students.reduce((max, s) => {
    const match = s.admissionNo.match(/(\d+)$/);
    const num = match ? parseInt(match[1], 10) : 0;
    return Math.max(max, num);
  }, 1000);
  return `HNM-${year}-${String(maxNum + 1).padStart(4, '0')}`;
}

export function generateNextReceiptNo(receipts: FeeReceipt[], year = 2026): string {
  const maxNum = receipts.reduce((max, r) => {
    const match = r.receiptNo.match(/(\d+)$/);
    const num = match ? parseInt(match[1], 10) : 0;
    return Math.max(max, num);
  }, 5000);
  return `RCP-${year}-${String(maxNum + 1).padStart(4, '0')}`;
}

export function getNextRollNoForClass(students: Student[], className: SchoolClass): number {
  const classStudents = students.filter((s) => s.className === className);
  const maxRoll = classStudents.reduce((max, s) => Math.max(max, s.rollNo), 0);
  return maxRoll + 1;
}

export interface DashboardMetrics {
  activeStudents: number;
  totalCollected: number;
  totalPending: number;
  collectionRate: number;
  teacherCount: number;
  supportStaffCount: number;
  monthlyPayroll: number;
  todayPresent: number;
  todayRecorded: number;
  todayAttendanceRate: number;
  classCounts: Array<{ className: SchoolClass; count: number; pendingAmount: number }>;
}

export function computeDashboardMetrics(
  students: Student[],
  staff: StaffMember[],
  receipts: FeeReceipt[],
  attendance: AttendanceRecord[],
  feeStructure: Record<SchoolClass, ClassFeeConfig>,
  todayDate: string
): DashboardMetrics {
  const activeStudentsList = students.filter((s) => s.status === 'Active');

  let totalCollected = 0;
  let totalPending = 0;
  const classMap = new Map<SchoolClass, { count: number; pendingAmount: number }>();
  for (const cls of SCHOOL_CLASSES) {
    classMap.set(cls, { count: 0, pendingAmount: 0 });
  }

  for (const student of activeStudentsList) {
    const summary = computeStudentFeeSummary(student, receipts, feeStructure);
    totalCollected += summary.totalPaid;
    totalPending += summary.pendingBalance;
    const entry = classMap.get(student.className)!;
    entry.count += 1;
    entry.pendingAmount += summary.pendingBalance;
  }

  const totalExpected = totalCollected + totalPending;
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  const teacherCount = staff.filter((s) => s.category === 'Teacher').length;
  const supportStaffCount = staff.filter((s) => s.category === 'Support Staff').length;
  const monthlyPayroll = staff.reduce((sum, s) => sum + s.monthlySalary, 0);

  let todayPresent = 0;
  let todayRecorded = 0;
  const todayRecords = attendance.filter((a) => a.date === todayDate);
  for (const rec of todayRecords) {
    const values = Object.values(rec.entries);
    todayRecorded += values.length;
    todayPresent += values.filter((v) => v === 'Present').length;
  }
  const todayAttendanceRate =
    todayRecorded > 0 ? Math.round((todayPresent / todayRecorded) * 100) : 0;

  const classCounts = SCHOOL_CLASSES.map((className) => {
    const entry = classMap.get(className)!;
    return {
      className,
      count: entry.count,
      pendingAmount: entry.pendingAmount,
    };
  });

  return {
    activeStudents: activeStudentsList.length,
    totalCollected,
    totalPending,
    collectionRate,
    teacherCount,
    supportStaffCount,
    monthlyPayroll,
    todayPresent,
    todayRecorded,
    todayAttendanceRate,
    classCounts,
  };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function buildCsvContent(headers: string[], rows: Array<Array<string | number>>): string {
  const escapeCell = (val: string | number) => {
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  return [headers.map(escapeCell).join(','), ...rows.map((r) => r.map(escapeCell).join(','))].join('\n');
}

export function getSubjectsForClass(className: SchoolClass): string[] {
  if (className === 'Nursery' || className === 'LKG' || className === 'UKG') {
    return ['English', 'Hindi / Urdu', 'Numbers & Counting', 'General Awareness', 'Drawing & Rhymes'];
  }
  if (className === 'Class 1' || className === 'Class 2' || className === 'Class 3' || className === 'Class 4' || className === 'Class 5') {
    return ['English', 'Hindi / Urdu', 'Mathematics', 'Environmental Studies', 'Computer & GK'];
  }
  return ['English', 'Hindi / Urdu', 'Mathematics', 'Science', 'Social Science'];
}