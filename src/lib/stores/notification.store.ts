// =========================================================
// lib/stores/notification.store.ts — In-app notifications
// =========================================================

import { writable, derived, get } from 'svelte/store';
import type { AppNotification, Project } from '$lib/types';
import { supabase } from '$lib/supabase';
import { projects } from './app.store';

const STORAGE_KEY = 'orbit_notifications';

function loadPersisted(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function persist(items: AppNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch { /* ignore */ }
}

function isWithin24h(dateStr: string): boolean {
  const due = new Date(dateStr);
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  return diff > 0 && diff <= 24 * 60 * 60 * 1000;
}

function getUserMemberIds(allProjects: Project[], email: string | null): Set<string> {
  const ids = new Set<string>();
  if (!email) return ids;
  for (const p of allProjects) {
    for (const m of p.members) {
      if (m.email === email) {
        ids.add(m.id);
      }
    }
  }
  return ids;
}

function createNotificationStore() {
  const { subscribe, update } = writable<AppNotification[]>(loadPersisted());

  let currentUserId: string | null = null;
  let currentUserEmail: string | null = null;
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let unsubProjects: (() => void) | null = null;

  supabase.auth.getUser().then(({ data }) => {
    currentUserId = data.user?.id ?? null;
    currentUserEmail = data.user?.email ?? null;
  });

  function scanDueSoon() {
    const allProjects = get(projects);
    const existing = get({ subscribe });
    const userMemberIds = getUserMemberIds(allProjects, currentUserEmail);
    const newNotifs: AppNotification[] = [];

    for (const project of allProjects) {
      for (const task of project.todos) {
        if (task.due && isWithin24h(task.due)) {
          const isCreator = task.created_by === currentUserId;
          const isTagged = task.tag_ids.some((tid) => userMemberIds.has(tid));
          if (isCreator || isTagged) {
            const key = `due_soon_${task.id}`;
            if (!existing.find((n) => n.id === key)) {
              newNotifs.push({
                id: key,
                type: 'due_soon',
                title: 'Tugas hampir jatuh tempo',
                message: `"${task.title}" — ${project.name}`,
                projectId: project.id,
                projectName: project.name,
                taskId: task.id,
                isRead: false,
                createdAt: new Date().toISOString(),
              });
            }
          }
        }
      }
    }

    if (newNotifs.length > 0) {
      update((items) => {
        const updated = [...newNotifs, ...items];
        persist(updated);
        return updated;
      });
    }
  }

  return {
    subscribe,

    init() {
      // Subscribe to projects store — scan on every data change
      unsubProjects?.();
      unsubProjects = projects.subscribe(() => scanDueSoon());
    },

    addTagged(taskTitle: string, projectId: string, projectName: string, taskId: string) {
      const id = `tagged_${taskId}_${Date.now()}`;
      update((existing) => {
        const notif: AppNotification = {
          id,
          type: 'tagged',
          title: 'Kamu di-tag dalam tugas',
          message: `"${taskTitle}" — ${projectName}`,
          projectId,
          projectName,
          taskId,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        const updated = [notif, ...existing];
        persist(updated);
        return updated;
      });
    },

    markAsRead(id: string) {
      update((items) => {
        const updated = items.map((n) => (n.id === id ? { ...n, isRead: true } : n));
        persist(updated);
        return updated;
      });
    },

    markAllAsRead() {
      update((items) => {
        const updated = items.map((n) => ({ ...n, isRead: true }));
        persist(updated);
        return updated;
      });
    },

    startPolling() {
      if (pollTimer) return;
      pollTimer = setInterval(scanDueSoon, 60000);
    },

    stopPolling() {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
      unsubProjects?.();
      unsubProjects = null;
    },
  };
}

export const notifications = createNotificationStore();

export const unreadCount = derived(
  notifications,
  ($n) => $n.filter((n) => !n.isRead).length
);
