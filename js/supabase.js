// VelysDrone - Supabase client
// Project: aethercompute (sfbomfhtepgffurzmoji)

const SUPABASE_URL = 'https://sfbomfhtepgffurzmoji.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmYm9tZmh0ZXBnZmZ1cnptb2ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5Mjc1NjgsImV4cCI6MjEwOTUwMzU2OH0.4j9ud_M2x4Z3kLfn2qpUbPqHGWxXdX9ng8GXhAqusxg';

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

window.AetherDB = { getSupabase, SUPABASE_URL };
window.VelysDB = window.AetherDB;
