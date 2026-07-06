// =========================================================
// lib/constants.ts — App-wide constants
// =========================================================

import type { ColorOption, ProjectTabConfig, MasterConfigItem, MasterType } from '$lib/types';

export const COLORS: ColorOption[] = [
  { name: 'orange', hex: '#F2703A' },
  { name: 'blue', hex: '#4B7FC9' },
  { name: 'green', hex: '#3FA66C' },
  { name: 'pink', hex: '#E56C9C' },
  { name: 'amber', hex: '#F0A93C' },
  { name: 'red', hex: '#D2504B' },
  { name: 'teal', hex: '#2AA59A' },
  { name: 'purple', hex: '#A06CD5' },
  { name: 'lime', hex: '#7CBF4A' },
  { name: 'indigo', hex: '#5C6BC0' },
  { name: 'rose', hex: '#E85372' },
  { name: 'cyan', hex: '#22B8D4' },
];

export const PROJECT_ICONS: string[] = [
  'fa-diagram-project',
  'fa-rocket',
  'fa-palette',
  'fa-bullhorn',
  'fa-code',
  'fa-chart-line',
];

export const PROJECT_TABS: ProjectTabConfig[] = [
  { key: 'tasks', label: 'Tasks', icon: 'fa-list-check' },
  { key: 'resources', label: 'Resources', icon: 'fa-book-bookmark' },
  { key: 'team', label: 'Team', icon: 'fa-users' },
  { key: 'settings', label: 'Master data', icon: 'fa-sliders' },
];

export const SETTINGS_TYPES: MasterType[] = ['status', 'category', 'priority'];

export const MASTER_CONFIG: Record<MasterType, MasterConfigItem> = {
  status: {
    label: 'Status kanban',
    sub: 'Kolom kanban dan grup pada tampilan list mengikuti urutan status di sini.',
    field: 'statuses',
    fkField: 'status_id',
    dbFkField: 'status_id',
    icon: 'fa-table-columns',
    minKeep: 1,
  },
  category: {
    label: 'Kategori tugas',
    sub: 'Digunakan untuk menandai jenis pekerjaan pada setiap tugas.',
    field: 'categories',
    fkField: 'category_id',
    dbFkField: 'category_id',
    icon: 'fa-tag',
    minKeep: 0,
  },
  priority: {
    label: 'Prioritas',
    sub: 'Level urgensi yang bisa dipasang ke tugas.',
    field: 'priorities',
    fkField: 'priority_id',
    dbFkField: 'priority_id',
    icon: 'fa-flag',
    minKeep: 1,
  },
  member: {
    label: 'Anggota tim',
    sub: 'Anggota yang bisa ditandai (tag) pada tugas di proyek ini.',
    field: 'members',
    fkField: 'tag_ids',
    dbFkField: 'tag_ids',
    icon: 'fa-users',
    minKeep: 0,
    isArray: true,
  },
};

export const DEFAULT_STATUSES = [
  { name: 'Backlog', color: '#A8A6BC', sort_order: 0 },
  { name: 'To Do', color: '#3B7FD4', sort_order: 1 },
  { name: 'In Progress', color: '#F0A020', sort_order: 2 },
  { name: 'Review', color: '#D05C8E', sort_order: 3 },
  { name: 'Done', color: '#2EA878', sort_order: 4 },
];

export const DEFAULT_CATEGORIES = [
  { name: 'Umum', color: '#3B7FD4', sort_order: 0 },
  { name: 'Desain', color: '#D05C8E', sort_order: 1 },
  { name: 'Development', color: '#EA4E2C', sort_order: 2 },
  { name: 'Marketing', color: '#F0A020', sort_order: 3 },
  { name: 'Konten', color: '#2EA878', sort_order: 4 },
];

export const DEFAULT_PRIORITIES = [
  { name: 'Rendah', color: '#2EA878', sort_order: 0 },
  { name: 'Sedang', color: '#F0A020', sort_order: 1 },
  { name: 'Tinggi', color: '#EA4E2C', sort_order: 2 },
  { name: 'Kritis', color: '#D94040', sort_order: 3 },
];
