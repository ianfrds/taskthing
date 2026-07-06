<script lang="ts">
  import { searchQuery, projects } from '$lib/stores/app.store';
  import { deleteResource } from '$lib/db/resources';
  import { toast } from '$lib/stores/toast.store';
  import { parseHostname } from '$lib/utils';
  import EmptyState from '$components/ui/EmptyState.svelte';
  import ConfirmDialog from '$components/ui/ConfirmDialog.svelte';
  import type { Project, Resource } from '$lib/types';

  interface Props {
    project: Project;
    isOwner?: boolean;
    onAddResource?: () => void;
    onEditResource?: (resource: Resource) => void;
  }

  let { project, isOwner = true, onAddResource, onEditResource }: Props = $props();

  const q = $derived($searchQuery);
  const filtered = $derived(
    q ? project.resources.filter((r) => r.title.toLowerCase().includes(q)) : project.resources
  );

  let confirmResource = $state<Resource | null>(null);
  let detailResource = $state<Resource | null>(null);

  async function handleDelete() {
    if (!confirmResource) return;
    const res = confirmResource;
    confirmResource = null;
    try {
      await deleteResource(res.id);
      projects.update((list) =>
        list.map((p) =>
          p.id === project.id
            ? { ...p, resources: p.resources.filter((r) => r.id !== res.id) }
            : p
        )
      );
      toast.success('Tautan berhasil dihapus.');
    } catch (e) {
      console.error('ResourcesTab.handleDelete:', e);
      toast.error('Gagal menghapus tautan. Coba lagi.');
    }
  }

  function handleEdit(res: Resource) {
    detailResource = null;
    onEditResource?.(res);
  }
</script>

<!-- Main card -->
<div class="bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden">
  <!-- Header -->
  <div class="flex items-center justify-between px-6 py-4 border-b border-[var(--line)]">
    <div>
      <h3 class="text-base font-semibold text-[var(--ink)] flex items-center gap-2">
        <i class="fa-solid fa-link text-[var(--accent)]"></i>
        Tautan & Referensi
      </h3>
      <p class="text-sm text-[var(--ink-faint)] mt-0.5">{project.resources.length} tautan tersimpan</p>
    </div>
    {#if isOwner}
      <button
        class="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-deep)] transition-colors shadow-[var(--shadow-accent)]"
        onclick={onAddResource}
      >
        <i class="fa-solid fa-plus text-xs"></i>
        Tambah tautan
      </button>
    {/if}
  </div>

  {#if filtered.length === 0}
    <EmptyState
      icon="book-bookmark"
      title="Belum ada tautan"
      description={q ? 'Tidak ada tautan yang cocok dengan pencarian.' : 'Simpan link referensi, dokumen, atau tools yang dipakai tim di proyek ini.'}
      ctaLabel={!q && isOwner ? 'Tambah tautan pertama' : undefined}
      onCta={!q && isOwner ? onAddResource : undefined}
    />
  {:else}
    <div class="divide-y divide-[var(--line)]">
      {#each filtered as resource}
        <div
          class="flex items-center gap-4 px-6 py-4 hover:bg-[var(--card-soft)] transition-colors group cursor-pointer"
          onclick={() => (detailResource = resource)}
          role="button"
          tabindex="0"
          onkeydown={(e) => e.key === 'Enter' && (detailResource = resource)}
          aria-label="Lihat detail {resource.title}"
        >
          <!-- Icon -->
          <div class="w-10 h-10 rounded-xl bg-[var(--card-soft)] border border-[var(--line)] flex items-center justify-center shrink-0">
            <i class="fa-solid fa-link text-sm text-[var(--ink-faint)]"></i>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-[var(--ink)] truncate">{resource.title}</p>
            <p class="text-xs text-[var(--blue)] truncate mt-0.5">{parseHostname(resource.url)}</p>
          </div>

          <!-- Actions -->
          <div
            class="flex items-center gap-1 shrink-0"
            onclick={(e) => e.stopPropagation()}
            role="presentation"
          >
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--ink-faint)] hover:bg-[var(--blue-soft)] hover:text-[var(--blue)] transition-colors"
              aria-label="Buka tautan"
            >
              <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
            </a>
            {#if isOwner}
              <button
                class="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--ink-faint)] hover:bg-[var(--card-soft)] hover:text-[var(--ink)] transition-colors"
                onclick={() => handleEdit(resource)}
                aria-label="Edit tautan"
              >
                <i class="fa-solid fa-pen text-xs"></i>
              </button>
              <button
                class="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--ink-faint)] hover:bg-[var(--red-soft)] hover:text-[var(--red)] transition-colors"
                onclick={() => (confirmResource = resource)}
                aria-label="Hapus tautan"
              >
                <i class="fa-solid fa-trash text-xs"></i>
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Detail Modal -->
{#if detailResource}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-label="Detail tautan"
    onmousedown={(e) => { if (e.target === e.currentTarget) detailResource = null; }}
    onkeydown={(e) => e.key === 'Escape' && (detailResource = null)}
  >
    <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
    <div class="relative w-full max-w-md bg-white rounded-2xl shadow-[var(--shadow-modal)] overflow-hidden">
      <!-- Header -->
      <div class="flex items-start gap-4 px-6 pt-5 pb-4 border-b border-[var(--line)]">
        <div class="w-11 h-11 rounded-xl bg-[var(--card-soft)] border border-[var(--line)] flex items-center justify-center shrink-0">
          <i class="fa-solid fa-link text-lg text-[var(--ink-faint)]"></i>
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="text-base font-bold text-[var(--ink)] break-words">{detailResource.title}</h2>
          <p class="text-sm text-[var(--blue)] truncate mt-0.5">{parseHostname(detailResource.url)}</p>
        </div>
        <button
          class="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--ink-faint)] hover:bg-[var(--card-soft)] hover:text-[var(--ink)] transition-colors shrink-0"
          onclick={() => (detailResource = null)}
          aria-label="Tutup"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="px-6 py-5 flex flex-col gap-4">
        <div>
          <p class="text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wider mb-1.5">URL</p>
          <a
            href={detailResource.url}
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--card-soft)] border border-[var(--line)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors group"
          >
            <i class="fa-solid fa-arrow-up-right-from-square text-sm text-[var(--ink-faint)] group-hover:text-[var(--accent)]"></i>
            <span class="text-sm text-[var(--blue)] group-hover:text-[var(--accent)] truncate">{detailResource.url}</span>
          </a>
        </div>
      </div>

      <!-- Footer actions -->
      <div class="flex gap-3 px-6 pb-5">
        <a
          href={detailResource.url}
          target="_blank"
          rel="noopener noreferrer"
          class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-deep)] transition-colors shadow-[var(--shadow-accent)]"
        >
          <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
          Buka tautan
        </a>
        {#if isOwner}
          <button
            class="w-10 h-10 rounded-xl flex items-center justify-center border border-[var(--line)] text-[var(--ink-faint)] hover:bg-[var(--card-soft)] hover:text-[var(--ink)] transition-colors"
            onclick={() => handleEdit(detailResource!)}
            aria-label="Edit"
          >
            <i class="fa-solid fa-pen text-sm"></i>
          </button>
          <button
            class="w-10 h-10 rounded-xl flex items-center justify-center border border-[var(--line)] text-[var(--ink-faint)] hover:bg-[var(--red-soft)] hover:text-[var(--red)] transition-colors"
            onclick={() => { confirmResource = detailResource; detailResource = null; }}
            aria-label="Hapus"
          >
            <i class="fa-solid fa-trash text-sm"></i>
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}

<ConfirmDialog
  open={!!confirmResource}
  title="Hapus tautan"
  message="Hapus tautan '{confirmResource?.title}'? Tindakan ini tidak bisa dibatalkan."
  confirmText="Hapus"
  variant="danger"
  onConfirm={handleDelete}
  onCancel={() => (confirmResource = null)}
/>
