import React, { useEffect, useState } from 'react';
import { Calendar, Bell, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export const EventsAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, eRes] = await Promise.all([api.get('/announcements'), api.get('/events')]);
        setAnnouncements(aRes.data.announcements || []);
        setEvents(eRes.data.events || []);
        setRegisteredEventIds(eRes.data.registeredEventIds || []);
      } catch (err) {
        console.error('Events load error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleRegisterEvent = async (eventId: string) => {
    try {
      const res = await api.post('/events/register', { eventId });
      setRegisteredEventIds([...registeredEventIds, eventId]);
      setMessage(res.data.message);
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Registration failed');
      setTimeout(() => setMessage(null), 4000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" /> Campus Events & Official Announcements
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Stay updated with academic notices, exam circulars, and campus events.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" /> Official Circulars & Notices
          </h3>
          <div className="space-y-3">
            {announcements.length === 0 && (
              <p className="text-xs text-slate-400 italic">No announcements yet.</p>
            )}
            {announcements.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-100 dark:border-slate-700 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{item.title}</span>
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded font-mono text-[10px] shrink-0">
                    {item.category}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{item.description}</p>
                <span className="text-[10px] text-slate-400 block pt-1 font-mono">
                  Published: {item.date} · {item.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" /> Upcoming Campus Events
          </h3>
          <div className="space-y-3">
            {events.length === 0 && (
              <p className="text-xs text-slate-400 italic">No events scheduled.</p>
            )}
            {events.map((ev) => {
              const isRegistered = registeredEventIds.includes(ev.id);
              return (
                <div
                  key={ev.id}
                  className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-100 dark:border-slate-700 text-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{ev.name}</p>
                      <p className="text-slate-500 mt-0.5">
                        {ev.date} · {ev.time} · {ev.venue}
                      </p>
                      <p className="text-slate-600 dark:text-slate-300 mt-1">{ev.description}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Organizer: {ev.organizer}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded text-[10px] font-semibold shrink-0">
                      {ev.category}
                    </span>
                  </div>
                  <button
                    disabled={isRegistered}
                    onClick={() => handleRegisterEvent(ev.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      isRegistered
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 cursor-default'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {isRegistered ? 'Registered' : 'Register for Event'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
