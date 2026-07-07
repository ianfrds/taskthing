<script lang="ts">
  import { goto } from "$app/navigation";
  import { signIn, registerWithUsername, checkUsername } from "$lib/supabase";

  let mode = $state<"login" | "register">("login");
  let email = $state("");
  let username = $state("");
  let displayName = $state("");
  let password = $state("");
  let confirmPw = $state("");
  let showPw = $state(false);
  let loading = $state(false);
  let error = $state("");

  async function handleSubmit() {
    if (!password) {
      error = "Kata sandi tidak boleh kosong.";
      return;
    }

    if (mode === "register") {
      if (password !== confirmPw) {
        error = "Konfirmasi kata sandi tidak cocok.";
        return;
      }
      if (password.length < 6) {
        error = "Kata sandi minimal 6 karakter.";
        return;
      }
      if (!username.trim()) {
        error = "Username tidak boleh kosong.";
        return;
      }
      if (!email.trim()) {
        error = "Email tidak boleh kosong.";
        return;
      }
      const chk = await checkUsername(username.trim());
      if (!chk.available) {
        error = chk.error ?? "Username sudah dipakai.";
        return;
      }
    } else {
      if (!username.trim()) {
        error = "Email atau username tidak boleh kosong.";
        return;
      }
    }

    loading = true;
    error = "";
    try {
      if (mode === "login") {
        await signIn(username.trim(), password);
      } else {
        await registerWithUsername(
          email.trim(),
          password,
          username.trim(),
          displayName.trim() || username.trim(),
        );
      }
      await goto("/dashboard");
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : "Terjadi kesalahan. Coba lagi.";
      console.error("LoginPage.handleSubmit:", e);
    } finally {
      loading = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter") handleSubmit();
  }
</script>

<svelte:head>
  <title>{mode === "login" ? "Masuk" : "Daftar"} — TaskThing</title>
</svelte:head>

<div class="auth-screen">
  <div class="auth-card">
    <!-- Left panel: branding + image -->
    <div class="auth-left">
      <div class="auth-left-content">
        <div class="auth-left-icon">
          <i class="fa-solid fa-diagram-project"></i>
        </div>
        <div class="auth-left-title">TaskThing</div>
        <p class="auth-left-tagline">
          Kelola proyek Anda<br />dengan lebih cerdas
        </p>
        <div class="auth-left-features">
          <div class="auth-left-feature">
            <i class="fa-regular fa-circle-check"></i>
            Task Management
          </div>
          <div class="auth-left-feature">
            <i class="fa-regular fa-circle-check"></i>
            Team Collaboration
          </div>
          <div class="auth-left-feature">
            <i class="fa-regular fa-circle-check"></i>
            Progress Tracking
          </div>
        </div>
      </div>
    </div>

    <!-- Right panel: form -->
    <div class="auth-right">
      <div class="auth-right-inner">
        <div class="auth-form-header">
          <h2 class="auth-form-title">
            {mode === "login" ? "Masuk ke akun" : "Buat akun baru"}
          </h2>
          <p class="auth-form-sub">
            {mode === "login"
              ? "Selamat datang kembali. Silakan masuk."
              : "Isi data di bawah untuk mulai menggunakan TaskThing."}
          </p>
        </div>

        {#if error}
          <div class="auth-error" role="alert">
            <i class="fa-solid fa-circle-exclamation"></i>
            {error}
          </div>
        {/if}

        <div class="auth-fields" onkeydown={handleKeydown}>
            <div class="auth-field">
            <label for="auth-username">{mode === 'login' ? 'Email atau nama pengguna' : 'Nama pengguna'}</label>
            <input
              id="auth-username"
              type="text"
              bind:value={username}
              placeholder={mode === 'login' ? 'email@contoh.com atau username' : 'username123'}
              autocomplete="off"
            />
          </div>

          {#if mode === "register"}
            <div class="auth-field">
              <label for="auth-email">Email</label>
              <input
                id="auth-email"
                type="email"
                bind:value={email}
                placeholder="nama@email.com"
                autocomplete="email"
              />
            </div>

            <div class="auth-field">
              <label for="auth-displayname">Nama tampilan</label>
              <input
                id="auth-displayname"
                type="text"
                bind:value={displayName}
                placeholder="Nama lengkap (opsional)"
                autocomplete="name"
              />
            </div>
          {/if}

          <div class="auth-field">
            <label for="auth-password">Kata sandi</label>
            <div class="auth-pw-wrap">
              <input
                id="auth-password"
                type={showPw ? "text" : "password"}
                bind:value={password}
                placeholder="Minimal 6 karakter"
                autocomplete={mode === "login"
                  ? "current-password"
                  : "new-password"}
              />
              <button
                type="button"
                class="auth-pw-toggle"
                onclick={() => (showPw = !showPw)}
                aria-label="Tampilkan kata sandi"
                tabindex="-1"
              >
                <i class="fa-regular {showPw ? 'fa-eye-slash' : 'fa-eye'}"></i>
              </button>
            </div>
          </div>

          {#if mode === "register"}
            <div class="auth-field">
              <label for="auth-confirm">Konfirmasi kata sandi</label>
              <input
                id="auth-confirm"
                type="password"
                bind:value={confirmPw}
                placeholder="Ulangi kata sandi"
                autocomplete="new-password"
              />
            </div>
          {/if}

          <button class="auth-submit" onclick={handleSubmit} disabled={loading}>
            {loading ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar"}
          </button>
        </div>

        <p class="auth-toggle">
          {mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}
          <button
            onclick={() => {
              mode = mode === "login" ? "register" : "login";
              error = "";
            }}
          >
            {mode === "login" ? "Daftar" : "Masuk"}
          </button>
        </p>
      </div>
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
  }

  .auth-screen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    box-sizing: border-box;
    position: relative;
    background-image: url("/assets/images/bg-login.png");
    background-size: cover;
    background-position: center;
  }

  .auth-screen::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(234, 78, 44, 0.6) 0%,
      rgba(30, 20, 50, 0.5) 100%
    );
  }

  .auth-card {
    display: flex;
    width: 100%;
    max-width: 880px;
    min-height: 560px;
    background: #fff;
    border-radius: 1.25rem;
    box-shadow:
      0 8px 40px rgba(0, 0, 0, 0.08),
      0 2px 8px rgba(0, 0, 0, 0.04);
    overflow: hidden;
    position: relative;
    z-index: 1;
    padding: 0.75rem;
    gap: 0.75rem;
  }

  @media (max-width: 767px) {
    .auth-card {
      max-width: 420px;
      min-height: auto;
      padding: 0.5rem;
      gap: 0;
      flex-direction: column;
    }
  }

  /* ── Left panel ── */
  .auth-left {
    flex: 1;
    display: none;
    position: relative;
    border-radius: 0.75rem;
    overflow: hidden;
  }

  @media (min-width: 768px) {
    .auth-left {
      display: block;
    }
  }

  .auth-left-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 2.5rem;
    text-align: center;
    color: #fff;
    background: linear-gradient(
        135deg,
        rgba(234, 78, 44, 0.88) 0%,
        rgba(30, 20, 50, 0.78) 100%
      ),
      url("/assets/images/halftone-bg.png");
    background-size: cover, cover;
    background-position: center;
    background-blend-mode: multiply;
  }

  .auth-left-icon {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    backdrop-filter: blur(6px);
    margin-bottom: 1rem;
  }

  .auth-left-title {
    font-family: "Space Grotesk", sans-serif;
    font-size: 1.75rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin-bottom: 0.5rem;
  }

  .auth-left-tagline {
    font-size: 0.9rem;
    opacity: 0.85;
    line-height: 1.6;
    margin-bottom: 2rem;
    max-width: 260px;
  }

  .auth-left-features {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .auth-left-feature {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    font-size: 0.85rem;
    font-weight: 500;
    opacity: 0.92;
  }

  .auth-left-feature i {
    font-size: 0.85rem;
    opacity: 0.85;
  }

  /* ── Right panel ── */
  .auth-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2.5rem 2rem;
    background: #fff;
    min-width: 0;
  }

  @media (max-width: 767px) {
    .auth-right {
      padding: 2rem 1.5rem;
    }
  }

  .auth-right-inner {
    width: 100%;
    max-width: 340px;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .auth-form-header {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .auth-form-title {
    font-family: "Space Grotesk", sans-serif;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--ink);
    margin: 0;
  }

  .auth-form-sub {
    font-size: 0.8125rem;
    color: var(--ink-soft);
    margin: 0;
    line-height: 1.5;
  }

  .auth-error {
    background: #fef2f2;
    color: #b91c1c;
    font-size: 0.8125rem;
    padding: 0.625rem 0.875rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .auth-fields {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }

  .auth-field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .auth-field label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--ink-soft);
  }

  .auth-field input {
    width: 100%;
    padding: 0.625rem 0.875rem;
    font-size: 0.875rem;
    border: 1px solid #e0e0e6;
    border-radius: 0.75rem;
    background: #f8f8fc;
    color: #1a1a2e;
    outline: none;
    transition:
      border-color 0.15s,
      box-shadow 0.15s;
    box-sizing: border-box;
  }

  .auth-field input::placeholder {
    color: #a0a0b0;
  }

  .auth-field input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(234, 78, 44, 0.12);
  }

  .auth-pw-wrap {
    position: relative;
  }

  .auth-pw-wrap input {
    padding-right: 2.5rem;
  }

  .auth-pw-toggle {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #a0a0b0;
    font-size: 0.875rem;
    padding: 0;
    transition: color 0.15s;
  }

  .auth-pw-toggle:hover {
    color: var(--ink);
  }

  .auth-submit {
    width: 100%;
    padding: 0.75rem;
    border-radius: 0.75rem;
    background: var(--accent);
    color: #fff;
    font-size: 0.875rem;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: background 0.15s;
    box-shadow: 0 4px 12px rgba(234, 78, 44, 0.3);
    margin-top: 0.25rem;
  }

  .auth-submit:hover:not(:disabled) {
    background: var(--accent-deep);
  }

  .auth-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .auth-toggle {
    text-align: center;
    font-size: 0.8125rem;
    color: var(--ink-soft);
    margin: 0;
  }

  .auth-toggle button {
    background: none;
    border: none;
    color: var(--accent);
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    margin-left: 0.25rem;
    font-size: inherit;
  }

  .auth-toggle button:hover {
    text-decoration: underline;
  }
</style>
