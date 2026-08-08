import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
  onClick,
}) => {
  const colorMap = {
    blue: 'from-blue-600 to-indigo-700 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30',
    emerald: 'from-emerald-600 to-teal-700 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30',
    amber: 'from-amber-500 to-orange-600 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30',
    purple: 'from-purple-600 to-violet-700 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30',
    rose: 'from-rose-600 to-red-700 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {subtitle}
            </p>
          )}
          {trend && (
            <span className="inline-block mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {trend}
            </span>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorMap[color].split(' ').slice(3).join(' ')}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
