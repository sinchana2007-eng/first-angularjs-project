import React, { useState } from 'react';
import { ActiveScreen, Student, AttendanceStatus, LeaveRequest } from './types/attendance';
import { INITIAL_STUDENTS, INITIAL_LEAVE_REQUESTS } from './data/mockData';
import { PrototypeNav } from './components/PrototypeNav';
import { FacultyDashboard } from './components/FacultyDashboard';
import { StudentPortal } from './components/StudentPortal';
import { PasswordRecovery } from './components/PasswordRecovery';

export default function App() {
  // Screen 1: Initial Screen as specified in prompt
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('faculty');
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('s1');
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);

  // Active student object
  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Update single student attendance status
  const handleUpdateStudentStatus = (id: string, newStatus: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== id) return student;

        const prevStatus = student.status;
        let deltaAttended = 0;

        // If changing to present/late from absent
        if ((newStatus === 'present' || newStatus === 'late') && prevStatus === 'absent') {
          deltaAttended = 1;
        } else if (newStatus === 'absent' && (prevStatus === 'present' || prevStatus === 'late')) {
          deltaAttended = -1;
        }

        return {
          ...student,
          status: newStatus,
          attendedClasses: Math.max(0, Math.min(student.totalClasses, student.attendedClasses + deltaAttended)),
          lastMarked: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      })
    );
  };

  // Bulk mark all students
  const handleMarkAllStatus = (newStatus: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((student) => {
        const prevStatus = student.status;
        let deltaAttended = 0;
        if (newStatus === 'present' && prevStatus === 'absent') {
          deltaAttended = 1;
        } else if (newStatus === 'absent' && (prevStatus === 'present' || prevStatus === 'late')) {
          deltaAttended = -1;
        }

        return {
          ...student,
          status: newStatus,
          attendedClasses: Math.max(0, Math.min(student.totalClasses, student.attendedClasses + deltaAttended)),
          lastMarked: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      })
    );
  };

  // Add leave request
  const handleAddLeaveRequest = (req: Omit<LeaveRequest, 'id' | 'submittedAt'>) => {
    const newRequest: LeaveRequest = {
      ...req,
      id: `lr-${Date.now()}`,
      submittedAt: 'Just now',
    };
    setLeaveRequests((prev) => [newRequest, ...prev]);
  };

  // Student self-checkin via QR/PIN
  const handleStudentSelfCheckIn = (studentId: string, _courseCode: string) => {
    handleUpdateStudentStatus(studentId, 'present');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Prototype Navigation Bar with high-visibility screen selector */}
      <PrototypeNav
        currentScreen={currentScreen}
        onSelectScreen={setCurrentScreen}
        selectedStudentName={currentStudent.name}
      />

      {/* Screen Views */}
      <div className="flex-1">
        {currentScreen === 'faculty' && (
          <FacultyDashboard
            students={students}
            onUpdateStudentStatus={handleUpdateStudentStatus}
            onMarkAllStatus={handleMarkAllStatus}
            onNavigateScreen={setCurrentScreen}
            onSelectStudentForPortal={(id) => {
              setSelectedStudentId(id);
              setCurrentScreen('student');
            }}
          />
        )}

        {currentScreen === 'student' && (
          <StudentPortal
            currentStudent={currentStudent}
            allStudents={students}
            onSelectStudent={setSelectedStudentId}
            onNavigateScreen={setCurrentScreen}
            leaveRequests={leaveRequests}
            onAddLeaveRequest={handleAddLeaveRequest}
            onStudentSelfCheckIn={handleStudentSelfCheckIn}
          />
        )}

        {currentScreen === 'recovery' && (
          <PasswordRecovery onNavigateScreen={setCurrentScreen} />
        )}
      </div>
    </div>
  );
}
