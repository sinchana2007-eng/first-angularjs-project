import React, { useState, useMemo } from 'react';
import { Student, SubjectAttendance, AttendanceRecord, LeaveRequest, ActiveScreen } from '../types/attendance';
import { STUDENT_SUBJECTS, RECENT_ATTENDANCE_LOGS } from '../data/mockData';
import { LeaveApplicationModal } from './LeaveApplicationModal';
import { StudentCheckInModal } from './StudentCheckInModal';
import {
  GraduationCap,
  ShieldAlert,
  ShieldCheck,
  Calculator,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  QrCode,
  FileText,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  UserCheck,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react';

interface StudentPortalProps {
  currentStudent: Student;
  allStudents: Student[];
  onSelectStudent: (studentId: string) => void;
  onNavigateScreen: (screen: ActiveScreen) => void;
  leaveRequests: LeaveRequest[];
  onAddLeaveRequest: (req: Omit<LeaveRequest, 'id' | 'submittedAt'>) => void;
  onStudentSelfCheckIn: (studentId: string, courseCode: string) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  currentStudent,
  allStudents,
  onSelectStudent,
  onNavigateScreen,
  leaveRequests,
  onAddLeaveRequest,
  onStudentSelfCheckIn,
}) => {
  const [targetPercentage, setTargetPercentage] = useState<number>(75);
  const [simAttend, setSimAttend] = useState<number>(4);
  const [simMiss, setSimMiss] = useState<number>(0);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState(false);

  // Student specific subjects
  const subjects: SubjectAttendance[] =
    STUDENT_SUBJECTS[currentStudent.id] || STUDENT_SUBJECTS['s1'];

  // Current attendance statistics
  const totalClasses = currentStudent.totalClasses;
  const attendedClasses = currentStudent.attendedClasses;
  const currentPercentage = Math.round((attendedClasses / totalClasses) * 100);
  const isDefaulter = currentPercentage < 75;

  // Bunk / Margin Calculator Math
  // Safe margin formula: floor((attended - (target / 100) * total) / (target / 100))
  // Defaulter recovery formula: ceil(((target / 100) * total - attended) / (1 - (target / 100)))
  const targetFraction = targetPercentage / 100;
  
  const canBunkClasses = useMemo(() => {
    if (currentPercentage < targetPercentage) return 0;
    const margin = Math.floor((attendedClasses - targetFraction * totalClasses) / targetFraction);
    return Math.max(0, margin);
  }, [attendedClasses, totalClasses, targetFraction, currentPercentage, targetPercentage]);

  const mustAttendClasses = useMemo(() => {
    if (currentPercentage >= targetPercentage) return 0;
    const required = Math.ceil((targetFraction * totalClasses - attendedClasses) / (1 - targetFraction));
    return Math.max(0, required);
  }, [attendedClasses, totalClasses, targetFraction, currentPercentage, targetPercentage]);

  // Projected simulator
  const projectedTotal = totalClasses + simAttend + simMiss;
  const projectedAttended = attendedClasses + simAttend;
  const projectedPercentage = projectedTotal > 0 ? Math.round((projectedAttended / projectedTotal) * 100) : 0;

  // Filter leaves for this student
  const myLeaves = leaveRequests.filter(
    (l) => l.studentId === currentStudent.id || l.rollNo === currentStudent.rollNo
  );

  // Simulated PDF Download
  const handleDownloadTranscript = () => {
    setDownloadNotice(true);
    setTimeout(() => {
      const content = `ATTENDEASE OFFICIAL ATTENDANCE TRANSCRIPT
--------------------------------------------------
Student: ${currentStudent.name}
Roll Number: ${currentStudent.rollNo}
Department: ${currentStudent.department}
Semester: ${currentStudent.semester} (Section ${currentStudent.section})
Report Generated: ${new Date().toLocaleDateString()}
--------------------------------------------------
Overall Attendance: ${currentPercentage}% (${attendedClasses}/${totalClasses} classes)
Compliance Status: ${isDefaulter ? 'DEFAULTER - Action Required' : 'COMPLIANT - Regular Good Standing'}
Minimum University Requirement: 75%
--------------------------------------------------
Course Breakdown:
${subjects.map((s) => `• ${s.code}: ${s.name} - ${Math.round((s.attendedClasses / s.totalClasses) * 100)}% (${s.attendedClasses}/${s.totalClasses})`).join('\n')}
--------------------------------------------------
Dean of Academic Affairs, University Council`;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Attendance_Transcript_${currentStudent.rollNo}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloadNotice(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Student Portal Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Student Persona & Switcher */}
            <div className="flex items-center gap-3">
              {currentStudent.avatar ? (
                <img
                  src={currentStudent.avatar}
                  alt={currentStudent.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                  {currentStudent.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-slate-900">
                    AttendEase · Student Portal
                  </h1>
                  <span className="text-slate-400">·</span>
                  <span className="text-xs font-semibold text-slate-700">
                    {currentStudent.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono text-slate-700 font-medium">
                    {currentStudent.rollNo}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>CSE 5th Sem (Sec {currentStudent.section})</span>
                </div>
              </div>
            </div>

            {/* Persona Switcher & Fast Jumps */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 hidden sm:inline">Switch Student View:</span>
                <select
                  value={currentStudent.id}
                  onChange={(e) => onSelectStudent(e.target.value)}
                  className="text-xs font-semibold text-slate-900 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {allStudents.slice(0, 3).map((st) => {
                    const pct = Math.round((st.attendedClasses / st.totalClasses) * 100);
                    return (
                      <option key={st.id} value={st.id}>
                        {st.name} ({pct}% {pct < 75 ? '⚠️ Defaulter' : '✓ Safe'})
                      </option>
                    );
                  })}
                </select>
              </div>

              <button
                onClick={() => onNavigateScreen('faculty')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title="Return to Faculty Dashboard"
              >
                <span>Back to Faculty Dashboard</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* At-Risk Warning Callout if below 75% */}
        {isDefaulter && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-900">
                  Attendance Compliance Defaulter Notice ({currentPercentage}%)
                </h3>
                <p className="text-xs text-rose-700 mt-0.5">
                  Your aggregate attendance has fallen below the mandatory <strong>75%</strong> University Board threshold. You are required to attend next <strong>{mustAttendClasses} consecutive lectures</strong> to prevent semester hall-ticket debarment.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap shadow-xs transition-colors shrink-0"
            >
              Submit Medical Certificate / OD
            </button>
          </div>
        )}

        {/* Hero Card & KPI Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Attendance Gauge Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Overall Semester Record
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isDefaulter
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isDefaulter ? 'Action Required' : 'Good Standing'}
                </span>
              </div>

              {/* Circular Gauge Simulation with Clean Typographic Center */}
              <div className="flex items-center justify-center my-3">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {/* Background Ring */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="text-slate-100"
                      strokeWidth="9"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    {/* Minimum 75% tick marker */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 * (1 - 0.75)}
                      className="text-slate-300"
                      strokeWidth="9"
                      stroke="currentColor"
                      fill="transparent"
                      strokeDashoffset-style={{}}
                    />
                    {/* Foreground Progress */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 * (1 - currentPercentage / 100)}
                      className={isDefaulter ? 'text-rose-500' : 'text-slate-900'}
                      strokeWidth="9"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-extrabold font-mono text-slate-900 tabular-nums">
                      {currentPercentage}%
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-slate-500">
                      Minimum 75%
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-slate-100">
                <div>
                  <div className="text-[10px] font-medium text-slate-400 uppercase">Attended</div>
                  <div className="text-base font-bold font-mono text-slate-900 tabular-nums">
                    {attendedClasses}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-medium text-slate-400 uppercase">Total Held</div>
                  <div className="text-base font-bold font-mono text-slate-900 tabular-nums">
                    {totalClasses}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-medium text-slate-400 uppercase">Absences</div>
                  <div className="text-base font-bold font-mono text-rose-600 tabular-nums">
                    {totalClasses - attendedClasses}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Strip */}
            <div className="pt-5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCheckInModalOpen(true)}
                className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>Self Check-in</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadTranscript}
                className="py-2 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                title="Download Official Attendance Report"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>{downloadNotice ? 'Generating...' : 'Transcript'}</span>
              </button>
            </div>
          </div>

          {/* Smart Attendance & Bunk Margin Calculator */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Attendance Margin & Bunk Calculator
                    </h3>
                    <p className="text-xs text-slate-500">
                      Determine how many classes you can afford to miss or need to attend
                    </p>
                  </div>
                </div>

                {/* Target percentage selector */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs self-start sm:self-auto">
                  <span className="text-slate-500 px-1 font-medium text-[11px]">Goal:</span>
                  {[75, 80, 85].map((target) => (
                    <button
                      key={target}
                      type="button"
                      onClick={() => setTargetPercentage(target)}
                      className={`px-2 py-0.5 rounded-md font-semibold font-mono tabular-nums transition-colors ${
                        targetPercentage === target
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {target}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Margin Result Box */}
              <div className="my-4 p-4 rounded-xl border bg-slate-50 border-slate-200">
                {currentPercentage >= targetPercentage ? (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                        Comfortable Safe Zone ({currentPercentage}% vs {targetPercentage}% Goal)
                      </div>
                      <div className="text-sm text-slate-800 mt-0.5">
                        You can safely skip up to{' '}
                        <span className="font-mono text-lg font-extrabold text-emerald-700 underline decoration-emerald-400">
                          {canBunkClasses} more {canBunkClasses === 1 ? 'class' : 'classes'}
                        </span>{' '}
                        and maintain at least {targetPercentage}% overall eligibility.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-rose-800 uppercase tracking-wide">
                        Attendance Recovery Required
                      </div>
                      <div className="text-sm text-slate-800 mt-0.5">
                        You need to attend the next{' '}
                        <span className="font-mono text-lg font-extrabold text-rose-600 underline decoration-rose-400">
                          {mustAttendClasses} consecutive {mustAttendClasses === 1 ? 'lecture' : 'lectures'}
                        </span>{' '}
                        without missing any to restore {targetPercentage}% compliance.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* What-If Interactive Simulator */}
              <div className="bg-white rounded-lg border border-slate-200 p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                    Interactive "What-If" Scenario Simulator
                  </span>
                  <span className="font-mono text-slate-900">
                    Projected: <strong className={projectedPercentage >= 75 ? 'text-emerald-700' : 'text-rose-600'}>{projectedPercentage}%</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>Attend next lectures:</span>
                      <span className="font-mono font-bold text-slate-900">{simAttend} classes</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={simAttend}
                      onChange={(e) => setSimAttend(Number(e.target.value))}
                      className="w-full accent-slate-900"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>Miss next lectures:</span>
                      <span className="font-mono font-bold text-slate-900">{simMiss} classes</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={simMiss}
                      onChange={(e) => setSimMiss(Number(e.target.value))}
                      className="w-full accent-slate-900"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Info className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>
                    Simulated formula: ({attendedClasses} + {simAttend}) / ({totalClasses} + {simAttend + simMiss}) = {projectedPercentage}%
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Standard Council Rule: Section 4.2 Minimum 75% Attendance Requirement</span>
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(true)}
                className="font-medium text-slate-900 hover:underline"
              >
                Apply for On-Duty Sanction →
              </button>
            </div>
          </div>
        </div>

        {/* Subject-Wise Breakdown Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Course & Subject-Wise Attendance Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Detailed attendance stats per enrolled theory course and lab module
              </p>
            </div>
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors self-start sm:self-auto"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Apply for Subject Exemption</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Instructor & Room</th>
                  <th className="py-3 px-4 text-center">Classes Attended</th>
                  <th className="py-3 px-4 text-center">Attendance %</th>
                  <th className="py-3 px-4">Status & Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((sub) => {
                  const pct = Math.round((sub.attendedClasses / sub.totalClasses) * 100);
                  const isSubjectDefaulter = pct < 75;
                  const canBunk = Math.floor((sub.attendedClasses - 0.75 * sub.totalClasses) / 0.75);
                  const needAttend = Math.ceil((0.75 * sub.totalClasses - sub.attendedClasses) / 0.25);

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-2">
                            <span className="font-mono text-slate-600">{sub.code}</span>
                            <span>{sub.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {sub.schedule} · {sub.credits} Credits
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="font-medium text-slate-800">{sub.faculty}</div>
                        <div className="text-[11px] text-slate-400">{sub.room}</div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-900 tabular-nums">
                        {sub.attendedClasses} / {sub.totalClasses}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`font-mono font-bold text-xs tabular-nums ${
                              isSubjectDefaulter ? 'text-rose-600' : 'text-slate-900'
                            }`}
                          >
                            {pct}%
                          </span>
                          <div className="w-20 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden border border-slate-200">
                            <div
                              className={`h-full rounded-full ${
                                pct >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {isSubjectDefaulter ? (
                          <span className="text-rose-700 font-medium flex items-center gap-1.5 text-xs">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                            Must attend next {needAttend} classes
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-medium flex items-center gap-1.5 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Can miss {canBunk} classes safely
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lower Grid: Recent Logs & Leave Requests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Attendance Activity */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Recent Lecture Attendance Logs
              </h3>
              <span className="text-xs text-slate-400">Past 5 sessions</span>
            </div>

            <div className="space-y-2.5">
              {RECENT_ATTENDANCE_LOGS.map((log, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      <span className="font-mono text-slate-500">{log.subjectCode}</span>
                      <span>{log.subjectName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {log.date} · {log.timeSlot} · {log.faculty}
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                      log.status === 'present'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.status === 'late'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Leave & On-Duty Applications */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  Leave & On-Duty (OD) Sanctions
                </h3>
                <button
                  onClick={() => setIsLeaveModalOpen(true)}
                  className="text-xs font-semibold text-slate-900 hover:underline"
                >
                  + New Request
                </button>
              </div>

              {myLeaves.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No pending or past leave applications on record.
                </div>
              ) : (
                <div className="space-y-3">
                  {myLeaves.map((leave) => (
                    <div
                      key={leave.id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">
                          {leave.category} Leave
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            leave.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : leave.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {leave.status}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] line-clamp-1">{leave.reason}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                        <span>
                          {leave.startDate} to {leave.endDate}
                        </span>
                        <span>Doc: {leave.documentName || 'Uploaded'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>Have an inquiry or dispute?</span>
              <button
                onClick={() => onNavigateScreen('recovery')}
                className="text-slate-900 font-semibold hover:underline"
              >
                Campus IT & Recovery →
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <LeaveApplicationModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        studentName={currentStudent.name}
        studentRollNo={currentStudent.rollNo}
        onSubmitLeave={onAddLeaveRequest}
      />

      <StudentCheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        onCheckInSuccess={(code) => onStudentSelfCheckIn(currentStudent.id, code)}
      />
    </div>
  );
};
