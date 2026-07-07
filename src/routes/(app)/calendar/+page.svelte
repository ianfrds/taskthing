<script lang="ts">
  import { projects } from '$lib/stores/app.store';
  import type { Task } from '$lib/types';

  type ViewMode = 'day' | 'week' | 'month';

  let viewMode = $state<ViewMode>('month');
  let today = $state(new Date());
  let cursor = $state(new Date(today.getFullYear(), today.getMonth(), 1));
  let selectedDate = $state<Date | null>(null);

  const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const allTasks = $derived(
    $projects.flatMap((p) =>
      p.todos
        .filter((t: Task) => t.due)
        .map((t: Task) => ({ ...t, projectName: p.name, projectColor: p.color }))
    )
  );

  const tasksByDate = $derived(() => {
    const map = new Map<string, Array<Task & { projectName: string; projectColor: string }>>();
    for (const t of allTasks) {
      const key = t.due!.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return map;
  });

  function getTasksForDate(date: Date) {
    const key = date.toISOString().slice(0, 10);
    return tasksByDate().get(key) ?? [];
  }

  function daysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  function firstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
  }

  function isToday(date: Date) {
    const d = date.toISOString().slice(0, 10);
    const t = today.toISOString().slice(0, 10);
    return d === t;
  }

  function isSelected(date: Date) {
    return selectedDate && date.toISOString().slice(0, 10) === selectedDate.toISOString().slice(0, 10);
  }

  function isSameMonth(date: Date) {
    return date.getMonth() === cursor.getMonth() && date.getFullYear() === cursor.getFullYear();
  }

  const daysGrid = $derived(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const days: Array<{ day: number; date: Date; other: boolean }> = [];

    for (let i = 0; i < startDay; i++) {
      const prevMonth = new Date(year, month, -startDay + i + 1);
      days.push({ day: prevMonth.getDate(), date: prevMonth, other: true });
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push({ day: i, date: new Date(year, month, i), other: false });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const nextMonth = new Date(year, month + 1, i);
      days.push({ day: nextMonth.getDate(), date: nextMonth, other: true });
    }

    return days;
  });

  function weekDays() {
    const start = new Date(cursor);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }

  const currentWeek = $derived(weekDays());

  function navigate(dir: number) {
    if (viewMode === 'day') {
      const d = new Date(cursor);
      d.setDate(d.getDate() + dir);
      cursor = d;
    } else if (viewMode === 'week') {
      const d = new Date(cursor);
      d.setDate(d.getDate() + dir * 7);
      cursor = d;
    } else {
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + dir, 1);
    }
  }

  function goToday() {
    cursor = new Date(today.getFullYear(), today.getMonth(), 1);
    selectedDate = today;
  }

  function viewLabel() {
    const m = MONTHS[cursor.getMonth()];
    const y = cursor.getFullYear();
    if (viewMode === 'day') return `${m} ${cursor.getDate()}, ${y}`;
    if (viewMode === 'week') {
      const start = currentWeek[0];
      const end = currentWeek[6];
      if (start.getMonth() === end.getMonth()) return `${MONTHS[start.getMonth()]} ${start.getDate()} – ${end.getDate()}, ${y}`;
      return `${MONTHS[start.getMonth()]} ${start.getDate()} – ${MONTHS[end.getMonth()]} ${end.getDate()}, ${y}`;
    }
    return `${m} ${y}`;
  }

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }

  function statusColor(task: Task & { projectColor: string }) {
    const proj = $projects.find((p) => p.todos.some((t: Task) => t.id === task.id));
    if (!proj) return task.projectColor;
    const s = proj.statuses.find((st) => st.id === task.status_id);
    return s?.color ?? task.projectColor;
  }
</script>

<svelte:head>
  <title>Kalender — TaskThing</title>
</svelte:head>

<div class="cal-page">
  <!-- Toolbar -->
  <div class="cal-toolbar">
    <div class="cal-toolbar-left">
      <button class="cal-btn cal-btn-primary" onclick={goToday}>Hari ini</button>
      <div class="cal-nav">
        <button class="cal-btn" onclick={() => navigate(-1)} aria-label="Sebelumnya">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <button class="cal-btn" onclick={() => navigate(1)} aria-label="Berikutnya">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
      <h2 class="cal-title">{viewLabel()}</h2>
    </div>
    <div class="cal-toolbar-right">
      <div class="cal-view-switch">
        {#each ([['day','Hari'],['week','Minggu'],['month','Bulan']] as const) as [v, label]}
          <button
            class="cal-view-btn {viewMode === v ? 'active' : ''}"
            onclick={() => (viewMode = v)}
          >
            {label}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Calendar grid -->
  {#if viewMode === 'month'}
    <div class="cal-grid">
      <div class="cal-header">
        {#each DAYS as d}
          <div class="cal-header-cell">{d}</div>
        {/each}
      </div>
      <div class="cal-body">
        {#each daysGrid() as { day, date, other }}
          <button
            class="cal-cell"
            class:other={other}
            class:today={isToday(date)}
            class:selected={isSelected(date)}
            onclick={() => (selectedDate = date)}
          >
            <span class="cal-day-num">{day}</span>
            {#if !other}
              {@const tasks = getTasksForDate(date)}
              {#each tasks.slice(0, 3) as task}
                <div class="cal-task-dot" style="background:{statusColor(task)};" title={task.title}></div>
              {/each}
              {#if tasks.length > 3}
                <span class="cal-task-more">+{tasks.length - 3}</span>
              {/if}
            {/if}
          </button>
        {/each}
      </div>
    </div>
  {:else if viewMode === 'week'}
    <div class="cal-grid">
      <div class="cal-header">
        <div class="cal-header-cell cal-time-gutter"></div>
        {#each currentWeek as d}
          <div class="cal-header-cell" class:today={isToday(d)}>
            <span class="cal-day-label">{DAYS[d.getDay()]}</span>
            <span class="cal-day-num">{d.getDate()}</span>
          </div>
        {/each}
      </div>
      <div class="cal-body week-body">
        <div class="cal-time-gutter">
          {#each Array.from({ length: 24 }, (_, i) => i) as h}
            <div class="cal-time-slot">
              {String(h).padStart(2, '0')}:00
            </div>
          {/each}
        </div>
        {#each currentWeek as d}
          <div class="cal-week-col">
            {#each Array.from({ length: 24 }, (_, i) => i) as h}
              <div class="cal-hour-cell">
                {#if getTasksForDate(d).length > 0}
                  <!-- tasks shown at their time -->
                {/if}
              </div>
            {/each}
            {#each getTasksForDate(d) as task}
              <div
                class="cal-week-task"
                style="background:{statusColor(task)}18; border-left:3px solid {statusColor(task)};"
                title={task.title}
              >
                {#if task.due}
                  <span class="cal-week-task-time">{formatTime(task.due)}</span>
                {/if}
                <span class="cal-week-task-title">{task.title}</span>
              </div>
            {/each}
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <!-- Day view -->
    <div class="cal-grid">
      <div class="cal-header">
        <div class="cal-header-cell cal-time-gutter"></div>
        <div class="cal-header-cell today">
          <span class="cal-day-label">{DAYS[cursor.getDay()]}</span>
          <span class="cal-day-num">{cursor.getDate()}</span>
        </div>
      </div>
      <div class="cal-body day-body">
        <div class="cal-time-gutter">
          {#each Array.from({ length: 24 }, (_, i) => i) as h}
            <div class="cal-time-slot">{String(h).padStart(2, '0')}:00</div>
          {/each}
        </div>
        <div class="cal-day-col">
          {#each Array.from({ length: 24 }, (_, i) => i) as h}
            <div class="cal-hour-cell"></div>
          {/each}
          {#each getTasksForDate(cursor) as task}
            <div
              class="cal-week-task"
              style="background:{statusColor(task)}18; border-left:3px solid {statusColor(task)};"
            >
              {#if task.due}
                <span class="cal-week-task-time">{formatTime(task.due)}</span>
              {/if}
              <span class="cal-week-task-title">{task.title}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <!-- Selected day tasks detail -->
  {#if selectedDate}
    {@const tasks = getTasksForDate(selectedDate)}
    <div class="cal-detail">
      <h3 class="cal-detail-title">
        {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </h3>
      {#if tasks.length === 0}
        <p class="cal-detail-empty">Tidak ada tugas dengan tenggat di tanggal ini.</p>
      {:else}
        <div class="cal-detail-list">
          {#each tasks as task}
            <div class="cal-detail-item" style="border-left:3px solid {statusColor(task)};">
              <div class="cal-detail-item-top">
                <span class="cal-detail-project" style="color:{task.projectColor};">{task.projectName}</span>
                {#if task.due}
                  <span class="cal-detail-time">{formatTime(task.due)}</span>
                {/if}
              </div>
              <p class="cal-detail-title">{task.title}</p>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .cal-page {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* ── Toolbar ── */
  .cal-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .cal-toolbar-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .cal-toolbar-right {
    display: flex;
    align-items: center;
  }

  .cal-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--ink);
    margin: 0;
  }

  .cal-btn {
    height: 2.25rem;
    padding: 0 0.875rem;
    border-radius: 0.625rem;
    border: 1px solid var(--line);
    background: #fff;
    color: var(--ink);
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    transition: background 0.15s, border-color 0.15s;
  }

  .cal-btn:hover {
    background: var(--card-soft);
    border-color: var(--ink-faint);
  }

  .cal-btn-primary {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
    font-weight: 600;
  }

  .cal-btn-primary:hover {
    background: var(--accent-deep);
    border-color: var(--accent-deep);
  }

  .cal-nav {
    display: flex;
    gap: 0.25rem;
  }

  .cal-nav .cal-btn {
    padding: 0 0.625rem;
  }

  .cal-view-switch {
    display: flex;
    gap: 0.25rem;
    background: var(--card-soft);
    border: 1px solid var(--line);
    border-radius: 0.625rem;
    padding: 0.1875rem;
  }

  .cal-view-btn {
    padding: 0.375rem 0.75rem;
    border-radius: 0.4375rem;
    border: none;
    background: transparent;
    color: var(--ink-soft);
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }

  .cal-view-btn.active {
    background: #fff;
    color: var(--ink);
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }

  .cal-view-btn:hover:not(.active) {
    color: var(--ink);
  }

  /* ── Grid ── */
  .cal-grid {
    background: #fff;
    border-radius: 1rem;
    border: 1px solid var(--line);
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    overflow: hidden;
  }

  .cal-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    border-bottom: 1px solid var(--line);
  }

  .cal-header-cell {
    padding: 0.625rem 0.5rem;
    text-align: center;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--ink-soft);
    border-right: 1px solid var(--line);
  }

  .cal-header-cell:last-child {
    border-right: none;
  }

  .cal-body {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }

  .cal-cell {
    min-height: 90px;
    padding: 0.375rem;
    border-right: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
    background: transparent;
    cursor: pointer;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    transition: background 0.1s;
    position: relative;
  }

  .cal-cell:nth-child(7n) {
    border-right: none;
  }

  .cal-cell:hover {
    background: var(--card-soft);
  }

  .cal-cell.other {
    background: var(--bg);
  }

  .cal-cell.other .cal-day-num {
    opacity: 0.3;
  }

  .cal-cell.today .cal-day-num {
    background: var(--accent);
    color: #fff;
    border-radius: 50%;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cal-cell.selected {
    background: rgba(234,78,44,0.06);
    box-shadow: inset 0 0 0 2px var(--accent);
  }

  .cal-day-num {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--ink);
    margin-bottom: 0.125rem;
  }

  .cal-task-dot {
    width: 100%;
    height: 4px;
    border-radius: 2px;
  }

  .cal-task-more {
    font-size: 0.625rem;
    color: var(--ink-faint);
    font-weight: 500;
  }

  /* ── Week / Day view ── */
  .cal-header .cal-time-gutter,
  .cal-body .cal-time-gutter {
    width: 3.5rem;
    flex-shrink: 0;
  }

  .week-body,
  .day-body {
    display: flex;
    overflow-y: auto;
    max-height: 520px;
  }

  .cal-time-gutter {
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--line);
  }

  .cal-time-slot {
    height: 3rem;
    font-size: 0.6875rem;
    color: var(--ink-faint);
    padding: 0 0.5rem;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    border-bottom: 1px solid var(--line);
    padding-top: 0.125rem;
  }

  .cal-week-col,
  .cal-day-col {
    flex: 1;
    position: relative;
    border-right: 1px solid var(--line);
    min-width: 0;
  }

  .cal-week-col:last-child,
  .cal-day-col {
    border-right: none;
  }

  .cal-hour-cell {
    height: 3rem;
    border-bottom: 1px solid var(--line);
  }

  .cal-week-task {
    position: absolute;
    left: 0.25rem;
    right: 0.25rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    overflow: hidden;
    z-index: 1;
  }

  .cal-week-task-time {
    font-size: 0.625rem;
    font-weight: 600;
    color: var(--ink-soft);
  }

  .cal-week-task-title {
    font-weight: 500;
    color: var(--ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cal-header-cell.today {
    color: var(--accent);
  }

  .cal-day-label {
    display: block;
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .cal-week-col .cal-day-num,
  .cal-day-col .cal-day-num {
    font-size: 0.875rem;
    font-weight: 700;
  }

  /* ── Detail panel ── */
  .cal-detail {
    background: #fff;
    border-radius: 1rem;
    border: 1px solid var(--line);
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    padding: 1.25rem;
  }

  .cal-detail-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    color: var(--ink);
    margin: 0 0 0.75rem;
  }

  .cal-detail-empty {
    font-size: 0.875rem;
    color: var(--ink-faint);
    margin: 0;
    padding: 1rem 0;
    text-align: center;
  }

  .cal-detail-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .cal-detail-item {
    padding: 0.625rem 0.75rem;
    border-radius: 0.5rem;
    background: var(--card-soft);
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .cal-detail-item-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .cal-detail-project {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .cal-detail-time {
    font-size: 0.6875rem;
    color: var(--ink-faint);
    font-weight: 500;
  }

  .cal-detail-item .cal-detail-title {
    font-family: inherit;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--ink);
    margin: 0;
  }
</style>
