import React, { useEffect, useState } from 'react';
import { User, Phone, Mail, MapPin, Edit3, Save, ShieldAlert, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export const StudentProfile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/student/profile');
      const data = res.data.student;
      setProfile(data);
      setPhone(data.phone || '');
      setEmail(data.email || '');
      setAddress(data.address || '');
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put('/student/profile', { phone, email, address });
      setSuccessMsg('Contact details updated successfully!');
      setIsEditing(false);
      fetchProfile();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      alert('Failed to save profile changes.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            {profile?.user?.name ? profile.user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : 'SP'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {profile?.user?.name}
            </h1>
            <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 mt-0.5">
              Register No: {profile?.registerNo}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {profile?.school} • {profile?.program?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Contact Info
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" /> Edit Contact Info
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {successMsg}
        </div>
      )}

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Profile (Read Only) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Academic & Admission Details
            </h3>
            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
              READ-ONLY
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Institution / School</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile?.school}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Program</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile?.program?.name}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Specialization</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile?.specialization}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Current Semester</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile?.semester} ({profile?.section})</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Academic Year</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile?.academicYear}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Admission Year</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile?.admissionYear}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Current CGPA</p>
              <p className="font-extrabold text-blue-600 dark:text-blue-400 mt-0.5 text-sm">{profile?.cgpa}</p>
            </div>
          </div>
        </div>

        {/* Editable Personal & Contact Details */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
            <Phone className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Personal & Contact Information
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Student Phone Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              ) : (
                <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{profile?.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                />
              ) : (
                <p className="font-semibold text-slate-800 dark:text-slate-200">{profile?.email}</p>
              )}
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Residential Address</label>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                />
              ) : (
                <p className="font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">{profile?.address}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-700">
              <div>
                <p className="text-slate-400 font-medium">Father's Name</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile?.fatherName}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Mother's Name</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile?.motherName}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Date of Birth</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile?.dob}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Blood Group</p>
                <p className="font-bold text-rose-600 dark:text-rose-400 mt-0.5">{profile?.bloodGroup}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
