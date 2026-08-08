import React, { useEffect, useState } from 'react';
import { Menu, Search, Bell, Sun, Moon, LogOut, User as UserIcon, Shield, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { setTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {
      /* ignore if offline */
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/all/read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      /* ignore */
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    logout();
    navigate('/login');
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 transition-colors">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
            title="Toggle Sidebar"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <form onSubmit={handleSearchSubmit} className="relative hidden md:block max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search courses, faculty, announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-full border border-transparent focus:border-navy-500 dark:focus:border-blue-500 focus:outline-none transition-all"
              aria-label="Global search"
            />
          </form>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            title="Toggle Theme"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative transition-colors"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[8px] h-2 w-2 bg-rose-500 rounded-full animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h4>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 rounded-full">
                        {unreadCount} New
                      </span>
                    )}
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-slate-400 hover:text-blue-600"
                        title="Mark all read"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700/50 max-h-64 overflow-y-auto">
                  {notifications.length === 0 && (
                    <p className="p-4 text-xs text-slate-400 text-center">No notifications</p>
                  )}
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                        !n.isRead ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{timeAgo(n.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 pl-2 pr-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors border border-slate-200 dark:border-slate-700"
            >
              <div className="w-8 h-8 rounded-full bg-navy-500 text-white font-bold text-xs flex items-center justify-center shadow-inner">
                {user?.name
                  ? user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                  : 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold leading-none text-slate-800 dark:text-slate-200">
                  {user?.name || 'User'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 capitalize">
                  {user?.role?.replace(/_/g, ' ').toLowerCase()}
                </p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{user?.registerNo}</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/profile');
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" /> Profile & Details
                </button>
                {(user?.role === 'SUPER_ADMIN' || user?.role === 'UNIVERSITY_ADMIN') && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/admin');
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4 text-purple-500" /> Admin Console
                  </button>
                )}
                <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 font-semibold"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
