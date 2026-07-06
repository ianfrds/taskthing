<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { searchQuery, activeProject } from '$lib/stores/app.store';
  import { supabase } from '$lib/supabase';

  interface Props {
    onProfile?: () => void;
  }

  let { onProfile }: Props = $props();

  let search = $state('');
  let userEmail = $state('');
  let displayName = $state('');
  let dropdownOpen = $state(false);

  $effect(() => {
    supabase.auth.getUser().then(({ data }) => {
      userEmail = data.user?.email ?? '';
      displayName = data.user?.user_metadata?.display_name ?? userEmail.split('@')[0];
    });
  });

  function handleSearch(e: Event) {
    search = (e.target as HTMLInputElement).value;
    searchQuery.set(search.toLowerCase().trim());
  }

  async function handleSignOut() {
    dropdownOpen = false;
    await supabase.auth.signOut();
    await goto('/login');
  }

  function handleProfileClick() {
    dropdownOpen = false;
    onProfile?.();
  }

  function handleOutsideClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-user-menu]')) {
      dropdownOpen = false;
    }
  }

  const currentProjectId = $derived($page.params.projectId ?? null);
  const pageTitle = $derived(
    currentProjectId && $activeProject ? $activeProject.name : 'Dashboard'
  );
</script>

<svelte:window onclick={handleOutsideClick} />

<header class="h-14 shrink-0 flex items-center gap-4 px-6 bg-[var(--shell)] border-b border-[var(--line)] sticky top-0 z-10">
  <!-- Page title -->
  <h1 class="text-sm font-semibold text-[var(--ink)] truncate max-w-[200px]">{pageTitle}</h1>

  <div class="flex-1"></div>

  <!-- Search -->
  <div class="relative">
    <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-faint)] text-xs pointer-events-none"></i>
    <input
      type="search"
      class="w-52 pl-8 pr-3 py-1.5 text-sm bg-[var(--card-soft)] border border-[var(--line)] rounded-lg text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
      placeholder="Cari tugas atau tautan..."
      value={search}
      oninput={handleSearch}
      aria-label="Cari"
    />
  </div>

  <!-- User menu with dropdown -->
  <div class="relative" data-user-menu>
    <button
      class="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[var(--card-soft)] transition-colors"
      onclick={() => (dropdownOpen = !dropdownOpen)}
      aria-label="Menu pengguna"
      aria-expanded={dropdownOpen}
      aria-haspopup="true"
    >
      <div class="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs font-bold shrink-0">
        {displayName.slice(0, 2).toUpperCase()}
      </div>
      <span class="text-sm text-[var(--ink-soft)] max-w-[120px] truncate hidden sm:block">{displayName}</span>
      <i class="fa-solid fa-chevron-down text-[9px] text-[var(--ink-faint)] transition-transform duration-200 hidden sm:block {dropdownOpen ? 'rotate-180' : ''}"></i>
    </button>

    <!-- Dropdown -->
    {#if dropdownOpen}
      <div
        class="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-[var(--line)] shadow-[var(--shadow-modal)] z-50 overflow-hidden py-1"
        role="menu"
      >
        <!-- User info -->
        <div class="px-4 py-3 border-b border-[var(--line)]">
          <p class="text-sm font-semibold text-[var(--ink)] truncate">{displayName}</p>
          <p class="text-xs text-[var(--ink-faint)] truncate mt-0.5">{userEmail}</p>
        </div>

        <!-- Menu items -->
        <div class="py-1">
          <button
            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--ink-soft)] hover:bg-[var(--card-soft)] hover:text-[var(--ink)] transition-colors text-left"
            onclick={handleProfileClick}
            role="menuitem"
          >
            <i class="fa-solid fa-user-gear w-4 text-center text-[var(--ink-faint)]"></i>
            Pengaturan profil
          </button>
          <button
            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--red)] hover:bg-[var(--red-soft)] transition-colors text-left"
            onclick={handleSignOut}
            role="menuitem"
          >
            <i class="fa-solid fa-arrow-right-from-bracket w-4 text-center"></i>
            Keluar
          </button>
        </div>
      </div>
    {/if}
  </div>
</header>
