<script lang="ts">
  import { supabase, updateProfile, changePassword, getUsername, updateUsername } from '$lib/supabase';
  import { toast } from '$lib/stores/toast.store';
  import Avatar from '$components/ui/Avatar.svelte';

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
  let loadingProfile = $state(false);
  let loadingPw = $state(false);
  let error = $state('');
  let showPw = $state(false);

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
    if (!displayName.trim()) { error = 'Nama tampilan tidak boleh kosong.'; return; }
    loadingProfile = true;
    error = '';
    try {
      await updateProfile(displayName.trim());
      if (username.trim()) await updateUsername(userId, username.trim(), email);
      toast.success('Profil berhasil disimpan.');
      onClose();
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : 'Gagal menyimpan profil.';
    } finally {
      loadingProfile = false;
    }
  }

  async function handleChangePassword() {
    if (!newPassword) { error = 'Kata sandi baru tidak boleh kosong.'; return; }
    if (newPassword !== confirmPw) { error = 'Konfirmasi kata sandi tidak cocok.'; return; }
    if (newPassword.length < 6) { error = 'Kata sandi minimal 6 karakter.'; return; }
    loadingPw = true;
    error = '';
    try {
      await changePassword(newPassword);
      toast.success('Kata sandi berhasil diubah.');
      newPassword = '';
      confirmPw = '';
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : 'Gagal mengubah kata sandi.';
    } finally {
      loadingPw = false;
    }
  }
</script>

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="profile-modal-title"
    onclick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div class="bg-white rounded-2xl shadow-[var(--shadow-modal)] w-full max-w-md overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 pt-5 pb-4">
        <h2 id="profile-modal-title" class="text-base font-semibold text-[var(--ink)]">Pengaturan profil</h2>
        <button
          class="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--ink-faint)] hover:bg-[var(--card-soft)] transition-colors"
          onclick={onClose}
          aria-label="Tutup"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      {#if error}
        <div class="mx-6 mb-4 bg-[var(--red-soft)] text-[var(--red-deep)] text-sm px-3 py-2.5 rounded-xl flex items-center gap-2">
          <i class="fa-solid fa-circle-exclamation shrink-0"></i>
          {error}
        </div>
      {/if}

      <div class="px-6 pb-6 flex flex-col gap-6">
        <!-- Avatar + User info -->
        <div class="flex items-center gap-4">
          <Avatar name={displayName || username || email} color="var(--accent)" size="lg" />
          <div class="min-w-0">
            <p class="text-sm font-semibold text-[var(--ink)] truncate">{displayName || username || 'Pengguna'}</p>
            <p class="text-xs text-[var(--ink-faint)] truncate">@{username || '—'}</p>
          </div>
        </div>

        <hr class="border-[var(--line)] -mx-6" />

        <!-- Profile form -->
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-[var(--ink-soft)]" for="pf-displayname">Nama tampilan</label>
            <input
              id="pf-displayname"
              type="text"
              class="w-full px-3.5 py-2.5 text-sm border border-[var(--line)] rounded-xl bg-white text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
              bind:value={displayName}
              placeholder="Nama lengkap"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-[var(--ink-soft)]" for="pf-username">Username</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--ink-faint)]">@</span>
              <input
                id="pf-username"
                type="text"
                class="w-full pl-7 pr-3.5 py-2.5 text-sm border border-[var(--line)] rounded-xl bg-white text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
                bind:value={username}
                placeholder="username"
              />
            </div>
            <p class="text-[11px] text-[var(--ink-faint)]">Huruf, angka, underscore. 3–20 karakter.</p>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-[var(--ink-soft)]" for="pf-email">Email</label>
            <input
              id="pf-email"
              type="email"
              class="w-full px-3.5 py-2.5 text-sm border border-[var(--line)] rounded-xl bg-[var(--card-soft)] text-[var(--ink-faint)] cursor-not-allowed"
              value={email}
              disabled
            />
          </div>
          <button
            class="w-full py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-deep)] transition-colors disabled:opacity-60"
            onclick={handleSaveProfile}
            disabled={loadingProfile}
          >
            {loadingProfile ? 'Menyimpan...' : 'Simpan profil'}
          </button>
        </div>

        <!-- Password change -->
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-2">
            <span class="w-5 h-[1.5px] bg-[var(--line)] flex-1"></span>
            <span class="text-xs font-medium text-[var(--ink-faint)] uppercase tracking-wider">Ubah kata sandi</span>
            <span class="w-5 h-[1.5px] bg-[var(--line)] flex-1"></span>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-[var(--ink-soft)]" for="pf-pw">Kata sandi baru</label>
            <div class="relative">
              <input
                id="pf-pw"
                type={showPw ? 'text' : 'password'}
                class="w-full px-3.5 py-2.5 pr-10 text-sm border border-[var(--line)] rounded-xl bg-white text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                bind:value={newPassword}
                placeholder="Minimal 6 karakter"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors"
                onclick={() => (showPw = !showPw)}
                aria-label={showPw ? 'Sembunyikan' : 'Tampilkan'}
                tabindex="-1"
              >
                <i class="fa-regular {showPw ? 'fa-eye-slash' : 'fa-eye'} text-sm"></i>
              </button>
            </div>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-[var(--ink-soft)]" for="pf-pw-confirm">Konfirmasi kata sandi</label>
            <input
              id="pf-pw-confirm"
              type="password"
              class="w-full px-3.5 py-2.5 text-sm border border-[var(--line)] rounded-xl bg-white text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              bind:value={confirmPw}
              placeholder="Ulangi kata sandi"
            />
          </div>
          <button
            class="w-full py-2.5 rounded-xl border-2 border-[var(--line)] text-[var(--ink)] text-sm font-semibold hover:bg-[var(--card-soft)] transition-colors disabled:opacity-60"
            onclick={handleChangePassword}
            disabled={loadingPw}
          >
            {loadingPw ? 'Mengubah...' : 'Ubah kata sandi'}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
