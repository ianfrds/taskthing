<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { projects, activeProjectId, modals } from '$lib/stores/app.store';
  import { fetchProjects } from '$lib/db/projects';
  import { supabase } from '$lib/supabase';
  import Sidebar from '$components/layout/Sidebar.svelte';
  import Topbar from '$components/layout/Topbar.svelte';
  import ProjectModal from '$components/modals/ProjectModal.svelte';
  import TaskModal from '$components/modals/TaskModal.svelte';
  import TaskDetailModal from '$components/modals/TaskDetailModal.svelte';
  import ResourceModal from '$components/modals/ResourceModal.svelte';
  import MasterModal from '$components/modals/MasterModal.svelte';
  import ProfileModal from '$components/modals/ProfileModal.svelte';
  import LoadingScreen from '$components/ui/LoadingScreen.svelte';
  import type { Resource } from '$lib/types';

  let { children } = $props();

  let loading = $state(true);
  let editResource = $state<Resource | null>(null);

  onMount(async () => {
    // Auth guard
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      await goto('/login');
      return;
    }

    try {
      const data = await fetchProjects();
      // Initialise each project with empty relational arrays
      projects.set(data.map((p) => ({
        ...p,
        todos: [],
        statuses: [],
        categories: [],
        priorities: [],
        members: [],
        resources: [],
      })));
    } catch (e) {
      console.error('AppLayout.loadProjects:', e);
    } finally {
      loading = false;
    }
  });

  function handleProfile() {
    modals.update((m) => ({ ...m, profile: true }));
  }

  function handleEditResource(res: Resource) {
    editResource = res;
    modals.update((m) => ({ ...m, resource: true }));
  }
</script>

{#if loading}
  <LoadingScreen message="Memuat proyek..." />
{:else}
  <div class="flex h-screen overflow-hidden bg-[var(--bg)]">
    <Sidebar />

    <div class="flex-1 flex flex-col overflow-hidden">
      <Topbar onProfile={handleProfile} />
      <main class="flex-1 overflow-y-auto p-6">
        {@render children()}
      </main>
    </div>
  </div>

  <!-- Global Modals -->
  <ProjectModal
    open={$modals.project}
    onClose={() => modals.update((m) => ({ ...m, project: false }))}
    onSaved={async (proj) => {
      if (proj) {
        activeProjectId.set(proj.id);
        await goto(`/${proj.id}/tasks`);
      }
    }}
  />

  <TaskModal
    open={$modals.task}
    onClose={() => {
      modals.update((m) => ({ ...m, task: false }));
      import('$lib/stores/app.store').then(({ editingTaskId }) => editingTaskId.set(null));
    }}
  />

  <TaskDetailModal
    open={$modals.taskDetail}
    onClose={() => {
      modals.update((m) => ({ ...m, taskDetail: false }));
      import('$lib/stores/app.store').then(({ viewingTaskId }) => viewingTaskId.set(null));
    }}
  />

  <ResourceModal
    open={$modals.resource}
    editResource={editResource}
    onClose={() => {
      modals.update((m) => ({ ...m, resource: false }));
      editResource = null;
    }}
  />

  <MasterModal
    open={$modals.master}
    onClose={() => {
      modals.update((m) => ({ ...m, master: false }));
      import('$lib/stores/app.store').then(({ editingMasterId }) => editingMasterId.set(null));
    }}
  />

  <ProfileModal
    open={$modals.profile}
    onClose={() => modals.update((m) => ({ ...m, profile: false }))}
  />
{/if}
