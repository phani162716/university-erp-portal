import React, { useEffect, useState } from 'react';
import { Shield, Users, BookOpen, CreditCard, Activity, Search, Filter } from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import api from '../services/api';

export const AdminDashboard: React.FC = () => {
  const [adminData, setAdminData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'students'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setAdminData(res.data);
    } catch (err) {
      console.error('Admin stats load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { stats, auditLogs, students, courses } = adminData || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600" /> Super Admin Control Console
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Centralized university ERP management, system audit trail, and user analytics.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'overview' ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            System Overview
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'audit' ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Audit Logs
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'students' ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Student Directory
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Students"
          value={stats?.totalStudents || 10}
          subtitle="Enrolled Across Programs"
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />

        <StatCard
          title="Total Faculty Members"
          value={stats?.totalFaculty || 5}
          subtitle="Active Academic Staff"
          icon={<Users className="w-6 h-6" />}
          color="purple"
        />

        <StatCard
          title="Active Offered Courses"
          value={stats?.activeCourses || 5}
          subtitle="Current Semester IV"
          icon={<BookOpen className="w-6 h-6" />}
          color="emerald"
        />

        <StatCard
          title="Total Fee Collection Pending"
          value={`₹${(stats?.pendingFeesTotal || 37500).toLocaleString()}`}
          subtitle="Across All Categories"
          icon={<CreditCard className="w-6 h-6" />}
          color="amber"
        />
      </div>

      {/* Tab 1: System Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Courses Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Active Curriculum Courses</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">Code</th>
                    <th className="p-3">Course Name</th>
                    <th className="p-3">Faculty</th>
                    <th className="p-3">Seats</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {courses?.map((c: any) => (
                    <tr key={c.id}>
                      <td className="p-3 font-mono font-bold text-blue-600">{c.code}</td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{c.name}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{c.faculty?.user?.name || 'Faculty'}</td>
                      <td className="p-3 font-mono">{c.seatsTaken}/{c.seatsTotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick System Log Preview */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" /> Recent Administrative Activity
            </h3>
            <div className="space-y-2 text-xs">
              {auditLogs?.slice(0, 5).map((log: any) => (
                <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between font-bold">
                    <span className="text-purple-600 dark:text-purple-400">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">System Security & Audit Trail Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">User / Role</th>
                  <th className="p-3.5">Action Code</th>
                  <th className="p-3.5">Details</th>
                  <th className="p-3.5">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {auditLogs?.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                    <td className="p-3.5 font-mono text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      {log.user?.name || 'System'} ({log.role})
                    </td>
                    <td className="p-3.5 font-mono font-bold text-purple-600 dark:text-purple-400">{log.action}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{log.details}</td>
                    <td className="p-3.5 font-mono text-slate-400">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Student Directory */}
      {activeTab === 'students' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Enrolled Student Directory</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5">Register No</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Program</th>
                  <th className="p-3.5">Semester</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">CGPA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {students?.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                    <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">{s.registerNo}</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{s.user?.name}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{s.program?.name}</td>
                    <td className="p-3.5">{s.semester} ({s.section})</td>
                    <td className="p-3.5 font-mono">{s.phone}</td>
                    <td className="p-3.5 font-mono font-bold text-emerald-600">{s.cgpa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
