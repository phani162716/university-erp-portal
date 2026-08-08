import React from 'react';
import { Settings, Moon, Sun, Monitor, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  const themeOptions: { value: 'light' | 'dark' | 'system'; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
    { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" /> Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage appearance preferences and account information.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Appearance</h2>
        <p className="text-xs text-slate-500">Choose light, dark, or follow your system preference.</p>
        <div className="flex flex-wrap gap-2">
          {themeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                theme === opt.value
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" /> Account
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <dt className="text-slate-500 font-medium">Name</dt>
            <dd className="font-semibold text-slate-900 dark:text-white mt-0.5">{user?.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500 font-medium">Register / ID</dt>
            <dd className="font-mono font-semibold text-slate-900 dark:text-white mt-0.5">{user?.registerNo}</dd>
          </div>
          <div>
            <dt className="text-slate-500 font-medium">Email</dt>
            <dd className="font-semibold text-slate-900 dark:text-white mt-0.5">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-slate-500 font-medium">Role</dt>
            <dd className="font-semibold text-slate-900 dark:text-white mt-0.5 capitalize">
              {user?.role?.replace(/_/g, ' ').toLowerCase()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};
