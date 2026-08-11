import { getSupabaseClient } from './supabaseClient';
import { ACTIVE_PROJECT_STATUSES, PROJECT_PRIORITIES, PROJECT_STATUSES } from './projectConstants';

export { ACTIVE_PROJECT_STATUSES, PROJECT_PRIORITIES, PROJECT_STATUSES };

export async function getProjects() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getProject(id) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createProject(project) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .insert([project])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProject(id, patch) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
