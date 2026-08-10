import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';

// Lazy-load pages so first paint only downloads the route you need (~smaller initial JS)
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const StudentDashboard = lazy(() =>
  import('./pages/StudentDashboard').then((m) => ({ default: m.StudentDashboard }))
);
const StudentProfile = lazy(() =>
  import('./pages/StudentProfile').then((m) => ({ default: m.StudentProfile }))
);
const AcademicOverview = lazy(() =>
  import('./pages/AcademicOverview').then((m) => ({ default: m.AcademicOverview }))
);
const CourseRegistration = lazy(() =>
  import('./pages/CourseRegistration').then((m) => ({ default: m.CourseRegistration }))
);
const TimetablePage = lazy(() =>
  import('./pages/TimetablePage').then((m) => ({ default: m.TimetablePage }))
);
const AttendanceDashboard = lazy(() =>
  import('./pages/AttendanceDashboard').then((m) => ({ default: m.AttendanceDashboard }))
);
const ExamManagement = lazy(() =>
  import('./pages/ExamManagement').then((m) => ({ default: m.ExamManagement }))
);
const ResultsDashboard = lazy(() =>
  import('./pages/ResultsDashboard').then((m) => ({ default: m.ResultsDashboard }))
);
const FinancePage = lazy(() =>
  import('./pages/FinancePage').then((m) => ({ default: m.FinancePage }))
);
const HostelManagement = lazy(() =>
  import('./pages/HostelManagement').then((m) => ({ default: m.HostelManagement }))
);
const TransportManagement = lazy(() =>
  import('./pages/TransportManagement').then((m) => ({ default: m.TransportManagement }))
);
const AssignmentsPage = lazy(() =>
  import('./pages/AssignmentsPage').then((m) => ({ default: m.AssignmentsPage }))
);
const EventsAnnouncements = lazy(() =>
  import('./pages/EventsAnnouncements').then((m) => ({ default: m.EventsAnnouncements }))
);
const FeedbackPage = lazy(() =>
  import('./pages/FeedbackPage').then((m) => ({ default: m.FeedbackPage }))
);
const DocumentManagement = lazy(() =>
  import('./pages/DocumentManagement').then((m) => ({ default: m.DocumentManagement }))
);
const DocumentVerification = lazy(() =>
  import('./pages/DocumentVerification').then((m) => ({ default: m.DocumentVerification }))
);
const FacultyPortal = lazy(() =>
  import('./pages/FacultyPortal').then((m) => ({ default: m.FacultyPortal }))
);
const AdminDashboard = lazy(() =>
  import('./pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);

const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

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
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
};

export default App;
