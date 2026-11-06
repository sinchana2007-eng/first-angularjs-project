import React, { useState, useMemo } from 'react';
import { Student, AttendanceStatus, ActiveScreen } from '../types/attendance';
import { FACULTY_COURSES } from '../data/mockData';
import { DefaulterAlertModal } from './DefaulterAlertModal';
import { QrAttendanceModal } from './QrAttendanceModal';
import { StudentProfileModal } from './StudentProfileModal';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  QrCode,
  Download,
  Search,
  Bell,
  Check,
  Calendar,
  Building,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface FacultyDashboardProps {
  students: Student[];
  onUpdateStudentStatus: (id: string, status: AttendanceStatus) => void;
  onMarkAllStatus: (status: AttendanceStatus) => void;
  onNavigateScreen: (screen: ActiveScreen) => void;
  onSelectStudentForPortal?: (studentId: string) => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  students,
  onUpdateStudentStatus,
  onMarkAllStatus,
  onNavigateScreen,
  onSelectStudentForPortal,
}) => {
  const [selectedCourse, setSelectedCourse] = useState(FACULTY_COURSES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus | 'defaulter'>('all');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isDefaulterModalOpen, setIsDefaulterModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [lectureSubmitted, setLectureSubmitted] = useState(false);

  // Statistics
  const totalStudents = students.length;
  const presentCount = students.filter((s) => s.status === 'present').length;
  const absentCount = students.filter((s) => s.status === 'absent').length;
  const lateCount = students.filter((s) => s.status === 'late').length;
  const excusedCount = students.filter((s) => s.status === 'excused').length;
  const todayPercentage = totalStudents > 0 ? Math.round(((presentCount + lateCount) / totalStudents) * 100) : 0;

  const defaulters = useMemo(() => {
    return students.filter((s) => (s.attendedClasses / s.totalClasses) < 0.75);
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'all') return true;
      if (statusFilter === 'defaulter') {
        return (s.attendedClasses / s.totalClasses) < 0.75;
      }
      return s.status === statusFilter;
    });
  }, [students, searchQuery, statusFilter]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Roll Number,Name,Email,Department,Semester,Status,Cumulative Attended,Cumulative Total,Cumulative %'];
    const rows = students.map((s) => {
      const pct = Math.round((s.attendedClasses / s.totalClasses) * 100);
      return `"${s.rollNo}","${s.name}","${s.email}","${s.department}",${s.semester},"${s.status}",${s.attendedClasses},${s.totalClasses},${pct}%`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_${selectedCourse.code}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmitLecture = () => {
    setLectureSubmitted(true);
    setTimeout(() => setLectureSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Bar for Faculty View */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Title & Context */}
            <div className="flex items-center gap-3">
              <img
                src="/src/assets/images/faculty_avatar_1793955457676.jpg"
                alt="Dr. Sunita Rao"
                className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                    AttendEase · College Attendance Dashboard
                  </h1>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">Dr. Sunita Rao</span>
                  <span aria-hidden="true">·</span>
                  <span>Professor & Head, CSE Dept</span>
                  <span aria-hidden="true">·</span>
                  <span>ID: FAC-2018</span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Navigation Link to Student View */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => onNavigateScreen('student')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title="Preview Student Portal Experience"
              >
                <GraduationCap className="w-3.5 h-3.5 text-slate-600" />
                <span>View Student Portal</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>
              <button
                onClick={() => onNavigateScreen('recovery')}
                className="text-xs text-slate-500 hover:text-slate-900 transition-colors"
              >
                Account Security
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Lecture Session Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Course & Section Select */}
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Current Lecture:
              </label>
              <select
                value={selectedCourse.id}
                onChange={(e) => {
                  const course = FACULTY_COURSES.find((c) => c.id === e.target.value);
                  if (course) setSelectedCourse(course);
                }}
                className="text-sm font-bold text-slate-900 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {FACULTY_COURSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} · {c.title} ({c.section})
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium">Today, Nov 06, 2026</span>
                <span className="text-slate-300">|</span>
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedCourse.timeSlot}</span>
                <span className="text-slate-300">|</span>
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedCourse.room}</span>
              </div>
            </div>

            {/* Quick Session Tools */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
              >
                <QrCode className="w-4 h-4 text-emerald-700" />
                <span>Project QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDefaulterModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
              >
                <Bell className="w-3.5 h-3.5 text-rose-600" />
                <span>Alert Defaulters ({defaulters.length})</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
                title="Download CSV spreadsheet"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Attendance KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="text-xs font-medium text-slate-500 mb-1 flex items-center justify-between">
              <span>Total Enrolled</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {totalStudents}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Section A (5th Sem CSE)</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="text-xs font-medium text-slate-500 mb-1 flex items-center justify-between">
              <span>Today's Attendance</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
              {todayPercentage}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {presentCount} present · {lateCount} late · {absentCount} absent
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="text-xs font-medium text-slate-500 mb-1 flex items-center justify-between">
              <span>At-Risk Defaulters</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-rose-600 tabular-nums">
              {defaulters.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Below mandatory 75% limit</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="text-xs font-medium text-slate-500 mb-1 flex items-center justify-between">
              <span>Semester Average</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              81.4%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">CS-301 Course Benchmark</div>
          </div>
        </div>

        {/* Weekly Trend Mini-Visualization & Class Rhythm */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Weekly Attendance Trajectory & Benchmark Compliance
              </h3>
              <p className="text-xs text-slate-500">
                Comparison against mandatory 75% Board of Studies threshold
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-xs bg-slate-900" />
                Actual Class Turnout
              </span>
              <span className="flex items-center gap-1.5 text-rose-600 font-medium">
                <span className="w-3 h-0.5 bg-rose-500" />
                75% Minimum Threshold
              </span>
            </div>
          </div>

          {/* Graphical Bar representation */}
          <div className="pt-4 grid grid-cols-5 gap-3 sm:gap-6 text-center">
            {[
              { day: 'Mon (Nov 02)', rate: 85, count: '41/48' },
              { day: 'Tue (Nov 03)', rate: 81, count: '39/48' },
              { day: 'Wed (Nov 04)', rate: 79, count: '38/48' },
              { day: 'Thu (Nov 05)', rate: 87, count: '42/48' },
              { day: 'Today (Nov 06)', rate: todayPercentage, count: `${presentCount + lateCount}/${totalStudents}` },
            ].map((slot, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="font-mono text-xs font-bold text-slate-900 tabular-nums mb-1">
                  {slot.rate}%
                </div>
                <div className="w-full bg-slate-100 rounded-lg h-24 relative flex items-end p-1 border border-slate-200">
                  {/* 75% line */}
                  <div
                    className="absolute w-full left-0 border-b border-dashed border-rose-400 z-10"
                    style={{ bottom: '75%' }}
                    title="75% Requirement"
                  />
                  <div
                    className={`w-full rounded-md transition-all duration-500 ${
                      slot.rate >= 75 ? 'bg-slate-900' : 'bg-rose-500'
                    }`}
                    style={{ height: `${slot.rate}%` }}
                  />
                </div>
                <div className="text-[11px] font-semibold text-slate-700 mt-2 truncate w-full">
                  {slot.day}
                </div>
                <div className="text-[10px] font-mono text-slate-400 tabular-nums">
                  {slot.count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Attendance Roster Management Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Table Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student by name or roll no..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg overflow-x-auto text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({students.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('present')}
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                  statusFilter === 'present'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Present ({presentCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('absent')}
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                  statusFilter === 'absent'
                    ? 'bg-white text-rose-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Absent ({absentCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('defaulter')}
                className={`px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === 'defaulter'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-rose-700 hover:bg-rose-100/50'
                }`}
              >
                At Risk (&lt;75%) ({defaulters.length})
              </button>
            </div>

            {/* Bulk Marking */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onMarkAllStatus('present')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => onMarkAllStatus('absent')}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Roster Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4 text-center">Semester %</th>
                  <th className="py-3 px-4 text-center">Today's Attendance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No students found matching current search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const pct = Math.round((student.attendedClasses / student.totalClasses) * 100);
                    const isAtRisk = pct < 75;

                    return (
                      <tr
                        key={student.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        {/* Student Name & Avatar */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {student.avatar ? (
                              <img
                                src={student.avatar}
                                alt={student.name}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                                {student.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-slate-900 flex items-center gap-2">
                                <span>{student.name}</span>
                                {isAtRisk && (
                                  <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded px-1.5 py-0.2">
                                    Defaulter
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-500 text-[11px]">{student.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Roll Number */}
                        <td className="py-3 px-4 font-mono font-medium text-slate-700 tabular-nums">
                          {student.rollNo}
                        </td>

                        {/* Semester % & Progress Bar */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span
                              className={`font-mono font-bold text-xs tabular-nums ${
                                isAtRisk ? 'text-rose-600' : 'text-slate-900'
                              }`}
                            >
                              {pct}%{' '}
                              <span className="text-slate-400 font-normal">
                                ({student.attendedClasses}/{student.totalClasses})
                              </span>
                            </span>
                            <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden border border-slate-200">
                              <div
                                className={`h-full rounded-full ${
                                  pct >= 75
                                    ? 'bg-emerald-500'
                                    : pct >= 65
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(100, pct)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Status Buttons */}
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onUpdateStudentStatus(student.id, 'present')}
                              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                                student.status === 'present'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              P
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateStudentStatus(student.id, 'absent')}
                              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                                student.status === 'absent'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              A
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateStudentStatus(student.id, 'late')}
                              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                                student.status === 'late'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              L
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateStudentStatus(student.id, 'excused')}
                              className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                                student.status === 'excused'
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                              title="Approved On-Duty / Medical Exemption"
                            >
                              OD
                            </button>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedStudent(student)}
                              className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
                            >
                              Dossier
                            </button>
                            {onSelectStudentForPortal && (
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectStudentForPortal(student.id);
                                  onNavigateScreen('student');
                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                                title="Open this student's portal"
                              >
                                View Portal
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Submit Lecture Button */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-800">{filteredStudents.length}</span> of {students.length} students enrolled in {selectedCourse.code} Section A.
            </div>

            <div className="flex items-center gap-3">
              {lectureSubmitted && (
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Lecture attendance locked and synced to University ERP
                </span>
              )}

              <button
                type="button"
                onClick={handleSubmitLecture}
                className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
              >
                Submit & Finalize Lecture Record
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <DefaulterAlertModal
        isOpen={isDefaulterModalOpen}
        onClose={() => setIsDefaulterModalOpen(false)}
        defaulters={defaulters}
        courseCode={selectedCourse.code}
      />

      <QrAttendanceModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        courseTitle={selectedCourse.title}
        courseCode={selectedCourse.code}
        room={selectedCourse.room}
      />

      <StudentProfileModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onStatusChange={(id, status) => {
          onUpdateStudentStatus(id, status);
          if (selectedStudent && selectedStudent.id === id) {
            setSelectedStudent({ ...selectedStudent, status });
          }
        }}
      />
    </div>
  );
};
