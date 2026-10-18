import React from 'react';
import { BookX, RefreshCw } from 'lucide-react';
import { DocumentItem } from '../../types/database';
import { DocumentCard } from './DocumentCard';

interface DocumentGridProps {
  documents: DocumentItem[];
  isLoading: boolean;
  onOpenDocument: (doc: DocumentItem) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const DocumentGrid: React.FC<DocumentGridProps> = ({
  documents,
  isLoading,
  onOpenDocument,
  onResetFilters,
  hasActiveFilters,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 py-4 sm:py-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 animate-pulse flex flex-col"
          >
            <div className="aspect-[3/4] bg-slate-200 dark:bg-slate-700 rounded-lg mb-4 w-full" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2" />
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
            <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-full mb-1" />
            <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-2/3 mt-auto pt-4" />
          </div>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="py-12 sm:py-16 px-4 text-center max-w-md mx-auto">
        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-500">
          <BookX className="w-7 h-7" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">No Documents Found</h3>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {hasActiveFilters
            ? 'We could not find any materials matching your search or filters.'
            : 'There are currently no published study materials in this library.'}
        </p>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30 hover:bg-sky-100 dark:hover:bg-sky-900/50 active:bg-sky-200 dark:active:bg-sky-900/70 rounded-lg transition-colors border border-sky-200 dark:border-sky-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Clear Search & Filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 py-4 sm:py-6">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onOpen={onOpenDocument}
        />
      ))}
    </div>
  );
};
