import React, { useState, useEffect } from 'react';
import { ActiveScreen } from '../types/attendance';
import {
  KeyRound,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Phone,
  Building2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface PasswordRecoveryProps {
  onNavigateScreen: (screen: ActiveScreen) => void;
}

export const PasswordRecovery: React.FC<PasswordRecoveryProps> = ({ onNavigateScreen }) => {
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [identifier, setIdentifier] = useState('2023CS0142');
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 2 OTP State
  const [otp, setOtp] = useState(['4', '8', '2', '9', '1', '0']);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [otpError, setOtpError] = useState('');

  // Step 3 Password State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentStep === 2 && secondsRemaining > 0) {
      timer = setInterval(() => setSecondsRemaining((s) => s - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [currentStep, secondsRemaining]);

  // Password rules validation
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isPasswordValid = hasMinLength && hasUpper && hasNumber && hasSpecial && passwordsMatch;

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setCurrentStep(2);
    setSecondsRemaining(60);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) {
      val = val[val.length - 1];
    }
    const nextOtp = [...otp];
    nextOtp[index] = val;
    setOtp(nextOtp);

    // Auto-advance
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setOtpError('Please enter the full 6-digit verification code.');
      return;
    }
    setOtpError('');
    setCurrentStep(3);
  };

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) return;

    setResetting(true);
    setTimeout(() => {
      setResetting(false);
      setCurrentStep(4);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                <KeyRound className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900">
                  AttendEase · Password Recovery & Credentials Reset
                </h1>
                <p className="text-xs text-slate-500">
                  Campus Single Sign-On (SSO) Self-Service Security Gateway
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateScreen('faculty')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Form Layout */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Wizard Form Card (2 cols) */}
          <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            {/* Step Progress Indicators */}
            <div className="mb-8">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-100 z-0" />
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-900 transition-all duration-300 z-0"
                  style={{
                    width:
                      currentStep === 1
                        ? '0%'
                        : currentStep === 2
                        ? '33%'
                        : currentStep === 3
                        ? '66%'
                        : '100%',
                  }}
                />

                {[
                  { step: 1, label: 'Identity' },
                  { step: 2, label: 'Verify OTP' },
                  { step: 3, label: 'New Password' },
                  { step: 4, label: 'Complete' },
                ].map((s) => {
                  const isDone = currentStep > s.step;
                  const isCurrent = currentStep === s.step;

                  return (
                    <div
                      key={s.step}
                      className="flex flex-col items-center relative z-10 bg-white px-2"
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isDone
                            ? 'bg-slate-900 text-white'
                            : isCurrent
                            ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-50'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                      </div>
                      <span
                        className={`text-[11px] font-medium mt-1 ${
                          isCurrent ? 'text-slate-900 font-bold' : 'text-slate-400'
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STEP 1: Identification */}
            {currentStep === 1 && (
              <form onSubmit={handleStep1Submit} className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Find Your Campus Account
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter your University Roll Number, Faculty ID, or registered institutional email address.
                  </p>
                </div>

                {/* Role Switcher */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setRole('student');
                        setIdentifier('2023CS0142');
                      }}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                        role === 'student'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Student Account
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRole('faculty');
                        setIdentifier('dr.sunita.rao@collegemail.edu');
                      }}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                        role === 'faculty'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Faculty / Staff Account
                    </button>
                  </div>
                </div>

                {/* Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {role === 'student'
                      ? 'University Roll Number or Campus Email'
                      : 'Faculty ID or Official Email'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={
                        role === 'student' ? 'e.g. 2023CS0142 or aarav@collegemail.edu' : 'e.g. FAC-2018'
                      }
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    A 6-digit one-time authentication code (OTP) will be transmitted to the verified mobile phone and email on college file.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onNavigateScreen('student')}
                    className="text-xs text-slate-500 hover:text-slate-900 font-medium"
                  >
                    Cancel and return
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>Request Verification OTP</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: OTP Verification */}
            {currentStep === 2 && (
              <form onSubmit={handleStep2Submit} className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Enter Verification Code
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    We sent a 6-digit code for account <strong className="text-slate-800">{identifier}</strong> to your registered mobile and college inbox.
                  </p>
                </div>

                {/* 6 Digit OTP inputs */}
                <div>
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-input-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-10 sm:w-12 h-12 sm:h-14 text-center font-mono font-bold text-lg sm:text-xl border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-slate-50 focus:bg-white"
                      />
                    ))}
                  </div>

                  {otpError && (
                    <div className="text-xs text-rose-600 text-center mt-2">{otpError}</div>
                  )}

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Code expires in:{' '}
                      <strong className="font-mono tabular-nums text-slate-800">
                        {secondsRemaining}s
                      </strong>
                    </span>
                    <button
                      type="button"
                      disabled={secondsRemaining > 0}
                      onClick={() => setSecondsRemaining(60)}
                      className="text-slate-700 hover:text-slate-900 font-semibold disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      Resend Code
                    </button>
                  </div>
                </div>

                {/* Helper quick demo banner */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
                  <span>Prototype Demo OTP: <strong>482910</strong></span>
                  <button
                    type="button"
                    onClick={() => setOtp(['4', '8', '2', '9', '1', '0'])}
                    className="font-bold underline text-emerald-900 hover:text-emerald-950"
                  >
                    Quick Fill
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-slate-500 hover:text-slate-900 font-medium"
                  >
                    Change Identifier
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>Verify & Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Set New Password */}
            {currentStep === 3 && (
              <form onSubmit={handleStep3Submit} className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Set New Password
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Create a strong, unique password conforming to University IT security guidelines.
                  </p>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new strong password"
                      required
                      className="w-full pr-10 pl-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                      className="w-full pr-10 pl-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Security Criteria Checklist */}
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                  <div className="font-semibold text-slate-700 mb-1">Password Requirements:</div>
                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700' : 'text-slate-500'}`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-700' : 'text-slate-500'}`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 ${hasUpper ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span>Uppercase letter (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700' : 'text-slate-500'}`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 ${hasNumber ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span>At least one number (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-700' : 'text-slate-500'}`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 ${hasSpecial ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span>Special symbol (!@#$)</span>
                    </div>
                  </div>
                  {confirmPassword && (
                    <div className={`text-[11px] pt-1 flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-700' : 'text-rose-600'}`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 ${passwordsMatch ? 'text-emerald-600' : 'text-rose-400'}`} />
                      <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match yet'}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setPassword('CampusSecure#2026');
                      setConfirmPassword('CampusSecure#2026');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-900 underline"
                  >
                    Fill Strong Sample Password
                  </button>
                  <button
                    type="submit"
                    disabled={!isPasswordValid || resetting}
                    className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>{resetting ? 'Updating...' : 'Update & Secure Account'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: Success & Confirmation */}
            {currentStep === 4 && (
              <div className="py-6 text-center space-y-5">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Password Successfully Reset
                  </h2>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1">
                    Your credentials for <strong className="text-slate-800">{identifier}</strong> have been updated. All prior session tokens across campus Wi-Fi and terminal kiosks have been revoked.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 max-w-sm mx-auto">
                  <span>Audit Event ID: </span>
                  <span className="font-mono font-semibold text-slate-900">AUTH-SEC-99214</span>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Synced with Central Directory Service · Active Immediately
                  </div>
                </div>

                {/* Direct jumps to prototype dashboards */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigateScreen('student')}
                    className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
                  >
                    Open Student Portal Dashboard →
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateScreen('faculty')}
                    className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Open College Attendance Dashboard →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Side Assistance & Campus IT Helpdesk Card */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs text-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <HelpCircle className="w-4 h-4 text-slate-500" />
                <h3 className="font-bold text-slate-900">Campus IT Helpdesk Support</h3>
              </div>

              <div>
                <div className="font-semibold text-slate-800">Cannot access your mobile?</div>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  If your phone number has changed, visit the Central Computing Facility (CCF) in person with your Student ID card.
                </p>
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-100 text-slate-600 text-[11px]">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Admin Block, Room 108 (CCF Wing)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Extension: 402 / Direct: (020) 2590-4402</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>it-support@college.edu</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-500">
                <strong>Hours:</strong> Mon – Fri, 09:00 AM – 05:00 PM
              </div>
            </div>

            {/* Fast screen switcher prompt */}
            <div className="bg-slate-100/70 rounded-xl border border-slate-200 p-4 text-xs text-slate-600 space-y-2">
              <div className="font-semibold text-slate-900">Prototype Navigation</div>
              <p className="text-[11px] text-slate-500">
                Switch back to verify Screen 1 or Screen 2 anytime using the top navigation bar or buttons below:
              </p>
              <div className="space-y-1.5 pt-1">
                <button
                  onClick={() => onNavigateScreen('faculty')}
                  className="w-full text-left p-2 rounded bg-white hover:bg-slate-50 border border-slate-200 font-medium text-slate-800 flex items-center justify-between"
                >
                  <span>1. College Attendance Dashboard</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </button>
                <button
                  onClick={() => onNavigateScreen('student')}
                  className="w-full text-left p-2 rounded bg-white hover:bg-slate-50 border border-slate-200 font-medium text-slate-800 flex items-center justify-between"
                >
                  <span>2. Student Portal Dashboard</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
