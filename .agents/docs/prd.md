# Vouch Product Requirements

Source of truth date: 2026-05-12

This document replaces prior Vouch PRD language. Older merchant/customer, marketplace-adjacent, arbitration, or escrow-adjacent framing is obsolete.

## Product Definition

Vouch is a narrow commitment-backed payment coordination system for pre-arranged appointments and in-person agreements.

Core invariant:

```txt
both parties confirm presence within the confirmation window -> funds release
otherwise -> refund, void, or non-capture
```

Outcome follows system state.

No unilateral action releases funds. No late confirmation releases funds. No admin arbitration releases funds. No manual fund award exists. No discretionary confirmation rewrite exists. No dispute, evidence, or appeal surface exists.

## Non-Goals

Vouch is not a marketplace, broker, scheduler, messaging app, review system, dispute system, escrow provider, public directory, or discovery platform.

Do not build public profiles, listing/browse/search surfaces, recommendations, ratings, reviews, messaging, scheduler flows, dispute cases, evidence upload, appeals, manual fund awards, force-release buttons, or admin judgment screens.

## Participants

Payer:

- creates or funds a Vouch
- must be ready to authorize payment
- must have provider-backed payment readiness in Vouch DB
- confirms presence during the confirmation window

Payee:

- accepts or becomes bound as the payee
- must be ready to receive funds through Stripe Connect
- must have provider-backed payout readiness in Vouch DB
- confirms presence during the confirmation window

Do not treat payer payment setup and payee payout setup as the same thing.

## Lifecycle

Use this lifecycle language:

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

Exact enum names must match existing Prisma/contracts/types.

## Money And Settlement

Use Stripe PaymentIntents with manual capture.

PaymentIntent requirements:

- amount is the customer total amount in cents
- currency is normalized and supported
- `capture_method = manual`
- `application_fee_amount` is the calculated Vouch fee
- `transfer_data.destination` is the payee connected account id when destination charge is used
- metadata contains safe Vouch references only
- every durable provider operation has an idempotency key

Fee calculation belongs only in `lib/vouch/fees.ts`.

Fee policy:

```txt
Vouch fee = max(5% of customer total, 500 cents)
```

Persist customer total cents, application fee amount cents, payee receivable amount cents, Stripe PaymentIntent id, Stripe status, Stripe capture/refund/void reconciliation state, and safe provider references only.

## Required Flows

Create Vouch:

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

Accept or decline Vouch:

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

Confirm presence:

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

Expired Vouches resolve by deterministic server-side logic:

```txt
both confirmed within window -> capture/release
not both confirmed within window -> refund, void, or non-capture
payment failed -> failed payment state
capture failed -> failed release state
refund failed -> failed refund state
```

Always retrieve current Stripe PaymentIntent state before capture, cancel, void, or refund.

## Architecture

Use the existing Vouch architecture. `app/**` is route shell only. Protected reads go through `lib/fetchers/*`. Writes go through `lib/actions/*`, `lib/db/transactions/*`, and `lib/integrations/*`. Stripe SDK calls live only in `lib/integrations/stripe/*`. Vouch state logic lives in `lib/vouch/*`. Zod schemas live in `schemas/*`. DTOs live in `types/*`.

Do not create forbidden API route trees or one-off helper files:

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

## UI Requirements

All UI must use the Vouch dark brutalist operational SaaS design system:

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

## Acceptance Criteria

- No marketplace framing exists.
- No forbidden routes exist.
- No public provider directory exists.
- No messaging, reviews, ratings, disputes, or evidence exist.
- No app page contains Prisma, payment, or business logic.
- No component contains protected fetching or domain mutation.
- No client state is authoritative for confirmation or settlement.
- All protected reads go through fetchers.
- All writes go through server actions, transactions, and integrations.
- Stripe SDK calls are isolated in `lib/integrations/stripe`.
- PaymentIntent capture is manual and idempotent.
- Current provider state is retrieved before settlement.
- Both confirmations within the window release funds.
- Anything else resolves to refund, void, or non-capture.
- Provider webhooks reconcile state idempotently.
- UI follows the Vouch dark brutalist design system.
- Amount, status, deadline, action, and consequence are visible on Vouch/payment screens.
- Tests cover payment, confirmation, settlement, webhook, and forbidden-route rules.
- Validation passes.
