// =========================================================
// lib/db/resources.ts — Resources CRUD
// =========================================================

import { supabase } from '$lib/supabase';
import { withRetry } from '$lib/utils';
import type { Resource, CreateResourcePayload } from '$lib/types';

export async function createResource(projectId: string, payload: CreateResourcePayload): Promise<Resource> {
  try {
    return await withRetry(async () => {
      const { data, error } = await supabase
        .from('resources')
        .insert({ ...payload, project_id: projectId })
        .select()
        .single();
      if (error) {
        console.error('db.createResource:', error);
        throw error;
      }
      return data as Resource;
    });
  } catch (e) {
    console.warn('db.createResource failed:', e);
    throw e;
  }
}

export async function updateResource(id: string, updates: Partial<Resource>): Promise<Resource> {
  try {
    return await withRetry(async () => {
      const { data, error } = await supabase
        .from('resources')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) {
        console.error('db.updateResource:', error);
        throw error;
      }
      return data as Resource;
    });
  } catch (e) {
    console.warn('db.updateResource failed:', e);
    throw e;
  }
}

export async function deleteResource(id: string): Promise<void> {
  try {
    return await withRetry(async () => {
      const { error } = await supabase.from('resources').delete().eq('id', id);
      if (error) {
        console.error('db.deleteResource:', error);
        throw error;
      }
    });
  } catch (e) {
    console.warn('db.deleteResource failed:', e);
    throw e;
  }
}
