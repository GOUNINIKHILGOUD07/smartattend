import React from 'react';
import { useApp } from './context/AppContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { AdminDashboard } from './screens/AdminDashboard';
import { TeacherDashboard } from './screens/TeacherDashboard';
import { StudentDashboard } from './screens/StudentDashboard';
import { ManagementScreen } from './screens/ManagementScreen';
import { QRAttendanceScreen } from './screens/QRAttendanceScreen';
import { AttendanceHistoryScreen } from './screens/AttendanceHistoryScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { MyCoursesScreen } from './screens/MyCoursesScreen';
import { QRCodesHubScreen } from './screens/QRCodesHubScreen';
import { StudentJoinCourseScreen } from './screens/StudentJoinCourseScreen';
import { StudentScanAttendanceScreen } from './screens/StudentScanAttendanceScreen';

export const App = () => {
  const { currentUser, authView, activeTab } = useApp();

  // If not authenticated, render Login or Register screen
  if (!currentUser) {
    if (authView === 'register') {
      return <RegisterScreen />;
    }
    return <LoginScreen />;
  }

  // Authenticated Dashboard Views
  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        if (currentUser.role === 'teacher') return <TeacherDashboard />;
        if (currentUser.role === 'student') return <StudentDashboard />;
        return <AdminDashboard />;

      case 'my-courses':
        return <MyCoursesScreen initialCreateMode={false} />;

      case 'create-course':
        return <MyCoursesScreen initialCreateMode={true} />;

      case 'qr-codes':
        return <QRCodesHubScreen />;

      case 'join-course':
        return <StudentJoinCourseScreen />;

      case 'scan-attendance':
        return <StudentScanAttendanceScreen />;

      case 'classes':
        if (currentUser.role === 'teacher') return <MyCoursesScreen />;
        return <ManagementScreen defaultTab="classes" />;

      case 'students':
        return <ManagementScreen defaultTab="students" />;

      case 'attendance':
      case 'attendance-history':
        return <AttendanceHistoryScreen />;

      case 'qr-attendance':
        if (currentUser.role === 'student') {
          return <StudentScanAttendanceScreen />;
        }
        return <QRCodesHubScreen />;

      case 'reports':
        return <ReportsScreen />;

      default:
        if (currentUser.role === 'teacher') return <TeacherDashboard />;
        if (currentUser.role === 'student') return <StudentDashboard />;
        return <AdminDashboard />;
    }
  };

  return <DashboardLayout>{renderActiveScreen()}</DashboardLayout>;
};

export default App;
