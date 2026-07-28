# CLAUDE.md

## Projet

Plateforme e-commerce internationale en print-on-demand (POD), opérée depuis le Maroc, vendant vers l'Europe et l'Amérique du Nord.

## Stack technique (imposée — ne jamais dévier)

- **Framework** : Next.js 15 (App Router)
- **Langage** : TypeScript (strict)
- **Style** : Tailwind CSS 4
- **Backend / BDD / Auth / Storage** : Supabase (Postgres + Auth + Storage)
- **Déploiement** : Cloudflare Workers via `@opennextjs/cloudflare`
- **Emails transactionnels** : Resend
- **Paiement** : PayPal + YouCan Pay
- **Fulfillment / impression à la demande** : Printful

## Règles absolues

1. **Aucun service payant.** Tous les services externes utilisés doivent avoir un tier gratuit **permanent** (pas un essai limité dans le temps). Avant d'ajouter une dépendance externe (API, SaaS, infra), vérifier qu'elle reste gratuite indéfiniment aux volumes attendus.
2. **Stripe est INTERDIT.** Stripe n'est pas disponible au Maroc pour l'opérateur de cette plateforme — ne jamais l'introduire, même en exemple de code ou en fallback.
3. Ne jamais dévier de la stack ci-dessus sans validation explicite de l'utilisateur.

## Conventions de code

- **TypeScript strict** : `strict: true` dans `tsconfig.json`, pas de `any` implicite.
- **Server Components par défaut.** N'utiliser `"use client"` que lorsque c'est strictement nécessaire (interactivité, hooks, state, browser APIs).
- **Server Actions pour toutes les mutations** (écritures). Pas de routes API custom pour des opérations CRUD internes, sauf besoin spécifique : webhooks externes (Printful, PayPal, YouCan Pay) et exports de fichiers nécessitant un contrôle direct des en-têtes HTTP (`Content-Disposition` — export CSV admin), aucune Server Action ne pouvant produire une réponse HTTP brute téléchargeable.
- **Zod pour toute validation d'entrée** : données de formulaires, payloads de Server Actions, webhooks entrants.
- Pas de commentaires inutiles ; code auto-documenté par des noms explicites.

## Internationalisation

- Locales : `fr` (défaut), `en`, `es`, `ar`. Routing `next-intl` sous `/[locale]/...`, préfixe toujours présent (y compris pour `fr`).
- Détection de la locale (middleware) : cookie `NEXT_LOCALE` > en-tête `Accept-Language` > `fr` par défaut.
- `ar` est RTL : `<html dir="rtl">` (voir `getDirection()` dans `src/i18n/routing.ts`). Toujours utiliser les propriétés logiques Tailwind (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) — jamais `ml-`/`mr-`/`pl-`/`pr-`/`left-`/`right-`, qui casseraient le RTL.
- Traductions en JSON dans `/messages/{locale}.json`.

## Devises

- Devises supportées : `MAD`, `EUR`, `USD`, `GBP`. Devise de base des prix produit : `USD` (table `prices`, ligne `currency = 'USD'`).
- Taux de change dans `fx_rates` (Postgres), alimentée **uniquement** par le cron GitHub Actions `.github/workflows/fetch-fx-rates.yml` (1×/jour) via `SUPABASE_SERVICE_ROLE_KEY`. **Ne jamais appeler une API de taux de change depuis le front** — toujours lire `fx_rates`/`latest_fx_rates` côté serveur.
- Prix affiché = prix de base (`USD`) converti avec le dernier taux PUIS arrondi psychologiquement en `x,99` (`psychologicalRoundCents` dans `src/lib/currency/`) — sauf si une ligne `prices` existe déjà explicitement pour la devise cible (override manuel, utilisée telle quelle, jamais re-arrondie).
- La devise d'une commande (`orders.currency`) est figée à la création et ne doit jamais être recalculée après coup.
- Devise préférée persistée en cookie `NEXT_CURRENCY`, écrit uniquement via la Server Action `setPreferredCurrency` (jamais en JS client direct).

## Arborescence du projet

```
/
├── CLAUDE.md
├── wrangler.toml            # Config déploiement Cloudflare Workers
├── open-next.config.ts      # Config adaptateur @opennextjs/cloudflare
├── next.config.ts
├── supabase/
│   ├── config.toml           # Enregistrement du Custom Access Token Auth Hook (rôle admin)
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── [locale]/        # Pages, layouts (App Router, next-intl) — boutique
│   │   │   └── checkout/    # Tunnel : cart → address → shipping → payment → mock-pay → confirmation
│   │   ├── admin/            # Back-office — HORS next-intl, français uniquement, layout racine séparé
│   │   │   ├── (public)/      # /admin/login, /admin/setup — pas de vérification admin
│   │   │   ├── (protected)/    # Dashboard, commandes, produits, codes promo, clients — requireAdmin()
│   │   │   └── orders/export/route.ts   # Export CSV (voir plus bas)
│   │   └── api/
│   │       └── webhooks/[provider]/route.ts   # Paiement + Printful
│   ├── components/          # Composants UI partagés (boutique)
│   │   ├── checkout/        # CheckoutSteps, CheckoutAddressForm, DiscountCodeForm, OrderSummary, ...
│   │   └── admin/            # Système de design admin séparé (noir/blanc, contours uniquement)
│   ├── actions/              # Server Actions (mutations)
│   │   ├── checkout.ts       # saveCheckoutAddress, applyDiscountCode, startPayment, ...
│   │   └── admin/             # auth, orders (remboursement), products, discounts
│   ├── lib/
│   │   ├── supabase/         # Clients Supabase (anon + service_role)
│   │   ├── payments/          # Couche d'abstraction PaymentProvider (types, sélection, Mock)
│   │   ├── printful/          # Fulfillment (commandes, webhook expédition, catalogue, statut)
│   │   ├── paypal/            # Intégration paiement PayPal (Orders API v2)
│   │   ├── youcan-pay/        # Intégration paiement YouCan Pay (confiance faible, voir commentaires)
│   │   ├── resend/            # Emails transactionnels (client, envois, templates React Email)
│   │   ├── checkout/          # Tunnel : pricing serveur, cookies d'état, orchestration webhooks
│   │   ├── admin/             # Auth admin, métriques dashboard, requêtes commandes/produits/clients, CSV
│   │   └── validation/        # Schémas zod partagés
│   └── types/                # Types partagés
├── public/
└── ...fichiers de config (tsconfig.json, eslint.config.mjs, postcss.config.mjs, package.json)
```

## Paiement — couche d'abstraction

- `PaymentProvider` (`src/lib/payments/types.ts`) : interface unique (`createSession`, `verifyWebhook`, `refund`) implémentée par `PayPalProvider`, `YouCanPayProvider`, `MockProvider`. **Aucun code métier n'importe une implémentation concrète** — tout passe par `src/lib/payments/select-provider.ts` (`selectPaymentProvider(countryCode)` / `getPaymentProviderByName(name)`), qui choisit selon `PAYMENT_PROVIDER` (override) sinon le pays de livraison (`MA` → YouCan Pay, sinon PayPal).
- Le total d'une commande est recalculé intégralement côté serveur (`src/lib/checkout/compute-order-pricing.ts`) avant toute création de commande ou paiement — jamais de confiance dans un montant venu du client.
- `orders` est créée `pending` avant redirection vers le provider, via la fonction Postgres atomique `create_order_with_items` (service_role uniquement, `EXECUTE` révoqué pour `anon`/`authenticated`).
- Webhooks (`/api/webhooks/[provider]`, paiement + Printful) : idempotents via `claim_webhook_event` (RPC service_role, révoquée pour `anon`/`authenticated`), clé `(provider, external_id)`.

## Administration (`/admin`)

- Hors `next-intl` : route racine séparée (`src/app/admin/layout.tsx`, son propre `<html>`/`<body>`), français uniquement, chaînes en dur.
- Rôle admin porté par un claim JWT Supabase (`user_role: 'admin'`), injecté par le Custom Access Token Auth Hook `custom_access_token_hook` (`supabase/migrations/20260728130000_...sql` + `supabase/config.toml`) à partir de la table `admin_users` (source de vérité, aucune policy RLS anon/authenticated). **Après un déploiement, vérifier que le hook est bien actif dans Supabase Dashboard → Authentication → Hooks** — `config.toml` seul ne suffit que si le déploiement passe par la CLI Supabase liée.
- `src/middleware.ts` court-circuite tout `/admin/**` avant le routing `next-intl` et avant la session anonyme boutique ; `src/lib/admin/auth.ts::requireAdmin()` revérifie côté serveur dans chaque page/Server Action (défense en profondeur).
- Toutes les lectures/écritures admin passent par `createServiceRoleClient()` — aucune policy RLS existante n'anticipe un rôle staff.
- Système de design admin (`src/components/admin/ui/`) volontairement découplé de la boutique : noir et blanc strict, bordures 1px, **aucun aplat de couleur**, coins carrés. Ne jamais réutiliser les primitives `src/components/ui/*` de la boutique (colorées, arrondies) dans `/admin`.
- Premier compte admin créé via `/admin/setup` (page qui se désactive elle-même une fois un admin créé), protégé par `ADMIN_BOOTSTRAP_SECRET` et la RPC `bootstrap_admin_if_empty` (verrou advisory contre une double création concurrente).
- Export CSV des commandes : `src/app/admin/orders/export/route.ts`, un Route Handler (pas une Server Action — contrôle direct de `Content-Disposition` requis), couvert par le même filtre d'auth middleware que le reste de `/admin`.
