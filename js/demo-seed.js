// Compte démo + historique investissement VelysDrone
(function () {
  const DEMO_PHONE = '+225 07 00 00 00 01';
  const DEMO_KEY = '+2250700000001';
  const DEMO_SECRET = '123456';
  const now = Date.now();
  const day = 86400000;

  const demoUser = {
    loggedIn: false,
    phone: DEMO_PHONE,
    name: 'Demo Investisseur',
    secret: DEMO_SECRET,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DemoInvestisseur',
    balance: 0,
    todayIncome: 0,
    totalIncome: 4100,
    country: 'CI',
    drones: [
      { id: 'vd1', name: 'VelysDrone Mini', price: 3000, daily: 2050, boughtAt: now - 5 * day, status: 'completed', cycle: 2 },
      { id: 'vd2', name: 'VelysDrone Air', price: 10000, daily: 1200, boughtAt: now - 2 * 3600000, status: 'en_cours', cycle: 18 }
    ],
    transactions: [
      { id: now - 6 * day, type: 'deposit', amount: 3000, date: new Date(now - 6 * day).toISOString(), status: 'success', network: 'mtn_ci' },
      { id: now - 5 * day, type: 'invest', amount: 3000, date: new Date(now - 5 * day).toISOString(), name: 'VelysDrone Mini', status: 'completed' },
      { id: now - 4 * day, type: 'income', amount: 2050, date: new Date(now - 4 * day).toISOString(), name: 'VelysDrone Mini \u2014 jour 1', status: 'success' },
      { id: now - 3 * day, type: 'income', amount: 2050, date: new Date(now - 3 * day).toISOString(), name: 'VelysDrone Mini \u2014 jour 2', status: 'success' },
      { id: now - 2.5 * day, type: 'withdraw', amount: 4100, date: new Date(now - 2.5 * day).toISOString(), status: 'success', method: 'mtn_ci' },
      { id: now - 1 * day, type: 'deposit', amount: 10000, date: new Date(now - 1 * day).toISOString(), status: 'success', network: 'orange_ci' },
      { id: now - 2 * 3600000, type: 'invest', amount: 10000, date: new Date(now - 2 * 3600000).toISOString(), name: 'VelysDrone Air', status: 'en_cours' }
    ]
  };

  const registry = JSON.parse(localStorage.getItem('velys_users') || '{}');
  registry[DEMO_KEY] = { secret: DEMO_SECRET, name: demoUser.name, avatar: demoUser.avatar, phone: DEMO_PHONE };
  localStorage.setItem('velys_users', JSON.stringify(registry));
  localStorage.setItem('velys_user_' + DEMO_KEY, JSON.stringify(demoUser));
})();
