import React, { useEffect, useState } from 'react';
import { Award, TrendingUp, Download, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../services/api';

export const ResultsDashboard: React.FC = () => {
  const [resultData, setResultData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await api.get('/results');
      setResultData(res.data);
    } catch (err) {
      console.error('Results load error:', err);
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

  const { cgpa, sgpa, totalCredits, results } = resultData || {};

  const semesterChartData = [
    { semester: 'Sem I', sgpa: 8.5 },
    { semester: 'Sem II', sgpa: 8.7 },
    { semester: 'Sem III', sgpa: 8.9 },
    { semester: 'Sem IV', sgpa: sgpa || 8.8 },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Metrics Summary Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" /> Academic Results & Grade Sheet
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Semester IV Performance Summary • Total Earned Credits: <strong className="text-slate-800 dark:text-slate-200">{totalCredits || 19} Credits</strong>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-center">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 block">Current SGPA</span>
            <span className="text-2xl font-mono font-extrabold text-amber-700 dark:text-amber-300">{sgpa || 8.8}</span>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 text-center">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 block">Overall CGPA</span>
            <span className="text-2xl font-mono font-extrabold text-blue-700 dark:text-blue-300">{cgpa || 8.85}</span>
          </div>
        </div>
      </div>

      {/* SGPA Performance Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" /> Semester-wise SGPA Progression
        </h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={semesterChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="semester" stroke="#94a3b8" fontSize={11} />
              <YAxis domain={[0, 10]} stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="sgpa" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grade Sheet Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Course Grade Breakdown</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Course Code</th>
                <th className="p-3.5">Course Name</th>
                <th className="p-3.5">Credits</th>
                <th className="p-3.5">Marks Obtained</th>
                <th className="p-3.5">Grade</th>
                <th className="p-3.5">Grade Points</th>
                <th className="p-3.5 text-right">Result Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {results?.map((r: any) => (
                <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">{r.courseCode}</td>
                  <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{r.courseName}</td>
                  <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">{r.credits}</td>
                  <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">{r.marksObtained}</td>
                  <td className="p-3.5 font-mono font-extrabold text-purple-600 dark:text-purple-400 text-sm">{r.grade}</td>
                  <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">{r.gradePoints} / 10</td>
                  <td className="p-3.5 text-right">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-md font-extrabold text-[11px] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {r.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
