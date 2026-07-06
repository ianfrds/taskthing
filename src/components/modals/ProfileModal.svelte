<script lang="ts">
  import { supabase, updateProfile, changePassword, getUsername, updateUsername } from '$lib/supabase';
  import { toast } from '$lib/stores/toast.store';

  interface Props {
    open: boolean;
    onClose: () => void;
  }

  let { open, onClose }: Props = $props();

  let displayName = $state('');
  let username = $state('');
  let email = $state('');
  let userId = $state('');
  let newPassword = $state('');
  let confirmPw = $state('');
  let loading = $state(false);
  let error = $state('');

  $effect(() => {
    if (!open) return;
    error = '';
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      userId = data.user.id;
      email = data.user.email ?? '';
      displayName = data.user.user_metadata?.display_name ?? '';
      username = (await getUsername(userId)) ?? '';
    });
  });

  async function handleSaveProfile() {
    if (!displayName.trim()) { error = 'Nama tidak boleh kosong.'; return; }
    loading = true;
    error = '';
    try {
      await updateProfile(displayName.trim());
      if (username.trim()) await updateUsername(userId, username.trim(), email);
      toast.success('Profil berhasil disimpan.');
      onClose();
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : 'Gagal menyimpan profil.';
      console.error('ProfileModal.handleSaveProfile:', e);
    } finally {
      loading = false;
    }
  }

  async function handleChangePassword() {
    if (!newPassword) { error = 'Kata sandi baru tidak boleh kosong.'; return; }
    if (newPassword !== confirmPw) { error = 'Konfirmasi kata sandi tidak cocok.'; return; }
    if (newPassword.length < 6) { error = 'Kata sandi minimal 6 karakter.'; return; }
    loading = true;
    error = '';
    try {
      await changePassword(newPassword);
      toast.success('Kata sandi berhasil diubah.');
      newPassword = '';
      confirmPw = '';
      onClose();
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : 'Gagal mengubah kata sandi.';
      console.error('ProfileModal.handleChangePassword:', e);
    } finally {
      loading = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }
</script>

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="profile-modal-title"
    tabindex="-1"
    onkeydown={handleKeydown}
    onclick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div class="bg-white rounded-2xl shadow-[var(--shadow-modal)] w-full max-w-md p-6 flex flex-col gap-5">
      <div class="flex items-center justify-between">
        <h2 id="profile-modal-title" class="text-base font-semibold text-[var(--ink)]">Profil</h2>
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

      <!-- Profile section -->
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-[var(--ink-soft)]" for="pf-name">Nama tampilan</label>
          <input
            id="pf-name"
            type="text"
            class="w-full px-3 py-2 text-sm border border-[var(--line)] rounded-xl bg-[var(--card-soft)] text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
            bind:value={displayName}
            placeholder="Nama lengkap"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-[var(--ink-soft)]" for="pf-username">Username</label>
          <input
            id="pf-username"
            type="text"
            class="w-full px-3 py-2 text-sm border border-[var(--line)] rounded-xl bg-[var(--card-soft)] text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
            bind:value={username}
            placeholder="username123"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-[var(--ink-soft)]" for="pf-email">Email</label>
          <input
            id="pf-email"
            type="email"
            class="w-full px-3 py-2 text-sm border border-[var(--line)] rounded-xl bg-[var(--card-soft)] text-[var(--ink-faint)] cursor-not-allowed"
            value={email}
            disabled
          />
        </div>
        <button
          class="w-full py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-deep)] transition-colors disabled:opacity-60"
          onclick={handleSaveProfile}
          disabled={loading}
        >
          {loading ? 'Menyimpan...' : 'Simpan profil'}
        </button>
      </div>

      <hr class="border-[var(--line)]" />

      <!-- Password section -->
      <div class="flex flex-col gap-3">
        <h3 class="text-sm font-semibold text-[var(--ink)]">Ubah kata sandi</h3>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-[var(--ink-soft)]" for="pf-pw">Kata sandi baru</label>
          <input
            id="pf-pw"
            type="password"
            class="w-full px-3 py-2 text-sm border border-[var(--line)] rounded-xl bg-[var(--card-soft)] text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            bind:value={newPassword}
            placeholder="Minimal 6 karakter"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-[var(--ink-soft)]" for="pf-pw-confirm">Konfirmasi kata sandi</label>
          <input
            id="pf-pw-confirm"
            type="password"
            class="w-full px-3 py-2 text-sm border border-[var(--line)] rounded-xl bg-[var(--card-soft)] text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            bind:value={confirmPw}
            placeholder="Ulangi kata sandi"
          />
        </div>
        <button
          class="w-full py-2.5 rounded-xl border border-[var(--line)] text-[var(--ink)] text-sm font-semibold hover:bg-[var(--card-soft)] transition-colors disabled:opacity-60"
          onclick={handleChangePassword}
          disabled={loading}
        >
          Ubah kata sandi
        </button>
      </div>
    </div>
  </div>
{/if}
