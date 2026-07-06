// =========================================================
// lib/stores/app.store.ts — Global application state
// =========================================================

import { writable, derived } from 'svelte/store';
import type { Project, TaskView, ProjectTab } from '$lib/types';

// Active project ID
export const activeProjectId = writable<string | null>(null);

// All projects (owned + shared)
export const projects = writable<Project[]>([]);

// Current task view mode
export const taskView = writable<TaskView>('kanban');

// Active project tab
export const activeTab = writable<ProjectTab>('tasks');

// Task filter (status id or 'all')
export const todoFilter = writable<string>('all');

// Search query
export const searchQuery = writable<string>('');

// Loading state
export const isLoading = writable<boolean>(true);

// Editing IDs for modals
export const editingTaskId = writable<string | null>(null);
export const editingResourceId = writable<string | null>(null);
export const viewingTaskId = writable<string | null>(null);

// Modal visibility states
export const modals = writable({
  project: false,
  task: false,
  taskDetail: false,
  resource: false,
  master: false,
  profile: false,
});

export type ModalKey = 'project' | 'task' | 'taskDetail' | 'resource' | 'master' | 'profile';

// Active master type for MasterModal
export const activeMasterType = writable<string>('status');
export const editingMasterId = writable<string | null>(null);

// Derived: active project object
export const activeProject = derived(
  [projects, activeProjectId],
  ([$projects, $activeProjectId]) =>
    $projects.find((p) => p.id === $activeProjectId) ?? null
);

// Helper: open a modal
export function openModal(name: ModalKey) {
  modals.update((m) => ({ ...m, [name]: true }));
}

export function closeModal(name: ModalKey) {
  modals.update((m) => ({ ...m, [name]: false }));
}

// Helper: reset per-project UI state when switching projects
export function resetProjectState() {
  taskView.set('kanban');
  activeTab.set('tasks');
  todoFilter.set('all');
  searchQuery.set('');
}
