import React, { useEffect, useState } from 'react';
import { BookOpen, CalendarCheck, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export const FacultyPortal: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [studentList, setStudentList] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/faculty/dashboard');
        setFaculty(res.data.faculty);
        const courseList = res.data.courses || [];
        setCourses(courseList);
        if (courseList.length > 0) {
          setSelectedCourseId(courseList[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;
    const loadStudents = async () => {
      try {
        const res = await api.get(`/faculty/courses/${selectedCourseId}/students`);
        setStudentList(
          (res.data.students || []).map((s: any) => ({
            ...s,
            status: 'PRESENT',
          }))
        );
      } catch (err) {
        console.error(err);
      }
    };
    loadStudents();
  }, [selectedCourseId]);

  const toggleStatus = (id: string) => {
    setStudentList(
      studentList.map((st) =>
        st.id === id ? { ...st, status: st.status === 'PRESENT' ? 'ABSENT' : 'PRESENT' } : st
      )
    );
  };

  const handleSaveAttendance = async () => {
    if (!selectedCourseId) return;
    setSaving(true);
    try {
      await api.post('/attendance/mark', {
        courseId: selectedCourseId,
        date: selectedDate,
        records: studentList.map((s) => ({ studentId: s.id, status: s.status })),
      });
      setMessage(`Attendance for ${selectedDate} saved successfully!`);
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-purple-600" /> Faculty Management Portal
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {faculty?.name || faculty?.user?.name || 'Faculty'} · {faculty?.designation || 'Instructor'} ·{' '}
          {faculty?.department || ''}
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-[10px] uppercase font-bold text-slate-400">My Courses</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{courses.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-[10px] uppercase font-bold text-slate-400">Students in Selected</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{studentList.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-[10px] uppercase font-bold text-slate-400">Present Today</p>
          <p className="text-2xl font-extrabold text-emerald-600">
            {studentList.filter((s) => s.status === 'PRESENT').length}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-purple-600" /> Class Attendance Entry
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="p-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white font-mono font-bold"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white font-mono"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Register No</th>
                <th className="p-3">Student Name</th>
                <th className="p-3 text-right">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {studentList.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-slate-400">
                    No students registered for this course.
                  </td>
                </tr>
              ) : (
                studentList.map((st) => (
                  <tr key={st.id}>
                    <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">{st.registerNo}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{st.name}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => toggleStatus(st.id)}
                        className={`px-3 py-1.5 rounded-lg font-extrabold text-xs transition-colors ${
                          st.status === 'PRESENT'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {st.status}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveAttendance}
            disabled={saving || studentList.length === 0}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow"
          >
            {saving ? 'Saving...' : 'Submit & Save Attendance'}
          </button>
        </div>
      </div>
    </div>
  );
};
