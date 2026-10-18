import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LibraryPage } from './pages/LibraryPage';
import { PdfReader } from './components/reader/PdfReader';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { authService } from './services/authService';
import { DocumentItem, User } from './types/database';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('library');
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);

  // Restore session
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }

    // Check hash for direct route or document reader
    const hash = window.location.hash.replace('#', '');
    if (hash.startsWith('reader-')) {
      const docId = hash.replace('reader-', '');
      // Can open reader if docId is set
    } else if (hash === 'admin' && user) {
      setCurrentPage('admin');
    } else if (hash === 'login') {
      setCurrentPage('login');
    }
  }, []);

  const handleNavigate = (page: string, params?: any) => {
    setCurrentPage(page);
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDocument = (doc: DocumentItem) => {
    setSelectedDocument(doc);
    setCurrentPage('reader');
    window.location.hash = `reader-${doc.id}`;
  };

  const handleBackToLibrary = () => {
    setSelectedDocument(null);
    setCurrentPage('library');
    window.location.hash = 'library';
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('admin');
    window.location.hash = 'admin';
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentPage('library');
    window.location.hash = 'library';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Navbar shown when not in distraction-free reader mode */}
      {currentPage !== 'reader' && (
        <Navbar
          currentUser={currentUser}
          onNavigate={handleNavigate}
          currentPage={currentPage}
          onLogout={handleLogout}
        />
      )}

      {/* Page Routing */}
      <div className="flex-1">
        <ErrorBoundary>
          {currentPage === 'library' && (
            <LibraryPage onOpenDocument={handleOpenDocument} />
          )}

          {currentPage === 'reader' && selectedDocument && (
            <PdfReader
              document={selectedDocument}
              onBack={handleBackToLibrary}
            />
          )}

          {currentPage === 'login' && (
            <AdminLoginPage
              onLoginSuccess={handleLoginSuccess}
              onBackToLibrary={handleBackToLibrary}
            />
          )}

          {currentPage === 'admin' && (
            currentUser ? (
              <AdminDashboardPage
                currentUser={currentUser}
                onLogout={handleLogout}
                onOpenDocument={handleOpenDocument}
                onReturnToLibrary={handleBackToLibrary}
              />
            ) : (
              <AdminLoginPage
                onLoginSuccess={handleLoginSuccess}
                onBackToLibrary={handleBackToLibrary}
              />
            )
          )}
        </ErrorBoundary>
      </div>

      {/* Academic Footer */}
      {currentPage !== 'reader' && currentPage !== 'admin' && <Footer />}
    </div>
  );
}

export default App;
