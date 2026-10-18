import React, { useState, useRef } from 'react';
import { X, FileText, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Category, DocumentItem, DocumentStatus, User } from '../../types/database';
import { generatePdfThumbnail } from '../../lib/pdf';
import { storageService } from '../../services/storageService';
import { documentsService } from '../../services/documentsService';

interface EditDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  categories: Category[];
  currentUser: User;
  onSuccess: () => void;
}

export const EditDocumentModal: React.FC<EditDocumentModalProps> = ({
  isOpen,
  onClose,
  document,
  categories,
  currentUser,
  onSuccess,
}) => {
  const [title, setTitle] = useState(document?.title || '');
  const [categoryId, setCategoryId] = useState(document?.category_id || '');
  const [subject, setSubject] = useState(document?.subject || '');
  const [exam, setExam] = useState(document?.exam || '');
  const [description, setDescription] = useState(document?.description || '');
  const [tagsInput, setTagsInput] = useState((document?.tags || []).join(', '));
  const [status, setStatus] = useState<DocumentStatus>(document?.status || 'published');

  // Safe PDF Replacement states
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [replacementThumbnailBlob, setReplacementThumbnailBlob] = useState<Blob | null>(null);
  const [replacementThumbnailUrl, setReplacementThumbnailUrl] = useState<string | null>(null);
  const [replacementPageCount, setReplacementPageCount] = useState<number>(1);
  const [isProcessingReplacement, setIsProcessingReplacement] = useState<boolean>(false);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savingStep, setSavingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleReplacementSelect = async (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      setError('Please select a valid PDF document (.pdf)');
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('PDF file size must be less than 50MB');
      return;
    }

    setError(null);
    setReplacementFile(selectedFile);

    try {
      setIsProcessingReplacement(true);
      const result = await generatePdfThumbnail(selectedFile);
      setReplacementThumbnailBlob(result.previewBlob);
      setReplacementThumbnailUrl(result.previewDataUrl);
      setReplacementPageCount(result.pageCount);
      setIsProcessingReplacement(false);
    } catch (err: any) {
      console.warn('Could not generate replacement thumbnail:', err);
      setIsProcessingReplacement(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!document) return;

    if (!title.trim()) {
      setError('Title cannot be empty');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      // 1. If user chose a replacement PDF, perform safe staged replacement
      if (replacementFile) {
        setSavingStep('Uploading replacement PDF...');
        const pdfUpload = await storageService.uploadPdf(replacementFile);

        let previewPath: string | null = null;
        if (replacementThumbnailBlob) {
          setSavingStep('Uploading replacement thumbnail...');
          const previewUpload = await storageService.uploadPreview(
            replacementThumbnailBlob,
            replacementFile.name
          );
          previewPath = previewUpload.path;
        }

        setSavingStep('Updating document record and cleaning prior assets...');
        await documentsService.replaceDocumentFile(
          document.id,
          {
            fileName: replacementFile.name,
            filePath: pdfUpload.path,
            previewPath,
            pageCount: replacementPageCount,
            fileSize: replacementFile.size,
          },
          currentUser
        );
      }

      // 2. Update metadata
      setSavingStep('Saving metadata updates...');
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await documentsService.updateDocument(
        document.id,
        {
          title: title.trim(),
          description: description.trim() || null,
          subject: subject.trim() || null,
          category_id: categoryId || null,
          exam: exam.trim() || null,
          tags,
          status,
        },
        currentUser
      );

      setIsSaving(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to update document:', err);
      setError(err.message || 'Failed to update document');
      setIsSaving(false);
    }
  };

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-700 overflow-hidden my-8 animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-700">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Edit IT Study Material</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update technical metadata, job role alignment, or replace the document file.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-xs text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current File / Replacement Option */}
          <div className="p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Document File
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 text-xs text-sky-700 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replace PDF File</span>
              </button>
            </div>

            {replacementFile ? (
              <div className="flex items-center gap-3 p-2 bg-amber-50/80 border border-amber-200 rounded-lg">
                <FileText className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-amber-900 truncate">
                    Replacement: {replacementFile.name}
                  </p>
                  <p className="text-[11px] text-amber-700">
                    {(replacementFile.size / (1024 * 1024)).toFixed(2)} MB • {replacementPageCount} pages
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setReplacementFile(null);
                    setReplacementThumbnailBlob(null);
                    setReplacementThumbnailUrl(null);
                  }}
                  className="text-xs text-amber-700 hover:text-red-600 px-2"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{document.file_name}</span>
                <span className="text-slate-400">({document.page_count} pages)</span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleReplacementSelect(e.target.files[0])}
            />
          </div>

          {/* Title & IT Domain */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 dark:focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                IT Domain / Career Track
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 dark:focus:ring-sky-400"
              >
                <option value="">Select an IT domain...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject & Job Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Technical Subject / Core Skill
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 dark:focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Job Role / Certification
              </label>
              <input
                type="text"
                value={exam}
                onChange={(e) => setExam(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 dark:focus:ring-sky-400"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description / Abstract
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 dark:focus:ring-sky-400"
            />
          </div>

          {/* Tags & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 dark:focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Visibility Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DocumentStatus)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 dark:focus:ring-sky-400"
              >
                <option value="published">Published (Public)</option>
                <option value="draft">Draft (Restricted)</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Saving Progress */}
          {isSaving && (
            <div className="p-3 bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-700 rounded-lg flex items-center gap-3 text-xs text-sky-800 dark:text-sky-300">
              <Loader2 className="w-4 h-4 animate-spin text-sky-600 dark:text-sky-400 flex-shrink-0" />
              <span>{savingStep}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-sm font-medium text-white bg-sky-700 dark:bg-sky-600 hover:bg-sky-800 dark:hover:bg-sky-500 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-600 dark:focus:ring-sky-400 disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
