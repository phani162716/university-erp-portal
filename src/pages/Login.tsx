import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User as UserIcon, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Captcha } from '../components/common/Captcha';
import api from '../services/api';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [registerNo, setRegisterNo] = useState('AP2026001234');
  const [password, setPassword] = useState('Student@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Captcha setup
  const [captchaCode, setCaptchaCode] = useState('K3809');
  const [captchaInput, setCaptchaInput] = useState('K3809');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateRandomCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setCaptchaInput('');
  };

  const handleQuickFill = (reg: string, pass: string) => {
    setRegisterNo(reg);
    setPassword(pass);
    setCaptchaInput(captchaCode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!registerNo.trim() || !password.trim()) {
      setError('Please enter your Register Number and Password.');
      return;
    }

    if (captchaInput.toUpperCase() !== captchaCode.toUpperCase()) {
      setError('Invalid CAPTCHA code. Please check and try again.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', {
        registerNo,
        password,
        captcha: captchaInput,
        captchaExpected: captchaCode,
      });

      const { token, user } = res.data;
      login(token, user);

      if (user.role === 'SUPER_ADMIN' || user.role === 'UNIVERSITY_ADMIN') {
        navigate('/admin');
      } else if (user.role === 'FACULTY') {
        navigate('/faculty');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-900 overflow-hidden font-sans">
      {/* Dynamic Campus Background Overlay */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-30 blur-xs scale-105" />
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/90 to-blue-950/70" />

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 transition-all">
        {/* University Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl shadow-lg shadow-blue-500/30 mb-3">
            U
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            UNIVERSITY ERP PORTAL
          </h1>
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1 uppercase tracking-wider">
            Student & Academic Management System
          </p>
        </div>

        {/* Demo Persona Quick Selector */}
        <div className="mb-5 p-2.5 bg-blue-50/80 dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700 rounded-xl text-xs">
          <p className="font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-center">
            Demo Credentials (Click to Auto-Fill):
          </p>
          <div className="grid grid-cols-3 gap-1.5 text-[11px] font-semibold text-center">
            <button
              type="button"
              onClick={() => handleQuickFill('AP2026001234', 'Student@123')}
              className="py-1 px-2 rounded bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-slate-600 hover:bg-blue-100 transition-colors"
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('FAC2026001', 'Faculty@123')}
              className="py-1 px-2 rounded bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-slate-600 hover:bg-purple-100 transition-colors"
            >
              👨‍🏫 Faculty
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('ADM2026001', 'Admin@123')}
              className="py-1 px-2 rounded bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-slate-600 hover:bg-emerald-100 transition-colors"
            >
              ⚡ Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Register Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Register Number / Application Number
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={registerNo}
                onChange={(e) => setRegisterNo(e.target.value)}
                placeholder="e.g. AP2026001234"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white transition-all font-mono"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Captcha */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Security CAPTCHA
            </label>
            <div className="space-y-2">
              <Captcha code={captchaCode} onRefresh={generateRandomCaptcha} />
              <input
                type="text"
                required
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                placeholder="Enter CAPTCHA text"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white font-mono uppercase tracking-wider"
              />
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Remember Me</span>
            </label>
            <a
              href="#forgot"
              onClick={(e) => { e.preventDefault(); alert('Please contact University IT Helpdesk to reset password.'); }}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Forgot Password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'LOGIN TO PORTAL'
            )}
          </button>
        </form>

        {/* First-time login instructions */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-center">
          <p className="font-semibold text-slate-700 dark:text-slate-300">First-Time User Assistance?</p>
          <p className="mt-0.5">Use your Register Number as User ID and default initial password assigned during admission.</p>
        </div>
      </div>
    </div>
  );
};
