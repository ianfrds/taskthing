// =========================================================
// lib/db/projects.ts — Projects CRUD
// =========================================================

import { supabase } from '$lib/supabase';
import { withRetry } from '$lib/utils';
import { PROJECT_ICONS, DEFAULT_STATUSES, DEFAULT_CATEGORIES, DEFAULT_PRIORITIES } from '$lib/constants';
import type { Project, CreateProjectPayload } from '$lib/types';

export async function fetchProjects(): Promise<Project[]> {
  try {
    return await withRetry(async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) {
        console.error('db.fetchProjects:', error);
        throw error;
      }
      return (data ?? []) as Project[];
    });
  } catch (e) {
    console.warn('db.fetchProjects failed:', e);
    throw e;
  }
}

export async function createProject(payload: CreateProjectPayload): Promise<Project> {
  try {
    return await withRetry(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User tidak terautentikasi');

      const icon = PROJECT_ICONS[Math.floor(Math.random() * PROJECT_ICONS.length)];
      const { data: project, error } = await supabase
        .from('projects')
        .insert({ ...payload, icon, user_id: user.id })
        .select()
        .single();
      if (error) {
        console.error('db.createProject:', error);
        throw error;
      }

      // Buat default statuses, categories, priorities
      await Promise.all([
        supabase.from('statuses').insert(
          DEFAULT_STATUSES.map((s) => ({ ...s, project_id: project.id }))
        ),
        supabase.from('categories').insert(
          DEFAULT_CATEGORIES.map((c) => ({ ...c, project_id: project.id }))
        ),
        supabase.from('priorities').insert(
          DEFAULT_PRIORITIES.map((p) => ({ ...p, project_id: project.id }))
        ),
      ]);

      return project as Project;
    });
  } catch (e) {
    console.warn('db.createProject failed:', e);
    throw e;
  }
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  try {
    return await withRetry(async () => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) {
        console.error('db.updateProject:', error);
        throw error;
      }
      return data as Project;
    });
  } catch (e) {
    console.warn('db.updateProject failed:', e);
    throw e;
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    return await withRetry(async () => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) {
        console.error('db.deleteProject:', error);
        throw error;
      }
    });
  } catch (e) {
    console.warn('db.deleteProject failed:', e);
    throw e;
  }
}

export async function fetchProjectData(projectId: string) {
  try {
    return await withRetry(async () => {
      const [tasks, statuses, categories, priorities, members, resources] = await Promise.all([
        supabase.from('tasks').select('*').eq('project_id', projectId).order('created_at', { ascending: true }),
        supabase.from('statuses').select('*').eq('project_id', projectId).order('sort_order'),
        supabase.from('categories').select('*').eq('project_id', projectId).order('sort_order'),
        supabase.from('priorities').select('*').eq('project_id', projectId).order('sort_order'),
        supabase.from('members').select('*').eq('project_id', projectId),
        supabase.from('resources').select('*').eq('project_id', projectId),
      ]);

      for (const result of [tasks, statuses, categories, priorities, members, resources]) {
        if (result.error) {
          console.error('db.fetchProjectData:', result.error);
          throw result.error;
        }
      }

      return {
        todos: (tasks.data ?? []) as import('$lib/types').Task[],
        statuses: (statuses.data ?? []) as import('$lib/types').Status[],
        categories: (categories.data ?? []) as import('$lib/types').Category[],
        priorities: (priorities.data ?? []) as import('$lib/types').Priority[],
        members: (members.data ?? []) as import('$lib/types').Member[],
        resources: (resources.data ?? []) as import('$lib/types').Resource[],
      };
    });
  } catch (e) {
    console.warn('db.fetchProjectData failed:', e);
    throw e;
  }
}
