import React from 'react';
import { RefreshCw } from 'lucide-react';

interface CaptchaProps {
  code: string;
  onRefresh: () => void;
}

export const Captcha: React.FC<CaptchaProps> = ({ code, onRefresh }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative select-none bg-slate-800 text-white font-mono tracking-widest text-xl font-bold px-4 py-2 rounded shadow-inner flex items-center justify-center overflow-hidden border border-slate-700">
        {/* Background noise lines */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]" />
        <span className="relative z-10 italic transform -skew-x-12 decoration-wavy underline decoration-slate-400">
          {code}
        </span>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        title="Refresh CAPTCHA"
        className="p-2 text-slate-500 hover:text-navy-500 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      >
        <RefreshCw className="w-5 h-5" />
      </button>
    </div>
  );
};
