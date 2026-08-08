import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  Award,
  CreditCard,
  BookOpen,
  Clock,
  FileCheck,
  ArrowRight,
  AlertTriangle,
  Download,
  Calendar,
  CheckCircle2,
  FileText,
  Sparkles,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import api from '../services/api';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/student/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { student, metrics, subjectBreakdown, todaysClasses, upcomingExams, pendingAssignments, announcements } = data || {};

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-900 via-blue-900 to-indigo-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.3),transparent_70%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Academic Session 2025-2026
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {student?.name || 'Student'}!
            </h1>
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-blue-200 mt-2 font-medium">
              <span className="font-mono bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">
                Reg: {student?.registerNo}
              </span>
              <span>• {student?.program}</span>
              <span>• {student?.semester} ({student?.section})</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate('/courses')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              Course Portal <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${metrics?.overallAttendance || 87}%`}
          subtitle="Requirement: Min 75%"
          icon={<CalendarCheck className="w-6 h-6" />}
          color={metrics?.overallAttendance < 75 ? 'rose' : 'emerald'}
          onClick={() => navigate('/attendance')}
        />

        <StatCard
          title="Cumulative CGPA"
          value={student?.cgpa || 8.85}
          subtitle="Semester IV Comparison"
          trend="+0.15 vs Prev Sem"
          icon={<Award className="w-6 h-6" />}
          color="purple"
          onClick={() => navigate('/results')}
        />

        <StatCard
          title="Registered Credits"
          value={`${metrics?.registeredCredits || 19} Credits`}
          subtitle={`Completed: ${metrics?.completedCredits || 64}`}
          icon={<BookOpen className="w-6 h-6" />}
          color="blue"
          onClick={() => navigate('/courses')}
        />

        <StatCard
          title="Pending Fees"
          value={`₹${(metrics?.pendingFeesAmount || 0).toLocaleString()}`}
          subtitle={metrics?.pendingFeesAmount > 0 ? 'Due Date: Aug 30, 2026' : 'No balance pending'}
          icon={<CreditCard className="w-6 h-6" />}
          color={metrics?.pendingFeesAmount > 0 ? 'amber' : 'emerald'}
          onClick={() => navigate('/finance')}
        />
      </div>

      {/* Main Content Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Classes Timetable */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Today's Classes Schedule
                </h3>
              </div>
              <button
                onClick={() => navigate('/timetable')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                Full Timetable <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todaysClasses && todaysClasses.length > 0 ? (
              <div className="space-y-3">
                {todaysClasses.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-mono font-bold text-xs rounded-lg">
                        {item.startTime} - {item.endTime}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">
                          {item.course.code} • {item.course.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Faculty: {item.course.faculty?.user?.name || 'Dr. Kumar'}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-md">
                      Room {item.room}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic py-4 text-center">
                No classes scheduled for today. Enjoy your day!
              </p>
            )}
          </div>

          {/* Subject Attendance Breakdown */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Subject-Wise Attendance Breakdown
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              {subjectBreakdown?.map((item: any) => (
                <div key={item.code} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-800 dark:text-slate-200">
                      {item.code} - {item.name}
                    </span>
                    <span className={item.percentage < 75 ? 'text-rose-600 font-extrabold' : 'text-slate-700 dark:text-slate-300'}>
                      {item.percentage}% ({item.present}/{item.total} Attended)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        item.percentage < 75
                          ? 'bg-rose-500'
                          : item.percentage >= 90
                          ? 'bg-emerald-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column Sidebar Cards */}
        <div className="space-y-6">
          {/* Quick Actions Card Grid */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">
              Quick ERP Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate('/courses')}
                className="p-3 bg-blue-50 dark:bg-slate-700/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 text-center transition-colors"
              >
                <BookOpen className="w-5 h-5 text-blue-600" /> Register Courses
              </button>
              <button
                onClick={() => navigate('/finance')}
                className="p-3 bg-emerald-50 dark:bg-slate-700/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 text-center transition-colors"
              >
                <CreditCard className="w-5 h-5 text-emerald-600" /> Pay Fees
              </button>
              <button
                onClick={() => navigate('/exams')}
                className="p-3 bg-purple-50 dark:bg-slate-700/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 text-center transition-colors"
              >
                <FileCheck className="w-5 h-5 text-purple-600" /> Hall Ticket
              </button>
              <button
                onClick={() => navigate('/results')}
                className="p-3 bg-amber-50 dark:bg-slate-700/50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 text-center transition-colors"
              >
                <Award className="w-5 h-5 text-amber-600" /> View Results
              </button>
            </div>
          </div>

          {/* Upcoming Examinations */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-purple-600" /> Upcoming Examinations
              </h3>
            </div>
            <div className="space-y-3">
              {upcomingExams?.map((ex: any, i: number) => (
                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-100 dark:border-slate-700 text-xs">
                  <p className="font-bold text-slate-900 dark:text-white">{ex.examName}</p>
                  <p className="text-slate-600 dark:text-slate-400">{ex.subject} ({ex.code})</p>
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-[11px] font-medium text-slate-500">
                    <span>📅 {ex.date}</span>
                    <span>📍 {ex.venue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Announcements Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" /> Latest Announcements
            </h3>
            <div className="space-y-3">
              {announcements?.map((a: any) => (
                <div key={a.id} className="p-3 bg-blue-50/50 dark:bg-slate-700/30 rounded-xl border border-blue-100 dark:border-slate-700 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-blue-700 dark:text-blue-400">{a.title}</span>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded font-mono">
                      {a.category}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    {a.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
