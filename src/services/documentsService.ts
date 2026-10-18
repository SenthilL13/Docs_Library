import { supabase } from '../lib/supabaseClient';
import { DocumentItem, DocumentStatus, User } from '../types/database';
import { storageService } from './storageService';

export interface GetDocumentsOptions {
  search?: string;
  categoryId?: string;
  subject?: string;
  exam?: string;
  tag?: string;
  sortBy?: 'newest' | 'oldest' | 'title';
  status?: DocumentStatus;
  limit?: number;
  offset?: number;
}

export const documentsService = {
  /**
   * For Public: Fetch published documents with search, filtering, and sorting
   */
  async getPublishedDocuments(options: GetDocumentsOptions = {}): Promise<{ documents: DocumentItem[]; total: number }> {
    let query = supabase
      .from('documents')
      .select('*, category:categories(*), uploader:users!documents_user_id_fkey(id, username, role)', { count: 'exact' })
      .eq('status', 'published');

    if (options.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }

    if (options.subject) {
      query = query.eq('subject', options.subject);
    }

    if (options.exam) {
      query = query.eq('exam', options.exam);
    }

    if (options.tag) {
      query = query.contains('tags', [options.tag]);
    }

    if (options.search && options.search.trim()) {
      const term = `%${options.search.trim()}%`;
      query = query.or(`title.ilike.${term},description.ilike.${term},subject.ilike.${term},exam.ilike.${term}`);
    }

    if (options.sortBy === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else if (options.sortBy === 'title') {
      query = query.order('title', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const limit = options.limit || 20;
    const offset = options.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching published documents:', error);
      throw error;
    }

    return {
      documents: (data || []) as DocumentItem[],
      total: count || 0,
    };
  },

  /**
   * Get a single document by ID
   */
  async getDocumentById(id: string): Promise<DocumentItem | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*, category:categories(*), uploader:users!documents_user_id_fkey(id, username, role)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching document by ID:', error);
      return null;
    }

    return data as DocumentItem;
  },

  /**
   * For Admin / Child User: Fetch documents scoped to permission level
   * - Admin: Can view all documents where admin_id = admin.id (both own and child users')
   * - Child User: Can view ONLY documents where user_id = user.id
   */
  async getDocumentsForUser(
    user: User,
    options: GetDocumentsOptions = {}
  ): Promise<{ documents: DocumentItem[]; total: number }> {
    let query = supabase
      .from('documents')
      .select('*, category:categories(*), uploader:users!documents_user_id_fkey(id, username, role)', { count: 'exact' });

    if (user.role === 'admin') {
      // Admin sees everything in their organization group
      query = query.eq('admin_id', user.id);
    } else {
      // Child user sees only their own uploaded documents
      query = query.eq('user_id', user.id);
    }

    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }

    if (options.search && options.search.trim()) {
      const term = `%${options.search.trim()}%`;
      query = query.or(`title.ilike.${term},description.ilike.${term},file_name.ilike.${term}`);
    }

    query = query.order('created_at', { ascending: false });

    const limit = options.limit || 50;
    const offset = options.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching user scoped documents:', error);
      throw error;
    }

    return {
      documents: (data || []) as DocumentItem[],
      total: count || 0,
    };
  },

  /**
   * Create a new document with proper parent-child ownership
   */
  async createDocument(
    doc: {
      title: string;
      fileName: string;
      filePath: string;
      description?: string;
      subject?: string;
      categoryId?: string | null;
      exam?: string;
      tags?: string[];
      previewPath?: string | null;
      pageCount?: number;
      fileSize?: number;
      status?: DocumentStatus;
    },
    currentUser: User
  ): Promise<DocumentItem> {
    const parentAdminId = currentUser.role === 'admin' ? currentUser.id : currentUser.admin_id;

    if (!parentAdminId) {
      throw new Error('Child user must have an associated admin_id');
    }

    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: currentUser.id,
        admin_id: parentAdminId,
        title: doc.title.trim(),
        file_name: doc.fileName,
        file_path: doc.filePath,
        description: doc.description?.trim() || null,
        subject: doc.subject?.trim() || null,
        category_id: doc.categoryId || null,
        exam: doc.exam?.trim() || null,
        tags: doc.tags || [],
        storage_bucket: 'documents',
        preview_path: doc.previewPath || null,
        page_count: doc.pageCount || 1,
        file_size: doc.fileSize || 0,
        status: doc.status || 'published',
        published_at: doc.status === 'published' ? new Date().toISOString() : null,
      })
      .select('*, category:categories(*)')
      .single();

    if (error) {
      console.error('Error creating document:', error);
      throw error;
    }

    return data as DocumentItem;
  },

  /**
   * Update document metadata
   */
  async updateDocument(
    documentId: string,
    updates: Partial<{
      title: string;
      description: string | null;
      subject: string | null;
      category_id: string | null;
      exam: string | null;
      tags: string[];
      status: DocumentStatus;
    }>,
    currentUser: User
  ): Promise<DocumentItem> {
    // Validate permission
    const existing = await this.getDocumentById(documentId);
    if (!existing) throw new Error('Document not found');

    if (currentUser.role !== 'admin' && existing.user_id !== currentUser.id) {
      throw new Error('Permission denied: You can only edit your own documents');
    }

    const updatePayload: Record<string, any> = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (updates.status === 'published' && !existing.published_at) {
      updatePayload.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('documents')
      .update(updatePayload)
      .eq('id', documentId)
      .select('*, category:categories(*)')
      .single();

    if (error) {
      console.error('Error updating document:', error);
      throw error;
    }

    return data as DocumentItem;
  },

  /**
   * Safe PDF Replacement:
   * Retains old file until new file and metadata are successfully updated, then deletes prior object.
   */
  async replaceDocumentFile(
    documentId: string,
    newFile: {
      fileName: string;
      filePath: string;
      previewPath: string | null;
      pageCount: number;
      fileSize: number;
    },
    currentUser: User
  ): Promise<DocumentItem> {
    const existing = await this.getDocumentById(documentId);
    if (!existing) throw new Error('Document not found');

    if (currentUser.role !== 'admin' && existing.user_id !== currentUser.id) {
      throw new Error('Permission denied: You can only replace your own documents');
    }

    const oldFilePath = existing.file_path;
    const oldPreviewPath = existing.preview_path;

    const { data, error } = await supabase
      .from('documents')
      .update({
        file_name: newFile.fileName,
        file_path: newFile.filePath,
        preview_path: newFile.previewPath,
        page_count: newFile.pageCount,
        file_size: newFile.fileSize,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)
      .select('*, category:categories(*)')
      .single();

    if (error) {
      console.error('Error updating document file reference:', error);
      throw error;
    }

    // Now safely delete old storage objects
    const pathsToDelete: string[] = [];
    if (oldFilePath && oldFilePath !== newFile.filePath) pathsToDelete.push(oldFilePath);
    if (oldPreviewPath && oldPreviewPath !== newFile.previewPath) pathsToDelete.push(oldPreviewPath);

    if (pathsToDelete.length > 0) {
      await storageService.deleteFiles(pathsToDelete);
    }

    return data as DocumentItem;
  },

  /**
   * Delete document and its associated storage assets
   */
  async deleteDocument(documentId: string, currentUser: User): Promise<void> {
    const existing = await this.getDocumentById(documentId);
    if (!existing) throw new Error('Document not found');

    if (currentUser.role !== 'admin' && existing.user_id !== currentUser.id) {
      throw new Error('Permission denied: You can only delete your own documents');
    }

    // Delete database row
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (error) {
      console.error('Error deleting document record:', error);
      throw error;
    }

    // Clean up storage files
    const pathsToDelete: string[] = [];
    if (existing.file_path) pathsToDelete.push(existing.file_path);
    if (existing.preview_path) pathsToDelete.push(existing.preview_path);

    if (pathsToDelete.length > 0) {
      await storageService.deleteFiles(pathsToDelete);
    }
  }
};
