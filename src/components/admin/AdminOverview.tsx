import React from 'react';
import {
  FileText,
  Globe,
  Lock,
  Tags,
  Users,
  Upload,
  BookOpen,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Category, DocumentItem, User } from '../../types/database';

interface AdminOverviewProps {
  documents: DocumentItem[];
  categories: Category[];
  currentUser: User;
  onOpenUpload: () => void;
  onSelectTab: (tab: any) => void;
  onOpenLibrary: () => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  documents,
  categories,
  currentUser,
  onOpenUpload,
  onSelectTab,
  onOpenLibrary,
}) => {
  const publishedCount = documents.filter((d) => d.status === 'published').length;
  const draftCount = documents.filter((d) => d.status === 'draft').length;
  const totalPages = documents.reduce((acc, d) => acc + (d.page_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-sky-900 dark:bg-slate-800 border-l-4 border-sky-400 dark:border-sky-500 p-6 text-white relative">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-200 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>SenaDocs Knowledge Center</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Welcome back, {currentUser.username}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
            {currentUser.role === 'admin'
              ? 'You have administrative control over your organization’s documents, child users, and academic disciplines.'
              : 'You are signed in as a group contributor. You can upload, organize, and manage your academic publications.'}
          </p>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 text-sky-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg text-sm font-semibold shadow-sm transition-colors"
            >
              <Upload className="w-4 h-4 text-sky-700 dark:text-sky-400" />
              <span>Upload New PDF</span>
            </button>
            <button
              onClick={onOpenLibrary}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-800/80 dark:bg-sky-700 hover:bg-sky-700 dark:hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition-colors border border-sky-700/60 dark:border-sky-600"
            >
              <span>View Public Library</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onSelectTab('documents')}
          className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-sky-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {currentUser.role === 'admin' ? 'Total Materials' : 'My Materials'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{documents.length}</p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-1">{totalPages} cumulative pages</p>
        </div>

        <div
          onClick={() => onSelectTab('documents')}
          className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-emerald-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Published
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{publishedCount}</p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-1">Live in public catalog</p>
        </div>

        <div
          onClick={() => onSelectTab('documents')}
          className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-slate-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Drafts
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{draftCount}</p>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1">Private / Unpublished</p>
        </div>

        <div
          onClick={() => onSelectTab('categories')}
          className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-purple-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Disciplines
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 flex items-center justify-center">
              <Tags className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{categories.length}</p>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1">Academic categories</p>
        </div>
      </div>

      {/* Recent Materials Preview */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Recent Materials</h3>
          <button
            onClick={() => onSelectTab('documents')}
            className="text-xs font-medium text-sky-700 dark:text-sky-400 hover:text-sky-800"
          >
            View all documents →
          </button>
        </div>

        {documents.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">No materials uploaded yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {documents.slice(0, 5).map((doc) => (
              <div key={doc.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 truncate">
                  <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{doc.title}</span>
                  {doc.category && (
                    <span className="text-[10px] text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30 px-1.5 py-0.5 rounded border border-sky-200 dark:border-sky-700">
                      {doc.category.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 flex-shrink-0">
                  <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      doc.status === 'published'
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
