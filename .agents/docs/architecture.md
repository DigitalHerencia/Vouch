# Vouch Architecture

## Stack

- Next.js App Router
- React Server Components
- TypeScript
- Prisma
- PostgreSQL / Neon
- Clerk
- Stripe Checkout, manual-capture PaymentIntents, Stripe Connect
- Zod
- Tailwind CSS v4
- shadcn/Base UI
- Vitest
- Playwright
- pnpm

## Source Of Truth

Verified Clerk webhooks are the only path that creates or synchronizes local users. Authenticated reads and Server Actions wait for webhook synchronization.

Follow this order:

1. The user is the source of truth.
1. `.agents/docs/*.md` for product and architecture intent.
1. `.agents/contracts/*.yaml` for deterministic rules.
1. `.agents/instructions/*.instructions.md` for implementation guidance.
1. Existing code.
1. Implementation judgment.

If these conflict, stop and report the exact conflict before editing code.

## Provider And Environment Boundaries

```txt
development
  app URL: http://localhost:3000
  Clerk: development instance and existing development webhook secret
  Clerk webhook ingress: ngrok http --url=liberal-gull-quietly.ngrok-free.app 3000
  Stripe: Vouch sandbox
  Stripe webhook ingress: stripe listen -> localhost:3000/api/stripe/webhooks
  Neon: current configured database

production
  app URL: https://usevouch.vercel.app
  Clerk: production instance and production webhook secret
  Stripe: Vouch live
  Neon: current configured production database
  Vercel: production branch only

preview
  disabled
```

- Environment values are intentionally different. Never copy, normalize, or deduplicate secrets across development and production.
- `pnpm dev` is the canonical local entrypoint and launches the development server, Clerk ngrok tunnel, and Stripe sandbox listener.
- The ngrok endpoint exists only for Clerk development webhook delivery. Stripe development webhooks use `stripe listen --forward-to localhost:3000/api/stripe/webhooks`.
- The separate Vouch Stripe testing context is not assigned to a runtime environment. Do not use or mutate it until the user explicitly defines its purpose.
- Do not edit Clerk environment variables or webhook configuration without explicit user approval.
- Do not mutate Stripe live configuration or data until the user explicitly authorizes a live-readiness pass.
- Validate the complete lifecycle in Stripe sandbox before configuring final live webhooks or processing a live payment.
- Do not create a separate Neon development branch unless explicitly requested.

## Stripe Object Boundaries

```txt
platform Stripe account
  platform Customer for each Vouch user
  required reusable payment method
  merchant protocol-fee Checkout and charge

connected business Stripe account
  user-owned merchant account
  merchant of record
  customer deposit Checkout and manual-capture PaymentIntent
  charge, negative-balance liability, payout, and full Dashboard access
```

All direct-charge Stripe reads and writes must include connected-account scope. Platform Customer readiness and Connect account readiness must never be treated as interchangeable.

## Lifecycle Execution

- Synchronous actions enforce readiness, authorization, validation, time windows, and legal state transitions.
- The second valid bilateral confirmation triggers immediate capture synchronously.
- Stripe webhooks synchronize provider truth and are signature-verified and idempotent.
- Daily reconciliation is recovery-only and may not grant eligibility or replace synchronous capture.
- UI timers are advisory presentation. Server timestamps and database state are authoritative.

## Directory Boundaries

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
  pure reusable UI only
  no protected fetching
  no provider logic
  no domain truth

components/ui/**
  shadcn primitives only

lib/fetchers/**
  authenticate -> authorize -> minimal select -> DTO -> cache policy -> return

lib/actions/**
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
  TypeScript DTOs and shared boundaries
```

## Canonical Routes

```txt
/
/pricing
/faq
/legal/terms
/legal/privacy
/legal/discalimer
/legal/user-agreement
/checkout/success
/sign-in
/sign-up
/dashboard
/vouches/new
/vouches/[vouchId]
/api/clerk/webhooks
/api/stripe/webhooks
/api/cron/vouches/reconcile
```

Do not add settings, setup, marketplace, messaging, disputes, reviews, search, browse, admin settlement, or manual override routes unless a later redesign document explicitly changes scope.
