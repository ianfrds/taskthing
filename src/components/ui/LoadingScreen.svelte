<script lang="ts">
  interface Props {
    message?: string;
  }

  let { message = 'Memuat...' }: Props = $props();
</script>

<div class="fixed inset-0 z-[150] bg-[var(--bg)] flex flex-col items-center justify-center gap-4">
  <div class="w-10 h-10 border-3 border-[var(--line)] border-t-[var(--accent)] rounded-full animate-spin"></div>
  <p class="text-[var(--ink-soft)] text-sm font-medium">{message}</p>
</div>
