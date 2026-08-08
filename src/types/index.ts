export type UserRole =
  | 'SUPER_ADMIN'
  | 'UNIVERSITY_ADMIN'
  | 'FACULTY'
  | 'STUDENT'
  | 'EXAMINATION_ADMIN'
  | 'FINANCE_ADMIN'
  | 'HOSTEL_ADMIN'
  | 'TRANSPORT_ADMIN'
  | 'HR_ADMIN';

export interface User {
  id: string;
  email: string;
  registerNo: string;
  name: string;
  role: UserRole;
}

export interface StudentProfile {
  id: string;
  registerNo: string;
  school: string;
  program?: { name: string; degree: string };
  specialization: string;
  semester: string;
  section: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  fatherName: string;
  motherName: string;
  academicYear: string;
  admissionYear: string;
  bloodGroup: string;
  address: string;
  cgpa: number;
  user?: User;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  type: string;
  semester: string;
  faculty?: { user: { name: string } };
  seatsTotal: number;
  seatsTaken: number;
  prerequisites?: string;
}

export interface AttendanceBreakdown {
  code: string;
  name: string;
  percentage: number;
  present: number;
  total: number;
  isWarning?: boolean;
}

export interface Exam {
  registrationId?: string;
  hallTicketNo?: string;
  name: string;
  subject: string;
  code: string;
  date: string;
  time: string;
  venue: string;
}

export interface ResultItem {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  marksObtained: number;
  grade: string;
  gradePoints: number;
  result: string;
  semester: string;
}

export interface FeeRecord {
  id: string;
  category: string;
  description: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: 'PENDING' | 'PARTIAL' | 'PAID';
}

export interface Transaction {
  id: string;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  status: string;
  paidAt: string;
  feeRecord?: FeeRecord;
}
