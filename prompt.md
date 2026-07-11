# TaskThing — Design System & Knowledge Context

## Completed: Design System Dashboard (`/design-system`)
Halaman dokumentasi komponen UI yang **menggunakan gaya yang persis sama** dengan project (Tailwind + CSS variables dari `app.css`). Bukan custom CSS.

### Layout
- **Sidebar kiri** (260px, fixed, sticky): navigasi Overview → Foundations → Atoms → Molecules → Organisms. Gaya: `text-[var(--ink-soft)]`, active: `bg-[var(--card-soft)] text-[var(--ink)] font-semibold`.
- **Main kanan** (max-width 900px): scroll satu halaman dengan anchor sections.

### Sections & Components

| Section | Komponen | Detail |
|---------|----------|--------|
| **Overview** | Card navigasi ke tiap section | Grid 2 kolom, `bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)]` |
| **Foundations** | Colors (23 warna), Typography (7 level), Border Radius (4 tokens), Shadows (4 tokens) | Grid swatch warna + tables — semua dari CSS vars `app.css:root` |
| **Atoms: Button** | 6 varian: primary, secondary, text, danger, disabled, loading | Semua pakai Tailwind classes persis dari project |
| **Atoms: Badge** | Import `Badge.svelte` — 6 contoh warna | Props table + code snippet |
| **Atoms: Avatar** | Import `Avatar.svelte` — 6 contoh (sm/md/lg) | Props table + code snippet |
| **Atoms: Input** | Text input, textarea, select — pola konsisten | Classes: `w-full px-3.5 py-2.5 text-sm border border-[var(--line)] rounded-xl bg-white ... focus:border-[var(--accent)]` |
| **Molecules: Segmented Control** | Pill-style — 2 ukuran (large view-switcher, small period tabs) | Container: `bg-[var(--card-soft)] rounded-xl p-1 border border-[var(--line)]`; Active: `bg-white shadow-sm` |
| **Molecules: Card (TaskCard)** | TaskCard-style — `bg-white rounded-xl border border-[var(--line)] p-3.5 hover:shadow-[var(--shadow-card-hover)]` | Classes table + code snippet |
| **Molecules: Card with Image** | Gradient header + title + desc + actions | `rounded-xl border shadow-[var(--shadow-card)] overflow-hidden` |
| **Molecules: Tab Navigation** | Pill tabs horizontal + content panel interaktif | Container: `rounded-xl bg-white border border-[var(--line)] shadow-[var(--shadow-card)] p-1` |
| **Molecules: Progress Bar** | 4 contoh progress — color changes by percentage | `h-2 bg-[var(--line)] rounded-full` |
| **Organisms: Modal** | Interaktif — backdrop blur, header, body scroll, footer | `bg-black/40 backdrop-blur-[2px]` + `rounded-2xl shadow-[var(--shadow-modal)] max-h-[90vh]` |
| **Organisms: Topbar** | Preview non-interaktif | `h-14 bg-[var(--shell)] border-b border-[var(--line)]` |
| **Organisms: Sidebar** | Preview (240px) | Logo + menu items + project list container |
| **Organisms: EmptyState** | Import `EmptyState.svelte` — contoh dengan CTA | Props table + code snippet |

### Architecture: Design Tokens
Semua style terkontrol melalui CSS variables di `app.css:root`:
- `--accent: #EA4E2C` — warna aksen utama (button, icon active)
- `--ink: #1A1819` — teks utama
- `--ink-soft: #6A6880` — teks sekunder
- `--ink-faint: #A8A6BC` — teks tersier
- `--line: #EAEAF2` — border
- `--card-soft: #F7F7FB` — background soft card
- `--shadow-card`, `--shadow-card-hover`, `--shadow-modal`, `--shadow-accent`
- `--radius-sm: 8px`, `--radius-md: 12px`, `--radius-lg: 16px`, `--radius-xl: 22px`

### Key Patterns (Tailwind, bukan custom CSS)
- **Card wrapper**: `bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden`
- **Section header**: `px-6 py-4 border-b border-[var(--line)]`
- **Section body**: `p-5`
- **Preview area**: `p-4 rounded-xl bg-[var(--card-soft)] border border-[var(--line)] mb-5`
- **Props table**: `w-full text-sm` dengan header `text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider`
- **Code snippet**: `bg-[var(--card-soft)] rounded-xl p-4 border border-[var(--line)]` + `<pre class="text-xs font-mono">`
- **Button primary**: `px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-deep)] shadow-[var(--shadow-accent)]`
- **Button secondary**: `px-4 py-2 rounded-xl border border-[var(--line)] text-[var(--ink-soft)] text-sm font-medium hover:bg-[var(--card-soft)]`
- **Modal**: `bg-black/40 backdrop-blur-[2px]` + `bg-white rounded-2xl shadow-[var(--shadow-modal)] max-h-[90vh]`
