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

Follow this order:

1. The user is the source of truth.
1. `.agents/docs/*.md` for product and architecture intent.
1. `.agents/contracts/*.yaml` for deterministic rules.
1. `.agents/instructions/*.instructions.md` for implementation guidance.
1. Existing code.
1. Implementation judgment.

If these conflict, stop and report the exact conflict before editing code.

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
```

Do not add settings, setup, marketplace, messaging, disputes, reviews, search, browse, admin settlement, or manual override routes unless a later redesign document explicitly changes scope.
