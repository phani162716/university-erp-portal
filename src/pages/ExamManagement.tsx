import React, { useEffect, useState } from 'react';
import { FileCheck, Download, Calendar, MapPin, Clock, QrCode } from 'lucide-react';
import api from '../services/api';

export const ExamManagement: React.FC = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams');
      setExams(res.data.exams || []);
    } catch (err) {
      console.error('Fetch exams error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadHallTicket = async (registrationId: string, hallTicketNo: string) => {
    try {
      const response = await api.get(`/exams/hall-ticket/${registrationId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `HallTicket_${hallTicketNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download Hall Ticket PDF.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-purple-600" /> Examination Portal & Hall Tickets
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Mid-Semester & End-Semester schedules, exam venues, and QR-verified hall tickets.
          </p>
        </div>
      </div>

      {/* Examinations List Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Registered Examinations Schedule</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Exam Name</th>
                <th className="p-3.5">Course Code & Subject</th>
                <th className="p-3.5">Exam Type</th>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Venue</th>
                <th className="p-3.5">Hall Ticket No</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {exams.map((ex) => (
                <tr key={ex.registrationId} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">{ex.name}</td>
                  <td className="p-3.5">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block">{ex.courseCode}</span>
                    <span className="text-slate-600 dark:text-slate-300">{ex.subject}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                      {ex.type}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                    <div>📅 {ex.date}</div>
                    <div className="text-[11px] text-slate-400">⏰ {ex.time}</div>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">📍 {ex.venue}</td>
                  <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">{ex.hallTicketNo}</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleDownloadHallTicket(ex.registrationId, ex.hallTicketNo)}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-xs inline-flex items-center gap-1.5 shadow transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Hall Ticket
                    </button>
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
