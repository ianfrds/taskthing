// =========================================================
// types/index.ts — Semua TypeScript interfaces & types
// =========================================================

export interface ActivityLog {
  id: string;
  user_id: string;
  project_id: string | null;
  action: string;
  meta: Record<string, unknown>;
  created_at: string;
  // joined
  project_name?: string;
  project_color?: string;
  username?: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  starred: boolean;
  is_archived: boolean;
  disable_categories: boolean;
  disable_priorities: boolean;
  created_at: string;
  isShared?: boolean;
  // Relational data (loaded client-side)
  todos: Task[];
  statuses: Status[];
  categories: Category[];
  priorities: Priority[];
  members: Member[];
  resources: Resource[];
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status_id: string | null;
  priority_id: string | null;
  category_id: string | null;
  tag_ids: string[];
  link: string;
  images: string[];
  due: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Status {
  id: string;
  project_id: string;
  name: string;
  color: string;
  sort_order: number;
}

export interface Category {
  id: string;
  project_id: string;
  name: string;
  color: string;
  sort_order: number;
}

export interface Priority {
  id: string;
  project_id: string;
  name: string;
  color: string;
  sort_order: number;
}

export interface Member {
  id: string;
  project_id: string;
  name: string;
  email: string;
  color: string;
}

export interface Resource {
  id: string;
  project_id: string;
  title: string;
  url: string;
}

export interface Username {
  id: string;
  user_id: string;
  username: string;
  email: string;
}

export interface Collaborator {
  id: string;
  project_id: string;
  user_id: string;
  email: string;
  permissions: string;
}

// UI Types
export type TaskView = 'kanban' | 'list' | 'table';
export type ProjectTab = 'tasks' | 'resources' | 'team' | 'settings';
export type ToastType = 'success' | 'error' | 'info';
export type DialogVariant = 'danger' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  onRetry?: () => void;
}

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant;
}

export interface ColorOption {
  name: string;
  hex: string;
}

export interface ProjectTabConfig {
  key: ProjectTab;
  label: string;
  icon: string;
}

export interface MasterConfigItem {
  label: string;
  sub: string;
  field: keyof Pick<Project, 'statuses' | 'categories' | 'priorities' | 'members'>;
  fkField: string;
  dbFkField: string;
  icon: string;
  minKeep: number;
  isArray?: boolean;
}

export type MasterType = 'status' | 'category' | 'priority' | 'member';

export interface CreateProjectPayload {
  name: string;
  description: string;
  color: string;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  status_id: string | null;
  priority_id: string | null;
  category_id: string | null;
  tag_ids: string[];
  link: string;
  images: string[];
  due: string | null;
}

export interface CreateResourcePayload {
  title: string;
  url: string;
}
