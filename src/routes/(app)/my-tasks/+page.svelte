<script lang="ts">
  import { onMount } from 'svelte';
  import { projects } from '$lib/stores/app.store';
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';
  import { activeProjectId, resetProjectState } from '$lib/stores/app.store';
  import type { Task, Project } from '$lib/types';
  import Badge from '$components/ui/Badge.svelte';
  import EmptyState from '$components/ui/EmptyState.svelte';

  type FilterStatus = 'all' | 'active' | 'done';

  let currentUserId = $state<string | null>(null);
  let filterStatus = $state<FilterStatus>('all');
  let filterProjectId = $state<string>('all');
  let searchQuery = $state('');

  onMount(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    currentUserId = user?.id ?? null;
  });

  type TaskWithProject = Task & { project: Project };

  const myTasks = $derived(() => {
    if (!currentUserId) return [] as TaskWithProject[];
    const result: TaskWithProject[] = [];
    for (const project of $projects) {
      const member = project.members.find((m) => {
        // match by email if current user email matches, or by tag_ids
        return true; // we use created_by or tag_ids
      });
      for (const task of project.todos) {
        const isAssigned = task.tag_ids?.length > 0 &&
          project.members.some((m) => task.tag_ids.includes(m.id));
        const isCreatedByMe = task.created_by === currentUserId;
        if (isAssigned || isCreatedByMe) {
          result.push({ ...task, project });
        }
      }
    }
    return result;
  });

  const filteredTasks = $derived(() => {
    let tasks = myTasks();

    if (filterProjectId !== 'all') {
      tasks = tasks.filter((t) => t.project_id === filterProjectId);
    }

    if (filterStatus === 'active') {
      tasks = tasks.filter((t) => {
        const proj = $projects.find((p) => p.id === t.project_id);
        const lastStatus = proj?.statuses[proj.statuses.length - 1];
        return t.status_id !== lastStatus?.id;
      });
    } else if (filterStatus === 'done') {
      tasks = tasks.filter((t) => {
        const proj = $projects.find((p) => p.id === t.project_id);
        const lastStatus = proj?.statuses[proj.statuses.length - 1];
        return t.status_id === lastStatus?.id;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      tasks = tasks.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      );
    }

    return tasks;
  });

  const groupedByProject = $derived(() => {
    const map = new Map<string, { project: Project; tasks: TaskWithProject[] }>();
    for (const task of filteredTasks()) {
      if (!map.has(task.project_id)) {
        map.set(task.project_id, { project: task.project, tasks: [] });
      }
      map.get(task.project_id)!.tasks.push(task);
    }
    return Array.from(map.values());
  });

  function getStatus(task: Task) {
    const proj = $projects.find((p) => p.id === task.project_id);
    return proj?.statuses.find((s) => s.id === task.status_id) ?? null;
  }

  function getPriority(task: Task) {
    const proj = $projects.find((p) => p.id === task.project_id);
    return proj?.priorities.find((p) => p.id === task.priority_id) ?? null;
  }

  function isOverdue(task: Task) {
    if (!task.due) return false;
    return new Date(task.due) < new Date();
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  async function openProject(projectId: string) {
    resetProjectState();
    activeProjectId.set(projectId);
    await goto(`/${projectId}/tasks`);
  }
</script>

<svelte:head>
  <title>Tugas Saya — TaskThing</title>
</svelte:head>

<div class="flex flex-col gap-4">
  <!-- Header -->
  <div class="flex items-center justify-between flex-wrap gap-3">
    <div>
      <h1 class="text-xl font-bold text-[var(--ink)]" style="font-family:'Space Grotesk',sans-serif;">Tugas Saya</h1>
      <p class="text-sm text-[var(--ink-soft)] mt-0.5">Semua tugas yang kamu buat atau ikut kerjakan</p>
    </div>
    <div class="flex items-center gap-2 text-sm font-semibold text-[var(--ink-soft)]">
      <i class="fa-solid fa-list-check text-[var(--accent)]"></i>
      {filteredTasks().length} tugas
    </div>
  </div>

  <!-- Filters -->
  <div class="flex flex-wrap items-center gap-2">
    <!-- Search -->
    <div class="relative flex-1 min-w-[180px] max-w-xs">
      <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-faint)] text-xs"></i>
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Cari tugas..."
        class="w-full pl-8 pr-3 py-2 text-sm border border-[var(--line)] rounded-lg bg-white text-[var(--ink)] placeholder:text-[var(--ink-faint)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10"
      />
    </div>

    <!-- Status filter -->
    <div class="flex gap-0.5 bg-[var(--card-soft)] border border-[var(--line)] rounded-lg p-1">
      {#each ([['all','Semua'],['active','Aktif'],['done','Selesai']] as const) as [v, label]}
        <button
          class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors
            {filterStatus === v ? 'bg-white text-[var(--ink)] shadow-sm font-semibold' : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'}"
          onclick={() => (filterStatus = v)}
        >{label}</button>
      {/each}
    </div>

    <!-- Project filter -->
    <select
      bind:value={filterProjectId}
      class="px-3 py-2 text-xs font-medium border border-[var(--line)] rounded-lg bg-white text-[var(--ink)] outline-none cursor-pointer"
    >
      <option value="all">Semua proyek</option>
      {#each $projects as p}
        <option value={p.id}>{p.name}</option>
      {/each}
    </select>
  </div>

  <!-- Task list grouped by project -->
  {#if groupedByProject().length === 0}
    <EmptyState
      icon="list-check"
      title="Tidak ada tugas"
      description="Kamu belum memiliki tugas yang di-assign atau dibuat."
    />
  {:else}
    <div class="flex flex-col gap-4">
      {#each groupedByProject() as { project, tasks }}
        <div class="bg-white rounded-xl border border-[var(--line)] overflow-hidden shadow-sm">
          <!-- Project header -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-[var(--line)] bg-[var(--card-soft)]">
            <button
              class="flex items-center gap-2 hover:opacity-70 transition-opacity"
              onclick={() => openProject(project.id)}
            >
              <i class="fa-solid fa-folder text-sm" style="color:{project.color};"></i>
              <span class="text-sm font-semibold text-[var(--ink)]">{project.name}</span>
              <i class="fa-solid fa-arrow-up-right-from-square text-[9px] text-[var(--ink-faint)]"></i>
            </button>
            <span class="text-xs font-medium text-[var(--ink-faint)]">{tasks.length} tugas</span>
          </div>

          <!-- Tasks -->
          <div class="divide-y divide-[var(--line)]">
            {#each tasks as task}
              {@const status = getStatus(task)}
              {@const priority = getPriority(task)}
              {@const overdue = isOverdue(task)}
              <div class="flex items-center gap-3 px-4 py-3 hover:bg-[var(--card-soft)] transition-colors">
                <!-- Status dot -->
                <span
                  class="w-2.5 h-2.5 rounded-full shrink-0"
                  style="background:{status?.color ?? 'var(--line)'};"
                ></span>

                <!-- Title -->
                <span class="flex-1 text-sm font-medium text-[var(--ink)] truncate">{task.title}</span>

                <!-- Badges -->
                <div class="flex items-center gap-1.5 shrink-0">
                  {#if status}
                    <Badge label={status.name} color={status.color} />
                  {/if}
                  {#if priority}
                    <Badge label={priority.name} color={priority.color} />
                  {/if}
                  {#if task.due}
                    <span class="text-xs font-medium px-2 py-0.5 rounded-md
                      {overdue ? 'bg-red-50 text-red-600' : 'bg-[var(--card-soft)] text-[var(--ink-soft)]'}">
                      <i class="fa-regular fa-clock mr-1"></i>{formatDate(task.due)}
                    </span>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
