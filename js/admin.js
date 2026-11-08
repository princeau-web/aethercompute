// VelysDrone Admin
const ADMINS = [
  { email: 'ahoussoukonanprince@gmail.com', password: 'Princeau0170@' },
  { email: 'hvhk642@gmail.com', password: 'Hvhk642@' }
];

const SUPABASE_URL = 'https://sfbomfhtepgffurzmoji.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmYm9tZmh0ZXBnZmZ1cnptb2ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5Mjc1NjgsImV4cCI6MjEwOTUwMzU2OH0.4j9ud_M2x4Z3kLfn2qpUbPqHGWxXdX9ng8GXhAqusxg';

const PRODUCTS = [
  { id: 'vd1', name: 'VelysDrone Mini', price: 3000, daily: 2050, cycle: 2 },
  { id: 'vd2', name: 'VelysDrone Air', price: 10000, daily: 1200, cycle: 18 },
  { id: 'vd3', name: 'VelysDrone Pro', price: 30000, daily: 3500, cycle: 30 },
  { id: 'vd4', name: 'VelysDrone Max', price: 80000, daily: 9000, cycle: 60 },
  { id: 'vd5', name: 'VelysDrone Elite', price: 150000, daily: 18000, cycle: 90 },
  { id: 'vd6', name: 'VelysDrone Ultimate', price: 300000, daily: 45000, cycle: 180 }
];

function adminLogin() {
  const email = (document.getElementById('admin-email').value || '').trim().toLowerCase();
  const password = document.getElementById('admin-password').value || '';
  const msg = document.getElementById('admin-login-msg');
  const ok = ADMINS.some(a => a.email.toLowerCase() === email && a.password === password);
  if (!ok) {
    msg.textContent = 'Email ou mot de passe incorrect.';
    msg.classList.remove('hidden');
    return;
  }
  sessionStorage.setItem('velys_admin', JSON.stringify({ email, at: Date.now() }));
  openAdmin();
}

function adminLogout() {
  sessionStorage.removeItem('velys_admin');
  document.getElementById('admin-view').classList.add('hidden');
  document.getElementById('login-view').classList.remove('hidden');
}

function openAdmin() {
  document.getElementById('login-view').classList.add('hidden');
  document.getElementById('admin-view').classList.remove('hidden');
  showPanel('dashboard');
  refreshAll();
}

function showPanel(name) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  document.querySelectorAll('.sidebar a').forEach(a => {
    a.classList.remove('active');
    a.classList.add('text-gray-400');
  });
  const nav = document.getElementById('nav-' + name);
  if (nav) { nav.classList.add('active'); nav.classList.remove('text-gray-400'); }
  if (name === 'users') loadUsers();
  if (name === 'deposits') loadDeposits();
  if (name === 'withdrawals') loadWithdrawals();
  if (name === 'investments') loadInvestments();
  if (name === 'products') loadProductsAdmin();
  if (name === 'dashboard') refreshStats();
}

function getRegistry() {
  try { return JSON.parse(localStorage.getItem('velys_users') || '{}'); } catch { return {}; }
}
function getCurrentUserBlob() {
  try { return JSON.parse(localStorage.getItem('velys_user') || 'null'); } catch { return null; }
}

function collectUsers() {
  const registry = getRegistry();
  const list = [];
  const seen = new Set();
  for (const [key, entry] of Object.entries(registry)) {
    seen.add(key);
    const blob = getCurrentUserBlob();
    let balance = 0, drones = [], txs = [];
    if (blob && blob.phone && blob.phone.replace(/\s/g, '') === key) {
      balance = Number(blob.balance || 0);
      drones = blob.drones || [];
      txs = blob.transactions || [];
    }
    try {
      const stored = JSON.parse(localStorage.getItem('velys_user_' + key) || 'null');
      if (stored) {
        balance = Number(stored.balance || balance);
        drones = stored.drones || drones;
        txs = stored.transactions || txs;
      }
    } catch {}
    list.push({ key, name: entry.name || '—', phone: entry.phone || key, avatar: entry.avatar, balance, drones, transactions: txs });
  }
  const blob = getCurrentUserBlob();
  if (blob && blob.phone) {
    const key = blob.phone.replace(/\s/g, '');
    if (!seen.has(key)) {
      list.push({ key, name: blob.name || '—', phone: blob.phone, avatar: blob.avatar, balance: Number(blob.balance || 0), drones: blob.drones || [], transactions: blob.transactions || [] });
    }
  }
  return list;
}

function refreshStats() {
  const users = collectUsers();
  document.getElementById('stat-users').textContent = users.length;
  document.getElementById('stat-balance').textContent = users.reduce((s, u) => s + Number(u.balance || 0), 0).toLocaleString('fr-FR');
  let depSum = 0, pendingWit = 0;
  const recent = [];
  users.forEach(u => {
    (u.transactions || []).forEach(t => {
      if (t.type === 'deposit') depSum += Number(t.amount || 0);
      if (t.type === 'withdraw' && t.status === 'pending') pendingWit++;
      recent.push({ ...t, user: u.name });
    });
  });
  document.getElementById('stat-deposits').textContent = depSum.toLocaleString('fr-FR');
  document.getElementById('stat-withdrawals').textContent = pendingWit;
  recent.sort((a, b) => new Date(b.date) - new Date(a.date));
  const box = document.getElementById('recent-activity');
  if (!recent.length) { box.innerHTML = '<p class="text-gray-500">Aucune activité locale.</p>'; return; }
  box.innerHTML = recent.slice(0, 15).map(t => {
    const label = { deposit: 'Dépôt', withdraw: 'Retrait', invest: 'Investissement', income: 'Revenu' }[t.type] || t.type;
    return `<div class="flex justify-between py-2 border-b border-white/5"><span>${label} · ${t.user || ''}</span><span class="text-sky-400">${Number(t.amount).toLocaleString('fr-FR')} XOF</span></div>`;
  }).join('');
}

function loadUsers() {
  const users = collectUsers();
  const tb = document.getElementById('users-tbody');
  if (!users.length) {
    tb.innerHTML = '<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">Aucun utilisateur (localStorage).</td></tr>';
    return;
  }
  tb.innerHTML = users.map(u => `
    <tr class="border-t border-white/5">
      <td class="px-4 py-3 font-medium">${escapeHtml(u.name)}</td>
      <td class="px-4 py-3 text-gray-300">${escapeHtml(u.phone)}</td>
      <td class="px-4 py-3 text-sky-400">${Number(u.balance).toLocaleString('fr-FR')} XOF</td>
      <td class="px-4 py-3">${(u.drones || []).length}</td>
      <td class="px-4 py-3"><button onclick="openCreditModal('${u.key}','${escapeHtml(u.name)} ${escapeHtml(u.phone)}')" class="text-sky-400 text-xs hover:underline">Créditer</button></td>
    </tr>`).join('');
}

function openCreditModal(key, label) {
  document.getElementById('credit-phone-key').value = key;
  document.getElementById('credit-user-label').textContent = label;
  document.getElementById('credit-amount').value = '';
  const m = document.getElementById('modal-credit');
  m.classList.remove('hidden'); m.classList.add('flex');
}
function closeCreditModal() {
  const m = document.getElementById('modal-credit');
  m.classList.add('hidden'); m.classList.remove('flex');
}

function confirmCredit() {
  const key = document.getElementById('credit-phone-key').value;
  const amount = Number(document.getElementById('credit-amount').value);
  if (!amount || amount <= 0) { alert('Montant invalide'); return; }
  let blob = getCurrentUserBlob();
  if (blob && blob.phone && blob.phone.replace(/\s/g, '') === key) {
    blob.balance = Number(blob.balance || 0) + amount;
    blob.transactions = blob.transactions || [];
    blob.transactions.unshift({ id: Date.now(), type: 'deposit', amount, date: new Date().toISOString(), status: 'admin_credit' });
    localStorage.setItem('velys_user', JSON.stringify(blob));
  }
  let stored = null;
  try { stored = JSON.parse(localStorage.getItem('velys_user_' + key) || 'null'); } catch {}
  if (!stored && blob && blob.phone && blob.phone.replace(/\s/g, '') === key) stored = blob;
  if (!stored) {
    const reg = getRegistry()[key] || {};
    stored = { phone: reg.phone || key, name: reg.name, balance: 0, drones: [], transactions: [] };
  }
  stored.balance = Number(stored.balance || 0) + amount;
  stored.transactions = stored.transactions || [];
  stored.transactions.unshift({ id: Date.now(), type: 'deposit', amount, date: new Date().toISOString(), status: 'admin_credit' });
  localStorage.setItem('velys_user_' + key, JSON.stringify(stored));
  const logs = JSON.parse(localStorage.getItem('velys_admin_logs') || '[]');
  logs.unshift({ type: 'credit', key, amount, at: new Date().toISOString() });
  localStorage.setItem('velys_admin_logs', JSON.stringify(logs));
  closeCreditModal();
  loadUsers();
  refreshStats();
  alert('Solde crédité de ' + amount.toLocaleString('fr-FR') + ' XOF');
}

async function loadDeposits() {
  const tb = document.getElementById('deposits-tbody');
  tb.innerHTML = '<tr><td colspan="7" class="px-4 py-6 text-center text-gray-500">Chargement…</td></tr>';
  try {
    const res = await fetch(SUPABASE_URL + '/rest/v1/deposits?select=*&order=created_at.desc&limit=100', {
      headers: { apikey: SUPABASE_ANON, Authorization: 'Bearer ' + SUPABASE_ANON }
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const rows = await res.json();
    if (!rows.length) {
      tb.innerHTML = '<tr><td colspan="7" class="px-4 py-8 text-center text-gray-500">Aucun dépôt en base.</td></tr>';
      return;
    }
    tb.innerHTML = rows.map(r => {
      const d = r.created_at ? new Date(r.created_at).toLocaleString('fr-FR') : '—';
      const st = (r.status || '').toLowerCase();
      const badge = st === 'success' ? 'text-emerald-400' : st === 'failed' ? 'text-red-400' : 'text-orange-400';
      return `<tr class="border-t border-white/5">
        <td class="px-4 py-3 text-gray-400">${d}</td>
        <td class="px-4 py-3">${escapeHtml(r.phone || '—')}</td>
        <td class="px-4 py-3 font-medium">${Number(r.amount || 0).toLocaleString('fr-FR')}</td>
        <td class="px-4 py-3">${escapeHtml(r.network || r.country || '—')}</td>
        <td class="px-4 py-3 ${badge}">${escapeHtml(r.status || '—')}</td>
        <td class="px-4 py-3 text-xs text-gray-500 max-w-[120px] truncate">${escapeHtml(r.saspay_payment_id || '')}</td>
        <td class="px-4 py-3">${st !== 'success' ? `<button onclick="openCreditModal('${String(r.phone||'').replace(/\s/g,'')}','${escapeHtml(r.phone||'')}')" class="text-sky-400 text-xs">Créditer user</button>` : '—'}</td>
      </tr>`;
    }).join('');
  } catch (e) {
    tb.innerHTML = `<tr><td colspan="7" class="px-4 py-8 text-center text-red-400">Erreur : ${escapeHtml(String(e.message || e))}</td></tr>`;
  }
}

async function loadWithdrawals() {
  const tb = document.getElementById('withdrawals-tbody');
  tb.innerHTML = '<tr><td colspan="6" class="px-4 py-6 text-center text-gray-500">Chargement…</td></tr>';
  try {
    const res = await fetch(SUPABASE_URL + '/rest/v1/withdrawals?select=*&order=created_at.desc&limit=100', {
      headers: { apikey: SUPABASE_ANON, Authorization: 'Bearer ' + SUPABASE_ANON }
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const rows = await res.json();
    if (!rows.length) {
      tb.innerHTML = '<tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">Aucun retrait en base.</td></tr>';
      return;
    }
    tb.innerHTML = rows.map(r => {
      const d = r.created_at ? new Date(r.created_at).toLocaleString('fr-FR') : '—';
      const st = (r.status || '').toLowerCase();
      const badge = st === 'success' || st === 'paid' ? 'text-emerald-400' : st === 'failed' || st === 'rejected' ? 'text-red-400' : 'text-orange-400';
      return `<tr class="border-t border-white/5">
        <td class="px-4 py-3 text-gray-400">${d}</td>
        <td class="px-4 py-3">${escapeHtml(r.phone || '—')}</td>
        <td class="px-4 py-3 font-medium">${Number(r.amount || 0).toLocaleString('fr-FR')}</td>
        <td class="px-4 py-3">${escapeHtml(r.country || '—')}</td>
        <td class="px-4 py-3 ${badge}">${escapeHtml(r.status || '—')}</td>
        <td class="px-4 py-3 text-xs text-gray-500">${escapeHtml(r.saspay_payout_id || '')}</td>
      </tr>`;
    }).join('');
  } catch (e) {
    tb.innerHTML = `<tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">Erreur API : ${escapeHtml(String(e.message))}</td></tr>`;
  }
}

function loadInvestments() {
  const users = collectUsers();
  const rows = [];
  users.forEach(u => (u.drones || []).forEach(d => rows.push({ user: u.name, phone: u.phone, ...d })));
  const tb = document.getElementById('invest-tbody');
  if (!rows.length) {
    tb.innerHTML = '<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">Aucun investissement.</td></tr>';
    return;
  }
  tb.innerHTML = rows.map(r => `
    <tr class="border-t border-white/5">
      <td class="px-4 py-3">${escapeHtml(r.user)} <span class="text-gray-500 text-xs">${escapeHtml(r.phone)}</span></td>
      <td class="px-4 py-3">${escapeHtml(r.name || r.id)}</td>
      <td class="px-4 py-3">${Number(r.price || 0).toLocaleString('fr-FR')}</td>
      <td class="px-4 py-3 text-sky-400">${Number(r.daily || 0).toLocaleString('fr-FR')}</td>
      <td class="px-4 py-3 text-gray-400">${r.boughtAt ? new Date(r.boughtAt).toLocaleString('fr-FR') : '—'}</td>
    </tr>`).join('');
}

function loadProductsAdmin() {
  document.getElementById('products-admin').innerHTML = PRODUCTS.map(p => `
    <div class="glass rounded-xl p-4">
      <div class="font-semibold mb-2">${p.name}</div>
      <div class="text-sm text-gray-400 space-y-1">
        <div>Prix : <span class="text-white">${p.price.toLocaleString('fr-FR')} XOF</span></div>
        <div>Revenu/jour : <span class="text-sky-400">${p.daily.toLocaleString('fr-FR')} XOF</span></div>
        <div>Cycle : ${p.cycle} jours</div>
      </div>
    </div>`).join('');
}

function saveSettings() {
  const minD = Number(document.getElementById('set-min-deposit').value) || 3000;
  const minW = Number(document.getElementById('set-min-withdraw').value) || 4000;
  localStorage.setItem('velys_settings', JSON.stringify({ minDeposit: minD, minWithdraw: minW }));
  const msg = document.getElementById('settings-msg');
  msg.textContent = 'Paramètres enregistrés.';
  msg.classList.remove('hidden');
}

function refreshAll() { refreshStats(); loadUsers(); }

function escapeHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

(function () {
  try {
    const s = JSON.parse(sessionStorage.getItem('velys_admin') || 'null');
    if (s && s.email && Date.now() - (s.at || 0) < 8 * 3600 * 1000) openAdmin();
  } catch {}
})();
