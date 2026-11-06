import React, { useState } from 'react';
import { LeaveRequest } from '../types/attendance';
import { FileText, Upload, Calendar, X, CheckCircle, AlertCircle } from 'lucide-react';

interface LeaveApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  studentRollNo: string;
  onSubmitLeave: (req: Omit<LeaveRequest, 'id' | 'submittedAt'>) => void;
}

export const LeaveApplicationModal: React.FC<LeaveApplicationModalProps> = ({
  isOpen,
  onClose,
  studentName,
  studentRollNo,
  onSubmitLeave,
}) => {
  const [category, setCategory] = useState<LeaveRequest['category']>('Medical');
  const [startDate, setStartDate] = useState('2026-11-10');
  const [endDate, setEndDate] = useState('2026-11-12');
  const [reason, setReason] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    onSubmitLeave({
      studentId: studentRollNo,
      studentName,
      rollNo: studentRollNo,
      startDate,
      endDate,
      category,
      reason,
      status: 'Pending',
      documentName: fileName || (category === 'Medical' ? 'medical_certificate.pdf' : 'event_approval_letter.pdf'),
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Apply for Attendance Leave / On-Duty Exemption
              </h3>
              <p className="text-xs text-slate-500">
                Official Dean of Student Affairs Academic Sanction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              Leave Application Lodged Successfully
            </h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Your request for <span className="font-semibold text-slate-800">{category} Leave</span> from {startDate} to {endDate} has been forwarded to the Course Mentor and Academic Section.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Student Info */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500">Applicant: </span>
                <span className="font-semibold text-slate-900">{studentName}</span>
              </div>
              <div>
                <span className="text-slate-500">Roll No: </span>
                <span className="font-mono font-semibold text-slate-900">{studentRollNo}</span>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Leave Category / Sanction Type
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
              >
                <option value="Medical">Medical Leave (Doctor Certificate Required)</option>
                <option value="Academic Event">Academic Conference / Hackathon / Symposium</option>
                <option value="On-Duty Sports">University Sports / Inter-Collegiate Athletics</option>
                <option value="Family Emergency">Urgent Personal / Family Emergency</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                  required
                />
              </div>
            </div>

            {/* Justification Reason */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detailed Statement & Justification
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Specify clinical condition, competition details, or emergency reason..."
                rows={3}
                required
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
              />
            </div>

            {/* Document Upload Simulation */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supporting Verification Document
              </label>
              <div
                onClick={() => setFileName('medical_certificate_scanned.pdf')}
                className="border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-lg p-3 text-center cursor-pointer transition-colors"
              >
                <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                <span className="text-xs text-slate-600 block">
                  {fileName ? (
                    <span className="font-semibold text-emerald-700">Attached: {fileName}</span>
                  ) : (
                    <>Click to attach proof (Doctor's Note, Hackathon Ticket, or OD Form)</>
                  )}
                </span>
                <span className="text-[10px] text-slate-400">PDF, JPG, PNG up to 10MB</span>
              </div>
            </div>

            {/* Note on University Attendance Rule */}
            <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                Approved leaves are marked as <strong>OD (Excused)</strong> and count positively towards statutory minimum exam eligibility.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!reason.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
              >
                Submit Exemption Request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
