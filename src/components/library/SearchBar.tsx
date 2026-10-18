import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  totalResults?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search by document title, subject, exam, or description...',
  totalResults,
}) => {
  return (
    <div className="w-full">
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <Search className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 sm:pl-11 pr-16 sm:pr-28 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-600 dark:focus:ring-sky-400 focus:border-transparent transition-all shadow-xs text-base sm:text-sm"
        />
        <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center gap-1 sm:gap-2">
          {value && (
            <button
              onClick={onClear}
              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600 transition-colors"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {totalResults !== undefined && (
            <span className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md border border-slate-200 dark:border-slate-600 whitespace-nowrap">
              {totalResults} <span className="hidden xs:inline">{totalResults === 1 ? 'doc' : 'docs'}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
