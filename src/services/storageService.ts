import { supabase } from '../lib/supabaseClient';

const BUCKET = 'documents';

export const storageService = {
  /**
   * Uploads a document PDF file to Supabase storage
   */
  async uploadPdf(file: File, customPath?: string): Promise<{ path: string; publicUrl: string }> {
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = customPath || `pdfs/${timestamp}_${sanitizedName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'application/pdf',
      });

    if (error) {
      console.error('Storage upload error (PDF):', error);
      throw new Error(`Failed to upload PDF: ${error.message}`);
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);

    return {
      path: data.path,
      publicUrl: urlData.publicUrl,
    };
  },

  /**
   * Uploads a generated preview thumbnail Blob to Supabase storage
   */
  async uploadPreview(blob: Blob, baseName: string): Promise<{ path: string; publicUrl: string }> {
    const timestamp = Date.now();
    const sanitizedName = baseName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `previews/${timestamp}_${sanitizedName}.jpg`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, {
        cacheControl: '86400',
        upsert: false,
        contentType: 'image/jpeg',
      });

    if (error) {
      console.error('Storage upload error (Preview):', error);
      throw new Error(`Failed to upload preview thumbnail: ${error.message}`);
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);

    return {
      path: data.path,
      publicUrl: urlData.publicUrl,
    };
  },

  /**
   * Gets the public accessible URL for a storage path
   */
  getPublicUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Deletes one or more files from Supabase storage
   */
  async deleteFiles(paths: string[]): Promise<void> {
    const validPaths = paths.filter(p => !!p && !p.startsWith('http'));
    if (validPaths.length === 0) return;

    const { error } = await supabase.storage.from(BUCKET).remove(validPaths);
    if (error) {
      console.error('Storage delete error:', error);
      // Log error but avoid blocking metadata operations
    }
  }
};
