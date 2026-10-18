import React, { useState, useEffect } from 'react';
import { Terminal } from 'lucide-react';
import { Category, DocumentItem } from '../types/database';
import { documentsService } from '../services/documentsService';
import { categoriesService } from '../services/categoriesService';
import { SearchBar } from '../components/library/SearchBar';
import { FilterChips } from '../components/library/FilterChips';
import { DocumentGrid } from '../components/library/DocumentGrid';

interface LibraryPageProps {
  onOpenDocument: (doc: DocumentItem) => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({ onOpenDocument }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [search, setSearch] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  useEffect(() => {
    categoriesService.getCategories()
      .then(setCategories)
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const { documents: docs, total } = await documentsService.getPublishedDocuments({
        search,
        categoryId: selectedCategoryId || undefined,
        sortBy,
        limit: 50,
      });
      setDocuments(docs);
      setTotalCount(total);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => { fetchDocuments(); }, 200);
    return () => clearTimeout(timer);
  }, [search, selectedCategoryId, sortBy]);

  const hasActiveFilters = Boolean(search || selectedCategoryId || sortBy !== 'newest');

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategoryId('');
    setSortBy('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">

      {/* ── Hero Banner ────────────────────────────────── */}
      <div className="bg-gradient-to-br from-sky-100 via-sky-50 to-white dark:from-slate-800 dark:via-slate-900 dark:to-slate-900 border-t-4 border-sky-500 dark:border-sky-400 border-x border-b border-sky-200 dark:border-slate-700 p-4 sm:p-6 lg:p-8 relative">
        <div className="max-w-4xl">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-semibold text-slate-900 dark:text-slate-100 leading-tight mb-3 sm:mb-4">
            Technical Study Materials &amp; Career Documentation
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mb-4 sm:mb-6">
            Curated system architecture blueprints, software engineering manuals, cloud certifications,
            and job-ready interview preparation guides for tech professionals.
          </p>

          <div className="mt-4 sm:mt-6">
            <SearchBar
              value={search}
              onChange={setSearch}
              onClear={() => setSearch('')}
              placeholder="Search by technology, skill, or job role..."
              totalResults={totalCount}
            />
          </div>
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────── */}
      <FilterChips
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
        sortBy={sortBy}
        onChangeSortBy={setSortBy}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
      />

      {/* ── Document Grid ──────────────────────────────── */}
      <DocumentGrid
        documents={documents}
        isLoading={isLoading}
        onOpenDocument={onOpenDocument}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />
    </div>
  );
};
