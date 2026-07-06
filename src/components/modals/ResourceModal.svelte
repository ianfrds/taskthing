<script lang="ts">
  import { toast } from '$lib/stores/toast.store';
  import { createResource, updateResource } from '$lib/db/resources';
  import { activeProject, projects } from '$lib/stores/app.store';
  import type { Resource } from '$lib/types';

  interface Props {
    open: boolean;
    editResource?: Resource | null;
    onClose: () => void;
  }

  let { open, editResource = null, onClose }: Props = $props();

  let title = $state('');
  let url = $state('');
  let loading = $state(false);
  let error = $state('');

  $effect(() => {
    if (!open) return;
    error = '';
    if (editResource) {
      title = editResource.title;
      url = editResource.url;
    } else {
      title = '';
      url = '';
    }
  });

  async function handleSubmit() {
    if (!title.trim()) { error = 'Judul tidak boleh kosong.'; return; }
    if (!url.trim()) { error = 'URL tidak boleh kosong.'; return; }
    try { new URL(url.trim()); } catch { error = 'URL tidak valid.'; return; }

    const proj = $activeProject;
    if (!proj) return;

    loading = true;
    error = '';
    try {
      if (editResource) {
        const updated = await updateResource(editResource.id, { title: title.trim(), url: url.trim() });
        projects.update((list) =>
          list.map((p) =>
            p.id === proj.id
              ? { ...p, resources: p.resources.map((r) => (r.id === updated.id ? updated : r)) }
              : p
          )
        );
        toast.success('Tautan berhasil diperbarui.');
      } else {
        const created = await createResource(proj.id, { title: title.trim(), url: url.trim() });
        projects.update((list) =>
          list.map((p) =>
            p.id === proj.id ? { ...p, resources: [...p.resources, created] } : p
          )
        );
        toast.success('Tautan berhasil ditambahkan.');
      }
      onClose();
    } catch (e: unknown) {
      error = 'Gagal menyimpan tautan. Coba lagi.';
      console.error('ResourceModal.handleSubmit:', e);
    } finally {
      loading = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit();
  }
</script>

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="resource-modal-title"
    onkeydown={handleKeydown}
    onclick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div class="bg-white rounded-2xl shadow-[var(--shadow-modal)] w-full max-w-sm p-6 flex flex-col gap-5">
      <div class="flex items-center justify-between">
        <h2 id="resource-modal-title" class="text-base font-semibold text-[var(--ink)]">
          {editResource ? 'Edit tautan' : 'Tautan baru'}
        </h2>
        <button
          class="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--ink-faint)] hover:bg-[var(--card-soft)] transition-colors"
          onclick={onClose}
          aria-label="Tutup"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      {#if error}
        <div class="bg-[var(--red-soft)] text-[var(--red-deep)] text-sm px-3 py-2 rounded-lg">{error}</div>
      {/if}

      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-[var(--ink-soft)]" for="rs-title">Judul <span class="text-[var(--red)]">*</span></label>
          <input
            id="rs-title"
            type="text"
            class="w-full px-3 py-2 text-sm border border-[var(--line)] rounded-xl bg-[var(--card-soft)] text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
            bind:value={title}
            placeholder="Nama referensi atau dokumen"
            autofocus
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-[var(--ink-soft)]" for="rs-url">URL <span class="text-[var(--red)]">*</span></label>
          <input
            id="rs-url"
            type="url"
            class="w-full px-3 py-2 text-sm border border-[var(--line)] rounded-xl bg-[var(--card-soft)] text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
            bind:value={url}
            placeholder="https://..."
          />
        </div>
      </div>

      <div class="flex gap-3 pt-1">
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
          {loading ? 'Menyimpan...' : (editResource ? 'Simpan' : 'Simpan tautan')}
        </button>
      </div>
    </div>
  </div>
{/if}
