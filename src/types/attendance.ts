export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  department: string;
  semester: number;
  section: string;
  avatar: string;
  status: AttendanceStatus;
  totalClasses: number;
  attendedClasses: number;
  phone: string;
  parentContact: string;
  lastMarked?: string;
}

export interface SubjectAttendance {
  id: string;
  code: string;
  name: string;
  faculty: string;
  totalClasses: number;
  attendedClasses: number;
  credits: number;
  room: string;
  schedule: string;
}

export interface AttendanceRecord {
  date: string;
  subjectCode: string;
  subjectName: string;
  timeSlot: string;
  status: AttendanceStatus;
  faculty: string;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  startDate: string;
  endDate: string;
  reason: string;
  category: 'Medical' | 'Academic Event' | 'Family Emergency' | 'On-Duty Sports';
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: string;
  documentName?: string;
}

export type ActiveScreen = 'faculty' | 'student' | 'recovery';
