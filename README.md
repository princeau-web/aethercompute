# VelysDrone

Plateforme d'investissement drones — https://VelysDrone.vercel.app

**Devise :** XOF | **Dépôt min :** 3 000 | **Retrait min :** 4 000

## URLs importantes

| Service | URL |
|---------|-----|
| Site | https://VelysDrone.vercel.app |
| Supabase API | https://sfbomfhtepgffurzmoji.supabase.co |
| Dépôt (Edge) | https://sfbomfhtepgffurzmoji.supabase.co/functions/v1/saspay-deposit |
| Retrait (Edge) | https://sfbomfhtepgffurzmoji.supabase.co/functions/v1/saspay-withdraw |
| **Webhook SasPay** | https://sfbomfhtepgffurzmoji.supabase.co/functions/v1/saspay-webhook |

## Configuration manuelle obligatoire

### 1. SasPay → Webhook
1. Aller sur https://app.saspay.me → Développeur → Webhooks
2. Créer un webhook avec l'URL :
   ```
   https://sfbomfhtepgffurzmoji.supabase.co/functions/v1/saspay-webhook
   ```
3. S'abonner aux événements :
   - `transaction.success`
   - `transaction.failed`
   - `transaction.cancelled`
4. Copier le **signing_secret** immédiatement
5. (Optionnel) Dans Supabase → Edge Functions → Secrets :
   - `SASPAY_WEBHOOK_SECRET` = ce signing_secret

### 2. SasPay → Whitelist IP (retraits)
1. Développeur → IP autorisées
2. Ajouter les IP sortantes Supabase (région eu-west-3)
3. Doc Supabase : https://supabase.com/docs/guides/functions/network-restrictions
   Ou tester un retrait et regarder l'IP dans les logs d'erreur SasPay

### 3. Secrets Supabase (recommandé)
Project Settings → Edge Functions → Secrets :
- `SASPAY_API_KEY` = sk_live_...
- `SASPAY_WEBHOOK_SECRET` = (copié à l'étape 1)

### 4. Vercel
- Projet lié au repo GitHub `princeau-web/aethercompute`
- Domaine : VelysDrone.vercel.app
- Pas de variable d'env frontend nécessaire (clé côté serveur uniquement)

## Règles métier
- Solde initial = 0
- Investir uniquement si solde ≥ prix du drone
- Sinon → écran Dépôt

## Stack
Frontend HTML + Tailwind · Supabase · SasPay Edge Functions

---
© 2026 VelysDrone
