import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  AlertCircle,
  Loader2,
  FileText,
  BookOpen,
  ChevronsLeft,
  ChevronsRight,
  Info,
  Tag,
  Briefcase,
  Hash,
  Printer,
  Monitor,
  AlignCenter,
  X
} from 'lucide-react';
import { DocumentItem } from '../../types/database';
import { storageService } from '../../services/storageService';
import { loadPdfDocument } from '../../lib/pdf';

interface PdfReaderProps {
  document: DocumentItem;
  onBack: () => void;
}

type FitMode = 'width' | 'page' | 'custom';

export const PdfReader: React.FC<PdfReaderProps> = ({ document: doc, onBack }) => {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(doc.page_count || 1);
  const [scale, setScale] = useState<number>(1.0);
  const [fitMode, setFitMode] = useState<FitMode>('width');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [pageInputValue, setPageInputValue] = useState<string>('1');
  const [loadProgress, setLoadProgress] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLDivElement | null>(null);
  const renderTaskRef = useRef<any>(null);
  const pageInputRef = useRef<HTMLInputElement | null>(null);

  // Touch swipe tracking refs
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);

  const fileUrl = storageService.getPublicUrl(doc.file_path);

  // ── Load PDF ──────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setLoadProgress(0);

    loadPdfDocument(fileUrl)
      .then((pdf) => {
        if (!isMounted) return;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        setPageInputValue('1');
        setIsLoading(false);
        setLoadProgress(100);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('PDF load error:', err);
        setError('Could not load this document. The file may be corrupted, password-protected, or temporarily unavailable.');
        setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [fileUrl]);

  // ── Compute scale from fit mode ───────────────────────────
  const computeScale = useCallback(
    async (mode: FitMode, document: any, pageNum: number, customScale?: number) => {
      if (!mainRef.current || !document) return customScale ?? 1.0;
      if (mode === 'custom') return customScale ?? 1.0;

      try {
        const page = await document.getPage(pageNum);
        const vp = page.getViewport({ scale: 1 });
        const isMobile = window.innerWidth < 640;
        const hPadding = isMobile ? 24 : 48;
        const vPadding = isMobile ? 32 : 48;

        const containerWidth = Math.max(280, mainRef.current.clientWidth - hPadding);
        const containerHeight = Math.max(300, mainRef.current.clientHeight - vPadding);

        if (mode === 'width') {
          return Math.max(0.4, containerWidth / vp.width);
        }
        if (mode === 'page') {
          return Math.max(0.4, Math.min(containerHeight / vp.height, containerWidth / vp.width));
        }
      } catch (e) {
        console.warn('Scale computation error:', e);
      }
      return 1.0;
    },
    []
  );

  // Apply fit mode when doc or fitMode or currentPage changes
  useEffect(() => {
    if (!pdfDoc || fitMode === 'custom') return;
    computeScale(fitMode, pdfDoc, currentPage).then((s) => setScale(s));
  }, [pdfDoc, fitMode, currentPage, computeScale]);

  // Window resize handler: auto adjust width when orientation changes or window resizes
  useEffect(() => {
    let timeoutId: any = null;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (pdfDoc && fitMode !== 'custom') {
          computeScale(fitMode, pdfDoc, currentPage).then((s) => setScale(s));
        }
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [pdfDoc, fitMode, currentPage, computeScale]);

  // ── Render page on canvas ─────────────────────────────────
  const renderPage = useCallback(
    async (pageNumber: number) => {
      if (!pdfDoc || !canvasRef.current) return;

      try {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch (_) {}
        }
        setIsRendering(true);

        const page = await pdfDoc.getPage(pageNumber);
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2.5); // cap at 2.5 to save mobile memory
        const viewport = page.getViewport({ scale: scale * pixelRatio });

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / pixelRatio}px`;
        canvas.style.height = `${viewport.height / pixelRatio}px`;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const renderTask = page.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        setIsRendering(false);
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Render error:', err);
        }
        setIsRendering(false);
      }
    },
    [pdfDoc, scale]
  );

  useEffect(() => {
    renderPage(currentPage);
  }, [currentPage, renderPage]);

  // ── Navigation ────────────────────────────────────────────
  const goToPage = (p: number) => {
    const clamped = Math.max(1, Math.min(p, totalPages));
    setCurrentPage(clamped);
    setPageInputValue(String(clamped));
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPrevPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);
  const goToFirst = () => goToPage(1);
  const goToLast = () => goToPage(totalPages);

  const handlePageInputBlur = () => {
    const parsed = parseInt(pageInputValue, 10);
    if (!isNaN(parsed)) goToPage(parsed);
    else setPageInputValue(String(currentPage));
  };

  const handlePageInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handlePageInputBlur();
    if (e.key === 'Escape') setPageInputValue(String(currentPage));
  };

  // ── Keyboard navigation ───────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.activeElement === pageInputRef.current) return;

      switch (e.key) {
        case 'ArrowRight': case 'PageDown':
          e.preventDefault(); goToNextPage(); break;
        case 'ArrowLeft': case 'PageUp':
          e.preventDefault(); goToPrevPage(); break;
        case 'Home': e.preventDefault(); goToPage(1); break;
        case 'End': e.preventDefault(); goToPage(totalPages); break;
        case '+': case '=': e.preventDefault(); handleZoomIn(); break;
        case '-': e.preventDefault(); handleZoomOut(); break;
        case '0': if (e.ctrlKey || e.metaKey) { e.preventDefault(); handleFitWidth(); } break;
        case 'f': case 'F': if (!e.ctrlKey) { e.preventDefault(); toggleFullscreen(); } break;
        case 'Escape': if (isFullscreen) toggleFullscreen(); break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentPage, totalPages, isFullscreen, scale]);

  // ── Touch swipe gestures for mobile ───────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
      const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

      // Only swipe if predominantly horizontal and at least 50px
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        if (deltaX < 0) {
          goToNextPage(); // Swiped left -> next
        } else {
          goToPrevPage(); // Swiped right -> prev
        }
      }
    }
  };

  // ── Zoom ──────────────────────────────────────────────────
  const ZOOM_STEPS = [0.5, 0.67, 0.75, 0.9, 1.0, 1.15, 1.25, 1.5, 1.75, 2.0, 2.5];

  const handleZoomIn = () => {
    setFitMode('custom');
    setScale((s) => {
      const next = ZOOM_STEPS.find((z) => z > s);
      return next ?? Math.min(s + 0.25, 2.5);
    });
  };

  const handleZoomOut = () => {
    setFitMode('custom');
    setScale((s) => {
      const prev = [...ZOOM_STEPS].reverse().find((z) => z < s);
      return prev ?? Math.max(s - 0.25, 0.5);
    });
  };

  const handleFitWidth = () => setFitMode('width');
  const handleFitPage = () => setFitMode('page');

  // ── Fullscreen ────────────────────────────────────────────
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      window.document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!window.document.fullscreenElement);
    window.document.addEventListener('fullscreenchange', onFsChange);
    return () => window.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const handlePrint = () => {
    window.open(fileUrl, '_blank');
  };

  const formattedDate = new Date(doc.published_at || doc.created_at)
    .toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const fileSizeMB = doc.file_size
    ? `${(doc.file_size / (1024 * 1024)).toFixed(1)} MB`
    : null;

  // ── Sidebar Content Component ─────────────────────────────
  const DocumentInfoSidebar = () => (
    <div className="flex flex-col h-full bg-white select-none">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-sky-700 flex-shrink-0" />
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Document Details</h2>
        </div>
        <button
          onClick={() => setShowSidebar(false)}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {doc.preview_path && (
          <div className="rounded-xl overflow-hidden border border-slate-200 shadow-xs max-h-48 flex items-center justify-center bg-slate-50">
            <img
              src={storageService.getPublicUrl(doc.preview_path)}
              alt="Document Cover"
              className="w-full object-cover"
            />
          </div>
        )}

        <div>
          <h3 className="text-sm font-bold text-slate-900 leading-snug">
            {doc.title}
          </h3>
          {(doc.subject || doc.category) && (
            <p className="text-xs text-sky-700 font-medium mt-1">
              {[doc.category?.name, doc.subject].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        <div className="space-y-2.5 text-xs text-slate-600">
          {doc.category && (
            <div className="flex items-start gap-2">
              <Tag className="w-3.5 h-3.5 text-sky-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Career Track</p>
                <p className="text-slate-800 font-medium">{doc.category.name}</p>
              </div>
            </div>
          )}

          {doc.subject && (
            <div className="flex items-start gap-2">
              <Hash className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Skill / Topic</p>
                <p className="text-slate-700">{doc.subject}</p>
              </div>
            </div>
          )}

          {doc.exam && (
            <div className="flex items-start gap-2">
              <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Target Job Role</p>
                <p className="text-slate-700">{doc.exam}</p>
              </div>
            </div>
          )}

          {doc.description && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Abstract</p>
              <p className="text-slate-600 leading-relaxed">{doc.description}</p>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Pages</span>
              <span className="font-semibold text-slate-700">{totalPages}</span>
            </div>
            {fileSizeMB && (
              <div className="flex justify-between">
                <span className="text-slate-400">File Size</span>
                <span className="font-medium text-slate-700">{fileSizeMB}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Published</span>
              <span className="font-medium text-slate-700">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Current Position</span>
              <span className="font-bold text-sky-700">Page {currentPage} of {totalPages}</span>
            </div>
          </div>

          {doc.tags && doc.tags.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Tags</p>
              <div className="flex flex-wrap gap-1">
                {doc.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[11px] rounded font-mono border border-slate-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Actions</p>
          <a
            href={fileUrl}
            download={doc.file_name}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download PDF</span>
          </a>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Open in New Tab</span>
          </button>
          <button
            onClick={() => { handleFitWidth(); setShowSidebar(false); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
          >
            <AlignCenter className="w-3.5 h-3.5 text-slate-500" />
            <span>Fit to Screen Width</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`flex flex-col min-h-screen bg-[#f1f3f5] text-slate-800 ${
        isFullscreen ? 'fixed inset-0 z-[100]' : 'relative'
      }`}
    >
      {/* ── Top Header Toolbar ──────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs flex items-center justify-between gap-2 px-2.5 sm:px-4 py-2 select-none">

        {/* Left: Back + Document Title */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            onClick={onBack}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            title="Back to Library"
            aria-label="Back to Library"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Library</span>
          </button>

          <div className="min-w-0 flex-1 pl-1">
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate leading-tight">
              {doc.title}
            </h1>
            {(doc.subject || doc.category) && (
              <p className="text-[10px] sm:text-[11px] text-slate-500 truncate leading-tight hidden xs:block">
                {[doc.subject, doc.category?.name].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>

        {/* Center: Desktop Navigation Controls (md+) */}
        <div className="hidden md:flex items-center gap-0.5 bg-slate-50 border border-slate-200 rounded-lg px-1 py-0.5">
          <button
            onClick={goToFirst}
            disabled={currentPage <= 1 || isLoading}
            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-30 transition-colors"
            title="First Page"
            aria-label="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1 || isLoading}
            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-30 transition-colors"
            title="Previous Page"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Input */}
          <div className="flex items-center gap-1 px-1.5 text-xs text-slate-600">
            <input
              ref={pageInputRef}
              type="text"
              inputMode="numeric"
              value={pageInputValue}
              onChange={(e) => setPageInputValue(e.target.value)}
              onBlur={handlePageInputBlur}
              onKeyDown={handlePageInputKey}
              className="w-9 text-center bg-white border border-slate-300 rounded text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-academic-600 py-0.5"
              title="Go to page number"
            />
            <span className="text-slate-400">/</span>
            <span className="font-mono font-semibold text-slate-700">{totalPages}</span>
          </div>

          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalPages || isLoading}
            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-30 transition-colors"
            title="Next Page"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={goToLast}
            disabled={currentPage >= totalPages || isLoading}
            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-30 transition-colors"
            title="Last Page"
            aria-label="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Tools (Zoom, Fullscreen, Download, Info) */}
        <div className="flex items-center gap-1 flex-shrink-0">

          {/* Desktop Zoom controls */}
          <div className="hidden lg:flex items-center gap-0.5 bg-slate-50 border border-slate-200 rounded-lg px-1 py-0.5">
            <button
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
              className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-30 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <select
              value={
                fitMode === 'width' ? 'fit-width'
                : fitMode === 'page' ? 'fit-page'
                : `${Math.round(scale * 100)}`
              }
              onChange={(e) => {
                const v = e.target.value;
                if (v === 'fit-width') { handleFitWidth(); }
                else if (v === 'fit-page') { handleFitPage(); }
                else { setFitMode('custom'); setScale(parseInt(v) / 100); }
              }}
              className="bg-transparent text-xs font-mono text-slate-700 font-semibold focus:outline-none cursor-pointer py-0.5 pr-1"
            >
              {[50, 67, 75, 90, 100, 115, 125, 150, 175, 200, 250].map((p) => (
                <option key={p} value={String(p)}>{p}%</option>
              ))}
              <option value="fit-width">Fit Width</option>
              <option value="fit-page">Fit Page</option>
            </select>

            <button
              onClick={handleZoomIn}
              disabled={scale >= 2.5}
              className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-30 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Fit Width Shortcut (visible on tablet & mobile) */}
          <button
            onClick={handleFitWidth}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
              fitMode === 'width'
                ? 'bg-sky-100 text-sky-700 border border-academic-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Fit to Width"
            aria-label="Fit document to width"
          >
            <AlignCenter className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Download */}
          <a
            href={fileUrl}
            download={doc.file_name}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition-colors"
            title="Download PDF"
            aria-label="Download PDF"
          >
            <Download className="w-4 h-4" />
          </a>

          {/* Document Info Toggle */}
          <button
            onClick={() => setShowSidebar((v) => !v)}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
              showSidebar
                ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border border-sky-300 dark:border-sky-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="Document Details"
            aria-label="Toggle document details"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Progress bar ─────────────────────────────────── */}
      {isLoading && (
        <div className="h-1 bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full bg-sky-600 dark:bg-sky-500 transition-all duration-300"
            style={{ width: `${loadProgress}%` }}
          />
        </div>
      )}

      {/* ── Main Viewport Container ──────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* ── Mobile/Tablet Sidebar Drawer (under lg) ─────── */}
        {showSidebar && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/50 sidebar-overlay"
              onClick={() => setShowSidebar(false)}
            />
            <aside className="relative w-80 max-w-[85vw] h-full shadow-2xl z-10">
              <DocumentInfoSidebar />
            </aside>
          </div>
        )}

        {/* ── Desktop Inline Sidebar (lg+) ────────────────── */}
        {showSidebar && (
          <aside className="hidden lg:flex w-72 border-r border-slate-200 shadow-sm flex-col flex-shrink-0">
            <DocumentInfoSidebar />
          </aside>
        )}

        {/* ── PDF Canvas Viewport ─────────────────────────── */}
        <main
          ref={mainRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="flex-1 overflow-auto bg-[#e5e7eb] flex flex-col items-center py-4 px-2 sm:px-4 sm:py-6 relative"
        >
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center gap-3 py-24 sm:py-32 text-slate-500">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-700">Loading document...</p>
              <p className="text-[11px] text-slate-400 max-w-xs text-center truncate">{doc.file_name}</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="max-w-sm w-full bg-white border border-red-200 rounded-2xl shadow-md p-6 text-center mt-12 mx-3">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Document Unavailable</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">{error}</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-3.5 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  Retry
                </button>
                <button
                  onClick={onBack}
                  className="px-3.5 py-2 text-xs font-semibold bg-sky-700 hover:bg-sky-800 text-white rounded-lg transition-colors"
                >
                  Back to Library
                </button>
              </div>
            </div>
          )}

          {/* PDF Canvas */}
          {!isLoading && !error && (
            <div className="relative inline-block max-w-full">
              {isRendering && (
                <div className="absolute top-2 right-2 z-10">
                  <div className="bg-white/95 backdrop-blur-xs rounded-lg px-2.5 py-1 shadow-sm border border-slate-200 flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                    <Loader2 className="w-3 h-3 animate-spin text-sky-600" />
                    <span>Rendering...</span>
                  </div>
                </div>
              )}

              {/* Page Shadow Container */}
              <div className="bg-white shadow-[0_4px_24px_rgba(0,0,0,0.18),0_1px_4px_rgba(0,0,0,0.10)] rounded-xs overflow-x-auto max-w-full">
                <canvas ref={canvasRef} className="block mx-auto max-w-full h-auto" />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Mobile / Tablet Floating Bottom Navigation Bar ── */}
      {!isLoading && !error && (
        <div className="sticky bottom-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-sky-200 dark:border-slate-700 shadow-lg px-3 py-2 pb-safe select-none">
          <div className="max-w-md mx-auto flex items-center justify-between gap-2">

            {/* Prev Button */}
            <button
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg disabled:opacity-30 transition-colors"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev</span>
            </button>

            {/* Center: Page Counter / Quick Jump */}
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
              <span>Page</span>
              <input
                type="text"
                inputMode="numeric"
                value={pageInputValue}
                onChange={(e) => setPageInputValue(e.target.value)}
                onBlur={handlePageInputBlur}
                onKeyDown={handlePageInputKey}
                className="w-10 text-center bg-slate-50 border border-slate-300 rounded-md text-xs font-bold font-mono py-1 text-sky-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-academic-600"
              />
              <span className="text-slate-400">of</span>
              <span className="font-bold text-slate-800">{totalPages}</span>
            </div>

            {/* Next Button */}
            <button
              onClick={goToNextPage}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-white bg-sky-700 hover:bg-sky-800 active:bg-sky-900 rounded-lg disabled:opacity-30 transition-colors"
              aria-label="Next Page"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
