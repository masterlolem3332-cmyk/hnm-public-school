export type SchoolClass =
  | 'Nursery'
  | 'LKG'
  | 'UKG'
  | 'Class 1'
  | 'Class 2'
  | 'Class 3'
  | 'Class 4'
  | 'Class 5'
  | 'Class 6'
  | 'Class 7'
  | 'Class 8';

export const SCHOOL_CLASSES: SchoolClass[] = [
  'Nursery',
  'LKG',
  'UKG',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
];

export type NavSection =
  | 'dashboard'
  | 'students'
  | 'fees'
  | 'attendance'
  | 'staff'
  | 'exams'
  | 'notices'
  | 'settings';

export type Gender = 'Male' | 'Female';
export type StudentStatus = 'Active' | 'TC Issued';
export type PaymentMode = 'Cash' | 'UPI' | 'Bank Transfer';
export type AttendanceStatus = 'Present' | 'Absent' | 'Leave';
export type StaffCategory = 'Teacher' | 'Support Staff';
export type ExamTerm = 'Unit Test 1' | 'Half Yearly' | 'Annual Exam';
export type NoticeCategory = 'General' | 'Exam' | 'Holiday' | 'Fee Reminder' | 'PTM';

export interface Student {
  id: string;
  admissionNo: string;
  rollNo: number;
  name: string;
  fatherName: string;
  motherName: string;
  className: SchoolClass;
  gender: Gender;
  dob: string;
  phone: string;
  address: string;
  admissionDate: string;
  monthlyFeeOverride?: number;
  status: StudentStatus;
}

export interface FeeReceipt {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  className: SchoolClass;
  monthLabel: string;
  amount: number;
  paymentMode: PaymentMode;
  date: string;
  remarks: string;
}

export interface AttendanceRecord {
  date: string;
  className: SchoolClass;
  entries: Record<string, AttendanceStatus>;
}

export interface StaffMember {
  id: string;
  employeeId: string;
  name: string;
  category: StaffCategory;
  designation: string;
  subject: string;
  classTeacherOf: SchoolClass | 'None';
  qualification: string;
  phone: string;
  joiningDate: string;
  monthlySalary: number;
  salaryPaidThisMonth: boolean;
  status: 'Active' | 'On Leave';
}

export interface SubjectMark {
  subject: string;
  obtained: number;
  maxMarks: number;
}

export interface ExamRecord {
  id: string;
  studentId: string;
  term: ExamTerm;
  className: SchoolClass;
  marks: SubjectMark[];
  remarks: string;
}

export interface SchoolNotice {
  id: string;
  title: string;
  category: NoticeCategory;
  audience: 'All Students & Parents' | 'Teaching Staff' | SchoolClass;
  date: string;
  content: string;
  issuedBy: string;
}

export interface ClassFeeConfig {
  monthlyTuition: number;
  annualCharges: number;
}

export interface SchoolSettings {
  schoolName: string;
  board: string;
  principalName: string;
  address: string;
  phone: string;
  email: string;
  academicSession: string;
  studentCapacity: number;
  teacherCapacity: number;
  supportStaffCapacity: number;
  customLogoDataUrl: string | null;
  showSplashOnLaunch: boolean;
  adminEmail: string;
  adminPassword: string;
  feeStructure: Record<SchoolClass, ClassFeeConfig>;
  theme: 'light' | 'dark';
}

export interface SchoolDatabase {
  settings: SchoolSettings;
  students: Student[];
  receipts: FeeReceipt[];
  attendance: AttendanceRecord[];
  staff: StaffMember[];
  exams: ExamRecord[];
  notices: SchoolNotice[];
}