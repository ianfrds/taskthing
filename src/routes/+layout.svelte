<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { supabase } from '$lib/supabase';
  import Toast from '$components/ui/Toast.svelte';
  import LoadingScreen from '$components/ui/LoadingScreen.svelte';

  let { data, children } = $props();

  let checking = $state(true);

  const PUBLIC_ROUTES = ['/login', '/register'];

  onMount(() => {
    // Check initial session
    const isPublic = PUBLIC_ROUTES.some((r) => $page.url.pathname.startsWith(r));
    if (!data.session && !isPublic) {
      goto('/login');
    }
    checking = false;

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        goto('/login');
      } else if (event === 'SIGNED_IN' && session) {
        const isPublicNow = PUBLIC_ROUTES.some((r) => $page.url.pathname.startsWith(r));
        if (isPublicNow) goto('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  });
</script>

{#if checking}
  <LoadingScreen message="Memeriksa sesi..." />
{:else}
  {@render children()}
{/if}

<Toast />
