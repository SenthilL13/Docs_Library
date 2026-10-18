import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Key, Shield, User as UserIcon, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { User } from '../../types/database';
import { authService } from '../../services/authService';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface UserManagementModalProps {
  currentUser: User;
  onClose: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  currentUser,
  onClose,
}) => {
  const [childUsers, setChildUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states for creating a new child user
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Delete state
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    loadChildUsers();
  }, [currentUser.id]);

  const loadChildUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const users = await authService.getChildUsers(currentUser.id);
      setChildUsers(users);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Failed to load child users:', err);
      setError('Failed to load assigned child users');
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      setError('Username and password are required');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      setSuccessMsg(null);

      const newUser = await authService.createChildUser(
        currentUser.id,
        newUsername.trim(),
        newPassword.trim()
      );

      setChildUsers((prev) => [newUser, ...prev]);
      setSuccessMsg(`Child user "${newUser.username}" created successfully.`);
      setNewUsername('');
      setNewPassword('');
      setIsCreating(false);
    } catch (err: any) {
      console.error('Error creating child user:', err);
      setError(err.message || 'Failed to create child user');
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      await authService.deleteChildUser(userToDelete.id, currentUser.id);
      setChildUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setUserToDelete(null);
      setSuccessMsg(`User deleted successfully.`);
      setIsDeleting(false);
    } catch (err: any) {
      console.error('Error deleting child user:', err);
      setError(err.message || 'Failed to delete user');
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 dark:bg-amber-900/30 border border-amber-500/20 dark:border-amber-700 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Child User Management</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              As an Administrator, you can provision child user accounts. Child users can upload and
              manage their own study materials, and you have administrative visibility and oversight
              over all materials created across your organization group.
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

      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Create New Child User Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-xs">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-sky-700 dark:text-sky-400" />
          <span>Create New Child User</span>
        </h4>

        <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="e.g. researcher_clara"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 dark:focus:ring-sky-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Temporary password"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 dark:focus:ring-sky-400"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isCreating}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-sky-700 dark:bg-sky-600 hover:bg-sky-800 dark:hover:bg-sky-500 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-600 dark:focus:ring-sky-400 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              <span>Add Child User</span>
            </button>
          </div>
        </form>
      </div>

      {/* Child Users List */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-700">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Assigned Child Users ({childUsers.length})
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-600 dark:text-sky-400" />
            <p className="text-xs">Loading users...</p>
          </div>
        ) : childUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <UserIcon className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium">No child users created yet</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Create an account above to assign contributors under your admin group.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {childUsers.map((user) => (
              <div
                key={user.id}
                className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-700 flex items-center justify-center text-sky-700 dark:text-sky-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user.username}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                      ID: {user.id.slice(0, 13)}... • Created:{' '}
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUserToDelete(user)}
                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Delete child user"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!userToDelete}
        title="Delete Child User Account"
        message={`Are you sure you want to delete user "${userToDelete?.username}"? This action cannot be undone.`}
        confirmLabel="Delete User"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteUser}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
};
