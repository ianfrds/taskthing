<script lang="ts">
  import { projects, activeMasterType, editingMasterId, modals } from '$lib/stores/app.store';
  import { deleteStatus, reorderStatuses } from '$lib/db/statuses';
  import { deleteCategory, reorderCategories } from '$lib/db/categories';
  import { deletePriority, reorderPriorities } from '$lib/db/priorities';
  import { updateProject } from '$lib/db/projects';
  import { toast } from '$lib/stores/toast.store';
  import { SETTINGS_TYPES, MASTER_CONFIG } from '$lib/constants';
  import ConfirmDialog from '$components/ui/ConfirmDialog.svelte';
  import type { Project, MasterType, Status, Category, Priority } from '$lib/types';

  interface Props {
    project: Project;
  }

  let { project }: Props = $props();

  let confirmItem = $state<{ id: string; label: string; type: MasterType } | null>(null);

  // Drag state
  let dragType = $state<MasterType | null>(null);
  let dragId = $state<string | null>(null);
  let dragOverId = $state<string | null>(null);

  function openAdd(type: MasterType) {
    activeMasterType.set(type);
    editingMasterId.set(null);
    modals.update((m) => ({ ...m, master: true }));
  }

  function openEdit(type: MasterType, id: string) {
    activeMasterType.set(type);
    editingMasterId.set(id);
    modals.update((m) => ({ ...m, master: true }));
  }

  async function handleDelete() {
    if (!confirmItem) return;
    const { id, type } = confirmItem;
    confirmItem = null;
    const cfg = MASTER_CONFIG[type];
    const list = project[cfg.field] as Array<{ id: string }>;
    const remaining = list.filter((x) => x.id !== id);
    const fallbackId = cfg.minKeep > 0 && remaining.length > 0 ? remaining[0].id : null;

    try {
      if (type === 'status') await deleteStatus(id, fallbackId);
      else if (type === 'category') await deleteCategory(id, fallbackId);
      else if (type === 'priority') await deletePriority(id, fallbackId);

      projects.update((list) =>
        list.map((p) => {
          if (p.id !== project.id) return p;
          return { ...p, [cfg.field]: (p[cfg.field] as Array<{ id: string }>).filter((x) => x.id !== id) };
        })
      );
      toast.success(`${cfg.label} berhasil dihapus.`);
    } catch (e) {
      console.error('SettingsTab.handleDelete:', e);
      toast.error(`Gagal menghapus ${cfg.label.toLowerCase()}.`);
    }
  }

  async function toggleFeature(feature: 'categories' | 'priorities') {
    const key = feature === 'categories' ? 'disable_categories' : 'disable_priorities';
    const newVal = !project[key];
    try {
      await updateProject(project.id, { [key]: newVal });
      projects.update((list) =>
        list.map((p) => (p.id === project.id ? { ...p, [key]: newVal } : p))
      );
    } catch (e) {
      console.error('SettingsTab.toggleFeature:', e);
      toast.error('Gagal mengubah pengaturan.');
    }
  }

  // ── Drag to reorder ──────────────────────────────────────────
  function handleDragStart(type: MasterType, id: string) {
    dragType = type;
    dragId = id;
  }

  function handleDragOver(e: DragEvent, id: string) {
    e.preventDefault();
    dragOverId = id;
  }

  function handleDragLeave() {
    dragOverId = null;
  }

  async function handleDrop(type: MasterType, targetId: string) {
    if (!dragId || dragId === targetId || dragType !== type) {
      dragId = null; dragOverId = null; dragType = null;
      return;
    }

    const cfg = MASTER_CONFIG[type];
    const items = [...(project[cfg.field] as Array<{ id: string; sort_order: number }>)]
      .sort((a, b) => a.sort_order - b.sort_order);

    const fromIdx = items.findIndex((x) => x.id === dragId);
    const toIdx = items.findIndex((x) => x.id === targetId);
    if (fromIdx === -1 || toIdx === -1) { dragId = null; dragOverId = null; dragType = null; return; }

    // Reorder array
    const reordered = [...items];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    // Assign new sort_order
    const updated = reordered.map((item, i) => ({ ...item, sort_order: i }));
    const payload = updated.map((x) => ({ id: x.id, sort_order: x.sort_order }));

    // Optimistic update
    projects.update((list) =>
      list.map((p) => {
        if (p.id !== project.id) return p;
        return { ...p, [cfg.field]: updated };
      })
    );

    try {
      if (type === 'status') await reorderStatuses(payload);
      else if (type === 'category') await reorderCategories(payload);
      else if (type === 'priority') await reorderPriorities(payload);
    } catch (e) {
      console.error('SettingsTab.handleDrop:', e);
      toast.error('Gagal menyimpan urutan.');
    } finally {
      dragId = null; dragOverId = null; dragType = null;
    }
  }

  function getUsageCount(type: MasterType, id: string): number {
    const fkField = MASTER_CONFIG[type].fkField as keyof typeof project.todos[0];
    return project.todos.filter((t) => t[fkField] === id).length;
  }
</script>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
  {#each SETTINGS_TYPES as type}
    {@const cfg = MASTER_CONFIG[type]}
    {@const items = ([...project[cfg.field] as Array<{ id: string; name: string; color: string; sort_order: number }>])
      .sort((a, b) => a.sort_order - b.sort_order)}
    {@const isDisabled = (type === 'category' && project.disable_categories) || (type === 'priority' && project.disable_priorities)}

    <div class="bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden flex flex-col">
      <!-- Section header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--line)]">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-[var(--card-soft)] flex items-center justify-center">
            <i class="fa-solid {cfg.icon} text-sm text-[var(--ink-soft)]"></i>
          </div>
          <div>
            <p class="text-sm font-semibold text-[var(--ink)]">{cfg.label}</p>
            <p class="text-xs text-[var(--ink-faint)]">{items.length} item</p>
          </div>
        </div>
        {#if type !== 'status'}
          <button
            class="relative w-9 h-5 rounded-full transition-colors {isDisabled ? 'bg-[var(--line)]' : 'bg-[var(--accent)]'}"
            onclick={() => toggleFeature(type === 'category' ? 'categories' : 'priorities')}
            aria-label="Toggle {cfg.label}"
            title={isDisabled ? 'Aktifkan' : 'Nonaktifkan'}
          >
            <span
              class="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all {isDisabled ? 'left-0.5' : 'left-[18px]'}"
            ></span>
          </button>
        {/if}
      </div>

      <!-- Sub label -->
      <div class="px-5 pt-3 pb-1">
        <p class="text-xs text-[var(--ink-faint)] leading-relaxed">{cfg.sub}</p>
        {#if !isDisabled}
          <p class="text-[10px] text-[var(--ink-faint)] mt-1.5 flex items-center gap-1">
            <i class="fa-solid fa-grip-dots-vertical text-[9px]"></i>
            Drag untuk mengubah urutan
          </p>
        {/if}
      </div>

      <!-- Items list -->
      <div class="px-4 py-2 flex flex-col gap-1 flex-1 {isDisabled ? 'opacity-50 pointer-events-none' : ''}">
        {#if items.length === 0}
          <div class="flex flex-col items-center gap-2 py-6 text-center">
            <i class="fa-solid {cfg.icon} text-2xl text-[var(--ink-faint)]"></i>
            <p class="text-xs text-[var(--ink-faint)]">Belum ada {cfg.label.toLowerCase()}.</p>
          </div>
        {:else}
          {#each items as item (item.id)}
            {@const count = getUsageCount(type, item.id)}
            {@const isDragOver = dragOverId === item.id && dragType === type && dragId !== item.id}
            <div
              draggable="true"
              ondragstart={() => handleDragStart(type, item.id)}
              ondragover={(e) => handleDragOver(e, item.id)}
              ondragleave={handleDragLeave}
              ondrop={() => handleDrop(type, item.id)}
              ondragend={() => { dragId = null; dragOverId = null; dragType = null; }}
              class="flex items-center gap-2.5 group px-3 py-2.5 rounded-xl transition-all cursor-grab active:cursor-grabbing
                {dragId === item.id ? 'opacity-40' : ''}
                {isDragOver ? 'border-2 border-[var(--accent)] bg-[var(--accent-soft)]' : 'hover:bg-[var(--card-soft)] border-2 border-transparent'}"
            >
              <!-- Drag handle -->
              <i class="fa-solid fa-grip-dots-vertical text-sm text-[var(--ink-soft)] shrink-0 mr-1"></i>
              <!-- Color dot -->
              <span class="w-3 h-3 rounded-full shrink-0" style="background:{item.color};"></span>
              <!-- Name -->
              <span class="flex-1 text-sm font-medium text-[var(--ink)] truncate">{item.name}</span>
              <!-- Usage count -->
              <span class="text-xs text-[var(--ink-faint)] bg-[var(--card-soft)] px-2 py-0.5 rounded-full shrink-0">{count}</span>
              <!-- Actions -->
              <div class="flex gap-1 shrink-0">
                <button
                  class="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--ink-faint)] hover:bg-white hover:text-[var(--ink)] transition-colors"
                  onclick={() => openEdit(type, item.id)}
                  aria-label="Edit {item.name}"
                >
                  <i class="fa-solid fa-pen text-[10px]"></i>
                </button>
                {#if items.length > cfg.minKeep}
                  <button
                    class="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--ink-faint)] hover:bg-[var(--red-soft)] hover:text-[var(--red)] transition-colors"
                    onclick={() => (confirmItem = { id: item.id, label: item.name, type })}
                    aria-label="Hapus {item.name}"
                  >
                    <i class="fa-solid fa-trash text-[10px]"></i>
                  </button>
                {/if}
              </div>
            </div>
          {/each}
        {/if}
      </div>

      <!-- Add button -->
      <div class="px-4 pb-4 pt-1">
        <button
          class="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-[var(--line-strong)] text-xs font-medium text-[var(--ink-faint)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          onclick={() => openAdd(type)}
          disabled={isDisabled}
        >
          <i class="fa-solid fa-plus text-[10px]"></i>
          Tambah {cfg.label.toLowerCase()}
        </button>
      </div>
    </div>
  {/each}
</div>

<ConfirmDialog
  open={!!confirmItem}
  title="Hapus {confirmItem?.label ?? 'item'}"
  message="Hapus '{confirmItem?.label}'? Tugas yang menggunakan ini akan kehilangan referensinya."
  confirmText="Hapus"
  variant="danger"
  onConfirm={handleDelete}
  onCancel={() => (confirmItem = null)}
/>
