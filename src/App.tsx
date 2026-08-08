import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { Login } from './pages/Login';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentProfile } from './pages/StudentProfile';
import { AcademicOverview } from './pages/AcademicOverview';
import { CourseRegistration } from './pages/CourseRegistration';
import { TimetablePage } from './pages/TimetablePage';
import { AttendanceDashboard } from './pages/AttendanceDashboard';
import { ExamManagement } from './pages/ExamManagement';
import { ResultsDashboard } from './pages/ResultsDashboard';
import { FinancePage } from './pages/FinancePage';
import { HostelManagement } from './pages/HostelManagement';
import { TransportManagement } from './pages/TransportManagement';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { EventsAnnouncements } from './pages/EventsAnnouncements';
import { FeedbackPage } from './pages/FeedbackPage';
import { DocumentManagement } from './pages/DocumentManagement';
import { DocumentVerification } from './pages/DocumentVerification';
import { FacultyPortal } from './pages/FacultyPortal';
import { AdminDashboard } from './pages/AdminDashboard';
import { SettingsPage } from './pages/SettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({
  children,
  roles,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    if (user.role === 'STUDENT') return <Navigate to="/dashboard" replace />;
    if (user.role === 'FACULTY') return <Navigate to="/faculty" replace />;
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

const HomeRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'SUPER_ADMIN' || user.role === 'UNIVERSITY_ADMIN') {
    return <Navigate to="/admin" replace />;
  }
  if (user.role === 'FACULTY') return <Navigate to="/faculty" replace />;
  return <Navigate to="/dashboard" replace />;
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/verify/:documentId" element={<DocumentVerification />} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/profile" element={<StudentProfile />} />
        <Route path="/academic" element={<AcademicOverview />} />
        <Route path="/courses" element={<CourseRegistration />} />
        <Route path="/timetable" element={<TimetablePage />} />
        <Route path="/attendance" element={<AttendanceDashboard />} />
        <Route path="/exams" element={<ExamManagement />} />
        <Route path="/results" element={<ResultsDashboard />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/hostel" element={<HostelManagement />} />
        <Route path="/transport" element={<TransportManagement />} />
        <Route path="/assignments" element={<AssignmentsPage />} />
        <Route path="/events" element={<EventsAnnouncements />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/documents" element={<DocumentManagement />} />
        <Route path="/faculty" element={<FacultyPortal />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
