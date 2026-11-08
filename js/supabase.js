// VelysDrone — Supabase (projet aethercompute / backend VelysDrone)
// Ne pas utiliser PageSecret
const SUPABASE_URL = 'https://sfbomfhtepgffurzmoji.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmYm9tZmh0ZXBnZmZ1cnptb2ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5Mjc1NjgsImV4cCI6MjEwOTUwMzU2OH0.4j9ud_M2x4Z3kLfn2qpUbPqHGWxXdX9ng8GXhAqusxg';

let supabaseClient = null;

async function getSupabase() {
  if (supabaseClient) return supabaseClient;
  if (typeof window.supabase === 'undefined') {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseClient;
}

function phoneKey(phone) {
  return String(phone || '').replace(/\s/g, '');
}

async function dbRegisterUser(payload) {
  const sb = await getSupabase();
  const row = {
    phone: payload.phone,
    phone_key: phoneKey(payload.phone),
    name: payload.name,
    secret_code: payload.secret,
    avatar: payload.avatar || null,
    country: payload.country || 'CI',
    balance: 0,
    today_income: 0,
    total_income: 0,
    ref_code: payload.refCode,
    referred_by: payload.referredBy || null,
    first_invest_done: false,
    aff_earnings: 0,
    drones: []
  };
  const { data, error } = await sb.from('velys_users').upsert(row, { onConflict: 'phone_key' }).select().single();
  if (error) throw error;
  return data;
}

async function dbLoginUser(phone, secret) {
  const sb = await getSupabase();
  const key = phoneKey(phone);
  const { data, error } = await sb.from('velys_users').select('*').eq('phone_key', key).eq('secret_code', secret).maybeSingle();
  if (error) throw error;
  return data;
}

async function dbGetUserByKey(key) {
  const sb = await getSupabase();
  const { data, error } = await sb.from('velys_users').select('*').eq('phone_key', phoneKey(key)).maybeSingle();
  if (error) throw error;
  return data;
}

async function dbGetUserByRef(refCode) {
  const sb = await getSupabase();
  const { data, error } = await sb.from('velys_users').select('*').eq('ref_code', String(refCode).toUpperCase()).maybeSingle();
  if (error) throw error;
  return data;
}

async function dbUpdateUser(id, patch) {
  const sb = await getSupabase();
  const { data, error } = await sb.from('velys_users').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

async function dbAddTransaction(userId, type, amount, status, meta) {
  const sb = await getSupabase();
  const { data, error } = await sb.from('velys_transactions').insert({
    user_id: userId, type, amount, status: status || 'success', meta: meta || {}
  }).select().single();
  if (error) throw error;
  return data;
}

async function dbListTransactions(userId) {
  const sb = await getSupabase();
  const { data, error } = await sb.from('velys_transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(100);
  if (error) throw error;
  return data || [];
}

async function dbCreateDeposit(row) {
  const sb = await getSupabase();
  const { data, error } = await sb.from('deposits').insert(row).select().single();
  if (error) throw error;
  return data;
}

async function dbCreateWithdrawal(row) {
  const sb = await getSupabase();
  const { data, error } = await sb.from('withdrawals').insert(row).select().single();
  if (error) throw error;
  return data;
}

async function dbCreateInvestment(row) {
  const sb = await getSupabase();
  const { data, error } = await sb.from('velys_investments').insert(row).select().single();
  if (error) throw error;
  return data;
}

async function dbAddReferral(sponsorId, recruitId) {
  const sb = await getSupabase();
  const { data, error } = await sb.from('velys_referrals').upsert({
    sponsor_id: sponsorId, recruit_id: recruitId, invested: false, commission: 0
  }, { onConflict: 'sponsor_id,recruit_id' }).select().single();
  if (error) throw error;
  return data;
}

async function dbMarkReferralInvested(sponsorId, recruitId, commission, productName) {
  const sb = await getSupabase();
  const { data, error } = await sb.from('velys_referrals').update({
    invested: true, commission, product_name: productName
  }).eq('sponsor_id', sponsorId).eq('recruit_id', recruitId).select().single();
  if (error) throw error;
  return data;
}

async function dbListReferrals(sponsorId) {
  const sb = await getSupabase();
  const { data, error } = await sb.from('velys_referrals').select('*').eq('sponsor_id', sponsorId).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

window.VelysDB = {
  getSupabase, dbRegisterUser, dbLoginUser, dbGetUserByKey, dbGetUserByRef,
  dbUpdateUser, dbAddTransaction, dbListTransactions, dbCreateDeposit,
  dbCreateWithdrawal, dbCreateInvestment, dbAddReferral, dbMarkReferralInvested,
  dbListReferrals, phoneKey, SUPABASE_URL, SUPABASE_ANON_KEY
};
