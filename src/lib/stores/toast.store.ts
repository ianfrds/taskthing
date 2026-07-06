// =========================================================
// lib/stores/toast.store.ts — Toast notification state
// =========================================================

import { writable } from 'svelte/store';
import type { ToastItem, ToastType } from '$lib/types';

function createToastStore() {
  const { subscribe, update } = writable<ToastItem[]>([]);

  function show(message: string, type: ToastType = 'success', onRetry?: () => void) {
    const id = crypto.randomUUID();
    update((toasts) => [...toasts, { id, message, type, onRetry }]);
    const duration = type === 'error' ? 6000 : 2600;
    setTimeout(() => dismiss(id), duration);
  }

  function dismiss(id: string) {
    update((toasts) => toasts.filter((t) => t.id !== id));
  }

  return {
    subscribe,
    success: (message: string) => show(message, 'success'),
    error: (message: string, onRetry?: () => void) => show(message, 'error', onRetry),
    info: (message: string) => show(message, 'info'),
    dismiss,
  };
}

export const toast = createToastStore();
