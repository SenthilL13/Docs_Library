import { supabase } from '../lib/supabaseClient';
import { User } from '../types/database';

const SESSION_KEY = 'athena_docs_auth_user';

export const authService = {
  /**
   * Log in using username and password via Supabase RPC
   */
  async login(username: string, password: string): Promise<User> {
    const { data, error } = await supabase.rpc('authenticate_user', {
      p_username: username.trim(),
      p_password: password.trim(),
    });

    if (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Authentication failed');
    }

    if (!data || data.length === 0) {
      throw new Error('Invalid username or password');
    }

    const user: User = data[0];
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },

  /**
   * Get the currently logged-in user from storage
   */
  getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  },

  /**
   * Sign out the current user
   */
  logout(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  /**
   * For Admin: List all child users belonging to this admin
   */
  async getChildUsers(adminId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, role, admin_id, created_at')
      .eq('admin_id', adminId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching child users:', error);
      throw error;
    }

    return (data || []) as User[];
  },

  /**
   * For Admin: Create a new child user associated with this admin
   */
  async createChildUser(adminId: string, username: string, password: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        username: username.trim(),
        password: password.trim(),
        role: 'user',
        admin_id: adminId,
      })
      .select('id, username, role, admin_id, created_at')
      .single();

    if (error) {
      console.error('Error creating child user:', error);
      if (error.code === '23505') {
        throw new Error('A user with this username already exists');
      }
      throw error;
    }

    return data as User;
  },

  /**
   * For Admin: Delete a child user
   */
  async deleteChildUser(childUserId: string, adminId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', childUserId)
      .eq('admin_id', adminId);

    if (error) {
      console.error('Error deleting child user:', error);
      throw error;
    }
  }
};
