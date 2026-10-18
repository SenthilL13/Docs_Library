import { supabase } from '../lib/supabaseClient';
import { Category } from '../types/database';

export const categoriesService = {
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return (data || []) as Category[];
  },

  async createCategory(category: { name: string; slug: string; description?: string; sort_order?: number }): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name.trim(),
        slug: category.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: category.description?.trim() || null,
        sort_order: category.sort_order ?? 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }

    return data as Category;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }

    return data as Category;
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
};
