// =========================================================
// lib/db/priorities.ts — Priorities CRUD
// =========================================================

import { supabase } from '$lib/supabase';
import type { Priority } from '$lib/types';

export async function createPriority(projectId: string, name: string, color: string): Promise<Priority> {
  try {
    const { data: existing } = await supabase
      .from('priorities')
      .select('sort_order')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();
    const sort_order = (existing?.sort_order ?? -1) + 1;

    const { data, error } = await supabase
      .from('priorities')
      .insert({ project_id: projectId, name, color, sort_order })
      .select()
      .single();
    if (error) {
      console.error('db.createPriority:', error);
      throw error;
    }
    return data as Priority;
  } catch (e) {
    console.warn('db.createPriority failed:', e);
    throw e;
  }
}

export async function updatePriority(id: string, updates: Partial<Priority>): Promise<Priority> {
  try {
    const { data, error } = await supabase
      .from('priorities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('db.updatePriority:', error);
      throw error;
    }
    return data as Priority;
  } catch (e) {
    console.warn('db.updatePriority failed:', e);
    throw e;
  }
}

export async function deletePriority(id: string, fallbackId?: string | null): Promise<void> {
  try {
    if (fallbackId) {
      await supabase.from('tasks').update({ priority_id: fallbackId }).eq('priority_id', id);
    } else {
      await supabase.from('tasks').update({ priority_id: null }).eq('priority_id', id);
    }
    const { error } = await supabase.from('priorities').delete().eq('id', id);
    if (error) {
      console.error('db.deletePriority:', error);
      throw error;
    }
  } catch (e) {
    console.warn('db.deletePriority failed:', e);
    throw e;
  }
}

export async function reorderPriorities(items: { id: string; sort_order: number }[]): Promise<void> {
  try {
    await Promise.all(
      items.map((item) =>
        supabase.from('priorities').update({ sort_order: item.sort_order }).eq('id', item.id)
      )
    );
  } catch (e) {
    console.error('db.reorderPriorities:', e);
    console.warn('db.reorderPriorities failed:', e);
    throw e;
  }
}
