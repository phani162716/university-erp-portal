import React, { useEffect, useState } from 'react';
import { Clock, Printer } from 'lucide-react';
import api from '../services/api';

export const TimetablePage: React.FC = () => {
  const [slots, setSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/timetable');
        setSlots(res.data.slots || []);
      } catch (err) {
        console.error('Timetable load error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const scheduleMap: { [key: string]: any[] } = {};
  for (const day of days) scheduleMap[day] = [];
  for (const slot of slots) {
    if (!scheduleMap[slot.day]) scheduleMap[slot.day] = [];
    scheduleMap[slot.day].push({
      time: `${slot.startTime} - ${slot.endTime}`,
      code: slot.course?.code,
      name: slot.course?.name,
      room: slot.room,
      faculty: slot.course?.faculty?.user?.name || 'TBA',
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" /> Weekly Academic Timetable
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Live schedule from registered courses
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="no-print px-4 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-2"
        >
          <Printer className="w-4 h-4" /> Print Timetable
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {days.map((day) => {
          const daySlots = scheduleMap[day] || [];
          return (
            <div
              key={day}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden"
            >
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/40 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{day}</h3>
              </div>
              <div className="p-3 space-y-2 min-h-[100px]">
                {daySlots.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">No classes</p>
                ) : (
                  daySlots.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs"
                    >
                      <p className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold">{s.time}</p>
                      <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                        {s.code} · {s.name}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                        {s.room} · {s.faculty}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
