<script lang="ts">
  import { projects } from '$lib/stores/app.store';
  import { createProject, updateProject } from '$lib/db/projects';
  import { toast } from '$lib/stores/toast.store';
  import { COLORS, PROJECT_ICONS } from '$lib/constants';
  import ColorPicker from '$components/ui/ColorPicker.svelte';
  import type { Project } from '$lib/types';

  interface Props {
    open: boolean;
    editProject?: Project | null;
    onClose: () => void;
    onSaved?: (project: Project) => void;
  }

  let { open, editProject = null, onClose, onSaved }: Props = $props();

  let name = $state('');
  let description = $state('');
  let color = $state(COLORS[0].hex);
  let icon = $state(PROJECT_ICONS[0]);
  let loading = $state(false);
  let error = $state('');

  $effect(() => {
    if (!open) return;
    if (editProject) {
      name = editProject.name;
      description = editProject.description;
      color = editProject.color;
      icon = editProject.icon;
    } else {
      name = '';
      description = '';
      color = COLORS[Math.floor(Math.random() * COLORS.length)].hex;
      icon = PROJECT_ICONS[Math.floor(Math.random() * PROJECT_ICONS.length)];
    }
    error = '';
  });

  async function handleSubmit() {
    if (!name.trim()) { error = 'Nama proyek tidak boleh kosong.'; return; }
    loading = true;
    error = '';
    try {
      if (editProject) {
        const updated = await updateProject(editProject.id, { name: name.trim(), description: description.trim(), color, icon });
        projects.update((list) =>
          list.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
        );
        toast.success('Proyek berhasil diperbarui.');
        onSaved?.(updated as Project);
      } else {
        const created = await createProject({ name: name.trim(), description: description.trim(), color });
        const full: Project = { ...created, todos: [], statuses: [], categories: [], priorities: [], members: [], resources: [] };
        projects.update((list) => [...list, full]);
        toast.success('Proyek baru berhasil dibuat.');
        onSaved?.(full);
      }
      onClose();
    } catch (e: unknown) {
      error = 'Gagal menyimpan proyek. Coba lagi.';
      console.error('ProjectModal.handleSubmit:', e);
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
    aria-labelledby="project-modal-title"
    onkeydown={handleKeydown}
    onclick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div class="bg-white rounded-2xl shadow-[var(--shadow-modal)] w-full max-w-md p-6 flex flex-col gap-5">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h2 id="project-modal-title" class="text-base font-semibold text-[var(--ink)]">
          {editProject ? 'Edit proyek' : 'Proyek baru'}
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

      <!-- Preview -->
      <div class="flex items-center gap-3 p-3 bg-[var(--card-soft)] rounded-xl">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style="background:{color}1c; color:{color};">
          <i class="fa-solid {icon}"></i>
        </div>
        <div>
          <p class="text-sm font-semibold text-[var(--ink)] truncate">{name || 'Nama proyek'}</p>
          <p class="text-xs text-[var(--ink-faint)] truncate">{description || 'Deskripsi proyek...'}</p>
        </div>
      </div>

      <!-- Fields -->
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-[var(--ink-soft)]" for="pj-name">Nama proyek <span class="text-[var(--red)]">*</span></label>
          <input
            id="pj-name"
            type="text"
            class="w-full px-3 py-2 text-sm border border-[var(--line)] rounded-xl bg-[var(--card-soft)] text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
            bind:value={name}
            placeholder="Nama proyek kamu"
            maxlength="80"
            autofocus
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-[var(--ink-soft)]" for="pj-desc">Deskripsi</label>
          <textarea
            id="pj-desc"
            class="w-full px-3 py-2 text-sm border border-[var(--line)] rounded-xl bg-[var(--card-soft)] text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors resize-none"
            bind:value={description}
            placeholder="Opsional — deskripsi singkat"
            rows="2"
            maxlength="200"
          ></textarea>
        </div>

        <!-- Color picker -->
        <div class="flex flex-col gap-1">
          <span class="text-xs font-medium text-[var(--ink-soft)]">Warna</span>
          <ColorPicker value={color} onSelect={(hex) => (color = hex)} />
        </div>

        <!-- Icon picker -->
        <div class="flex flex-col gap-1">
          <span class="text-xs font-medium text-[var(--ink-soft)]">Ikon</span>
          <div class="flex gap-2 flex-wrap">
            {#each PROJECT_ICONS as ic}
              <button
                type="button"
                class="w-9 h-9 rounded-xl flex items-center justify-center text-base transition-colors {icon === ic ? 'bg-[var(--accent)] text-white' : 'bg-[var(--card-soft)] text-[var(--ink-soft)] hover:bg-[var(--line)]'}"
                onclick={() => (icon = ic)}
                aria-label="Ikon {ic}"
                aria-pressed={icon === ic}
              >
                <i class="fa-solid {ic}"></i>
              </button>
            {/each}
          </div>
        </div>
      </div>

      <!-- Actions -->
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
          {loading ? 'Menyimpan...' : (editProject ? 'Simpan perubahan' : 'Buat proyek')}
        </button>
      </div>
    </div>
  </div>
{/if}
