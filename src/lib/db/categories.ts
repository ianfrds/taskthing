// =========================================================
// lib/db/categories.ts — Categories CRUD
// =========================================================

import { supabase } from '$lib/supabase';
import { withRetry } from '$lib/utils';
import type { Category } from '$lib/types';

export async function createCategory(projectId: string, name: string, color: string): Promise<Category> {
  try {
    const { data: existing } = await supabase
      .from('categories')
      .select('sort_order')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();
    const sort_order = (existing?.sort_order ?? -1) + 1;

    const { data, error } = await supabase
      .from('categories')
      .insert({ project_id: projectId, name, color, sort_order })
      .select()
      .single();
    if (error) {
      console.error('db.createCategory:', error);
      throw error;
    }
    return data as Category;
  } catch (e) {
    console.warn('db.createCategory failed:', e);
    throw e;
  }
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('db.updateCategory:', error);
      throw error;
    }
    return data as Category;
  } catch (e) {
    console.warn('db.updateCategory failed:', e);
    throw e;
  }
}

export async function deleteCategory(id: string, fallbackId?: string | null): Promise<void> {
  try {
    if (fallbackId) {
      await supabase.from('tasks').update({ category_id: fallbackId }).eq('category_id', id);
    } else {
      await supabase.from('tasks').update({ category_id: null }).eq('category_id', id);
    }
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      console.error('db.deleteCategory:', error);
      throw error;
    }
  } catch (e) {
    console.warn('db.deleteCategory failed:', e);
    throw e;
  }
}

export async function reorderCategories(items: { id: string; sort_order: number }[]): Promise<void> {
  try {
    await Promise.all(
      items.map((item) =>
        supabase.from('categories').update({ sort_order: item.sort_order }).eq('id', item.id)
      )
    );
  } catch (e) {
    console.error('db.reorderCategories:', e);
    console.warn('db.reorderCategories failed:', e);
    throw e;
  }
}
