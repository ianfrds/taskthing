<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { projects, activeProjectId, taskView, modals, editingTaskId } from '$lib/stores/app.store';
  import { fetchProjectData } from '$lib/db/projects';
  import { PROJECT_TABS } from '$lib/constants';
  import { supabase } from '$lib/supabase';
  import { toast } from '$lib/stores/toast.store';
  import type { ProjectTab, Resource } from '$lib/types';
  import KanbanView from '$components/project/tasks/KanbanView.svelte';
  import ListView from '$components/project/tasks/ListView.svelte';
  import TableView from '$components/project/tasks/TableView.svelte';
  import ResourcesTab from '$components/project/resources/ResourcesTab.svelte';
  import TeamTab from '$components/project/team/TeamTab.svelte';
  import SettingsTab from '$components/project/settings/SettingsTab.svelte';
  import EmptyState from '$components/ui/EmptyState.svelte';

  let { data } = $props();

  const projectId = $derived(data.projectId as string);
  const tab = $derived(data.tab as ProjectTab);

  // Gunakan store sebagai sumber utama data project
  const project = $derived($projects.find((p) => p.id === projectId) ?? null);
  const isOwner = $derived(!project?.isShared);
  const tv = $derived($taskView);

  let loadError = $state(false);

  type RealtimeChannel = ReturnType<typeof supabase.channel>;
  let realtimeChannel: RealtimeChannel | null = null;

  onMount(async () => {
    // Set active project
    activeProjectId.set(projectId);

    // Jika project sudah ada di store (dari layout), langsung subscribe realtime
    // Jika belum (misalnya setelah refresh), fetch dulu dari DB
    const existing = $projects.find((p) => p.id === projectId);
    if (!existing || !existing.statuses.length) {
      try {
        const relational = await fetchProjectData(projectId);
        projects.update((list) => {
          const proj = list.find((p) => p.id === projectId);
          if (proj) {
            return list.map((p) => p.id === projectId ? { ...p, ...relational } : p);
          }
          return list;
        });
      } catch (e) {
        console.error('+page.svelte onMount fetchProjectData:', e);
        loadError = true;
        toast.error('Gagal memuat data proyek.');
      }
    }

    subscribeToProject(projectId);
  });

  onDestroy(() => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }
  });

  function subscribeToProject(pid: string) {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }

    const tableToField: Record<string, string> = {
      statuses: 'statuses',
      categories: 'categories',
      priorities: 'priorities',
      members: 'members',
      tasks: 'todos',
      resources: 'resources',
    };

    const tables = Object.keys(tableToField).concat(['projects']);
    realtimeChannel = supabase.channel(`project-${pid}`);

    for (const table of tables) {
      const filter = table === 'projects'
        ? `id=eq.${pid}`
        : `project_id=eq.${pid}`;

      // @ts-ignore — Supabase realtime typing is complex
      realtimeChannel.on('postgres_changes', { event: '*', schema: 'public', table, filter }, (payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) => {
        handleRealtimeEvent(table, payload, tableToField, pid);
      });
    }

    realtimeChannel.subscribe();
  }

  function handleRealtimeEvent(
    table: string,
    payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> },
    tableToField: Record<string, string>,
    pid: string
  ) {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (table === 'projects') {
      if (eventType === 'UPDATE') {
        projects.update((list) =>
          list.map((p) => (p.id === newRecord['id'] ? { ...p, ...newRecord } : p))
        );
      }
      return;
    }

    const field = tableToField[table];
    if (!field) return;

    projects.update((list) =>
      list.map((p) => {
        if (p.id !== pid) return p;
        const arr = (p as unknown as Record<string, unknown[]>)[field] ?? [];
        if (eventType === 'INSERT') {
          if (arr.find((x) => (x as Record<string, unknown>)['id'] === newRecord['id'])) return p;
          return { ...p, [field]: [...arr, newRecord] };
        }
        if (eventType === 'UPDATE') {
          return { ...p, [field]: arr.map((x) => (x as Record<string, unknown>)['id'] === newRecord['id'] ? newRecord : x) };
        }
        if (eventType === 'DELETE') {
          return { ...p, [field]: arr.filter((x) => (x as Record<string, unknown>)['id'] !== oldRecord['id']) };
        }
        return p;
      })
    );
  }

  function openAddTask() {
    editingTaskId.set(null);
    modals.update((m) => ({ ...m, task: true }));
  }

  function openAddResource() {
    modals.update((m) => ({ ...m, resource: true }));
  }

  function openEditResource(_res: Resource) {
    modals.update((m) => ({ ...m, resource: true }));
  }

  const lastStatusId = $derived(project?.statuses[project.statuses.length - 1]?.id);
  const doneCount = $derived(project?.todos.filter((t: import('$lib/types').Task) => t.status_id === lastStatusId).length ?? 0);
  const totalCount = $derived(project?.todos.length ?? 0);
  const pct = $derived(totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0);
</script>

<svelte:head>
  <title>{project?.name ?? 'Proyek'} — TaskThing</title>
</svelte:head>

{#if !project}
  <!-- Loading state setelah refresh -->
  <div class="flex flex-col gap-5">
    <div class="h-32 bg-white rounded-2xl border border-[var(--line)] animate-pulse"></div>
    <div class="h-12 bg-white rounded-2xl border border-[var(--line)] animate-pulse"></div>
    <div class="h-64 bg-white rounded-2xl border border-[var(--line)] animate-pulse"></div>
  </div>
{:else}
  <div class="flex flex-col gap-5">

    <!-- ── 1. Overview card ─────────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)] px-6 py-5">
      <div class="flex items-start gap-5">
        <!-- Icon -->
        <div
          class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
          style="background:{project.color}18; color:{project.color};"
        >
          <i class="fa-solid {project.icon}"></i>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <h1
            class="text-2xl font-bold text-[var(--ink)] truncate leading-tight"
            style="font-family:'Space Grotesk',sans-serif;"
          >
            {project.name}
          </h1>
          {#if project.description}
            <p class="text-sm text-[var(--ink-soft)] mt-1 leading-relaxed">{project.description}</p>
          {:else}
            <p class="text-sm text-[var(--ink-faint)] mt-1 italic">Tidak ada deskripsi</p>
          {/if}

          <!-- Stats row -->
          <div class="flex items-center gap-5 mt-4 flex-wrap">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full shrink-0" style="background:{project.color};"></span>
              <span class="text-sm text-[var(--ink-soft)]">
                <span class="font-semibold text-[var(--ink)]">{totalCount}</span> tugas
              </span>
            </div>
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-circle-check text-[var(--green)] text-sm"></i>
              <span class="text-sm text-[var(--ink-soft)]">
                <span class="font-semibold text-[var(--ink)]">{doneCount}</span> selesai
              </span>
            </div>
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-users text-[var(--blue)] text-sm"></i>
              <span class="text-sm text-[var(--ink-soft)]">
                <span class="font-semibold text-[var(--ink)]">{project.members.length}</span> anggota
              </span>
            </div>
          </div>
        </div>

        <!-- Progress ring area -->
        <div class="shrink-0 hidden sm:flex flex-col items-end gap-2">
          <div class="flex items-baseline gap-1">
            <span class="text-3xl font-bold text-[var(--ink)]" style="font-family:'Space Grotesk',sans-serif;">{pct}</span>
            <span class="text-sm font-semibold text-[var(--ink-faint)]">%</span>
          </div>
          <div class="w-36 h-2 bg-[var(--line)] rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              style="width:{pct}%; background:{project.color};"
            ></div>
          </div>
          <p class="text-xs text-[var(--ink-faint)]">penyelesaian</p>
        </div>
      </div>
    </div>

    <!-- ── 2. Tab navigation bar ────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)]">
      <div class="flex items-center gap-1 px-4 py-3">
        {#each PROJECT_TABS.filter(t => isOwner || t.key !== 'settings') as t}
          <a
            href="/{project.id}/{t.key}"
            class="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap
              {tab === t.key
                ? 'bg-[var(--card-soft)] text-[var(--ink)] font-semibold'
                : 'text-[var(--ink-soft)] hover:bg-[var(--card-soft)] hover:text-[var(--ink)]'}"
          >
            <i class="fa-solid {t.icon}
              {tab === t.key ? 'text-[var(--accent)]' : 'text-[var(--ink-faint)]'}"></i>
            {t.label}
          </a>
        {/each}

        <div class="flex-1"></div>
      </div>
    </div>

    <!-- ── 3. Tab content ────────────────────────────────────── -->
    {#if tab === 'tasks'}
      <!-- Tasks toolbar: view mode + add button -->
      <div class="bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)]">
        <div class="flex items-center gap-3 px-5 py-3.5">
          <span class="text-sm font-semibold text-[var(--ink-soft)]">Tampilan</span>
          <!-- View mode tabs -->
          <div class="flex items-center gap-0.5 bg-[var(--card-soft)] rounded-xl p-1 border border-[var(--line)]">
            {#each ([['kanban','fa-table-columns','Kanban'],['list','fa-list','List'],['table','fa-table','Tabel']] as const) as [v, icon, label]}
              <button
                class="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors
                  {tv === v
                    ? 'bg-white text-[var(--ink)] shadow-sm font-semibold'
                    : 'text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-white/60'}"
                onclick={() => taskView.set(v)}
                aria-label="Tampilan {label}"
              >
                <i class="fa-solid {icon} text-xs {tv === v ? 'text-[var(--accent)]' : ''}"></i>
                {label}
              </button>
            {/each}
          </div>

          <div class="flex-1"></div>

          {#if isOwner}
            <button
              class="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-deep)] transition-colors shadow-[var(--shadow-accent)]"
              onclick={openAddTask}
            >
              <i class="fa-solid fa-plus text-xs"></i>
              Tambah tugas
            </button>
          {/if}
        </div>
      </div>

      <!-- Task view content -->
      {#if tv === 'kanban'}
        <KanbanView {project} {isOwner} onAddTask={openAddTask} />
      {:else if tv === 'list'}
        <ListView {project} {isOwner} onAddTask={openAddTask} />
      {:else}
        <TableView {project} {isOwner} onAddTask={openAddTask} />
      {/if}

    {:else if tab === 'resources'}
      <ResourcesTab {project} {isOwner} onAddResource={openAddResource} onEditResource={openEditResource} />

    {:else if tab === 'team'}
      <TeamTab {project} {isOwner} />

    {:else if tab === 'settings' && isOwner}
      <SettingsTab {project} />

    {:else}
      <EmptyState
        icon="lock"
        title="Tidak ada akses"
        description="Kamu tidak memiliki izin untuk melihat halaman ini."
      />
    {/if}

  </div>
{/if}
