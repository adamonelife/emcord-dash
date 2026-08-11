import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const missingSupabaseVariables = [
  !url && 'VITE_SUPABASE_URL',
  !anonKey && 'VITE_SUPABASE_ANON_KEY'
].filter(Boolean);

export const isSupabaseConfigured = missingSupabaseVariables.length === 0;

if (!isSupabaseConfigured) {
  console.warn(
    `Supabase is unavailable. Missing: ${missingSupabaseVariables.join(', ')}. ` +
    'Add them to Vercel project settings or .env.local for local development.'
  );
}

export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null;

export function getSupabaseClient() {
  if (!supabase) {
    throw new Error(
      `Supabase is not configured. Missing ${missingSupabaseVariables.join(' and ')}.`
    );
  }
  return supabase;
}
