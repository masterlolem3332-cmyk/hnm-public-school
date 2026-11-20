import {
  AttendanceRecord,
  ClassFeeConfig,
  ExamRecord,
  FeeReceipt,
  SchoolClass,
  SchoolDatabase,
  SchoolNotice,
  SchoolSettings,
  StaffMember,
  Student,
} from '../types/school';
import { getSubjectsForClass } from '../utils/schoolLogic';

export const TODAY_ISO = '2026-11-19';

export const DEFAULT_FEE_STRUCTURE: Record<SchoolClass, ClassFeeConfig> = {
  Nursery: { monthlyTuition: 700, annualCharges: 1500 },
  LKG: { monthlyTuition: 750, annualCharges: 1500 },
  UKG: { monthlyTuition: 800, annualCharges: 1600 },
  'Class 1': { monthlyTuition: 900, annualCharges: 1800 },
  'Class 2': { monthlyTuition: 950, annualCharges: 1800 },
  'Class 3': { monthlyTuition: 1000, annualCharges: 2000 },
  'Class 4': { monthlyTuition: 1050, annualCharges: 2000 },
  'Class 5': { monthlyTuition: 1100, annualCharges: 2200 },
  'Class 6': { monthlyTuition: 1250, annualCharges: 2500 },
  'Class 7': { monthlyTuition: 1350, annualCharges: 2500 },
  'Class 8': { monthlyTuition: 1500, annualCharges: 2800 },
};

export const DEFAULT_SETTINGS: SchoolSettings = {
  schoolName: 'HNM Public School',
  board: 'CBSE Pattern (Nursery – Class 8)',
  principalName: 'Mohd Usman',
  address: 'Thandi Kothi Road, Deepa Sarai, Sambhal, UP',
  phone: '+91 98370 44120',
  email: 'principal@hnmpublicschool.in',
  academicSession: '2026–27',
  studentCapacity: 500,
  teacherCapacity: 15,
  supportStaffCapacity: 1,
  customLogoDataUrl: null,
  showSplashOnLaunch: true,
  adminEmail: 'principal@hnmpublicschool.in',
  adminPassword: 'HNM@2026',
  feeStructure: DEFAULT_FEE_STRUCTURE,
  theme: 'light',
};

const SEED_STAFF: StaffMember[] = [
  {
    id: 'stf-01',
    employeeId: 'HNM-T01',
    name: 'Shumaila Khan',
    category: 'Teacher',
    designation: 'Senior Teacher',
    subject: 'English',
    classTeacherOf: 'Class 8',
    qualification: 'M.A. English, B.Ed.',
    phone: '9837110201',
    joiningDate: '2019-04-01',
    monthlySalary: 16500,
    salaryPaidThisMonth: true,
    status: 'Active',
  },
  {
    id: 'stf-02',
    employeeId: 'HNM-T02',
    name: 'Farhan Ahmed',
    category: 'Teacher',
    designation: 'Senior Teacher',
    subject: 'Mathematics',
    classTeacherOf: 'Class 7',
    qualification: 'M.Sc. Maths, B.Ed.',
    phone: '9837110202',
    joiningDate: '2020-04-01',
    monthlySalary: 16000,
    salaryPaidThisMonth: true,
    status: 'Active',
  },
  {
    id: 'stf-03',
    employeeId: 'HNM-T03',
    name: 'Ayesha Siddiqui',
    category: 'Teacher',
    designation: 'Senior Teacher',
    subject: 'Science',
    classTeacherOf: 'Class 6',
    qualification: 'M.Sc. Biology, B.Ed.',
    phone: '9837110203',
    joiningDate: '2020-07-10',
    monthlySalary: 15500,
    salaryPaidThisMonth: true,
    status: 'Active',
  },
  {
    id: 'stf-04',
    employeeId: 'HNM-T04',
    name: 'Imran Malik',
    category: 'Teacher',
    designation: 'Assistant Teacher',
    subject: 'Social Science',
    classTeacherOf: 'Class 5',
    qualification: 'M.A. History, B.Ed.',
    phone: '9837110204',
    joiningDate: '2021-04-05',
    monthlySalary: 14000,
    salaryPaidThisMonth: true,
    status: 'Active',
  },
  {
    id: 'stf-05',
    employeeId: 'HNM-T05',
    name: 'Sana Parveen',
    category: 'Teacher',
    designation: 'Assistant Teacher',
    subject: 'Hindi & Urdu',
    classTeacherOf: 'Class 4',
    qualification: 'M.A. Urdu, D.El.Ed.',
    phone: '9837110205',
    joiningDate: '2021-08-01',
    monthlySalary: 13500,
    salaryPaidThisMonth: true,
    status: 'Active',
  },
  {
    id: 'stf-06',
    employeeId: 'HNM-T06',
    name: 'Bilal Ansari',
    category: 'Teacher',
    designation: 'Assistant Teacher',
    subject: 'Mathematics & Computer',
    classTeacherOf: 'Class 3',
    qualification: 'B.Sc., BCA',
    phone: '9837110206',
    joiningDate: '2022-04-01',
    monthlySalary: 13500,
    salaryPaidThisMonth: false,
    status: 'Active',
  },
  {
    id: 'stf-07',
    employeeId: 'HNM-T07',
    name: 'Zoya Fatima',
    category: 'Teacher',
    designation: 'Primary Teacher',
    subject: 'Environmental Studies',
    classTeacherOf: 'Class 2',
    qualification: 'B.Sc., B.Ed.',
    phone: '9837110207',
    joiningDate: '2022-04-12',
    monthlySalary: 12500,
    salaryPaidThisMonth: true,
    status: 'Active',
  },
  {
    id: 'stf-08',
    employeeId: 'HNM-T08',
    name: 'Nida Qureshi',
    category: 'Teacher',
    designation: 'Primary Teacher',
    subject: 'English & GK',
    classTeacherOf: 'Class 1',
    qualification: 'B.A., D.El.Ed.',
    phone: '9837110208',
    joiningDate: '2022-07-01',
    monthlySalary: 12000,
    salaryPaidThisMonth: true,
    status: 'Active',
  },
  {
    id: 'stf-09',
    employeeId: 'HNM-T09',
    name: 'Hina Tabassum',
    category: 'Teacher',
    designation: 'Pre-Primary Teacher',
    subject: 'All Subjects',
    classTeacherOf: 'UKG',
    qualification: 'B.A., NTT',
    phone: '9837110209',
    joiningDate: '2023-04-01',
    monthlySalary: 11000,
    salaryPaidThisMonth: true,
    status: 'Active',
  },
  {
    id: 'stf-10',
    employeeId: 'HNM-T10',
    name: 'Mariyam Begum',
    category: 'Teacher',
    designation: 'Pre-Primary Teacher',
    subject: 'All Subjects',
    classTeacherOf: 'LKG',
    qualification: 'B.A., NTT',
    phone: '9837110210',
    joiningDate: '2023-04-01',
    monthlySalary: 10500,
    salaryPaidThisMonth: false,
    status: 'Active',
  },
  {
    id: 'stf-11',
    employeeId: 'HNM-T11',
    name: 'Kahkasha Naaz',
    category: 'Teacher',
    designation: 'Pre-Primary Teacher',
    subject: 'All Subjects & Rhymes',
    classTeacherOf: 'Nursery',
    qualification: 'B.A., NTT',
    phone: '9837110211',
    joiningDate: '2023-07-05',
    monthlySalary: 10500,
    salaryPaidThisMonth: true,
    status: 'Active',
  },
  {
    id: 'stf-12',
    employeeId: 'HNM-T12',
    name: 'Tariq Husain',
    category: 'Teacher',
    designation: 'Subject Teacher',
    subject: 'Urdu & Moral Science',
    classTeacherOf: 'None',
    qualification: 'M.A. Urdu',
    phone: '9837110212',
    joiningDate: '2021-04-01',
    monthlySalary: 13000,
    salaryPaidThisMonth: true,
    status: 'Active',
  },
  {
    id: 'stf-13',
    employeeId: 'HNM-T13',
    name: 'Waseem Raza',
    category: 'Teacher',
    designation: 'Subject Teacher',
    subject: 'Science & Lab',
    classTeacherOf: 'None',
    qualification: 'B.Sc., B.Ed.',
    phone: '9837110213',
    joiningDate: '2024-04-01',
    monthlySalary: 13500,
    salaryPaidThisMonth: true,
    status: 'Active',
  },
  {
    id: 'stf-14',
    employeeId: 'HNM-T14',
    name: 'Sadia Rehman',
    category: 'Teacher',
    designation: 'Subject Teacher',
    subject: 'Art, Craft & Hindi',
    classTeacherOf: 'None',
    qualification: 'B.A., B.Ed.',
    phone: '9837110214',
    joiningDate: '2024-04-01',
    monthlySalary: 11500,
    salaryPaidThisMonth: true,
    status: 'On Leave',
  },
  {
    id: 'stf-15',
    employeeId: 'HNM-T15',
    name: 'Danish Ali',
    category: 'Teacher',
    designation: 'PT & Computer Teacher',
    subject: 'Computer & Sports',
    classTeacherOf: 'None',
    qualification: 'BCA, B.P.Ed.',
    phone: '9837110215',
    joiningDate: '2024-07-01',
    monthlySalary: 12500,
    salaryPaidThisMonth: false,
    status: 'Active',
  },
  {
    id: 'stf-16',
    employeeId: 'HNM-S01',
    name: 'Rukhsana Khatoon',
    category: 'Support Staff',
    designation: 'School Helper / Aaya',
    subject: 'Campus Care & Hygiene',
    classTeacherOf: 'None',
    qualification: '8th Pass',
    phone: '9837110299',
    joiningDate: '2019-04-01',
    monthlySalary: 6500,
    salaryPaidThisMonth: true,
    status: 'Active',
  },
];

interface RawStudentSeed {
  name: string;
  father: string;
  mother: string;
  cls: SchoolClass;
  gender: 'Male' | 'Female';
  dob: string;
  locality: string;
  payRatio: number;
}

const RAW_STUDENTS: RawStudentSeed[] = [
  { name: 'Hamza Siddiqui', father: 'Salman Siddiqui', mother: 'Amina Begum', cls: 'Nursery', gender: 'Male', dob: '2022-03-14', locality: 'Deepa Sarai, Sambhal', payRatio: 1 },
  { name: 'Inaya Fatima', father: 'Kamran Khan', mother: 'Nusrat Jahan', cls: 'Nursery', gender: 'Female', dob: '2022-06-21', locality: 'Thandi Kothi Road, Sambhal', payRatio: 0.6 },
  { name: 'Aariz Qureshi', father: 'Faizan Qureshi', mother: 'Shabnam Parveen', cls: 'Nursery', gender: 'Male', dob: '2022-01-09', locality: 'Choudhary Sarai, Sambhal', payRatio: 1 },
  { name: 'Myra Ansari', father: 'Rashid Ansari', mother: 'Farzana Khatoon', cls: 'Nursery', gender: 'Female', dob: '2022-08-18', locality: 'Miyan Sarai, Sambhal', payRatio: 0 },
  { name: 'Zayan Ahmed', father: 'Irshad Ahmed', mother: 'Rubina Begum', cls: 'LKG', gender: 'Male', dob: '2021-04-11', locality: 'Deepa Sarai, Sambhal', payRatio: 1 },
  { name: 'Aayat Khan', father: 'Nadeem Khan', mother: 'Nazma Parveen', cls: 'LKG', gender: 'Female', dob: '2021-07-03', locality: 'Kot Purvi, Sambhal', payRatio: 1 },
  { name: 'Rehan Malik', father: 'Shakeel Malik', mother: 'Rukhsar Begum', cls: 'LKG', gender: 'Male', dob: '2021-02-26', locality: 'Sarai Tareen, Sambhal', payRatio: 0.5 },
  { name: 'Hoorain Saifi', father: 'Javed Saifi', mother: 'Shaheen Bano', cls: 'LKG', gender: 'Female', dob: '2021-09-15', locality: 'Nakhasa, Sambhal', payRatio: 1 },
  { name: 'Ayaan Husain', father: 'Aslam Husain', mother: 'Tabassum Ara', cls: 'UKG', gender: 'Male', dob: '2020-05-08', locality: 'Thandi Kothi Road, Sambhal', payRatio: 1 },
  { name: 'Aliza Parveen', father: 'Wajid Ali', mother: 'Saima Khatoon', cls: 'UKG', gender: 'Female', dob: '2020-03-19', locality: 'Deepa Sarai, Sambhal', payRatio: 0.65 },
  { name: 'Arham Raza', father: 'Shahid Raza', mother: 'Yasmeen Begum', cls: 'UKG', gender: 'Male', dob: '2020-10-02', locality: 'Miyan Sarai, Sambhal', payRatio: 1 },
  { name: 'Zainab Noor', father: 'Firoz Alam', mother: 'Saba Parveen', cls: 'UKG', gender: 'Female', dob: '2020-08-29', locality: 'Choudhary Sarai, Sambhal', payRatio: 0 },
  { name: 'Mohd Saad', father: 'Mohd Arif', mother: 'Huma Begum', cls: 'Class 1', gender: 'Male', dob: '2019-04-17', locality: 'Deepa Sarai, Sambhal', payRatio: 1 },
  { name: 'Fatima Zahra', father: 'Aftab Alam', mother: 'Seema Bano', cls: 'Class 1', gender: 'Female', dob: '2019-06-12', locality: 'Thandi Kothi Road, Sambhal', payRatio: 1 },
  { name: 'Umar Farooq', father: 'Rizwan Ahmed', mother: 'Nargis Khatoon', cls: 'Class 1', gender: 'Male', dob: '2019-01-23', locality: 'Kot Purvi, Sambhal', payRatio: 0.55 },
  { name: 'Amina Bi', father: 'Naimuddin', mother: 'Reshma Begum', cls: 'Class 1', gender: 'Female', dob: '2019-11-04', locality: 'Sarai Tareen, Sambhal', payRatio: 1 },
  { name: 'Affan Qureshi', father: 'Taufeeq Qureshi', mother: 'Gulshan Ara', cls: 'Class 2', gender: 'Male', dob: '2018-02-14', locality: 'Deepa Sarai, Sambhal', payRatio: 1 },
  { name: 'Ifra Siddiqui', father: 'Anwar Siddiqui', mother: 'Fauzia Parveen', cls: 'Class 2', gender: 'Female', dob: '2018-07-20', locality: 'Miyan Sarai, Sambhal', payRatio: 0.6 },
  { name: 'Subhan Ansari', father: 'Zafar Ansari', mother: 'Shagufta Bano', cls: 'Class 2', gender: 'Male', dob: '2018-09-09', locality: 'Nakhasa, Sambhal', payRatio: 1 },
  { name: 'Sana Khan', father: 'Mustaqeem Khan', mother: 'Parveen Begum', cls: 'Class 2', gender: 'Female', dob: '2018-05-25', locality: 'Choudhary Sarai, Sambhal', payRatio: 0 },
  { name: 'Zaid Malik', father: 'Sajid Malik', mother: 'Razia Sultana', cls: 'Class 3', gender: 'Male', dob: '2017-03-30', locality: 'Thandi Kothi Road, Sambhal', payRatio: 1 },
  { name: 'Hafsa Bano', father: 'Shafiq Ahmed', mother: 'Nagma Parveen', cls: 'Class 3', gender: 'Female', dob: '2017-08-11', locality: 'Deepa Sarai, Sambhal', payRatio: 1 },
  { name: 'Arman Saifi', father: 'Abrar Saifi', mother: 'Shabana Begum', cls: 'Class 3', gender: 'Male', dob: '2017-01-19', locality: 'Sarai Tareen, Sambhal', payRatio: 0.5 },
  { name: 'Mahira Fatima', father: 'Naved Akhtar', mother: 'Farha Naaz', cls: 'Class 3', gender: 'Female', dob: '2017-10-15', locality: 'Kot Purvi, Sambhal', payRatio: 1 },
  { name: 'Arsalan Khan', father: 'Jameel Khan', mother: 'Khushboo Begum', cls: 'Class 4', gender: 'Male', dob: '2016-06-05', locality: 'Deepa Sarai, Sambhal', payRatio: 1 },
  { name: 'Aqsa Parveen', father: 'Shoaib Ali', mother: 'Shamim Ara', cls: 'Class 4', gender: 'Female', dob: '2016-04-22', locality: 'Miyan Sarai, Sambhal', payRatio: 0.6 },
  { name: 'Kaif Husain', father: 'Zahid Husain', mother: 'Tasleem Bano', cls: 'Class 4', gender: 'Male', dob: '2016-09-18', locality: 'Thandi Kothi Road, Sambhal', payRatio: 1 },
  { name: 'Nabiha Ansari', father: 'Saleem Ansari', mother: 'Mumtaz Begum', cls: 'Class 4', gender: 'Female', dob: '2016-12-01', locality: 'Choudhary Sarai, Sambhal', payRatio: 0 },
  { name: 'Rayyan Ahmed', father: 'Faisal Ahmed', mother: 'Sadiya Khatoon', cls: 'Class 5', gender: 'Male', dob: '2015-05-14', locality: 'Deepa Sarai, Sambhal', payRatio: 1 },
  { name: 'Sidra Fatima', father: 'Qasim Raza', mother: 'Asma Begum', cls: 'Class 5', gender: 'Female', dob: '2015-03-08', locality: 'Nakhasa, Sambhal', payRatio: 1 },
  { name: 'Sufiyan Qureshi', father: 'Akram Qureshi', mother: 'Mehjabeen', cls: 'Class 5', gender: 'Male', dob: '2015-07-27', locality: 'Kot Purvi, Sambhal', payRatio: 0.6 },
  { name: 'Alfiya Naaz', father: 'Nisar Ahmed', mother: 'Noorjahan', cls: 'Class 5', gender: 'Female', dob: '2015-11-19', locality: 'Sarai Tareen, Sambhal', payRatio: 1 },
  { name: 'Mohd Anas', father: 'Mohd Yunus', mother: 'Roshan Ara', cls: 'Class 6', gender: 'Male', dob: '2014-02-09', locality: 'Thandi Kothi Road, Sambhal', payRatio: 1 },
  { name: 'Laiba Siddiqui', father: 'Tahir Siddiqui', mother: 'Ishrat Jahan', cls: 'Class 6', gender: 'Female', dob: '2014-08-24', locality: 'Deepa Sarai, Sambhal', payRatio: 1 },
  { name: 'Huzaifa Malik', father: 'Khalid Malik', mother: 'Samina Begum', cls: 'Class 6', gender: 'Male', dob: '2014-04-03', locality: 'Miyan Sarai, Sambhal', payRatio: 0.5 },
  { name: 'Bushra Khan', father: 'Raees Khan', mother: 'Shahnaz Parveen', cls: 'Class 6', gender: 'Female', dob: '2014-10-12', locality: 'Choudhary Sarai, Sambhal', payRatio: 0 },
  { name: 'Taha Ansari', father: 'Mujeeb Ansari', mother: 'Zulekha Begum', cls: 'Class 7', gender: 'Male', dob: '2013-06-16', locality: 'Deepa Sarai, Sambhal', payRatio: 1 },
  { name: 'Mantasha Parveen', father: 'Shabbir Ahmed', mother: 'Afsana Khatoon', cls: 'Class 7', gender: 'Female', dob: '2013-01-28', locality: 'Kot Purvi, Sambhal', payRatio: 1 },
  { name: 'Shayan Raza', father: 'Wasim Raza', mother: 'Riffat Parveen', cls: 'Class 7', gender: 'Male', dob: '2013-09-07', locality: 'Thandi Kothi Road, Sambhal', payRatio: 0.65 },
  { name: 'Saniya Bano', father: 'Iqbal Husain', mother: 'Shabnam Ara', cls: 'Class 7', gender: 'Female', dob: '2013-11-22', locality: 'Sarai Tareen, Sambhal', payRatio: 1 },
  { name: 'Moazzam Ali', father: 'Zaqar Ahmed', mother: 'Farida Begum', cls: 'Class 8', gender: 'Male', dob: '2012-03-15', locality: 'Deepa Sarai, Sambhal', payRatio: 1 },
  { name: 'Areeba Fatima', father: 'Azeemuddin', mother: 'Hina Parveen', cls: 'Class 8', gender: 'Female', dob: '2012-07-09', locality: 'Thandi Kothi Road, Sambhal', payRatio: 1 },
  { name: 'Faiz Qureshi', father: 'Shahzad Qureshi', mother: 'Nazneen Begum', cls: 'Class 8', gender: 'Male', dob: '2012-05-01', locality: 'Miyan Sarai, Sambhal', payRatio: 0.55 },
  { name: 'Sumaiya Khan', father: 'Intezar Khan', mother: 'Gulafshan', cls: 'Class 8', gender: 'Female', dob: '2012-10-30', locality: 'Nakhasa, Sambhal', payRatio: 1 },
];

export function createSeedDatabase(): SchoolDatabase {
  const rollCounter: Partial<Record<SchoolClass, number>> = {};
  const students: Student[] = [];
  const receipts: FeeReceipt[] = [];
  let receiptSeq = 5001;

  RAW_STUDENTS.forEach((raw, idx) => {
    const roll = (rollCounter[raw.cls] ?? 0) + 1;
    rollCounter[raw.cls] = roll;
    const id = `stu-${String(idx + 1).padStart(3, '0')}`;
    const admissionNo = `HNM-2026-${String(1001 + idx)}`;
    const phoneSuffix = String(21000 + idx * 137).padStart(5, '0');

    students.push({
      id,
      admissionNo,
      rollNo: roll,
      name: raw.name,
      fatherName: raw.father,
      motherName: raw.mother,
      className: raw.cls,
      gender: raw.gender,
      dob: raw.dob,
      phone: `98374${phoneSuffix}`,
      address: `${raw.locality}, UP`,
      admissionDate: '2026-04-02',
      status: 'Active',
    });

    const feeCfg = DEFAULT_FEE_STRUCTURE[raw.cls];
    const expected = feeCfg.monthlyTuition * 8 + feeCfg.annualCharges;
    if (raw.payRatio > 0) {
      const paidAmount = Math.round((expected * raw.payRatio) / 100) * 100;
      const clampedPaid = raw.payRatio === 1 ? expected : Math.min(expected - 500, paidAmount);
      const day = String(((idx * 3) % 18) + 1).padStart(2, '0');
      receipts.push({
        id: `rcp-${receiptSeq}`,
        receiptNo: `RCP-2026-${receiptSeq}`,
        studentId: id,
        studentName: raw.name,
        admissionNo,
        className: raw.cls,
        monthLabel: raw.payRatio === 1 ? 'Apr – Nov 2026 (Full)' : 'Apr – Jul 2026',
        amount: clampedPaid,
        paymentMode: idx % 3 === 0 ? 'UPI' : idx % 5 === 0 ? 'Bank Transfer' : 'Cash',
        date: `2026-11-${day}`,
        remarks: raw.payRatio === 1 ? 'Cleared up to November' : 'Part payment received',
      });
      receiptSeq += 1;
    }
  });

  const classGroups = new Map<SchoolClass, Student[]>();
  for (const s of students) {
    const arr = classGroups.get(s.className) ?? [];
    arr.push(s);
    classGroups.set(s.className, arr);
  }

  const attendance: AttendanceRecord[] = [];
  classGroups.forEach((list, cls) => {
    const entries: Record<string, 'Present' | 'Absent' | 'Leave'> = {};
    list.forEach((stu, i) => {
      if (i === 3 && (cls === 'Class 2' || cls === 'Class 6')) {
        entries[stu.id] = 'Absent';
      } else if (i === 2 && cls === 'Nursery') {
        entries[stu.id] = 'Leave';
      } else {
        entries[stu.id] = 'Present';
      }
    });
    attendance.push({
      date: TODAY_ISO,
      className: cls,
      entries,
    });
  });

  const exams: ExamRecord[] = [];
  const sampleMarksByIndex = [
    [92, 88, 95, 90, 86],
    [84, 81, 79, 85, 88],
    [72, 68, 74, 70, 76],
    [88, 84, 91, 87, 82],
  ];
  students
    .filter((s) => s.className === 'Class 8' || s.className === 'Class 5' || s.className === 'UKG')
    .forEach((stu) => {
      const subjects = getSubjectsForClass(stu.className);
      const scores = sampleMarksByIndex[(stu.rollNo - 1) % sampleMarksByIndex.length];
      exams.push({
        id: `exm-hy-${stu.id}`,
        studentId: stu.id,
        term: 'Half Yearly',
        className: stu.className,
        marks: subjects.map((sub, i) => ({
          subject: sub,
          obtained: scores[i] ?? 80,
          maxMarks: 100,
        })),
        remarks: stu.rollNo === 1 ? 'Consistent academic excellence and discipline.' : 'Good progress; keep practicing daily.',
      });
    });

  const notices: SchoolNotice[] = [
    {
      id: 'ntc-01',
      title: 'Parent–Teacher Meeting (Half Yearly Result)',
      category: 'PTM',
      audience: 'All Students & Parents',
      date: '2026-11-22',
      content:
        'Parents of all classes (Nursery to Class 8) are requested to attend the Parent–Teacher Meeting on Saturday from 9:00 AM to 1:00 PM at HNM Public School campus to collect Half Yearly Report Cards and discuss student progress.',
      issuedBy: 'Mohd Usman, Principal',
    },
    {
      id: 'ntc-02',
      title: 'Winter School Timings Effective from December 1',
      category: 'General',
      audience: 'All Students & Parents',
      date: '2026-11-18',
      content:
        'Due to winter weather in Sambhal, school timings from 1st December 2026 will be 8:45 AM to 2:15 PM for Nursery to Class 8. Proper winter uniform is mandatory for all students.',
      issuedBy: 'Mohd Usman, Principal',
    },
    {
      id: 'ntc-03',
      title: 'Monthly Tuition Fee Clearance Reminder',
      category: 'Fee Reminder',
      audience: 'All Students & Parents',
      date: '2026-11-15',
      content:
        'Kindly clear pending tuition fees up to November 2026 before the 25th of this month at the school office (9:00 AM – 2:00 PM) and collect your computerized fee receipt.',
      issuedBy: 'Mohd Usman, Principal',
    },
    {
      id: 'ntc-04',
      title: 'Staff Academic Review & Lesson Plan Submission',
      category: 'Exam',
      audience: 'Teaching Staff',
      date: '2026-11-14',
      content:
        'All class teachers (Nursery to Class 8) and subject teachers are advised to submit the Term-2 syllabus completion schedule to the Principal office by Friday afternoon.',
      issuedBy: 'Mohd Usman, Principal',
    },
  ];

  return {
    settings: DEFAULT_SETTINGS,
    students,
    receipts,
    attendance,
    staff: SEED_STAFF,
    exams,
    notices,
  };
}