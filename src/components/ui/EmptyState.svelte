<script lang="ts">
  interface Props {
    icon: string;
    title: string;
    description: string;
    ctaLabel?: string;
    onCta?: () => void;
  }

  let { icon, title, description, ctaLabel, onCta }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center gap-4 py-16 px-8 text-center">
  <!-- Icon container -->
  <div class="relative">
    <div class="w-20 h-20 rounded-3xl bg-[var(--card-soft)] border border-[var(--line)] flex items-center justify-center shadow-sm">
      <i class="fa-solid fa-{icon} text-3xl text-[var(--ink-faint)]"></i>
    </div>
    <!-- Decorative dots -->
    <span class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[var(--line)] border-2 border-white"></span>
    <span class="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-[var(--line)] border-2 border-white"></span>
  </div>

  <!-- Text -->
  <div class="flex flex-col gap-1.5 max-w-xs">
    <h3 class="text-base font-bold text-[var(--ink)]">{title}</h3>
    <p class="text-sm text-[var(--ink-soft)] leading-relaxed">{description}</p>
  </div>

  <!-- CTA -->
  {#if ctaLabel && onCta}
    <button
      class="mt-1 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-deep)] transition-colors shadow-[var(--shadow-accent)]"
      onclick={onCta}
    >
      <i class="fa-solid fa-plus text-xs"></i>
      {ctaLabel}
    </button>
  {/if}
</div>
