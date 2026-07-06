<script lang="ts">
  import { toast } from '$lib/stores/toast.store';
  import type { ToastItem } from '$lib/types';

  let toastList: ToastItem[] = [];
  const unsubscribe = toast.subscribe((items) => {
    toastList = items;
  });

  function getIcon(type: string) {
    if (type === 'error') return 'fa-circle-xmark';
    if (type === 'info') return 'fa-circle-info';
    return 'fa-circle-check';
  }

  function getBg(type: string) {
    if (type === 'error') return 'bg-[#B4453F]';
    if (type === 'info') return 'bg-[#3B7FD4]';
    return 'bg-[#171614]';
  }
</script>

<div class="fixed bottom-5 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center pointer-events-none">
  {#each toastList as item (item.id)}
    <div
      class="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-xl text-white text-[13px] font-semibold shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 {getBg(item.type)}"
      role="alert"
      aria-live="polite"
    >
      <i class="fa-solid {getIcon(item.type)} text-sm"></i>
      <span>{item.message}</span>
      {#if item.onRetry}
        <button
          class="ml-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1 rounded-lg transition-colors"
          onclick={() => { toast.dismiss(item.id); item.onRetry?.(); }}
        >
          Coba lagi
        </button>
      {/if}
      <button
        class="ml-1 text-white/60 hover:text-white transition-colors"
        onclick={() => toast.dismiss(item.id)}
        aria-label="Tutup notifikasi"
      >
        <i class="fa-solid fa-xmark text-xs"></i>
      </button>
    </div>
  {/each}
</div>
