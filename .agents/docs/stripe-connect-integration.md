# Stripe Connect Integration

Source of truth date: 2026-04-30

Stripe account source:

- Account ID: `acct_1TQHH2GuFcEUvSe9`
- Display name: `Vouch`

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
