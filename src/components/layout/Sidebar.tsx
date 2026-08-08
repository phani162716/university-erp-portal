import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  BookOpen,
  CalendarCheck,
  Clock,
  FileCheck,
  Award,
  CreditCard,
  Building,
  Bus,
  Calendar,
  MessageSquare,
  Bell,
  FileText,
  ShieldCheck,
  Settings,
  LogOut,
  GraduationCap,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const isStudent = user?.role === 'STUDENT';
  const isFaculty = user?.role === 'FACULTY';
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'UNIVERSITY_ADMIN';

  const studentNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Student Profile', path: '/profile', icon: User },
    { label: 'Academic Portal', path: '/academic', icon: BookOpen },
    { label: 'Course Registration', path: '/courses', icon: GraduationCap },
    { label: 'Timetable', path: '/timetable', icon: Clock },
    { label: 'Attendance', path: '/attendance', icon: CalendarCheck },
    { label: 'Examinations', path: '/exams', icon: FileCheck },
    { label: 'Results & Marks', path: '/results', icon: Award },
    { label: 'Fees & Finance', path: '/finance', icon: CreditCard },
    { label: 'Hostel Portal', path: '/hostel', icon: Building },
    { label: 'Transport Portal', path: '/transport', icon: Bus },
    { label: 'Assignments', path: '/assignments', icon: FileText },
    { label: 'Events & News', path: '/events', icon: Calendar },
    { label: 'Feedback', path: '/feedback', icon: MessageSquare },
    { label: 'Documents', path: '/documents', icon: ShieldCheck },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const facultyNavItems = [
    { label: 'Faculty Dashboard', path: '/faculty', icon: LayoutDashboard },
    { label: 'My Courses & Students', path: '/courses', icon: BookOpen },
    { label: 'Mark Attendance', path: '/faculty', icon: CalendarCheck },
    { label: 'Assignments & Marks', path: '/assignments', icon: FileText },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const adminNavItems = [
    { label: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'User Management', path: '/admin', icon: Users },
    { label: 'Course Management', path: '/courses', icon: BookOpen },
    { label: 'Financial Reports', path: '/finance', icon: CreditCard },
    { label: 'Hostel & Transport', path: '/hostel', icon: Building },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const navItems = isStudent
    ? studentNavItems
    : isFaculty
    ? facultyNavItems
    : adminNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Branding */}
        <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-black text-xl tracking-wider">
            U
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-white tracking-wide leading-none">
              UNIVERSITY ERP
            </h1>
            <p className="text-[10px] text-blue-400 font-semibold tracking-wider mt-1 uppercase">
              Academic Portal 2026
            </p>
          </div>
        </div>

        {/* User Badge Info */}
        <div className="mx-3 my-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center border border-slate-600">
            {user?.name ? user.name[0] : 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-100 truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-400 font-mono truncate">{user?.registerNo}</p>
          </div>
        </div>

        {/* Navigation Link List */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-3 border-t border-slate-800/80">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};
