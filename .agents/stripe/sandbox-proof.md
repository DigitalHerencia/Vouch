# Stripe Sandbox Proof

Date: 2026-04-30

Stripe account source:

- Account ID: `acct_1TQHH2GuFcEUvSe9`
- Display name: `Vouch`

## Scope

This proof attempted to validate the manual-capture destination PaymentIntent flow for the current Vouch pricing model:

- `amount = customerTotalCents`
- `application_fee_amount = applicationFeeAmountCents`
- `transfer_data.destination = merchant/provider connected account`
- pricing snapshot metadata present on the PaymentIntent

No secrets are recorded in this document.

## Expected Pricing Snapshot

Test protected amount:

- `protectedAmountCents`: `10000`
- `merchantReceivesCents`: `10000`
- `vouchServiceFeeCents`: `500`
- `processingFeeOffsetCents`: `345`
- `customerTotalCents`: `10845`
- `applicationFeeAmountCents`: `845`

## Attempt 1: Express Connected Account

Connected account created:

- ID pattern: `acct_...LmL4`
- Type: `express`
- Country: `US`
- `charges_enabled`: `false`
- `payouts_enabled`: `false`
- `card_payments` capability: `inactive`
- `transfers` capability: `inactive`

PaymentIntent creation result:

- PaymentIntent ID: not created
- Expected amount: `10845`
- Expected application fee amount: `845`
- Expected destination: `acct_...LmL4`
- Stripe result: blocked
- Stripe error code: `insufficient_capabilities_for_transfer`
- Stripe error summary: destination account must have an enabled transfer-capable capability.

## Attempt 2: Custom Connected Account With Test Onboarding Fields

Goal:

- Create a test-mode custom connected account with requested `card_payments` and `transfers` capabilities.
- Add test identity, address, bank token, and ToS acceptance fields.
- Use it as the destination for a manual-capture PaymentIntent.

Connected account result:

- Connected account ID: not created
- PaymentIntent ID: not created
- Stripe result: blocked
- Stripe error summary: platform profile requires review of responsibility settings for collecting connected-account requirements.

## Release/Capture Path

Not proven.

Reason:

- No connected account available in this sandbox session was ready for destination charges/transfers.
- The PaymentIntent could not be created with `transfer_data.destination`.

## Provider-Only Release Path

Not proven.

Reason:

- Blocked before PaymentIntent authorization.
- Existing implementation still contains dual-confirm-only release logic, so backend changes are likely required after Stripe connected-account readiness is unblocked.

## Customer-Only Refund/Void/Non-Capture Path

Not proven.

Reason:

- Blocked before PaymentIntent authorization.

## Neither-Confirmed Refund/Void/Non-Capture Path

Not proven.

Reason:

- Blocked before PaymentIntent authorization.

## Webhook Reconciliation

Not proven.

Reason:

- No PaymentIntent, capture, cancel, or refund event was produced by the blocked destination-charge flow.
- Webhook signature verification and duplicate event idempotency still need a valid Stripe event from an authorized test flow.

## Unresolved Blockers

- No ready merchant/provider connected account is available for destination charges in the current Stripe sandbox state.
- A newly created Express account remains capability-inactive until onboarding is completed.
- Creating a test-mode Custom account is blocked by the platform profile/responsibility configuration.
- Because destination PaymentIntent creation is blocked, capture, cancel/refund, webhook reconciliation, and local DB resolution proof cannot be completed yet.

## Required Next Step

Complete one of the following in Stripe test mode for `acct_1TQHH2GuFcEUvSe9`:

- Finish onboarding for the Express connected account created during this proof, or
- Provide/create a connected account with enabled transfer capability for destination charges, or
- Update the Stripe platform profile/responsibility settings so test-mode Custom connected accounts can be created with required capabilities.

After a ready connected account exists, rerun the PaymentIntent authorization proof and continue capture, void/refund, webhook, and local reconciliation testing.
