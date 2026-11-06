# VelysDrone

Plateforme d'investissement dans une flotte de drones — Afrique de l'Ouest.

**Devise :** XOF  
**Dépôt min :** 3 000 XOF  
**Retrait min :** 4 000 XOF  

## Règles métier

- À l'inscription le solde est **0 XOF**
- L'utilisateur ne peut investir dans un drone que si son solde ≥ prix du drone
- Sinon le bouton l'envoie vers le dépôt

## Flotte (6 niveaux)

| Drone | Investissement | Revenu / jour | Cycle | Total |
|-------|----------------|---------------|-------|-------|
| VelysDrone Mini | 3 000 | 2 050 | 2 j | 4 100 |
| VelysDrone Air | 10 000 | 1 200 | 18 j | 21 600 |
| VelysDrone Pro | 30 000 | 3 500 | 30 j | 105 000 |
| VelysDrone Max | 80 000 | 9 000 | 60 j | 540 000 |
| VelysDrone Elite | 150 000 | 18 000 | 90 j | 1 620 000 |
| VelysDrone Ultimate | 300 000 | 45 000 | 180 j | 8 100 000 |

## Stack

- Frontend HTML + Tailwind
- Supabase projet `aethercompute` (`sfbomfhtepgffurzmoji`)
- Paiements : SasPay (softpay + payout) via Edge Functions

## Edge Functions

- `saspay-deposit` — encaissement
- `saspay-withdraw` — retrait

## Lancer

```bash
python3 -m http.server 8080
```

---
© 2026 VelysDrone
