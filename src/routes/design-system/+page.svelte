<script lang="ts">
  import Badge from "../../components/ui/Badge.svelte";
  import Avatar from "../../components/ui/Avatar.svelte";
  import EmptyState from "../../components/ui/EmptyState.svelte";

  let activeSection = $state("overview");
  let viewingModal = $state(false);
  let activeSegmented = $state(0);
  let activePeriod = $state(0);
  let activeTabNav = $state(0);

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "foundations", label: "Foundations" },
    { id: "atoms", label: "Atoms" },
    { id: "molecules", label: "Molecules" },
    { id: "organisms", label: "Organisms" },
  ];

  const colors = [
    { name: "Background", var: "--bg", hex: "#F2F2F7" },
    { name: "Card", var: "--card", hex: "#FFFFFF" },
    { name: "Card Soft", var: "--card-soft", hex: "#F7F7FB" },
    { name: "Ink", var: "--ink", hex: "#1A1819" },
    { name: "Ink Soft", var: "--ink-soft", hex: "#6A6880" },
    { name: "Ink Faint", var: "--ink-faint", hex: "#A8A6BC" },
    { name: "Line", var: "--line", hex: "#EAEAF2" },
    { name: "Line Strong", var: "--line-strong", hex: "#D8D7E6" },
    { name: "Accent", var: "--accent", hex: "#EA4E2C" },
    { name: "Accent Deep", var: "--accent-deep", hex: "#C73C1C" },
    { name: "Accent Soft", var: "--accent-soft", hex: "#FFF0EC" },
    { name: "Green", var: "--green", hex: "#2EA878" },
    { name: "Green Soft", var: "--green-soft", hex: "#E3F5EE" },
    { name: "Blue", var: "--blue", hex: "#3B7FD4" },
    { name: "Blue Soft", var: "--blue-soft", hex: "#E4EDFB" },
    { name: "Red", var: "--red", hex: "#D94040" },
    { name: "Red Soft", var: "--red-soft", hex: "#FDEAEA" },
    { name: "Orange", var: "--orange", hex: "#F0A020" },
    { name: "Orange Soft", var: "--orange-soft", hex: "#FEF3DC" },
    { name: "Pink", var: "--pink", hex: "#D05C8E" },
    { name: "Pink Soft", var: "--pink-soft", hex: "#F9E5EF" },
    { name: "Amber", var: "--amber", hex: "#D09030" },
    { name: "Amber Soft", var: "--amber-soft", hex: "#FDF0D6" },
  ];

  const radii = [
    { name: "XL", var: "--radius-xl", value: "22px" },
    { name: "LG", var: "--radius-lg", value: "16px" },
    { name: "MD", var: "--radius-md", value: "12px" },
    { name: "SM", var: "--radius-sm", value: "8px" },
  ];

  const shadows = [
    {
      name: "Card",
      var: "--shadow-card",
      value: "0 2px 12px rgba(20,18,40,0.07)",
    },
    {
      name: "Card Hover",
      var: "--shadow-card-hover",
      value: "0 6px 22px rgba(20,18,40,0.12)",
    },
    {
      name: "Modal",
      var: "--shadow-modal",
      value: "0 24px 60px rgba(20,18,40,0.22)",
    },
    {
      name: "Accent",
      var: "--shadow-accent",
      value: "0 6px 20px rgba(234,78,44,0.28)",
    },
  ];

  const fontSizes = [
    {
      token: "text-[10px]",
      size: "10px",
      weight: "600",
      usage: "Label uppercase, meta",
    },
    {
      token: "text-xs",
      size: "12px",
      weight: "500",
      usage: "Small text, subtitles",
    },
    {
      token: "text-sm",
      size: "14px",
      weight: "400 / 600",
      usage: "Body, buttons",
    },
    {
      token: "text-base",
      size: "16px",
      weight: "600",
      usage: "Modal titles, h2",
    },
    { token: "text-xl", size: "20px", weight: "700", usage: "Page titles" },
    {
      token: "text-2xl",
      size: "24px",
      weight: "700",
      usage: "Stat values, h1",
    },
    { token: "text-3xl", size: "30px", weight: "700", usage: "Hero numbers" },
  ];

  // ── Collapsible code sections ──
  let codeOpen = $state<Record<string, boolean>>({});
  let copied = $state<string | null>(null);

  function toggleCode(id: string) {
    codeOpen[id] = !codeOpen[id];
  }

  async function copyCode(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      copied = id;
      setTimeout(() => {
        if (copied === id) copied = null;
      }, 1500);
    } catch {
      /* fallback */
    }
  }

  // ── Scroll-based active section ──
  $effect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            activeSection = entry.target.id;
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );

    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean);
    els.forEach((el) => el && observer.observe(el));

    return () => observer.disconnect();
  });

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
</script>

<div class="flex min-h-screen bg-white text-[var(--ink)]">
  <!-- Sidebar -->
  <aside
    class="w-[260px] min-w-[260px] border-r border-[var(--line)] h-screen sticky top-0 overflow-y-auto bg-white flex flex-col"
  >
    <div class="p-5 border-b border-[var(--line)]">
      <div class="flex items-center gap-2.5">
        <span
          class="w-[30px] h-[30px] rounded-xl bg-[var(--accent)] flex items-center justify-center text-white text-sm font-bold shadow-[var(--shadow-accent)]"
          >◆</span
        >
        <div>
          <p class="text-sm font-bold text-[var(--ink)]">Design System</p>
          <p class="text-[11px] text-[var(--ink-faint)] font-medium">
            TaskThing v1.0
          </p>
        </div>
      </div>
    </div>
    <nav class="flex flex-col gap-0.5 p-3">
      {#each sections as section}
        <button
          class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left
            {activeSection === section.id
            ? 'bg-[var(--card-soft)] text-[var(--ink)] font-semibold'
            : 'text-[var(--ink-soft)] hover:bg-[var(--card-soft)] hover:text-[var(--ink)]'}"
          onclick={() => scrollTo(section.id)}
        >
          {section.label}
        </button>
      {/each}
    </nav>
  </aside>

  <!-- Main -->
  <main class="flex-1 min-w-0">
    <div class="max-w-[900px] mx-auto px-6 py-6 flex flex-col gap-8">
      <!-- ═══ OVERVIEW ═══ -->
      <section id="overview" class="flex flex-col gap-6 scroll-mt-6">
        <div>
          <h1
            class="text-xl font-bold text-[var(--ink)]"
            style="font-family:'Space Grotesk',sans-serif;"
          >
            Design System Dashboard
          </h1>
          <p
            class="text-sm text-[var(--ink-soft)] mt-1.5 max-w-xl leading-relaxed"
          >
            Dokumentasi komponen UI TaskThing. Setiap komponen mengacu pada
            sistem desain yang sama —
            <span class="font-semibold text-[var(--ink)]"
              >Tailwind utility classes</span
            >
            dan
            <span class="font-semibold text-[var(--ink)]"
              >CSS custom properties</span
            >
            dari
            <code
              class="text-xs bg-[var(--card-soft)] px-1.5 py-0.5 rounded-md font-mono text-[var(--accent)]"
              >app.css</code
            >.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          {#each [["foundations", "Foundations", "Warna, tipografi, radius, shadow"], ["atoms", "Atoms", "Button, Badge, Avatar, Input"], ["molecules", "Molecules", "Segmented Control, Card, Tab Nav, Progress Bar"], ["organisms", "Organisms", "Modal, Topbar, Sidebar, EmptyState"]] as [id, label, desc]}
            <button
              class="bg-white rounded-2xl border border-[var(--line)] p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all text-left cursor-pointer"
              onclick={() => scrollTo(id)}
            >
              <strong class="text-sm font-semibold text-[var(--ink)]"
                >{label}</strong
              >
              <p class="text-xs text-[var(--ink-faint)] mt-1">{desc}</p>
            </button>
          {/each}
        </div>
      </section>

      <!-- ═══ FOUNDATIONS ═══ -->
      <section id="foundations" class="flex flex-col gap-6 scroll-mt-6">
        <div>
          <h2
            class="text-xl font-bold text-[var(--ink)]"
            style="font-family:'Space Grotesk',sans-serif;"
          >
            Foundations
          </h2>
          <p class="text-sm text-[var(--ink-soft)] mt-1">
            Tokens visual yang membangun seluruh tampilan TaskThing.
          </p>
        </div>

        <!-- Colors -->
        <div
          class="bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-[var(--line)]">
            <h3 class="text-sm font-semibold text-[var(--ink)]">Colors</h3>
            <p class="text-xs text-[var(--ink-faint)] mt-0.5">
              Palette warna dari CSS custom properties di <code
                class="font-mono bg-[var(--card-soft)] px-1 rounded text-[var(--accent)]"
                >app.css:root</code
              >
            </p>
          </div>
          <div class="p-5">
            <div
              class="palette-grid"
              style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;"
            >
              {#each colors as c}
                <div
                  class="swatch"
                  style="border-radius:12px;border:1px solid var(--line);background:var(--card);overflow:hidden;"
                >
                  <div
                    class="swatch-color"
                    style="height:56px;background:{c.hex};{c.hex === '#FFFFFF'
                      ? 'border-bottom:1px solid var(--line);'
                      : ''}"
                  ></div>
                  <div class="swatch-meta" style="padding:12px 14px;">
                    <div
                      class="swatch-name"
                      style="font-size:13px;font-weight:600;color:var(--ink);"
                    >
                      {c.name}
                    </div>
                    <div
                      class="swatch-var"
                      style="font-size:11px;font-family:monospace;color:var(--ink-faint);margin-top:2px;"
                    >
                      {c.var}
                    </div>
                    <div
                      class="swatch-hex"
                      style="font-size:11px;font-family:monospace;color:var(--ink-faint);margin-top:1px;"
                    >
                      {c.hex}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>

        <!-- Font -->
        <div
          class="bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-[var(--line)]">
            <h3 class="text-sm font-semibold text-[var(--ink)]">Font</h3>
            <p class="text-xs text-[var(--ink-faint)] mt-0.5">
              Typeface utama yang digunakan di seluruh UI.
            </p>
          </div>
          <div class="p-5 flex flex-col gap-4">
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-xl bg-black flex items-center justify-center shrink-0"
              >
                <span
                  class="text-xl font-bold text-white"
                  style="font-family:'Inter',sans-serif;">I</span
                >
              </div>
              <div>
                <p class="text-sm font-semibold text-[var(--ink)]">Inter</p>
                <p class="text-xs text-[var(--ink-faint)]">
                  by Rasmus Andersson
                </p>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <p class="text-xs font-semibold text-[var(--ink-soft)]">
                Google Fonts CDN
              </p>
              <div
                class="bg-[var(--card-soft)] rounded-xl border border-[var(--line)] p-3"
              >
                <code class="text-xs text-[var(--ink)] font-mono break-all"
                  >&lt;link
                  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                  rel="stylesheet" /&gt;</code
                >
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <p class="text-xs font-semibold text-[var(--ink-soft)]">
                CSS Import
              </p>
              <div
                class="bg-[var(--card-soft)] rounded-xl border border-[var(--line)] p-3"
              >
                <code class="text-xs text-[var(--ink)] font-mono"
                  >@import
                  url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');</code
                >
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <p class="text-xs font-semibold text-[var(--ink-soft)]">Usage</p>
              <div class="flex flex-wrap gap-2">
                <code
                  class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-1 rounded"
                  >font-family: 'Inter', sans-serif;</code
                >
                <code
                  class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-1 rounded"
                  >font-weight: 400;</code
                >
                <code
                  class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-1 rounded"
                  >font-weight: 500;</code
                >
                <code
                  class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-1 rounded"
                  >font-weight: 600;</code
                >
                <code
                  class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-1 rounded"
                  >font-weight: 700;</code
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Typography -->
        <div
          class="bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-[var(--line)]">
            <div>
              <h3 class="text-sm font-semibold text-[var(--ink)]">
                Typography
              </h3>
              <p class="text-xs text-[var(--ink-faint)] mt-0.5">
                Skala ukuran yang digunakan di UI.
              </p>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-[var(--line)]">
                  <th
                    class="text-left px-6 py-3 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                    >Token</th
                  >
                  <th
                    class="text-left px-6 py-3 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                    >Size</th
                  >
                  <th
                    class="text-left px-6 py-3 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                    >Weight</th
                  >
                  <th
                    class="text-left px-6 py-3 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                    >Usage</th
                  >
                  <th
                    class="text-left px-6 py-3 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                    >Sample</th
                  >
                </tr>
              </thead>
              <tbody>
                {#each fontSizes as f}
                  <tr class="border-b border-[var(--line)] last:border-0">
                    <td class="px-6 py-3"
                      ><code
                        class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded"
                        >{f.token}</code
                      ></td
                    >
                    <td class="px-6 py-3 text-sm text-[var(--ink)]">{f.size}</td
                    >
                    <td class="px-6 py-3 text-sm text-[var(--ink-soft)]"
                      >{f.weight}</td
                    >
                    <td class="px-6 py-3 text-sm text-[var(--ink-soft)]"
                      >{f.usage}</td
                    >
                    <td class="px-6 py-3">
                      <span
                        style="font-family:'Inter',sans-serif; font-size:{f.size}; font-weight:{f.weight.split(
                          ' ',
                        )[0]};"
                      >
                        Inter
                      </span>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Radius + Shadow -->
        <div class="grid grid-cols-2 gap-4">
          <div
            class="bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden"
          >
            <div class="px-6 py-4 border-b border-[var(--line)]">
              <h3 class="text-sm font-semibold text-[var(--ink)]">
                Border Radius
              </h3>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-[var(--line)]">
                    <th
                      class="text-left px-6 py-3 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Token</th
                    >
                    <th
                      class="text-left px-6 py-3 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Value</th
                    >
                    <th
                      class="text-left px-6 py-3 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Preview</th
                    >
                  </tr>
                </thead>
                <tbody>
                  {#each radii as r}
                    <tr class="border-b border-[var(--line)] last:border-0">
                      <td class="px-6 py-3"
                        ><code
                          class="text-[11px] font-mono text-[var(--accent)]"
                          >{r.var}</code
                        ></td
                      >
                      <td class="px-6 py-3 text-sm text-[var(--ink)]"
                        >{r.value}</td
                      >
                      <td class="px-6 py-3">
                        <div
                          class="w-8 h-8 border-2 border-[var(--line-strong)]"
                          style="border-radius:{r.value};"
                        ></div>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
          <div
            class="bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden"
          >
            <div class="px-6 py-4 border-b border-[var(--line)]">
              <h3 class="text-sm font-semibold text-[var(--ink)]">Shadows</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-[var(--line)]">
                    <th
                      class="text-left px-6 py-3 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Token</th
                    >
                    <th
                      class="text-left px-6 py-3 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Preview</th
                    >
                  </tr>
                </thead>
                <tbody>
                  {#each shadows as s}
                    <tr class="border-b border-[var(--line)] last:border-0">
                      <td class="px-6 py-3"
                        ><code
                          class="text-[11px] font-mono text-[var(--accent)]"
                          >{s.var}</code
                        ></td
                      >
                      <td class="px-6 py-3">
                        <div
                          class="w-8 h-8 rounded-lg bg-white border border-[var(--line)]"
                          style="box-shadow:{s.value};"
                        ></div>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ ATOMS ═══ -->
      <section id="atoms" class="flex flex-col gap-6 scroll-mt-6">
        <div>
          <h2
            class="text-xl font-bold text-[var(--ink)]"
            style="font-family:'Space Grotesk',sans-serif;"
          >
            Atoms
          </h2>
          <p class="text-sm text-[var(--ink-soft)] mt-1">
            Komponen dasar terkecil yang membangun UI.
          </p>
        </div>

        <!-- Button -->
        <div
          class="bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-[var(--line)]">
            <h3 class="text-sm font-semibold text-[var(--ink)]">Button</h3>
            <p class="text-xs text-[var(--ink-faint)] mt-0.5">
              Varian tombol yang tersedia di seluruh aplikasi.
            </p>
          </div>
          <div class="p-5">
            <!-- Live Preview -->
            <div
              class="flex flex-wrap items-center gap-2.5 p-4 rounded-xl bg-[var(--card-soft)] border border-[var(--line)] mb-5"
            >
              <button
                class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-deep)] transition-colors shadow-[var(--shadow-accent)]"
                >Primary</button
              >
              <button
                class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--line)] text-[var(--ink-soft)] text-sm font-medium hover:bg-[var(--card-soft)] hover:text-[var(--ink)] transition-colors"
                >Secondary</button
              >
              <button
                class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[var(--accent)] text-sm font-semibold hover:bg-[var(--accent-soft)] transition-colors"
                >Text</button
              >
              <button
                class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--line)] text-[var(--red)] text-sm font-semibold hover:bg-[var(--red-soft)] transition-colors"
                >Danger</button
              >
              <button
                class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold shadow-[var(--shadow-accent)] opacity-60 cursor-not-allowed"
                disabled>Disabled</button
              >
              <button
                class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold shadow-[var(--shadow-accent)] opacity-80 cursor-wait"
                disabled
              >
                <span
                  class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                ></span>
                Loading
              </button>
            </div>

            <!-- Props Table -->
            <div class="overflow-x-auto mb-4">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-[var(--line)]">
                    <th
                      class="text-left py-2.5 pr-4 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Prop</th
                    >
                    <th
                      class="text-left py-2.5 pr-4 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Type</th
                    >
                    <th
                      class="text-left py-2.5 pr-4 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Default</th
                    >
                    <th
                      class="text-left py-2.5 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Description</th
                    >
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-[var(--line)]">
                    <td class="py-2.5 pr-4"
                      ><code
                        class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded"
                        >variant</code
                      ></td
                    >
                    <td class="py-2.5 pr-4 text-sm text-[var(--ink-soft)]"
                      ><code class="text-xs"
                        >'primary' | 'secondary' | 'text' | 'danger'</code
                      ></td
                    >
                    <td class="py-2.5 pr-4 text-sm text-[var(--ink-soft)]"
                      ><code class="text-xs">'primary'</code></td
                    >
                    <td class="py-2.5 text-sm text-[var(--ink-soft)]"
                      >Visual style variant</td
                    >
                  </tr>
                  <tr class="border-b border-[var(--line)]">
                    <td class="py-2.5 pr-4"
                      ><code
                        class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded"
                        >disabled</code
                      ></td
                    >
                    <td class="py-2.5 pr-4 text-sm text-[var(--ink-soft)]"
                      ><code class="text-xs">boolean</code></td
                    >
                    <td class="py-2.5 pr-4 text-sm text-[var(--ink-soft)]"
                      ><code class="text-xs">false</code></td
                    >
                    <td class="py-2.5 text-sm text-[var(--ink-soft)]"
                      >Disables interaction</td
                    >
                  </tr>
                  <tr class="border-b border-[var(--line)]">
                    <td class="py-2.5 pr-4"
                      ><code
                        class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded"
                        >loading</code
                      ></td
                    >
                    <td class="py-2.5 pr-4 text-sm text-[var(--ink-soft)]"
                      ><code class="text-xs">boolean</code></td
                    >
                    <td class="py-2.5 pr-4 text-sm text-[var(--ink-soft)]"
                      ><code class="text-xs">false</code></td
                    >
                    <td class="py-2.5 text-sm text-[var(--ink-soft)]"
                      >Shows loading spinner</td
                    >
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Code -->
            <div
              class="bg-[var(--card-soft)] rounded-xl border border-[var(--line)] overflow-hidden"
            >
              <div
                class="flex items-center justify-between px-4 py-2.5 border-b border-[var(--line)]"
              >
                <span
                  class="text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                  >Code</span
                >
                <div class="flex items-center gap-2">
                  <button
                    class="flex items-center gap-1.5 text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors text-xs"
                    onclick={() =>
                      copyCode(
                        "code-btn",
                        `<!-- Primary -->\n<button class="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-deep)] shadow-[var(--shadow-accent)]">\n  Primary\n</button>\n\n<!-- Secondary -->\n<button class="px-4 py-2 rounded-xl border border-[var(--line)] text-[var(--ink-soft)] text-sm font-medium hover:bg-[var(--card-soft)]">\n  Secondary\n</button>\n\n<!-- Text -->\n<button class="px-4 py-2 rounded-xl text-[var(--accent)] text-sm font-semibold hover:bg-[var(--accent-soft)]">\n  Text\n</button>\n\n<!-- Danger -->\n<button class="px-4 py-2 rounded-xl border border-[var(--line)] text-[var(--red)] text-sm font-semibold hover:bg-[var(--red-soft)]">\n  Danger\n</button>\n\n<!-- Disabled -->\n<button class="px-4 py-2 rounded-xl bg-[var(--accent)] text-white opacity-60 cursor-not-allowed" disabled>\n  Disabled\n</button>\n\n<!-- Loading -->\n<button class="px-4 py-2 rounded-xl bg-[var(--accent)] text-white opacity-80 cursor-wait" disabled>\n  <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>\n  Loading\n</button>`,
                      )}
                  >
                    {#if copied === "code-btn"}
                      <span
                        class="text-[10px] text-[var(--green)] font-semibold"
                        >Copied!</span
                      >
                    {:else}
                      <i class="fa-regular fa-clipboard text-xs"></i>
                    {/if}
                  </button>
                  <button
                    class="flex items-center justify-center w-5 h-5 rounded text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-[var(--line)] transition-colors"
                    onclick={() => toggleCode("code-btn")}
                  >
                    <i
                      class="fa-solid fa-chevron-down text-[10px] transition-transform {!codeOpen[
                        'code-btn'
                      ]
                        ? ''
                        : '-rotate-90'}"
                    ></i>
                  </button>
                </div>
              </div>
              {#if !codeOpen["code-btn"]}
                <pre
                  class="text-xs text-[var(--ink)] leading-relaxed font-mono p-4 overflow-x-auto">{`<!-- Primary -->
<button class="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-deep)] shadow-[var(--shadow-accent)]">
  Primary
</button>

<!-- Secondary -->
<button class="px-4 py-2 rounded-xl border border-[var(--line)] text-[var(--ink-soft)] text-sm font-medium hover:bg-[var(--card-soft)]">
  Secondary
</button>

<!-- Text -->
<button class="px-4 py-2 rounded-xl text-[var(--accent)] text-sm font-semibold hover:bg-[var(--accent-soft)]">
  Text
</button>

<!-- Danger -->
<button class="px-4 py-2 rounded-xl border border-[var(--line)] text-[var(--red)] text-sm font-semibold hover:bg-[var(--red-soft)]">
  Danger
</button>

<!-- Disabled -->
<button class="px-4 py-2 rounded-xl bg-[var(--accent)] text-white opacity-60 cursor-not-allowed" disabled>
  Disabled
</button>

<!-- Loading -->
<button class="px-4 py-2 rounded-xl bg-[var(--accent)] text-white opacity-80 cursor-wait" disabled>
  <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
  Loading
</button>`}</pre>
              {/if}
            </div>
          </div>
        </div>

        <!-- Badge -->
        <div
          class="bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-[var(--line)]">
            <h3 class="text-sm font-semibold text-[var(--ink)]">Badge</h3>
            <p class="text-xs text-[var(--ink-faint)] mt-0.5">
              Indikator status dengan warna otomatis dari prop <code
                class="font-mono bg-[var(--card-soft)] px-1 rounded text-[var(--accent)]"
                >color</code
              >.
            </p>
          </div>
          <div class="p-5">
            <div
              class="flex flex-wrap items-center gap-2 p-4 rounded-xl bg-[var(--card-soft)] border border-[var(--line)] mb-5"
            >
              <Badge color="var(--green)" label="Active" />
              <Badge color="var(--blue)" label="In Progress" dot />
              <Badge color="var(--orange)" label="Pending" />
              <Badge color="var(--red)" label="Overdue" dot />
              <Badge color="var(--accent)" label="Priority" />
              <Badge color="var(--pink)" label="Review" dot />
            </div>

            <div class="overflow-x-auto mb-4">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-[var(--line)]">
                    <th
                      class="text-left py-2.5 pr-4 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Prop</th
                    >
                    <th
                      class="text-left py-2.5 pr-4 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Type</th
                    >
                    <th
                      class="text-left py-2.5 pr-4 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Default</th
                    >
                    <th
                      class="text-left py-2.5 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Description</th
                    >
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-[var(--line)]">
                    <td class="py-2.5 pr-4"
                      ><code
                        class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded"
                        >color</code
                      ></td
                    >
                    <td class="py-2.5 pr-4 text-sm text-[var(--ink-soft)]"
                      ><code class="text-xs">string</code></td
                    >
                    <td class="py-2.5 pr-4 text-sm text-[var(--ink-soft)]">—</td
                    >
                    <td class="py-2.5 text-sm text-[var(--ink-soft)]"
                      >Text &amp; background (auto-tinted via opacity)</td
                    >
                  </tr>
                  <tr class="border-b border-[var(--line)]">
                    <td class="py-2.5 pr-4"
                      ><code
                        class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded"
                        >label</code
                      ></td
                    >
                    <td class="py-2.5 pr-4 text-sm text-[var(--ink-soft)]"
                      ><code class="text-xs">string</code></td
                    >
                    <td class="py-2.5 pr-4 text-sm text-[var(--ink-soft)]">—</td
                    >
                    <td class="py-2.5 text-sm text-[var(--ink-soft)]"
                      >Display text</td
                    >
                  </tr>
                  <tr class="border-b border-[var(--line)]">
                    <td class="py-2.5 pr-4"
                      ><code
                        class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded"
                        >dot</code
                      ></td
                    >
                    <td class="py-2.5 pr-4 text-sm text-[var(--ink-soft)]"
                      ><code class="text-xs">boolean</code></td
                    >
                    <td class="py-2.5 pr-4 text-sm text-[var(--ink-soft)]"
                      ><code class="text-xs">false</code></td
                    >
                    <td class="py-2.5 text-sm text-[var(--ink-soft)]"
                      >Shows dot before label</td
                    >
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              class="bg-[var(--card-soft)] rounded-xl border border-[var(--line)] overflow-hidden"
            >
              <div
                class="flex items-center justify-between px-4 py-2.5 border-b border-[var(--line)]"
              >
                <span
                  class="text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                  >Code</span
                >
                <div class="flex items-center gap-2">
                  <button
                    class="flex items-center gap-1.5 text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors text-xs"
                    onclick={() =>
                      copyCode(
                        "code-badge",
                        `import Badge from '$components/ui/Badge.svelte';\n\n<Badge color="var(--green)" label="Active" />\n<Badge color="var(--red)" label="Overdue" dot />\n<Badge color="var(--accent)" label="High" />`,
                      )}
                  >
                    {#if copied === "code-badge"}
                      <span
                        class="text-[10px] text-[var(--green)] font-semibold"
                        >Copied!</span
                      >
                    {:else}
                      <i class="fa-regular fa-clipboard text-xs"></i>
                    {/if}
                  </button>
                  <button
                    class="flex items-center justify-center w-5 h-5 rounded text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-[var(--line)] transition-colors"
                    onclick={() => toggleCode("code-badge")}
                  >
                    <i
                      class="fa-solid fa-chevron-down text-[10px] transition-transform {!codeOpen[
                        'code-badge'
                      ]
                        ? ''
                        : '-rotate-90'}"
                    ></i>
                  </button>
                </div>
              </div>
              {#if !codeOpen["code-badge"]}
                <pre
                  class="text-xs text-[var(--ink)] leading-relaxed font-mono p-4 overflow-x-auto">{`import Badge from '$components/ui/Badge.svelte';

<Badge color="var(--green)" label="Active" />
<Badge color="var(--red)" label="Overdue" dot />
<Badge color="var(--accent)" label="High" />`}</pre>
              {/if}
            </div>
          </div>
        </div>

        <!-- Avatar -->
        <div
          class="bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-[var(--line)]">
            <h3 class="text-sm font-semibold text-[var(--ink)]">Avatar</h3>
            <p class="text-xs text-[var(--ink-faint)] mt-0.5">
              Lingkaran inisial dengan warna, 3 ukuran.
            </p>
          </div>
          <div class="p-5">
            <div
              class="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-[var(--card-soft)] border border-[var(--line)] mb-5"
            >
              <Avatar name="Ian F" color="var(--accent)" size="sm" />
              <Avatar name="Rina" color="var(--blue)" size="md" />
              <Avatar name="Budi" color="var(--green)" size="lg" />
              <Avatar name="Sari" color="var(--orange)" size="sm" />
              <Avatar name="Doni" color="var(--pink)" size="md" />
              <Avatar name="Ayu" color="var(--amber)" size="lg" />
            </div>

            <div class="overflow-x-auto mb-4">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-[var(--line)]">
                    <th
                      class="text-left py-2.5 pr-4 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Prop</th
                    >
                    <th
                      class="text-left py-2.5 pr-4 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Type</th
                    >
                    <th
                      class="text-left py-2.5 pr-4 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Default</th
                    >
                    <th
                      class="text-left py-2.5 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Description</th
                    >
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-[var(--line)]">
                    <td class="py-2.5 pr-4"
                      ><code
                        class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded"
                        >name</code
                      ></td
                    >
                    <td class="py-2.5 pr-4 text-sm text-[var(--ink-soft)]"
                      ><code class="text-xs">string</code></td
                    >
                    <td class="py-2.5 pr-4 text-sm text-[var(--ink-soft)]">—</td
                    >
                    <td class="py-2.5 text-sm text-[var(--ink-soft)]"
                      >Full name (initial auto-extracted)</td
                    >
                  </tr>
                  <tr class="border-b border-[var(--line)]">
                    <td class="py-2.5 pr-4"
                      ><code
                        class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded"
                        >color</code
                      ></td
                    >
                    <td class="py-2.5 pr-4 text-sm text-[var(--ink-soft)]"
                      ><code class="text-xs">string</code></td
                    >
                    <td class="py-2.5 pr-4 text-sm text-[var(--ink-soft)]">—</td
                    >
                    <td class="py-2.5 text-sm text-[var(--ink-soft)]"
                      >Background color</td
                    >
                  </tr>
                  <tr class="border-b border-[var(--line)]">
                    <td class="py-2.5 pr-4"
                      ><code
                        class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded"
                        >size</code
                      ></td
                    >
                    <td class="py-2.5 pr-4 text-sm text-[var(--ink-soft)]"
                      ><code class="text-xs">'sm' | 'md' | 'lg'</code></td
                    >
                    <td class="py-2.5 pr-4 text-sm text-[var(--ink-soft)]"
                      ><code class="text-xs">'md'</code></td
                    >
                    <td class="py-2.5 text-sm text-[var(--ink-soft)]"
                      >sm=24px, md=32px, lg=40px</td
                    >
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              class="bg-[var(--card-soft)] rounded-xl border border-[var(--line)] overflow-hidden"
            >
              <div
                class="flex items-center justify-between px-4 py-2.5 border-b border-[var(--line)]"
              >
                <span
                  class="text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                  >Code</span
                >
                <div class="flex items-center gap-2">
                  <button
                    class="flex items-center gap-1.5 text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors text-xs"
                    onclick={() =>
                      copyCode(
                        "code-avatar",
                        `import Avatar from '$components/ui/Avatar.svelte';\n\n<Avatar name="Ian F" color="var(--accent)" size="sm" />\n<Avatar name="Rina" color="var(--blue)" size="md" />\n<Avatar name="Budi" color="var(--green)" size="lg" />`,
                      )}
                  >
                    {#if copied === "code-avatar"}
                      <span
                        class="text-[10px] text-[var(--green)] font-semibold"
                        >Copied!</span
                      >
                    {:else}
                      <i class="fa-regular fa-clipboard text-xs"></i>
                    {/if}
                  </button>
                  <button
                    class="flex items-center justify-center w-5 h-5 rounded text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-[var(--line)] transition-colors"
                    onclick={() => toggleCode("code-avatar")}
                  >
                    <i
                      class="fa-solid fa-chevron-down text-[10px] transition-transform {!codeOpen[
                        'code-avatar'
                      ]
                        ? ''
                        : '-rotate-90'}"
                    ></i>
                  </button>
                </div>
              </div>
              {#if !codeOpen["code-avatar"]}
                <pre
                  class="text-xs text-[var(--ink)] leading-relaxed font-mono p-4 overflow-x-auto">{`import Avatar from '$components/ui/Avatar.svelte';

<Avatar name="Ian F" color="var(--accent)" size="sm" />
<Avatar name="Rina" color="var(--blue)" size="md" />
<Avatar name="Budi" color="var(--green)" size="lg" />`}</pre>
              {/if}
            </div>
          </div>
        </div>

        <!-- Input -->
        <div
          class="bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-[var(--line)]">
            <h3 class="text-sm font-semibold text-[var(--ink)]">Input</h3>
            <p class="text-xs text-[var(--ink-faint)] mt-0.5">
              Text input, textarea, dan select — pola konsisten di seluruh form.
            </p>
          </div>
          <div class="p-5">
            <div
              class="flex flex-col gap-3 p-4 rounded-xl bg-[var(--card-soft)] border border-[var(--line)] mb-5"
            >
              <input
                type="text"
                placeholder="Placeholder text…"
                value=""
                class="w-full px-3.5 py-2.5 text-sm border border-[var(--line)] rounded-xl bg-white text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
              />
              <textarea
                placeholder="Textarea placeholder…"
                rows="3"
                class="w-full px-3.5 py-2.5 text-sm border border-[var(--line)] rounded-xl bg-white text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors resize-none"
              ></textarea>
              <select
                class="w-full px-3.5 py-2.5 text-sm border border-[var(--line)] rounded-xl bg-white text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors appearance-none"
              >
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>

            <div class="overflow-x-auto mb-4">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-[var(--line)]">
                    <th
                      class="text-left py-2.5 pr-4 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Element</th
                    >
                    <th
                      class="text-left py-2.5 pr-4 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Classes</th
                    >
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-[var(--line)]">
                    <td class="py-2.5 pr-4"
                      ><code
                        class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded"
                        >input</code
                      ></td
                    >
                    <td class="py-2.5"
                      ><code class="text-xs text-[var(--ink-soft)]"
                        >w-full px-3.5 py-2.5 text-sm border
                        border-[var(--line)] rounded-xl bg-white
                        text-[var(--ink)] placeholder-[var(--ink-faint)]
                        focus:outline-none focus:border-[var(--accent)]
                        focus:ring-1 focus:ring-[var(--accent)]</code
                      ></td
                    >
                  </tr>
                  <tr class="border-b border-[var(--line)]">
                    <td class="py-2.5 pr-4"
                      ><code
                        class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded"
                        >textarea</code
                      ></td
                    >
                    <td class="py-2.5"
                      ><code class="text-xs text-[var(--ink-soft)]"
                        >Sama + resize-none (opsional)</code
                      ></td
                    >
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              class="bg-[var(--card-soft)] rounded-xl border border-[var(--line)] overflow-hidden"
            >
              <div
                class="flex items-center justify-between px-4 py-2.5 border-b border-[var(--line)]"
              >
                <span
                  class="text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                  >Code</span
                >
                <div class="flex items-center gap-2">
                  <button
                    class="flex items-center gap-1.5 text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors text-xs"
                    onclick={() =>
                      copyCode(
                        "code-input",
                        `<!-- Text Input -->\n<input type="text" placeholder="Placeholder\u2026"\n  class="w-full px-3.5 py-2.5 text-sm border border-[var(--line)] rounded-xl bg-white text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]" />\n\n<!-- Textarea -->\n<textarea rows="3"\n  class="w-full px-3.5 py-2.5 text-sm border border-[var(--line)] rounded-xl bg-white text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] resize-none"></textarea>`,
                      )}
                  >
                    {#if copied === "code-input"}
                      <span
                        class="text-[10px] text-[var(--green)] font-semibold"
                        >Copied!</span
                      >
                    {:else}
                      <i class="fa-regular fa-clipboard text-xs"></i>
                    {/if}
                  </button>
                  <button
                    class="flex items-center justify-center w-5 h-5 rounded text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-[var(--line)] transition-colors"
                    onclick={() => toggleCode("code-input")}
                  >
                    <i
                      class="fa-solid fa-chevron-down text-[10px] transition-transform {!codeOpen[
                        'code-input'
                      ]
                        ? ''
                        : '-rotate-90'}"
                    ></i>
                  </button>
                </div>
              </div>
              {#if !codeOpen["code-input"]}
                <pre
                  class="text-xs text-[var(--ink)] leading-relaxed font-mono p-4 overflow-x-auto">{`<!-- Text Input -->
<input type="text" placeholder="Placeholder…"
  class="w-full px-3.5 py-2.5 text-sm border border-[var(--line)] rounded-xl bg-white text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]" />

<!-- Textarea -->
<textarea rows="3"
  class="w-full px-3.5 py-2.5 text-sm border border-[var(--line)] rounded-xl bg-white text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] resize-none"></textarea>`}</pre>
              {/if}
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ MOLECULES ═══ -->
      <section id="molecules" class="flex flex-col gap-6 scroll-mt-6">
        <div>
          <h2
            class="text-xl font-bold text-[var(--ink)]"
            style="font-family:'Space Grotesk',sans-serif;"
          >
            Molecules
          </h2>
          <p class="text-sm text-[var(--ink-soft)] mt-1">
            Kombinasi atom menjadi komponen fungsional.
          </p>
        </div>

        <!-- Segmented Control (View Switcher) -->
        <div
          class="bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-[var(--line)]">
            <h3 class="text-sm font-semibold text-[var(--ink)]">
              Segmented Control
            </h3>
            <p class="text-xs text-[var(--ink-faint)] mt-0.5">
              Pill-style toggle — varian besar (view switcher) dan kecil (period
              tabs).
            </p>
          </div>
          <div class="p-5 flex flex-col gap-6">
            <!-- Large variant (like Tasks view switcher) -->
            <div>
              <p class="text-xs font-semibold text-[var(--ink-soft)] mb-2.5">
                Large (View Switcher)
              </p>
              <div
                class="p-4 rounded-xl bg-[var(--card-soft)] border border-[var(--line)]"
              >
                <div
                  class="flex items-center gap-1 bg-[var(--card-soft)] rounded-xl p-1 border border-[var(--line)] w-fit"
                >
                  {#each [["Kanban", "fa-table-columns"], ["List", "fa-list"], ["Table", "fa-table"]] as [label, icon]}
                    <button
                      class="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors {activeSegmented ===
                      ['Kanban', 'List', 'Table'].indexOf(label)
                        ? 'bg-white text-[var(--ink)] shadow-sm font-semibold'
                        : 'text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-white/60'}"
                      onclick={() =>
                        (activeSegmented = ["Kanban", "List", "Table"].indexOf(
                          label,
                        ))}
                    >
                      <i
                        class="fa-solid {icon} text-xs {activeSegmented ===
                        ['Kanban', 'List', 'Table'].indexOf(label)
                          ? 'text-[var(--accent)]'
                          : ''}"
                      ></i>
                      {label}
                    </button>
                  {/each}
                </div>
              </div>
            </div>

            <!-- Small variant (like Dashboard period tabs) -->
            <div>
              <p class="text-xs font-semibold text-[var(--ink-soft)] mb-2.5">
                Small (Period Tabs)
              </p>
              <div
                class="p-4 rounded-xl bg-[var(--card-soft)] border border-[var(--line)]"
              >
                <div
                  class="flex items-center gap-1 bg-[var(--card-soft)] rounded-lg p-1 border border-[var(--line)] w-fit"
                >
                  {#each [["Harian", "daily"], ["Mingguan", "weekly"], ["Bulanan", "monthly"]] as [label, key]}
                    <button
                      class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors {activePeriod ===
                      ['daily', 'weekly', 'monthly'].indexOf(key)
                        ? 'bg-white text-[var(--ink)] shadow-sm'
                        : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'}"
                      onclick={() =>
                        (activePeriod = ["daily", "weekly", "monthly"].indexOf(
                          key,
                        ))}
                    >
                      {label}
                    </button>
                  {/each}
                </div>
              </div>
            </div>

            <!-- Props Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-[var(--line)]">
                    <th
                      class="text-left py-2.5 pr-4 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Size</th
                    >
                    <th
                      class="text-left py-2.5 pr-4 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Container</th
                    >
                    <th
                      class="text-left py-2.5 pr-4 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Button</th
                    >
                    <th
                      class="text-left py-2.5 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Active</th
                    >
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-[var(--line)]">
                    <td class="py-2.5 pr-4"
                      ><code
                        class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded"
                        >Large</code
                      ></td
                    >
                    <td class="py-2.5 pr-4"
                      ><code class="text-xs text-[var(--ink-soft)]"
                        >bg-[var(--card-soft)] rounded-xl p-1 border
                        border-[var(--line)]</code
                      ></td
                    >
                    <td class="py-2.5 pr-4"
                      ><code class="text-xs text-[var(--ink-soft)]"
                        >px-3.5 py-2 rounded-lg text-sm font-medium</code
                      ></td
                    >
                    <td class="py-2.5"
                      ><code class="text-xs text-[var(--ink-soft)]"
                        >bg-white shadow-sm font-semibold</code
                      ></td
                    >
                  </tr>
                  <tr>
                    <td class="py-2.5 pr-4"
                      ><code
                        class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded"
                        >Small</code
                      ></td
                    >
                    <td class="py-2.5 pr-4"
                      ><code class="text-xs text-[var(--ink-soft)]"
                        >bg-[var(--card-soft)] rounded-lg p-1 border
                        border-[var(--line)]</code
                      ></td
                    >
                    <td class="py-2.5 pr-4"
                      ><code class="text-xs text-[var(--ink-soft)]"
                        >px-3 py-1.5 rounded-md text-xs font-medium</code
                      ></td
                    >
                    <td class="py-2.5"
                      ><code class="text-xs text-[var(--ink-soft)]"
                        >bg-white shadow-sm</code
                      ></td
                    >
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Card (TaskCard style) -->
        <div
          class="bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-[var(--line)]">
            <h3 class="text-sm font-semibold text-[var(--ink)]">
              Card (TaskCard)
            </h3>
            <p class="text-xs text-[var(--ink-faint)] mt-0.5">
              Container konten dengan border, shadow hover, padding 14px —
              persis pola dari Kanban TaskCard.
            </p>
          </div>
          <div class="p-5">
            <!-- Live Preview — exact TaskCard pattern -->
            <div
              class="p-4 rounded-xl bg-[var(--card-soft)] border border-[var(--line)] mb-5"
            >
              <article
                class="bg-white rounded-xl border border-[var(--line)] p-3.5 flex flex-col gap-2.5 hover:shadow-[var(--shadow-card-hover)] transition-shadow cursor-pointer max-w-xs"
              >
                <!-- Header row -->
                <div class="flex items-start gap-2">
                  <div class="flex-1 min-w-0">
                    <p
                      class="text-sm font-semibold text-[var(--ink)] leading-snug break-words"
                    >
                      Card Title Example
                    </p>
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <button
                      class="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--ink-faint)] hover:bg-[var(--card-soft)] hover:text-[var(--ink)] transition-colors"
                    >
                      <i class="fa-solid fa-pen text-[10px]"></i>
                    </button>
                  </div>
                </div>
                <!-- Badges -->
                <div class="flex flex-wrap gap-1.5 items-center">
                  <Badge color="var(--green)" label="To Do" dot />
                  <Badge color="var(--blue)" label="Frontend" />
                </div>
                <!-- Description -->
                <p
                  class="text-xs text-[var(--ink-faint)] leading-relaxed line-clamp-2"
                >
                  Deskripsi singkat tentang konten card ini.
                </p>
              </article>
            </div>

            <div class="overflow-x-auto mb-4">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-[var(--line)]">
                    <th
                      class="text-left py-2.5 pr-4 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Classes</th
                    >
                    <th
                      class="text-left py-2.5 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Description</th
                    >
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-[var(--line)]">
                    <td class="py-2.5 pr-4"
                      ><code class="text-xs text-[var(--ink-soft)]"
                        >bg-white rounded-xl border border-[var(--line)]</code
                      ></td
                    >
                    <td class="py-2.5 text-sm text-[var(--ink-soft)]"
                      >Default card appearance</td
                    >
                  </tr>
                  <tr class="border-b border-[var(--line)]">
                    <td class="py-2.5 pr-4"
                      ><code class="text-xs text-[var(--ink-soft)]">p-3.5</code
                      ></td
                    >
                    <td class="py-2.5 text-sm text-[var(--ink-soft)]"
                      >Padding 14px all sides</td
                    >
                  </tr>
                  <tr class="border-b border-[var(--line)]">
                    <td class="py-2.5 pr-4"
                      ><code class="text-xs text-[var(--ink-soft)]"
                        >hover:shadow-[var(--shadow-card-hover)]</code
                      ></td
                    >
                    <td class="py-2.5 text-sm text-[var(--ink-soft)]"
                      >Shadow on hover</td
                    >
                  </tr>
                  <tr>
                    <td class="py-2.5 pr-4"
                      ><code class="text-xs text-[var(--ink-soft)]"
                        >transition-shadow cursor-pointer</code
                      ></td
                    >
                    <td class="py-2.5 text-sm text-[var(--ink-soft)]"
                      >Smooth animation + clickable</td
                    >
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              class="bg-[var(--card-soft)] rounded-xl border border-[var(--line)] overflow-hidden"
            >
              <div
                class="flex items-center justify-between px-4 py-2.5 border-b border-[var(--line)]"
              >
                <span
                  class="text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                  >Code</span
                >
                <div class="flex items-center gap-2">
                  <button
                    class="flex items-center gap-1.5 text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors text-xs"
                    onclick={() =>
                      copyCode(
                        "code-card",
                        `<article class="bg-white rounded-xl border border-[var(--line)] p-3.5 flex flex-col gap-2.5 hover:shadow-[var(--shadow-card-hover)] transition-shadow cursor-pointer">\n  <div class="flex items-start gap-2">\n    <div class="flex-1 min-w-0">\n      <p class="text-sm font-semibold text-[var(--ink)] leading-snug">\n        Title\n      </p>\n    </div>\n  </div>\n  <div class="flex flex-wrap gap-1.5 items-center">\n    <Badge color="var(--green)" label="To Do" dot />\n    <Badge color="var(--blue)" label="Frontend" />\n  </div>\n  <p class="text-xs text-[var(--ink-faint)] leading-relaxed line-clamp-2">\n    Description\n  </p>\n</article>`,
                      )}
                  >
                    {#if copied === "code-card"}
                      <span
                        class="text-[10px] text-[var(--green)] font-semibold"
                        >Copied!</span
                      >
                    {:else}
                      <i class="fa-regular fa-clipboard text-xs"></i>
                    {/if}
                  </button>
                  <button
                    class="flex items-center justify-center w-5 h-5 rounded text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-[var(--line)] transition-colors"
                    onclick={() => toggleCode("code-card")}
                  >
                    <i
                      class="fa-solid fa-chevron-down text-[10px] transition-transform {!codeOpen[
                        'code-card'
                      ]
                        ? ''
                        : '-rotate-90'}"
                    ></i>
                  </button>
                </div>
              </div>
              {#if !codeOpen["code-card"]}
                <pre
                  class="text-xs text-[var(--ink)] leading-relaxed font-mono p-4 overflow-x-auto">{`<article class="bg-white rounded-xl border border-[var(--line)] p-3.5 flex flex-col gap-2.5 hover:shadow-[var(--shadow-card-hover)] transition-shadow cursor-pointer">
  <div class="flex items-start gap-2">
    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold text-[var(--ink)] leading-snug">
        Title
      </p>
    </div>
  </div>
  <div class="flex flex-wrap gap-1.5 items-center">
    <Badge color="var(--green)" label="To Do" dot />
    <Badge color="var(--blue)" label="Frontend" />
  </div>
  <p class="text-xs text-[var(--ink-faint)] leading-relaxed line-clamp-2">
    Description
  </p>
</article>`}</pre>
              {/if}
            </div>
          </div>
        </div>

        <!-- Card with Image -->
        <div
          class="bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-[var(--line)]">
            <h3 class="text-sm font-semibold text-[var(--ink)]">
              Card with Image
            </h3>
            <p class="text-xs text-[var(--ink-faint)] mt-0.5">
              Card dengan gambar header, judul, deskripsi, dan aksi — pola dari
              task detail dan resource panel.
            </p>
          </div>
          <div class="p-5">
            <div
              class="p-4 rounded-xl bg-[var(--card-soft)] border border-[var(--line)] mb-5"
            >
              <div
                class="max-w-xs bg-white rounded-xl border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden"
              >
                <div
                  class="h-24 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-deep)]"
                ></div>
                <div class="p-3.5 flex flex-col gap-3">
                  <div>
                    <h4 class="text-sm font-semibold text-[var(--ink)]">
                      Project Brief
                    </h4>
                    <p
                      class="text-xs text-[var(--ink-faint)] mt-0.5 leading-relaxed"
                    >
                      Deskripsi singkat tentang proyek atau resource ini.
                    </p>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      class="flex-1 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold hover:bg-[var(--accent-deep)] transition-colors"
                      >Buka</button
                    >
                    <button
                      class="px-3 py-1.5 rounded-lg border border-[var(--line)] text-[var(--ink-soft)] text-xs font-medium hover:bg-[var(--card-soft)] transition-colors"
                      >Bagikan</button
                    >
                  </div>
                </div>
              </div>
            </div>
            <div
              class="bg-[var(--card-soft)] rounded-xl border border-[var(--line)] overflow-hidden"
            >
              <div
                class="flex items-center justify-between px-4 py-2.5 border-b border-[var(--line)]"
              >
                <span
                  class="text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                  >Code</span
                >
                <div class="flex items-center gap-2">
                  <button
                    class="flex items-center gap-1.5 text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors text-xs"
                    onclick={() =>
                      copyCode(
                        "code-card-img",
                        `<div class="max-w-xs bg-white rounded-xl border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden">\n  <div class="h-24 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-deep)]"></div>\n  <div class="p-3.5 flex flex-col gap-3">\n    <h4 class="text-sm font-semibold text-[var(--ink)]">Title</h4>\n    <p class="text-xs text-[var(--ink-faint)]">Description</p>\n    <div class="flex items-center gap-2">\n      <button class="flex-1 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold">Action</button>\n      <button class="px-3 py-1.5 rounded-lg border border-[var(--line)] text-[var(--ink-soft)] text-xs font-medium">Share</button>\n    </div>\n  </div>\n</div>`,
                      )}
                  >
                    {#if copied === "code-card-img"}
                      <span
                        class="text-[10px] text-[var(--green)] font-semibold"
                        >Copied!</span
                      >
                    {:else}
                      <i class="fa-regular fa-clipboard text-xs"></i>
                    {/if}
                  </button>
                  <button
                    class="flex items-center justify-center w-5 h-5 rounded text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-[var(--line)] transition-colors"
                    onclick={() => toggleCode("code-card-img")}
                  >
                    <i
                      class="fa-solid fa-chevron-down text-[10px] transition-transform {!codeOpen[
                        'code-card-img'
                      ]
                        ? ''
                        : '-rotate-90'}"
                    ></i>
                  </button>
                </div>
              </div>
              {#if !codeOpen["code-card-img"]}
                <pre
                  class="text-xs text-[var(--ink)] leading-relaxed font-mono p-4 overflow-x-auto">{`<div class="max-w-xs bg-white rounded-xl border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden">
  <div class="h-24 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-deep)]"></div>
  <div class="p-3.5 flex flex-col gap-3">
    <h4 class="text-sm font-semibold text-[var(--ink)]">Title</h4>
    <p class="text-xs text-[var(--ink-faint)]">Description</p>
    <div class="flex items-center gap-2">
      <button class="flex-1 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold">Action</button>
      <button class="px-3 py-1.5 rounded-lg border border-[var(--line)] text-[var(--ink-soft)] text-xs font-medium">Share</button>
    </div>
  </div>
</div>`}</pre>
              {/if}
            </div>
          </div>
        </div>

        <!-- Tab Navigation (Project level) -->
        <div
          class="bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-[var(--line)]">
            <h3 class="text-sm font-semibold text-[var(--ink)]">
              Tab Navigation
            </h3>
            <p class="text-xs text-[var(--ink-faint)] mt-0.5">
              Horizontal pill tabs untuk navigasi halaman proyek (Tasks,
              Resources, Team, Settings).
            </p>
          </div>
          <div class="p-5">
            <div
              class="p-4 rounded-xl bg-[var(--card-soft)] border border-[var(--line)] mb-5"
            >
              <div
                class="flex items-center gap-1 rounded-xl bg-white border border-[var(--line)] shadow-[var(--shadow-card)] p-1 w-fit"
              >
                {#each [["Tasks", "fa-list-check"], ["Resources", "fa-boxes"], ["Team", "fa-users"], ["Settings", "fa-gear"]] as [label, icon]}
                  <button
                    class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap
                      {activeTabNav ===
                    ['Tasks', 'Resources', 'Team', 'Settings'].indexOf(label)
                      ? 'bg-[var(--card-soft)] text-[var(--ink)] font-semibold'
                      : 'text-[var(--ink-soft)] hover:bg-[var(--card-soft)] hover:text-[var(--ink)]'}"
                    onclick={() =>
                      (activeTabNav = [
                        "Tasks",
                        "Resources",
                        "Team",
                        "Settings",
                      ].indexOf(label))}
                  >
                    <i
                      class="fa-solid {icon} text-xs {activeTabNav ===
                      ['Tasks', 'Resources', 'Team', 'Settings'].indexOf(label)
                        ? 'text-[var(--accent)]'
                        : 'text-[var(--ink-faint)]'}"
                    ></i>
                    {label}
                  </button>
                {/each}
              </div>
              <!-- Content panel -->
              <div
                class="mt-3 px-4 py-3 rounded-xl bg-white border border-[var(--line)] text-sm text-[var(--ink-soft)]"
              >
                {#if activeTabNav === 0}
                  <p>Daftar tugas dalam proyek — kanban, list, atau tabel.</p>
                {:else if activeTabNav === 1}
                  <p>File, tautan, dan referensi proyek.</p>
                {:else if activeTabNav === 2}
                  <p>Anggota tim yang tergabung dalam proyek.</p>
                {:else}
                  <p>Pengaturan dan konfigurasi proyek.</p>
                {/if}
              </div>
            </div>

            <div class="overflow-x-auto mb-4">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-[var(--line)]">
                    <th
                      class="text-left py-2.5 pr-4 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Element</th
                    >
                    <th
                      class="text-left py-2.5 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Classes</th
                    >
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-[var(--line)]">
                    <td class="py-2.5 pr-4"
                      ><code
                        class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded"
                        >Container</code
                      ></td
                    >
                    <td class="py-2.5"
                      ><code class="text-xs text-[var(--ink-soft)]"
                        >rounded-xl bg-white border border-[var(--line)]
                        shadow-[var(--shadow-card)] p-1</code
                      ></td
                    >
                  </tr>
                  <tr>
                    <td class="py-2.5 pr-4"
                      ><code
                        class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded"
                        >Tab Item</code
                      ></td
                    >
                    <td class="py-2.5"
                      ><code class="text-xs text-[var(--ink-soft)]"
                        >flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm
                        font-medium</code
                      ></td
                    >
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div
          class="bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-[var(--line)]">
            <h3 class="text-sm font-semibold text-[var(--ink)]">
              Progress Bar
            </h3>
            <p class="text-xs text-[var(--ink-faint)] mt-0.5">
              Bar tipis untuk progress — digunakan di Dashboard dan project
              overview.
            </p>
          </div>
          <div class="p-5">
            <div
              class="flex flex-col gap-4 p-4 rounded-xl bg-[var(--card-soft)] border border-[var(--line)] mb-5"
            >
              {#each [{ label: "Design", pct: 75 }, { label: "Development", pct: 45 }, { label: "Testing", pct: 90 }, { label: "Deployment", pct: 30 }] as { label, pct }}
                <div class="flex items-center gap-3">
                  <span
                    class="text-xs font-medium text-[var(--ink)] w-24 shrink-0"
                    >{label}</span
                  >
                  <div
                    class="flex-1 h-2 bg-[var(--line)] rounded-full overflow-hidden"
                  >
                    <div
                      class="h-full rounded-full transition-all"
                      style="width:{pct}%; background:{pct > 80
                        ? 'var(--green)'
                        : pct > 50
                          ? 'var(--orange)'
                          : 'var(--blue)'};"
                    ></div>
                  </div>
                  <span
                    class="text-xs font-medium text-[var(--ink-faint)] w-8 text-right"
                    >{pct}%</span
                  >
                </div>
              {/each}
            </div>

            <div
              class="bg-[var(--card-soft)] rounded-xl border border-[var(--line)] overflow-hidden"
            >
              <div
                class="flex items-center justify-between px-4 py-2.5 border-b border-[var(--line)]"
              >
                <span
                  class="text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                  >Code</span
                >
                <div class="flex items-center gap-2">
                  <button
                    class="flex items-center gap-1.5 text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors text-xs"
                    onclick={() =>
                      copyCode(
                        "code-progress",
                        `<div class="flex items-center gap-3">\n  <span class="text-xs font-medium text-[var(--ink)] w-24">Task</span>\n  <div class="flex-1 h-2 bg-[var(--line)] rounded-full overflow-hidden">\n    <div class="h-full rounded-full" style="width:75%; background:var(--green);"></div>\n  </div>\n  <span class="text-xs font-medium text-[var(--ink-faint)]">75%</span>\n</div>`,
                      )}
                  >
                    {#if copied === "code-progress"}
                      <span
                        class="text-[10px] text-[var(--green)] font-semibold"
                        >Copied!</span
                      >
                    {:else}
                      <i class="fa-regular fa-clipboard text-xs"></i>
                    {/if}
                  </button>
                  <button
                    class="flex items-center justify-center w-5 h-5 rounded text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-[var(--line)] transition-colors"
                    onclick={() => toggleCode("code-progress")}
                  >
                    <i
                      class="fa-solid fa-chevron-down text-[10px] transition-transform {!codeOpen[
                        'code-progress'
                      ]
                        ? ''
                        : '-rotate-90'}"
                    ></i>
                  </button>
                </div>
              </div>
              {#if !codeOpen["code-progress"]}
                <pre
                  class="text-xs text-[var(--ink)] leading-relaxed font-mono p-4 overflow-x-auto">{`<div class="flex items-center gap-3">
  <span class="text-xs font-medium text-[var(--ink)] w-24">Task</span>
  <div class="flex-1 h-2 bg-[var(--line)] rounded-full overflow-hidden">
    <div class="h-full rounded-full" style="width:75%; background:var(--green);"></div>
  </div>
  <span class="text-xs font-medium text-[var(--ink-faint)]">75%</span>
</div>`}</pre>
              {/if}
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ ORGANISMS ═══ -->
      <section id="organisms" class="flex flex-col gap-6 scroll-mt-6">
        <div>
          <h2
            class="text-xl font-bold text-[var(--ink)]"
            style="font-family:'Space Grotesk',sans-serif;"
          >
            Organisms
          </h2>
          <p class="text-sm text-[var(--ink-soft)] mt-1">
            Komponen besar yang berdiri sendiri — modal, header, sidebar.
          </p>
        </div>

        <!-- Modal -->
        <div
          class="bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-[var(--line)]">
            <h3 class="text-sm font-semibold text-[var(--ink)]">Modal</h3>
            <p class="text-xs text-[var(--ink-faint)] mt-0.5">
              Dialog pop-up dengan backdrop blur, header, body scroll, dan
              footer actions.
            </p>
          </div>
          <div class="p-5">
            <div
              class="p-4 rounded-xl bg-[var(--card-soft)] border border-[var(--line)] mb-5"
            >
              <button
                class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-deep)] transition-colors shadow-[var(--shadow-accent)]"
                onclick={() => (viewingModal = true)}
              >
                <i class="fa-solid fa-window-restore text-xs"></i>
                Buka Modal
              </button>
            </div>

            <!-- Interactive Modal -->
            {#if viewingModal}
              <div
                class="fixed inset-0 z-50 flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
                onmousedown={(e) => {
                  if (e.target === e.currentTarget) viewingModal = false;
                }}
                onkeydown={(e) => {
                  if (e.key === "Escape") viewingModal = false;
                }}
              >
                <div
                  class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                ></div>
                <div
                  class="relative w-full max-w-md bg-white rounded-2xl shadow-[var(--shadow-modal)] flex flex-col max-h-[90vh]"
                >
                  <div
                    class="flex items-start gap-3 px-6 pt-5 pb-4 border-b border-[var(--line)] shrink-0"
                  >
                    <div class="flex-1 min-w-0">
                      <h2
                        class="text-base font-bold text-[var(--ink)] leading-snug"
                      >
                        Modal Title
                      </h2>
                    </div>
                    <button
                      class="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--ink-faint)] hover:bg-[var(--card-soft)] hover:text-[var(--ink)] transition-colors shrink-0"
                      onclick={() => (viewingModal = false)}
                    >
                      <i class="fa-solid fa-xmark text-sm"></i>
                    </button>
                  </div>
                  <div class="flex-1 overflow-y-auto px-6 py-5">
                    <p class="text-sm text-[var(--ink)] leading-relaxed">
                      Ini adalah contoh modal interaktif. Body dapat di-scroll
                      jika kontennya panjang.
                    </p>
                    <p
                      class="text-sm text-[var(--ink-soft)] mt-3 leading-relaxed"
                    >
                      Modal bisa ditutup dengan: klik ✕, klik overlay di luar,
                      atau tekan Escape.
                    </p>
                  </div>
                  <div
                    class="flex items-center justify-end gap-2 px-6 py-4 border-t border-[var(--line)] shrink-0"
                  >
                    <button
                      class="px-4 py-2 rounded-xl border border-[var(--line)] text-[var(--ink-soft)] text-sm font-medium hover:bg-[var(--card-soft)] hover:text-[var(--ink)] transition-colors"
                      onclick={() => (viewingModal = false)}
                    >
                      Batal
                    </button>
                    <button
                      class="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-deep)] transition-colors shadow-[var(--shadow-accent)]"
                      onclick={() => (viewingModal = false)}
                    >
                      Konfirmasi
                    </button>
                  </div>
                </div>
              </div>
            {/if}

            <div class="overflow-x-auto mb-4">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-[var(--line)]">
                    <th
                      class="text-left py-2.5 pr-4 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Element</th
                    >
                    <th
                      class="text-left py-2.5 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Classes / Structure</th
                    >
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-[var(--line)]">
                    <td class="py-2.5 pr-4"
                      ><code
                        class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded"
                        >Overlay</code
                      ></td
                    >
                    <td class="py-2.5"
                      ><code class="text-xs text-[var(--ink-soft)]"
                        >fixed inset-0 bg-black/40 backdrop-blur-[2px]</code
                      ></td
                    >
                  </tr>
                  <tr class="border-b border-[var(--line)]">
                    <td class="py-2.5 pr-4"
                      ><code
                        class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded"
                        >Panel</code
                      ></td
                    >
                    <td class="py-2.5"
                      ><code class="text-xs text-[var(--ink-soft)]"
                        >relative w-full max-w-md bg-white rounded-2xl
                        shadow-[var(--shadow-modal)] max-h-[90vh] flex flex-col</code
                      ></td
                    >
                  </tr>
                  <tr class="border-b border-[var(--line)]">
                    <td class="py-2.5 pr-4"
                      ><code
                        class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded"
                        >Header</code
                      ></td
                    >
                    <td class="py-2.5"
                      ><code class="text-xs text-[var(--ink-soft)]"
                        >flex items-start gap-3 px-6 pt-5 pb-4 border-b
                        border-[var(--line)]</code
                      ></td
                    >
                  </tr>
                  <tr class="border-b border-[var(--line)]">
                    <td class="py-2.5 pr-4"
                      ><code
                        class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded"
                        >Body</code
                      ></td
                    >
                    <td class="py-2.5"
                      ><code class="text-xs text-[var(--ink-soft)]"
                        >flex-1 overflow-y-auto px-6 py-5</code
                      ></td
                    >
                  </tr>
                  <tr>
                    <td class="py-2.5 pr-4"
                      ><code
                        class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded"
                        >Footer</code
                      ></td
                    >
                    <td class="py-2.5"
                      ><code class="text-xs text-[var(--ink-soft)]"
                        >flex items-center justify-end gap-2 px-6 py-4 border-t
                        border-[var(--line)]</code
                      ></td
                    >
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              class="bg-[var(--card-soft)] rounded-xl border border-[var(--line)] overflow-hidden"
            >
              <div
                class="flex items-center justify-between px-4 py-2.5 border-b border-[var(--line)]"
              >
                <span
                  class="text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                  >Code</span
                >
                <div class="flex items-center gap-2">
                  <button
                    class="flex items-center gap-1.5 text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors text-xs"
                    onclick={() =>
                      copyCode(
                        "code-modal",
                        `<!-- Trigger -->\n<button onclick={() => modalOpen = true}>Buka Modal</button>\n\n<!-- Modal -->\n{#if modalOpen}\n  <div class="fixed inset-0 z-50 flex items-center justify-center p-4"\n    role="dialog" aria-modal="true"\n    onmousedown={(e) => { if (e.target === e.currentTarget) modalOpen = false; }}\n    onkeydown={(e) => { if (e.key === 'Escape') modalOpen = false; }}>\n\n    <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>\n\n    <div class="relative w-full max-w-md bg-white rounded-2xl shadow-[var(--shadow-modal)]\n      flex flex-col max-h-[90vh]">\n\n      <!-- Header -->\n      <div class="flex items-start gap-3 px-6 pt-5 pb-4 border-b border-[var(--line)]">\n        <h2 class="text-base font-bold">Title</h2>\n        <button class="w-7 h-7 rounded-lg flex items-center justify-center\n          text-[var(--ink-faint)] hover:bg-[var(--card-soft)]"\n          onclick={() => modalOpen = false}>\n          <i class="fa-solid fa-xmark text-sm"></i>\n        </button>\n      </div>\n\n      <!-- Body -->\n      <div class="flex-1 overflow-y-auto px-6 py-5">\n        Content here\n      </div>\n\n      <!-- Footer -->\n      <div class="flex items-center justify-end gap-2 px-6 py-4 border-t border-[var(--line)]">\n        <button class="px-4 py-2 rounded-xl border border-[var(--line)]">Batal</button>\n        <button class="px-4 py-2 rounded-xl bg-[var(--accent)] text-white">Konfirmasi</button>\n      </div>\n    </div>\n  </div>\n{/if}`,
                      )}
                  >
                    {#if copied === "code-modal"}
                      <span
                        class="text-[10px] text-[var(--green)] font-semibold"
                        >Copied!</span
                      >
                    {:else}
                      <i class="fa-regular fa-clipboard text-xs"></i>
                    {/if}
                  </button>
                  <button
                    class="flex items-center justify-center w-5 h-5 rounded text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-[var(--line)] transition-colors"
                    onclick={() => toggleCode("code-modal")}
                  >
                    <i
                      class="fa-solid fa-chevron-down text-[10px] transition-transform {!codeOpen[
                        'code-modal'
                      ]
                        ? ''
                        : '-rotate-90'}"
                    ></i>
                  </button>
                </div>
              </div>
              {#if !codeOpen["code-modal"]}
                <pre
                  class="text-xs text-[var(--ink)] leading-relaxed font-mono p-4 overflow-x-auto">{`<!-- Trigger -->
<button onclick={() => modalOpen = true}>Buka Modal</button>

<!-- Modal -->
{#if modalOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
    role="dialog" aria-modal="true"
    onmousedown={(e) => { if (e.target === e.currentTarget) modalOpen = false; }}
    onkeydown={(e) => { if (e.key === 'Escape') modalOpen = false; }}>

    <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

    <div class="relative w-full max-w-md bg-white rounded-2xl shadow-[var(--shadow-modal)]
      flex flex-col max-h-[90vh]">

      <!-- Header -->
      <div class="flex items-start gap-3 px-6 pt-5 pb-4 border-b border-[var(--line)]">
        <h2 class="text-base font-bold">Title</h2>
        <button class="w-7 h-7 rounded-lg flex items-center justify-center
          text-[var(--ink-faint)] hover:bg-[var(--card-soft)]"
          onclick={() => modalOpen = false}>
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto px-6 py-5">
        Content here
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-2 px-6 py-4 border-t border-[var(--line)]">
        <button class="px-4 py-2 rounded-xl border border-[var(--line)]">Batal</button>
        <button class="px-4 py-2 rounded-xl bg-[var(--accent)] text-white">Konfirmasi</button>
      </div>
    </div>
  </div>
{/if}`}</pre>
              {/if}
            </div>
          </div>
        </div>

        <!-- Topbar Preview -->
        <div
          class="bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-[var(--line)]">
            <h3 class="text-sm font-semibold text-[var(--ink)]">Topbar</h3>
            <p class="text-xs text-[var(--ink-faint)] mt-0.5">
              Header sticky dengan judul halaman, search, dan user dropdown.
            </p>
          </div>
          <div class="p-5">
            <div
              class="rounded-xl overflow-hidden border border-[var(--line)] shadow-[var(--shadow-card)] mb-5"
            >
              <header
                class="h-14 flex items-center gap-4 px-6 bg-[var(--shell)] border-b border-[var(--line)]"
              >
                <h1 class="text-sm font-semibold text-[var(--ink)]">
                  Dashboard
                </h1>
                <div class="flex-1"></div>
                <div class="flex items-center gap-2">
                  <div
                    class="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--ink-faint)] hover:bg-[var(--card-soft)] cursor-pointer transition-colors"
                  >
                    <i class="fa-regular fa-bell text-sm"></i>
                  </div>
                  <div
                    class="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[var(--card-soft)] cursor-pointer transition-colors"
                  >
                    <Avatar name="User" color="var(--accent)" size="sm" />
                    <span
                      class="text-sm font-medium text-[var(--ink)] hidden sm:inline"
                      >User</span
                    >
                    <i
                      class="fa-solid fa-chevron-down text-[10px] text-[var(--ink-faint)]"
                    ></i>
                  </div>
                </div>
              </header>
            </div>

            <div
              class="bg-[var(--card-soft)] rounded-xl border border-[var(--line)] overflow-hidden"
            >
              <div
                class="flex items-center justify-between px-4 py-2.5 border-b border-[var(--line)]"
              >
                <span
                  class="text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                  >Code</span
                >
                <div class="flex items-center gap-2">
                  <button
                    class="flex items-center gap-1.5 text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors text-xs"
                    onclick={() =>
                      copyCode(
                        "code-topbar",
                        `<header class="h-14 flex items-center gap-4 px-6 bg-[var(--shell)] border-b border-[var(--line)] sticky top-0 z-10">
  <h1 class="text-sm font-semibold text-[var(--ink)]">Page Title</h1>
  <div class="flex-1"></div>
  <div class="flex items-center gap-2">
    <button class="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--ink-faint)] hover:bg-[var(--card-soft)]">
      <i class="fa-regular fa-bell text-sm"></i>
    </button>
    <div class="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[var(--card-soft)] cursor-pointer">
      <Avatar name="User" color="var(--accent)" size="sm" />
      <span class="text-sm font-medium">User</span>
      <i class="fa-solid fa-chevron-down text-[10px] text-[var(--ink-faint)]"></i>
    </div>
  </div>
</header>`,
                      )}
                  >
                    {#if copied === "code-topbar"}
                      <span
                        class="text-[10px] text-[var(--green)] font-semibold"
                        >Copied!</span
                      >
                    {:else}
                      <i class="fa-regular fa-clipboard text-xs"></i>
                    {/if}
                  </button>
                  <button
                    class="flex items-center justify-center w-5 h-5 rounded text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-[var(--line)] transition-colors"
                    onclick={() => toggleCode("code-topbar")}
                  >
                    <i
                      class="fa-solid fa-chevron-down text-[10px] transition-transform {!codeOpen[
                        'code-topbar'
                      ]
                        ? ''
                        : '-rotate-90'}"
                    ></i>
                  </button>
                </div>
              </div>
              {#if !codeOpen["code-topbar"]}
                <pre
                  class="text-xs text-[var(--ink)] leading-relaxed font-mono p-4 overflow-x-auto">{`<header class="h-14 flex items-center gap-4 px-6 bg-[var(--shell)] border-b border-[var(--line)] sticky top-0 z-10">
  <h1 class="text-sm font-semibold text-[var(--ink)]">Page Title</h1>
  <div class="flex-1"></div>
  <div class="flex items-center gap-2">
    <button class="w-7 h-7 rounded-lg flex items-center justify-center
      text-[var(--ink-faint)] hover:bg-[var(--card-soft)]">
      <i class="fa-regular fa-bell text-sm"></i>
    </button>
    <div class="flex items-center gap-2 px-2.5 py-1.5 rounded-xl
      hover:bg-[var(--card-soft)] cursor-pointer">
      <Avatar name="User" color="var(--accent)" size="sm" />
      <span class="text-sm font-medium">User</span>
      <i class="fa-solid fa-chevron-down text-[10px] text-[var(--ink-faint)]"></i>
    </div>
  </div>
</header>`}</pre>
              {/if}
            </div>
          </div>
        </div>

        <!-- Sidebar Preview -->
        <div
          class="bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-[var(--line)]">
            <h3 class="text-sm font-semibold text-[var(--ink)]">Sidebar</h3>
            <p class="text-xs text-[var(--ink-faint)] mt-0.5">
              Navigasi utama — daftar proyek + menu, collapsible.
            </p>
          </div>
          <div class="p-5">
            <div
              class="rounded-xl overflow-hidden border border-[var(--line)] shadow-[var(--shadow-card)] w-[240px] mb-5"
            >
              <aside class="bg-white flex flex-col">
                <!-- Logo area -->
                <div class="p-4 border-b border-[var(--line)]">
                  <div class="flex items-center gap-2.5">
                    <span
                      class="w-8 h-8 rounded-xl bg-[var(--accent)] flex items-center justify-center text-white text-sm font-bold shadow-[var(--shadow-accent)]"
                      >T</span
                    >
                    <span class="text-sm font-bold text-[var(--ink)]"
                      >TaskThing</span
                    >
                  </div>
                </div>
                <!-- Menu items -->
                <nav class="flex flex-col gap-0.5 p-3">
                  {#each [["Dashboard", "fa-gauge-high"], ["Kalender", "fa-calendar"], ["Tugas Saya", "fa-list-check"], ["Aktivitas", "fa-clock-rotate-left"], ["Arsip", "fa-box-archive"]] as [label, icon], i}
                    <div
                      class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors {i ===
                      0
                        ? 'bg-[var(--card-soft)] text-[var(--ink)] font-semibold'
                        : 'text-[var(--ink-soft)]'}"
                    >
                      <i
                        class="fa-solid {icon} text-xs {i === 0
                          ? 'text-[var(--accent)]'
                          : 'text-[var(--ink-faint)]'}"
                      ></i>
                      {label}
                    </div>
                  {/each}
                </nav>
                <!-- Projects section -->
                <div class="px-3 pb-3">
                  <div
                    class="bg-[var(--card-soft)] rounded-xl p-1 border border-[var(--line)] flex flex-col gap-0.5"
                  >
                    {#each [["Proyek A", "var(--accent)"], ["Proyek B", "var(--blue)"]] as [name, color]}
                      <div
                        class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--ink)] bg-white shadow-sm"
                      >
                        <i
                          class="fa-solid fa-folder text-xs"
                          style="color:{color};"
                        ></i>
                        {name}
                      </div>
                    {/each}
                  </div>
                </div>
              </aside>
            </div>

            <div class="overflow-x-auto mb-4">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-[var(--line)]">
                    <th
                      class="text-left py-2.5 pr-4 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Element</th
                    >
                    <th
                      class="text-left py-2.5 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Classes</th
                    >
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-[var(--line)]">
                    <td class="py-2.5 pr-4"
                      ><code
                        class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded"
                        >Sidebar</code
                      ></td
                    >
                    <td class="py-2.5"
                      ><code class="text-xs text-[var(--ink-soft)]"
                        >w-[240px] bg-white border-r border-[var(--line)]
                        h-screen flex flex-col</code
                      ></td
                    >
                  </tr>
                  <tr class="border-b border-[var(--line)]">
                    <td class="py-2.5 pr-4"
                      ><code
                        class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded"
                        >Nav Item</code
                      ></td
                    >
                    <td class="py-2.5"
                      ><code class="text-xs text-[var(--ink-soft)]"
                        >flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl
                        text-sm font-medium</code
                      ></td
                    >
                  </tr>
                  <tr>
                    <td class="py-2.5 pr-4"
                      ><code
                        class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded"
                        >Project List</code
                      ></td
                    >
                    <td class="py-2.5"
                      ><code class="text-xs text-[var(--ink-soft)]"
                        >bg-[var(--card-soft)] rounded-xl p-1 border
                        border-[var(--line)]</code
                      ></td
                    >
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- EmptyState -->
        <div
          class="bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-[var(--line)]">
            <h3 class="text-sm font-semibold text-[var(--ink)]">EmptyState</h3>
            <p class="text-xs text-[var(--ink-faint)] mt-0.5">
              Tampilan ketika data kosong — ikon, judul, deskripsi, dan CTA
              opsional.
            </p>
          </div>
          <div class="p-5">
            <div
              class="p-4 rounded-xl bg-[var(--card-soft)] border border-[var(--line)] mb-5"
            >
              <EmptyState
                icon="inbox"
                title="Belum ada data"
                description="Konten akan muncul di sini ketika data tersedia."
                ctaLabel="Tambah Baru"
                onCta={() => {}}
              />
            </div>

            <div class="overflow-x-auto mb-4">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-[var(--line)]">
                    <th
                      class="text-left py-2.5 pr-4 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Prop</th
                    >
                    <th
                      class="text-left py-2.5 pr-4 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Type</th
                    >
                    <th
                      class="text-left py-2.5 pr-4 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Default</th
                    >
                    <th
                      class="text-left py-2.5 text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                      >Description</th
                    >
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-[var(--line)]">
                    <td class="py-2.5 pr-4"
                      ><code
                        class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded"
                        >icon</code
                      ></td
                    >
                    <td class="py-2.5 pr-4 text-sm text-[var(--ink-soft)]"
                      ><code class="text-xs">string</code></td
                    >
                    <td class="py-2.5 pr-4 text-sm text-[var(--ink-soft)]">—</td
                    >
                    <td class="py-2.5 text-sm text-[var(--ink-soft)]"
                      >FontAwesome icon name (without fa- prefix)</td
                    >
                  </tr>
                  <tr class="border-b border-[var(--line)]">
                    <td class="py-2.5 pr-4"
                      ><code
                        class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded"
                        >title</code
                      ></td
                    >
                    <td class="py-2.5 pr-4 text-sm text-[var(--ink-soft)]"
                      ><code class="text-xs">string</code></td
                    >
                    <td class="py-2.5 pr-4 text-sm text-[var(--ink-soft)]">—</td
                    >
                    <td class="py-2.5 text-sm text-[var(--ink-soft)]"
                      >Empty state heading</td
                    >
                  </tr>
                  <tr class="border-b border-[var(--line)]">
                    <td class="py-2.5 pr-4"
                      ><code
                        class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded"
                        >description</code
                      ></td
                    >
                    <td class="py-2.5 pr-4 text-sm text-[var(--ink-soft)]"
                      ><code class="text-xs">string</code></td
                    >
                    <td class="py-2.5 pr-4 text-sm text-[var(--ink-soft)]">—</td
                    >
                    <td class="py-2.5 text-sm text-[var(--ink-soft)]"
                      >Explanatory text</td
                    >
                  </tr>
                  <tr class="border-b border-[var(--line)]">
                    <td class="py-2.5 pr-4"
                      ><code
                        class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded"
                        >ctaLabel</code
                      ></td
                    >
                    <td class="py-2.5 pr-4 text-sm text-[var(--ink-soft)]"
                      ><code class="text-xs">string</code></td
                    >
                    <td class="py-2.5 pr-4 text-sm text-[var(--ink-soft)]">—</td
                    >
                    <td class="py-2.5 text-sm text-[var(--ink-soft)]"
                      >Optional action button text</td
                    >
                  </tr>
                  <tr>
                    <td class="py-2.5 pr-4"
                      ><code
                        class="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded"
                        >onCta</code
                      ></td
                    >
                    <td class="py-2.5 pr-4 text-sm text-[var(--ink-soft)]"
                      ><code class="text-xs">() => void</code></td
                    >
                    <td class="py-2.5 pr-4 text-sm text-[var(--ink-soft)]">—</td
                    >
                    <td class="py-2.5 text-sm text-[var(--ink-soft)]"
                      >CTA click handler</td
                    >
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              class="bg-[var(--card-soft)] rounded-xl border border-[var(--line)] overflow-hidden"
            >
              <div
                class="flex items-center justify-between px-4 py-2.5 border-b border-[var(--line)]"
              >
                <span
                  class="text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider"
                  >Code</span
                >
                <div class="flex items-center gap-2">
                  <button
                    class="flex items-center gap-1.5 text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors text-xs"
                    onclick={() =>
                      copyCode(
                        "code-empty",
                        `import EmptyState from '$components/ui/EmptyState.svelte';\n\n<EmptyState\n  icon="inbox"\n  title="Belum ada data"\n  description="Konten akan muncul di sini ketika data tersedia."\n  ctaLabel="Tambah Baru"\n  onCta={handleClick}\n/>`,
                      )}
                  >
                    {#if copied === "code-empty"}
                      <span
                        class="text-[10px] text-[var(--green)] font-semibold"
                        >Copied!</span
                      >
                    {:else}
                      <i class="fa-regular fa-clipboard text-xs"></i>
                    {/if}
                  </button>
                  <button
                    class="flex items-center justify-center w-5 h-5 rounded text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-[var(--line)] transition-colors"
                    onclick={() => toggleCode("code-empty")}
                  >
                    <i
                      class="fa-solid fa-chevron-down text-[10px] transition-transform {!codeOpen[
                        'code-empty'
                      ]
                        ? ''
                        : '-rotate-90'}"
                    ></i>
                  </button>
                </div>
              </div>
              {#if !codeOpen["code-empty"]}
                <pre
                  class="text-xs text-[var(--ink)] leading-relaxed font-mono p-4 overflow-x-auto">{`import EmptyState from '$components/ui/EmptyState.svelte';

<EmptyState
  icon="inbox"
  title="Belum ada data"
  description="Konten akan muncul di sini ketika data tersedia."
  ctaLabel="Tambah Baru"
  onCta={handleClick}
/>`}</pre>
              {/if}
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
</div>
