# Vouch Product Redesign

This document is the product source of truth for Codex agents.

## Core Model

Vouch is a B2B SaaS protocol for appointment deposit authorization.

- Businesses buy access to the protocol from Vouch.
- Businesses are the connected Stripe merchants.
- Customers authorize deposits to the business, not to Vouch.
- Vouch does not collect, hold, route, escrow, or settle customer deposit funds.
- Vouch charges the business a separate one-time non-refundable protocol fee before issuing a customer deposit authorization link.
- The customer deposit can be captured only when the protocol state allows capture.

## Payment Flows

There are two separate Stripe flows:

1. Merchant protocol fee
   - Merchant pays Vouch.
   - Charge belongs to the platform account.
   - This must succeed before a deposit authorization can be created.

2. Customer deposit authorization
   - Customer pays the connected business.
   - Payment is a Stripe Connect direct charge scoped to the connected account.
   - PaymentIntent uses manual capture.
   - Deposit transaction must not include `application_fee_amount`.
   - Deposit transaction must not include `transfer_data.destination`.

Do not collapse these flows into one charge, one PaymentIntent, one Checkout Session, one transfer, or one application fee.

## Confirmation Protocol

- Deposit authorization may be created at most 24 hours before the appointment timestamp.
- Confirmation window is one hour before appointment time through one hour after appointment time.
- Capture is allowed only when both merchant and customer independently confirm that the appointment took place inside the confirmation window.
- Missing confirmations lead to cancellation or authorization expiry.
- Double capture, double cancel, capture after cancel, and cancel after capture must be prevented by database state checks and Stripe idempotency keys.

## Product Boundaries

Do not build:

- scheduling
- marketplace discovery
- provider directories
- public profiles
- messaging
- reviews or ratings
- reputation
- dispute resolution
- appeals
- evidence uploads
- admin fund-award controls
- manual release overrides
- service outcome investigations

Vouch owns workflow truth only. Stripe owns payment truth. Clerk owns auth truth.

## Launch Scope

- US-only launch.
- Stripe-hosted onboarding.
- Full Stripe Dashboard access for connected businesses.
- Automatic payouts.
- Up-front verification.
