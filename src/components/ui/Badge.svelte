<script lang="ts">
  interface Props {
    color: string;
    label: string;
    dot?: boolean;
  }

  let { color, label, dot = false }: Props = $props();
</script>

<span
  class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
  style="background:{color}22; color:{color};"
>
  {#if dot}
    <span class="w-1.5 h-1.5 rounded-full shrink-0" style="background:{color};"></span>
  {/if}
  {label}
</span>
