import React, { useState, useRef, useCallback } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Category, DocumentStatus, User } from '../../types/database';
import { generatePdfThumbnail } from '../../lib/pdf';
import { storageService } from '../../services/storageService';
import { documentsService } from '../../services/documentsService';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  currentUser: User;
  onSuccess: () => void;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  categories,
  currentUser,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnailBlob, setThumbnailBlob] = useState<Blob | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [isProcessingPdf, setIsProcessingPdf] = useState<boolean>(false);

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subject, setSubject] = useState('');
  const [exam, setExam] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [status, setStatus] = useState<DocumentStatus>('published');

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStep, setUploadStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /** Purge all state from the previous PDF selection to prevent stale cache. */
  const clearPreviousFile = useCallback(() => {
    // Revoke any object URL created for the old thumbnail to free browser memory
    if (thumbnailUrl && thumbnailUrl.startsWith('blob:')) {
      URL.revokeObjectURL(thumbnailUrl);
    }
    setFile(null);
    setThumbnailBlob(null);
    setThumbnailUrl(null);
    setPageCount(1);
    setError(null);
    // Reset the native file input so the same file can be re-chosen
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [thumbnailUrl]);

  const handleClose = useCallback(() => {
    if (isUploading) return;
    clearPreviousFile();
    setTitle('');
    setCategoryId('');
    setSubject('');
    setExam('');
    setDescription('');
    setTagsInput('');
    setStatus('published');
    setError(null);
    onClose();
  }, [clearPreviousFile, isUploading, onClose]);

  const handleFileSelect = async (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      setError('Please select a valid PDF document (.pdf)');
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('PDF file size must be less than 50MB');
      return;
    }

    // ── Clear previous file data before loading the new one ──
    clearPreviousFile();

    setFile(selectedFile);

    // Auto-fill title from filename if empty
    if (!title) {
      const cleanName = selectedFile.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    // Generate real first-page thumbnail
    try {
      setIsProcessingPdf(true);
      const result = await generatePdfThumbnail(selectedFile);
      setThumbnailBlob(result.previewBlob);
      setThumbnailUrl(result.previewDataUrl);
      setPageCount(result.pageCount);
      setIsProcessingPdf(false);
    } catch (err: any) {
      console.warn('Could not generate PDF thumbnail:', err);
      setIsProcessingPdf(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a PDF file to upload.');
      return;
    }

    if (!title.trim()) {
      setError('Document title is required.');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Step 1: Upload PDF to Supabase Storage
      setUploadStep('Uploading PDF document to Supabase storage...');
      const pdfUpload = await storageService.uploadPdf(file);

      // Step 2: Upload Preview Thumbnail
      let previewPath: string | null = null;
      if (thumbnailBlob) {
        setUploadStep('Uploading generated first-page preview...');
        const previewUpload = await storageService.uploadPreview(thumbnailBlob, file.name);
        previewPath = previewUpload.path;
      }

      // Step 3: Insert Document record into database
      setUploadStep('Saving document metadata and permissions...');
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await documentsService.createDocument(
        {
          title: title.trim(),
          fileName: file.name,
          filePath: pdfUpload.path,
          description: description.trim() || undefined,
          subject: subject.trim() || undefined,
          categoryId: categoryId || null,
          exam: exam.trim() || undefined,
          tags,
          previewPath,
          pageCount,
          fileSize: file.size,
          status,
        },
        currentUser
      );

      setUploadStep('Complete!');
      setIsUploading(false);
      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'An error occurred while uploading document.');
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-700 overflow-hidden my-4 sm:my-8 animate-fade-in max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-700 flex-shrink-0">
          <div className="min-w-0 flex-1 pr-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate">Upload IT Study Material</h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
              Upload technical documentation, architecture blueprints, or job preparation guides.
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-600 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-xs text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* File Upload & Preview Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              PDF Document <span className="text-red-500">*</span>
            </label>

            {!file ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-sky-500 dark:hover:border-sky-400 rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/50 hover:bg-sky-50/20 dark:hover:bg-sky-900/20"
              >
                <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 text-sky-600 dark:text-sky-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Click to select or drag & drop PDF file here
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Supported format: PDF up to 50MB
                </p>
              </div>
            ) : (
              <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl flex items-center gap-3 sm:gap-4">
                {/* Generated Preview Thumbnail */}
                <div className="w-14 h-18 sm:w-16 sm:h-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded shadow-xs overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {isProcessingPdf ? (
                    <Loader2 className="w-5 h-5 animate-spin text-sky-600 dark:text-sky-400" />
                  ) : thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt="First page preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 dark:text-slate-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {pageCount} pages
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded mt-1 border border-emerald-200 dark:border-emerald-700">
                    <CheckCircle2 className="w-3 h-3" /> Cover Preview Generated
                  </span>
                </div>

                <button
                  type="button"
                  onClick={clearPreviousFile}
                  className="text-xs text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 px-2 py-1 rounded flex-shrink-0"
                >
                  Change
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
          </div>

          {/* Title & IT Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Microservices Architecture & Event-Driven Patterns"
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

          {/* Subject (Skill/Topic) & Job Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Technical Subject / Core Skill
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. React.js & TypeScript, Kubernetes, PyTorch, System Design"
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
                placeholder="e.g. Full Stack Engineer, Cloud Architect, DevOps Engineer, AWS Certified"
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
              placeholder="Summary of topics covered, code examples, interview questions, or practical lab instructions..."
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 dark:focus:ring-sky-400"
            />
          </div>

          {/* Tags & Publication Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="react, typescript, architecture, interview-prep"
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
                <option value="published">Published (Visible in Public Library)</option>
                <option value="draft">Draft (Restricted / Private)</option>
              </select>
            </div>
          </div>

          {/* Upload Progress Indicator */}
          {isUploading && (
            <div className="p-3 bg-sky-50 border border-academic-200 rounded-lg flex items-center gap-3 text-xs text-sky-800">
              <Loader2 className="w-4 h-4 animate-spin text-sky-600 flex-shrink-0" />
              <span>{uploadStep}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !file}
              className="w-full sm:w-auto px-5 py-2 text-sm font-medium text-white bg-sky-700 dark:bg-sky-600 hover:bg-sky-800 dark:hover:bg-sky-500 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-600 dark:focus:ring-sky-400 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Upload & Publish</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
