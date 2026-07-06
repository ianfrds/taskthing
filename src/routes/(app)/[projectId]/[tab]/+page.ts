import { fetchProjectData } from '$lib/db/projects';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  const { projectId, tab } = params;

  // Auth guard sudah dilakukan di root layout dan (app)/+layout.svelte.
  // Jangan cek session di sini karena supabase.auth.getSession() return null
  // saat SSR (tidak ada cookie handling tanpa @supabase/ssr), yang menyebabkan
  // 401 setiap kali user refresh halaman.

  return {
    projectId,
    tab: tab ?? 'tasks',
  };
};
