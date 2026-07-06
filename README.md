# Orbit PM

Aplikasi manajemen proyek berbasis SvelteKit + Supabase.

## Stack

- **SvelteKit** 2.67.0
- **Svelte** 5.x
- **Bun** 1.3.13
- **TailwindCSS** 4.3.2
- **Supabase** (PostgreSQL + Auth + Realtime)
- **Vite** 6.3.5
- **TypeScript** 6.0.3
- **Deployment**: Vercel

## Setup

### 1. Clone & install

```bash
git clone <repo-url>
cd orbit-pm
bun install
```

### 2. Environment variables

Salin `.env.example` ke `.env.local` lalu isi dengan credentials Supabase kamu:

```bash
cp .env.example .env.local
```

```env
PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Dapatkan nilai ini dari: Supabase Dashboard → Settings → API

### 3. Setup database

Jalankan `schema.sql` di Supabase SQL Editor:

```
Supabase Dashboard → SQL Editor → New query → paste isi schema.sql → Run
```

### 4. Enable Realtime

```
Supabase Dashboard → Database → Replication → enable semua tabel
```

### 5. Enable Auth

```
Supabase Dashboard → Authentication → Providers → Email → Enable
```

### 6. Jalankan development server

```bash
bun run dev
```

Buka http://localhost:5173

## Struktur Folder

```
src/
├── lib/
│   ├── supabase.ts        # Supabase client + auth helpers
│   ├── constants.ts       # COLORS, PROJECT_ICONS, MASTER_CONFIG
│   ├── utils.ts           # Pure helper functions
│   ├── types/index.ts     # TypeScript interfaces
│   ├── db/                # CRUD per domain
│   │   ├── projects.ts
│   │   ├── tasks.ts
│   │   ├── statuses.ts
│   │   ├── categories.ts
│   │   ├── priorities.ts
│   │   ├── members.ts
│   │   └── resources.ts
│   └── stores/
│       ├── app.store.ts   # Global state (Svelte stores)
│       └── toast.store.ts # Toast notifications
├── components/
│   ├── ui/                # Badge, Avatar, Toast, ConfirmDialog, dll
│   ├── layout/            # Sidebar, Topbar
│   ├── modals/            # ProjectModal, TaskModal, dll
│   └── project/           # KanbanView, ListView, TableView, dll
└── routes/
    ├── +layout.svelte     # Auth guard
    ├── login/             # Login + register page
    └── (app)/             # App shell + semua halaman utama
        ├── dashboard/
        └── [projectId]/[tab]/
```

## Scripts

```bash
bun run dev        # Development server
bun run build      # Production build
bun run preview    # Preview production build
bun run check      # TypeScript check
```

## Deploy ke Vercel

1. Push ke GitHub
2. Import repo di vercel.com
3. Set environment variables di Vercel Dashboard:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

Framework preset: **SvelteKit** (auto-detected)

## Fitur

- Auth: login/register dengan email atau username
- Proyek: buat, edit, hapus, warna & ikon kustom
- Tasks: 3 tampilan (Kanban, List, Table), drag-and-drop
- Resources: manajemen tautan referensi
- Team: manajemen anggota tim
- Master Data: status, kategori, prioritas (konfigurasi per proyek)
- Realtime: sinkronisasi via Supabase Postgres Changes
- Toast: notifikasi untuk setiap aksi CRUD
