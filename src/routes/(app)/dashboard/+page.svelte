<script lang="ts">
  import { onDestroy } from 'svelte';
  import { projects } from '$lib/stores/app.store';
  import {
    Chart, ArcElement, Tooltip, Legend,
    BarElement, BarController,
    DoughnutController,
    CategoryScale, LinearScale
  } from 'chart.js';

  Chart.register(ArcElement, Tooltip, Legend, BarElement, BarController, DoughnutController, CategoryScale, LinearScale);

  // ── Canvas refs ──────────────────────────────────────────────
  let pieCanvas = $state<HTMLCanvasElement | null>(null);
  let barCanvas = $state<HTMLCanvasElement | null>(null);
  let pieChart: Chart | null = null;
  let barChart: Chart | null = null;

  // ── Activity period tab ──────────────────────────────────────
  type Period = 'daily' | 'weekly' | 'monthly';
  let activePeriod = $state<Period>('weekly');

  // ── Derived stats ─────────────────────────────────────────────
  const allTasks = $derived($projects.flatMap((p) => p.todos));

  const totalProjects = $derived($projects.length);
  const totalTasks = $derived(allTasks.length);

  // Tentukan "status done" per project = status dengan sort_order tertinggi
  const doneTasks = $derived(
    $projects.reduce((count, p) => {
      if (!p.statuses.length) return count;
      const doneStatus = [...p.statuses].sort((a, b) => b.sort_order - a.sort_order)[0];
      return count + p.todos.filter((t) => t.status_id === doneStatus.id).length;
    }, 0)
  );

  const completionPct = $derived(totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0);

  // ── Activity chart data ───────────────────────────────────────
  function getActivityData(period: Period): { labels: string[]; values: number[] } {
    const now = new Date();
    const labels: string[] = [];
    const values: number[] = [];

    if (period === 'daily') {
      // 7 hari terakhir
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
        labels.push(label);
        const count = allTasks.filter((t) => {
          const td = new Date(t.created_at);
          return (
            td.getFullYear() === d.getFullYear() &&
            td.getMonth() === d.getMonth() &&
            td.getDate() === d.getDate()
          );
        }).length;
        values.push(count);
      }
    } else if (period === 'weekly') {
      // 8 minggu terakhir
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - i * 7 - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        const label = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
        labels.push(label);
        const count = allTasks.filter((t) => {
          const td = new Date(t.created_at);
          return td >= weekStart && td <= weekEnd;
        }).length;
        values.push(count);
      }
    } else {
      // 6 bulan terakhir
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
        labels.push(label);
        const count = allTasks.filter((t) => {
          const td = new Date(t.created_at);
          return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth();
        }).length;
        values.push(count);
      }
    }

    return { labels, values };
  }

  // ── Chart rendering ───────────────────────────────────────────
  function renderPieChart() {
    if (!pieCanvas) return;
    if (pieChart) pieChart.destroy();

    const pending = totalTasks - doneTasks;

    pieChart = new Chart(pieCanvas, {
      type: 'doughnut',
      data: {
        labels: ['Ditugaskan', 'Selesai'],
        datasets: [
          {
            data: [pending > 0 ? pending : 0, doneTasks],
            backgroundColor: ['#3B7FD4', '#2EA878'],
            borderWidth: 0,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 16,
              font: { size: 12, family: "'Inter', sans-serif" },
              color: '#6b7280',
              usePointStyle: true,
              pointStyleWidth: 8,
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed}`,
            },
          },
        },
      },
    });
  }

  function renderBarChart() {
    if (!barCanvas) return;
    if (barChart) barChart.destroy();

    const { labels, values } = getActivityData(activePeriod);

    barChart = new Chart(barCanvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Tugas dibuat',
            data: values,
            backgroundColor: '#3B7FD426',
            borderColor: '#3B7FD4',
            borderWidth: 1.5,
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.y} tugas`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 }, color: '#9ca3af' },
            border: { display: false },
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: { size: 11 },
              color: '#9ca3af',
            },
            grid: { color: '#f3f4f6' },
            border: { display: false },
          },
        },
      },
    });
  }

  // Render/re-render pie chart saat canvas tersedia atau data berubah
  $effect(() => {
    const canvas = pieCanvas;
    const data = $projects; // track reactivity
    if (!canvas) return;
    // Destroy dulu sebelum buat baru
    pieChart?.destroy();
    pieChart = null;
    renderPieChart();
    return () => {
      pieChart?.destroy();
      pieChart = null;
    };
  });

  // Render/re-render bar chart saat canvas tersedia, period, atau data berubah
  $effect(() => {
    const canvas = barCanvas;
    const period = activePeriod; // track reactivity
    const data = allTasks; // track reactivity
    if (!canvas) return;
    barChart?.destroy();
    barChart = null;
    renderBarChart();
    return () => {
      barChart?.destroy();
      barChart = null;
    };
  });

  onDestroy(() => {
    pieChart?.destroy();
    barChart?.destroy();
  });
</script>

<svelte:head>
  <title>Dashboard — TaskThing</title>
</svelte:head>

<div class="flex flex-col gap-6">
  <!-- Header -->
  <div>
    <h1 class="text-xl font-bold text-[var(--ink)]" style="font-family:'Space Grotesk',sans-serif;">Dashboard</h1>
    <p class="text-sm text-[var(--ink-soft)] mt-1">Selamat datang di TaskThing.</p>
  </div>

  {#if $projects.length === 0}
    <!-- Empty state -->
    <div class="bg-white rounded-2xl border border-[var(--line)] p-12 flex flex-col items-center gap-4 text-center shadow-[var(--shadow-card)]">
      <div class="w-16 h-16 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center text-2xl text-[var(--accent)]">
        <i class="fa-solid fa-diagram-project"></i>
      </div>
      <div>
        <h2 class="text-base font-semibold text-[var(--ink)] mb-1">Belum ada proyek</h2>
        <p class="text-sm text-[var(--ink-soft)] max-w-xs">Buat proyek pertamamu untuk mulai mengatur tugas dan sumber daya.</p>
      </div>
    </div>
  {:else}
    <!-- ── Stat Cards ─────────────────────────────────────────── -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {#each [
        { label: 'Total Proyek', value: totalProjects, icon: 'fa-diagram-project', color: 'var(--accent)' },
        { label: 'Total Tugas', value: totalTasks, icon: 'fa-list-check', color: 'var(--blue)' },
        { label: 'Tugas Selesai', value: doneTasks, icon: 'fa-circle-check', color: 'var(--green)' },
        { label: 'Penyelesaian', value: `${completionPct}%`, icon: 'fa-chart-pie', color: 'var(--orange)' },
      ] as stat}
        <div class="bg-white rounded-2xl border border-[var(--line)] p-5 shadow-[var(--shadow-card)]">
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style="background:{stat.color}1c; color:{stat.color};"
            >
              <i class="fa-solid {stat.icon} text-sm"></i>
            </div>
            <div>
              <p class="text-2xl font-bold text-[var(--ink)]">{stat.value}</p>
              <p class="text-xs text-[var(--ink-faint)]">{stat.label}</p>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <!-- ── Row 2: Progress Proyek + Pie Chart ────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

      <!-- Progress Proyek (scrollable) -->
      <div class="bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)] flex flex-col overflow-hidden">
        <div class="px-5 py-4 border-b border-[var(--line)]">
          <h2 class="text-sm font-semibold text-[var(--ink)]">Progress Proyek</h2>
          <p class="text-xs text-[var(--ink-faint)] mt-0.5">{$projects.length} proyek aktif</p>
        </div>
        <div class="overflow-y-auto max-h-64 divide-y divide-[var(--line)]">
          {#each $projects as project}
            {@const total = project.todos.length}
            {@const doneStatus = project.statuses.length
              ? [...project.statuses].sort((a, b) => b.sort_order - a.sort_order)[0]
              : null}
            {@const done = doneStatus
              ? project.todos.filter((t) => t.status_id === doneStatus.id).length
              : 0}
            {@const pct = total > 0 ? Math.round((done / total) * 100) : 0}
            <a
              href="/{project.id}/tasks"
              class="flex flex-col gap-2 px-5 py-3.5 hover:bg-[var(--card-soft)] transition-colors"
            >
              <div class="flex items-center gap-2.5">
                <div
                  class="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                  style="background:{project.color}1c; color:{project.color};"
                >
                  <i class="fa-solid {project.icon} text-xs"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-[var(--ink)] truncate">{project.name}</p>
                </div>
                <span class="text-xs text-[var(--ink-faint)] shrink-0">{done}/{total}</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="flex-1 h-1.5 bg-[var(--line)] rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all"
                    style="width:{pct}%; background:{project.color};"
                  ></div>
                </div>
                <span class="text-xs font-medium shrink-0" style="color:{project.color};">{pct}%</span>
              </div>
            </a>
          {/each}
        </div>
      </div>

      <!-- Pie Chart: Ditugaskan vs Selesai -->
      <div class="bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)] flex flex-col">
        <div class="px-5 py-4 border-b border-[var(--line)]">
          <h2 class="text-sm font-semibold text-[var(--ink)]">Perbandingan Tugas</h2>
          <p class="text-xs text-[var(--ink-faint)] mt-0.5">Ditugaskan vs selesai</p>
        </div>
        <div class="flex-1 p-4 flex items-center justify-center" style="min-height: 220px;">
          {#if totalTasks === 0}
            <p class="text-sm text-[var(--ink-faint)]">Belum ada tugas</p>
          {:else}
            <canvas bind:this={pieCanvas} style="max-height: 220px;"></canvas>
          {/if}
        </div>
      </div>
    </div>

    <!-- ── Row 3: Activity Chart ──────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-card)] flex flex-col">
      <div class="px-5 py-4 border-b border-[var(--line)] flex items-center justify-between">
        <div>
          <h2 class="text-sm font-semibold text-[var(--ink)]">Aktivitas Tugas</h2>
          <p class="text-xs text-[var(--ink-faint)] mt-0.5">Jumlah tugas dibuat per periode</p>
        </div>
        <!-- Period tabs -->
        <div class="flex items-center gap-1 bg-[var(--card-soft)] rounded-lg p-1">
          {#each ([['daily', 'Harian'], ['weekly', 'Mingguan'], ['monthly', 'Bulanan']] as const) as [key, label]}
            <button
              class="px-3 py-1 rounded-md text-xs font-medium transition-colors {activePeriod === key ? 'bg-white text-[var(--ink)] shadow-sm' : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'}"
              onclick={() => (activePeriod = key)}
            >
              {label}
            </button>
          {/each}
        </div>
      </div>
      <div class="p-5" style="height: 220px;">
        <canvas bind:this={barCanvas}></canvas>
      </div>
    </div>
  {/if}
</div>
