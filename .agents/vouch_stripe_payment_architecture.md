# Vouch Stripe Payment Architecture

## Purpose

This document maps Vouch's commitment protocol into Stripe objects, payment flows, webhook events, and server-side state transitions for the MVP.

Vouch has two separate money flows:

1. The merchant pays Vouch an upfront protocol issuance fee.
2. The customer later authorizes the protected Vouch amount on their own card through a manual-capture Stripe PaymentIntent.

These are separate Stripe transactions. They must not be collapsed into one charge, one application fee, one PaymentIntent, or one Checkout Session.

## Core Financial Rule

The merchant pays the Vouch protocol fee. The customer authorizes only the protected Vouch amount.

Vouch earns the merchant-paid fee when the merchant fee payment succeeds, regardless of whether the customer later confirms, fails to confirm, or the Vouch expires.

The customer is not responsible for Vouch platform fees or Stripe fees associated with the merchant's purchase of the Vouch.

## Actor Payment Responsibility

| Money item | Paid by | Stripe object | Timing | Refundable by default |
|---|---|---|---|---|
| Vouch protocol issuance fee | Merchant | Platform Checkout Session or platform PaymentIntent | Before Draft becomes Committed | No |
| Protected amount authorization | Customer | Checkout Session with manual-capture PaymentIntent | After Vouch is Committed and authorization link is opened | Not captured unless both confirm |
| Merchant settlement | Captured customer authorization | Connect destination charge or equivalent platform-orchestrated Connect settlement | Only after bilateral confirmation and provider capturability | N/A |
| Stripe fee on merchant fee | Merchant economics | Platform charge | At merchant fee payment | No |
| Stripe fee on customer captured payment | Provider/platform accounting | Captured customer PaymentIntent | Only if captured | Provider/platform decision |

## Flow 1: Merchant Pays Protocol Fee

The merchant buys the right to issue one Vouch protocol instance. This fee covers protocol creation, processing overhead, platform revenue, immutable commitment infrastructure, recovery state, and audit state.

### Stripe Model

Use a platform-owned Stripe Checkout Session or PaymentIntent.

This charge belongs to Vouch. Do not use a Connect destination charge for the merchant fee. Do not use `application_fee_amount` for the merchant's upfront protocol fee. Do not attach this fee to the later customer PaymentIntent.

### State Before Fee Success

- Draft exists or draft payload exists.
- No committed Vouch exists.
- No customer authorization PaymentIntent exists.
- No customer Checkout link is exposed.

### State After Fee Success

- Draft becomes Committed.
- Fee payment record is marked succeeded and non-refundable.
- Immutable Vouch record is created or finalized.
- Recovery snapshot is created.
- Audit event is written.
- Customer authorization Checkout Session can be created or exposed.

### Relevant Stripe Events

- `checkout.session.completed`
- `checkout.session.expired`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

Use webhooks and/or explicit Stripe retrieval to confirm provider success. Browser return is never payment truth.

## Flow 2: Customer Authorizes Protected Amount

The customer is not buying the Vouch. The customer is placing a conditional authorization hold for the protected amount.

This hold is captured only if both participants confirm presence inside the confirmation window and Stripe confirms the PaymentIntent is capturable.

### Stripe Model

Use Stripe Checkout with a manual-capture PaymentIntent. The platform creates the flow. The customer authorizes the protected amount. Funds are not captured at Checkout completion.

The PaymentIntent must remain capturable long enough for the confirmation window to resolve. Vouch must store `capture_before` or equivalent provider deadline when available and prevent confirmation windows that exceed provider capture feasibility.

### Required PaymentIntent Properties

- `capture_method=manual`
- supported currency, initially `usd`
- protected amount in integer cents
- safe metadata containing Vouch references
- Connect settlement configuration for the merchant when the flow requires payout routing

### Allowed Metadata

- `vouchId`
- `publicVouchId`
- `merchantUserId`
- `customerUserId` when known
- `paymentRecordId`
- `settlementRuleVersion`
- `feeRuleVersion`
- `confirmationWindowOpensAt`
- `confirmationWindowExpiresAt`
- `environment`

### Forbidden Metadata

- private appointment notes
- meeting purpose
- dispute language
- evidence text
- legal conclusions
- sensitive personal context
- raw confirmation codes
- raw location data
- identity document details

## Connect Settlement Model

Use platform-controlled Connect behavior for customer settlement, with destination charge or equivalent platform-orchestrated settlement selected consistently for the implementation.

Reason:

- Vouch controls workflow state.
- Vouch controls settlement eligibility.
- Stripe controls provider payment truth.
- Stripe Connect controls merchant payout eligibility.

Canonical customer-side flow:

1. Platform creates customer Checkout Session.
2. Checkout creates/confirms a manual-capture PaymentIntent.
3. PaymentIntent enters `requires_capture`.
4. Vouch records authorization.
5. Confirmation window opens.
6. Both parties confirm in-window.
7. Vouch retrieves the live PaymentIntent.
8. If capturable, Vouch captures idempotently.
9. Stripe routes settlement through Connect.

## Canonical Lifecycle Mapping

### Draft

Merchant enters amount, appointment time, and confirmation window. No customer PaymentIntent exists. Merchant fee payment may be pending.

### Committed

Merchant fee has succeeded. Vouch has been purchased and issued. Customer authorization Checkout Session may now be created or exposed.

### Sent

Merchant has access to and may share the customer authorization link externally.

### Accepted

Customer enters the Vouch flow and proceeds through Stripe Checkout. PaymentIntent may be awaiting payment method, action, or confirmation.

### Authorized

Customer PaymentIntent is manual-capture and capturable. Local payment status maps to provider `requires_capture`.

### Confirmable

Confirmation window is open and the PaymentIntent remains settlement-feasible. Vouch still does not capture until both confirmations are valid.

### Completed

Both participants confirmed in-window and capture succeeded or entered provider-backed capture processing that is treated as settlement-forward by contract.

### Expired

The Vouch did not reach valid bilateral confirmation and capture eligibility. If the PaymentIntent is capturable, cancel it idempotently. If authorization expired, failed, or was canceled by provider state, mirror that provider state. If an exceptional capture occurred, use deterministic refund/recovery handling without creating a manual judgment surface.

## Separate Payment and Settlement Axes

Do not represent `settled`, `voided`, `canceled`, `failed`, `refunded`, or `provider_blocked` as Vouch lifecycle states.

Use separate state axes:

```txt
paymentStatus: not_started | checkout_created | requires_payment_method | requires_capture | authorized | capture_processing | captured | canceled | expired | failed
settlementStatus: pending | non_capture_pending | non_captured | capture_pending | captured | refund_pending | refunded | provider_blocked | failed
```

## Required Webhook Handling

### Merchant Fee Flow

Handle:

- `checkout.session.completed`
- `checkout.session.expired`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

Purpose:

- Confirm merchant fee payment.
- Permit Draft to Committed only after provider-confirmed success.
- Prevent customer authorization link exposure if fee payment fails.

### Customer Authorization Flow

Handle:

- `checkout.session.completed`
- `checkout.session.expired`
- `payment_intent.succeeded`
- `payment_intent.canceled`
- `payment_intent.payment_failed`
- `payment_intent.amount_capturable_updated`

Important correction: Stripe does not emit a `payment_intent.requires_capture` event. A manual-capture PaymentIntent becoming capturable is represented by PaymentIntent status `requires_capture`, commonly observed through Checkout completion, retrieval, or `payment_intent.amount_capturable_updated`.

### Connect Readiness Flow

Handle:

- `account.updated`
- additional Stripe capability/account events only if enabled and supported by the selected API version

Purpose:

- Mirror connected account readiness.
- Block Vouch creation when merchant payout readiness is insufficient.
- Record provider restrictions.
- Avoid alternate payout paths.

## Webhook Processing Rules

Every provider webhook must be signature-verified, deduped by provider event ID, recorded once, classified, reconciled against current local state, applied only as valid forward movement, and marked processed, ignored, duplicate, stale, or failed.

Duplicate webhooks must not duplicate merchant fee confirmation, Vouch commit, authorization, capture, cancellation, refund, or audit events.

Late webhooks must not reopen terminal Vouches, move Completed back to Authorized, move Expired back to Authorized, invent confirmation truth, or trigger a second capture.

## Required Server Actions

### `prepareVouchFeeCheckoutAction`

Authenticates merchant, validates draft input, verifies merchant readiness, calculates fee server-side, creates a platform Checkout Session for the fee, stores pending fee reference, and redirects to Stripe.

### `finalizeMerchantFeePayment`

Runs from webhook processor or explicit provider retrieval. Confirms provider success, marks fee paid and non-refundable, commits the Vouch, creates recovery snapshot, writes audit, and prepares the customer authorization link.

### `createCustomerAuthorizationCheckoutAction`

Creates or retrieves the customer Checkout Session after Vouch commit. Verifies Vouch state and fee payment, creates manual-capture PaymentIntent through Checkout, binds safe metadata, stores provider references, and returns the Checkout URL.

### `confirmPresenceAction`

Authenticates participant, authorizes role, validates submitted code, verifies window is open, prevents duplicate confirmation, stores confirmation truth, retrieves current PaymentIntent when both confirmed, captures only if capturable, writes audit, and revalidates surfaces.

### `expireOrCancelUnconfirmedVouchAction`

Loads workflow/payment state, retrieves current PaymentIntent, cancels capturable non-eligible authorizations idempotently, mirrors provider terminal states, marks lifecycle Expired when appropriate, and writes audit.

## Database Records Needed

### Merchant Fee Payment

- `id`
- `merchantUserId`
- `draftReferenceId`
- `vouchId` after commit
- `provider`
- `providerCheckoutSessionId`
- `providerPaymentIntentId`
- `amountCents`
- `currency`
- `status`
- `paidAt`
- `failedAt`
- `nonRefundable`
- `createdAt`
- `updatedAt`

### Vouch Payment

- `id`
- `vouchId`
- `customerUserId`
- `merchantUserId`
- `connectedAccountId`
- `providerCheckoutSessionId`
- `providerPaymentIntentId`
- `providerChargeId`
- `amountCents`
- `currency`
- `paymentStatus`
- `settlementStatus`
- `amountCapturableCents`
- `captureBefore`
- `authorizedAt`
- `capturedAt`
- `canceledAt`
- `failedAt`
- `lastProviderSyncAt`

### Provider Webhook Event

- `provider`
- `providerEventId`
- `eventType`
- `status`
- `receivedAt`
- `processedAt`
- `safeMetadata`
- unique constraint on `provider + providerEventId`

## What Not To Do

Do not collect the merchant fee from the customer PaymentIntent. Do not capture at Checkout completion. Do not treat browser return URLs as truth. Do not let webhooks invent confirmation truth. Do not add disputes, evidence, manual settlement, or support override flows. Do not create customer authorization before the merchant fee succeeds.

## Final Invariant

Merchant pays to issue the Vouch. Customer authorizes the protected amount. Both confirm in-window, or no capture happens. Stripe owns payment truth. Vouch owns workflow truth. Outcome follows system state.

