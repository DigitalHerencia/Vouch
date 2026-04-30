# Vouch User Flows

Source of truth date: 2026-04-30

## Merchant / Provider Creates

1. Merchant/provider completes required account, verification, terms, and payout setup.
2. Merchant/provider enters the protected amount and appointment/confirmation window.
3. Server calculates the full pricing snapshot.
4. Server creates the Vouch and invite.
5. UI shows the customer/client invite path and clear pricing.

## Customer / Client Accepts And Pays

1. Customer/client opens the invite.
2. Customer/client signs in or signs up.
3. Customer/client completes required payment setup and terms.
4. Server blocks self-acceptance by the merchant/provider.
5. Server creates or confirms the Stripe manual-capture PaymentIntent for `customerTotalCents`.
6. Vouch becomes payment-backed only from provider-confirmed state.

## Confirmation

Both participants may confirm presence during the confirmation window:

- merchant/provider confirmation
- customer/client confirmation

Existing internal confirmation role values may still be `payer` and `payee` during migration, but product copy should use merchant/provider and customer/client.

## Resolution

Release path:

1. Required confirmations and provider state are satisfied.
2. System captures/releases through Stripe.
3. Merchant/provider receives `protectedAmountCents`.
4. Vouch records completion and audit events.

Non-release path:

1. Required release conditions are not satisfied before expiration or cancellation.
2. System voids, refunds, or leaves uncaptured according to provider state.
3. Vouch records expiration/refund outcome and audit events.

## Admin Flow

Admins inspect operational state and safe technical retries only. Admins do not decide disputes, award funds, or override confirmation truth.
