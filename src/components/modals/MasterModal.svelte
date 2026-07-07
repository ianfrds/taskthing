<script lang="ts">
  import { activeProject, projects, activeMasterType, editingMasterId } from '$lib/stores/app.store';
  import { createStatus, updateStatus } from '$lib/db/statuses';
  import { createCategory, updateCategory } from '$lib/db/categories';
  import { createPriority, updatePriority } from '$lib/db/priorities';
  import { createMember, updateMember } from '$lib/db/members';
  import { lookupUserByEmail } from '$lib/supabase';
  import { toast } from '$lib/stores/toast.store';
  import { COLORS } from '$lib/constants';
  import ColorPicker from '$components/ui/ColorPicker.svelte';

  interface Props {
    open: boolean;
    onClose: () => void;
  }

  let { open, onClose }: Props = $props();

  const proj = $derived($activeProject);
  const type = $derived($activeMasterType);
  const editId = $derived($editingMasterId);
  const isMember = $derived(type === 'member');

  let name = $state('');
  let color = $state(COLORS[0].hex);
  let email = $state('');
  let emailStatus = $state<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  let emailTimer: ReturnType<typeof setTimeout> | null = null;
  let loading = $state(false);
  let error = $state('');

  const typeLabel: Record<string, string> = {
    status: 'Status',
    category: 'Kategori',
    priority: 'Prioritas',
    member: 'Anggota tim',
  };

  $effect(() => {
    if (!open || !proj) return;
    error = '';
    emailStatus = 'idle';
    if (editId) {
      const list = proj[type === 'status' ? 'statuses' : type === 'category' ? 'categories' : type === 'priority' ? 'priorities' : 'members'] as Array<{ id: string; name: string; color: string; email?: string }>;
      const item = list.find((x) => x.id === editId);
      if (item) {
        name = item.name;
        color = item.color;
        email = (item as { email?: string }).email ?? '';
      }
    } else {
      name = '';
      color = COLORS[Math.floor(Math.random() * COLORS.length)].hex;
      email = '';
    }
  });

  async function checkEmail(val: string) {
    if (emailTimer) clearTimeout(emailTimer);
    if (!val.trim()) { emailStatus = 'idle'; return; }
    emailStatus = 'checking';
    emailTimer = setTimeout(async () => {
      const user = await lookupUserByEmail(val.trim());
      emailStatus = user ? 'valid' : 'invalid';
    }, 400);
  }

  async function handleSubmit() {
    if (!proj) return;
    error = '';

    if (isMember) {
      if (!email.trim()) { error = 'Email tidak boleh kosong.'; return; }
      const user = await lookupUserByEmail(email.trim());
      if (!user) { error = 'Email tidak terdaftar. Pastikan user sudah memiliki akun.'; return; }
    } else {
      if (!name.trim()) { error = 'Nama tidak boleh kosong.'; return; }
    }

    loading = true;
    error = '';
    try {
      if (type === 'status') {
        if (editId) {
          const updated = await updateStatus(editId, { name: name.trim(), color });
          projects.update((list) => list.map((p) => p.id === proj.id ? { ...p, statuses: p.statuses.map((s) => s.id === updated.id ? updated : s) } : p));
        } else {
          const created = await createStatus(proj.id, name.trim(), color);
          projects.update((list) => list.map((p) => p.id === proj.id ? { ...p, statuses: [...p.statuses, created] } : p));
        }
      } else if (type === 'category') {
        if (editId) {
          const updated = await updateCategory(editId, { name: name.trim(), color });
          projects.update((list) => list.map((p) => p.id === proj.id ? { ...p, categories: p.categories.map((c) => c.id === updated.id ? updated : c) } : p));
        } else {
          const created = await createCategory(proj.id, name.trim(), color);
          projects.update((list) => list.map((p) => p.id === proj.id ? { ...p, categories: [...p.categories, created] } : p));
        }
      } else if (type === 'priority') {
        if (editId) {
          const updated = await updatePriority(editId, { name: name.trim(), color });
          projects.update((list) => list.map((p) => p.id === proj.id ? { ...p, priorities: p.priorities.map((pr) => pr.id === updated.id ? updated : pr) } : p));
        } else {
          const created = await createPriority(proj.id, name.trim(), color);
          projects.update((list) => list.map((p) => p.id === proj.id ? { ...p, priorities: [...p.priorities, created] } : p));
        }
      } else if (type === 'member') {
        const user = (await lookupUserByEmail(email.trim()))!;
        if (editId) {
          const updated = await updateMember(editId, { email: email.trim(), name: user.username, color });
          projects.update((list) => list.map((p) => p.id === proj.id ? { ...p, members: p.members.map((m) => m.id === updated.id ? updated : m) } : p));
        } else {
          const autoColor = COLORS[Math.floor(Math.random() * COLORS.length)].hex;
          const created = await createMember(proj.id, user.username, email.trim(), autoColor);
          projects.update((list) => list.map((p) => p.id === proj.id ? { ...p, members: [...p.members, created] } : p));
        }
      }
      toast.success(`${typeLabel[type]} berhasil ${editId ? 'diperbarui' : 'ditambahkan'}.`);
      onClose();
    } catch (e: unknown) {
      error = `Gagal menyimpan ${typeLabel[type]?.toLowerCase()}. Coba lagi.`;
      console.error('MasterModal.handleSubmit:', e);
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
    aria-labelledby="master-modal-title"
    tabindex="-1"
    onkeydown={handleKeydown}
    onclick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div class="bg-white rounded-2xl shadow-[var(--shadow-modal)] w-full max-w-sm p-6 flex flex-col gap-5">
      <div class="flex items-center justify-between">
        <h2 id="master-modal-title" class="text-base font-semibold text-[var(--ink)]">
          {editId ? 'Edit' : 'Tambah'} {typeLabel[type]?.toLowerCase()}
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
        <div class="bg-[var(--red-soft)] text-[var(--red-deep)] text-sm px-3 py-2 rounded-lg flex items-center gap-2">
          <i class="fa-solid fa-circle-exclamation shrink-0"></i>
          {error}
        </div>
      {/if}

      <div class="flex flex-col gap-3">
        {#if isMember}
          <!-- Member: email only -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-[var(--ink-soft)]" for="ms-email">Email <span class="text-[var(--red)]">*</span></label>
            <div class="relative">
              <input
                id="ms-email"
                type="email"
                class="w-full px-3.5 py-2.5 text-sm border rounded-xl bg-white text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:ring-1 transition-colors
                  {emailStatus === 'valid' ? 'border-[var(--green)] focus:border-[var(--green)] focus:ring-[var(--green)]' : emailStatus === 'invalid' ? 'border-[var(--red)] focus:border-[var(--red)] focus:ring-[var(--red)]' : 'border-[var(--line)] focus:border-[var(--accent)] focus:ring-[var(--accent)]'}"
                bind:value={email}
                oninput={() => checkEmail(email)}
                placeholder="nama@email.com"
                autofocus
              />
              {#if emailStatus === 'checking'}
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-faint)]">
                  <i class="fa-solid fa-spinner fa-spin text-xs"></i>
                </span>
              {:else if emailStatus === 'valid'}
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--green)]">
                  <i class="fa-solid fa-circle-check text-sm"></i>
                </span>
              {:else if emailStatus === 'invalid'}
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--red)]">
                  <i class="fa-solid fa-circle-exclamation text-sm"></i>
                </span>
              {/if}
            </div>
            {#if emailStatus === 'invalid'}
              <p class="text-[11px] text-[var(--red)]">Email tidak terdaftar</p>
            {:else if emailStatus === 'valid'}
              <p class="text-[11px] text-[var(--green)]">Email terdaftar</p>
            {:else}
              <p class="text-[11px] text-[var(--ink-faint)]">Masukkan email user yang sudah memiliki akun</p>
            {/if}
          </div>
        {:else}
          <!-- Status/Category/Priority: name + color -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-[var(--ink-soft)]" for="ms-name">Nama <span class="text-[var(--red)]">*</span></label>
            <input
              id="ms-name"
              type="text"
              class="w-full px-3.5 py-2.5 text-sm border border-[var(--line)] rounded-xl bg-white text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
              bind:value={name}
              placeholder="Nama {typeLabel[type]}"
              autofocus
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <span class="text-xs font-medium text-[var(--ink-soft)]">Warna</span>
            <div class="flex items-center gap-3">
              <span class="w-8 h-8 rounded-full shrink-0 border-2 border-white shadow" style="background:{color};"></span>
              <ColorPicker value={color} onSelect={(hex) => (color = hex)} />
            </div>
          </div>
        {/if}
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
          disabled={loading || (isMember && emailStatus !== 'valid')}
        >
          {loading ? 'Menyimpan...' : (editId ? 'Simpan' : 'Tambah')}
        </button>
      </div>
    </div>
  </div>
{/if}
