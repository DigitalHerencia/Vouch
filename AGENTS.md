# AGENTS.md

## Project: Vouch

Source of truth date: 2026-05-12

This is the root operating guide for agents working in the Vouch repository. The current user task is the active source of truth for this revision: repository guidance must preserve architecture and payment invariants without regulating product vocabulary, naming, or word choice.

## Core Invariant

Vouch coordinates commitment-backed payments for pre-arranged appointments and in-person agreements.

```txt
both parties confirm presence within the confirmation window -> funds release
otherwise -> refund, void, or non-capture
```

Outcome follows persisted system state. Client state is never authoritative for readiness, fee math, confirmation, settlement, or lifecycle status.

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

If implementation conflicts with contracts, fix implementation. If docs conflict with contracts, report the conflict unless the current user task explicitly directs the governance update.

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

## Architecture

Use the existing Vouch architecture.

`app/**` is route shell only. Route shells may contain route segments, layouts, loading/error/not-found boundaries, thin `page.tsx` files, route handlers for external provider boundaries, params/searchParams handoff, redirects, and feature composition.

Boundary map:

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

The Stripe webhook route handler is the external provider boundary for Stripe events:

```txt
app/api/stripe/webhooks/route.ts
```

Route handlers should delegate business logic to integrations, actions, and transactions.

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

Keep payer payment setup and payee payout setup separate.

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

Persist customer total cents, application fee amount cents, payee receivable amount cents, Stripe PaymentIntent id, Stripe status, Stripe capture/refund/void reconciliation state, and safe provider references only.

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

Expired Vouches resolve by server-side deterministic resolution logic in:

```txt
lib/vouch/resolution.ts
lib/actions/paymentActions.ts
lib/actions/vouchActions.ts
lib/db/transactions/systemTransactions.ts
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

Webhook event IDs must be idempotently stored. Provider payload storage must be minimal and redacted.

## Fetchers, Schemas, And DTOs

Every protected fetcher should follow:

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

Use Zod schemas for server action inputs in `schemas/*`. Use transport-safe DTOs in `types/*`. Fetchers should return UI-safe data rather than raw Prisma rows or full Stripe objects.

## UI Design System

All UI should use the Vouch dark brutalist operational SaaS design system:

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

Every payment and Vouch screen must visibly show amount, status, required action, deadline/window, and consequence. Status must use text, not color alone.

## Testing And Validation

Add or update tests that cover changed payment, confirmation, settlement, webhook, fetcher, schema, DTO, transaction, and route-shell behavior.

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
