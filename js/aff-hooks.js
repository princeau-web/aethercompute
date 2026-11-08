// Hooks affiliation + sync Supabase VelysDrone
(function () {
  function mapDbUser(row) {
    if (!row) return null;
    return {
      loggedIn: true,
      id: row.id,
      phone: row.phone,
      name: row.name,
      secret: row.secret_code,
      avatar: row.avatar,
      country: row.country || 'CI',
      balance: Number(row.balance || 0),
      todayIncome: Number(row.today_income || 0),
      totalIncome: Number(row.total_income || 0),
      refCode: row.ref_code,
      referredBy: row.referred_by,
      firstInvestDone: !!row.first_invest_done,
      affEarnings: Number(row.aff_earnings || 0),
      drones: row.drones || [],
      transactions: [],
      referrals: []
    };
  }

  if (typeof finishRegister === 'function') {
    finishRegister = async function () {
      const name = document.getElementById('reg-name').value.trim();
      const secret = document.getElementById('reg-secret').value.trim();
      const secret2 = document.getElementById('reg-secret2').value.trim();
      const msg = document.getElementById('reg3-msg');
      if (!name) { msg.textContent = 'Entrez votre nom.'; msg.classList.remove('hidden'); return; }
      if (!/^\d{6}$/.test(secret)) { msg.textContent = 'Le code secret doit contenir 6 chiffres.'; msg.classList.remove('hidden'); return; }
      if (secret !== secret2) { msg.textContent = 'Les codes secrets ne correspondent pas.'; msg.classList.remove('hidden'); return; }

      const fullPhone = regData.country + ' ' + regData.phone;
      const pendingRef = (localStorage.getItem('velys_pending_ref') || '').toUpperCase();
      const refCode = typeof genRefCode === 'function' ? genRefCode(fullPhone, name) : ('VD' + Date.now().toString().slice(-4));
      const avatar = regData.avatar || ('https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(name));

      try {
        if (window.VelysDB) {
          const row = await VelysDB.dbRegisterUser({
            phone: fullPhone, name, secret, avatar,
            country: regData.iso || 'CI', refCode, referredBy: pendingRef || null
          });
          user = mapDbUser(row);
          if (pendingRef) {
            const sponsor = await VelysDB.dbGetUserByRef(pendingRef);
            if (sponsor && sponsor.id !== row.id) await VelysDB.dbAddReferral(sponsor.id, row.id);
            localStorage.removeItem('velys_pending_ref');
          }
        } else throw new Error('DB offline');
      } catch (e) {
        user = {
          loggedIn: true, phone: fullPhone, name, secret, avatar,
          balance: 0, todayIncome: 0, totalIncome: 0, drones: [], transactions: [],
          country: regData.iso, refCode, referredBy: pendingRef || null,
          firstInvestDone: false, referrals: [], affEarnings: 0
        };
      }

      const key = fullPhone.replace(/\s/g, '');
      const registry = JSON.parse(localStorage.getItem('velys_users') || '{}');
      registry[key] = { secret, name, avatar: user.avatar, phone: fullPhone, refCode: user.refCode };
      localStorage.setItem('velys_users', JSON.stringify(registry));
      localStorage.setItem('velys_user_' + key, JSON.stringify(user));
      saveUser();
      showScreen('home');
    };
  }

  if (typeof doLogin === 'function') {
    const _login = doLogin;
    doLogin = async function () {
      const code = document.getElementById('login-country').value;
      const phone = document.getElementById('login-phone').value.trim();
      const secret = document.getElementById('login-secret').value.trim();
      const fullPhone = code + ' ' + phone;
      try {
        if (window.VelysDB) {
          const row = await VelysDB.dbLoginUser(fullPhone, secret);
          if (row) {
            user = mapDbUser(row);
            try {
              const txs = await VelysDB.dbListTransactions(row.id);
              user.transactions = (txs || []).map(t => ({
                id: t.id, type: t.type, amount: Number(t.amount),
                date: t.created_at, status: t.status, ...(t.meta || {})
              }));
            } catch (_) {}
            const key = fullPhone.replace(/\s/g, '');
            localStorage.setItem('velys_user_' + key, JSON.stringify(user));
            const registry = JSON.parse(localStorage.getItem('velys_users') || '{}');
            registry[key] = { secret, name: user.name, avatar: user.avatar, phone: user.phone, refCode: user.refCode };
            localStorage.setItem('velys_users', JSON.stringify(registry));
            saveUser();
            showScreen('home');
            return;
          }
        }
      } catch (e) { console.warn(e); }
      _login();
    };
  }

  if (typeof invest === 'function') {
    invest = async function (id) {
      const p = products.find(x => x.id === id);
      if (!p || !user) return;
      const bal = Number(user.balance || 0);
      if (bal < p.price) { alert('Solde insuffisant.'); showScreen('deposit'); return; }
      user.balance = bal - p.price;
      user.drones = user.drones || [];
      user.drones.push({ id: p.id, name: p.name, price: p.price, daily: p.daily, boughtAt: Date.now(), status: 'en_cours' });
      addTx('invest', p.price, { name: p.name, status: 'en_cours' });
      if (typeof creditReferrerOnFirstInvest === 'function') creditReferrerOnFirstInvest(user, p.price, p.name);
      try {
        if (window.VelysDB && user.id) {
          await VelysDB.dbUpdateUser(user.id, { balance: user.balance, drones: user.drones, first_invest_done: true });
          await VelysDB.dbAddTransaction(user.id, 'invest', p.price, 'en_cours', { name: p.name });
          await VelysDB.dbCreateInvestment({
            user_id: user.id, product_id: p.id, product_name: p.name,
            price: p.price, daily_income: p.daily, cycle_days: p.cycle, status: 'en_cours'
          });
          if (user.referredBy && !user.firstInvestDone) {
            const sponsor = await VelysDB.dbGetUserByRef(user.referredBy);
            if (sponsor) {
              const commission = Math.floor(p.price * 0.1);
              await VelysDB.dbUpdateUser(sponsor.id, {
                balance: Number(sponsor.balance || 0) + commission,
                aff_earnings: Number(sponsor.aff_earnings || 0) + commission
              });
              await VelysDB.dbMarkReferralInvested(sponsor.id, user.id, commission, p.name);
              await VelysDB.dbAddTransaction(sponsor.id, 'income', commission, 'success', { name: 'Commission \u00b7 ' + user.name });
            }
          }
          user.firstInvestDone = true;
        }
      } catch (e) { console.warn('sync invest', e); }
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
    };
  }
})();
