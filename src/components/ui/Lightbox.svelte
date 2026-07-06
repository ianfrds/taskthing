<script lang="ts">
  interface Props {
    src: string;
    onClose: () => void;
  }

  let { src, onClose }: Props = $props();

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  class="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
  role="dialog"
  aria-modal="true"
  aria-label="Pratinjau gambar"
  onclick={(e) => e.target === e.currentTarget && onClose()}
>
  <button
    class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
    onclick={onClose}
    aria-label="Tutup pratinjau"
  >
    <i class="fa-solid fa-xmark"></i>
  </button>
  <img
    src={src}
    alt="Pratinjau gambar"
    class="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl"
  />
</div>
