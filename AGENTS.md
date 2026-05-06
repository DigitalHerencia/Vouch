# AGENTS.md

## Project: Vouch

Source of truth date: 2026-05-06

This file is the root operating guide for agents working in the Vouch repository. It exists to prevent Codex and other coding agents from spending inference on rediscovering settled product, architecture, payment, and governance decisions.

Vouch is a narrow commitment-backed payment coordination system for pre-arranged appointments and in-person agreements.

Core rule:

```txt
Both parties confirm presence within the confirmation window → funds release.
Otherwise → refund, void, or non-capture according to provider-backed payment state.
```

Vouch is deterministic trust infrastructure. It does not ask who is right. It asks what happened, checks authenticated state, and executes the known rule.

## Non-Negotiable Product Boundaries

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
- an evidence or claims system
- an arbitration product

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

Admins may inspect operational state and retry safe idempotent technical operations. Admins may not decide who deserves funds, force-release funds, rewrite confirmation truth, edit confirmation timestamps, or adjudicate stories.

Payment state must be provider-backed. Never store raw card data, raw identity documents, full provider payloads, unnecessary payment secrets, or direct-custody representations.

## Source of Truth Order

When files conflict, use this order:

1. Current user task when explicitly marked as the new source of truth.
2. `.agents/docs/*.md`
3. `.agents/contracts/*.yaml`
4. `.agents/instructions/*.md`
5. This `AGENTS.md` as the root operating summary.
6. Existing repository code.
7. Agent judgment.

Existing repo code is not authoritative when it conflicts with the current docs/contracts. If implementation conflicts with contracts, fix implementation. If docs conflict with contracts, stop and report the conflict unless the current user task explicitly directs the governance update.

## Current Stripe Account Truth

Use these account identities when validating Vouch Stripe behavior:

- Sandbox platform: `acct_1TPa46GV5dKxUPtb`
- Sandbox connected account: `acct_1TQHpNGV5d6axbAJ`
- Live platform: `acct_1TQHH2GuFcEUvSe9`

Development and lifecycle proof work must use the sandbox platform and sandbox connected account until the full payment lifecycle is proven.

Do not validate development flows against the live platform account.

The ChatGPT Stripe connector has been observed scoped to the live platform account. Treat that connector as unsafe for sandbox inspection unless explicitly re-scoped. Use Stripe CLI or a connector/session explicitly scoped to the sandbox platform for sandbox verification.

## Participant Model

This is the canonical product model:

```txt
merchant/provider = creates and sends the Vouch, owns the connected payout account, receives funds when release conditions pass
customer/client   = accepts the Vouch, pays the customer total, receives non-capture/refund when release conditions fail
```

The merchant/provider creates the Vouch for a pre-arranged appointment or in-person agreement.

The customer/client accepts the Vouch and pays the customer total.

The merchant/provider is the payout recipient.

The customer/client is the paying party.

Public/product UI must use merchant/provider/customer/client language. Avoid payer/payee language in new UI and product copy because it is ambiguous during migration.

### Legacy Field Mapping During Migration

The current schema may still contain legacy `payer` and `payee` names. Those names are unsafe for payment reasoning.

Until a safe database/code rename is intentionally performed, treat the current legacy fields this way:

```txt
Vouch.payerId = merchant/provider/creator user id
Vouch.payeeId = customer/client/acceptor user id
```

This means:

- `payerId` does **not** automatically mean “Stripe payer.”
- `payeeId` does **not** automatically mean “Stripe payout recipient.”
- Stripe customer/payment method should belong to the customer/client acceptor.
- Stripe connected account destination should belong to the merchant/provider creator.

Any code that uses the creator/merchant `payer` relation as the payment customer, or the accepting/customer `payee` relation as the connected-account destination, is implementing the wrong side of the current product model and must be corrected.

Prefer clearer aliases in new DTOs, fetchers, actions, and feature code where safe:

- `merchantId`
- `providerId`
- `customerId`
- `clientId`
- `merchantUser`
- `customerUser`
- `merchantConnectedAccountId`
- `customerProviderCustomerId`

Do not perform a destructive database rename unless the user explicitly approves a migration plan.

## Readiness Gates

Readiness is not UI optimism. Readiness is provider-backed and database-backed state.

Merchant/provider create readiness requires:

- authenticated active user
- identity/adult verification when required by policy
- current terms acceptance
- Stripe connected account payout readiness
- no blocking account restriction

Customer/client accept-and-pay readiness requires:

- authenticated active user
- identity/adult verification when required by policy
- current terms acceptance
- Stripe customer/payment method readiness
- no blocking account restriction

Confirmation readiness requires:

- authenticated active participant
- active Vouch
- confirmation window open
- no duplicate confirmation
- participant can confirm only for themself

A single confirmation never releases funds. Late confirmation never releases funds. Admin action never rewrites confirmation truth.

## Money Model

The customer pays:

```txt
customerTotalCents = protectedAmountCents + processingFeeOffsetCents + vouchServiceFeeCents
```

The merchant receives on successful release:

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

Persist the immutable pricing snapshot on both `Vouch` and `PaymentRecord`:

- `protectedAmountCents`
- `merchantReceivesCents`
- `vouchServiceFeeCents`
- `processingFeeOffsetCents`
- `applicationFeeAmountCents`
- `customerTotalCents`

Legacy money fields currently exist:

- `Vouch.amountCents`
- `Vouch.platformFeeCents`
- `PaymentRecord.amountCents`
- `PaymentRecord.platformFeeCents`

They are compatibility aliases only. Do not use `amountCents + platformFeeCents` as the authoritative customer charge amount.

## Stripe PaymentIntent Rule

Vouch uses Stripe Connect/platform infrastructure for connected accounts and payouts. This does not make Vouch a marketplace product in public positioning.

Use manual-capture PaymentIntents:

```txt
PaymentIntent.amount = customerTotalCents
PaymentIntent.capture_method = manual
PaymentIntent.application_fee_amount = applicationFeeAmountCents
PaymentIntent.transfer_data.destination = merchant/provider connected account
```

PaymentIntent metadata must bind the provider object to internal Vouch state without storing sensitive payloads:

- Vouch id
- merchant/provider user id when safe
- customer/client user id when safe
- pricing snapshot values
- confirmation window identifiers when useful
- environment

The customer/client payment method is used to authorize the PaymentIntent.

The merchant/provider connected account is used as the Connect destination.

Do not create a Stripe flow where the merchant pays themself, where the customer is the destination account, or where participant role names are inferred from `payer`/`payee` without checking the migration mapping above.

## Stripe Lifecycle

Vouch should live in authorization-first land whenever possible:

1. Merchant/provider creates a Vouch with an immutable pricing snapshot.
2. Customer/client accepts the invite and authorizes payment through Stripe.
3. Stripe-confirmed `requires_capture` means Vouch payment state is authorized/reserved.
4. Both parties independently confirm presence inside the confirmation window.
5. If both valid confirmations exist, Vouch captures the PaymentIntent.
6. If release conditions fail before capture, Vouch cancels/voids the uncaptured authorization or lets it expire according to provider state.
7. If funds were already captured under an exceptional technical sequence, Vouch issues an explicit refund path.
8. Stripe webhooks reconcile provider truth into local durable state.
9. Every important transition writes an audit event.

Local browser state is never payment truth. Stripe provider state is payment truth. Vouch workflow state gives Stripe payment facts product meaning.

## Webhook Rules

Stripe webhooks must be:

- signature verified
- idempotent by provider event id
- recorded before processing
- deduped
- safe against duplicate delivery
- safe against late delivery
- mapped only to narrow internal transitions
- reconciled without storing full provider payloads

Webhook processing should update:

- generic provider webhook ledger
- payment webhook projection
- payment record status
- refund record status where relevant
- connected account readiness where relevant
- audit events
- revalidation targets

## Resolution Rules

Resolution follows state, not stories.

If both authenticated participants confirm inside the valid window and payment is authorized/capturable, capture and release.

If confirmation conditions fail and the PaymentIntent is uncaptured/capturable, cancel or void the authorization.

If confirmation conditions fail but the PaymentIntent was already captured, use refund orchestration.

If provider state is ambiguous, record a technical failure and surface safe retry/reconciliation for admin. Do not create arbitration.

## Architecture Rules

Use the repo’s existing stack and patterns:

- Next.js App Router
- React 19
- TypeScript
- Prisma ORM
- Neon PostgreSQL
- Clerk Auth
- Stripe / Stripe Connect
- Tailwind CSS v4
- shadcn/Base UI style primitives
- React Hook Form
- Zod
- Vitest
- Playwright
- pnpm

Server-first boundaries:

```txt
app/**                  route shell only
features/**             page/view orchestration
components/**           pure reusable UI
lib/fetchers/**         server reads
lib/actions/**          server mutations
lib/db/transactions/**  atomic persistence
lib/integrations/**     provider SDK boundaries
lib/auth/**             auth helpers
lib/authz/**            authorization policies/helpers
schemas/**              runtime validation
types/**                DTOs and transport-safe contracts
prisma/**               database schema and migrations
```

`app/**` route files must not contain Prisma queries, business logic, DTO shaping, authz rules, provider SDK logic, or complex forms.

Server actions must authenticate, authorize, validate with Zod, use provider/server truth for payment state, write audit events, revalidate relevant paths/tags, and return typed results.

Fetchers must authenticate, authorize, query minimal fields, map to DTO/read models, choose cache policy, and avoid returning raw Prisma objects deep into UI.

Components must remain pure reusable UI. No protected fetching, Prisma, Stripe, Clerk server APIs, authz enforcement, domain mutation, or hidden business rules in `components/**`.

## Design System Rule

Every UI task must follow the Vouch design-system contract:

- dark brutalist operational SaaS
- zero-radius panels
- black/neutral foundation
- high contrast
- restrained `#1D4ED8` blue
- uppercase display typography
- dense but intentional spacing
- bordered black/55 panels
- subtle blur
- grid/radial backgrounds
- mobile-first layouts
- status text, not color alone

Do not add marketplace-like profile cards, listings, ratings, social/reputation UI, chat UI, or dispute/evidence UI.

## Schema and Migration Rules

If Neon MCP/project access is available, inspect the live Neon schema/tables before migration.

If Neon project access is not available, use `prisma/schema.prisma` as the schema source and create migrations normally.

Do not run destructive migrations unless the repo is confirmed development-only or the migration is explicitly additive/backward-compatible.

For the current participant-name conflict, prefer non-destructive DTO/action/fetcher aliasing before database renames.

## Required Return Surfaces

The following route shells must exist so hosted provider flows return into Vouch-owned deterministic state reconciliation:

```txt
/settings/payment/return
/settings/payout/return
```

Return pages must not blindly display success. They must refresh or reconcile provider-backed readiness, then redirect or render the current state.

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

Outcome follows state.
