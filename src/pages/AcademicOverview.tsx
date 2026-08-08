import React, { useEffect, useState } from 'react';
import { BookOpen, UserCheck, Award, Calendar } from 'lucide-react';
import api from '../services/api';

export const AcademicOverview: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error('Fetch courses error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" /> Academic Curriculum & Department Directory
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          School of Engineering & Sciences • Department of Electronics & Communication Engineering
        </p>
      </div>

      {/* Courses Catalog Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map((c) => (
          <div
            key={c.id}
            className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">{c.code}</span>
              <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-slate-700 text-blue-700 dark:text-blue-300 font-mono font-bold text-xs rounded">
                {c.credits} Credits
              </span>
            </div>

            <h3 className="font-bold text-slate-900 dark:text-white text-base">{c.name}</h3>

            <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
              <p>👨‍🏫 <strong>Faculty In-Charge:</strong> {c.faculty?.user?.name || 'Dr. Kumar'}</p>
              <p>📌 <strong>Course Type:</strong> {c.type}</p>
              {c.prerequisites && <p>🔑 <strong>Prerequisites:</strong> {c.prerequisites}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
