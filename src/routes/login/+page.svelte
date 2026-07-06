<script lang="ts">
  import { goto } from '$app/navigation';
  import { signIn, registerWithUsername, checkUsername } from '$lib/supabase';
  import { generateUsername } from '$lib/utils';

  let mode = $state<'login' | 'register'>('login');
  let email = $state('');
  let username = $state('');
  let displayName = $state('');
  let password = $state('');
  let confirmPw = $state('');
  let showPw = $state(false);
  let loading = $state(false);
  let error = $state('');

  async function handleSubmit() {
    if (!email.trim()) { error = 'Email tidak boleh kosong.'; return; }
    if (!password) { error = 'Kata sandi tidak boleh kosong.'; return; }

    if (mode === 'register') {
      if (password !== confirmPw) { error = 'Konfirmasi kata sandi tidak cocok.'; return; }
      if (password.length < 6) { error = 'Kata sandi minimal 6 karakter.'; return; }
      if (!username.trim()) { error = 'Username tidak boleh kosong.'; return; }
      const chk = await checkUsername(username.trim());
      if (!chk.available) { error = chk.error ?? 'Username sudah dipakai.'; return; }
    }

    loading = true;
    error = '';
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
      } else {
        await registerWithUsername(
          email.trim(),
          password,
          username.trim(),
          displayName.trim() || username.trim()
        );
      }
      await goto('/dashboard');
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : 'Terjadi kesalahan. Coba lagi.';
      console.error('LoginPage.handleSubmit:', e);
    } finally {
      loading = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit();
  }
</script>

<svelte:head>
  <title>{mode === 'login' ? 'Masuk' : 'Daftar'} — TaskThing</title>
</svelte:head>

<div class="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
  <div class="w-full max-w-sm">
    <!-- Logo -->
    <div class="flex items-center gap-2.5 justify-center mb-8">
      <div class="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center">
        <i class="fa-solid fa-diagram-project text-white text-sm"></i>
      </div>
      <span class="text-xl font-bold text-[var(--ink)]" style="font-family:'Space Grotesk',sans-serif;">TaskThing</span>
    </div>

    <!-- Card -->
    <div class="bg-white rounded-2xl shadow-[var(--shadow-modal)] p-7 flex flex-col gap-5">
      <h1 class="text-lg font-bold text-[var(--ink)] text-center">
        {mode === 'login' ? 'Masuk ke akun' : 'Buat akun baru'}
      </h1>

      {#if error}
        <div class="bg-[var(--red-soft)] text-[var(--red-deep)] text-sm px-3 py-2.5 rounded-xl flex items-center gap-2" role="alert">
          <i class="fa-solid fa-circle-exclamation shrink-0"></i>
          {error}
        </div>
      {/if}

      <div class="flex flex-col gap-3" onkeydown={handleKeydown}>
        <!-- Email -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-[var(--ink-soft)]" for="auth-email">
            {mode === 'login' ? 'Email / Username' : 'Email'}
          </label>
          <input
            id="auth-email"
            type="text"
            class="w-full px-3 py-2.5 text-sm border border-[var(--line)] rounded-xl bg-[var(--card-soft)] text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
            bind:value={email}
            placeholder={mode === 'login' ? 'nama@email.com atau username' : 'nama@email.com'}
            autocomplete={mode === 'login' ? 'username' : 'email'}
          />
        </div>

        <!-- Username (register only) -->
        {#if mode === 'register'}
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-[var(--ink-soft)]" for="auth-username">Nama pengguna</label>
            <input
              id="auth-username"
              type="text"
              class="w-full px-3 py-2.5 text-sm border border-[var(--line)] rounded-xl bg-[var(--card-soft)] text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
              bind:value={username}
              placeholder="username123"
              autocomplete="off"
            />
            <p class="text-[11px] text-[var(--ink-faint)]">Huruf, angka, underscore. 3–20 karakter.</p>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-[var(--ink-soft)]" for="auth-displayname">Nama tampilan</label>
            <input
              id="auth-displayname"
              type="text"
              class="w-full px-3 py-2.5 text-sm border border-[var(--line)] rounded-xl bg-[var(--card-soft)] text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
              bind:value={displayName}
              placeholder="Nama lengkap (opsional)"
              autocomplete="name"
            />
          </div>
        {/if}

        <!-- Password -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-[var(--ink-soft)]" for="auth-password">Kata sandi</label>
          <div class="relative">
            <input
              id="auth-password"
              type={showPw ? 'text' : 'password'}
              class="w-full px-3 py-2.5 pr-10 text-sm border border-[var(--line)] rounded-xl bg-[var(--card-soft)] text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
              bind:value={password}
              placeholder="Minimal 6 karakter"
              autocomplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors"
              onclick={() => (showPw = !showPw)}
              aria-label="Tampilkan kata sandi"
              tabindex="-1"
            >
              <i class="fa-regular {showPw ? 'fa-eye-slash' : 'fa-eye'} text-sm"></i>
            </button>
          </div>
        </div>

        <!-- Confirm password (register only) -->
        {#if mode === 'register'}
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-[var(--ink-soft)]" for="auth-confirm">Konfirmasi kata sandi</label>
            <input
              id="auth-confirm"
              type="password"
              class="w-full px-3 py-2.5 text-sm border border-[var(--line)] rounded-xl bg-[var(--card-soft)] text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
              bind:value={confirmPw}
              placeholder="Ulangi kata sandi"
              autocomplete="new-password"
            />
          </div>
        {/if}
      </div>

      <!-- Submit -->
      <button
        class="w-full py-3 rounded-xl bg-[var(--accent)] text-white text-sm font-bold hover:bg-[var(--accent-deep)] transition-colors shadow-[var(--shadow-accent)] disabled:opacity-60 disabled:cursor-not-allowed"
        onclick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Memproses...' : (mode === 'login' ? 'Masuk' : 'Daftar')}
      </button>

      <!-- Toggle mode -->
      <p class="text-center text-sm text-[var(--ink-soft)]">
        {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}
        <button
          class="text-[var(--accent)] font-semibold hover:underline ml-1"
          onclick={() => { mode = mode === 'login' ? 'register' : 'login'; error = ''; }}
        >
          {mode === 'login' ? 'Daftar' : 'Masuk'}
        </button>
      </p>
    </div>
  </div>
</div>
