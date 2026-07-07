<script lang="ts">
  import { activeProject, projects, viewingTaskId, editingTaskId, modals } from '$lib/stores/app.store';
  import { deleteTask } from '$lib/db/tasks';
  import { toast } from '$lib/stores/toast.store';
  import { formatDate, isOverdue, parseHostname } from '$lib/utils';
  import Badge from '$components/ui/Badge.svelte';
  import Avatar from '$components/ui/Avatar.svelte';
  import ConfirmDialog from '$components/ui/ConfirmDialog.svelte';
  import Lightbox from '$components/ui/Lightbox.svelte';

  interface Props {
    open: boolean;
    onClose: () => void;
  }

  let { open, onClose }: Props = $props();

  const proj = $derived($activeProject);
  const task = $derived(
    $viewingTaskId ? proj?.todos.find((t) => t.id === $viewingTaskId) ?? null : null
  );

  const status   = $derived(proj?.statuses.find((s) => s.id === task?.status_id));
  const priority = $derived(proj?.priorities.find((p) => p.id === task?.priority_id));
  const category = $derived(proj?.categories.find((c) => c.id === task?.category_id));
  const tagMembers = $derived(proj?.members.filter((m) => task?.tag_ids?.includes(m.id)) ?? []);
  const overdue  = $derived(
    isOverdue(task?.due ?? null) &&
    status?.id !== proj?.statuses[proj.statuses.length - 1]?.id
  );

  let confirmOpen = $state(false);
  let lightboxSrc = $state<string | null>(null);
  let deleting = $state(false);

  function handleEdit() {
    if (!task) return;
    editingTaskId.set(task.id);
    modals.update((m) => ({ ...m, taskDetail: false, task: true }));
  }

  function handleDeleteClick() {
    confirmOpen = true;
  }

  async function handleConfirmDelete() {
    if (!task || !proj) return;
    confirmOpen = false;
    deleting = true;
    try {
      await deleteTask(task.id);
      projects.update((list) =>
        list.map((p) =>
          p.id === proj.id ? { ...p, todos: p.todos.filter((t) => t.id !== task.id) } : p
        )
      );
      toast.success('Tugas berhasil dihapus.');
      onClose();
    } catch (e) {
      console.error('TaskDetailModal.handleConfirmDelete:', e);
      toast.error('Gagal menghapus tugas. Coba lagi.');
    } finally {
      deleting = false;
    }
  }

  function handleBackdrop(e: MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }
</script>

{#if open && task}
  <!-- Backdrop -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    role="dialog"
    aria-modal="true"
    aria-label="Detail tugas"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    onmousedown={handleBackdrop}
    onkeydown={handleKeydown}
  >
    <!-- Overlay -->
    <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

    <!-- Panel -->
    <div class="relative w-full max-w-lg bg-white rounded-2xl shadow-[var(--shadow-modal)] flex flex-col max-h-[90vh]">

      <!-- Header -->
      <div class="flex items-start gap-3 px-6 pt-5 pb-4 border-b border-[var(--line)] shrink-0">
        <div class="flex-1 min-w-0">
          <p class="text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider mb-1">
            {proj?.name ?? ''}
          </p>
          <h2 class="text-base font-bold text-[var(--ink)] leading-snug break-words">
            {task.title}
          </h2>
        </div>
        <button
          class="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--ink-faint)] hover:bg-[var(--card-soft)] hover:text-[var(--ink)] transition-colors shrink-0"
          onclick={onClose}
          aria-label="Tutup"
        >
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <!-- Body (scrollable) -->
      <div class="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5" style="max-height: calc(90vh - 140px);">

        <!-- Badges row: status, priority, category -->
        <div class="flex flex-wrap gap-2">
          {#if status}
            <Badge color={status.color} label={status.name} dot />
          {/if}
          {#if priority}
            <Badge color={priority.color} label={priority.name} />
          {/if}
          {#if category}
            <Badge color={category.color} label={category.name} />
          {/if}
          {#if overdue}
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--red-soft)] text-[var(--red)]">
              <i class="fa-solid fa-clock-rotate-left text-[10px]"></i>
              Terlambat
            </span>
          {/if}
        </div>

        <!-- Meta grid: due date, created at -->
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1">
            <span class="text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider">Tenggat</span>
            {#if task.due}
              <span class="text-sm font-medium {overdue ? 'text-[var(--red)]' : 'text-[var(--ink)]'}">
                <i class="fa-regular fa-calendar text-xs mr-1"></i>
                {formatDate(task.due)}
              </span>
            {:else}
              <span class="text-sm text-[var(--ink-faint)]">Tidak ada</span>
            {/if}
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider">Dibuat</span>
            <span class="text-sm text-[var(--ink)]">
              <i class="fa-regular fa-clock text-xs mr-1 text-[var(--ink-faint)]"></i>
              {formatDate(task.created_at)}
            </span>
          </div>
        </div>

        <!-- Tagged members -->
        {#if tagMembers.length > 0}
          <div class="flex flex-col gap-2">
            <span class="text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider">Anggota</span>
            <div class="flex flex-wrap gap-2">
              {#each tagMembers as member}
                <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--card-soft)] border border-[var(--line)]">
                  <Avatar name={member.name} color={member.color} size="sm" />
                  <span class="text-xs font-medium text-[var(--ink)]">{member.name}</span>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Description -->
        {#if task.description}
          <div class="flex flex-col gap-2">
            <span class="text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider">Deskripsi</span>
            <p class="text-sm text-[var(--ink)] leading-relaxed whitespace-pre-wrap break-words">
              {task.description}
            </p>
          </div>
        {/if}

        <!-- Link -->
        {#if task.link}
          <div class="flex flex-col gap-2">
            <span class="text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider">Tautan</span>
            <a
              href={task.link}
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--card-soft)] border border-[var(--line)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors group w-fit max-w-full"
            >
              <i class="fa-solid fa-arrow-up-right-from-square text-xs text-[var(--ink-faint)] group-hover:text-[var(--accent)]"></i>
              <span class="text-sm text-[var(--blue)] font-medium truncate group-hover:text-[var(--accent)]">
                {parseHostname(task.link)}
              </span>
            </a>
          </div>
        {/if}

        <!-- Images -->
        {#if task.images && task.images.length > 0}
          <div class="flex flex-col gap-2">
            <span class="text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider">
              Lampiran ({task.images.length})
            </span>
            <div class="grid grid-cols-3 gap-2">
              {#each task.images as img, i}
                <button
                  class="aspect-square rounded-xl overflow-hidden bg-[var(--card-soft)] border border-[var(--line)] hover:border-[var(--accent)] transition-colors"
                  onclick={() => (lightboxSrc = img)}
                  aria-label="Lihat gambar {i + 1}"
                >
                  <img src={img} alt="Lampiran {i + 1}" class="w-full h-full object-cover" />
                </button>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Empty state (no description, link, images) -->
        {#if !task.description && !task.link && (!task.images || task.images.length === 0)}
          <div class="flex flex-col items-center gap-2 py-4 text-center">
            <i class="fa-regular fa-file-lines text-2xl text-[var(--ink-faint)]"></i>
            <p class="text-sm text-[var(--ink-faint)]">Tidak ada deskripsi atau lampiran.</p>
          </div>
        {/if}

      </div>

      <!-- Footer actions -->
      <div class="flex items-center gap-3 px-6 py-4 border-t border-[var(--line)] shrink-0">
        <button
          class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-deep)] transition-colors shadow-[var(--shadow-accent)]"
          onclick={handleEdit}
          aria-label="Edit tugas"
        >
          <i class="fa-solid fa-pen text-xs"></i>
          Edit
        </button>
        <button
          class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[var(--line)] text-[var(--ink-soft)] text-sm font-semibold hover:bg-[var(--red-soft)] hover:text-[var(--red)] transition-colors"
          onclick={handleDeleteClick}
          disabled={deleting}
          aria-label="Hapus tugas"
        >
          <i class="fa-solid fa-trash text-xs"></i>
          Hapus
        </button>
      </div>
    </div>
  </div>
{/if}

<ConfirmDialog
  open={confirmOpen}
  title="Hapus tugas"
  message="Hapus tugas '{task?.title ?? ''}'? Tindakan ini tidak bisa dibatalkan."
  confirmText="Hapus"
  variant="danger"
  onConfirm={handleConfirmDelete}
  onCancel={() => (confirmOpen = false)}
/>

{#if lightboxSrc}
  <Lightbox src={lightboxSrc} onClose={() => (lightboxSrc = null)} />
{/if}
