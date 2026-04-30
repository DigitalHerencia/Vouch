# Vouch Product Requirements Document

Source of truth date: 2026-04-30

This document supersedes earlier payer/payee, old-fee, and old lifecycle wording where conflicts exist.

## Product Definition

Vouch is a commitment-backed payment coordination system for pre-arranged appointments and in-person agreements.

Vouch is not a marketplace, booking marketplace, discovery platform, public provider profile system, messaging app, ratings/reviews system, dispute-resolution system, escrow provider, broker, or scheduler.

## Participant Model

The merchant/provider creates the Vouch.

The customer/client accepts the Vouch and pays.

The merchant/provider is the payout recipient.

The customer/client is the paying party.

Legacy implementation names may remain temporarily:

- `payer` means provider / merchant / creator.
- `payee` means customer / client / paying acceptor.

New product copy, docs, contracts, and safe implementation work should prefer merchant/provider/customer/client language.

## Money Model

The customer pays:

```txt
customerTotalCents =
  protectedAmountCents
  + processingFeeOffsetCents
  + vouchServiceFeeCents
```

The merchant receives:

```txt
merchantReceivesCents = protectedAmountCents
```

The Vouch service fee is:

```txt
vouchServiceFeeCents = max(ceil(protectedAmountCents * 0.05), 500)
```

The processing fee offset covers estimated Stripe/payment processing cost on the final customer total:

```txt
processingFeeOffsetCents =
  ceil(
    (protectedAmountCents + vouchServiceFeeCents + stripeFixedCents)
      / (1 - stripePercentBps / 10000)
      - (protectedAmountCents + vouchServiceFeeCents)
  )
```

Initial defaults:

- `stripePercentBps`: `290`
- `stripeFixedCents`: `30`

The Stripe application fee amount is:

```txt
applicationFeeAmountCents =
  vouchServiceFeeCents + processingFeeOffsetCents
```

## Stripe Model

Stripe account source:

- Account ID: `acct_1TQHH2GuFcEUvSe9`
- Display name: `Vouch`

For the implemented manual-capture PaymentIntent flow:

- `PaymentIntent.amount` must be `customerTotalCents`.
- `application_fee_amount` must be `applicationFeeAmountCents`.
- `transfer_data.destination` must be the merchant/provider connected account.
- Local records must store provider references and safe pricing snapshots, not raw payment details.

## Product Scope

MVP includes:

- merchant/provider setup and payout readiness
- customer/client payment readiness
- Vouch creation
- invite/share
- customer acceptance and payment
- manual confirmation
- deterministic release/refund/non-capture handling
- Stripe webhook reconciliation
- admin operational visibility
- audit and notification records

MVP excludes:

- public profiles
- browsing, searching, categories, listings, matching, recommendations
- booking/scheduling tools
- in-app messaging
- reviews, ratings, reputation
- disputes, claims, evidence, appeals, admin award decisions
- legal escrow positioning

## UX Requirements

Every payment-bearing screen must make these amounts clear before payment:

- protected amount
- merchant receives
- Vouch service fee
- processing fee offset
- customer total

Every Vouch screen must make the participant roles clear:

- merchant/provider
- customer/client

If legacy internal labels surface temporarily, they must be hidden from product copy or explained in developer/admin-only contexts.
