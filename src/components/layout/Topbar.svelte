<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { projects, activeProject } from '$lib/stores/app.store';
  import { supabase } from '$lib/supabase';
  import { notifications, unreadCount } from '$lib/stores/notification.store';

  interface Props {
    onProfile?: () => void;
  }

  let { onProfile }: Props = $props();

  let search = $state('');
  let userEmail = $state('');
  let displayName = $state('');
  let dropdownOpen = $state(false);
  let notifOpen = $state(false);
  let searchFocused = $state(false);

  $effect(() => {
    supabase.auth.getUser().then(({ data }) => {
      userEmail = data.user?.email ?? '';
      displayName = data.user?.user_metadata?.display_name ?? userEmail.split('@')[0];
    });
  });

  function handleOutsideClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-user-menu]')) {
      dropdownOpen = false;
    }
    if (!target.closest('[data-search]')) {
      searchFocused = false;
    }
    if (!target.closest('[data-notif]')) {
      notifOpen = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      searchFocused = false;
      (e.target as HTMLInputElement).blur();
    }
  }

  const allProjects = $derived($projects);

  const searchResults = $derived.by(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase().trim();
    const results: Array<{
      type: 'project' | 'task' | 'member';
      title: string;
      subtitle: string;
      projectId: string;
    }> = [];

    for (const project of allProjects) {
      if (project.name.toLowerCase().includes(q)) {
        results.push({
          type: 'project',
          title: project.name,
          subtitle: project.description || `${project.todos.length} tugas`,
          projectId: project.id,
        });
      }
      for (const task of project.todos) {
        if (task.title.toLowerCase().includes(q)) {
          results.push({
            type: 'task',
            title: task.title,
            subtitle: project.name,
            projectId: project.id,
          });
        }
      }
      for (const member of project.members) {
        if (member.email.toLowerCase().includes(q) || member.name.toLowerCase().includes(q)) {
          results.push({
            type: 'member',
            title: member.email,
            subtitle: member.name,
            projectId: project.id,
          });
        }
      }
    }

    return results.slice(0, 15);
  });

  function selectResult(result: (typeof searchResults)[number]) {
    searchFocused = false;
    search = '';
    if (result.type === 'project') {
      goto(`/${result.projectId}/tasks`);
    } else {
      goto(`/${result.projectId}/tasks`);
    }
  }

  function handleSearchInput(e: Event) {
    search = (e.target as HTMLInputElement).value;
    searchFocused = true;
  }

  function handleSearchFocus() {
    if (search.trim()) searchFocused = true;
  }

  const currentProjectId = $derived($page.params.projectId ?? null);
  const pageTitle = $derived(
    currentProjectId && $activeProject ? $activeProject.name : 'Dashboard'
  );

  async function handleSignOut() {
    dropdownOpen = false;
    await supabase.auth.signOut();
    await goto('/login');
  }

  function handleProfileClick() {
    dropdownOpen = false;
    onProfile?.();
  }
</script>

<svelte:window onclick={handleOutsideClick} onkeydown={handleKeydown} />

<header class="h-14 shrink-0 flex items-center gap-4 px-6 bg-[var(--shell)] border-b border-[var(--line)] sticky top-0 z-10">
  <!-- Page title -->
  <h1 class="text-sm font-semibold text-[var(--ink)] truncate max-w-[200px]">{pageTitle}</h1>

  <div class="flex-1"></div>

  <!-- Search -->
  <div class="relative" data-search>
    <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-faint)] text-xs pointer-events-none"></i>
    <input
      type="search"
      class="w-52 pl-8 pr-3 py-1.5 text-sm bg-[var(--card-soft)] border border-[var(--line)] rounded-lg text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
      placeholder="Cari project, task, atau anggota..."
      value={search}
      oninput={handleSearchInput}
      onfocus={handleSearchFocus}
      aria-label="Cari"
    />

    {#if searchFocused && search.trim()}
      <div class="absolute right-0 top-full mt-1.5 w-80 bg-white rounded-xl border border-[var(--line)] shadow-[var(--shadow-modal)] z-50 overflow-hidden">
        {#if searchResults.length === 0}
          <p class="text-sm text-[var(--ink-faint)] text-center py-6 px-4">Tidak ditemukan hasil untuk "<span class="text-[var(--ink)]">{search}</span>"</p>
        {:else}
          <div class="py-1 max-h-80 overflow-y-auto">
            {#each searchResults as result}
              <button
                class="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-[var(--card-soft)] transition-colors text-left"
                onclick={() => selectResult(result)}
              >
                <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 {result.type === 'project' ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : result.type === 'task' ? 'bg-[var(--blue-soft)] text-[var(--blue)]' : 'bg-[var(--green-soft)] text-[var(--green)]'}">
                  <i class="fa-solid {result.type === 'project' ? 'fa-folder' : result.type === 'task' ? 'fa-list-check' : 'fa-user'} text-[10px]"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-[var(--ink)] truncate">{result.title}</span>
                    <span class="text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 {result.type === 'project' ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : result.type === 'task' ? 'bg-[var(--blue-soft)] text-[var(--blue)]' : 'bg-[var(--green-soft)] text-[var(--green)]'}">{result.type === 'project' ? 'Proyek' : result.type === 'task' ? 'Task' : 'Anggota Tim'}</span>
                  </div>
                  <p class="text-xs text-[var(--ink-faint)] mt-0.5 truncate">{result.subtitle}</p>
                </div>
              </button>
            {/each}
          </div>
          {#if searchResults.length === 15}
            <div class="border-t border-[var(--line)] px-3.5 py-2">
              <p class="text-[11px] text-[var(--ink-faint)] text-center">Tampilkan maksimal 15 hasil</p>
            </div>
          {/if}
        {/if}
      </div>
    {/if}
  </div>

  <!-- Notifications -->
  <div class="relative" data-notif>
    <button
      class="relative w-7 h-7 rounded-lg flex items-center justify-center text-[var(--ink-faint)] hover:bg-[var(--card-soft)] hover:text-[var(--ink)] transition-colors"
      onclick={() => { notifOpen = !notifOpen; dropdownOpen = false; }}
      aria-label="Notifikasi"
    >
      <i class="fa-regular fa-bell text-sm"></i>
      {#if $unreadCount > 0}
        <span class="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[var(--red)] text-white text-[9px] font-bold flex items-center justify-center">{Math.min($unreadCount, 9)}</span>
      {/if}
    </button>

    {#if notifOpen}
      <div class="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-[var(--line)] shadow-[var(--shadow-modal)] z-50 overflow-hidden">
        <div class="px-4 py-3 border-b border-[var(--line)] flex items-center justify-between">
          <p class="text-sm font-semibold text-[var(--ink)]">Notifikasi</p>
          {#if $unreadCount > 0}
            <button
              class="text-[11px] font-medium text-[var(--accent)] hover:text-[var(--accent-deep)] transition-colors"
              onclick={() => notifications.markAllAsRead()}
            >Tandai semua dibaca</button>
          {/if}
        </div>

        {#if $notifications.length === 0}
          <p class="text-sm text-[var(--ink-faint)] text-center py-8 px-4">Belum ada notifikasi</p>
        {:else}
          <div class="max-h-[360px] overflow-y-auto py-1">
            {#each $notifications as notif}
              <button
                class="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-[var(--card-soft)] transition-colors text-left"
                onclick={() => {
                  notifications.markAsRead(notif.id);
                  notifOpen = false;
                  goto(`/${notif.projectId}/tasks`);
                }}
              >
                <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 {notif.type === 'due_soon' ? 'bg-[var(--orange-soft)] text-[var(--orange)]' : 'bg-[var(--blue-soft)] text-[var(--blue)]'}">
                  <i class="fa-solid {notif.type === 'due_soon' ? 'fa-clock' : 'fa-tag'} text-[10px]"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-medium text-[var(--ink)] truncate">{notif.title}</p>
                    {#if !notif.isRead}
                      <span class="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0"></span>
                    {/if}
                  </div>
                  <p class="text-xs text-[var(--ink-faint)] mt-0.5 line-clamp-2">{notif.message}</p>
                </div>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
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
