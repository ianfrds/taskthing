<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { projects, activeProjectId, modals, resetProjectState } from '$lib/stores/app.store';
  import { deleteProject } from '$lib/db/projects';
  import { toast } from '$lib/stores/toast.store';
  import ConfirmDialog from '$components/ui/ConfirmDialog.svelte';

  let confirmOpen = $state(false);
  let confirmProjectId = $state<string | null>(null);
  let confirmProjectName = $state('');
  let collapsed = $state(false);

  const currentProjectId = $derived($page.params.projectId ?? null);

  async function handleSelectProject(id: string) {
    resetProjectState();
    activeProjectId.set(id);
    await goto(`/${id}/tasks`);
  }

  function handleDeleteClick(e: MouseEvent, id: string, name: string) {
    e.stopPropagation();
    confirmProjectId = id;
    confirmProjectName = name;
    confirmOpen = true;
  }

  async function handleConfirmDelete() {
    if (!confirmProjectId) return;
    confirmOpen = false;
    try {
      await deleteProject(confirmProjectId);
      projects.update((list) => list.filter((p) => p.id !== confirmProjectId));
      toast.success('Proyek berhasil dihapus.');
      if (currentProjectId === confirmProjectId) {
        const remaining = $projects[0];
        if (remaining) await goto(`/${remaining.id}/tasks`);
        else await goto('/dashboard');
      }
    } catch {
      toast.error('Gagal menghapus proyek. Coba lagi.');
    } finally {
      confirmProjectId = null;
    }
  }

  function handleNewProject() {
    modals.update((m) => ({ ...m, project: true }));
  }

  const owned = $derived($projects.filter((p) => !p.isShared));
  const shared = $derived($projects.filter((p) => p.isShared));
</script>

<aside
  class="shrink-0 h-screen flex flex-col bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] transition-all duration-300 overflow-hidden
    {collapsed ? 'w-[60px]' : 'w-[240px]'}"
>
  <!-- Header: Logo + collapse toggle -->
  <div class="flex items-center h-14 border-b border-[var(--sidebar-border)] shrink-0 px-3 gap-2">
    <div class="w-8 h-8 rounded-xl bg-[var(--accent)] flex items-center justify-center shrink-0 shadow-[var(--shadow-accent)]">
      <i class="fa-solid fa-diagram-project text-white text-sm"></i>
    </div>
    {#if !collapsed}
      <span
        class="flex-1 font-bold text-[var(--ink)] text-sm tracking-tight truncate"
        style="font-family:'Space Grotesk',sans-serif;"
      >TaskThing</span>
    {/if}
    <button
      class="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--ink-faint)] hover:bg-[var(--card-soft)] hover:text-[var(--ink)] transition-colors shrink-0 {collapsed ? 'mx-auto' : ''}"
      onclick={() => (collapsed = !collapsed)}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      <i class="fa-solid {collapsed ? 'fa-chevron-right' : 'fa-chevron-left'} text-[10px]"></i>
    </button>
  </div>

  <!-- Scrollable body -->
  <div
    class="flex-1 overflow-y-auto overflow-x-hidden flex flex-col py-3 gap-1"
    style="scrollbar-width:thin; scrollbar-color: var(--line) transparent;"
  >
    <!-- New project button -->
    <div class="px-2">
      <button
        class="flex items-center gap-3 w-full rounded-xl text-sm font-semibold transition-colors
          bg-[var(--accent)] text-white hover:bg-[var(--accent-deep)] shadow-[var(--shadow-accent)]
          {collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'}"
        onclick={handleNewProject}
        title={collapsed ? 'Proyek baru' : undefined}
        aria-label="Proyek baru"
      >
        <i class="fa-solid fa-plus text-xs shrink-0"></i>
        {#if !collapsed}<span>Proyek baru</span>{/if}
      </button>
    </div>

    <!-- Dashboard -->
    <div class="px-2">
      <a
        href="/dashboard"
        class="flex items-center gap-3 rounded-xl text-sm font-medium transition-colors
          {collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'}
          {$page.url.pathname === '/dashboard'
            ? 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)]'
            : 'text-[var(--ink-soft)] hover:bg-[var(--card-soft)] hover:text-[var(--ink)]'}"
        title={collapsed ? 'Dashboard' : undefined}
      >
        <i class="fa-solid fa-house text-sm shrink-0"></i>
        {#if !collapsed}<span>Dashboard</span>{/if}
      </a>
    </div>

    <!-- Divider + section label -->
    <div class="mx-2 mt-2 mb-1">
      <div class="border-t border-[var(--line)]"></div>
      {#if !collapsed}
        <p class="mt-3 px-1 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-widest select-none">
          Proyek
        </p>
      {/if}
    </div>

    <!-- Project list -->
    <div class="px-2 flex flex-col gap-0.5">
      {#if owned.length === 0 && !collapsed}
        <div class="px-2 py-5 flex flex-col items-center gap-2 text-center">
          <i class="fa-regular fa-folder-open text-xl text-[var(--ink-faint)]"></i>
          <p class="text-xs text-[var(--ink-faint)] leading-relaxed">Belum ada proyek.<br/>Buat yang pertama.</p>
        </div>
      {/if}

      <ul class="flex flex-col gap-0.5" role="list">
        {#each owned as project (project.id)}
          {@const isActive = currentProjectId === project.id}
          <li>
            {#if collapsed}
              <!-- Collapsed: dot warna saja -->
              <button
                class="w-full flex justify-center items-center p-2.5 rounded-xl transition-colors
                  {isActive ? 'bg-[var(--sidebar-active-bg)]' : 'hover:bg-[var(--card-soft)]'}"
                onclick={() => handleSelectProject(project.id)}
                title={project.name}
                aria-label={project.name}
              >
                <span
                  class="w-3 h-3 rounded-full shrink-0 ring-2 ring-offset-1 ring-offset-white transition-all
                    {isActive ? 'ring-[var(--ink-soft)] scale-110' : 'ring-transparent'}"
                  style="background:{project.color};"
                ></span>
              </button>
            {:else}
              <!-- Expanded: project row -->
              <div
                class="group relative flex items-center rounded-xl transition-colors
                  {isActive ? 'bg-[var(--sidebar-active-bg)]' : 'hover:bg-[var(--card-soft)]'}"
              >
                {#if isActive}
                  <span class="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-[var(--sidebar-active-text)]"></span>
                {/if}

                <button
                  class="flex-1 flex items-center gap-3 pl-4 pr-1 py-2.5 cursor-pointer min-w-0 text-left"
                  onclick={() => handleSelectProject(project.id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:{project.color};"></span>
                  <span
                    class="flex-1 truncate text-sm font-medium
                      {isActive ? 'text-[var(--sidebar-active-text)]' : 'text-[var(--ink-soft)] group-hover:text-[var(--ink)]'}"
                  >{project.name}</span>
                </button>

                <button
                  class="w-6 h-6 mr-2 rounded-lg flex items-center justify-center transition-all shrink-0
                    opacity-0 group-hover:opacity-100
                    text-[var(--ink-faint)] hover:text-[var(--red)] hover:bg-[var(--red-soft)]"
                  onclick={(e) => handleDeleteClick(e, project.id, project.name)}
                  aria-label="Hapus proyek"
                >
                  <i class="fa-solid fa-trash text-[9px]"></i>
                </button>
              </div>
            {/if}
          </li>
        {/each}
      </ul>

      <!-- Shared projects -->
      {#if shared.length > 0}
        <div class="mt-3">
          {#if !collapsed}
            <p class="px-1 mb-2 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-widest select-none">
              Dibagikan
            </p>
          {/if}
          <ul class="flex flex-col gap-0.5" role="list">
            {#each shared as project (project.id)}
              {@const isActive = currentProjectId === project.id}
              <li>
                {#if collapsed}
                  <button
                    class="w-full flex justify-center items-center p-2.5 rounded-xl transition-colors
                      {isActive ? 'bg-[var(--sidebar-active-bg)]' : 'hover:bg-[var(--card-soft)]'}"
                    onclick={() => handleSelectProject(project.id)}
                    title={project.name}
                  >
                    <span
                      class="w-3 h-3 rounded-full shrink-0 ring-2 ring-offset-1 ring-offset-white
                        {isActive ? 'ring-[var(--ink-soft)]' : 'ring-transparent'}"
                      style="background:{project.color};"
                    ></span>
                  </button>
                {:else}
                  <div
                    class="group relative flex items-center rounded-xl transition-colors
                      {isActive ? 'bg-[var(--sidebar-active-bg)]' : 'hover:bg-[var(--card-soft)]'}"
                  >
                    {#if isActive}
                      <span class="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-[var(--sidebar-active-text)]"></span>
                    {/if}
                    <button
                      class="flex-1 flex items-center gap-3 pl-4 pr-1 py-2.5 cursor-pointer min-w-0 text-left"
                      onclick={() => handleSelectProject(project.id)}
                    >
                      <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:{project.color};"></span>
                      <span
                        class="flex-1 truncate text-sm font-medium
                          {isActive ? 'text-[var(--sidebar-active-text)]' : 'text-[var(--ink-soft)] group-hover:text-[var(--ink)]'}"
                      >{project.name}</span>
                    </button>
                  </div>
                {/if}
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  </div>
</aside>

<ConfirmDialog
  open={confirmOpen}
  title="Hapus proyek"
  message="Apakah kamu yakin ingin menghapus proyek '{confirmProjectName}'? Seluruh tugas dan tautan di dalamnya akan ikut terhapus."
  confirmText="Hapus"
  variant="danger"
  onConfirm={handleConfirmDelete}
  onCancel={() => { confirmOpen = false; }}
/>
