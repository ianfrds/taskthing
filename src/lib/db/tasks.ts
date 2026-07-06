// =========================================================
// lib/db/tasks.ts — Tasks CRUD
// =========================================================

import { supabase } from '$lib/supabase';
import { withRetry } from '$lib/utils';
import type { Task, CreateTaskPayload } from '$lib/types';

export async function createTask(projectId: string, payload: CreateTaskPayload): Promise<Task> {
  try {
    return await withRetry(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...payload, project_id: projectId, created_by: user?.id })
        .select()
        .single();
      if (error) {
        console.error('db.createTask:', error);
        throw error;
      }
      return data as Task;
    });
  } catch (e) {
    console.warn('db.createTask failed:', e);
    throw e;
  }
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  try {
    return await withRetry(async () => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) {
        console.error('db.updateTask:', error);
        throw error;
      }
      return data as Task;
    });
  } catch (e) {
    console.warn('db.updateTask failed:', e);
    throw e;
  }
}

export async function deleteTask(id: string): Promise<void> {
  try {
    return await withRetry(async () => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) {
        console.error('db.deleteTask:', error);
        throw error;
      }
    });
  } catch (e) {
    console.warn('db.deleteTask failed:', e);
    throw e;
  }
}
