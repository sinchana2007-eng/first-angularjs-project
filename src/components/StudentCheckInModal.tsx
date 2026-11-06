import React, { useState } from 'react';
import { QrCode, KeyRound, CheckCircle, X, ShieldCheck, MapPin } from 'lucide-react';

interface StudentCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckInSuccess: (courseCode: string) => void;
}

export const StudentCheckInModal: React.FC<StudentCheckInModalProps> = ({
  isOpen,
  onClose,
  onCheckInSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleaned = pin.replace(/\s/g, '');

    if (cleaned.length < 6) {
      setErrorMsg('Please enter a valid 6-digit session code.');
      return;
    }

    // Accept valid pins or standard test pin
    setSuccess(true);
    onCheckInSuccess('CS-301');
    setTimeout(() => {
      setSuccess(false);
      setPin('');
      onClose();
    }, 1800);
  };

  const simulateQrScan = () => {
    setScanning(true);
    setErrorMsg('');
    setTimeout(() => {
      setScanning(false);
      setSuccess(true);
      onCheckInSuccess('CS-301');
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Lecture Self Check-in</h3>
              <p className="text-xs text-slate-500">CS-301 · Lecture Hall B-204</p>
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
        <div className="p-6">
          {success ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Attendance Marked: Present!</h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Timestamp: {new Date().toLocaleTimeString()} · Verified via campus beacon LH-204. Your attendance record has been updated.
              </p>
            </div>
          ) : scanning ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-sm font-semibold text-slate-900">Scanning Camera Stream...</div>
              <p className="text-xs text-slate-500">Aligning with classroom projection code...</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Scan simulation button */}
              <div>
                <button
                  type="button"
                  onClick={simulateQrScan}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span>Scan Projected Classroom QR Code</span>
                </button>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-xs text-slate-400 font-medium">Or enter manual PIN</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Manual 6-digit PIN Form */}
              <form onSubmit={handlePinSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    6-Digit Lecture PIN
                  </label>
                  <input
                    type="text"
                    maxLength={7}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="e.g. 849 203"
                    className="w-full text-center font-mono text-xl tracking-widest p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-bold text-slate-900 placeholder:text-slate-300"
                  />
                  {errorMsg && (
                    <div className="text-xs text-rose-600 mt-1">{errorMsg}</div>
                  )}
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Ask professor for dynamic PIN</span>
                    <button
                      type="button"
                      onClick={() => setPin('849203')}
                      className="text-emerald-700 hover:text-emerald-900 font-medium"
                    >
                      Fill Demo: 849 203
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!pin.trim()}
                  className="w-full py-2.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
                >
                  Verify Code & Check In
                </button>
              </form>

              {/* Geolocation indicator */}
              <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  Geofence Active: Verified inside <strong>Main Engineering Block</strong> Wi-Fi.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
