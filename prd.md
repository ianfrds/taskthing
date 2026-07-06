# Product Requirements Document — Orbit PM

## Overview

Orbit PM adalah aplikasi manajemen proyek berbasis web yang memungkinkan pengguna mengelola proyek, tugas, sumber daya, dan anggota tim dalam satu antarmuka yang bersih dan responsif.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | SvelteKit 2.67.0 |
| Runtime | Bun 1.3.13 |
| Styling | TailwindCSS 4.3.2 |
| Database / Auth / Realtime | Supabase |
| Build tool | Vite 6.3.5 |
| Language | TypeScript 6.0.3 |
| Deployment | Vercel (adapter-vercel) |

---

## Fitur yang Sudah Ada

### Auth
- Login dengan email atau username
- Register dengan email, username, dan nama tampilan
- Logout
- Ganti kata sandi
- Update profil (nama tampilan, username)

### Proyek
- Buat proyek baru (nama, deskripsi, warna, ikon)
- Edit proyek
- Hapus proyek (beserta semua data terkait via CASCADE)
- Proyek bersama (shared, read-only)

### Tasks
- 3 tampilan: Kanban, List, Table
- Tambah / edit / hapus tugas
- Field: judul, deskripsi, status, prioritas, kategori, tag anggota, tautan, gambar, tenggat
- Drag-and-drop antar kolom di Kanban
- Filter berdasarkan status (List view)
- Paste gambar dari clipboard (Ctrl+V)
- Kompresi gambar otomatis sebelum disimpan (base64)

### Resources
- Tambah / edit / hapus tautan
- Tampilan tabel dengan hostname

### Team
- Tambah / edit / hapus anggota tim
- Tampil jumlah tugas per anggota

### Master Data (Settings)
- Status kanban: tambah, edit, hapus, urutkan
- Kategori tugas: tambah, edit, hapus, urutkan
- Prioritas: tambah, edit, hapus, urutkan
- Toggle aktif/nonaktif untuk kategori dan prioritas
- Konfirmasi sebelum hapus item yang sedang digunakan

### Realtime
- Supabase Postgres Changes subscription per proyek aktif
- Sinkronisasi INSERT / UPDATE / DELETE ke semua client secara real-time

---

## Fitur yang Belum Ada (Pending)

- [ ] Dashboard analytics (stats, charts, activity feed)
- [ ] Calendar view
- [ ] Drag-and-drop reorder di Master Data
- [ ] Supabase Storage untuk gambar (saat ini base64)
- [ ] Notifikasi tenggat waktu
- [ ] Export data (CSV / PDF)

---

## Arsitektur

### Routing
```
/                     → redirect ke /dashboard
/login                → halaman auth (login + register)
/dashboard            → overview semua proyek
/(app)/[projectId]/[tab]  → tasks | resources | team | settings
```

### Layer

```
src/
├── lib/
│   ├── supabase.ts       ← client singleton + auth helpers
│   ├── constants.ts      ← COLORS, PROJECT_ICONS, MASTER_CONFIG
│   ├── utils.ts          ← pure functions (escapeHtml, formatDate, dll)
│   ├── types/index.ts    ← semua TypeScript interfaces
│   ├── db/               ← CRUD per domain (projects, tasks, statuses, dll)
│   └── stores/           ← Svelte stores (app.store.ts, toast.store.ts)
├── components/
│   ├── ui/               ← Toast, ConfirmDialog, ColorPicker, Avatar, Badge, dll
│   ├── layout/           ← Sidebar, Topbar
│   ├── modals/           ← ProjectModal, TaskModal, ResourceModal, MasterModal, ProfileModal
│   └── project/          ← KanbanView, ListView, TableView, ResourcesTab, TeamTab, SettingsTab
└── routes/
    ├── +layout.svelte    ← auth guard + Toast
    ├── login/            ← auth page
    └── (app)/            ← shell dengan Sidebar + Topbar + modals
```

### Prinsip Koding
- **DRY**: DB calls dipecah per-domain, tidak ada duplikasi query
- **SOLID**: setiap komponen punya single responsibility
- **KISS**: Svelte stores menggantikan global `window.state`
- **Error handling**: setiap fungsi DB dibungkus try/catch dengan `console.error` + `console.warn`
- **Toast**: setiap aksi CRUD menampilkan toast sukses atau error

---

## Database Schema

Lihat `schema.sql` untuk DDL lengkap.

Tabel utama: `projects`, `statuses`, `categories`, `priorities`, `members`, `tasks`, `resources`, `usernames`

Semua tabel menggunakan Row Level Security (RLS) — pengguna hanya bisa mengakses data proyek miliknya.

---

## Setup Vercel

1. Push ke GitHub
2. Import repo di Vercel
3. Set environment variables:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
4. Deploy
