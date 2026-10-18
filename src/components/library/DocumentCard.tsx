import React, { useState } from 'react';
import { FileText, Calendar, Eye, Briefcase } from 'lucide-react';
import { DocumentItem } from '../../types/database';
import { storageService } from '../../services/storageService';

interface DocumentCardProps {
  document: DocumentItem;
  onOpen: (doc: DocumentItem) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onOpen }) => {
  const [imageError, setImageError] = useState(false);

  const previewUrl = document.preview_path
    ? storageService.getPublicUrl(document.preview_path)
    : null;

  const formattedDate = new Date(document.published_at || document.created_at).toLocaleDateString(
    'en-US',
    { month: 'short', day: 'numeric', year: 'numeric' }
  );

  return (
    <article
      onClick={() => onOpen(document)}
      className="group relative bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 active:border-sky-600 dark:active:border-sky-500 transition-all duration-200 flex flex-col cursor-pointer overflow-hidden focus-within:ring-2 focus-within:ring-sky-600 select-none"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(document); }}
    >
      {/* Thumbnail / First-page Preview Container */}
      <div className="relative aspect-[3/4] w-full bg-sky-100 dark:bg-slate-700 overflow-hidden border-b border-sky-200 dark:border-slate-600 flex items-center justify-center">
        {previewUrl && !imageError ? (
          <img
            src={previewUrl}
            alt={`First page preview of ${document.title}`}
            onError={() => setImageError(true)}
            loading="lazy"
            fetchPriority="low"
            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
            style={{ aspectRatio: '3/4' }}
          />
        ) : (
          /* Neutral technical document cover fallback */
          <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 text-center bg-sky-50 dark:bg-slate-700">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border border-sky-300 dark:border-slate-500 flex items-center justify-center text-sky-400 dark:text-sky-300 mb-2 sm:mb-3">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 line-clamp-2 px-2 leading-snug">
              {document.title}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-400 mt-1 uppercase tracking-wider font-mono">
              Technical Documentation
            </span>
          </div>
        )}

        {/* Floating Page Count Badge */}
        {document.page_count && (
          <div className="absolute top-2.5 right-2.5 bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-medium px-2 py-0.5 border-l-2 border-sky-500 pointer-events-none">
            {document.page_count} {document.page_count === 1 ? 'page' : 'pages'}
          </div>
        )}

        {/* Hover / Tap Action Overlay */}
        <div className="absolute inset-0 bg-sky-950/10 dark:bg-sky-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold text-xs border border-sky-300 dark:border-slate-600">
            <Eye className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            Read Document
          </span>
        </div>
      </div>

      {/* Metadata Section */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Subject Tag */}
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            {document.category && (
              <span className="text-[11px] font-semibold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-slate-700 px-2 py-0.5 border border-sky-300 dark:border-slate-600 truncate max-w-[160px]">
                {document.category.name}
              </span>
            )}
            {document.subject && (
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-sky-50 dark:bg-slate-700 px-2 py-0.5 border border-sky-200 dark:border-slate-600 truncate max-w-[140px]">
                {document.subject}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-snug line-clamp-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
            {document.title}
          </h3>

          {/* Short Description */}
          {document.description && (
            <p className="mt-1 sm:mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {document.description}
            </p>
          )}
        </div>

        {/* Footer info: Target Job Role & Date */}
        <div className="mt-3.5 pt-2.5 sm:mt-4 sm:pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 text-[11px] text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-1 flex-shrink-0">
            <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            <span>{formattedDate}</span>
          </div>

          {document.exam && (
            <span
              className="inline-flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200 bg-sky-50 dark:bg-slate-700 px-2 py-0.5 border border-sky-300 dark:border-slate-600 truncate max-w-[130px] sm:max-w-[150px]"
              title={`Target Role: ${document.exam}`}
            >
              <Briefcase className="w-2.5 h-2.5 text-sky-600 dark:text-sky-400 flex-shrink-0" />
              <span className="truncate">{document.exam}</span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
