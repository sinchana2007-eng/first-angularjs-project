import React, { useState, useEffect } from 'react';
import { QrCode, RefreshCw, X, Shield, Users, Check } from 'lucide-react';

interface QrAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  courseCode: string;
  room: string;
  onStudentCheckIn?: (studentName: string) => void;
}

export const QrAttendanceModal: React.FC<QrAttendanceModalProps> = ({
  isOpen,
  onClose,
  courseTitle,
  courseCode,
  room,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [sessionPin, setSessionPin] = useState('849 203');
  const [liveCheckins, setLiveCheckins] = useState<string[]>([
    'Aarav Sharma (2023CS0142)',
    'Ananya Deshmukh (2023CS0104)',
    'Devansh Kulkarni (2023CS0118)',
  ]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Generate new randomized pin
          const part1 = Math.floor(100 + Math.random() * 900);
          const part2 = Math.floor(100 + Math.random() * 900);
          setSessionPin(`${part1} ${part2}`);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const copyPin = () => {
    navigator.clipboard?.writeText?.(sessionPin.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const simulateNewCheckIn = () => {
    const candidates = [
      'Kavya Nair (2023CS0155)',
      'Siddharth Iyer (2023CS0214)',
      'Tanvi Chawla (2023CS0228)',
      'Neha Roy (2023CS0192)',
    ];
    const available = candidates.filter((c) => !liveCheckins.includes(c));
    if (available.length > 0) {
      setLiveCheckins((prev) => [available[0], ...prev]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Live Lecture QR Attendance
              </h3>
              <p className="text-xs text-slate-500">
                {courseCode} · {room} · Dynamic rotating token
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

        {/* Content */}
        <div className="p-6 text-center space-y-6">
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Project this screen on the classroom projector or board. Students scan via the AttendEase Student Portal or enter the live 6-digit session PIN.
          </p>

          {/* QR Container */}
          <div className="inline-block p-4 bg-white border-2 border-slate-900 rounded-2xl shadow-sm relative">
            <svg
              className="w-48 h-48 mx-auto"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Distinctive stylized SVG QR code grid */}
              <rect width="200" height="200" fill="white" />
              {/* Corner 1 */}
              <rect x="16" y="16" width="48" height="48" rx="6" fill="#0f172a" />
              <rect x="24" y="24" width="32" height="32" rx="4" fill="white" />
              <rect x="32" y="32" width="16" height="16" rx="2" fill="#0f172a" />
              {/* Corner 2 */}
              <rect x="136" y="16" width="48" height="48" rx="6" fill="#0f172a" />
              <rect x="144" y="24" width="32" height="32" rx="4" fill="white" />
              <rect x="152" y="32" width="16" height="16" rx="2" fill="#0f172a" />
              {/* Corner 3 */}
              <rect x="16" y="136" width="48" height="48" rx="6" fill="#0f172a" />
              <rect x="24" y="144" width="32" height="32" rx="4" fill="white" />
              <rect x="32" y="152" width="16" height="16" rx="2" fill="#0f172a" />
              {/* Matrix pattern elements */}
              <rect x="76" y="20" width="12" height="24" rx="2" fill="#0f172a" />
              <rect x="96" y="16" width="16" height="12" rx="2" fill="#0f172a" />
              <rect x="116" y="28" width="12" height="16" rx="2" fill="#0f172a" />
              <rect x="24" y="76" width="20" height="12" rx="2" fill="#0f172a" />
              <rect x="52" y="80" width="16" height="16" rx="2" fill="#0f172a" />
              <rect x="76" y="68" width="24" height="24" rx="4" fill="#10b981" />
              <rect x="108" y="76" width="16" height="16" rx="2" fill="#0f172a" />
              <rect x="132" y="72" width="12" height="28" rx="2" fill="#0f172a" />
              <rect x="156" y="80" width="28" height="16" rx="2" fill="#0f172a" />
              <rect x="76" y="104" width="16" height="20" rx="2" fill="#0f172a" />
              <rect x="100" y="100" width="28" height="28" rx="4" fill="#0f172a" />
              <rect x="136" y="112" width="20" height="12" rx="2" fill="#0f172a" />
              <rect x="164" y="104" width="16" height="24" rx="2" fill="#0f172a" />
              <rect x="76" y="144" width="20" height="16" rx="2" fill="#0f172a" />
              <rect x="104" y="136" width="16" height="24" rx="2" fill="#0f172a" />
              <rect x="128" y="140" width="24" height="12" rx="2" fill="#0f172a" />
              <rect x="160" y="144" width="20" height="24" rx="2" fill="#0f172a" />
              <rect x="76" y="168" width="24" height="12" rx="2" fill="#0f172a" />
              <rect x="108" y="168" width="16" height="16" rx="2" fill="#0f172a" />
              <rect x="132" y="160" width="20" height="24" rx="2" fill="#0f172a" />
            </svg>
          </div>

          {/* Session PIN */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-sm mx-auto">
            <div className="text-[11px] font-medium text-slate-500 mb-1 flex items-center justify-between">
              <span>MANUAL BACKUP SESSION PIN</span>
              <span className="font-mono tabular-nums text-emerald-700 font-semibold">
                Expires in {secondsLeft}s
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-2xl font-bold tracking-widest text-slate-900">
                {sessionPin}
              </span>
              <button
                type="button"
                onClick={copyPin}
                className="text-xs px-2.5 py-1 text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : null}
                <span>{copied ? 'Copied' : 'Copy PIN'}</span>
              </button>
            </div>
          </div>

          {/* Real-time checkin feed */}
          <div className="text-left bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                Live Classroom Check-ins ({liveCheckins.length})
              </span>
              <button
                type="button"
                onClick={simulateNewCheckIn}
                className="text-[11px] text-emerald-700 hover:text-emerald-900 font-medium"
              >
                + Simulate Student Scan
              </button>
            </div>
            <div className="space-y-1.5 max-h-24 overflow-y-auto">
              {liveCheckins.map((student, idx) => (
                <div
                  key={idx}
                  className="text-xs text-slate-700 flex items-center justify-between py-1 px-2 bg-white rounded border border-slate-100"
                >
                  <span className="font-medium">{student}</span>
                  <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Verified GPS & Wi-Fi
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              Anti-proxy geofencing active (Lecture Hall B-204)
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              Done / Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
