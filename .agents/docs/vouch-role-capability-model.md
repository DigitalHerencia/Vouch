# Vouch Role Capability Model

Source: user clarification in chat on 2026-05-22.

Vouch account identity and payment capabilities are additive, not mutually exclusive.

## Base Account

Every authenticated account is a Vouch user after Clerk sign-up and local Neon user sync.

Required base account state:

- Clerk user exists.
- Local `User` row exists.
- User agreement acceptance is recorded.
- User status is active.

## Customer Capability

A user becomes customer-capable when they complete the Stripe payment-method setup flow.

Customer capability means:

- A Stripe Customer exists.
- A reusable payment method is saved through Stripe-hosted setup.
- Vouch stores provider readiness only, not raw payment data.
- The user can accept a merchant-sent Vouch and authorize the destination PaymentIntent.

This capability does not make the user a merchant.

## Merchant Capability

A user becomes merchant-capable when they complete Stripe Connect onboarding.

Merchant capability means:

- A Stripe connected account exists.
- Stripe reports payout readiness as ready.
- The user can create Vouches as the merchant.
- The merchant pays Vouch creation fees through Stripe-hosted payment.
- After the creation fee is paid, the Vouch can provide the customer payment link.

This capability does not require the user to have saved a payer payment method.

## Combined Capability

If a user completes both payment-method setup and Connect onboarding, the same account is:

- a Vouch user,
- customer-capable,
- merchant-capable.

Code must not model these as exclusive roles.

## Vouch Payment Flow

1. Merchant creates a Vouch after merchant capability is ready.
2. Merchant pays Vouch and Stripe fees through a Stripe-hosted fee checkout.
3. Fee payment makes the Vouch immutable and eligible to provide a customer payment link.
4. Customer opens the payment link and completes Stripe-hosted payment-method setup if needed.
5. Stripe authorizes the destination manual-capture PaymentIntent against the customer's saved payment method.
6. Merchant and customer both confirm presence inside the confirmation window.
7. If both confirmations are written in time, Vouch captures the PaymentIntent and Stripe settles to the merchant connected account.
8. If both confirmations are not written in time, the PaymentIntent expires, is canceled, or is otherwise left non-captured according to provider state.

## Readiness Gates

Create Vouch gate:

- active user,
- accepted terms,
- merchant capability ready.

Accept Vouch gate:

- active user,
- accepted terms,
- customer capability ready.

Confirm presence gate:

- active participant user,
- valid participant relationship,
- confirmation window open,
- idempotent confirmation write succeeds.
