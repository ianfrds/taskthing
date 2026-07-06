// =========================================================
// lib/supabase.ts — Supabase client singleton
// =========================================================

import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

// =========================================================
// Auth helpers
// =========================================================

export async function signIn(credential: string, password: string): Promise<void> {
  const isEmail = credential.includes('@');
  if (isEmail) {
    const { error } = await supabase.auth.signInWithPassword({ email: credential, password });
    if (error) throw error;
  } else {
    await loginWithUsernameOrEmail(credential, password);
  }
}

export async function loginWithUsernameOrEmail(credential: string, password: string): Promise<void> {
  const isEmail = credential.includes('@');
  let email = credential;
  if (!isEmail) {
    const { data, error } = await supabase
      .from('usernames')
      .select('email')
      .eq('username', credential)
      .maybeSingle();
    if (error || !data) throw new Error('Username tidak ditemukan.');
    email = data.email;
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUp(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function updateProfile(displayName: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ data: { display_name: displayName } });
  if (error) throw error;
}

export async function changePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function registerWithUsername(
  email: string,
  password: string,
  username: string,
  displayName: string
): Promise<void> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName || username } },
  });
  if (error) throw error;
  if (!data.user) throw new Error('Registrasi gagal.');

  const { error: insertError } = await supabase.from('usernames').insert({
    user_id: data.user.id,
    username,
    email,
  });
  if (insertError) throw insertError;
}

export async function checkUsername(username: string): Promise<{ available: boolean; error: string | null }> {
  const { data } = await supabase
    .from('usernames')
    .select('id')
    .eq('username', username)
    .maybeSingle();
  return { available: !data, error: data ? 'Username sudah dipakai.' : null };
}

export async function getUsername(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('usernames')
    .select('username')
    .eq('user_id', userId)
    .maybeSingle();
  return data?.username ?? null;
}

export async function updateUsername(userId: string, username: string, email: string): Promise<void> {
  const { data: existing } = await supabase
    .from('usernames')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('usernames').update({ username }).eq('user_id', userId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('usernames').insert({ user_id: userId, username, email });
    if (error) throw error;
  }
}

export async function getUserIdByEmail(email: string): Promise<string | null> {
  const { data } = await supabase.rpc('get_user_id_by_email', { email_input: email });
  return data ?? null;
}
