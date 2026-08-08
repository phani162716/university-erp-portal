import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { login, getMe } from './controllers/authController';
import { getStudentDashboard, getStudentProfile, updateStudentProfile } from './controllers/studentController';
import { getCourses, registerCourse, dropCourse } from './controllers/academicController';
import { getAttendance, markAttendance } from './controllers/attendanceController';
import { getExams, downloadHallTicket } from './controllers/examController';
import { getResults } from './controllers/resultController';
import { getFees, processMockPayment, downloadReceipt } from './controllers/financeController';
import { getHostelInfo } from './controllers/hostelController';
import { getTransportInfo } from './controllers/transportController';
import { getAssignments, submitAssignment } from './controllers/assignmentController';
import { getAdminStats } from './controllers/adminController';
import { verifyDocument } from './controllers/verifyController';
import {
  getTimetable,
  getAnnouncements,
  getEvents,
  registerEvent,
  getNotifications,
  markNotificationRead,
  submitFeedback,
  getDocuments,
  requestDocument,
  downloadDocument,
  globalSearch,
  getFacultyDashboard,
  getCourseStudents,
  createAssignment,
  gradeSubmission,
  logout,
} from './controllers/portalController';
import { authenticateJWT, authorizeRoles } from './middleware/auth';

dotenv.config();

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients and same-origin requests
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0 || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Allow all Vercel preview deployments for this project
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

// Security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

// Simple in-memory rate limit for login (best-effort on serverless)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
app.post('/api/auth/login', (req, res) => {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (entry && entry.resetAt > now && entry.count >= 20) {
    return res.status(429).json({ message: 'Too many login attempts. Please try again later.' });
  }
  if (!entry || entry.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
  } else {
    entry.count += 1;
  }
  return login(req, res);
});

// Public routes
app.get('/api/verify/:documentId', verifyDocument);
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', service: 'university-erp-api', env: process.env.NODE_ENV || 'development' })
);

// Auth
app.get('/api/auth/me', authenticateJWT, getMe);
app.post('/api/auth/logout', authenticateJWT, logout);

// Student
app.get('/api/student/dashboard', authenticateJWT, getStudentDashboard);
app.get('/api/student/profile', authenticateJWT, getStudentProfile);
app.put('/api/student/profile', authenticateJWT, updateStudentProfile);

// Academic
app.get('/api/courses', authenticateJWT, getCourses);
app.post('/api/courses/register', authenticateJWT, registerCourse);
app.post('/api/courses/drop', authenticateJWT, dropCourse);
app.get('/api/timetable', authenticateJWT, getTimetable);

// Attendance
app.get('/api/attendance', authenticateJWT, getAttendance);
app.post('/api/attendance/mark', authenticateJWT, markAttendance);

// Exams & Results
app.get('/api/exams', authenticateJWT, getExams);
app.get('/api/exams/hall-ticket/:registrationId', authenticateJWT, downloadHallTicket);
app.get('/api/results', authenticateJWT, getResults);

// Finance
app.get('/api/fees', authenticateJWT, getFees);
app.post('/api/finance/pay', authenticateJWT, processMockPayment);
app.get('/api/finance/receipt/:transactionId', authenticateJWT, downloadReceipt);

// Hostel & Transport
app.get('/api/hostel', authenticateJWT, getHostelInfo);
app.get('/api/transport', authenticateJWT, getTransportInfo);

// Assignments
app.get('/api/assignments', authenticateJWT, getAssignments);
app.post('/api/assignments/submit', authenticateJWT, submitAssignment);
app.post('/api/assignments/create', authenticateJWT, createAssignment);
app.post('/api/assignments/grade', authenticateJWT, gradeSubmission);

// Events & Announcements
app.get('/api/announcements', authenticateJWT, getAnnouncements);
app.get('/api/events', authenticateJWT, getEvents);
app.post('/api/events/register', authenticateJWT, registerEvent);

// Notifications
app.get('/api/notifications', authenticateJWT, getNotifications);
app.post('/api/notifications/:id/read', authenticateJWT, markNotificationRead);

// Feedback
app.post('/api/feedback', authenticateJWT, submitFeedback);

// Documents
app.get('/api/documents', authenticateJWT, getDocuments);
app.post('/api/documents/request', authenticateJWT, requestDocument);
app.get('/api/documents/download/:type', authenticateJWT, downloadDocument);

// Search
app.get('/api/search', authenticateJWT, globalSearch);

// Faculty
app.get('/api/faculty/dashboard', authenticateJWT, getFacultyDashboard);
app.get('/api/faculty/courses/:courseId/students', authenticateJWT, getCourseStudents);

// Admin
app.get(
  '/api/admin/stats',
  authenticateJWT,
  authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN'),
  getAdminStats
);

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Something went wrong. Please try again later.' });
});

export default app;
