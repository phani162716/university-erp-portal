import React, { useEffect, useState } from 'react';
import { BookOpen, Check, Plus, Trash2, AlertCircle, Info, ShieldAlert, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export const CourseRegistration: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data.courses || []);
      setRegisteredIds(res.data.registeredCourseIds || []);
    } catch (err) {
      console.error('Fetch courses error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const registeredCoursesList = courses.filter((c) => registeredIds.includes(c.id));
  const totalRegisteredCredits = registeredCoursesList.reduce((acc, c) => acc + c.credits, 0);

  const handleRegisterClick = (course: any) => {
    setSelectedCourse(course);
    setShowConfirmModal(true);
  };

  const confirmRegistration = async () => {
    if (!selectedCourse) return;
    try {
      await api.post('/courses/register', { courseId: selectedCourse.id });
      setMessage({ type: 'success', text: `Successfully registered for ${selectedCourse.code} - ${selectedCourse.name}!` });
      setShowConfirmModal(false);
      setSelectedCourse(null);
      fetchCourses();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Registration failed.' });
      setShowConfirmModal(false);
    }
  };

  const handleDrop = async (courseId: string, courseCode: string) => {
    if (!confirm(`Are you sure you want to drop course ${courseCode}?`)) return;
    try {
      await api.post('/courses/drop', { courseId });
      setMessage({ type: 'success', text: `Course ${courseCode} has been dropped.` });
      fetchCourses();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Drop action failed.' });
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'ALL' || c.type.toUpperCase() === filterType.toUpperCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header & Credit Limit Counter Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" /> Academic Course Registration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Select courses for Semester IV 2025-2026. Credit limits: Minimum 16 / Maximum 26.
          </p>
        </div>

        {/* Credit Limit Badge Counter */}
        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 flex items-center gap-4 text-xs font-bold">
          <div>
            <span className="text-slate-400 font-medium block">Total Selected</span>
            <span className={`text-lg font-mono font-extrabold ${totalRegisteredCredits < 16 ? 'text-amber-500' : 'text-emerald-600'}`}>
              {totalRegisteredCredits} <span className="text-xs text-slate-400">/ 26 Credits</span>
            </span>
          </div>
          <div className="h-8 w-px bg-slate-300 dark:bg-slate-600" />
          <div>
            <span className="text-slate-400 font-medium block">Courses</span>
            <span className="text-base text-slate-900 dark:text-white">{registeredCoursesList.length} Registered</span>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
        <input
          type="text"
          placeholder="Search by course code or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
        />

        <div className="flex items-center gap-2">
          {['ALL', 'CORE', 'ELECTIVE', 'LAB INTEGRATED'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filterType === t
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Available Courses Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Code</th>
                <th className="p-3.5">Course Name</th>
                <th className="p-3.5">Faculty</th>
                <th className="p-3.5">Credits</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Seats Available</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredCourses.map((c) => {
                const isReg = registeredIds.includes(c.id);
                return (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">{c.code}</td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                      {c.name}
                      {c.prerequisites && (
                        <span className="block text-[10px] text-slate-400 font-normal">Prereq: {c.prerequisites}</span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{c.faculty?.user?.name || 'Dr. Kumar'}</td>
                    <td className="p-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">{c.credits} Credits</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {c.type}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono">
                      {c.seatsTotal - c.seatsTaken} / {c.seatsTotal}
                    </td>
                    <td className="p-3.5 text-right">
                      {isReg ? (
                        <button
                          onClick={() => handleDrop(c.id, c.code)}
                          className="px-3 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg font-bold text-xs inline-flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Drop Course
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRegisterClick(c)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs inline-flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" /> Register
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Confirm Course Registration
            </h3>
            <div className="p-3 bg-blue-50 dark:bg-slate-700/40 rounded-xl border border-blue-100 dark:border-slate-600 text-xs space-y-1">
              <p className="font-bold text-blue-700 dark:text-blue-300">{selectedCourse.code} - {selectedCourse.name}</p>
              <p className="text-slate-600 dark:text-slate-300">Credits: {selectedCourse.credits} | Type: {selectedCourse.type}</p>
              <p className="text-slate-600 dark:text-slate-300">Faculty: {selectedCourse.faculty?.user?.name || 'Dr. Kumar'}</p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              New total registered credits after addition will be <strong className="text-slate-900 dark:text-white">{totalRegisteredCredits + selectedCourse.credits} / 26</strong>.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmRegistration}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500"
              >
                Confirm & Register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
