import React, { useState } from 'react';
import {
  FileText, Search, Filter, Eye, Edit2, Trash2,
  Globe, Lock, Loader2, AlertCircle, ChevronRight
} from 'lucide-react';
import { DocumentItem, DocumentStatus, User } from '../../types/database';
import { storageService } from '../../services/storageService';
import { documentsService } from '../../services/documentsService';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface DocumentTableProps {
  documents: DocumentItem[];
  isLoading: boolean;
  currentUser: User;
  onRefresh: () => void;
  onOpenDocument: (doc: DocumentItem) => void;
  onEditDocument: (doc: DocumentItem) => void;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  isLoading,
  currentUser,
  onRefresh,
  onOpenDocument,
  onEditDocument,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [documentToDelete, setDocumentToDelete] = useState<DocumentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.subject && doc.subject.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' ? true : doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async () => {
    if (!documentToDelete) return;
    try {
      setIsDeleting(true);
      setActionError(null);
      await documentsService.deleteDocument(documentToDelete.id, currentUser);
      setDocumentToDelete(null);
      setIsDeleting(false);
      onRefresh();
    } catch (err: any) {
      console.error('Delete failed:', err);
      setActionError(err.message || 'Failed to delete document');
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (doc: DocumentItem) => {
    try {
      const nextStatus: DocumentStatus = doc.status === 'published' ? 'draft' : 'published';
      await documentsService.updateDocument(doc.id, { status: nextStatus }, currentUser);
      onRefresh();
    } catch (err: any) {
      console.error('Failed to toggle status:', err);
      setActionError(err.message || 'Failed to change document status');
    }
  };

  return (
    <div className="space-y-4">
      {actionError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-xs text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter documents..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-600 dark:focus:ring-sky-400 focus:bg-white dark:focus:bg-slate-600 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2.5 py-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span className="hidden sm:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer text-xs"
            >
              <option value="all">All ({documents.length})</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Loading ─────────────────────────────────────── */}
      {isLoading && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center text-slate-400 dark:text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-sky-600 dark:text-sky-400" />
          <p className="text-sm font-medium">Loading documents...</p>
        </div>
      )}

      {/* ── Empty ───────────────────────────────────────── */}
      {!isLoading && filtered.length === 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center text-slate-500 dark:text-slate-400">
          <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-medium">No documents found</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Upload a study material or adjust filters to view items.
          </p>
        </div>
      )}

      {/* ── Desktop Table (md+) ─────────────────────────── */}
      {!isLoading && filtered.length > 0 && (
        <>
          <div className="hidden md:block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Document</th>
                    <th className="py-3 px-4">Category / Subject</th>
                    <th className="py-3 px-4">Uploader</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
                  {filtered.map((doc) => {
                    const previewUrl = doc.preview_path
                      ? storageService.getPublicUrl(doc.preview_path)
                      : null;
                    const isOwner = doc.user_id === currentUser.id;
                    const canEdit = currentUser.role === 'admin' || isOwner;

                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-12 bg-slate-100 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {previewUrl ? (
                                <img src={previewUrl} alt="Thumb" className="w-full h-full object-cover" />
                              ) : (
                                <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                              )}
                            </div>
                            <div className="min-w-0 max-w-xs">
                              <p
                                onClick={() => onOpenDocument(doc)}
                                className="font-semibold text-slate-900 dark:text-slate-100 truncate hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer"
                                title={doc.title}
                              >
                                {doc.title}
                              </p>
                              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                                {doc.file_name} • {doc.page_count}p
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            {doc.category ? (
                              <span className="inline-block text-[11px] font-medium text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-900/30 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-700">
                                {doc.category.name}
                              </span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500 text-xs">Uncategorized</span>
                            )}
                            {doc.subject && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{doc.subject}</p>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-xs">
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {doc.uploader?.username || (isOwner ? currentUser.username : 'Group User')}
                            </span>
                            {doc.user_id === currentUser.id && (
                              <span className="ml-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1 rounded border border-emerald-200 dark:border-emerald-700">
                                You
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <button
                            onClick={() => canEdit && handleToggleStatus(doc)}
                            disabled={!canEdit}
                            title={canEdit ? 'Click to toggle status' : 'Only owner can edit'}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                              doc.status === 'published'
                                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600'
                            } ${!canEdit ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                          >
                            {doc.status === 'published' ? (
                              <><Globe className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /><span>Published</span></>
                            ) : (
                              <><Lock className="w-3 h-3 text-slate-500 dark:text-slate-400" /><span>Draft</span></>
                            )}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onOpenDocument(doc)}
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                              title="Read in Reader"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {canEdit && (
                              <button
                                onClick={() => onEditDocument(doc)}
                                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                title="Edit metadata"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            {canEdit && (
                              <button
                                onClick={() => setDocumentToDelete(doc)}
                                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                title="Delete document"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Mobile Card List (< md) ─────────────────── */}
          <div className="md:hidden space-y-3">
            {filtered.map((doc) => {
              const previewUrl = doc.preview_path
                ? storageService.getPublicUrl(doc.preview_path)
                : null;
              const isOwner = doc.user_id === currentUser.id;
              const canEdit = currentUser.role === 'admin' || isOwner;

              return (
                <div
                  key={doc.id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    {/* Thumbnail */}
                    <div className="w-12 h-16 bg-slate-100 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Thumb" className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title + status badge */}
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          onClick={() => onOpenDocument(doc)}
                          className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 cursor-pointer hover:text-sky-600 dark:hover:text-sky-400 flex-1"
                        >
                          {doc.title}
                        </h4>
                        <span
                          className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                            doc.status === 'published'
                              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          {doc.status === 'published' ? (
                            <><Globe className="w-2.5 h-2.5" /><span>Live</span></>
                          ) : (
                            <><Lock className="w-2.5 h-2.5" /><span>Draft</span></>
                          )}
                        </span>
                      </div>

                      {/* Meta row */}
                      <div className="mt-1 flex flex-wrap gap-1">
                        {doc.category && (
                          <span className="text-[11px] font-medium text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-900/30 px-1.5 py-0.5 rounded border border-sky-200 dark:border-sky-700">
                            {doc.category.name}
                          </span>
                        )}
                        {doc.subject && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded truncate max-w-[140px]">
                            {doc.subject}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 truncate">
                        {doc.file_name} • {doc.page_count}p • {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Card action row */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <button
                      onClick={() => onOpenDocument(doc)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30 hover:bg-sky-100 dark:hover:bg-sky-900/50 border border-sky-200 dark:border-sky-700 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Read</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {canEdit && (
                        <button
                          onClick={() => handleToggleStatus(doc)}
                          className="px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-lg transition-colors"
                          title="Toggle publish status"
                        >
                          {doc.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                      )}
                      {canEdit && (
                        <button
                          onClick={() => onEditDocument(doc)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {canEdit && (
                        <button
                          onClick={() => setDocumentToDelete(doc)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!documentToDelete}
        title="Delete Study Material"
        message={`Are you sure you want to permanently delete "${documentToDelete?.title}"? Both the document record and storage files will be removed.`}
        confirmLabel="Delete Document"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDocumentToDelete(null)}
      />
    </div>
  );
};
