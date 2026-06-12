# Vouch Architecture

## Stack

- Next.js App Router
- React Server Components
- TypeScript
- Prisma
- PostgreSQL / Neon
- Clerk
- Stripe Checkout
- Stripe Connect
- Manual-capture PaymentIntents
- Zod
- Tailwind CSS v4
- shadcn/Base UI
- Vitest
- Playwright
- pnpm

## Source Of Truth

Follow this order:

1. Current user instruction.
2. `context/docs/*.md` for product, architecture, and design intent.
3. `.agents/contracts/*.yaml` for deterministic rules.
4. `context/instructions/*.md` for implementation guidance.
5. Existing code.
6. Implementation judgment.

If these conflict, stop and report the exact conflict before editing code.

Execution files in `.agents/execution/*.json` track current project state, progress, decisions, and handoff context. They do not override docs, contracts, or explicit user instruction.

## Governance Layout

```txt
AGENTS.md
  repo manifest and governance entrypoint

context/docs/
  architecture.md
  prd.md
  design-system.md

context/instructions/
  implementation-specific Codex instructions

.agents/contracts/
  product.yaml
  design.yaml
  validation.yaml

.agents/execution/
  decisions.json
  handoff.json
  progress.json
```

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

Environment values are intentionally different. Never copy, normalize, or deduplicate secrets across development and production.

`pnpm dev` is the canonical local entrypoint and launches the development server, Clerk ngrok tunnel, and Stripe sandbox listener. Do not run it unless explicitly requested.

The ngrok endpoint exists only for Clerk development webhook delivery. Stripe development webhooks use `stripe listen --forward-to localhost:3000/api/stripe/webhooks`.

Do not edit Clerk environment variables, Stripe live configuration, Vercel production settings, or Neon branches without explicit user approval.

## Stripe Object Boundaries

```txt
platform Stripe account
  platform Customer for each Vouch user
  merchant protocol-fee Checkout and charge

connected business Stripe account
  user-owned merchant account
  merchant of record
  customer deposit Checkout
  manual-capture PaymentIntent
  charge, negative-balance liability, payout, and full Dashboard access
```

All direct-charge Stripe reads and writes for customer deposits must include connected-account scope.

Platform Customers exist only to support platform-account protocol-fee Checkout. Vouch does not provide a standalone reusable payment-method setup flow or track payment-method readiness.

Connected-account readiness remains mandatory for merchants creating Vouches because the connected business must be able to charge and receive payouts.

## Lifecycle Execution

Synchronous actions enforce readiness, authorization, validation, time windows, and legal workflow state transitions.

The second valid bilateral confirmation triggers immediate capture synchronously in the request path.

Stripe webhooks synchronize provider truth and are signature-verified and idempotent.

Daily reconciliation is recovery-only and may not grant eligibility or replace synchronous capture.

UI timers are advisory presentation. Server timestamps and database state are authoritative.

## Directory Boundaries

```txt
app/**
  route shells only
  metadata
  suspense composition
  no Prisma
  no Stripe SDK
  no business logic

features/**
  page orchestration
  form assembly
  fetcher/action handoff
  DTO branching

components/**
  reusable presentational UI only
  no protected fetching
  no provider logic
  no domain truth

components/ui/**
  shadcn/Base UI primitives only

lib/fetchers/**
  authenticate -> authorize -> minimal select -> DTO -> cache policy -> return

lib/actions/**
  authenticate -> authorize -> Zod validate -> transaction/provider op -> audit/log -> revalidate/redirect

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
  Zod runtime contracts

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
/legal/disclaimer
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

Do not add settings, setup, marketplace, messaging, disputes, reviews, search, browse, admin settlement, or manual override routes unless a later approved product redesign explicitly changes scope.

## Data And DTO Boundary

Prisma models must not leak directly to UI.

Fetchers perform authenticated, authorized, tenant-scoped reads and return DTOs.

Server Actions perform authenticated, authorized, validated writes and return action results or redirect/revalidate as appropriate.

Provider identifiers, idempotency keys, webhook event IDs, payment state, deposit state, confirmation state, audit state, and recovery state belong in the database.

## Design Boundary

Design-system rules live in `context/docs/design-system.md` and `.agents/contracts/design.yaml`.

Reusable UI should use token-backed classes and existing primitives/components before introducing new visual patterns.

`app/globals.css` should contain tokens, base styles, accessibility defaults, document-level backgrounds, and global motion utilities. It should not become a page-specific or component-specific stylesheet.

Inline styles are disallowed except for narrow dynamic runtime values that cannot reasonably be expressed as classes or CSS variables.
