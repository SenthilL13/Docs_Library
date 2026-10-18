import React, { useState } from 'react';
import { BookOpen, User as UserIcon, Lock, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { User } from '../types/database';

interface AdminLoginPageProps {
  onLoginSuccess: (user: User) => void;
  onBackToLibrary: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onBackToLibrary,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const user = await authService.login(username.trim(), password.trim());
      setIsLoading(false);
      onLoginSuccess(user);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid username or password.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-900 dark:border-slate-600 text-slate-900 dark:text-slate-100 mx-auto flex items-center justify-center mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            SenaDocs Portal Sign In
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1">
            Your Gateway to Shaping the Future of Technical Knowledge
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 border border-slate-300 dark:border-slate-700">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded flex items-center gap-2 text-xs text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-600 dark:focus:ring-sky-400 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-600 dark:focus:ring-sky-400 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-500 text-white font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-600 dark:focus:ring-sky-400 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Begin Your Journey</span>
              )}
            </button>
          </form>
        </div>

        {/* Back link */}
        <div className="text-center">
          <button
            onClick={onBackToLibrary}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Library</span>
          </button>
        </div>
      </div>
    </div>
  );
};
