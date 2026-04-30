# AGENTS.md

## Project: Vouch

Source of truth date: 2026-04-30

This file supersedes older `.agents` governance, old Prisma comments, old copy, old tests, and old lifecycle assumptions where they conflict.

Vouch is a commitment-backed payment coordination system for pre-arranged appointments and in-person agreements.

Vouch is not:

- a marketplace
- a booking marketplace
- a discovery platform
- a public provider profile system
- a messaging app
- a ratings/reviews system
- a dispute-resolution system
- an escrow provider
- a broker
- a scheduler

Stripe account source:

- Account ID: `acct_1TQHH2GuFcEUvSe9`
- Display name: `Vouch`

## Source of Truth Order

1. This `AGENTS.md` and the current user task when explicitly marked as the new source of truth.
2. `.agents/docs/*.md`
3. `.agents/contracts/*.yaml`
4. `.agents/instructions/*.md`
5. Existing repo code.
6. Agent judgment.

Existing governance may be stale. When the current source of truth conflicts with existing governance, migrate governance instead of treating it as a blocker.

## Participant Model

The merchant/provider creates the Vouch.

The customer/client accepts the Vouch and pays.

The merchant/provider is the payout recipient.

The customer/client is the paying party.

Public/product UI should use merchant/provider/customer/client language.

Legacy internal names may remain temporarily when a destructive rename is unsafe:

- provider / merchant / creator = old `payer`
- customer / client / paying acceptor = old `payee`

Prefer clearer names in new work where safe:

- `providerId` / `merchantId`
- `customerId`
- `protectedAmountCents`
- `merchantReceivesCents`
- `vouchServiceFeeCents`
- `processingFeeOffsetCents`
- `applicationFeeAmountCents`
- `customerTotalCents`

## Money Model

The customer pays:

```txt
customerTotalCents =
  protectedAmountCents
  + processingFeeOffsetCents
  + vouchServiceFeeCents
```

The merchant receives:

```txt
merchantReceivesCents = protectedAmountCents
```

The Vouch service fee is:

```txt
vouchServiceFeeCents = max(ceil(protectedAmountCents * 0.05), 500)
```

The processing fee offset covers estimated Stripe/payment processing cost on the final customer total.

Initial formula:

```ts
export function calculateVouchPricing(input: {
  protectedAmountCents: number
  stripePercentBps?: number
  stripeFixedCents?: number
}) {
  const stripePercentBps = input.stripePercentBps ?? 290
  const stripeFixedCents = input.stripeFixedCents ?? 30

  const vouchServiceFeeCents = Math.max(
    Math.ceil(input.protectedAmountCents * 0.05),
    500,
  )

  const subtotalBeforeProcessing =
    input.protectedAmountCents + vouchServiceFeeCents

  const processingFeeOffsetCents = Math.ceil(
    (subtotalBeforeProcessing + stripeFixedCents) /
      (1 - stripePercentBps / 10_000) -
      subtotalBeforeProcessing,
  )

  const customerTotalCents =
    input.protectedAmountCents +
    vouchServiceFeeCents +
    processingFeeOffsetCents

  const applicationFeeAmountCents =
    vouchServiceFeeCents + processingFeeOffsetCents

  return {
    protectedAmountCents: input.protectedAmountCents,
    merchantReceivesCents: input.protectedAmountCents,
    vouchServiceFeeCents,
    processingFeeOffsetCents,
    customerTotalCents,
    applicationFeeAmountCents,
  }
}
```

## Stripe PaymentIntent Rule

Manual-capture Stripe PaymentIntents must use the new pricing model:

- `amount = customerTotalCents`
- `application_fee_amount = applicationFeeAmountCents`
- `transfer_data.destination = merchant/provider connected account`

Do not use `amountCents + platformFeeCents` as the authoritative customer charge amount.

## Core Product Invariants

Do not add:

- public provider/client profiles
- service listings
- browse/discover/search pages
- categories
- recommendations
- featured providers
- ratings/reviews/reputation
- messaging
- scheduler or booking marketplace flows
- dispute cases, claims, evidence uploads, appeals, manual fund awards, or admin judgment screens

Admins may inspect operational state and retry safe idempotent technical operations. Admins may not decide who deserves funds.

Payment state must be provider-backed. Never store raw card data, raw identity documents, full provider payloads, unnecessary payment secrets, or direct-custody representations.

## Architecture Rules

Use the repo’s existing stack and patterns:

- Next.js App Router
- React
- TypeScript
- Prisma ORM
- Neon PostgreSQL
- Clerk Auth
- Stripe / Stripe Connect
- Tailwind CSS
- Radix/shadcn-style components
- React Hook Form
- Zod
- Vitest
- Playwright
- pnpm

Server-first boundaries:

```txt
app/                    route shell only
features/               page/view orchestration
components/             pure reusable UI
lib/<domain>/fetchers/  server reads
lib/<domain>/actions/   server mutations
lib/auth/               auth helpers
lib/authz/              authorization policies/helpers
schemas/                runtime validation
types/                  DTOs and transport-safe contracts
prisma/                 database schema, migrations, seed
```

Server actions must authenticate, authorize, validate with Zod, use provider/server truth for payment state, write audit events, revalidate relevant paths/tags, and return typed results.

Fetchers must authenticate, authorize, query minimal fields, map to DTO/read models, and avoid returning raw Prisma objects deep into UI.

## Schema and Migration Rules

If Neon MCP/project access is available, inspect the live Neon schema/tables before migration.

If Neon project access is not available, use `prisma/schema.prisma` as the schema source and create migrations normally.

Do not run destructive migrations unless the repo is confirmed development-only or the migration is explicitly additive/backward-compatible.

Legacy money fields currently exist:

- `Vouch.amountCents`
- `Vouch.platformFeeCents`
- `PaymentRecord.amountCents`
- `PaymentRecord.platformFeeCents`

They are insufficient for the current money model. Add and use the canonical money fields above. Keep legacy fields only as compatibility aliases during migration unless a safe rename is explicitly planned.

## Validation

Run the smallest useful check first, then broader checks where practical.

Preferred completion checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm prisma:validate
pnpm validate:contracts
```

For E2E-impacting changes, also run:

```bash
pnpm test:e2e
```

Do not claim validation passed unless it was actually run.

## Reporting Format

When finished, report:

```md
## Summary

- ...

## Files Changed

- `path/to/file`

## Validation

- `pnpm lint` - pass/fail/not run
- `pnpm typecheck` - pass/fail/not run
- `pnpm test` - pass/fail/not run
- `pnpm prisma:validate` - pass/fail/not run
- `pnpm validate:contracts` - pass/fail/not run

## Contract Gates Checked

- ...

## Risks / Follow-Ups

- ...
```

## Final Rule

The product is Vouch.

The product is not a marketplace.

The product is not a judge.

The product is not escrow.
