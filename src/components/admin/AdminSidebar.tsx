import React, { useState } from 'react';
import {
  FileText, Upload, Users, Tags, LayoutDashboard,
  Shield, User as UserIcon, LogOut, ArrowLeft, Menu, X,
  ChevronLeft
} from 'lucide-react';
import { User } from '../../types/database';

export type AdminTab = 'overview' | 'documents' | 'categories' | 'users';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  currentUser: User;
  onOpenUpload: () => void;
  onOpenBulkImport: () => void;
  onReturnToLibrary: () => void;
  onLogout: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenUpload,
  onOpenBulkImport,
  onReturnToLibrary,
  onLogout,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleTab = (tab: AdminTab) => {
    onSelectTab(tab);
    setMobileOpen(false);
  };

  const handleUpload = () => {
    onOpenUpload();
    setMobileOpen(false);
  };

  const navItems = [
    { tab: 'overview' as AdminTab, label: 'Overview', icon: LayoutDashboard, color: 'text-academic-400' },
    { tab: 'documents' as AdminTab, label: isAdmin ? 'All Materials' : 'My Materials', icon: FileText, color: 'text-emerald-400' },
    { tab: 'categories' as AdminTab, label: 'Categories', icon: Tags, color: 'text-purple-400' },
    ...(isAdmin ? [{ tab: 'users' as AdminTab, label: 'Child Users', icon: Users, color: 'text-amber-400' }] : []),
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-sky-700 dark:border-slate-700 flex items-center justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-sky-100 dark:text-slate-100 tracking-tight">SenaDocs Portal</h2>
          <div className="flex items-center gap-1.5 mt-1">
            {isAdmin ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-200 dark:text-slate-200 bg-sky-900/40 dark:bg-slate-800 px-2 py-0.5 border border-sky-700/50 dark:border-slate-600">
                <Shield className="w-3 h-3" />
                Administrator
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-300 dark:text-slate-300 bg-sky-800/50 dark:bg-slate-800 px-2 py-0.5 border border-sky-700/50 dark:border-slate-600">
                <UserIcon className="w-3 h-3" />
                Child User
              </span>
            )}
          </div>
        </div>
        {/* Close button on mobile drawer */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 text-sky-400 dark:text-slate-400 hover:text-sky-100 dark:hover:text-slate-100 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Upload Buttons */}
      <div className="p-3 sm:p-4 space-y-2">
        <button
          onClick={handleUpload}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-500 dark:bg-sky-600 hover:bg-sky-400 dark:hover:bg-sky-500 text-white font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-400"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
        <button
          onClick={onOpenBulkImport}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-700 dark:bg-sky-800 hover:bg-sky-600 dark:hover:bg-sky-700 text-white font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400"
        >
          <Upload className="w-4 h-4" />
          <span>Bulk Import</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 sm:px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map(({ tab, label, icon: Icon, color }) => (
          <button
            key={tab}
            onClick={() => handleTab(tab)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
              currentTab === tab
                ? 'bg-sky-700 dark:bg-slate-800 text-white dark:text-slate-100 font-semibold border-l-2 border-sky-300 dark:border-sky-400'
                : 'text-sky-400 dark:text-slate-400 hover:bg-sky-800/50 dark:hover:bg-slate-800 hover:text-sky-200 dark:hover:text-slate-200'
            }`}
          >
            <Icon className={`w-4 h-4 flex-shrink-0 ${color}`} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-sky-700 dark:border-slate-700 space-y-2">
        <button
          onClick={onReturnToLibrary}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-sky-400 dark:text-slate-400 hover:text-sky-200 dark:hover:text-slate-200 hover:bg-sky-800 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Public Library</span>
        </button>

        <div className="pt-2 flex items-center justify-between border-t border-sky-800/60 dark:border-slate-800/60 text-xs">
          <div className="truncate min-w-0">
            <p className="font-medium text-sky-200 dark:text-slate-200 truncate">{currentUser.username}</p>
            <p className="text-[10px] text-sky-500 dark:text-slate-500 truncate">ID: {currentUser.id.slice(0, 8)}...</p>
          </div>
          <button
            onClick={onLogout}
            title="Sign Out"
            className="flex-shrink-0 p-1.5 text-sky-400 dark:text-slate-400 hover:text-red-300 dark:hover:text-red-300 hover:bg-red-900/30 dark:hover:bg-red-900/30 rounded transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile: top bar with hamburger ─────────────────── */}
      <div className="lg:hidden fixed top-14 left-0 right-0 z-30 bg-sky-900 dark:bg-slate-900 border-b border-sky-700 dark:border-slate-700 flex items-center justify-between px-4 py-2">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 text-sky-300 dark:text-slate-300 hover:text-sky-100 dark:hover:text-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
          <span className="text-sm font-medium">
            {navItems.find((n) => n.tab === currentTab)?.label ?? 'Menu'}
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenBulkImport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 dark:bg-sky-800 hover:bg-sky-600 dark:hover:bg-sky-700 text-white text-xs font-medium transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Bulk</span>
          </button>
          <button
            onClick={handleUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 dark:bg-sky-600 hover:bg-sky-400 dark:hover:bg-sky-500 text-white text-xs font-medium transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* ── Mobile: full-screen drawer overlay ─────────────── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 sidebar-overlay"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative w-72 max-w-[85vw] bg-sky-900 dark:bg-slate-900 text-sky-300 dark:text-slate-300 flex flex-col h-full shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Desktop: persistent left sidebar ───────────────── */}
      <aside className="hidden lg:flex w-64 bg-sky-900 dark:bg-slate-900 text-sky-300 dark:text-slate-300 flex-col min-h-screen border-r border-sky-800 dark:border-slate-800 flex-shrink-0">
        <SidebarContent />
      </aside>
    </>
  );
};
