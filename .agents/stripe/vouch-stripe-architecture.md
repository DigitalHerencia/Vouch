# Vouch Stripe Architecture Decision

Date: 2026-04-30

This file supersedes the 2026-04-28 Stripe architecture note where participant or fee language conflicts.

## Decision

Vouch uses Stripe as a provider-backed payment coordination layer for a SaaS commitment-backed payment product.

Stripe account source:

- Account ID: `acct_1TQHH2GuFcEUvSe9`
- Display name: `Vouch`

## Participant Model

- Merchant/provider creates the Vouch.
- Customer/client accepts the Vouch and pays.
- Merchant/provider is the connected-account payout recipient.
- Customer/client is the paying party.

Legacy names may remain temporarily:

- `payer` = merchant/provider/creator.
- `payee` = customer/client/paying acceptor.

## PaymentIntent Model

Vouch currently uses manual-capture PaymentIntents with destination charge parameters.

Required Stripe values:

- `amount = customerTotalCents`
- `application_fee_amount = applicationFeeAmountCents`
- `transfer_data.destination = merchant/provider connected account`

Do not calculate the PaymentIntent amount as `amountCents + platformFeeCents`.

## Money Model

```txt
customerTotalCents =
  protectedAmountCents
  + processingFeeOffsetCents
  + vouchServiceFeeCents

merchantReceivesCents = protectedAmountCents

vouchServiceFeeCents =
  max(ceil(protectedAmountCents * 0.05), 500)

applicationFeeAmountCents =
  vouchServiceFeeCents + processingFeeOffsetCents
```

The processing offset uses the configured Stripe percent/fixed formula from `.agents/contracts/domain-model.yaml`.

## Provider State Rules

- Payment state must be reconciled from Stripe/server-side provider state.
- Local records store provider references and safe pricing snapshots.
- Raw card data, raw identity documents, full Stripe payloads, and unnecessary secrets must not be stored.
- Release/refund/void operations must be idempotent and auditable.

## Product Boundaries

Vouch is not escrow, a marketplace, broker, scheduler, ratings/reviews system, messaging app, or dispute-resolution system.

Admins may inspect operational state and retry safe technical operations. Admins may not award funds or override confirmation truth.

## Sandbox Proof Still Required

Before production confidence, prove on `acct_1TQHH2GuFcEUvSe9`:

- customer/client payment authorization for `customerTotalCents`
- application fee collection for `applicationFeeAmountCents`
- merchant/provider connected-account destination
- manual capture on the release path
- void/refund/non-capture on the non-release path
- webhook idempotency and reconciliation
