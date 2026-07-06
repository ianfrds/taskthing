<script lang="ts">
  import { activeProject, projects, editingTaskId } from '$lib/stores/app.store';
  import { createTask, updateTask } from '$lib/db/tasks';
  import { toast } from '$lib/stores/toast.store';
  import { compressImage } from '$lib/utils';
  import { COLORS } from '$lib/constants';
  import ColorPicker from '$components/ui/ColorPicker.svelte';
  import Avatar from '$components/ui/Avatar.svelte';
  import Lightbox from '$components/ui/Lightbox.svelte';
  import type { Task } from '$lib/types';

  interface Props {
    open: boolean;
    onClose: () => void;
  }

  let { open, onClose }: Props = $props();

  const proj = $derived($activeProject);
  const editTask = $derived(
    $editingTaskId ? proj?.todos.find((t) => t.id === $editingTaskId) ?? null : null
  );

  let title = $state('');
  let description = $state('');
  let statusId = $state<string | null>(null);
  let priorityId = $state<string | null>(null);
  let categoryId = $state<string | null>(null);
  let tagIds = $state<string[]>([]);
  let link = $state('');
  let due = $state('');
  let pendingImages = $state<string[]>([]);
  let loading = $state(false);
  let error = $state('');
  let lightboxSrc = $state<string | null>(null);

  $effect(() => {
    if (!open) return;
    error = '';
    if (editTask) {
      title = editTask.title;
      description = editTask.description;
      statusId = editTask.status_id;
      priorityId = editTask.priority_id;
      categoryId = editTask.category_id;
      tagIds = [...(editTask.tag_ids ?? [])];
      link = editTask.link ?? '';
      due = editTask.due ?? '';
      pendingImages = [...(editTask.images ?? [])];
    } else {
      title = '';
      description = '';
      statusId = proj?.statuses[0]?.id ?? null;
      priorityId = null;
      categoryId = null;
      tagIds = [];
      link = '';
      due = '';
      pendingImages = [];
    }
  });

  async function handleImageFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    for (const file of arr) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const compressed = await compressImage(file);
        pendingImages = [...pendingImages, compressed];
      } catch (e) {
        console.warn('TaskModal.handleImageFiles compress failed:', e);
        toast.error('Gagal memproses gambar.');
      }
    }
  }

  function toggleTag(id: string) {
    tagIds = tagIds.includes(id) ? tagIds.filter((x) => x !== id) : [...tagIds, id];
  }

  function removeImage(idx: number) {
    pendingImages = pendingImages.filter((_, i) => i !== idx);
  }

  async function handleSubmit() {
    if (!title.trim()) { error = 'Judul tugas tidak boleh kosong.'; return; }
    if (!proj) return;
    loading = true;
    error = '';
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        status_id: statusId,
        priority_id: proj.disable_priorities ? null : priorityId,
        category_id: proj.disable_categories ? null : categoryId,
        tag_ids: tagIds,
        link: link.trim(),
        images: pendingImages,
        due: due || null,
      };

      if (editTask) {
        const updated = await updateTask(editTask.id, payload);
        projects.update((list) =>
          list.map((p) =>
            p.id === proj.id
              ? { ...p, todos: p.todos.map((t) => (t.id === updated.id ? updated : t)) }
              : p
          )
        );
        toast.success('Tugas berhasil diperbarui.');
      } else {
        const created = await createTask(proj.id, payload);
        projects.update((list) =>
          list.map((p) =>
            p.id === proj.id ? { ...p, todos: [...p.todos, created] } : p
          )
        );
        toast.success('Tugas baru berhasil dibuat.');
      }
      onClose();
    } catch (e: unknown) {
      error = 'Gagal menyimpan tugas. Coba lagi.';
      console.error('TaskModal.handleSubmit:', e);
    } finally {
      loading = false;
    }
  }

  function handlePaste(e: ClipboardEvent) {
    if (!open) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) { handleImageFiles([file]); e.preventDefault(); toast.success('Gambar ditempel.'); }
        break;
      }
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit();
  }
</script>

<svelte:window onpaste={handlePaste} />

{#if open && proj}
  <div
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="task-modal-title"
    onkeydown={handleKeydown}
    onclick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div class="bg-white rounded-t-2xl sm:rounded-2xl shadow-[var(--shadow-modal)] w-full sm:max-w-lg max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-[var(--line)] shrink-0">
        <h2 id="task-modal-title" class="text-base font-semibold text-[var(--ink)]">
          {editTask ? 'Edit tugas' : 'Tugas baru'}
        </h2>
        <button
          class="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--ink-faint)] hover:bg-[var(--card-soft)] transition-colors"
          onclick={onClose}
          aria-label="Tutup"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
        {#if error}
          <div class="bg-[var(--red-soft)] text-[var(--red-deep)] text-sm px-3 py-2 rounded-lg">{error}</div>
        {/if}

        <!-- Title -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-[var(--ink-soft)]" for="td-title">Judul <span class="text-[var(--red)]">*</span></label>
          <input
            id="td-title"
            type="text"
            class="w-full px-3 py-2 text-sm border border-[var(--line)] rounded-xl bg-[var(--card-soft)] text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
            bind:value={title}
            placeholder="Nama tugas"
            autofocus
          />
        </div>

        <!-- Description -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-[var(--ink-soft)]" for="td-desc">Deskripsi</label>
          <textarea
            id="td-desc"
            class="w-full px-3 py-2 text-sm border border-[var(--line)] rounded-xl bg-[var(--card-soft)] text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
            bind:value={description}
            placeholder="Detail, catatan, atau konteks tugas..."
            rows="3"
          ></textarea>
        </div>

        <!-- Status + Due date row -->
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-[var(--ink-soft)]" for="td-status">Status</label>
            <select
              id="td-status"
              class="w-full px-3 py-2 text-sm border border-[var(--line)] rounded-xl bg-[var(--card-soft)] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              bind:value={statusId}
            >
              <option value={null}>— Pilih status</option>
              {#each proj.statuses as s}
                <option value={s.id}>{s.name}</option>
              {/each}
            </select>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-[var(--ink-soft)]" for="td-due">Tenggat</label>
            <input
              id="td-due"
              type="date"
              class="w-full px-3 py-2 text-sm border border-[var(--line)] rounded-xl bg-[var(--card-soft)] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              bind:value={due}
            />
          </div>
        </div>

        <!-- Priority + Category row -->
        {#if !proj.disable_priorities || !proj.disable_categories}
          <div class="grid grid-cols-2 gap-3">
            {#if !proj.disable_priorities}
              <div class="flex flex-col gap-1">
                <label class="text-xs font-medium text-[var(--ink-soft)]" for="td-priority">Prioritas</label>
                <select
                  id="td-priority"
                  class="w-full px-3 py-2 text-sm border border-[var(--line)] rounded-xl bg-[var(--card-soft)] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  bind:value={priorityId}
                >
                  <option value={null}>— Pilih prioritas</option>
                  {#each proj.priorities as p}
                    <option value={p.id}>{p.name}</option>
                  {/each}
                </select>
              </div>
            {/if}
            {#if !proj.disable_categories}
              <div class="flex flex-col gap-1">
                <label class="text-xs font-medium text-[var(--ink-soft)]" for="td-category">Kategori</label>
                <select
                  id="td-category"
                  class="w-full px-3 py-2 text-sm border border-[var(--line)] rounded-xl bg-[var(--card-soft)] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  bind:value={categoryId}
                >
                  <option value={null}>— Pilih kategori</option>
                  {#each proj.categories as c}
                    <option value={c.id}>{c.name}</option>
                  {/each}
                </select>
              </div>
            {/if}
          </div>
        {/if}

        <!-- Tags (members) -->
        {#if proj.members.length > 0}
          <div class="flex flex-col gap-1.5">
            <span class="text-xs font-medium text-[var(--ink-soft)]">Tag anggota</span>
            <div class="flex flex-wrap gap-2">
              {#each proj.members as m}
                <button
                  type="button"
                  class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border-2 transition-colors {tagIds.includes(m.id) ? 'border-transparent text-white' : 'border-[var(--line)] text-[var(--ink-soft)] bg-transparent hover:border-[var(--line-strong)]'}"
                  style={tagIds.includes(m.id) ? `background:${m.color};border-color:${m.color};` : ''}
                  onclick={() => toggleTag(m.id)}
                  aria-pressed={tagIds.includes(m.id)}
                >
                  <Avatar name={m.name} color={m.color} size="sm" />
                  {m.name}
                </button>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Link -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-[var(--ink-soft)]" for="td-link">Tautan</label>
          <input
            id="td-link"
            type="url"
            class="w-full px-3 py-2 text-sm border border-[var(--line)] rounded-xl bg-[var(--card-soft)] text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            bind:value={link}
            placeholder="https://..."
          />
        </div>

        <!-- Images -->
        <div class="flex flex-col gap-1.5">
          <span class="text-xs font-medium text-[var(--ink-soft)]">Gambar</span>
          {#if pendingImages.length > 0}
            <div class="grid grid-cols-3 gap-2">
              {#each pendingImages as img, i}
                <div class="relative group rounded-xl overflow-hidden aspect-square bg-[var(--card-soft)]">
                  <img
                    src={img}
                    alt="Lampiran {i + 1}"
                    class="w-full h-full object-cover cursor-zoom-in"
                    onclick={() => (lightboxSrc = img)}
                  />
                  <button
                    class="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onclick={() => removeImage(i)}
                    aria-label="Hapus gambar"
                  >
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
              {/each}
            </div>
          {/if}
          <label
            class="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-[var(--line-strong)] text-xs text-[var(--ink-faint)] hover:border-[var(--accent)] hover:text-[var(--accent)] cursor-pointer transition-colors"
          >
            <i class="fa-solid fa-image"></i>
            Tambah gambar atau tempel (Ctrl+V)
            <input
              type="file"
              class="sr-only"
              accept="image/*"
              multiple
              onchange={(e) => { const t = e.target as HTMLInputElement; if (t.files) handleImageFiles(t.files); }}
            />
          </label>
          {#if pendingImages.length > 0}
            <button
              type="button"
              class="text-xs text-[var(--ink-faint)] hover:text-[var(--red)] text-left transition-colors"
              onclick={() => (pendingImages = [])}
            >
              <i class="fa-solid fa-trash text-[10px]"></i> Hapus semua gambar
            </button>
          {/if}
        </div>
      </div>

      <!-- Footer -->
      <div class="flex gap-3 px-6 py-4 border-t border-[var(--line)] shrink-0">
        <button
          class="flex-1 py-2.5 rounded-xl border border-[var(--line)] text-[var(--ink-soft)] text-sm font-medium hover:bg-[var(--card-soft)] transition-colors"
          onclick={onClose}
        >
          Batal
        </button>
        <button
          class="flex-1 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-deep)] transition-colors shadow-[var(--shadow-accent)] disabled:opacity-60"
          onclick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Menyimpan...' : (editTask ? 'Simpan perubahan' : 'Buat tugas')}
        </button>
      </div>
    </div>
  </div>
{/if}

{#if lightboxSrc}
  <Lightbox src={lightboxSrc} onClose={() => (lightboxSrc = null)} />
{/if}
