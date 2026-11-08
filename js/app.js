const METHODS = {
  CI: [{ code: 'mtn_ci', label: 'MTN Mobile Money' }, { code: 'orange_ci', label: 'Orange Money' }, { code: 'moov_ci', label: 'Moov Money' }, { code: 'wave_ci', label: 'Wave' }],
  BJ: [{ code: 'mtn_bj', label: 'MTN Mobile Money' }, { code: 'moov_bj', label: 'Moov Money' }],
  SN: [{ code: 'wave_sn', label: 'Wave' }, { code: 'orange_sn', label: 'Orange Money' }, { code: 'free_sn', label: 'Free Money' }],
  TG: [{ code: 'moov_tg', label: 'Moov Money' }, { code: 'togocom_tg', label: 'Togocom Mixx' }],
  GA: [{ code: 'airtel_ga', label: 'Airtel Money' }, { code: 'moov_ga', label: 'Moov Money' }],
  CG: [{ code: 'mtn_cg', label: 'MTN Mobile Money' }, { code: 'airtel_cg', label: 'Airtel Money' }],
  CD: [{ code: 'orange_cd', label: 'Orange Money' }, { code: 'airtel_cd', label: 'Airtel Money' }, { code: 'mpesa_cd', label: 'M-Pesa' }]
};

let captchaCode = '';
let regData = { phone: '', country: '+225', iso: 'CI', avatar: '', name: '', secret: '' };

function loadUser() {
  try { return JSON.parse(localStorage.getItem('velys_user') || 'null'); } catch { return null; }
}
let user = loadUser();

function saveUser() {
  localStorage.setItem('velys_user', JSON.stringify(user));
  updateUI();
}

function addTx(type, amount, meta = {}) {
  if (!user) return;
  user.transactions = user.transactions || [];
  user.transactions.unshift({ id: Date.now(), type, amount, date: new Date().toISOString(), ...meta });
  saveUser();
}

function isLoggedIn() {
  return user && user.loggedIn && user.phone;
}

function showScreen(name) {
  const authScreens = ['login', 'register'];
  if (!authScreens.includes(name) && !isLoggedIn()) name = 'login';
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('screen-' + name);
  if (el) el.classList.add('active');
  const nav = document.getElementById('main-nav');
  if (authScreens.includes(name)) {
    nav.classList.add('hidden');
  } else {
    nav.classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(n => { n.classList.remove('active'); n.classList.add('text-gray-500'); });
    const map = { home: 'nav-home', revenus: 'nav-revenus', mien: 'nav-mien' };
    if (map[name]) {
      document.getElementById(map[name]).classList.add('active');
      document.getElementById(map[name]).classList.remove('text-gray-500');
    }
  }
  if (name === 'withdraw') updateWithdrawMethods();
  if (name === 'deposit') updateDepNetworks();
  if (name === 'revenus') renderHistory();
  if (name === 'register') {
    document.getElementById('reg-step-1').classList.remove('hidden');
    document.getElementById('reg-step-2').classList.add('hidden');
    document.getElementById('reg-step-3').classList.add('hidden');
    document.getElementById('reg-step-label').textContent = '1';
  }
  window.scrollTo(0, 0);
}

function refreshCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  captchaCode = '';
  for (let i = 0; i < 5; i++) captchaCode += chars[Math.floor(Math.random() * chars.length)];
  document.getElementById('captchaDisplay').textContent = captchaCode;
  document.getElementById('reg-captcha').value = '';
}

function regGoCaptcha() {
  const phone = document.getElementById('reg-phone').value.trim();
  const msg = document.getElementById('reg1-msg');
  if (!phone || phone.replace(/\D/g, '').length < 8) {
    msg.textContent = 'Numéro de téléphone invalide.';
    msg.classList.remove('hidden');
    return;
  }
  msg.classList.add('hidden');
  const sel = document.getElementById('reg-country');
  regData.phone = phone;
  regData.country = sel.value;
  regData.iso = sel.options[sel.selectedIndex].dataset.iso || 'CI';
  document.getElementById('reg-step-1').classList.add('hidden');
  document.getElementById('reg-step-2').classList.remove('hidden');
  document.getElementById('reg-step-label').textContent = '2';
  refreshCaptcha();
}

function regValidateCaptcha() {
  const input = (document.getElementById('reg-captcha').value || '').trim().toUpperCase();
  const msg = document.getElementById('reg2-msg');
  if (!input || input !== captchaCode) {
    msg.textContent = 'Code captcha incorrect. Réessayez.';
    msg.classList.remove('hidden');
    refreshCaptcha();
    return;
  }
  msg.classList.add('hidden');
  document.getElementById('reg-step-2').classList.add('hidden');
  document.getElementById('reg-step-3').classList.remove('hidden');
  document.getElementById('reg-step-label').textContent = '3';
}

function previewAvatar(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    regData.avatar = reader.result;
    document.getElementById('avatarPreview').src = reader.result;
  };
  reader.readAsDataURL(file);
}

function finishRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const secret = document.getElementById('reg-secret').value.trim();
  const secret2 = document.getElementById('reg-secret2').value.trim();
  const msg = document.getElementById('reg3-msg');
  if (!name) { msg.textContent = 'Entrez votre nom.'; msg.classList.remove('hidden'); return; }
  if (!/^\d{6}$/.test(secret)) { msg.textContent = 'Le code secret doit contenir 6 chiffres.'; msg.classList.remove('hidden'); return; }
  if (secret !== secret2) { msg.textContent = 'Les codes secrets ne correspondent pas.'; msg.classList.remove('hidden'); return; }
  const fullPhone = regData.country + ' ' + regData.phone;
  user = {
    loggedIn: true, phone: fullPhone, name, secret,
    avatar: regData.avatar || ('https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(name)),
    balance: 0, todayIncome: 0, totalIncome: 0, drones: [], transactions: [], country: regData.iso
  };
  const registry = JSON.parse(localStorage.getItem('velys_users') || '{}');
  registry[fullPhone.replace(/\s/g, '')] = { secret, name, avatar: user.avatar, phone: fullPhone };
  localStorage.setItem('velys_users', JSON.stringify(registry));
  saveUser();
  showScreen('home');
}

function doLogin() {
  const code = document.getElementById('login-country').value;
  const phone = document.getElementById('login-phone').value.trim();
  const secret = document.getElementById('login-secret').value.trim();
  const msg = document.getElementById('login-msg');
  const fullKey = (code + phone).replace(/\s/g, '');
  const registry = JSON.parse(localStorage.getItem('velys_users') || '{}');
  const entry = registry[fullKey];
  if (!entry || entry.secret !== secret) {
    msg.textContent = 'Numéro ou code secret incorrect.';
    msg.classList.remove('hidden');
    msg.className = 'text-sm text-center text-red-400';
    return;
  }
  const existing = loadUser();
  if (existing && existing.phone && existing.phone.replace(/\s/g, '') === fullKey) {
    user = existing; user.loggedIn = true;
  } else {
    user = {
      loggedIn: true, phone: entry.phone, name: entry.name, secret: entry.secret, avatar: entry.avatar,
      balance: existing && existing.phone === entry.phone ? existing.balance : 0,
      todayIncome: existing?.todayIncome || 0, totalIncome: existing?.totalIncome || 0,
      drones: existing?.drones || [], transactions: existing?.transactions || [], country: 'CI'
    };
  }
  saveUser();
  showScreen('home');
}

function logout() {
  if (user) { user.loggedIn = false; localStorage.setItem('velys_user', JSON.stringify(user)); }
  user = null;
  showScreen('login');
}

function updateDepNetworks() {
  const c = document.getElementById('dep-country').value;
  const sel = document.getElementById('dep-network');
  const list = METHODS[c] || METHODS.CI;
  sel.innerHTML = list.map(m => `<option value="${m.code}">${m.label}</option>`).join('');
}
function updateWithdrawMethods() {
  const c = document.getElementById('wit-country').value;
  const sel = document.getElementById('wit-method');
  const list = METHODS[c] || METHODS.CI;
  sel.innerHTML = list.map(m => `<option value="${m.code}">${m.label}</option>`).join('');
}

function updateUI() {
  if (!user) return;
  const bal = Number(user.balance || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 });
  document.getElementById('balance').innerHTML = bal + ' <span class="text-base font-medium text-sky-400">XOF</span>';
  document.getElementById('todayIncome').textContent = Number(user.todayIncome || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 });
  document.getElementById('totalIncome').textContent = Number(user.totalIncome || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 });
  document.getElementById('rev-today').textContent = Number(user.todayIncome || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' XOF';
  document.getElementById('rev-total').textContent = Number(user.totalIncome || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' XOF';
  document.getElementById('mien-balance').textContent = bal + ' XOF';
  document.getElementById('mien-drones').textContent = (user.drones || []).length;
  document.getElementById('mien-name').textContent = user.name || 'Utilisateur';
  document.getElementById('mien-phone').textContent = user.phone || '—';
  if (user.avatar) {
    document.getElementById('mien-avatar').src = user.avatar;
    const ha = document.getElementById('header-avatar');
    ha.src = user.avatar; ha.classList.remove('hidden');
  }
  renderProducts();
}

function renderHistory() {
  const box = document.getElementById('tx-history');
  const list = (user && user.transactions) || [];
  if (!list.length) { box.innerHTML = '<p class="text-gray-500 text-center py-6">Aucune transaction.</p>'; return; }
  box.innerHTML = list.map(t => {
    const d = new Date(t.date);
    const dateStr = d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const sign = t.type === 'deposit' || t.type === 'income' ? '+' : '−';
    const color = t.type === 'deposit' || t.type === 'income' ? 'text-sky-400' : 'text-orange-400';
    const label = { deposit: 'Dépôt', withdraw: 'Retrait', invest: 'Investissement', income: 'Revenu' }[t.type] || t.type;
    return `<div class="flex justify-between items-center py-2.5 border-b border-white/5"><div><div class="font-medium">${label}${t.name ? ' · ' + t.name : ''}</div><div class="text-[11px] text-gray-500">${dateStr}</div></div><div class="font-semibold ${color}">${sign}${Number(t.amount).toLocaleString('fr-FR')} XOF</div></div>`;
  }).join('');
}

const products = [
  { id: 'vd1', name: 'VelysDrone Mini', badge: 'Débutant', daily: 2050, total: 4100, cycle: 2, price: 3000, image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=800&h=450&q=80', desc: 'Drone compact — parfait pour démarrer' },
  { id: 'vd2', name: 'VelysDrone Air', badge: 'Standard', daily: 1200, total: 21600, cycle: 18, price: 10000, image: 'https://images.unsplash.com/photo-1507582020474-9a35b7c9b0e8?auto=format&fit=crop&w=800&h=450&q=80', desc: 'Polyvalent, moyenne portée' },
  { id: 'vd3', name: 'VelysDrone Pro', badge: 'Avancé', daily: 3500, total: 105000, cycle: 30, price: 30000, image: 'https://images.unsplash.com/photo-1527977966376-1c840a904ebb?w=800&h=450&fit=crop&q=80', desc: 'Stabilité pro, missions prolongées' },
  { id: 'vd4', name: 'VelysDrone Max', badge: 'Pro', daily: 9000, total: 540000, cycle: 60, price: 80000, image: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=800&h=450&q=80', desc: 'Longue autonomie, grand rayon' },
  { id: 'vd5', name: 'VelysDrone Elite', badge: 'Elite', daily: 18000, total: 1620000, cycle: 90, price: 150000, image: 'https://images.unsplash.com/photo-1506947411487-a56738267384?auto=format&fit=crop&w=800&h=450&q=80', desc: 'Capteurs avancés, performance elite' },
  { id: 'vd6', name: 'VelysDrone Ultimate', badge: 'Ultimate', daily: 45000, total: 8100000, cycle: 180, price: 300000, image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&h=450&q=80', desc: 'Haut de gamme — rendement maximal' }
];

function renderProducts() {
  const list = document.getElementById('productsList');
  if (!list) return;
  const bal = Number(user?.balance || 0);
  list.innerHTML = products.map(p => {
    const can = bal >= p.price;
    return `<div class="product-card rounded-2xl overflow-hidden"><div class="relative h-40"><img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/800x450/070e1a/38bdf8?text=Drone'"/><div class="absolute inset-0 bg-gradient-to-t from-night-950/90 via-transparent to-transparent"></div><div class="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-sky-600/90 text-[10px] font-semibold">${p.badge}</div><div class="absolute bottom-3 left-4"><h3 class="font-semibold">${p.name}</h3><p class="text-[11px] text-gray-400">${p.desc}</p></div></div><div class="p-4 pt-3"><div class="grid grid-cols-2 gap-2 text-sm mb-4"><div class="bg-night-900/80 rounded-lg px-3 py-2 border border-white/5"><div class="text-[10px] text-gray-500">Revenu / jour</div><div class="font-semibold text-sky-400">${p.daily.toLocaleString('fr-FR')} XOF</div></div><div class="bg-night-900/80 rounded-lg px-3 py-2 border border-white/5"><div class="text-[10px] text-gray-500">Total</div><div class="font-semibold">${p.total.toLocaleString('fr-FR')} XOF</div></div><div class="bg-night-900/80 rounded-lg px-3 py-2 border border-white/5"><div class="text-[10px] text-gray-500">Cycle</div><div class="font-semibold">${p.cycle} j</div></div><div class="bg-night-900/80 rounded-lg px-3 py-2 border border-white/5"><div class="text-[10px] text-gray-500">Prix</div><div class="font-semibold">${p.price.toLocaleString('fr-FR')} XOF</div></div></div><button onclick="invest('${p.id}')" class="w-full btn-primary py-3 rounded-xl text-sm font-semibold ${can ? '' : 'opacity-55'}">${can ? 'Investir' : 'Solde insuffisant — Déposer'}</button></div></div>`;
  }).join('');
}

function invest(id) {
  const p = products.find(x => x.id === id);
  if (!p || !user) return;
  const bal = Number(user.balance || 0);
  if (bal < p.price) { alert('Solde insuffisant.'); showScreen('deposit'); return; }
  user.balance = bal - p.price;
  user.drones = user.drones || [];
  user.drones.push({ id: p.id, name: p.name, price: p.price, daily: p.daily, boughtAt: Date.now() });
  addTx('invest', p.price, { name: p.name });
  saveUser();
  alert('Drone acquis : ' + p.name);
  showScreen('home');
}

async function submitDeposit() {
  const phone = document.getElementById('dep-phone').value.trim();
  const email = document.getElementById('dep-email').value.trim();
  const amount = Number(document.getElementById('dep-amount').value);
  const country = document.getElementById('dep-country').value;
  const network = document.getElementById('dep-network').value;
  const msg = document.getElementById('dep-msg');
  msg.classList.remove('hidden');
  msg.className = 'text-sm text-center text-gray-400';
  msg.textContent = 'Traitement en cours...';
  if (!phone || !email) { msg.textContent = 'Remplissez tous les champs.'; msg.className = 'text-sm text-center text-red-400'; return; }
  if (!network) { msg.textContent = 'Choisissez un réseau Mobile Money.'; msg.className = 'text-sm text-center text-red-400'; return; }
  if (!amount || amount < 3000) { msg.textContent = 'Minimum 3 000 XOF.'; msg.className = 'text-sm text-center text-red-400'; return; }
  try {
    const res = await fetch('https://sfbomfhtepgffurzmoji.supabase.co/functions/v1/saspay-deposit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, email, amount, country, network })
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      const err = data.error || data.details || data;
      msg.textContent = typeof err === 'string' ? err : JSON.stringify(err);
      msg.className = 'text-sm text-center text-red-400';
      return;
    }
    if (data.checkout_url) {
      localStorage.setItem('velys_pending_deposit', JSON.stringify({ amount, phone, email }));
      window.location.href = data.checkout_url;
      return;
    }
    msg.textContent = data.message || 'Demande envoyée. Confirmez sur votre téléphone.';
    msg.className = 'text-sm text-center text-sky-400';
    addTx('deposit', amount, { status: 'pending', network });
  } catch (e) {
    msg.textContent = 'Erreur réseau.';
    msg.className = 'text-sm text-center text-red-400';
  }
}

async function submitWithdraw() {
  const secret = document.getElementById('wit-secret').value.trim();
  const phone = document.getElementById('wit-phone').value.trim();
  const email = document.getElementById('wit-email').value.trim();
  const amount = Number(document.getElementById('wit-amount').value);
  const country = document.getElementById('wit-country').value;
  const method = document.getElementById('wit-method').value;
  const msg = document.getElementById('wit-msg');
  msg.classList.remove('hidden');
  msg.className = 'text-sm text-center text-gray-400';
  msg.textContent = 'Traitement...';
  if (!user || secret !== user.secret) {
    msg.textContent = 'Code secret incorrect.';
    msg.className = 'text-sm text-center text-red-400';
    return;
  }
  if (!phone || !email || !method) { msg.textContent = 'Remplissez tous les champs.'; msg.className = 'text-sm text-center text-red-400'; return; }
  if (!amount || amount < 4000) { msg.textContent = 'Minimum 4 000 XOF.'; msg.className = 'text-sm text-center text-red-400'; return; }
  if (amount > Number(user.balance || 0)) { msg.textContent = 'Solde insuffisant.'; msg.className = 'text-sm text-center text-red-400'; return; }
  try {
    const res = await fetch('https://sfbomfhtepgffurzmoji.supabase.co/functions/v1/saspay-withdraw', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, email, amount, country, method })
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      msg.textContent = data.error || 'Erreur retrait';
      msg.className = 'text-sm text-center text-red-400';
      return;
    }
    user.balance = Number(user.balance || 0) - amount;
    addTx('withdraw', amount, { method, status: 'pending' });
    saveUser();
    msg.textContent = data.message || 'Retrait initié.';
    msg.className = 'text-sm text-center text-sky-400';
  } catch (e) {
    msg.textContent = 'Erreur réseau.';
    msg.className = 'text-sm text-center text-red-400';
  }
}

if (isLoggedIn()) { updateUI(); showScreen('home'); }
else { showScreen('login'); }
updateDepNetworks();
updateWithdrawMethods();
