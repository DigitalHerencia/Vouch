# AGENTS.md

## Project: Vouch

Source of truth date: 2026-05-12

This is the root operating guide for agents working in the Vouch repository. The current paradigm below overrules older repository guidance, older `.agents` files, and implementation artifacts that conflict with it.

Vouch is a narrow commitment-backed payment coordination system for pre-arranged appointments and in-person agreements.

Core invariant:

```txt
both parties confirm presence within the confirmation window -> funds release
otherwise -> refund, void, or non-capture
```

Outcome follows system state.

No unilateral action releases funds. No late confirmation releases funds. No admin arbitration releases funds. No manual fund award exists. No discretionary confirmation rewrite exists. No dispute, evidence, or appeal surface exists.

## Product Boundaries

Vouch is not:

- a marketplace
- a broker
- a scheduler
- a messaging app
- a review system
- a dispute system
- an escrow provider
- a public directory
- a discovery platform

Do not add:

- marketplace-style route trees
- public profile cards
- provider listing or browse surfaces
- rating stars, reviews, reputation, or social proof
- messaging UI
- category filters or featured provider blocks
- dispute, claim, evidence, or appeal flows
- manual award, force release, or admin settlement controls

Use this product language:

- payer
- payee
- participant
- Vouch
- commitment
- confirmation window
- presence confirmation
- funds release
- refund
- void
- non-capture
- provider-backed settlement
- deterministic resolution

Avoid this language in product copy and new implementation naming:

- marketplace
- booking platform
- escrow
- broker
- dispute
- claim
- appeal
- evidence
- review
- rating
- search
- discovery
- manual award
- force release

## Source Of Truth Order

When files conflict, use this order:

1. Current user task when explicitly marked as the new source of truth.
2. `.agents/docs/prd.md`
3. `.agents/docs/stripe-connect-integration.md`
4. `.agents/contracts/*.yaml`
5. `.agents/instructions/*.md`
6. This `AGENTS.md`.
7. Existing repository code.
8. Agent judgment.

Existing code is not authoritative when it conflicts with the current contracts. If implementation conflicts with contracts, fix implementation. If docs conflict with contracts, stop and report the conflict unless the current user task explicitly directs the governance update.

## Target Stack

- Next.js App Router
- React 19
- TypeScript
- Prisma + Neon Postgres
- Clerk
- Stripe + Stripe Connect
- Zod
- React Hook Form
- Tailwind CSS v4
- shadcn/Base UI
- Vitest
- Playwright
- pnpm

## Required Architecture

Use the existing Vouch architecture.

`app/**` is route shell only.

Allowed in `app/**`:

- route segments
- layouts
- loading/error/not-found boundaries
- thin `page.tsx` files
- route handlers for external provider boundaries
- params/searchParams handoff
- redirects
- feature composition

Forbidden in `app/**`:

- Prisma queries
- Stripe business logic
- Clerk server business logic beyond route-level access handoff
- authz enforcement
- DTO shaping
- domain mutation
- payment settlement logic
- complex form logic

Boundary rules:

```txt
app/**                         route shell only
features/**                    page/view orchestration
components/**                  pure reusable UI
lib/fetchers/*                 protected server reads
lib/actions/*                  server actions and write orchestration
lib/db/transactions/*          atomic persistence
lib/integrations/stripe/*      Stripe SDK calls
lib/auth/*                     authentication helpers
lib/authz/*                    authorization helpers
lib/vouch/*                    Vouch state, fees, resolution, status, windows
schemas/*                      Zod schemas
types/*                        transport-safe DTOs
```

Do not create these files:

```txt
app/api/accounts/create/route.ts
app/api/accounts/session/route.ts
app/api/vouches/create/route.ts
app/api/vouches/confirm/route.ts
app/api/vouches/capture/route.ts
lib/stripe.ts
lib/db.ts
lib/types.ts
components/vouch-form.tsx
components/stripe-connect.tsx
components/confirmation-panel.tsx
```

Only this external provider boundary route handler is allowed for Stripe webhooks:

```txt
app/api/stripe/webhooks/route.ts
```

## Corrected Project Surface

Use or update this architecture surface. Do not introduce parallel marketplace-style trees.

```txt
app/
  api/stripe/webhooks/route.ts
  (tenant)/dashboard/page.tsx
  (tenant)/setup/page.tsx
  (tenant)/settings/payment/page.tsx
  (tenant)/settings/payout/page.tsx
  (tenant)/settings/verification/page.tsx
  (tenant)/vouches/page.tsx
  (tenant)/vouches/new/page.tsx
  (tenant)/vouches/[vouchId]/page.tsx
  (tenant)/vouches/[vouchId]/confirm/page.tsx
  (public)/vouches/invite/[token]/page.tsx

features/
  dashboard/*
  setup/*
  settings/*
  payments/*
  vouches/create/*
  vouches/invite/*
  vouches/detail/*
  vouches/confirm/*

components/
  payments/*
  vouches/*

lib/
  actions/paymentActions.ts
  actions/setupActions.ts
  actions/verificationActions.ts
  actions/vouchActions.ts
  fetchers/*
  db/selects/*
  db/transactions/*
  integrations/stripe/*
  vouch/*
  security/*

schemas/
  payment.ts
  setup.ts
  verification.ts
  vouch.ts

types/
  action-result.ts
  payment.ts
  setup.ts
  verification.ts
  vouch.ts
  webhooks.ts
```

## Readiness Model

Vouch has two separate readiness tracks.

Payer readiness is required for creating or funding a Vouch:

- authenticated user
- active Vouch account
- adult/identity readiness if required by the current setup gate
- accepted terms
- valid Stripe customer/payment method setup
- payment readiness stored in Vouch DB as provider-backed readiness state

Payee readiness is required for accepting or becoming bound as payee:

- authenticated user
- active Vouch account
- adult/identity readiness if required by the current setup gate
- accepted terms
- Stripe connected account exists
- Stripe payout capability/readiness is active or sufficient for the Vouch flow
- payout readiness stored in Vouch DB as provider-backed readiness state

Do not treat payer payment setup and payee payout setup as the same thing.

## Stripe Connect

Stripe Connect account creation and session logic belongs in:

```txt
lib/actions/paymentActions.ts
lib/integrations/stripe/connect.ts
lib/db/transactions/setupTransactions.ts
lib/fetchers/paymentFetchers.ts
schemas/payment.ts
types/payment.ts
```

Expected action surface:

```txt
startPaymentMethodSetupAction
refreshPaymentReadinessAction
startPayoutSetupAction
refreshPayoutReadinessAction
createStripeConnectedAccountAction
createStripeAccountSessionAction
```

Expected Stripe Connect integration surface:

```txt
createConnectedAccount
createConnectedAccountOnboardingSession
createConnectedAccountManagementSession
retrieveConnectedAccount
mapConnectedAccountReadiness
```

Embedded Stripe components are allowed only for setup and readiness:

- account onboarding
- account management for payout setup
- payout readiness visibility

Do not enable refund management, dispute management, evidence submission, capture controls, discretionary payment management, or manual fund movement.

Connected account metadata must include safe internal references only. Never store raw card data, raw bank data, raw identity documents, full provider payloads, or sensitive KYC details.

## PaymentIntent Model

Use Stripe PaymentIntents with manual capture.

PaymentIntent creation belongs in:

```txt
lib/integrations/stripe/payment-intents.ts
```

Vouch action orchestration belongs in:

```txt
lib/actions/vouchActions.ts
lib/actions/paymentActions.ts
```

Database persistence belongs in:

```txt
lib/db/transactions/vouchTransactions.ts
```

Do not create a `/capture` route handler. Do not call internal `fetch('/api/...')` for settlement.

Core PaymentIntent creation requirements:

```txt
amount = customer total amount in cents
currency = normalized supported currency
capture_method = manual
application_fee_amount = calculated Vouch fee
transfer_data.destination = payee connected account id when destination charge is used
metadata includes safe Vouch references
idempotency key is generated per durable operation
```

Fee calculation belongs only in:

```txt
lib/vouch/fees.ts
```

Fee policy:

```txt
Vouch fee = max(5% of customer total, 500 cents)
```

Persist:

- customer total cents
- application fee amount cents
- payee receivable amount cents
- Stripe PaymentIntent id
- Stripe status
- Stripe capture/refund/void reconciliation state
- safe provider references only

## Vouch Flows

`createVouchAction` sequence:

```txt
authenticate
authorize
Zod validate
load setup/payment readiness
calculate fee
create Stripe manual-capture PaymentIntent through integration module
create Vouch + PaymentRecord + Invitation through transaction
write audit event
revalidate affected paths/tags
return typed ActionResult
```

Rules:

- client input is never authoritative
- status is derived from server state
- fee math is server-owned
- payment provider state is reconciled server-side
- invite token is generated server-side
- Vouch cannot be created if required setup gates fail
- no marketplace or discovery surface is introduced

`acceptVouchAction` and `declineVouchAction` sequence:

```txt
authenticate
authorize invitation access
Zod validate
verify invitation state
verify self-acceptance is denied
verify payee readiness
bind payee
transition Vouch state
write audit event
revalidate
return typed ActionResult
```

Rules:

- accept does not release funds
- accept does not confirm presence
- accept does not override readiness gates
- payee payout readiness must be enforced before accept if required by current contract
- decline does not create a dispute surface

`confirmPresenceAction` sequence:

```txt
authenticate
authorize active participant
Zod validate
load Vouch with minimal participant/payment/confirmation state
verify Vouch is active
verify confirmation window is open
prevent duplicate confirmation
write PresenceConfirmation transaction
derive updated confirmation truth
if both parties confirmed within window:
  retrieve current Stripe PaymentIntent
  capture with idempotency key
  persist provider-backed capture status
  transition Vouch to release-processing or completed according to provider result
else:
  transition/display waiting state
write audit event
revalidate
return typed ActionResult
```

Rules:

- payer and payee confirmations are separate facts
- duplicate confirmation must be rejected
- one-sided confirmation must not release funds
- late confirmation must not release funds
- client-side button state is not authoritative
- status must be derived from persisted state
- settlement must be idempotent

## Deterministic Resolution

Expired Vouches must be resolved by server-side deterministic resolution logic.

Use or update:

```txt
lib/vouch/resolution.ts
lib/actions/paymentActions.ts
lib/actions/vouchActions.ts
lib/db/transactions/systemTransactions.ts
```

Resolution rule:

```txt
both confirmed within window -> capture/release
not both confirmed within window -> refund, void, or non-capture
payment failed -> failed payment state
capture failed -> failed release state
refund failed -> failed refund state
```

Always retrieve current Stripe PaymentIntent state before capture, cancel, void, or refund. Use idempotency keys for PaymentIntent creation, capture, cancel/void, refund, webhook reconciliation writes, and operational retry attempts.

## Webhooks

`app/api/stripe/webhooks/route.ts` responsibilities:

- read raw body
- verify Stripe signature
- delegate event classification
- return provider-compatible response

Business logic belongs in:

```txt
lib/integrations/stripe/webhook-events.ts
lib/actions/paymentActions.ts
lib/db/transactions/systemTransactions.ts
```

Handle at minimum:

- `account.updated`
- `setup_intent.succeeded`
- `setup_intent.setup_failed`
- `payment_intent.requires_capture`
- `payment_intent.succeeded`
- `payment_intent.canceled`
- `payment_intent.payment_failed`
- `refund.created`
- `refund.updated`
- `charge.refunded`

Webhook rules:

- webhooks reconcile provider state
- webhooks do not invent Vouch business truth
- webhook event IDs must be idempotently stored
- duplicate delivery must be safe
- provider payload storage must be minimal and redacted
- no raw sensitive provider data is stored

## Fetchers, Schemas, And DTOs

Every protected fetcher must follow:

```txt
authenticate
authorize
minimal select
DTO mapping
cache policy
transport-safe return
```

Required fetcher surface:

```txt
getPaymentReadiness
getPayoutReadiness
getSetupStatus
getCreateVouchPageData
getVouchDetail
getConfirmPresencePageData
getInviteAcceptanceData
getDashboardData
```

Fetchers must not mutate state, call Stripe for mutation, leak provider secrets, return raw Prisma models, return sensitive provider payloads, or expose internal authorization details.

Use Zod schemas for all server action inputs in:

```txt
schemas/payment.ts
schemas/setup.ts
schemas/vouch.ts
```

Use transport-safe DTOs in:

```txt
types/payment.ts
types/setup.ts
types/vouch.ts
types/action-result.ts
types/webhooks.ts
```

Do not return raw Prisma rows or full Stripe objects.

DTOs expose only UI-safe fields such as:

```txt
id
displayId
amount
fee
status
deadline
confirmationWindow
participantRole
payerConfirmationState
payeeConfirmationState
readinessState
nextAction
consequenceText
safeProviderStatus
```

## Lifecycle Language

Use this lifecycle:

```txt
Draft / Created
Invite Sent
Accepted
Payment Authorized
Window Pending
Window Open
Payer Confirmed
Payee Confirmed
Both Confirmed
Release Processing
Completed
Expired
Voided
Refunded
Payment Failed
Release Failed
Refund Failed
Canceled
```

Exact enum names must match existing Prisma, contracts, and types. Do not invent incompatible status unions.

## UI Design System

All UI must use the Vouch dark brutalist operational SaaS design system.

Required styling:

- `rounded-none`
- `border border-neutral-700`
- `bg-black/55`
- `backdrop-blur-[2px]`
- `text-white`
- `text-neutral-400`
- `font-(family-name:--font-display)`
- uppercase labels/buttons/headings
- `bg-[#1D4ED8]` for primary action
- restrained blue accents
- dense but intentional spacing
- mobile-first layout

Do not use:

- `rounded-lg`
- soft SaaS cards
- marketplace provider cards
- rating stars
- reviews
- messaging UI
- public profile cards
- category filters
- featured provider blocks
- dispute/evidence UI
- decorative green/red-only status meaning

Every payment and Vouch screen must visibly show:

- amount
- status
- required action
- deadline/window
- consequence

Status must use text, not color alone.

## Admin Restrictions

Admin may observe and retry safe provider operations only where contracts allow.

Admin must not:

- decide who is right
- collect stories
- collect screenshots
- collect evidence
- arbitrate disputes
- manually award funds
- force release funds
- rewrite confirmation truth
- edit confirmation timestamps
- override deterministic resolution

Admin views may show safe status, safe provider reference, audit trail, webhook event status, retry eligibility, and operational failure badges.

## Testing Requirements

Add or update tests for:

```txt
tests/unit/vouches/fees.test.ts
tests/unit/vouches/confirmation.test.ts
tests/unit/vouches/status.test.ts
tests/unit/vouches/transactions.test.ts
tests/unit/payments/payment-intents.test.ts
tests/unit/payments/stripe-status-map.test.ts
tests/unit/webhooks/idempotency.test.ts
tests/unit/webhooks/stripe-webhook-events.test.ts
tests/contract/no-forbidden-files.test.ts
tests/e2e/no-forbidden-routes.spec.ts
tests/e2e/app-route-smoke.spec.ts
```

Required coverage:

- fee math: max 5% or 500 cents
- payer/payee role wiring
- manual capture PaymentIntent creation
- idempotent capture
- current PaymentIntent retrieval before settlement
- duplicate confirmation rejection
- before-window confirmation rejection
- after-window confirmation rejection
- one-sided confirmation does not release funds
- both confirmations release funds
- expired incomplete Vouch voids/refunds/non-captures
- webhook duplicate delivery safety
- `account.updated` readiness mapping
- `payment_intent` status mapping
- no forbidden marketplace/dispute routes/files

## Validation

Run scope-appropriate validation:

```bash
pnpm validate:contracts
pnpm prisma:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm validate
```

For payment/domain work, minimum required:

```bash
pnpm validate:contracts
pnpm prisma:validate
pnpm lint
pnpm typecheck
pnpm test
```

Do not claim validation passed unless it was actually run.

## Implementation Order

1. Normalize provider integration in `lib/integrations/stripe/*`.
2. Normalize actions in `lib/actions/paymentActions.ts` and `lib/actions/vouchActions.ts`.
3. Normalize transactions in `lib/db/transactions/*`.
4. Normalize DTOs and schemas in `types/*` and `schemas/*`.
5. Normalize UI in existing feature/component files only.

## Final Acceptance Criteria

The implementation is acceptable only when:

```txt
No marketplace framing exists.
No forbidden routes exist.
No public provider directory exists.
No messaging/reviews/ratings/disputes/evidence exist.
No app page contains Prisma/payment/business logic.
No component contains protected fetching/domain mutation.
No client state is authoritative for confirmation or settlement.
All protected reads go through fetchers.
All writes go through server actions/transactions/integrations.
Stripe SDK calls are isolated in lib/integrations/stripe.
PaymentIntent capture is manual and idempotent.
Current provider state is retrieved before settlement.
Both confirmations within window release funds.
Anything else resolves to refund, void, or non-capture.
Provider webhooks reconcile state idempotently.
UI follows Vouch dark brutalist design system.
Amount, status, deadline, action, and consequence are visible on Vouch/payment screens.
Tests cover payment, confirmation, settlement, webhook, and forbidden-route rules.
Validation passes.
```

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
