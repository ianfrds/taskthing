<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { projects, activeProjectId, modals, resetProjectState } from '$lib/stores/app.store';
  import { deleteProject, archiveProject } from '$lib/db/projects';
  import { logActivity } from '$lib/supabase';
  import { toast } from '$lib/stores/toast.store';
  import ConfirmDialog from '$components/ui/ConfirmDialog.svelte';
  import type { Project } from '$lib/types';

  interface Props {
    onEditProject?: (project: Project) => void;
  }

  let { onEditProject }: Props = $props();

  let confirmOpen = $state(false);
  let confirmProjectId = $state<string | null>(null);
  let confirmProjectName = $state('');
  let confirmType = $state<'delete' | 'archive'>('delete');
  let collapsed = $state(false);

  const currentProjectId = $derived($page.params.projectId ?? null);

  async function handleSelectProject(id: string) {
    resetProjectState();
    activeProjectId.set(id);
    await goto(`/${id}/tasks`);
  }

  function handleDeleteClick(e: MouseEvent, id: string, name: string) {
    e.stopPropagation();
    confirmType = 'delete';
    confirmProjectId = id;
    confirmProjectName = name;
    confirmOpen = true;
  }

  function handleArchiveClick(e: MouseEvent, id: string, name: string) {
    e.stopPropagation();
    confirmType = 'archive';
    confirmProjectId = id;
    confirmProjectName = name;
    confirmOpen = true;
  }

  async function handleConfirmDelete() {
    if (!confirmProjectId) return;
    confirmOpen = false;
    try {
      if (confirmType === 'archive') {
        await archiveProject(confirmProjectId);
        await logActivity('project_archived', confirmProjectId, { project_name: confirmProjectName });
        projects.update((list) => list.filter((p) => p.id !== confirmProjectId));
        toast.success(`Proyek "${confirmProjectName}" diarsipkan.`);
        if (currentProjectId === confirmProjectId) await goto('/dashboard');
      } else {
        await deleteProject(confirmProjectId);
        await logActivity('project_deleted', confirmProjectId, { project_name: confirmProjectName });
        projects.update((list) => list.filter((p) => p.id !== confirmProjectId));
        toast.success('Proyek berhasil dihapus.');
        if (currentProjectId === confirmProjectId) {
          const remaining = $projects[0];
          if (remaining) await goto(`/${remaining.id}/tasks`);
          else await goto('/dashboard');
        }
      }
    } catch {
      toast.error('Terjadi kesalahan. Coba lagi.');
    } finally {
      confirmProjectId = null;
    }
  }

  function handleNewProject() {
    modals.update((m) => ({ ...m, project: true }));
  }

  function handleEditClick(e: MouseEvent, project: Project) {
    e.stopPropagation();
    onEditProject?.(project);
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
    {#if !collapsed}
      <div class="w-8 h-8 rounded-xl bg-[var(--accent)] flex items-center justify-center shrink-0 shadow-[var(--shadow-accent)]">
        <i class="fa-solid fa-diagram-project text-white text-sm"></i>
      </div>
      <span
        class="flex-1 font-bold text-[var(--ink)] text-sm tracking-tight truncate"
        style="font-family:'Space Grotesk',sans-serif;"
      >TaskThing</span>
    {:else}
      <div class="flex-1"></div>
    {/if}
    <button
      class="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--ink-faint)] hover:bg-[var(--card-soft)] hover:text-[var(--ink)] transition-colors shrink-0"
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
    <!-- Dashboard -->
    <div class="px-2">
      <a
        href="/dashboard"
        class="flex items-center gap-3 rounded-lg text-sm font-medium transition-colors
          {collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'}
          {$page.url.pathname === '/dashboard'
            ? 'bg-[var(--card-soft)] rounded-lg text-[var(--ink)] font-semibold'
            : 'text-[var(--ink-soft)] hover:bg-[var(--card-soft)] hover:text-[var(--ink)]'}"
        title={collapsed ? 'Dashboard' : undefined}
      >
        <i class="fa-solid fa-house text-sm shrink-0"></i>
        {#if !collapsed}<span>Dashboard</span>{/if}
      </a>
    </div>

    <!-- Calendar -->
    <div class="px-2">
      <a
        href="/calendar"
        class="flex items-center gap-3 rounded-lg text-sm font-medium transition-colors
          {collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'}
          {$page.url.pathname === '/calendar'
            ? 'bg-[var(--card-soft)] rounded-lg text-[var(--ink)] font-semibold'
            : 'text-[var(--ink-soft)] hover:bg-[var(--card-soft)] hover:text-[var(--ink)]'}"
        title={collapsed ? 'Kalender' : undefined}
      >
        <i class="fa-solid fa-calendar-days text-sm shrink-0"></i>
        {#if !collapsed}<span>Kalender</span>{/if}
      </a>
    </div>

    <!-- My Tasks -->
    <div class="px-2">
      <a
        href="/my-tasks"
        class="flex items-center gap-3 rounded-lg text-sm font-medium transition-colors
          {collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'}
          {$page.url.pathname === '/my-tasks'
            ? 'bg-[var(--card-soft)] rounded-lg text-[var(--ink)] font-semibold'
            : 'text-[var(--ink-soft)] hover:bg-[var(--card-soft)] hover:text-[var(--ink)]'}"
        title={collapsed ? 'Tugas Saya' : undefined}
      >
        <i class="fa-solid fa-list-check text-sm shrink-0"></i>
        {#if !collapsed}<span>Tugas Saya</span>{/if}
      </a>
    </div>

    <!-- Activity -->
    <div class="px-2">
      <a
        href="/activity"
        class="flex items-center gap-3 rounded-lg text-sm font-medium transition-colors
          {collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'}
          {$page.url.pathname === '/activity'
            ? 'bg-[var(--card-soft)] rounded-lg text-[var(--ink)] font-semibold'
            : 'text-[var(--ink-soft)] hover:bg-[var(--card-soft)] hover:text-[var(--ink)]'}"
        title={collapsed ? 'Aktivitas' : undefined}
      >
        <i class="fa-solid fa-clock-rotate-left text-sm shrink-0"></i>
        {#if !collapsed}<span>Aktivitas</span>{/if}
      </a>
    </div>

    <!-- Archive -->
    <div class="px-2">
      <a
        href="/archive"
        class="flex items-center gap-3 rounded-lg text-sm font-medium transition-colors
          {collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'}
          {$page.url.pathname === '/archive'
            ? 'bg-[var(--card-soft)] rounded-lg text-[var(--ink)] font-semibold'
            : 'text-[var(--ink-soft)] hover:bg-[var(--card-soft)] hover:text-[var(--ink)]'}"
        title={collapsed ? 'Arsip' : undefined}
      >
        <i class="fa-solid fa-box-archive text-sm shrink-0"></i>
        {#if !collapsed}<span>Arsip</span>{/if}
      </a>
    </div>

    <!-- Divider -->
    <div class="mx-2 mt-3 mb-3">
      <div class="border-t border-[var(--line)]"></div>
    </div>

    <!-- New project button -->
    <div class="px-2 mb-3">
      <button
        class="flex items-center gap-3 w-full rounded-lg text-sm font-semibold transition-colors
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

    <!-- Section label -->
    {#if !collapsed}
      <div class="px-3 mb-2">
        <p class="text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-widest select-none">
          Proyek
        </p>
      </div>
    {/if}

    <!-- Project list -->
    <div class="px-2 flex flex-col gap-2">
      {#if owned.length === 0 && !collapsed}
        <div class="px-2 py-5 flex flex-col items-center gap-2 text-center">
          <i class="fa-regular fa-folder-open text-xl text-[var(--ink-faint)]"></i>
          <p class="text-xs text-[var(--ink-faint)] leading-relaxed">Belum ada proyek.<br/>Buat yang pertama.</p>
        </div>
      {/if}

      {#if owned.length > 0}
        <div class="bg-[var(--card-soft)] rounded-xl p-1 border border-[var(--line)]">
          <ul class="flex flex-col gap-0.5" role="list">
            {#each owned as project (project.id)}
              {@const isActive = currentProjectId === project.id}
              <li>
                {#if collapsed}
                  <button
                    class="w-full flex justify-center items-center p-2.5 rounded-lg transition-colors
                      {isActive ? 'bg-white shadow-sm' : 'hover:bg-white/60'}"
                    onclick={() => handleSelectProject(project.id)}
                    title={project.name}
                    aria-label={project.name}
                  >
                    <span class="w-5 h-5 flex items-center justify-center shrink-0">
                      <i class="fa-solid fa-folder text-sm" style="color:{project.color};"></i>
                    </span>
                  </button>
                {:else}
                  <div
                    class="group relative flex items-center rounded-lg transition-colors
                      {isActive ? 'bg-white shadow-sm' : 'hover:bg-white/60'}"
                  >
                    {#if isActive}
                      <span class="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-[var(--accent)]"></span>
                    {/if}
                    <button
                      class="flex-1 flex items-center gap-3 pl-4 pr-1 py-2.5 cursor-pointer min-w-0 text-left"
                      onclick={() => handleSelectProject(project.id)}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span class="w-3.5 flex items-center justify-center shrink-0">
                        <i class="fa-solid fa-folder text-sm" style="color:{project.color};"></i>
                      </span>
                      <span
                        class="flex-1 truncate text-sm font-semibold
                          {isActive ? 'text-[var(--ink)]' : 'text-[var(--ink-soft)] group-hover:text-[var(--ink)]'}"
                      >{project.name}</span>
                    </button>
                    <button
                      class="w-6 h-6 mr-1 rounded-lg flex items-center justify-center transition-all shrink-0
                        opacity-0 group-hover:opacity-100
                        text-[var(--ink-faint)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                      onclick={(e) => handleEditClick(e, project)}
                      aria-label="Edit proyek"
                    >
                      <i class="fa-solid fa-pen text-[9px]"></i>
                    </button>
                    <button
                      class="w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0
                        opacity-0 group-hover:opacity-100
                        text-[var(--ink-faint)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                      onclick={(e) => handleArchiveClick(e, project.id, project.name)}
                      aria-label="Arsipkan proyek"
                    >
                      <i class="fa-solid fa-box-archive text-[9px]"></i>
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
        </div>
      {/if}

      <!-- Shared projects -->
      {#if shared.length > 0}
        <div class="mt-1">
          {#if !collapsed}
            <p class="px-1 mb-1 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-widest select-none">
              Dibagikan
            </p>
          {/if}
          <div class="bg-[var(--card-soft)] rounded-xl p-1 border border-[var(--line)]">
            <ul class="flex flex-col gap-0.5" role="list">
              {#each shared as project (project.id)}
                {@const isActive = currentProjectId === project.id}
                <li>
                  {#if collapsed}
                    <button
                      class="w-full flex justify-center items-center p-2.5 rounded-lg transition-colors
                        {isActive ? 'bg-white shadow-sm' : 'hover:bg-white/60'}"
                      onclick={() => handleSelectProject(project.id)}
                      title={project.name}
                    >
                      <span class="w-5 h-5 flex items-center justify-center shrink-0">
                        <i class="fa-solid fa-folder text-sm" style="color:{project.color};"></i>
                      </span>
                    </button>
                  {:else}
                    <div
                      class="group relative flex items-center rounded-lg transition-colors
                        {isActive ? 'bg-white shadow-sm' : 'hover:bg-white/60'}"
                    >
                      {#if isActive}
                        <span class="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-[var(--accent)]"></span>
                      {/if}
                      <button
                        class="flex-1 flex items-center gap-3 pl-4 pr-1 py-2.5 cursor-pointer min-w-0 text-left"
                        onclick={() => handleSelectProject(project.id)}
                      >
                        <span class="w-3.5 flex items-center justify-center shrink-0">
                          <i class="fa-solid fa-folder text-sm" style="color:{project.color};"></i>
                        </span>
                        <span
                          class="flex-1 truncate text-sm font-semibold
                            {isActive ? 'text-[var(--ink)]' : 'text-[var(--ink-soft)] group-hover:text-[var(--ink)]'}"
                        >{project.name}</span>
                      </button>
                    </div>
                  {/if}
                </li>
              {/each}
            </ul>
          </div>
        </div>
      {/if}
    </div>
  </div>
</aside>

<ConfirmDialog
  open={confirmOpen}
  title={confirmType === 'archive' ? 'Arsipkan proyek' : 'Hapus proyek'}
  message={confirmType === 'archive'
    ? `Arsipkan proyek "${confirmProjectName}"? Proyek akan disembunyikan dari sidebar dan bisa dipulihkan dari menu Arsip.`
    : `Hapus proyek "${confirmProjectName}"? Seluruh tugas dan tautan di dalamnya akan ikut terhapus.`}
  confirmText={confirmType === 'archive' ? 'Arsipkan' : 'Hapus'}
  variant={confirmType === 'archive' ? 'warning' : 'danger'}
  onConfirm={handleConfirmDelete}
  onCancel={() => { confirmOpen = false; }}
/>
