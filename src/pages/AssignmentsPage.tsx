import React, { useEffect, useState } from 'react';
import { FileText, Upload, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import api from '../services/api';

export const AssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/assignments');
      setAssignments(res.data.assignments || []);
    } catch (err) {
      console.error('Assignments load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmission = async (assignmentId: string) => {
    try {
      await api.post('/assignments/submit', {
        assignmentId,
        fileUrl: selectedFile || '/uploads/assignment_submission.pdf',
      });
      setMessage('Assignment submitted successfully!');
      setActiveAssignmentId(null);
      fetchAssignments();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      alert('Failed to submit assignment.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" /> Academic Assignments & Submissions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track pending assignments, upload solutions, and view faculty marks & feedback.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {message}
        </div>
      )}

      {/* Assignment List */}
      <div className="space-y-4">
        {assignments.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">{item.course?.code}</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{item.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Due: 📅 {item.dueDate}</span>
                <span
                  className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold ${
                    item.submission?.status === 'GRADED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : item.submission?.status === 'SUBMITTED'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {item.submission?.status || 'PENDING'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {item.description}
            </p>

            {item.submission && (
              <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl text-xs space-y-1 border border-slate-100 dark:border-slate-600">
                <p className="font-bold text-slate-900 dark:text-white">Submission Recorded</p>
                {item.submission.marks !== null && (
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold">
                    Marks Awarded: {item.submission.marks} / {item.maxMarks}
                  </p>
                )}
                {item.submission.feedback && (
                  <p className="text-slate-600 dark:text-slate-300 italic">
                    Faculty Feedback: "{item.submission.feedback}"
                  </p>
                )}
              </div>
            )}

            {!item.submission && (
              <div className="pt-2">
                {activeAssignmentId === item.id ? (
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-200 dark:border-slate-600 space-y-3">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Upload Solution File (PDF / Docx / Zip)
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files?.[0]?.name || '')}
                      className="text-xs text-slate-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSubmission(item.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs"
                      >
                        Submit File
                      </button>
                      <button
                        onClick={() => setActiveAssignmentId(null)}
                        className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveAssignmentId(item.id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs inline-flex items-center gap-2 shadow"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Assignment Solution
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
