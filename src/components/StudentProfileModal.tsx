import React from 'react';
import { Student } from '../types/attendance';
import { X, Mail, Phone, Calendar, AlertTriangle, CheckCircle2, User } from 'lucide-react';

interface StudentProfileModalProps {
  student: Student | null;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: Student['status']) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  onClose,
  onStatusChange,
}) => {
  if (!student) return null;

  const pct = Math.round((student.attendedClasses / student.totalClasses) * 100);
  const isDefaulter = pct < 75;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">Student Attendance Dossier</span>
            <span className="text-slate-400">·</span>
            <span className="font-mono text-xs text-slate-500">{student.rollNo}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Student basic info */}
          <div className="flex items-start gap-4">
            {student.avatar ? (
              <img
                src={student.avatar}
                alt={student.name}
                className="w-16 h-16 rounded-full object-cover border border-slate-200 shadow-xs"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg">
                {student.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
            )}
            <div className="flex-1">
              <h4 className="text-lg font-bold text-slate-900">{student.name}</h4>
              <p className="text-xs text-slate-500">
                {student.department} · Semester {student.semester} ({student.section})
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {student.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {student.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Metric highlight box */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Overall Rate
              </div>
              <div
                className={`text-2xl font-bold font-mono tabular-nums ${
                  isDefaulter ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {pct}%
              </div>
              <div className="text-[11px] text-slate-500">
                {isDefaulter ? 'Below 75% limit' : 'Compliant'}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Attended
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {student.attendedClasses}
              </div>
              <div className="text-[11px] text-slate-500">of {student.totalClasses} classes</div>
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Missed
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-700">
                {student.totalClasses - student.attendedClasses}
              </div>
              <div className="text-[11px] text-slate-500">unexcused</div>
            </div>
          </div>

          {/* Warning notice if defaulter */}
          {isDefaulter ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800">
                <div className="font-semibold">Academic Defaulter Alert</div>
                <div>
                  This student has dropped below the 75% mandatory requirement. Parent contact on record:{' '}
                  <span className="font-mono font-medium">{student.parentContact}</span>.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-800">
                <div className="font-semibold">Regular Attendance Record</div>
                <div>Good standing. Eligible for semester end laboratory and theory examinations.</div>
              </div>
            </div>
          )}

          {/* Today's Lecture Marking */}
          <div>
            <div className="text-xs font-semibold text-slate-900 mb-2">
              Update Today's Status for {student.name}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(['present', 'absent', 'late', 'excused'] as const).map((status) => {
                const isActive = student.status === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => onStatusChange(student.id, status)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg capitalize transition-colors ${
                      isActive
                        ? status === 'present'
                          ? 'bg-emerald-600 text-white'
                          : status === 'absent'
                          ? 'bg-rose-600 text-white'
                          : status === 'late'
                          ? 'bg-amber-500 text-white'
                          : 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Close Dossier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
