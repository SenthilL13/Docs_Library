import React, { useState } from 'react';
import { Layers, Plus, Trash2, Edit2, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Category, User } from '../../types/database';
import { categoriesService } from '../../services/categoriesService';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface CategoryManagementProps {
  categories: Category[];
  currentUser: User;
  onRefresh: () => void;
}

export const CategoryManagement: React.FC<CategoryManagementProps> = ({
  categories,
  currentUser,
  onRefresh,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await categoriesService.createCategory({
        name: name.trim(),
        slug,
        description: description.trim() || undefined,
        sort_order: categories.length + 1,
      });

      setName('');
      setDescription('');
      setSuccess('Technology domain created successfully');
      setIsSubmitting(false);
      onRefresh();
    } catch (err: any) {
      console.error('Failed to create category:', err);
      setError(err.message || 'Failed to create category');
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setIsDeleting(true);
      await categoriesService.deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
      setIsDeleting(false);
      onRefresh();
    } catch (err: any) {
      console.error('Failed to delete category:', err);
      setError(err.message || 'Failed to delete category');
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 dark:bg-sky-900/30 border border-sky-500/20 dark:border-sky-700 flex items-center justify-center text-sky-700 dark:text-sky-400 flex-shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">IT Disciplines & Technology Domains</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Define the classification structure for technical documentation. Developers, cloud
              engineers, and hiring managers can filter study materials by these standardized IT career tracks.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-xs text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Add Category Form */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-5 shadow-xs">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-sky-700 dark:text-sky-400" />
          <span>Add New Technology Track</span>
        </h4>

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Domain / Track Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Site Reliability Engineering"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 dark:focus:ring-sky-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Core Skills & Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. SRE, Observability, SLOs, Chaos Engineering"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 dark:focus:ring-sky-400"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-sky-600 dark:bg-sky-700 hover:bg-sky-500 dark:hover:bg-sky-600 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-500 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>Add IT Domain</span>
            </button>
          </div>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-xs">
        <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Available IT Disciplines ({categories.length})
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="px-4 sm:px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="min-w-0 flex-1 pr-4">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{cat.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  Slug: <span className="font-mono text-slate-400 dark:text-slate-500">/{cat.slug}</span>
                  {cat.description && ` • ${cat.description}`}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setCategoryToDelete(cat)}
                  className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!categoryToDelete}
        title="Delete Technology Domain"
        message={`Are you sure you want to delete track "${categoryToDelete?.name}"? Any materials currently linked to it will become uncategorized.`}
        confirmLabel="Delete Track"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setCategoryToDelete(null)}
      />
    </div>
  );
};
