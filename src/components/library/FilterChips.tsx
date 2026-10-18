import React from 'react';
import { ArrowUpDown, X, Tag } from 'lucide-react';
import { Category } from '../../types/database';

interface FilterChipsProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  sortBy: 'newest' | 'oldest' | 'title';
  onChangeSortBy: (sort: 'newest' | 'oldest' | 'title') => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  sortBy,
  onChangeSortBy,
  hasActiveFilters,
  onResetFilters,
}) => {
  return (
    <div className="space-y-2.5">
      {/* ── Main Filter Bar ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">

        {/* Category Scroll Row */}
        <div className="relative flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-none overscroll-x-contain">
            <button
              onClick={() => onSelectCategory('')}
              className={`flex-shrink-0 px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all select-none active:scale-95 ${
                selectedCategoryId === ''
                  ? 'bg-sky-500 text-white shadow-xs font-semibold'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-sky-50 dark:hover:bg-slate-700'
              }`}
            >
              All IT Tracks
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex-shrink-0 px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all select-none active:scale-95 ${
                  selectedCategoryId === cat.id
                    ? 'bg-sky-500 text-white shadow-xs font-semibold'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-sky-50 dark:hover:bg-slate-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sort & Reset Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0 pt-0.5 sm:pt-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 shadow-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onChangeSortBy(e.target.value as any)}
              className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer text-xs pr-1"
              title="Sort order"
              aria-label="Sort documents"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Alphabetical (A–Z)</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 active:text-red-700 transition-colors py-1.5 px-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 border border-slate-300 dark:border-slate-600 sm:border-slate-200 bg-white dark:bg-slate-800 whitespace-nowrap shadow-xs"
              title="Reset all filters"
            >
              <X className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Active Filter Indicator ───────────────────── */}
      {selectedCategoryId && (
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
          <Tag className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 flex-shrink-0" />
          <span>Filtered by:</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-sky-50 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-700 rounded-full font-medium text-xs">
            {categories.find((c) => c.id === selectedCategoryId)?.name}
            <button
              onClick={() => onSelectCategory('')}
              className="hover:text-red-600 dark:hover:text-red-400 ml-0.5 p-0.5"
              aria-label="Remove filter"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        </div>
      )}
    </div>
  );
};
