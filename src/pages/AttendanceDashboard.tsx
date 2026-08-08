import React, { useEffect, useState } from 'react';
import { CalendarCheck, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import api from '../services/api';

export const AttendanceDashboard: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/attendance');
      setAttendanceData(res.data);
    } catch (err) {
      console.error('Attendance load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { overallPercentage, subjectBreakdown, isWarning } = attendanceData || {};

  return (
    <div className="space-y-6">
      {/* Header & Overall Summary Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Circular Progress Ring */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="38"
                className="stroke-slate-200 dark:stroke-slate-700"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r="38"
                className={isWarning ? 'stroke-rose-500' : 'stroke-emerald-500'}
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 38}
                strokeDashoffset={2 * Math.PI * 38 * (1 - overallPercentage / 100)}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                {overallPercentage}%
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Overall</span>
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarCheck className="w-6 h-6 text-emerald-600" /> Student Attendance Dashboard
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Minimum mandatory threshold for examination eligibility is <strong className="text-slate-800 dark:text-slate-200">75%</strong>.
            </p>
          </div>
        </div>

        {isWarning && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl max-w-md text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Low Attendance Warning Triggered!</p>
              <p className="mt-0.5">Your total attendance is below 75%. Please contact your faculty advisor immediately.</p>
            </div>
          </div>
        )}
      </div>

      {/* Subject-Wise Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjectBreakdown?.map((subject: any) => (
          <div
            key={subject.code}
            className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{subject.code}</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{subject.name}</h3>
              </div>
              <span
                className={`text-lg font-mono font-extrabold px-3 py-1 rounded-xl ${
                  subject.isWarning
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                }`}
              >
                {subject.percentage}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    subject.isWarning ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${subject.percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-medium pt-1">
                <span>Classes Attended: {subject.present}</span>
                <span>Total Conducted: {subject.total}</span>
              </div>
            </div>

            {/* Recent Attendance Logs */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Recent Class History Log
              </p>
              <div className="flex flex-wrap gap-1.5">
                {subject.records?.slice(-10).map((r: any, idx: number) => (
                  <span
                    key={idx}
                    title={`${r.date}: ${r.status}`}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      r.status === 'PRESENT'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200'
                    }`}
                  >
                    {r.status === 'PRESENT' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {r.date.substring(5)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
