<script lang="ts">
  import { projects, activeMasterType, editingMasterId, modals } from '$lib/stores/app.store';
  import { deleteMember } from '$lib/db/members';
  import { toast } from '$lib/stores/toast.store';
  import Avatar from '$components/ui/Avatar.svelte';
  import EmptyState from '$components/ui/EmptyState.svelte';
  import ConfirmDialog from '$components/ui/ConfirmDialog.svelte';
  import type { Project, Member } from '$lib/types';

  interface Props {
    project: Project;
    isOwner?: boolean;
  }

  let { project, isOwner = true }: Props = $props();

  let confirmMember = $state<Member | null>(null);
  let detailMember = $state<Member | null>(null);

  function handleAddMember() {
    activeMasterType.set('member');
    editingMasterId.set(null);
    modals.update((m) => ({ ...m, master: true }));
  }

  function handleEditMember(member: Member) {
    detailMember = null;
    activeMasterType.set('member');
    editingMasterId.set(member.id);
    modals.update((m) => ({ ...m, master: true }));
  }

  async function handleDelete() {
    if (!confirmMember) return;
    const member = confirmMember;
    confirmMember = null;
    try {
      await deleteMember(member.id);
      projects.update((list) =>
        list.map((p) => {
          if (p.id !== project.id) return p;
          return {
            ...p,
            members: p.members.filter((m) => m.id !== member.id),
            todos: p.todos.map((t) => ({
              ...t,
              tag_ids: t.tag_ids?.filter((id) => id !== member.id) ?? [],
            })),
          };
        })
      );
      toast.success('Anggota berhasil dihapus.');
    } catch (e) {
      console.error('TeamTab.handleDelete:', e);
      toast.error('Gagal menghapus anggota. Coba lagi.');
    }
  }

  function getTaskCount(memberId: string) {
    return project.todos.filter((t) => t.tag_ids?.includes(memberId)).length;
  }

  function getMemberTasks(memberId: string) {
    return project.todos.filter((t) => t.tag_ids?.includes(memberId));
  }
</script>

<!-- Main card -->
<div class="bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden">
  <!-- Header -->
  <div class="flex items-center justify-between px-6 py-4 border-b border-[var(--line)]">
    <div>
      <h3 class="text-base font-semibold text-[var(--ink)] flex items-center gap-2">
        <i class="fa-solid fa-users text-[var(--accent)]"></i>
        Anggota Tim
      </h3>
      <p class="text-sm text-[var(--ink-faint)] mt-0.5">{project.members.length} anggota terdaftar</p>
    </div>
    {#if isOwner}
      <button
        class="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-deep)] transition-colors shadow-[var(--shadow-accent)]"
        onclick={handleAddMember}
      >
        <i class="fa-solid fa-user-plus text-xs"></i>
        Tambah anggota
      </button>
    {/if}
  </div>

  {#if project.members.length === 0}
    <EmptyState
      icon="users"
      title="Belum ada anggota"
      description="Tambahkan anggota tim agar bisa di-tag pada tugas di proyek ini."
      ctaLabel={isOwner ? 'Tambah anggota pertama' : undefined}
      onCta={isOwner ? handleAddMember : undefined}
    />
  {:else}
    <div class="divide-y divide-[var(--line)]">
      {#each project.members as member}
        {@const taskCount = getTaskCount(member.id)}
        <div
          class="flex items-center gap-4 px-6 py-4 hover:bg-[var(--card-soft)] transition-colors group cursor-pointer"
          onclick={() => (detailMember = member)}
          role="button"
          tabindex="0"
          onkeydown={(e) => e.key === 'Enter' && (detailMember = member)}
          aria-label="Lihat detail {member.name}"
        >
          <Avatar name={member.name} color={member.color} size="md" />

          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-[var(--ink)] truncate">{member.name}</p>
            <p class="text-xs text-[var(--ink-faint)] mt-0.5 truncate">{member.email}</p>
          </div>

          <div class="shrink-0 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--card-soft)] border border-[var(--line)]">
            <i class="fa-solid fa-list-check text-xs text-[var(--ink-faint)]"></i>
            <span class="text-xs font-medium text-[var(--ink-soft)]">{taskCount} tugas</span>
          </div>

          {#if isOwner}
            <div
              class="flex items-center gap-1 shrink-0"
              onclick={(e) => e.stopPropagation()}
              role="presentation"
            >
              <button
                class="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--ink-faint)] hover:bg-[var(--card-soft)] hover:text-[var(--ink)] transition-colors"
                onclick={() => handleEditMember(member)}
                aria-label="Edit anggota"
              >
                <i class="fa-solid fa-pen text-xs"></i>
              </button>
              <button
                class="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--ink-faint)] hover:bg-[var(--red-soft)] hover:text-[var(--red)] transition-colors"
                onclick={() => (confirmMember = member)}
                aria-label="Hapus anggota"
              >
                <i class="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Detail Modal -->
{#if detailMember}
  {#each [detailMember] as member}
    {@const memberTasks = getMemberTasks(member.id)}
    {@const doneTasks = memberTasks.filter(t => {
      const sorted = [...project.statuses].sort((a,b) => b.sort_order - a.sort_order);
      return t.status_id === sorted[0]?.id;
    }).length}
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Detail anggota"
      onmousedown={(e) => { if (e.target === e.currentTarget) detailMember = null; }}
      onkeydown={(e) => e.key === 'Escape' && (detailMember = null)}
    >
      <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      <div class="relative w-full max-w-md bg-white rounded-2xl shadow-[var(--shadow-modal)] overflow-hidden">
        <!-- Header -->
        <div class="flex items-start gap-4 px-6 pt-5 pb-4 border-b border-[var(--line)]">
          <Avatar name={member.name} color={member.color} size="lg" />
          <div class="flex-1 min-w-0">
            <h2 class="text-base font-bold text-[var(--ink)]">{member.name}</h2>
            <p class="text-sm text-[var(--ink-soft)] mt-0.5">{member.email}</p>
          </div>
          <button
            class="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--ink-faint)] hover:bg-[var(--card-soft)] hover:text-[var(--ink)] transition-colors shrink-0"
            onclick={() => (detailMember = null)}
            aria-label="Tutup"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="px-6 py-4 flex flex-col gap-4 max-h-80 overflow-y-auto">
          <!-- Stats -->
          <div class="flex items-center gap-3">
            <div class="flex-1 bg-[var(--card-soft)] rounded-xl px-4 py-3 text-center">
              <p class="text-2xl font-bold text-[var(--ink)]">{memberTasks.length}</p>
              <p class="text-xs text-[var(--ink-faint)] mt-0.5">Tugas ditag</p>
            </div>
            <div class="flex-1 bg-[var(--card-soft)] rounded-xl px-4 py-3 text-center">
              <p class="text-2xl font-bold text-[var(--green)]">{doneTasks}</p>
              <p class="text-xs text-[var(--ink-faint)] mt-0.5">Selesai</p>
            </div>
          </div>

          <!-- Task list -->
          {#if memberTasks.length > 0}
            <div>
              <p class="text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wider mb-2">Tugas yang ditag</p>
              <div class="flex flex-col gap-1.5">
                {#each memberTasks.slice(0, 8) as task}
                  {@const status = project.statuses.find(s => s.id === task.status_id)}
                  <div class="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[var(--card-soft)]">
                    {#if status}
                      <span class="w-2 h-2 rounded-full shrink-0" style="background:{status.color};"></span>
                    {/if}
                    <span class="text-sm text-[var(--ink)] truncate flex-1">{task.title}</span>
                  </div>
                {/each}
                {#if memberTasks.length > 8}
                  <p class="text-xs text-[var(--ink-faint)] text-center py-1">+{memberTasks.length - 8} tugas lainnya</p>
                {/if}
              </div>
            </div>
          {/if}
        </div>

        <!-- Footer -->
        {#if isOwner}
          <div class="flex gap-3 px-6 pb-5 pt-2 border-t border-[var(--line)]">
            <button
              class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-deep)] transition-colors shadow-[var(--shadow-accent)]"
              onclick={() => handleEditMember(member)}
            >
              <i class="fa-solid fa-pen text-xs"></i>
              Edit anggota
            </button>
            <button
              class="w-10 h-10 rounded-xl flex items-center justify-center border border-[var(--line)] text-[var(--ink-faint)] hover:bg-[var(--red-soft)] hover:text-[var(--red)] transition-colors"
              onclick={() => { confirmMember = member; detailMember = null; }}
              aria-label="Hapus anggota"
            >
              <i class="fa-solid fa-trash text-sm"></i>
            </button>
          </div>
        {/if}
      </div>
    </div>
  {/each}
{/if}

<ConfirmDialog
  open={!!confirmMember}
  title="Hapus anggota"
  message="Hapus '{confirmMember?.name}' dari tim? Tugas yang memiliki tag anggota ini akan kehilangan tag tersebut."
  confirmText="Hapus"
  variant="danger"
  onConfirm={handleDelete}
  onCancel={() => (confirmMember = null)}
/>
