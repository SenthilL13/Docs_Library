export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  admin_id: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type DocumentStatus = 'draft' | 'published' | 'archived';

export interface DocumentItem {
  id: string;
  user_id: string;
  admin_id: string;
  title: string;
  file_name: string;
  file_path: string;
  description: string | null;
  subject: string | null;
  category_id: string | null;
  exam: string | null;
  tags: string[];
  storage_bucket: string;
  preview_path: string | null;
  page_count: number;
  file_size: number;
  status: DocumentStatus;
  created_at: string;
  updated_at: string;
  published_at: string;
  
  // Relations
  category?: Category;
  uploader?: {
    id: string;
    username: string;
    role: string;
  };
}

export interface AuthState {
  user: User | null;
  token?: string;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isChildUser: boolean;
}
