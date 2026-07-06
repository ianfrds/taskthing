<script lang="ts">
  import { activeProject, projects, editingTaskId, viewingTaskId, modals } from '$lib/stores/app.store';
  import { deleteTask } from '$lib/db/tasks';
  import { toast } from '$lib/stores/toast.store';
  import { formatDate, isOverdue } from '$lib/utils';
  import Badge from '$components/ui/Badge.svelte';
  import Avatar from '$components/ui/Avatar.svelte';
  import ConfirmDialog from '$components/ui/ConfirmDialog.svelte';
  import type { Task } from '$lib/types';

  interface Props {
    task: Task;
    isOwner?: boolean;
    onEdit?: () => void;
  }

  let { task, isOwner = true, onEdit }: Props = $props();

  const proj = $derived($activeProject);
  const status = $derived(proj?.statuses.find((s) => s.id === task.status_id));
  const priority = $derived(proj?.priorities.find((p) => p.id === task.priority_id));
  const category = $derived(proj?.categories.find((c) => c.id === task.category_id));
  const tagMembers = $derived(proj?.members.filter((m) => task.tag_ids?.includes(m.id)) ?? []);

  let confirmOpen = $state(false);

  const overdue = $derived(isOverdue(task.due) && status?.id !== proj?.statuses[proj.statuses.length - 1]?.id);

  async function handleDelete() {
    confirmOpen = false;
    if (!proj) return;
    try {
      await deleteTask(task.id);
      projects.update((list) =>
        list.map((p) =>
          p.id === proj.id ? { ...p, todos: p.todos.filter((t) => t.id !== task.id) } : p
        )
      );
      toast.success('Tugas berhasil dihapus.');
    } catch (e) {
      console.error('TaskCard.handleDelete:', e);
      toast.error('Gagal menghapus tugas. Coba lagi.');
    }
  }

  function handleEdit() {
    editingTaskId.set(task.id);
    modals.update((m) => ({ ...m, task: true }));
    onEdit?.();
  }

  function handleOpenDetail() {
    viewingTaskId.set(task.id);
    modals.update((m) => ({ ...m, taskDetail: true }));
  }

  function handleEditClick(e: MouseEvent) { e.stopPropagation(); handleEdit(); }
  function handleDeleteClick(e: MouseEvent) { e.stopPropagation(); confirmOpen = true; }
  function handleKeydown(e: KeyboardEvent) { if (e.key === 'Enter' || e.key === ' ') handleOpenDetail(); }
</script>

<article
  class="bg-white rounded-xl border border-[var(--line)] p-3.5 flex flex-col gap-2.5 hover:shadow-[var(--shadow-card-hover)] transition-shadow cursor-pointer group"
  onclick={handleOpenDetail}
  role="button"
  tabindex="0"
  aria-label="Lihat detail tugas"
  onkeydown={handleKeydown}
>
  <!-- Header row -->
  <div class="flex items-start gap-2">
    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold text-[var(--ink)] leading-snug break-words">{task.title}</p>
    </div>
    {#if isOwner}
      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          class="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--ink-faint)] hover:bg-[var(--card-soft)] hover:text-[var(--ink)] transition-colors"
          onclick={handleEditClick}
          aria-label="Edit tugas"
        >
          <i class="fa-solid fa-pen text-[10px]"></i>
        </button>
        <button
          class="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--ink-faint)] hover:bg-[var(--red-soft)] hover:text-[var(--red)] transition-colors"
          onclick={handleDeleteClick}
          aria-label="Hapus tugas"
        >
          <i class="fa-solid fa-trash text-[10px]"></i>
        </button>
      </div>
    {/if}
  </div>

  <!-- Badges row -->
  <div class="flex flex-wrap gap-1.5 items-center">
    {#if priority && !proj?.disable_priorities}
      <Badge color={priority.color} label={priority.name} dot />
    {/if}
    {#if category && !proj?.disable_categories}
      <Badge color={category.color} label={category.name} />
    {/if}
    {#if task.due}
      <span class="inline-flex items-center gap-1 text-xs font-medium {overdue ? 'text-[var(--red)]' : 'text-[var(--ink-faint)]'}">
        <i class="fa-solid fa-calendar-days text-[10px]"></i>
        {formatDate(task.due)}
      </span>
    {/if}
  </div>

  <!-- Tag members -->
  {#if tagMembers.length > 0}
    <div class="flex items-center gap-1 flex-wrap">
      {#each tagMembers as member}
        <Avatar name={member.name} color={member.color} size="sm" />
      {/each}
    </div>
  {/if}

  <!-- Preview: description snippet -->
  {#if task.description}
    <p class="text-xs text-[var(--ink-faint)] leading-relaxed line-clamp-2">{task.description}</p>
  {/if}

  <!-- Preview: attachment/link indicator -->
  {#if task.link || (task.images && task.images.length > 0)}
    <div class="flex items-center gap-2 text-[10px] text-[var(--ink-faint)]">
      {#if task.link}
        <span class="flex items-center gap-1">
          <i class="fa-solid fa-link"></i>
          Tautan
        </span>
      {/if}
      {#if task.images && task.images.length > 0}
        <span class="flex items-center gap-1">
          <i class="fa-solid fa-image"></i>
          {task.images.length} gambar
        </span>
      {/if}
    </div>
  {/if}
</article>

<ConfirmDialog
  open={confirmOpen}
  title="Hapus tugas"
  message="Hapus tugas ini? Tindakan ini tidak bisa dibatalkan."
  confirmText="Hapus"
  variant="danger"
  onConfirm={handleDelete}
  onCancel={() => (confirmOpen = false)}
/>
