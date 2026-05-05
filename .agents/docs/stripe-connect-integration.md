# Stripe Connect Integration

Source of truth date: 2026-05-04

## Stripe Account Source of Truth

Use these account identities when validating Vouch Stripe behavior:

- Sandbox platform: `acct_1TPa46GV5dKxUPtb`
- Sandbox connected account: `acct_1TQHpNGV5d6axbAJ`
- Live platform: `acct_1TQHH2GuFcEUvSe9`

Implementation and validation work must use the sandbox platform and sandbox connected account until the full lifecycle is proven.

Do not validate development flows against the live platform account.

The ChatGPT Stripe connector was observed scoped to the live platform account, so sandbox connected-account inspection must use Stripe CLI or a connector/session explicitly scoped to the sandbox platform.

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

Use "SaaS tool" and "payment coordination" language in product copy and Stripe description boxes.

Do not describe Vouch as escrow.

## Participant Mapping

- Merchant/provider creates the Vouch and owns the connected account destination.
- Customer/client accepts the Vouch and pays.
- Legacy `payer` fields currently mean merchant/provider.
- Legacy `payee` fields currently mean customer/client.

## PaymentIntent Pricing

Manual-capture PaymentIntents must use:

- `amount`: `customerTotalCents`
- `application_fee_amount`: `applicationFeeAmountCents`
- `transfer_data.destination`: merchant/provider connected account ID

The application fee amount is:

```txt
applicationFeeAmountCents =
  vouchServiceFeeCents + processingFeeOffsetCents
```

The connected-account transfer amount is the remaining charge amount after the application fee. This is intended to leave the merchant/provider with `protectedAmountCents`, subject to provider settlement behavior and required sandbox verification.

## Required Local Snapshots

Persist the full pricing snapshot on `Vouch` and `PaymentRecord`:

- `protectedAmountCents`
- `merchantReceivesCents`
- `vouchServiceFeeCents`
- `processingFeeOffsetCents`
- `applicationFeeAmountCents`
- `customerTotalCents`

Keep provider IDs and statuses only. Do not store raw card data or full Stripe payloads.

## Required Front-End Return Surfaces

The following route shells must exist so hosted provider flows return into Vouch-owned deterministic state reconciliation:

- `/settings/payment/return`
- `/settings/payout/return`

Return pages must not blindly display success. They must refresh or reconcile provider-backed readiness, then redirect or render the current state.

Outcomes follow state.

## Open Verification

Before production confidence, prove in Stripe sandbox:

- create merchant/provider connected account
- create customer/client payment method
- authorize manual-capture PaymentIntent for `customerTotalCents`
- verify `application_fee_amount`
- verify connected account destination
- capture on valid completion path
- void/refund on non-release path
- reconcile webhooks idempotently
