import React, { useState } from 'react';
import { Student } from '../types/attendance';
import { AlertTriangle, Send, X, CheckCircle, Mail, Phone } from 'lucide-react';

interface DefaulterAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaulters: Student[];
  courseCode: string;
}

export const DefaulterAlertModal: React.FC<DefaulterAlertModalProps> = ({
  isOpen,
  onClose,
  defaulters,
  courseCode,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(defaulters.map((s) => s.id));
  const [channels, setChannels] = useState<{ email: boolean; sms: boolean }>({
    email: true,
    sms: true,
  });
  const [customNote, setCustomNote] = useState(
    'Please be advised that minimum 75% attendance is strictly mandatory to sit for final semester examinations as per Academic Regulation Section 4.2.'
  );
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const toggleStudent = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSend = () => {
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Attendance Defaulter Warning Notice
              </h3>
              <p className="text-xs text-slate-500">
                Official institutional alert for students below the 75% threshold in {courseCode}
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

        {isSent ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-semibold text-slate-900">Warnings Dispatched Successfully</h4>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Official attendance compliance notices and parent SMS dispatches have been transmitted to {selectedIds.length} flagged students.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Defaulter student list selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">
                  Select Recipients ({selectedIds.length} of {defaulters.length} selected)
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedIds(
                      selectedIds.length === defaulters.length
                        ? []
                        : defaulters.map((s) => s.id)
                    )
                  }
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                >
                  {selectedIds.length === defaulters.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                {defaulters.map((student) => {
                  const pct = Math.round((student.attendedClasses / student.totalClasses) * 100);
                  const isChecked = selectedIds.includes(student.id);
                  return (
                    <label
                      key={student.id}
                      className="flex items-center justify-between px-3.5 py-2.5 hover:bg-slate-50 cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleStudent(student.id)}
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                        />
                        <span className="font-mono text-slate-500">{student.rollNo}</span>
                        <span className="font-medium text-slate-900">{student.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-rose-600 tabular-nums">
                          {pct}% ({student.attendedClasses}/{student.totalClasses})
                        </span>
                        <span className="text-slate-400 font-normal">
                          Parent: {student.parentContact}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Channels */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Notification Delivery Channels
              </label>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 hover:border-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channels.email}
                    onChange={(e) => setChannels({ ...channels, email: e.target.checked })}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <Mail className="w-4 h-4 text-slate-500" />
                  <div>
                    <div className="font-medium text-slate-900">Student & Parent Email</div>
                    <div className="text-slate-500 text-[11px]">Official college letter PDF attached</div>
                  </div>
                </label>
                <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 hover:border-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channels.sms}
                    onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <Phone className="w-4 h-4 text-slate-500" />
                  <div>
                    <div className="font-medium text-slate-900">SMS to Guardian Phone</div>
                    <div className="text-slate-500 text-[11px]">Direct automated SMS alert</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Custom Directive */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notice Directive & Faculty Instructions
              </label>
              <textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                rows={3}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
              />
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
                type="button"
                disabled={selectedIds.length === 0}
                onClick={handleSend}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Dispatch {selectedIds.length} Warning Notices
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
