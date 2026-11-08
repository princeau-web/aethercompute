// Hooks affiliation — surcharge inscription + investissement
(function () {
  if (typeof finishRegister === 'function') {
    finishRegister = function () {
      const name = document.getElementById('reg-name').value.trim();
      const secret = document.getElementById('reg-secret').value.trim();
      const secret2 = document.getElementById('reg-secret2').value.trim();
      const msg = document.getElementById('reg3-msg');
      if (!name) { msg.textContent = 'Entrez votre nom.'; msg.classList.remove('hidden'); return; }
      if (!/^\d{6}$/.test(secret)) { msg.textContent = 'Le code secret doit contenir 6 chiffres.'; msg.classList.remove('hidden'); return; }
      if (secret !== secret2) { msg.textContent = 'Les codes secrets ne correspondent pas.'; msg.classList.remove('hidden'); return; }

      const fullPhone = regData.country + ' ' + regData.phone;
      const pendingRef = (localStorage.getItem('velys_pending_ref') || '').toUpperCase();
      user = {
        loggedIn: true,
        phone: fullPhone,
        name,
        secret,
        avatar: regData.avatar || ('https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(name)),
        balance: 0,
        todayIncome: 0,
        totalIncome: 0,
        drones: [],
        transactions: [],
        country: regData.iso,
        refCode: typeof genRefCode === 'function' ? genRefCode(fullPhone, name) : ('VD' + Date.now().toString().slice(-4)),
        referredBy: pendingRef || null,
        firstInvestDone: false,
        referrals: [],
        affEarnings: 0
      };
      const key = fullPhone.replace(/\s/g, '');
      const registry = JSON.parse(localStorage.getItem('velys_users') || '{}');
      registry[key] = { secret, name, avatar: user.avatar, phone: fullPhone, refCode: user.refCode };
      localStorage.setItem('velys_users', JSON.stringify(registry));

      if (pendingRef && typeof findUserByRefCode === 'function') {
        const found = findUserByRefCode(pendingRef);
        if (found && typeof ensureUserRefCode === 'function') {
          const sp = ensureUserRefCode(found.profile);
          sp.referrals = sp.referrals || [];
          if (!sp.referrals.some(r => (r.phone || '').replace(/\s/g, '') === key)) {
            sp.referrals.unshift({ phone: fullPhone, name, date: new Date().toISOString(), invested: false, commission: 0 });
          }
          saveProfileByKey(found.key, sp);
        }
        localStorage.removeItem('velys_pending_ref');
      }
      localStorage.setItem('velys_user_' + key, JSON.stringify(user));
      saveUser();
      showScreen('home');
    };
  }

  if (typeof invest === 'function') {
    invest = function (id) {
      const p = products.find(x => x.id === id);
      if (!p || !user) return;
      const bal = Number(user.balance || 0);
      if (bal < p.price) { alert('Solde insuffisant.'); showScreen('deposit'); return; }
      user.balance = bal - p.price;
      user.drones = user.drones || [];
      user.drones.push({ id: p.id, name: p.name, price: p.price, daily: p.daily, boughtAt: Date.now(), status: 'en_cours' });
      addTx('invest', p.price, { name: p.name, status: 'en_cours' });
      if (typeof creditReferrerOnFirstInvest === 'function') creditReferrerOnFirstInvest(user, p.price, p.name);
      const ikey = (user.phone || '').replace(/\s/g, '');
      if (ikey) localStorage.setItem('velys_user_' + ikey, JSON.stringify(user));
      saveUser();
      alert('Drone acquis : ' + p.name);
      showScreen('home');
    };
  }

  if (typeof showScreen === 'function') {
    const _show = showScreen;
    showScreen = function (name) {
      _show(name);
      if (name === 'affil' && typeof renderAffiliation === 'function') renderAffiliation();
      const na = document.getElementById('nav-affil');
      if (na) {
        if (name === 'affil') { na.classList.add('active'); na.classList.remove('text-gray-500'); }
      }
    };
  }

  if (typeof doLogin === 'function') {
    const _login = doLogin;
    doLogin = function () {
      _login();
      if (user && typeof ensureUserRefCode === 'function') {
        user = ensureUserRefCode(user);
        const ukey = (user.phone || '').replace(/\s/g, '');
        if (ukey) localStorage.setItem('velys_user_' + ukey, JSON.stringify(user));
        saveUser();
      }
    };
  }
})();
