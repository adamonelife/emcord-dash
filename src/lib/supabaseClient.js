import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Surfaces clearly in the UI rather than failing silently on a blank screen.
  console.error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Set these in Vercel project settings (and .env.local for local dev).'
  );
}

export const supabase = createClient(url, anonKey);
