import React from 'react';
import { BookOpen, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-12 sm:mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600 dark:text-sky-400" />
            <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base">SenaDocs</span>
            <span className="text-slate-400 dark:text-slate-500 text-xs sm:text-sm hidden sm:inline">| Academic Study Material Library</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 text-[11px] sm:text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-emerald-200 dark:border-emerald-700">
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Supabase Verified
            </span>
            <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">
              &copy; {new Date().getFullYear()} SenaDocs. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
