<script lang="ts">
  import type { ColorOption } from '$lib/types';
  import { COLORS } from '$lib/constants';

  interface Props {
    value: string;
    colors?: ColorOption[];
    onSelect: (hex: string) => void;
  }

  let { value, colors = COLORS, onSelect }: Props = $props();
</script>

<div class="flex flex-wrap gap-2 p-1" role="group" aria-label="Pilih warna">
  {#each colors as color}
    <button
      type="button"
      class="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--accent)]"
      style="background:{color.hex}; border-color:{value === color.hex ? color.hex : 'transparent'}; box-shadow:{value === color.hex ? '0 0 0 2px white, 0 0 0 4px ' + color.hex : 'none'};"
      aria-label="Warna {color.name}"
      aria-pressed={value === color.hex}
      onclick={() => onSelect(color.hex)}
    ></button>
  {/each}
</div>
