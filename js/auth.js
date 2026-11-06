document.addEventListener('DOMContentLoaded', () => {
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  const countries = {
    '+225': 'CI',
    '+241': 'GA',
    '+228': 'TG',
    '+221': 'SN',
    '+229': 'BJ'
  };

  tabLogin?.addEventListener('click', () => {
    tabLogin.className = 'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all bg-brand-600 text-white';
    tabRegister.className = 'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all text-gray-400 hover:text-white';
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
  });

  tabRegister?.addEventListener('click', () => {
    tabRegister.className = 'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all bg-brand-600 text-white';
    tabLogin.className = 'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all text-gray-400 hover:text-white';
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  });

  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const code = document.getElementById('countryCode').value;

    if (!phone || !password) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    localStorage.setItem('aether_user', JSON.stringify({
      phone: code + ' ' + phone,
      name: 'Utilisateur Demo',
      country: countries[code] || 'CI',
      balance: 25000,
      loggedIn: true
    }));
    window.location.href = 'dashboard.html';
  });

  registerForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('fullName')?.value || 'Nouvel Utilisateur';
    const code = document.getElementById('regCountryCode')?.value || '+225';
    const phone = document.getElementById('regPhone')?.value || '';

    localStorage.setItem('aether_user', JSON.stringify({
      phone: code + ' ' + phone,
      name: name,
      country: countries[code] || 'CI',
      balance: 5000,
      loggedIn: true
    }));
    window.location.href = 'dashboard.html';
  });
});
