import React, { useState, useEffect } from 'react';
import {
  BookOpen, LogIn, LayoutDashboard, LogOut,
  User as UserIcon, Shield, Menu, X, Library, Sun, Moon
} from 'lucide-react';
import { User } from '../../types/database';
import { useTheme } from '../../contexts/ThemeContext';

interface NavbarProps {
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onNavigate,
  currentPage,
  onLogout,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Close mobile menu on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  // Lock body scroll on mobile when menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  const handleNavigate = (page: string) => {
    onNavigate(page);
    closeMobile();
  };

  const handleLogout = () => {
    onLogout();
    closeMobile();
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-300 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">

            {/* ── Logo & Brand ──────────────────────────── */}
            <div
              onClick={() => handleNavigate('library')}
              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group flex-shrink-0 min-w-0"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') handleNavigate('library'); }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-sky-600 bg-sky-500 flex items-center justify-center text-white flex-shrink-0">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex items-center min-w-0">
                <span className="text-base sm:text-xl font-serif font-semibold text-slate-900 dark:text-slate-100 truncate">
                  SenaDocs
                </span>
              </div>
            </div>

            {/* ── Desktop Navigation ────────────────────── */}
            <div className="hidden sm:flex items-center gap-2 md:gap-3">
              <button
                onClick={() => handleNavigate('library')}
                className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${
                  currentPage === 'library'
                    ? 'text-sky-600 border-sky-600 font-semibold'
                    : 'text-slate-600 border-transparent hover:text-sky-600 hover:border-sky-300'
                }`}
              >
                Public Library
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              {currentUser ? (
                <div className="flex items-center gap-2 border-l border-slate-300 pl-3">
                  <button
                    onClick={() => handleNavigate('admin')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${
                      currentPage === 'admin'
                        ? 'text-sky-600 border-sky-600 font-semibold'
                        : 'text-slate-600 border-transparent hover:text-sky-600 hover:border-sky-300'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </button>

                  <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-500">
                    <span className="font-medium text-slate-700 max-w-[120px] truncate">{currentUser.username}</span>
                    <span className="text-slate-400">({currentUser.role})</span>
                  </div>

                  <button
                    onClick={onLogout}
                    title="Sign Out"
                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleNavigate('login')}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-sky-600 border-2 border-sky-600 hover:bg-sky-600 hover:text-white transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Portal Sign In</span>
                </button>
              )}
            </div>

            {/* ── Mobile Hamburger Button ───────────────── */}
            <div className="flex sm:hidden items-center gap-1">
              {/* Theme Toggle for Mobile */}
              <button
                onClick={toggleTheme}
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              {currentUser && (
                <button
                  onClick={() => handleNavigate('admin')}
                  className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1 ${
                    currentPage === 'admin' ? 'bg-sky-100 text-sky-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Dashboard"
                  aria-label="Admin Dashboard"
                >
                  <LayoutDashboard className="w-4 h-4 text-sky-700" />
                </button>
              )}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Drawer / Dropdown ──────────────────── */}
        {mobileOpen && (
          <div className="sm:hidden border-t border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg animate-fade-in">
            <nav className="px-4 py-3 space-y-1 pb-safe">
              <button
                onClick={() => handleNavigate('library')}
                className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium border-l-2 transition-colors ${
                  currentPage === 'library'
                    ? 'text-sky-600 dark:text-sky-400 border-sky-600 dark:border-sky-400 bg-sky-50 dark:bg-slate-800 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 border-transparent hover:bg-sky-50 dark:hover:bg-slate-800'
                }`}
              >
                <Library className="w-4 h-4" />
                <span>Public Library</span>
              </button>

              {currentUser ? (
                <>
                  <button
                    onClick={() => handleNavigate('admin')}
                    className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium border-l-2 transition-colors ${
                      currentPage === 'admin'
                        ? 'text-sky-600 dark:text-sky-400 border-sky-600 dark:border-sky-400 bg-sky-50 dark:bg-slate-800 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 border-transparent hover:bg-sky-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Admin Dashboard</span>
                  </button>

                  {/* Mobile user badge */}
                  <div className="flex items-center gap-2.5 px-3 py-2.5 bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 my-1">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{currentUser.username}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{currentUser.role} Account</p>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="pt-2">
                  <button
                    onClick={() => handleNavigate('login')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-sky-600 dark:text-sky-400 border-2 border-sky-600 dark:border-sky-400 hover:bg-sky-600 dark:hover:bg-sky-500 hover:text-white dark:hover:text-white transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Portal Sign In</span>
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};
