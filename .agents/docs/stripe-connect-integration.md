# Vouch Stripe Connect Implementation

Source of truth date: 2026-05-12

This is the architecture-corrected Stripe Connect implementation source for Vouch. It replaces older Stripe blueprints, marketplace examples, role mappings, and implementation matrices.

## Product Frame

Implement Stripe-backed commitment payment coordination for Vouch using the existing Vouch architecture, contracts, terminology, and design system.

Vouch is not a marketplace, broker, scheduler, messaging app, review system, dispute system, escrow provider, public directory, or discovery platform.

Core invariant:

```txt
both parties confirm presence within the confirmation window -> funds release
otherwise -> refund, void, or non-capture
```

Outcome follows system state. No unilateral action, late confirmation, admin arbitration, manual fund award, discretionary confirmation rewrite, dispute, evidence, or appeal surface can release funds.

## Stripe Account And Readiness Model

Payer readiness is required for creating or funding a Vouch:

- authenticated user
- active Vouch account
- adult/identity readiness if required by current setup gate
- accepted terms
- valid Stripe customer/payment method setup
- payment readiness stored in Vouch DB as provider-backed readiness state

Payee readiness is required for accepting or becoming bound as payee:

- authenticated user
- active Vouch account
- adult/identity readiness if required by current setup gate
- accepted terms
- Stripe connected account exists
- Stripe payout capability/readiness is active or sufficient for the Vouch flow
- payout readiness stored in Vouch DB as provider-backed readiness state

Do not treat payer payment setup and payee payout setup as the same thing.

## Stripe Connect Onboarding

Connect account creation/session logic belongs in:

```txt
lib/actions/paymentActions.ts
lib/integrations/stripe/connect.ts
lib/db/transactions/setupTransactions.ts
lib/fetchers/paymentFetchers.ts
schemas/payment.ts
types/payment.ts
```

Do not place Connect business logic in `app/api/accounts/*`.

Expected action surface:

```txt
startPaymentMethodSetupAction
refreshPaymentReadinessAction
startPayoutSetupAction
refreshPayoutReadinessAction
createStripeConnectedAccountAction
createStripeAccountSessionAction
```

Expected integration surface:

```txt
createConnectedAccount
createConnectedAccountOnboardingSession
createConnectedAccountManagementSession
retrieveConnectedAccount
mapConnectedAccountReadiness
```

Embedded Stripe components are allowed only for account onboarding, account management for payout setup, and payout readiness visibility.

Do not enable refund management, dispute management, evidence submission, capture controls, discretionary payment management, or manual fund movement.

Connected account metadata must include safe internal references only. Do not store raw card data, raw bank data, raw identity documents, full provider payloads, or sensitive KYC details.

## PaymentIntent Model

Use Stripe PaymentIntents with manual capture.

PaymentIntent creation belongs in `lib/integrations/stripe/payment-intents.ts`. Vouch action orchestration belongs in `lib/actions/vouchActions.ts` and `lib/actions/paymentActions.ts`. Database persistence belongs in `lib/db/transactions/vouchTransactions.ts`.

Do not create a `/capture` route handler. Do not call internal `fetch('/api/...')` for settlement.

PaymentIntent creation requirements:

```txt
amount = customer total amount in cents
currency = normalized supported currency
capture_method = manual
application_fee_amount = calculated Vouch fee
transfer_data.destination = payee connected account id when destination charge is used
metadata includes safe Vouch references
idempotency key is generated per durable operation
```

Fee calculation belongs only in `lib/vouch/fees.ts`.

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

## Create Flow

Use `createVouchAction` in `lib/actions/vouchActions.ts`.

Required sequence:

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
- no marketplace/provider discovery is introduced

## Accept Flow

Use `acceptVouchAction` and `declineVouchAction` in `lib/actions/vouchActions.ts`.

Required sequence:

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

## Presence Confirmation Flow

Use `confirmPresenceAction` in `lib/actions/vouchActions.ts`. Persistence belongs in `lib/db/transactions/confirmationTransactions.ts`. State derivation belongs in `lib/vouch/state.ts`, `lib/vouch/resolution.ts`, and `lib/vouch/time-windows.ts`.

Required sequence:

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

## Expiration And Resolution

Expired Vouches must be resolved by server-side deterministic resolution logic in:

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

Provider operation selection must be based on current Stripe PaymentIntent state. Always retrieve current provider state before capture, cancel, refund, or void. Use idempotency keys for PaymentIntent creation, capture, cancel/void, refund, webhook reconciliation writes, and operational retry attempts.

## Webhook Handling

Only external provider boundary route handler:

```txt
app/api/stripe/webhooks/route.ts
```

Route handler responsibilities:

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

Rules:

- webhooks reconcile provider state
- webhooks do not invent Vouch business truth
- webhook event IDs must be idempotently stored
- duplicate delivery must be safe
- provider payload storage must be minimal and redacted
- no raw sensitive provider data is stored

## Fetchers

Every protected fetcher must follow:

```txt
authenticate
authorize
minimal select
DTO mapping
cache policy
transport-safe return
```

Relevant fetchers:

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

## Schemas And DTOs

Use Zod schemas for all server action inputs in `schemas/payment.ts`, `schemas/setup.ts`, and `schemas/vouch.ts`.

Required schema coverage:

- start payment setup
- start payout setup
- refresh readiness
- create Vouch
- accept Vouch
- decline Vouch
- confirm presence
- resolve/refresh provider return state
- webhook-safe event normalization where applicable

Use transport-safe DTOs in `types/payment.ts`, `types/setup.ts`, `types/vouch.ts`, `types/action-result.ts`, and `types/webhooks.ts`.

Do not return raw Prisma rows or full Stripe objects.

DTOs must expose only UI-safe fields:

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

## UI Design Requirements

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

Do not use `rounded-lg`, soft SaaS cards, marketplace provider cards, rating stars, reviews, messaging UI, public profile cards, category filters, featured provider blocks, dispute/evidence UI, or decorative green/red-only status meaning.

Every payment/Vouch screen must visibly show amount, status, required action, deadline/window, and consequence. Status must use text, not color alone.

## Implementation Order

Phase 1: normalize provider integration in `lib/integrations/stripe/*`.

Phase 2: normalize actions in `lib/actions/paymentActions.ts` and `lib/actions/vouchActions.ts`.

Phase 3: normalize transactions in `lib/db/transactions/setupTransactions.ts`, `lib/db/transactions/vouchTransactions.ts`, `lib/db/transactions/confirmationTransactions.ts`, and `lib/db/transactions/systemTransactions.ts`.

Phase 4: normalize DTOs and schemas in `schemas/*` and `types/*`.

Phase 5: normalize UI in existing feature/component files only.

## Testing Requirements

Add or update:

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

Coverage must include fee math, payer/payee role wiring, manual capture PaymentIntent creation, idempotent capture, current PaymentIntent retrieval before settlement, confirmation window rejection cases, one-sided confirmation, both-confirmed release, expired incomplete resolution, webhook duplicate delivery safety, readiness mapping, PaymentIntent status mapping, and no forbidden marketplace/dispute routes/files.
