import React, { useState, useEffect } from 'react';
import {
  AdminSidebar,
  AdminTab
} from '../components/admin/AdminSidebar';
import { AdminOverview } from '../components/admin/AdminOverview';
import { DocumentTable } from '../components/admin/DocumentTable';
import { CategoryManagement } from '../components/admin/CategoryManagement';
import { UserManagementModal } from '../components/admin/UserManagementModal';
import { UploadDocumentModal } from '../components/admin/UploadDocumentModal';
import { EditDocumentModal } from '../components/admin/EditDocumentModal';
import { BulkImportModal } from '../components/admin/BulkImportModal';
import { Category, DocumentItem, User } from '../types/database';
import { documentsService } from '../services/documentsService';
import { categoriesService } from '../services/categoriesService';

interface AdminDashboardPageProps {
  currentUser: User;
  onLogout: () => void;
  onOpenDocument: (doc: DocumentItem) => void;
  onReturnToLibrary: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  currentUser,
  onLogout,
  onOpenDocument,
  onReturnToLibrary,
}) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [documentToEdit, setDocumentToEdit] = useState<DocumentItem | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [docsResult, catsResult] = await Promise.all([
        documentsService.getDocumentsForUser(currentUser, { limit: 100 }),
        categoriesService.getCategories(),
      ]);

      setDocuments(docsResult.documents);
      setCategories(catsResult);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser.id]);

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Persistent Left Sidebar (desktop) / Mobile Drawer */}
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenBulkImport={() => setIsBulkImportOpen(true)}
        onReturnToLibrary={onReturnToLibrary}
        onLogout={onLogout}
      />

      {/* Main Content Area
          On mobile: add top padding for the fixed mobile top-bar (≈44px) */}
      <main className="flex-1 overflow-y-auto pt-[44px] lg:pt-0 bg-slate-50 dark:bg-slate-900">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {currentTab === 'overview' && (
              <AdminOverview
                documents={documents}
                categories={categories}
                currentUser={currentUser}
                onOpenUpload={() => setIsUploadOpen(true)}
                onSelectTab={setCurrentTab}
                onOpenLibrary={onReturnToLibrary}
              />
            )}

            {currentTab === 'documents' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {currentUser.role === 'admin' ? 'All Organization Materials' : 'My Uploaded Materials'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {currentUser.role === 'admin'
                      ? 'Administrative view of all materials uploaded by you and assigned child users.'
                      : 'You can manage and update your own study material documents.'}
                  </p>
                </div>

                <DocumentTable
                  documents={documents}
                  isLoading={isLoading}
                  currentUser={currentUser}
                  onRefresh={loadData}
                  onOpenDocument={onOpenDocument}
                  onEditDocument={(doc) => setDocumentToEdit(doc)}
                />
              </div>
            )}

            {currentTab === 'categories' && (
              <CategoryManagement
                categories={categories}
                currentUser={currentUser}
                onRefresh={loadData}
              />
            )}

            {currentTab === 'users' && currentUser.role === 'admin' && (
              <UserManagementModal
                currentUser={currentUser}
                onClose={() => setCurrentTab('overview')}
              />
            )}
          </div>
        </div>
      </main>

      {/* Upload Document Modal */}
      {isUploadOpen && (
        <UploadDocumentModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          categories={categories}
          currentUser={currentUser}
          onSuccess={() => {
            loadData();
            setCurrentTab('documents');
          }}
        />
      )}

      {/* Bulk Import Modal */}
      {isBulkImportOpen && (
        <BulkImportModal
          isOpen={isBulkImportOpen}
          onClose={() => setIsBulkImportOpen(false)}
          categories={categories}
          currentUser={currentUser}
          existingDocuments={documents}
          onSuccess={() => {
            loadData();
            setCurrentTab('documents');
          }}
        />
      )}

      {/* Edit Document Modal */}
      {documentToEdit && (
        <EditDocumentModal
          isOpen={!!documentToEdit}
          onClose={() => setDocumentToEdit(null)}
          document={documentToEdit}
          categories={categories}
          currentUser={currentUser}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};
