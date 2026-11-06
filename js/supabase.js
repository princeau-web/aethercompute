// AetherCompute - Supabase client config
// Project: aethercompute (sfbomfhtepgffurzmoji) - DO NOT use PageSecret

const SUPABASE_URL = 'https://sfbomfhtepgffurzmoji.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmYm9tZmh0ZXBnZmZ1cnptb2ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5Mjc1NjgsImV4cCI6MjEwOTUwMzU2OH0.4j9ud_M2x4Z3kLfn2qpUbPqHGWxXdX9ng8GXhAqusxg';

// Load Supabase from CDN if not already present
let supabaseClient = null;

async function getSupabase() {
  if (supabaseClient) return supabaseClient;
  if (typeof window.supabase === 'undefined') {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseClient;
}

// Fetch available GPUs from catalog
async function fetchGpus() {
  try {
    const sb = await getSupabase();
    const { data, error } = await sb
      .from('gpu_catalog')
      .select('*')
      .eq('available', true)
      .order('price_per_hour', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching GPUs:', err);
    return [];
  }
}

window.AetherDB = { getSupabase, fetchGpus, SUPABASE_URL };
