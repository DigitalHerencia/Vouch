# Stripe Connect Integration

Source of truth date: 2026-05-06

This document is the canonical Stripe implementation guide for Vouch. It resolves the prior participant-model conflict by separating product roles from legacy `payer`/`payee` field names.

## Stripe Account Source of Truth

Use these account identities when validating Vouch Stripe behavior:

- Sandbox platform: `acct_1TPa46GV5dKxUPtb`
- Sandbox connected account: `acct_1TQHpNGV5d6axbAJ`
- Live platform: `acct_1TQHH2GuFcEUvSe9`

Implementation and validation work must use the sandbox platform and sandbox connected account until the full lifecycle is proven.

Do not validate development flows against the live platform account.

The ChatGPT Stripe connector has been observed scoped to the live platform account, so sandbox connected-account inspection must use Stripe CLI or a connector/session explicitly scoped to the sandbox platform.

## Confirmed Sandbox Connected Account State

Sandbox connected account `acct_1TQHpNGV5d6axbAJ` was retrieved through the sandbox platform using the Stripe CLI `--stripe-account` header flow.

Confirmed state:

- `card_payments`: `active`
- `transfers`: `active`
- `charges_enabled`: `true`
- `payouts_enabled`: `true`
- `details_submitted`: `true`
- `requirements.currently_due`: `[]`
- `requirements.past_due`: `[]`
- `controller.fees.payer`: `application`
- `controller.losses.payments`: `application`
- `controller.requirement_collection`: `stripe`
- `controller.stripe_dashboard.type`: `express`

The sandbox account is ready for connected-account payout/release-path testing.

## Stripe CLI Notes

The active Stripe CLI profile must report the sandbox platform before sandbox testing:

```txt
Profile: vouch-target
Account: Vouch sandbox (acct_1TPa46GV5dKxUPtb)
Live mode key: not available
API version: 2026-04-22.dahlia
Preview API version: 2026-04-22.preview
```

Connected account retrieval through the current CLI shape uses the Stripe-Account header flag:

```powershell
stripe accounts retrieve --stripe-account acct_1TQHpNGV5d6axbAJ --expand capabilities
```

A hosted onboarding account link was successfully created for the sandbox connected account using:

```powershell
stripe account_links create --account acct_1TQHpNGV5d6axbAJ --refresh-url http://localhost:3000/settings/payout --return-url http://localhost:3000/settings/payout --type account_onboarding
```

## Product Positioning

Vouch uses Stripe Connect/platform infrastructure for connected accounts and payouts. This does not make Vouch a marketplace product in public positioning.

Use "SaaS tool", "payment coordination", "commitment-backed payment", or "deterministic trust infrastructure" language in product copy and Stripe description boxes.

Do not describe Vouch as escrow.

Do not describe Vouch as a marketplace, broker, payment custodian, arbitrator, mediator, or dispute-resolution platform.

## Canonical Participant Mapping

Product role truth:

```txt
merchant/provider = creates and sends the Vouch, owns the connected payout account, receives funds when release conditions pass
customer/client   = accepts the Vouch, pays the customer total, receives non-capture/refund when release conditions fail
```

The merchant/provider creates the Vouch and owns the Stripe connected account destination.

The customer/client accepts the Vouch and pays through Stripe.

The merchant/provider is the payout recipient.

The customer/client is the paying party.

### Legacy Database Mapping During Migration

The current database may still use legacy `payer` and `payee` field names. Those names are semantically unsafe.

Until an intentional rename is approved and completed, treat legacy fields this way:

```txt
Vouch.payerId = merchant/provider/creator user id
Vouch.payeeId = customer/client/acceptor user id
```

Therefore, Stripe implementation must not infer money roles from the words `payer` and `payee`.

For the current legacy schema:

```txt
merchant/provider connected account = vouch.payer.connectedAccount
customer/client payment customer    = vouch.payee.paymentCustomer
```

Any code that uses `vouch.payer.paymentCustomer` as the payment customer while `payerId` is still the creator/merchant is wrong.

Any code that uses `vouch.payee.connectedAccount` as the destination account while `payeeId` is still the accepting/customer user is wrong.

Prefer explicit aliases in Stripe-facing code:

- `merchantUserId`
- `customerUserId`
- `merchantConnectedAccountId`
- `customerProviderCustomerId`
- `customerProviderPaymentMethodId`

## Readiness Gates

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

If existing setup fetchers currently enforce the opposite gates, they must be updated before the Stripe lifecycle can be considered correct.

## PaymentIntent Pricing

Manual-capture PaymentIntents must use:

- `amount`: `customerTotalCents`
- `capture_method`: `manual`
- `application_fee_amount`: `applicationFeeAmountCents`
- `transfer_data.destination`: merchant/provider connected account ID

The application fee amount is:

```txt
applicationFeeAmountCents = vouchServiceFeeCents + processingFeeOffsetCents
```

The connected-account transfer amount is the remaining charge amount after the application fee. This is intended to leave the merchant/provider with `protectedAmountCents`, subject to provider settlement behavior and required sandbox verification.

Do not use `amountCents + platformFeeCents` as the authoritative customer charge amount.

Do not compute pricing again during capture or refund. Use the frozen pricing snapshot persisted on the Vouch/payment record.

## Required Local Pricing Snapshot

Persist the full pricing snapshot on `Vouch` and `PaymentRecord`:

- `protectedAmountCents`
- `merchantReceivesCents`
- `vouchServiceFeeCents`
- `processingFeeOffsetCents`
- `applicationFeeAmountCents`
- `customerTotalCents`

Keep provider IDs and statuses only. Do not store raw card data, bank data, identity documents, full Stripe payloads, or unnecessary payment secrets.

## Canonical Stripe Lifecycle

Vouch should use an authorization-first, deferred-capture model whenever possible.

1. Merchant/provider creates a Vouch with an immutable pricing snapshot.
2. Customer/client accepts the invite.
3. Vouch verifies customer/client payment readiness and merchant/provider payout readiness.
4. Vouch creates/confirms a manual-capture PaymentIntent on the platform account.
5. The PaymentIntent charges `customerTotalCents` against the customer/client payment method.
6. The PaymentIntent uses `application_fee_amount = applicationFeeAmountCents`.
7. The PaymentIntent uses `transfer_data.destination = merchant/provider connected account`.
8. Stripe-confirmed `requires_capture` means local payment state becomes authorized/reserved.
9. Vouch remains uncaptured until deterministic confirmation resolution.
10. Both valid confirmations inside the confirmation window cause capture/release.
11. Failed release conditions cause cancellation/void/non-capture when uncaptured.
12. If funds were already captured under an exceptional technical sequence, use refund orchestration.
13. Stripe webhooks reconcile actual provider state.
14. Every important transition writes an audit event.

## PaymentIntent Metadata

PaymentIntent metadata should bind Stripe state to Vouch state without storing sensitive payloads:

- `vouch_id`
- `merchant_user_id` when safe
- `customer_user_id` when safe
- `payment_role=customer_commitment`
- `protected_amount_cents`
- `merchant_receives_cents`
- `vouch_service_fee_cents`
- `processing_fee_offset_cents`
- `application_fee_amount_cents`
- `customer_total_cents`
- `environment`

Metadata must not contain raw card data, identity documents, raw provider payloads, private notes, or unnecessary PII.

## Stripe Status Mapping

Canonical local payment status mapping:

- Stripe `requires_payment_method` → local `requires_payment_method`
- Stripe `requires_confirmation` → local `requires_payment_method` or provider-action-needed state
- Stripe `requires_action` → local `requires_payment_method` or provider-action-needed state
- Stripe `processing` → local `requires_payment_method` or provider-processing state, depending on current schema
- Stripe `requires_capture` → local `authorized`
- Stripe `succeeded` → local `captured`, then Vouch-controlled release state may become `released`/`completed`
- Stripe `canceled` → local `voided`
- Stripe failure/error states → local `failed`

Do not treat browser redirects as payment truth. Stripe state is the payment source of truth.

## Capture / Void / Refund Rules

If both authenticated participants confirm presence inside the valid confirmation window and the PaymentIntent is authorized/capturable, capture the PaymentIntent.

If confirmation conditions fail while the PaymentIntent is uncaptured/capturable, cancel/void the authorization or allow non-capture according to provider state and timing.

If confirmation conditions fail but the PaymentIntent has already been captured, create a refund path.

Canceling an uncaptured PaymentIntent releases the hold and is not a refund.

Refunding reverses settled funds and is a different operational path.

## Webhook Requirements

Stripe webhook processing must be:

- signature verified
- idempotent by Stripe event id
- recorded before processing
- deduped
- safe on duplicate delivery
- safe on late delivery
- mapped through narrow state transitions
- reconciled without storing full provider payloads

Webhook processing should update:

- provider webhook ledger
- payment webhook projection
- payment record status
- refund record status when relevant
- connected account readiness when relevant
- audit events
- route/tag revalidation targets

Minimum Stripe event coverage for the MVP lifecycle:

- `payment_intent.created`
- `payment_intent.amount_capturable_updated`
- `payment_intent.succeeded`
- `payment_intent.canceled`
- `payment_intent.payment_failed`
- `charge.refunded`
- `refund.created`
- `refund.updated`
- `account.updated`

Additional events may be recorded as ignored if they are not part of a current transition.

## Required Front-End Return Surfaces

The following route shells must exist so hosted provider flows return into Vouch-owned deterministic state reconciliation:

```txt
/settings/payment/return
/settings/payout/return
```

Return pages must not blindly display success. They must refresh or reconcile provider-backed readiness, then redirect or render the current state.

Outcomes follow state.

## Open Verification Before Production Confidence

Prove in Stripe sandbox:

- create merchant/provider connected account
- confirm merchant/provider connected account has active transfer and payout capability
- create customer/client payment method
- create/confirm manual-capture PaymentIntent for `customerTotalCents`
- verify the customer/client is the charged Stripe customer
- verify `application_fee_amount = applicationFeeAmountCents`
- verify `transfer_data.destination = merchant/provider connected account`
- verify authorized state maps to local `authorized`
- capture on valid dual-confirmation completion path
- cancel/void on non-release path before capture
- refund only when captured state requires reversal
- reconcile each relevant webhook idempotently
- write audit events for each important transition

## Codex Implementation Warning

The first Stripe implementation task is not to add new product behavior. It is to correct participant-role wiring wherever legacy `payer`/`payee` names caused the payment customer and connected-account destination to be reversed.

Search first for code that selects or uses:

```txt
vouch.payer.paymentCustomer
vouch.payee.connectedAccount
```

Under the current legacy schema, those are suspect in Stripe payment authorization code because the merchant/provider creator is `payerId` and the customer/client acceptor is `payeeId`.
