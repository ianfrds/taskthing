<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchActivityLog } from '$lib/supabase';
  import { projects } from '$lib/stores/app.store';
  import type { ActivityLog } from '$lib/types';
  import EmptyState from '$components/ui/EmptyState.svelte';

  let activities = $state<ActivityLog[]>([]);
  let loading = $state(true);
  let filterProjectId = $state('all');

  const ACTION_LABELS: Record<string, { label: string; icon: string; color: string }> = {
    project_created:   { label: 'Membuat proyek',      icon: 'folder-plus',       color: '#4B7FC9' },
    project_updated:   { label: 'Memperbarui proyek',  icon: 'pen',               color: '#F0A93C' },
    project_archived:  { label: 'Mengarsipkan proyek', icon: 'box-archive',       color: '#A06CD5' },
    project_restored:  { label: 'Memulihkan proyek',   icon: 'rotate-left',       color: '#3FA66C' },
    project_deleted:   { label: 'Menghapus proyek',    icon: 'trash',             color: '#E56C9C' },
    task_created:      { label: 'Membuat tugas',       icon: 'plus-circle',       color: '#4B7FC9' },
    task_updated:      { label: 'Memperbarui tugas',   icon: 'pen-to-square',     color: '#F0A93C' },
    task_deleted:      { label: 'Menghapus tugas',     icon: 'circle-minus',      color: '#E56C9C' },
    member_added:      { label: 'Menambah anggota',    icon: 'user-plus',         color: '#3FA66C' },
    member_removed:    { label: 'Menghapus anggota',   icon: 'user-minus',        color: '#E56C9C' },
    resource_added:    { label: 'Menambah resource',   icon: 'link',              color: '#4B7FC9' },
    resource_removed:  { label: 'Menghapus resource',  icon: 'link-slash',        color: '#E56C9C' },
  };

  onMount(async () => {
    loading = true;
    activities = await fetchActivityLog(100);
    loading = false;
  });

  const filtered = $derived(() => {
    if (filterProjectId === 'all') return activities;
    return activities.filter((a) => a.project_id === filterProjectId);
  });

  function getActionInfo(action: string) {
    return ACTION_LABELS[action] ?? { label: action, icon: 'circle-dot', color: 'var(--ink-soft)' };
  }

  function getProjectName(projectId: string | null) {
    if (!projectId) return null;
    const proj = $projects.find((p) => p.id === projectId);
    return proj?.name ?? (activities.find((a) => a.project_id === projectId)?.meta?.project_name as string) ?? null;
  }

  function getProjectColor(projectId: string | null) {
    if (!projectId) return 'var(--ink-faint)';
    const proj = $projects.find((p) => p.id === projectId);
    return proj?.color ?? 'var(--ink-faint)';
  }

  function formatRelative(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Baru saja';
    if (mins < 60) return `${mins} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    if (days < 7) return `${days} hari lalu`;
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // Group by date
  const grouped = $derived(() => {
    const map = new Map<string, ActivityLog[]>();
    for (const a of filtered()) {
      const key = new Date(a.created_at).toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return Array.from(map.entries());
  });
</script>

<svelte:head>
  <title>Aktivitas — TaskThing</title>
</svelte:head>

<div class="flex flex-col gap-4">
  <!-- Header -->
  <div class="flex items-center justify-between flex-wrap gap-3">
    <div>
      <h1 class="text-xl font-bold text-[var(--ink)]" style="font-family:'Space Grotesk',sans-serif;">Aktivitas</h1>
      <p class="text-sm text-[var(--ink-soft)] mt-0.5">Riwayat semua aksi yang kamu lakukan</p>
    </div>
    <!-- Project filter -->
    <select
      bind:value={filterProjectId}
      class="px-3 py-2 text-xs font-medium border border-[var(--line)] rounded-lg bg-white text-[var(--ink)] outline-none cursor-pointer"
    >
      <option value="all">Semua proyek</option>
      {#each $projects as p}
        <option value={p.id}>{p.name}</option>
      {/each}
    </select>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-20 text-[var(--ink-faint)]">
      <i class="fa-solid fa-spinner fa-spin mr-2"></i> Memuat aktivitas...
    </div>
  {:else if grouped().length === 0}
    <EmptyState
      icon="clock-rotate-left"
      title="Belum ada aktivitas"
      description="Aktivitas akan muncul setelah kamu mulai bekerja."
    />
  {:else}
    <div class="flex flex-col gap-6">
      {#each grouped() as [dateLabel, items]}
        <div class="flex flex-col gap-1">
          <!-- Date label -->
          <p class="text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-widest px-1 mb-1">{dateLabel}</p>

          <!-- Activity cards -->
          <div class="bg-white rounded-xl border border-[var(--line)] divide-y divide-[var(--line)] shadow-sm overflow-hidden">
            {#each items as activity}
              {@const info = getActionInfo(activity.action)}
              {@const projectName = getProjectName(activity.project_id)}
              {@const projectColor = getProjectColor(activity.project_id)}
              <div class="flex items-center gap-3 px-4 py-3 hover:bg-[var(--card-soft)] transition-colors">
                <!-- Icon -->
                <div
                  class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style="background:{info.color}18; color:{info.color};"
                >
                  <i class="fa-solid fa-{info.icon} text-xs"></i>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-[var(--ink)]">
                    <span class="font-semibold">{info.label}</span>
                    {#if activity.meta?.task_title}
                      <span class="text-[var(--ink-soft)]"> — </span>
                      <span class="text-[var(--ink-soft)]">"{activity.meta.task_title}"</span>
                    {:else if activity.meta?.project_name && !projectName}
                      <span class="text-[var(--ink-soft)]"> — </span>
                      <span class="text-[var(--ink-soft)]">"{activity.meta.project_name}"</span>
                    {/if}
                  </p>
                  {#if projectName}
                    <p class="text-xs mt-0.5 flex items-center gap-1">
                      <i class="fa-solid fa-folder text-[9px]" style="color:{projectColor};"></i>
                      <span class="text-[var(--ink-soft)]">{projectName}</span>
                    </p>
                  {/if}
                </div>

                <!-- Time -->
                <span class="text-xs text-[var(--ink-faint)] shrink-0 whitespace-nowrap">
                  {formatRelative(activity.created_at)}
                </span>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
