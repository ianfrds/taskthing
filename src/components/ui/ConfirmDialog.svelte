<script lang="ts">
  import type { DialogVariant } from '$lib/types';

  interface Props {
    open: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: DialogVariant;
    onConfirm: () => void;
    onCancel: () => void;
  }

  let {
    open,
    title,
    message,
    confirmText = 'Hapus',
    cancelText = 'Batal',
    variant = 'danger',
    onConfirm,
    onCancel,
  }: Props = $props();

  function getIcon(v: DialogVariant) {
    if (v === 'danger') return 'fa-triangle-exclamation';
    if (v === 'warning') return 'fa-circle-exclamation';
    return 'fa-circle-info';
  }

  function getIconColor(v: DialogVariant) {
    if (v === 'danger') return 'text-[var(--red)] bg-[var(--red-soft)]';
    if (v === 'warning') return 'text-[var(--amber)] bg-[var(--amber-soft)]';
    return 'text-[var(--blue)] bg-[var(--blue-soft)]';
  }

  function getConfirmColor(v: DialogVariant) {
    if (v === 'danger') return 'bg-[var(--red)] hover:bg-[var(--red-deep)]';
    return 'bg-[var(--accent)] hover:bg-[var(--accent-deep)]';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onCancel();
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialog-title"
    tabindex="-1"
    onkeydown={handleKeydown}
    onclick={(e) => e.target === e.currentTarget && onCancel()}
  >
    <div class="bg-white rounded-2xl shadow-[var(--shadow-modal)] w-full max-w-sm p-6 flex flex-col items-center gap-4">
      <div class="w-12 h-12 rounded-full flex items-center justify-center text-xl {getIconColor(variant)}">
        <i class="fa-solid {getIcon(variant)}"></i>
      </div>
      <div class="text-center">
        <h2 id="dialog-title" class="text-[var(--ink)] font-semibold text-base mb-1">{title}</h2>
        <p class="text-[var(--ink-soft)] text-sm leading-relaxed">{message}</p>
      </div>
      <div class="flex gap-3 w-full mt-1">
        <button
          class="flex-1 px-4 py-2.5 rounded-xl border border-[var(--line)] text-[var(--ink-soft)] text-sm font-medium hover:bg-[var(--card-soft)] transition-colors"
          onclick={onCancel}
        >
          {cancelText}
        </button>
        <button
          class="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors {getConfirmColor(variant)}"
          onclick={onConfirm}
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
{/if}
