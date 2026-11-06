import React from 'react';
import { ActiveScreen } from '../types/attendance';
import { ShieldCheck, GraduationCap, KeyRound, ArrowRight } from 'lucide-react';

interface PrototypeNavProps {
  currentScreen: ActiveScreen;
  onSelectScreen: (screen: ActiveScreen) => void;
  selectedStudentName: string;
}

export const PrototypeNav: React.FC<PrototypeNavProps> = ({
  currentScreen,
  onSelectScreen,
  selectedStudentName,
}) => {
  const screens: { id: ActiveScreen; label: string; number: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'faculty',
      number: '1',
      label: 'College Attendance Dashboard',
      icon: <ShieldCheck className="w-4 h-4" />,
      desc: 'Faculty lecture marker, stats & alerts',
    },
    {
      id: 'student',
      number: '2',
      label: 'Student Portal Dashboard',
      icon: <GraduationCap className="w-4 h-4" />,
      desc: `Student view (${selectedStudentName}), bunk calculator & leaves`,
    },
    {
      id: 'recovery',
      number: '3',
      label: 'Password Recovery',
      icon: <KeyRound className="w-4 h-4" />,
      desc: 'Roll No / Email OTP verification & reset',
    },
  ];

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-2.5 gap-3">
          {/* Brand & Prototype Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">AE</span>
                AttendEase
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">·</span>
              <span className="text-xs text-slate-300 hidden sm:inline font-medium">Prototype Navigation Spec</span>
            </div>
          </div>

          {/* 3 Screens Segmented Navigation */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-800/90 rounded-lg overflow-x-auto max-w-full">
            {screens.map((screen) => {
              const isActive = currentScreen === screen.id;
              return (
                <button
                  key={screen.id}
                  onClick={() => onSelectScreen(screen.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-sm font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                  }`}
                  title={screen.desc}
                >
                  <span className={`w-4 h-4 rounded text-[10px] flex items-center justify-center font-bold ${
                    isActive ? 'bg-slate-950 text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {screen.number}
                  </span>
                  <span>{screen.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick jump highlight */}
          <div className="hidden lg:flex items-center text-xs text-slate-400 gap-1.5 shrink-0">
            <span>Viewing:</span>
            <span className="text-emerald-400 font-medium">
              {currentScreen === 'faculty' && 'Screen 1: Faculty Dashboard'}
              {currentScreen === 'student' && 'Screen 2: Student Portal'}
              {currentScreen === 'recovery' && 'Screen 3: Password Recovery'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
