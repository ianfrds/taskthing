<script lang="ts">
  interface Props {
    value: string;
    onSelect: (hex: string) => void;
  }

  let { value, onSelect }: Props = $props();

  const PRESETS = ['#F2703A', '#4B7FC9', '#3FA66C', '#E56C9C', '#F0A93C', '#A06CD5'];

  function handleCustom(e: Event) {
    const t = e.target as HTMLInputElement;
    onSelect(t.value);
  }
</script>

<div class="flex items-center gap-3">
  <div class="flex flex-wrap gap-2">
    {#each PRESETS as hex}
      <button
        type="button"
        class="w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--accent)]"
        style="background:{hex}; border-color:{value === hex ? 'var(--ink)' : 'transparent'}; box-shadow:{value === hex ? '0 0 0 2px white' : 'none'};"
        aria-label="Warna {hex}"
        aria-pressed={value === hex}
        onclick={() => onSelect(hex)}
      ></button>
    {/each}
  </div>
  <label
    class="relative w-7 h-7 rounded-lg overflow-hidden cursor-pointer border-2 border-[var(--line)] hover:border-[var(--ink-soft)] transition-colors shrink-0"
    aria-label="Pilih warna kustom"
    style="background:{value}"
  >
    <input
      type="color"
      class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
      value={value}
      oninput={handleCustom}
    />
  </label>
</div>
