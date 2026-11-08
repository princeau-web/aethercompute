const ADMINS = [
  { email: 'ahoussoukonanprince@gmail.com', password: 'Princeau0170@' },
  { email: 'hvhk642@gmail.com', password: 'Hvhk642@' }
];
const SUPABASE_URL = 'https://sfbomfhtepgffurzmoji.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmYm9tZmh0ZXBnZmZ1cnptb2ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5Mjc1NjgsImV4cCI6MjEwOTUwMzU2OH0.4j9ud_M2x4Z3kLfn2qpUbPqHGWxXdX9ng8GXhAqusxg';
const PRODUCTS = {
  vd1: { id: 'vd1', name: 'VelysDrone Mini', price: 3000, daily: 2050, cycle: 2 },
  vd2: { id: 'vd2', name: 'VelysDrone Air', price: 10000, daily: 1200, cycle: 18 },
  vd3: { id: 'vd3', name: 'VelysDrone Pro', price: 30000, daily: 3500, cycle: 30 },
  vd4: { id: 'vd4', name: 'VelysDrone Max', price: 80000, daily: 9000, cycle: 60 },
  vd5: { id: 'vd5', name: 'VelysDrone Elite', price: 150000, daily: 18000, cycle: 90 },
  vd6: { id: 'vd6', name: 'VelysDrone Ultimate', price: 300000, daily: 45000, cycle: 180 }
};
const TITLES = { dashboard: 'Tableau de bord', users: 'Utilisateurs', credit: 'Fonds', deposits: 'Depots', withdrawals: 'Retraits', investments: 'Investissements', transactions: 'Transactions', referrals: 'Affiliation', tools: 'Outils avances' };
let sb = null;
let cache = { users: [], deposits: [], withdrawals: [], investments: [], transactions: [], referrals: [] };
function getSb() { if (!sb) sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON); return sb; }
function phoneKey(p) { return String(p || '').replace(/\s/g, ''); }
function fmt(n) { return Number(n || 0).toLocaleString('fr-FR'); }
function fmtDate(d) { if (!d) return '-'; try { return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch { return d; } }
function openSidebar() { document.getElementById('sidebar').classList.add('open'); document.getElementById('sidebar-backdrop').classList.add('open'); }
function closeSidebar() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('sidebar-backdrop').classList.remove('open'); }
function adminLogin() {
  const email = (document.getElementById('admin-email').value || '').trim().toLowerCase();
  const password = document.getElementById('admin-password').value || '';
  const msg = document.getElementById('admin-login-msg');
  if (!ADMINS.some(a => a.email.toLowerCase() === email && a.password === password)) { msg.textContent = 'Email ou mot de passe incorrect.'; msg.classList.remove('hidden'); return; }
  sessionStorage.setItem('velys_admin', JSON.stringify({ email, at: Date.now() }));
  openAdmin();
}
function adminLogout() {
  sessionStorage.removeItem('velys_admin');
  document.getElementById('admin-view').classList.remove('open');
  document.getElementById('admin-view').style.display = 'none';
  document.getElementById('login-view').classList.remove('hidden');
}
function openAdmin() {
  document.getElementById('login-view').classList.add('hidden');
  const v = document.getElementById('admin-view');
  v.classList.add('open'); v.style.display = 'flex';
  showPanel('dashboard'); refreshAll();
}
function showPanel(name) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('panel-' + name); if (el) el.classList.add('active');
  document.querySelectorAll('.sidebar a').forEach(a => a.classList.toggle('active', a.getAttribute('data-panel') === name));
  document.getElementById('header-title').textContent = TITLES[name] || name;
  closeSidebar();
  if (name === 'users') renderUsers();
  if (name === 'deposits') renderDeposits();
  if (name === 'withdrawals') renderWithdrawals();
  if (name === 'investments') renderInvestments();
  if (name === 'transactions') renderTransactions();
  if (name === 'referrals') renderReferrals();
  if (name === 'dashboard') renderDashboard();
}
async function refreshAll() {
  const client = getSb();
  try {
    const [u, d, w, i, t, r] = await Promise.all([
      client.from('velys_users').select('*').order('created_at', { ascending: false }),
      client.from('deposits').select('*').order('created_at', { ascending: false }).limit(100),
      client.from('withdrawals').select('*').order('created_at', { ascending: false }).limit(100),
      client.from('velys_investments').select('*').order('created_at', { ascending: false }).limit(100),
      client.from('velys_transactions').select('*').order('created_at', { ascending: false }).limit(150),
      client.from('velys_referrals').select('*').order('created_at', { ascending: false }).limit(100)
    ]);
    cache.users = u.data || []; cache.deposits = d.data || []; cache.withdrawals = w.data || [];
    cache.investments = i.data || []; cache.transactions = t.data || []; cache.referrals = r.data || [];
  } catch (e) { console.error(e); alert('Erreur Supabase: ' + (e.message || e)); }
  renderDashboard(); renderUsers(); renderDeposits(); renderWithdrawals(); renderInvestments(); renderTransactions(); renderReferrals();
}
function renderDashboard() {
  const users = cache.users;
  const bal = users.reduce((s, u) => s + Number(u.balance || 0), 0);
  document.getElementById('stat-users').textContent = users.length;
  document.getElementById('stat-balance').textContent = fmt(bal) + ' XOF';
  document.getElementById('stat-dep').textContent = cache.deposits.filter(x => x.status === 'pending' || !x.credited).length;
  document.getElementById('stat-wit').textContent = cache.withdrawals.filter(x => x.status === 'pending').length;
  const inv = cache.investments.filter(x => x.status === 'en_cours');
  document.getElementById('stat-inv').textContent = inv.length;
  document.getElementById('stat-inv-vol').textContent = fmt(inv.reduce((s, x) => s + Number(x.price || 0), 0)) + ' XOF';
  document.getElementById('stat-aff').textContent = fmt(users.reduce((s, u) => s + Number(u.aff_earnings || 0), 0)) + ' XOF';
  document.getElementById('dash-users').innerHTML = users.slice(0, 8).map(u => `<div class="flex justify-between py-2 border-b border-white/5"><span>${u.name || '-'} <span class="text-gray-500">${u.phone || ''}</span></span><span class="text-sky-400">${fmt(u.balance)} XOF</span></div>`).join('') || '<p>Aucun utilisateur</p>';
}
function renderUsers() {
  const q = (document.getElementById('user-search')?.value || '').toLowerCase().trim();
  let list = cache.users;
  if (q) list = list.filter(u => (u.name || '').toLowerCase().includes(q) || (u.phone || '').toLowerCase().includes(q) || (u.ref_code || '').toLowerCase().includes(q));
  const tb = document.getElementById('users-tbody');
  if (!tb) return;
  tb.innerHTML = list.map(u => `<tr class="border-b border-white/5"><td class="p-3 font-medium">${u.name || '-'}</td><td class="p-3 text-gray-400">${u.phone || '-'}</td><td class="p-3 text-sky-400">${fmt(u.balance)}</td><td class="p-3 text-xs">${u.ref_code || '-'}</td><td class="p-3"><button onclick="openUserModal('${u.id}')" class="text-xs px-2 py-1 rounded bg-white/10 mr-1">Voir</button><button onclick="prefillCredit('${(u.phone || '').replace(/'/g, "\\'")}')" class="text-xs px-2 py-1 rounded bg-sky-600/40">Fonds</button></td></tr>`).join('') || '<tr><td colspan="5" class="p-6 text-center text-gray-500">Aucun</td></tr>';
}
function prefillCredit(phone) { document.getElementById('credit-phone').value = phone; showPanel('credit'); }
function openUserModal(id) {
  const u = cache.users.find(x => x.id === id); if (!u) return;
  document.getElementById('user-modal-body').innerHTML = `<div class="flex justify-between"><span class="text-gray-400">Nom</span><span>${u.name || '-'}</span></div><div class="flex justify-between"><span class="text-gray-400">Telephone</span><span>${u.phone || '-'}</span></div><div class="flex justify-between"><span class="text-gray-400">Solde</span><span class="text-sky-400">${fmt(u.balance)} XOF</span></div><div class="flex justify-between"><span class="text-gray-400">Total revenus</span><span>${fmt(u.total_income)} XOF</span></div><div class="flex justify-between"><span class="text-gray-400">Aff gains</span><span>${fmt(u.aff_earnings)} XOF</span></div><div class="flex justify-between"><span class="text-gray-400">Ref</span><span>${u.ref_code || '-'}</span></div><div class="flex justify-between"><span class="text-gray-400">Parrain</span><span>${u.referred_by || '-'}</span></div><div class="flex justify-between"><span class="text-gray-400">Pays</span><span>${u.country || '-'}</span></div><div class="flex justify-between"><span class="text-gray-400">Cree</span><span>${fmtDate(u.created_at)}</span></div>`;
  const m = document.getElementById('user-modal'); m.classList.remove('hidden'); m.classList.add('flex');
}
function closeUserModal() { const m = document.getElementById('user-modal'); m.classList.add('hidden'); m.classList.remove('flex'); }
async function findUserByPhone(phone) {
  const key = phoneKey(phone);
  let u = cache.users.find(x => phoneKey(x.phone) === key || x.phone_key === key || x.id === phone);
  if (u) return u;
  const { data } = await getSb().from('velys_users').select('*').or(`phone_key.eq.${key},id.eq.${phone}`).maybeSingle();
  return data;
}
async function adminCredit(sign) {
  const phone = document.getElementById('credit-phone').value.trim();
  const amount = Number(document.getElementById('credit-amount').value);
  const note = document.getElementById('credit-note').value.trim() || 'Ajustement admin';
  const msg = document.getElementById('credit-msg'); msg.classList.remove('hidden');
  if (!phone || !amount || amount <= 0) { msg.textContent = 'Telephone et montant requis.'; msg.className = 'text-sm text-center text-red-400'; return; }
  try {
    const u = await findUserByPhone(phone); if (!u) throw new Error('Utilisateur introuvable');
    const newBal = Number(u.balance || 0) + sign * amount;
    if (newBal < 0) throw new Error('Solde insuffisant');
    const { error } = await getSb().from('velys_users').update({ balance: newBal, updated_at: new Date().toISOString() }).eq('id', u.id);
    if (error) throw error;
    await getSb().from('velys_transactions').insert({ user_id: u.id, type: sign > 0 ? 'deposit' : 'withdraw', amount, status: 'success', meta: { admin: true, note } });
    msg.textContent = (sign > 0 ? 'Credit' : 'Debit') + ' OK - Solde: ' + fmt(newBal) + ' XOF'; msg.className = 'text-sm text-center text-sky-400';
    await refreshAll();
  } catch (e) { msg.textContent = e.message || String(e); msg.className = 'text-sm text-center text-red-400'; }
}
function renderDeposits() {
  const tb = document.getElementById('deposits-tbody'); if (!tb) return;
  tb.innerHTML = cache.deposits.map(d => `<tr class="border-b border-white/5"><td class="p-3 text-xs text-gray-400">${fmtDate(d.created_at)}</td><td class="p-3">${d.phone || '-'}</td><td class="p-3 text-sky-400">${fmt(d.amount)}</td><td class="p-3 text-xs">${d.network || '-'}</td><td class="p-3 text-xs">${d.status || 'pending'}</td><td class="p-3">${!(d.credited || d.status === 'success') ? `<button onclick="approveDeposit('${d.id}')" class="text-xs px-2 py-1 rounded bg-emerald-600/40">Valider</button>` : '-'}</td></tr>`).join('') || '<tr><td colspan="6" class="p-6 text-center text-gray-500">Aucun</td></tr>';
}
async function approveDeposit(id) {
  const d = cache.deposits.find(x => x.id === id); if (!d || !confirm('Valider et crediter ?')) return;
  try {
    let u = d.user_id ? cache.users.find(x => x.id === d.user_id) : null;
    if (!u && d.user_id) { const r = await getSb().from('velys_users').select('*').eq('id', d.user_id).maybeSingle(); u = r.data; }
    if (!u) u = await findUserByPhone(d.phone);
    if (u) {
      await getSb().from('velys_users').update({ balance: Number(u.balance || 0) + Number(d.amount || 0) }).eq('id', u.id);
      await getSb().from('velys_transactions').insert({ user_id: u.id, type: 'deposit', amount: d.amount, status: 'success', meta: { admin_approved: true } });
    }
    await getSb().from('deposits').update({ status: 'success', credited: true }).eq('id', id);
    await refreshAll(); alert('OK');
  } catch (e) { alert(e.message || e); }
}
function renderWithdrawals() {
  const tb = document.getElementById('withdrawals-tbody'); if (!tb) return;
  tb.innerHTML = cache.withdrawals.map(w => `<tr class="border-b border-white/5"><td class="p-3 text-xs text-gray-400">${fmtDate(w.created_at)}</td><td class="p-3">${w.phone || '-'}</td><td class="p-3 text-orange-400">${fmt(w.amount)}</td><td class="p-3 text-xs">${w.method || '-'}</td><td class="p-3 text-xs">${w.status || 'pending'}</td><td class="p-3">${w.status === 'pending' ? `<button onclick="setWithdrawal('${w.id}','success')" class="text-xs px-2 py-1 rounded bg-emerald-600/40 mr-1">OK</button><button onclick="setWithdrawal('${w.id}','rejected')" class="text-xs px-2 py-1 rounded bg-red-600/40">Rejeter</button>` : '-'}</td></tr>`).join('') || '<tr><td colspan="6" class="p-6 text-center text-gray-500">Aucun</td></tr>';
}
async function setWithdrawal(id, status) {
  if (!confirm(status === 'success' ? 'Marquer paye ?' : 'Rejeter et rembourser ?')) return;
  try {
    const w = cache.withdrawals.find(x => x.id === id);
    await getSb().from('withdrawals').update({ status }).eq('id', id);
    if (status === 'rejected' && w) {
      let u = w.user_id ? (await getSb().from('velys_users').select('*').eq('id', w.user_id).maybeSingle()).data : null;
      if (!u) u = await findUserByPhone(w.phone);
      if (u) {
        await getSb().from('velys_users').update({ balance: Number(u.balance || 0) + Number(w.amount || 0) }).eq('id', u.id);
        await getSb().from('velys_transactions').insert({ user_id: u.id, type: 'deposit', amount: w.amount, status: 'success', meta: { refund: true } });
      }
    }
    await refreshAll();
  } catch (e) { alert(e.message || e); }
}
function renderInvestments() {
  const tb = document.getElementById('investments-tbody'); if (!tb) return;
  tb.innerHTML = cache.investments.map(i => `<tr class="border-b border-white/5"><td class="p-3 text-xs text-gray-400">${fmtDate(i.bought_at || i.created_at)}</td><td class="p-3">${i.product_name || i.product_id}</td><td class="p-3">${fmt(i.price)}</td><td class="p-3 text-xs">${i.status}</td><td class="p-3 text-xs text-gray-500">${(i.user_id || '').slice(0, 8)}</td></tr>`).join('') || '<tr><td colspan="5" class="p-6 text-center text-gray-500">Aucun</td></tr>';
}
function renderTransactions() {
  const tb = document.getElementById('tx-tbody'); if (!tb) return;
  tb.innerHTML = cache.transactions.map(t => `<tr class="border-b border-white/5"><td class="p-3 text-xs text-gray-400">${fmtDate(t.created_at)}</td><td class="p-3">${t.type}</td><td class="p-3">${fmt(t.amount)}</td><td class="p-3 text-xs">${t.status || '-'}</td><td class="p-3 text-xs text-gray-500">${(t.user_id || '').slice(0, 8)}</td></tr>`).join('') || '<tr><td colspan="5" class="p-6 text-center text-gray-500">Aucune</td></tr>';
}
function renderReferrals() {
  const tb = document.getElementById('ref-tbody'); if (!tb) return;
  tb.innerHTML = cache.referrals.map(r => `<tr class="border-b border-white/5"><td class="p-3 text-xs text-gray-400">${fmtDate(r.created_at)}</td><td class="p-3 text-xs">${(r.sponsor_id || '').slice(0, 8)}</td><td class="p-3 text-xs">${(r.recruit_id || '').slice(0, 8)}</td><td class="p-3">${r.invested ? 'Oui' : 'Non'}</td><td class="p-3">${fmt(r.commission)}</td></tr>`).join('') || '<tr><td colspan="5" class="p-6 text-center text-gray-500">Aucune</td></tr>';
}
function toolsMsg(text, ok) { const m = document.getElementById('tools-msg'); m.textContent = text; m.className = 'text-sm text-center ' + (ok ? 'text-sky-400' : 'text-red-400'); m.classList.remove('hidden'); }
async function adminResetSecret() {
  const phone = document.getElementById('tool-phone').value.trim();
  const secret = document.getElementById('tool-secret').value.trim();
  if (!/^\d{6}$/.test(secret)) return toolsMsg('Code: 6 chiffres', false);
  try {
    const u = await findUserByPhone(phone); if (!u) throw new Error('Introuvable');
    await getSb().from('velys_users').update({ secret_code: secret }).eq('id', u.id);
    toolsMsg('Code mis a jour', true); await refreshAll();
  } catch (e) { toolsMsg(e.message || String(e), false); }
}
async function adminForceInvest() {
  const phone = document.getElementById('force-phone').value.trim();
  const p = PRODUCTS[document.getElementById('force-product').value];
  const deduct = document.getElementById('force-deduct').checked;
  if (!p) return toolsMsg('Produit invalide', false);
  try {
    const u = await findUserByPhone(phone); if (!u) throw new Error('Introuvable');
    let bal = Number(u.balance || 0);
    if (deduct) { if (bal < p.price) throw new Error('Solde insuffisant'); bal -= p.price; }
    const drones = Array.isArray(u.drones) ? u.drones.slice() : [];
    drones.push({ id: p.id, name: p.name, price: p.price, daily: p.daily, boughtAt: Date.now(), status: 'en_cours' });
    await getSb().from('velys_users').update({ balance: bal, drones, first_invest_done: true }).eq('id', u.id);
    await getSb().from('velys_investments').insert({ user_id: u.id, product_id: p.id, product_name: p.name, price: p.price, daily_income: p.daily, cycle_days: p.cycle, status: 'en_cours' });
    await getSb().from('velys_transactions').insert({ user_id: u.id, type: 'invest', amount: p.price, status: 'en_cours', meta: { admin: true, name: p.name } });
    toolsMsg('Drone attribue: ' + p.name, true); await refreshAll();
  } catch (e) { toolsMsg(e.message || String(e), false); }
}
async function adminZeroBalance() {
  const phone = document.getElementById('zero-phone').value.trim();
  if (!confirm('Solde a 0 ?')) return;
  try {
    const u = await findUserByPhone(phone); if (!u) throw new Error('Introuvable');
    await getSb().from('velys_users').update({ balance: 0 }).eq('id', u.id);
    await getSb().from('velys_transactions').insert({ user_id: u.id, type: 'withdraw', amount: Number(u.balance || 0), status: 'success', meta: { admin: true } });
    toolsMsg('Solde a 0', true); await refreshAll();
  } catch (e) { toolsMsg(e.message || String(e), false); }
}
async function adminCreditIncome() {
  const phone = document.getElementById('income-phone').value.trim();
  const amount = Number(document.getElementById('income-amount').value);
  if (!amount || amount <= 0) return toolsMsg('Montant invalide', false);
  try {
    const u = await findUserByPhone(phone); if (!u) throw new Error('Introuvable');
    await getSb().from('velys_users').update({ balance: Number(u.balance || 0) + amount, total_income: Number(u.total_income || 0) + amount, today_income: Number(u.today_income || 0) + amount }).eq('id', u.id);
    await getSb().from('velys_transactions').insert({ user_id: u.id, type: 'income', amount, status: 'success', meta: { admin: true } });
    toolsMsg('Revenu credite', true); await refreshAll();
  } catch (e) { toolsMsg(e.message || String(e), false); }
}
(function () { try { const a = JSON.parse(sessionStorage.getItem('velys_admin') || 'null'); if (a && a.email && Date.now() - (a.at || 0) < 12 * 3600 * 1000) openAdmin(); } catch (_) {} })();
