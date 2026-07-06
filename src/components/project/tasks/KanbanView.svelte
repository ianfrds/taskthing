<script lang="ts">
  import { searchQuery, activeProject } from '$lib/stores/app.store';
  import TaskCard from './TaskCard.svelte';
  import EmptyState from '$components/ui/EmptyState.svelte';
  import type { Project } from '$lib/types';

  interface Props {
    project: Project;
    isOwner?: boolean;
    onAddTask?: () => void;
  }

  let { project, isOwner = true, onAddTask }: Props = $props();

  const q = $derived($searchQuery);
  const filteredTodos = $derived(
    q ? project.todos.filter((t) => t.title.toLowerCase().includes(q)) : project.todos
  );

  // Group todos by status
  const columns = $derived(
    project.statuses.map((status) => ({
      status,
      tasks: filteredTodos.filter((t) => t.status_id === status.id),
    }))
  );

  // Drag-and-drop state
  let dragTaskId = $state<string | null>(null);
  let dragOverStatusId = $state<string | null>(null);

  import { updateTask } from '$lib/db/tasks';
  import { projects } from '$lib/stores/app.store';
  import { toast } from '$lib/stores/toast.store';

  async function handleDrop(statusId: string) {
    if (!dragTaskId || dragTaskId === statusId) return;
    const task = project.todos.find((t) => t.id === dragTaskId);
    if (!task || task.status_id === statusId) { dragTaskId = null; dragOverStatusId = null; return; }
    try {
      const updated = await updateTask(task.id, { status_id: statusId });
      projects.update((list) =>
        list.map((p) =>
          p.id === project.id
            ? { ...p, todos: p.todos.map((t) => (t.id === updated.id ? updated : t)) }
            : p
        )
      );
    } catch (e) {
      console.error('KanbanView.handleDrop:', e);
      toast.error('Gagal memindahkan tugas.');
    } finally {
      dragTaskId = null;
      dragOverStatusId = null;
    }
  }
</script>

<div class="flex gap-4 overflow-x-auto pb-4">
  {#each columns as col (col.status.id)}
    <div
      class="shrink-0 w-72 flex flex-col gap-2"
      ondragover={(e) => { e.preventDefault(); dragOverStatusId = col.status.id; }}
      ondrop={() => handleDrop(col.status.id)}
      ondragleave={() => { if (dragOverStatusId === col.status.id) dragOverStatusId = null; }}
      role="region"
      aria-label="Kolom {col.status.name}"
    >
      <!-- Column header -->
      <div
        class="flex items-center gap-2 px-1 py-0.5 rounded-lg transition-colors {dragOverStatusId === col.status.id ? 'bg-[var(--accent-soft)]' : ''}"
      >
        <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:{col.status.color};"></span>
        <span class="text-sm font-semibold text-[var(--ink)]">{col.status.name}</span>
        <span class="ml-auto text-xs font-medium text-[var(--ink-faint)] bg-[var(--card-soft)] px-1.5 py-0.5 rounded-full">
          {col.tasks.length}
        </span>
      </div>

      <!-- Task list -->
      <div
        class="flex flex-col gap-2 min-h-[80px] rounded-xl p-2 transition-colors {dragOverStatusId === col.status.id ? 'bg-[var(--accent-soft)] border-2 border-dashed border-[var(--accent)]' : 'bg-[var(--card-soft)]'}"
      >
        {#each col.tasks as task (task.id)}
          <div
            draggable="true"
            ondragstart={() => (dragTaskId = task.id)}
            ondragend={() => { dragTaskId = null; dragOverStatusId = null; }}
            class="cursor-grab active:cursor-grabbing"
          >
            <TaskCard {task} {isOwner} />
          </div>
        {/each}

        {#if col.tasks.length === 0 && !q}
          <div class="flex flex-col items-center justify-center gap-1.5 py-6 text-center">
            <i class="fa-regular fa-circle-dot text-base text-[var(--ink-faint)]"></i>
            <p class="text-xs text-[var(--ink-faint)]">Tidak ada tugas</p>
          </div>
        {/if}
      </div>

      <!-- Add task button per column -->
      {#if isOwner && !q}
        <button
          class="w-full flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--ink-faint)] hover:bg-[var(--card-soft)] hover:text-[var(--ink)] transition-colors"
          onclick={onAddTask}
        >
          <i class="fa-solid fa-plus text-[10px]"></i>
          Tambah tugas
        </button>
      {/if}
    </div>
  {/each}
</div>

{#if project.statuses.length === 0}
  <div class="bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)]">
    <EmptyState
      icon="table-columns"
      title="Belum ada status"
      description="Tambahkan status di Master Data untuk mulai menggunakan tampilan Kanban."
    />
  </div>
{/if}
