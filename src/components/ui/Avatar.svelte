<script lang="ts">
  import { initials } from '$lib/utils';

  interface Props {
    name: string;
    color: string;
    size?: 'sm' | 'md' | 'lg';
  }

  let { name, color, size = 'md' }: Props = $props();

  const sizeClass = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  };
</script>

<span
  class="inline-flex items-center justify-center rounded-full font-bold text-white shrink-0 {sizeClass[size]}"
  style="background:{color};"
  aria-label={name}
  title={name}
>
  {initials(name)}
</span>
