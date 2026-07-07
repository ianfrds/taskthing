<script lang="ts">
  import { searchQuery, projects, editingTaskId, viewingTaskId, modals } from '$lib/stores/app.store';
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
  const filtered = $derived(
    q ? project.todos.filter((t) => t.title.toLowerCase().includes(q)) : project.todos
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
      console.error('TableView.handleDelete:', e);
      toast.error('Gagal menghapus tugas. Coba lagi.');
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

{#if filtered.length === 0}
  <EmptyState
    icon="table"
    title="Belum ada tugas"
    description="Tambahkan tugas pertama untuk proyek ini."
    ctaLabel={isOwner ? 'Tambah tugas' : undefined}
    onCta={isOwner ? onAddTask : undefined}
  />
{:else}
  <div class="bg-white rounded-2xl border border-[var(--line)] overflow-hidden shadow-[var(--shadow-card)]">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-[var(--card-soft)] text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wide border-b border-[var(--line)]">
            <th class="px-4 py-3 text-left">Tugas</th>
            <th class="px-4 py-3 text-left">Status</th>
            {#if !project.disable_priorities}
              <th class="px-4 py-3 text-left">Prioritas</th>
            {/if}
            {#if !project.disable_categories}
              <th class="px-4 py-3 text-left">Kategori</th>
            {/if}
            <th class="px-4 py-3 text-left">Tenggat</th>
            <th class="px-4 py-3 text-left">Anggota</th>
            {#if isOwner}
              <th class="px-4 py-3 w-20"></th>
            {/if}
          </tr>
        </thead>
        <tbody class="divide-y divide-[var(--line)]">
          {#each filtered as task (task.id)}
            {@const status = project.statuses.find((s) => s.id === task.status_id)}
            {@const priority = project.priorities.find((p) => p.id === task.priority_id)}
            {@const category = project.categories.find((c) => c.id === task.category_id)}
            {@const members = project.members.filter((m) => task.tag_ids?.includes(m.id))}
            {@const overdue = isOverdue(task.due)}
            <tr
              class="hover:bg-[var(--card-soft)] transition-colors group cursor-pointer"
              onclick={() => handleOpenDetail(task)}
              onkeydown={(e) => e.key === 'Enter' && handleOpenDetail(task)}
              tabindex="0"
              role="button"
              aria-label="Lihat detail tugas"
            >
              <td class="px-4 py-3 font-medium text-[var(--ink)] max-w-[200px] truncate">{task.title}</td>
              <td class="px-4 py-3">
                {#if status}
                  <Badge color={status.color} label={status.name} dot />
                {:else}
                  <span class="text-[var(--ink-faint)]">—</span>
                {/if}
              </td>
              {#if !project.disable_priorities}
                <td class="px-4 py-3">
                  {#if priority}
                    <Badge color={priority.color} label={priority.name} />
                  {:else}
                    <span class="text-[var(--ink-faint)]">—</span>
                  {/if}
                </td>
              {/if}
              {#if !project.disable_categories}
                <td class="px-4 py-3">
                  {#if category}
                    <Badge color={category.color} label={category.name} />
                  {:else}
                    <span class="text-[var(--ink-faint)]">—</span>
                  {/if}
                </td>
              {/if}
              <td class="px-4 py-3">
                {#if task.due}
                  <span class="text-xs {overdue ? 'text-[var(--red)] font-semibold' : 'text-[var(--ink-soft)]'}">
                    {formatDate(task.due)}
                  </span>
                {:else}
                  <span class="text-[var(--ink-faint)]">—</span>
                {/if}
              </td>
              <td class="px-4 py-3">
                {#if members.length > 0}
                  <div class="flex -space-x-1.5">
                    {#each members.slice(0, 3) as m}
                      <Avatar name={m.name} color={m.color} size="sm" />
                    {/each}
                    {#if members.length > 3}
                      <span class="w-6 h-6 rounded-full bg-[var(--card-soft)] border-2 border-white flex items-center justify-center text-[10px] text-[var(--ink-soft)] font-semibold">
                        +{members.length - 3}
                      </span>
                    {/if}
                  </div>
                {:else}
                  <span class="text-[var(--ink-faint)]">—</span>
                {/if}
              </td>
              {#if isOwner}
                <td class="px-4 py-3">
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
                </td>
              {/if}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
{/if}

<ConfirmDialog
  open={!!confirmTask}
  title="Hapus tugas"
  message="Hapus tugas ini? Tindakan ini tidak bisa dibatalkan."
  confirmText="Hapus"
  variant="danger"
  onConfirm={handleDelete}
  onCancel={() => (confirmTask = null)}
/>
