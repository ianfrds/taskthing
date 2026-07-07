<script lang="ts">
  import { searchQuery, todoFilter, projects, editingTaskId, viewingTaskId, modals } from '$lib/stores/app.store';
  import { deleteTask } from '$lib/db/tasks';
  import { toast } from '$lib/stores/toast.store';
  import { formatDate, isOverdue } from '$lib/utils';
  import Badge from '$components/ui/Badge.svelte';
  import Avatar from '$components/ui/Avatar.svelte';
  import EmptyState from '$components/ui/EmptyState.svelte';
  import ConfirmDialog from '$components/ui/ConfirmDialog.svelte';
  import type { Project, Task } from '$lib/types';

  interface Props {
    project: Project;
    isOwner?: boolean;
    onAddTask?: () => void;
  }

  let { project, isOwner = true, onAddTask }: Props = $props();

  const q = $derived($searchQuery);
  const filter = $derived($todoFilter);

  const filteredTodos = $derived(
    project.todos
      .filter((t) => (filter === 'all' ? true : t.status_id === filter))
      .filter((t) => (q ? t.title.toLowerCase().includes(q) : true))
  );

  const groupedByStatus = $derived(
    project.statuses.map((s) => ({
      status: s,
      tasks: filteredTodos.filter((t) => t.status_id === s.id),
    })).filter((g) => filter === 'all' || g.status.id === filter)
  );

  let confirmTask = $state<Task | null>(null);

  async function handleDelete() {
    if (!confirmTask) return;
    const task = confirmTask;
    confirmTask = null;
    try {
      await deleteTask(task.id);
      projects.update((list) =>
        list.map((p) =>
          p.id === project.id ? { ...p, todos: p.todos.filter((t) => t.id !== task.id) } : p
        )
      );
      toast.success('Tugas berhasil dihapus.');
    } catch (e) {
      console.error('ListView.handleDelete:', e);
      toast.error('Gagal menghapus tugas.');
    }
  }

  function handleEdit(task: Task) {
    editingTaskId.set(task.id);
    modals.update((m) => ({ ...m, task: true }));
  }

  function handleOpenDetail(task: Task) {
    viewingTaskId.set(task.id);
    modals.update((m) => ({ ...m, taskDetail: true }));
  }
</script>

<div class="flex flex-col gap-4">
  <!-- Filter chips -->
  <div class="flex flex-wrap gap-2">
    <button
      class="px-3 py-1 rounded-full text-xs font-semibold transition-colors {filter === 'all' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--card-soft)] text-[var(--ink-soft)] hover:bg-[var(--line)]'}"
      onclick={() => todoFilter.set('all')}
    >
      Semua ({project.todos.length})
    </button>
    {#each project.statuses as s}
      <button
        class="px-3 py-1 rounded-full text-xs font-semibold transition-colors {filter === s.id ? 'text-white' : 'bg-[var(--card-soft)] text-[var(--ink-soft)] hover:bg-[var(--line)]'}"
        style={filter === s.id ? `background:${s.color};` : ''}
        onclick={() => todoFilter.set(s.id)}
      >
        {s.name}
      </button>
    {/each}
  </div>

  <!-- Task groups -->
  {#if filteredTodos.length === 0}
    <EmptyState
      icon="list-check"
      title="Belum ada tugas"
      description="Tugas yang kamu buat akan muncul di sini."
      ctaLabel={isOwner ? 'Tambah tugas' : undefined}
      onCta={isOwner ? onAddTask : undefined}
    />
  {:else}
    {#each groupedByStatus as group (group.status.id)}
      {#if group.tasks.length > 0}
        <div class="bg-white rounded-2xl border border-[var(--line)] overflow-hidden shadow-[var(--shadow-card)]">
          <div class="flex items-center gap-2.5 px-4 py-3 border-b border-[var(--line)]">
            <span class="w-2.5 h-2.5 rounded-full" style="background:{group.status.color};"></span>
            <span class="text-sm font-semibold text-[var(--ink)]">{group.status.name}</span>
            <span class="text-xs text-[var(--ink-faint)]">{group.tasks.length} tugas</span>
          </div>
          <ul class="divide-y divide-[var(--line)]">
            {#each group.tasks as task (task.id)}
              {@const priority = project.priorities.find((p) => p.id === task.priority_id)}
              {@const category = project.categories.find((c) => c.id === task.category_id)}
              {@const members = project.members.filter((m) => task.tag_ids?.includes(m.id))}
              {@const overdue = isOverdue(task.due)}
              <li
                class="flex items-center gap-3 px-4 py-3 hover:bg-[var(--card-soft)] transition-colors group cursor-pointer"
                onclick={() => handleOpenDetail(task)}
                onkeydown={(e) => e.key === 'Enter' && handleOpenDetail(task)}
                role="button"
                tabindex="0"
                aria-label="Lihat detail tugas"
              >
                <div class="flex-1 min-w-0 flex flex-col gap-1">
                  <span class="text-sm font-medium text-[var(--ink)] truncate">{task.title}</span>
                  <div class="flex flex-wrap gap-1.5 items-center">
                    {#if priority && !project.disable_priorities}
                      <Badge color={priority.color} label={priority.name} dot />
                    {/if}
                    {#if category && !project.disable_categories}
                      <Badge color={category.color} label={category.name} />
                    {/if}
                    {#if task.due}
                      <span class="text-xs {overdue ? 'text-[var(--red)]' : 'text-[var(--ink-faint)]'}">
                        <i class="fa-solid fa-calendar-days text-[10px]"></i>
                        {formatDate(task.due)}
                      </span>
                    {/if}
                  </div>
                </div>
                {#if members.length > 0}
                  <div class="flex -space-x-1.5">
                    {#each members as m}
                      <Avatar name={m.name} color={m.color} size="sm" />
                    {/each}
                  </div>
                {/if}
                {#if isOwner}
                  <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onclick={(e) => e.stopPropagation()} role="presentation">
                    <button
                      class="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--ink-faint)] hover:bg-[var(--card-soft)] hover:text-[var(--ink)] transition-colors"
                      onclick={() => handleEdit(task)}
                      aria-label="Edit tugas"
                    >
                      <i class="fa-solid fa-pen text-xs"></i>
                    </button>
                    <button
                      class="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--ink-faint)] hover:bg-[var(--red-soft)] hover:text-[var(--red)] transition-colors"
                      onclick={() => (confirmTask = task)}
                      aria-label="Hapus tugas"
                    >
                      <i class="fa-solid fa-trash text-xs"></i>
                    </button>
                  </div>
                {/if}
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    {/each}
  {/if}
</div>

<ConfirmDialog
  open={!!confirmTask}
  title="Hapus tugas"
  message="Hapus tugas ini? Tindakan ini tidak bisa dibatalkan."
  confirmText="Hapus"
  variant="danger"
  onConfirm={handleDelete}
  onCancel={() => (confirmTask = null)}
/>
