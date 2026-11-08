// VelysDrone — système d'affiliation
const AFF_RATE = 0.10;

(function captureRefFromUrl() {
  try {
    const u = new URL(window.location.href);
    const ref = (u.searchParams.get('ref') || '').trim().toUpperCase();
    if (ref && ref.length >= 4) localStorage.setItem('velys_pending_ref', ref);
  } catch (e) {}
})();

function genRefCode(phone, name) {
  const base = (name || 'VD').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 3) || 'VD';
  const digits = (phone || '').replace(/\D/g, '').slice(-4) || String(Date.now()).slice(-4);
  return (base + digits).slice(0, 8);
}

function getAllProfiles() {
  const out = {};
  try {
    const reg = JSON.parse(localStorage.getItem('velys_users') || '{}');
    for (const key of Object.keys(reg)) {
      try {
        const p = JSON.parse(localStorage.getItem('velys_user_' + key) || 'null');
        if (p) out[key] = p;
      } catch (e) {}
    }
  } catch (e) {}
  return out;
}

function findUserByRefCode(code) {
  if (!code) return null;
  const c = String(code).toUpperCase();
  const profiles = getAllProfiles();
  for (const [key, p] of Object.entries(profiles)) {
    if ((p.refCode || '').toUpperCase() === c) return { key, profile: p };
  }
  try {
    const reg = JSON.parse(localStorage.getItem('velys_users') || '{}');
    for (const [key, e] of Object.entries(reg)) {
      if ((e.refCode || '').toUpperCase() === c) {
        const p = profiles[key] || { phone: e.phone, name: e.name, balance: 0, transactions: [], drones: [], refCode: e.refCode, referrals: [], affEarnings: 0 };
        return { key, profile: p };
      }
    }
  } catch (e) {}
  return null;
}

function saveProfileByKey(key, profile) {
  localStorage.setItem('velys_user_' + key, JSON.stringify(profile));
  try {
    const reg = JSON.parse(localStorage.getItem('velys_users') || '{}');
    if (reg[key]) {
      reg[key].refCode = profile.refCode;
      localStorage.setItem('velys_users', JSON.stringify(reg));
    }
  } catch (e) {}
}

function ensureUserRefCode(u) {
  if (!u) return u;
  if (!u.refCode) u.refCode = genRefCode(u.phone, u.name);
  u.referrals = u.referrals || [];
  u.affEarnings = Number(u.affEarnings || 0);
  return u;
}

function creditReferrerOnFirstInvest(buyer, investAmount, productName) {
  if (!buyer || !buyer.referredBy || buyer.firstInvestDone) return;
  const found = findUserByRefCode(buyer.referredBy);
  if (!found) return;
  if (found.profile.phone && buyer.phone &&
      found.profile.phone.replace(/\s/g, '') === buyer.phone.replace(/\s/g, '')) return;

  const commission = Math.floor(Number(investAmount) * AFF_RATE);
  if (commission <= 0) return;

  const sponsor = ensureUserRefCode(found.profile);
  sponsor.balance = Number(sponsor.balance || 0) + commission;
  sponsor.affEarnings = Number(sponsor.affEarnings || 0) + commission;
  sponsor.transactions = sponsor.transactions || [];
  sponsor.transactions.unshift({
    id: Date.now(),
    type: 'income',
    amount: commission,
    date: new Date().toISOString(),
    name: 'Commission affiliation \u00b7 ' + (buyer.name || buyer.phone),
    status: 'success'
  });
  sponsor.referrals = sponsor.referrals || [];
  const bkey = (buyer.phone || '').replace(/\s/g, '');
  const idx = sponsor.referrals.findIndex(r => (r.phone || '').replace(/\s/g, '') === bkey);
  if (idx >= 0) {
    sponsor.referrals[idx].invested = true;
    sponsor.referrals[idx].commission = commission;
    sponsor.referrals[idx].product = productName;
  } else {
    sponsor.referrals.unshift({
      phone: buyer.phone, name: buyer.name, date: new Date().toISOString(),
      invested: true, commission, product: productName
    });
  }
  saveProfileByKey(found.key, sponsor);

  if (typeof user !== 'undefined' && user && user.phone &&
      user.phone.replace(/\s/g, '') === found.key) {
    user = { ...sponsor, loggedIn: true };
    if (typeof saveUser === 'function') saveUser();
  }
  buyer.firstInvestDone = true;
}

function renderAffiliation() {
  if (typeof user === 'undefined' || !user) return;
  user = ensureUserRefCode(user);
  const link = location.origin + location.pathname + '?ref=' + encodeURIComponent(user.refCode);
  const elLink = document.getElementById('aff-link');
  if (elLink) elLink.textContent = link;
  const earn = document.getElementById('aff-earnings');
  if (earn) earn.textContent = Number(user.affEarnings || 0).toLocaleString('fr-FR') + ' XOF';
  const refs = user.referrals || [];
  const sEl = document.getElementById('aff-signups');
  const iEl = document.getElementById('aff-investors');
  if (sEl) sEl.textContent = refs.length;
  if (iEl) iEl.textContent = refs.filter(r => r.invested).length;
  const list = document.getElementById('aff-list');
  if (!list) return;
  if (!refs.length) {
    list.innerHTML = '<p class="text-center py-4 text-gray-500">Aucun filleul pour le moment. Partage ton lien !</p>';
    return;
  }
  list.innerHTML = refs.map(r => {
    const st = r.invested
      ? '<span class="text-emerald-400">Investi \u00b7 +' + Number(r.commission || 0).toLocaleString('fr-FR') + ' XOF</span>'
      : '<span class="text-orange-400">Inscrit \u00b7 en attente</span>';
    return '<div class="flex justify-between items-center py-2.5 border-b border-white/5"><div><div class="font-medium text-white">' +
      (r.name || r.phone || 'Filleul') + '</div><div class="text-[11px] text-gray-500">' +
      (r.date ? new Date(r.date).toLocaleDateString('fr-FR') : '') +
      '</div></div><div class="text-xs text-right">' + st + '</div></div>';
  }).join('');
}

function copyAffLink() {
  if (!user) return;
  user = ensureUserRefCode(user);
  const link = location.origin + location.pathname + '?ref=' + encodeURIComponent(user.refCode);
  navigator.clipboard.writeText(link).then(() => {
    const m = document.getElementById('aff-msg');
    if (m) { m.textContent = 'Lien copi\u00e9 !'; m.classList.remove('hidden'); }
  }).catch(() => alert(link));
}

function shareAffWhatsApp() {
  if (!user) return;
  user = ensureUserRefCode(user);
  const link = location.origin + location.pathname + '?ref=' + encodeURIComponent(user.refCode);
  const text = '\ud83d\ude81 Rejoins VelysDrone avec mon lien%0AD\u00e8s 3 000 XOF \u00b7 revenus chaque jour%0A' + encodeURIComponent(link);
  window.open('https://wa.me/?text=' + text, '_blank');
}
