// =========================================================
// lib/db/statuses.ts — Statuses CRUD
// =========================================================

import { supabase } from '$lib/supabase';
import { withRetry } from '$lib/utils';
import type { Status } from '$lib/types';

export async function createStatus(projectId: string, name: string, color: string): Promise<Status> {
  try {
    const { data: existing } = await supabase
      .from('statuses')
      .select('sort_order')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();
    const sort_order = (existing?.sort_order ?? -1) + 1;

    const { data, error } = await supabase
      .from('statuses')
      .insert({ project_id: projectId, name, color, sort_order })
      .select()
      .single();
    if (error) {
      console.error('db.createStatus:', error);
      throw error;
    }
    return data as Status;
  } catch (e) {
    console.warn('db.createStatus failed:', e);
    throw e;
  }
}

export async function updateStatus(id: string, updates: Partial<Status>): Promise<Status> {
  try {
    const { data, error } = await supabase
      .from('statuses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('db.updateStatus:', error);
      throw error;
    }
    return data as Status;
  } catch (e) {
    console.warn('db.updateStatus failed:', e);
    throw e;
  }
}

export async function deleteStatus(id: string, fallbackId?: string | null): Promise<void> {
  try {
    if (fallbackId) {
      await supabase.from('tasks').update({ status_id: fallbackId }).eq('status_id', id);
    }
    const { error } = await supabase.from('statuses').delete().eq('id', id);
    if (error) {
      console.error('db.deleteStatus:', error);
      throw error;
    }
  } catch (e) {
    console.warn('db.deleteStatus failed:', e);
    throw e;
  }
}

export async function reorderStatuses(items: { id: string; sort_order: number }[]): Promise<void> {
  try {
    await Promise.all(
      items.map((item) =>
        supabase.from('statuses').update({ sort_order: item.sort_order }).eq('id', item.id)
      )
    );
  } catch (e) {
    console.error('db.reorderStatuses:', e);
    console.warn('db.reorderStatuses failed:', e);
    throw e;
  }
}
