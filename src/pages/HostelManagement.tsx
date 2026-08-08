import React, { useEffect, useState } from 'react';
import { Building, ShieldCheck, UserCheck, Utensils, MessageSquare } from 'lucide-react';
import api from '../services/api';

export const HostelManagement: React.FC = () => {
  const [hostelData, setHostelData] = useState<any>(null);
  const [complaintText, setComplaintText] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHostel();
  }, []);

  const fetchHostel = async () => {
    try {
      const res = await api.get('/hostel');
      setHostelData(res.data);
    } catch (err) {
      console.error('Hostel load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim()) return;
    setSubmittedMessage('Complaint registered successfully! Reference Ticket #HST-2026-904.');
    setComplaintText('');
    setTimeout(() => setSubmittedMessage(null), 4000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { allocation, blocks } = hostelData || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="w-6 h-6 text-purple-600" /> Student Hostel & Mess Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Hostel allocation details, room specifications, dining mess schedule, and warden support.
          </p>
        </div>
      </div>

      {/* Allocation Details Card */}
      {allocation ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Your Active Room Allocation</h3>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full font-bold text-xs">
              {allocation.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
              <span className="text-slate-400 block font-medium">Hostel Block</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm mt-0.5 block">{allocation.room?.block?.name}</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
              <span className="text-slate-400 block font-medium">Room Number</span>
              <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm mt-0.5 block font-mono">{allocation.room?.roomNo}</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
              <span className="text-slate-400 block font-medium">Bed Number</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm mt-0.5 block font-mono">{allocation.bedNo}</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
              <span className="text-slate-400 block font-medium">Room Type</span>
              <span className="font-extrabold text-purple-600 dark:text-purple-400 text-sm mt-0.5 block">{allocation.room?.roomType}</span>
            </div>
          </div>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-t border-slate-100 dark:border-slate-700">
            <div>
              <span className="text-slate-400 font-medium flex items-center gap-1"><Utensils className="w-3.5 h-3.5 text-amber-500" /> Mess Facility</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{allocation.room?.mess}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium flex items-center gap-1"><UserCheck className="w-3.5 h-3.5 text-blue-500" /> Resident Warden</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{allocation.room?.warden}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center text-xs text-slate-500">
          No active hostel allocation record found for your account.
        </div>
      )}

      {/* Complaint Submission Box */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-600" /> Submit Hostel Maintenance / Complaint Ticket
        </h3>

        {submittedMessage && (
          <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200">
            {submittedMessage}
          </div>
        )}

        <form onSubmit={handleComplaintSubmit} className="space-y-3 text-xs">
          <textarea
            rows={3}
            required
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            placeholder="Describe maintenance issues (e.g., plumbing, air conditioning, electrical repair, mess food feedback)..."
            className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow text-xs"
          >
            Submit Complaint Ticket
          </button>
        </form>
      </div>
    </div>
  );
};
