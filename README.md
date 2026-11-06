# AetherCompute

Plateforme de location de puissance de calcul IA (GPU) destinée à l'Afrique de l'Ouest.

**Pays supportés :** Côte d'Ivoire 🇨🇮 · Gabon 🇬🇦 · Togo 🇹🇬 · Sénégal 🇸🇳 · Bénin 🇧🇯

**Devise :** XOF (Franc CFA)

## Fonctionnalités

- Authentification par numéro de téléphone (codes pays ciblés)
- Catalogue GPU (RTX 4090, 3090, A100, H100, L40S...)
- Portefeuille & solde en XOF
- Dashboard instances
- Design sombre premium, orienté Afrique de l'Ouest

## Stack

- Frontend : HTML + Tailwind CSS + JS vanilla (prêt pour migration Next.js / React)
- Backend / DB : Supabase (PostgreSQL + Auth + RLS)
- Repo : GitHub

## Base de données (Supabase)

Tables créées :
- `profiles` — utilisateurs + solde
- `gpu_catalog` — catalogue des GPU
- `instances` — locations actives
- `transactions` — historique portefeuille

## Lancer localement

```bash
# Serveur simple
python3 -m http.server 8080
# ou
npx serve .
```

Ouvrir http://localhost:8080

## Prochaines étapes

- [ ] Intégration complète Supabase Auth (OTP SMS)
- [ ] Moyens de paiement (Mobile Money, cartes, crypto)
- [ ] Provisioning réel des instances
- [ ] Dashboard admin

---

© 2026 AetherCompute
