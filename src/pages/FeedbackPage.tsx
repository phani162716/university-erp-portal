import React, { useState } from 'react';
import { MessageSquare, Star, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export const FeedbackPage: React.FC = () => {
  const [category, setCategory] = useState('Faculty');
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await api.post('/feedback', { category, rating, comments, isAnonymous });
      setSuccess(res.data.message || 'Feedback submitted successfully!');
      setComments('');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-blue-600" /> University Feedback Portal
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Share ratings and suggestions regarding faculty, courses, infrastructure, hostel, or transport.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Feedback Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="Faculty">Faculty & Teaching Quality</option>
              <option value="Course">Curriculum & Course Structure</option>
              <option value="Infrastructure">Infrastructure & Labs</option>
              <option value="Hostel">Hostel & Living</option>
              <option value="Transport">Transport Services</option>
              <option value="Food">Mess & Canteen Food</option>
              <option value="General">General Administrative Support</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Overall Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button type="button" key={star} onClick={() => setRating(star)} className="p-1 transition-transform hover:scale-110">
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 font-mono font-bold text-slate-700 dark:text-slate-300 text-sm">{rating} / 5</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Detailed Comments</label>
            <textarea
              rows={4}
              required
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide constructive feedback..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anon"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="anon" className="text-slate-600 dark:text-slate-400 cursor-pointer">
              Submit feedback anonymously
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow transition-all"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
};
