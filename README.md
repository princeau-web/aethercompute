# AetherCompute

Plateforme de location de puissance de calcul IA (GPU) pour l'Afrique de l'Ouest.

**Pays supportés :** Côte d'Ivoire 🇨🇮 · Gabon 🇬🇦 · Togo 🇹🇬 · Sénégal 🇸🇳 · Bénin 🇧🇯  
**Devise :** XOF (Franc CFA)

## Liens

- **Repo :** https://github.com/princeau-web/aethercompute
- **Supabase Project :** `aethercompute` (`sfbomfhtepgffurzmoji`)
- **Region :** eu-west-3 (Paris)
- **API URL :** https://sfbomfhtepgffurzmoji.supabase.co

> ⚠️ Ne jamais utiliser le projet PageSecret pour AetherCompute.

## Stack

- Frontend : HTML + Tailwind CSS + JS
- Backend / DB : Supabase (PostgreSQL + Auth + RLS)
- Client : `@supabase/supabase-js` (CDN)

## Base de données

| Table | Description |
|-------|-------------|
| `profiles` | Utilisateurs + solde XOF |
| `gpu_catalog` | Catalogue GPU (seedé) |
| `instances` | Locations / instances |
| `transactions` | Historique portefeuille |

## Lancer en local

```bash
cd aethercompute
python3 -m http.server 8080
# ou
npx serve .
```

Ouvrir http://localhost:8080

## Structure

```
aethercompute/
├── index.html          # Login / Inscription
├── dashboard.html      # Dashboard + catalogue GPU (chargé depuis Supabase)
├── js/
│   ├── auth.js         # Auth mock (localStorage)
│   └── supabase.js     # Client Supabase + fetchGpus()
└── README.md
```

## Prochaines étapes

- [ ] Supabase Auth (OTP SMS / téléphone)
- [ ] Moyens de paiement (Mobile Money, Wave, cartes)
- [ ] Création réelle d'instances
- [ ] Dashboard admin

---

© 2026 AetherCompute
