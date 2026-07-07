<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchArchivedProjects, restoreProject, deleteProject } from '$lib/db/projects';
  import { toast } from '$lib/stores/toast.store';
  import { logActivity } from '$lib/supabase';
  import type { Project } from '$lib/types';
  import EmptyState from '$components/ui/EmptyState.svelte';
  import ConfirmDialog from '$components/ui/ConfirmDialog.svelte';

  let archivedProjects = $state<Project[]>([]);
  let loading = $state(true);
  let confirmOpen = $state(false);
  let confirmId = $state<string | null>(null);
  let confirmName = $state('');
  let confirmType = $state<'restore' | 'delete'>('restore');

  onMount(async () => {
    await load();
  });

  async function load() {
    loading = true;
    try {
      archivedProjects = await fetchArchivedProjects();
    } catch {
      toast.error('Gagal memuat arsip proyek.');
    } finally {
      loading = false;
    }
  }

  function openConfirm(type: 'restore' | 'delete', id: string, name: string) {
    confirmType = type;
    confirmId = id;
    confirmName = name;
    confirmOpen = true;
  }

  async function handleConfirm() {
    if (!confirmId) return;
    confirmOpen = false;
    try {
      if (confirmType === 'restore') {
        await restoreProject(confirmId);
        await logActivity('project_restored', confirmId, { project_name: confirmName });
        toast.success(`Proyek "${confirmName}" berhasil dipulihkan.`);
      } else {
        await deleteProject(confirmId);
        await logActivity('project_deleted', confirmId, { project_name: confirmName });
        toast.success(`Proyek "${confirmName}" berhasil dihapus permanen.`);
      }
      archivedProjects = archivedProjects.filter((p) => p.id !== confirmId);
    } catch {
      toast.error('Terjadi kesalahan. Coba lagi.');
    } finally {
      confirmId = null;
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }
</script>

<svelte:head>
  <title>Arsip — TaskThing</title>
</svelte:head>

<div class="flex flex-col gap-4">
  <!-- Header -->
  <div>
    <h1 class="text-xl font-bold text-[var(--ink)]" style="font-family:'Space Grotesk',sans-serif;">Arsip</h1>
    <p class="text-sm text-[var(--ink-soft)] mt-0.5">Proyek yang sudah diarsipkan</p>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-20 text-[var(--ink-faint)]">
      <i class="fa-solid fa-spinner fa-spin mr-2"></i> Memuat...
    </div>
  {:else if archivedProjects.length === 0}
    <EmptyState
      icon="box-archive"
      title="Arsip kosong"
      description="Belum ada proyek yang diarsipkan."
    />
  {:else}
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {#each archivedProjects as project}
        <div class="bg-white rounded-xl border border-[var(--line)] p-4 flex flex-col gap-3 shadow-sm">
          <!-- Project info -->
          <div class="flex items-start gap-3">
            <div
              class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-sm"
              style="background:{project.color}18; color:{project.color};"
            >
              <i class="fa-solid fa-folder"></i>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-semibold text-[var(--ink)] truncate">{project.name}</h3>
              {#if project.description}
                <p class="text-xs text-[var(--ink-soft)] mt-0.5 line-clamp-2">{project.description}</p>
              {/if}
              <p class="text-[10px] text-[var(--ink-faint)] mt-1">
                Dibuat {formatDate(project.created_at)}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 pt-1 border-t border-[var(--line)]">
            <button
              class="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold
                bg-[var(--accent)] text-white hover:bg-[var(--accent-deep)] transition-colors"
              onclick={() => openConfirm('restore', project.id, project.name)}
            >
              <i class="fa-solid fa-rotate-left text-[10px]"></i>
              Pulihkan
            </button>
            <button
              class="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              onclick={() => openConfirm('delete', project.id, project.name)}
            >
              <i class="fa-solid fa-trash text-[10px]"></i>
              Hapus
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<ConfirmDialog
  open={confirmOpen}
  title={confirmType === 'restore' ? 'Pulihkan proyek' : 'Hapus proyek permanen'}
  message={confirmType === 'restore'
    ? `Pulihkan proyek "${confirmName}"? Proyek akan muncul kembali di sidebar.`
    : `Hapus permanen proyek "${confirmName}"? Seluruh data akan hilang dan tidak bisa dikembalikan.`}
  confirmText={confirmType === 'restore' ? 'Pulihkan' : 'Hapus Permanen'}
  variant={confirmType === 'restore' ? 'info' : 'danger'}
  onConfirm={handleConfirm}
  onCancel={() => (confirmOpen = false)}
/>
