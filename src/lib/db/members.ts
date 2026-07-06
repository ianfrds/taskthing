// =========================================================
// lib/db/members.ts — Members CRUD
// =========================================================

import { supabase } from '$lib/supabase';
import type { Member } from '$lib/types';

export async function createMember(projectId: string, name: string, email: string, color: string): Promise<Member> {
  try {
    const { data, error } = await supabase
      .from('members')
      .insert({ project_id: projectId, name, email, color })
      .select()
      .single();
    if (error) {
      console.error('db.createMember:', error);
      throw error;
    }
    return data as Member;
  } catch (e) {
    console.warn('db.createMember failed:', e);
    throw e;
  }
}

export async function updateMember(id: string, updates: Partial<Member>): Promise<Member> {
  try {
    const { data, error } = await supabase
      .from('members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('db.updateMember:', error);
      throw error;
    }
    return data as Member;
  } catch (e) {
    console.warn('db.updateMember failed:', e);
    throw e;
  }
}

export async function deleteMember(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) {
      console.error('db.deleteMember:', error);
      throw error;
    }
  } catch (e) {
    console.warn('db.deleteMember failed:', e);
    throw e;
  }
}
