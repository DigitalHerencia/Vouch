## Vouch stack

**Runtime/App:** Next.js App Router, React 19, TypeScript
**DB:** Neon Postgres + Prisma
**Auth:** Clerk
**Payments:** Stripe Checkout, manual-capture PaymentIntents, Stripe Connect
**Validation:** Zod
**Forms:** React Hook Form
**UI:** Tailwind CSS v4, shadcn/Base UI, dark brutalist design system
**Testing:** Vitest, Playwright
**Deploy:** Vercel
**Contracts:** `.agents/*`, governance YAML, execution JSON, source-of-truth docs

Core rule: **Clerk owns auth truth. Stripe owns payment truth. Vouch owns workflow truth. Outcome follows system state.**

## Architecture blueprint

```txt
app/**
  route shells only
  no Prisma
  no Stripe SDK
  no business logic
  Suspense composition

features/**
  page orchestration
  fetcher/action handoff
  DTO branching

components/**
  pure UI only
  no protected fetching
  no provider logic
  no domain truth

components/ui/**
  primitives only

lib/fetchers/**
  protected reads:
  authenticate -> authorize -> minimal select -> DTO -> cache policy -> return

lib/actions/**
  writes:
  authenticate -> authorize -> Zod validate -> transaction/provider op -> audit -> revalidate/redirect

lib/db/selects/**
  Prisma-selected data -> transport-safe DTOs

lib/db/transactions/**
  atomic mutation mechanics only

lib/integrations/stripe/**
  all Stripe SDK calls

lib/auth/**
  Clerk/session/local user context

lib/authz/**
  role/capability/workflow authorization

lib/webhooks/**
  provider webhook processors

schemas/**
  Zod input contracts

types/**
  typescript types and interfaces
```

## Canonical routes

```txt
/
 /pricing
 /faq
 /legal/terms
 /legal/privacy
 /checkout/success

/sign-in
/sign-up

/dashboard
/vouches/new
/vouches/new/confirm
/vouches/[vouchId]

/api/clerk/webhooks
/api/stripe/webhooks
```

No settings, setup, marketplace, messaging, disputes, reviews, search, browse, admin settlement, or manual override surfaces.

## State model

```txt
VouchStatus
- draft
- pending_authorization
- requires_capture
- succeeded
- canceled
- expired
```

Replace readiness with plain provider facts:

stripeCustomerId exists / missing
stripeConnectedAccountId exists / missing
stripeAccountChargesEnabled true/false
stripeAccountPayoutsEnabled true/false
stripeAccountDetailsSubmitted true/false
EuaAcceptedAt exists / missing

Separate axes:

```txt
paymentStatus
settlementStatus
archiveStatus
recoveryStatus
webhookStatus
```

Do **not** put `refunded`, `canceled`, `failed`, `voided`, `settled`, `provider_blocked`, or `archived` inside `VouchStatus`.

## Payment architecture

Two separate Stripe flows:

```txt
1. Merchant protocol fee
   Merchant -> platform Checkout/PaymentIntent
   succeeds before Vouch becomes committed

2. Customer protected authorization
   Customer -> Stripe Checkout -> manual-capture PaymentIntent
   captured only after bilateral confirmation
```

Do not collapse these into one charge, one application fee, one PaymentIntent, or one Checkout Session.

Validation:

```txt
pnpm validate:contracts
pnpm prisma:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm validate
```
