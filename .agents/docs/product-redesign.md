# Vouch Product Redesign

This document is the product source of truth for Codex agents.

## Core Model

Vouch is a B2B SaaS protocol for appointment deposit authorization.

- Businesses buy access to the protocol from Vouch.
- Businesses are user-owned connected Stripe merchants.
- The connected business is the merchant of record and is liable for its negative balances.
- Customers authorize deposits to the business, not to Vouch.
- Vouch does not collect, hold, route, escrow, or settle customer deposit funds.
- Vouch charges the business a separate one-time non-refundable protocol fee before issuing a customer deposit authorization link.
- The customer deposit can be captured only when the protocol state allows capture.

## Required Account Readiness

Payment-method readiness and connected-account readiness are separate requirements.

- Every Vouch user must save a reusable payment method to their Stripe Customer on the platform account.
- Any reusable Stripe-supported payment method attached to that platform Customer satisfies payment-method readiness.
- Until payment-method readiness is synchronized into Prisma, the dashboard displays its requirement notice and its operational components remain non-interactive.
- A connected business must separately complete Stripe-hosted Connect onboarding.
- Connect onboarding must provide the required charge and payout capabilities before the new-Vouch form becomes interactive.
- Stripe Connect onboarding does not satisfy platform payment-method readiness because connected accounts and platform Customers belong to separate Stripe account namespaces.
- Stripe determines required identity and business verification. Vouch must not bypass or weaken Stripe-required verification.

## Payment Flows

There are two separate Stripe flows:

1. Merchant protocol fee
   - Merchant pays Vouch.
   - Charge belongs to the platform account.
   - This must succeed before a deposit authorization can be created.
   - Successful payment activates the Vouch and makes its customer authorization link available.

2. Customer deposit authorization
   - Customer pays the connected business.
   - Payment is a Stripe Connect direct charge scoped to the connected account.
   - PaymentIntent uses manual capture.
   - Customer authorization must complete before the appointment timestamp.
   - Deposit transaction must not include `application_fee_amount`.
   - Deposit transaction must not include `transfer_data.destination`.

Do not collapse these flows into one charge, one PaymentIntent, one Checkout Session, one transfer, or one application fee.

## New Vouch Flow

The merchant-facing new-Vouch form is a required wizard:

1. Per-Vouch disclaimer
   - The merchant must explicitly accept the disclaimer for each Vouch.
   - Acceptance and its timestamp must be persisted with that Vouch.
   - This is separate from the one-time account user agreement.
2. Appointment and amount
   - Merchant selects the appointment timestamp and Vouch amount.
   - A Vouch may be created only during the 24 hours immediately before the future appointment timestamp.
   - Confirmation opens one hour before and closes one hour after the appointment.
3. Review and protocol fee
   - Show the Vouch details and merchant protocol fee.
   - The final action opens Stripe Checkout for the merchant protocol fee.
   - On successful payment, route to the new Vouch detail page and update dashboard summaries and statistics.

The form must remain disabled with a connected-account onboarding call to action until Connect readiness is complete.

## Customer Authorization Flow

- After the merchant protocol fee succeeds, the merchant receives a Stripe-hosted customer authorization Checkout link associated with the Vouch public ID.
- The merchant is responsible for delivering that link to the intended customer.
- Checkout must authorize the Vouch amount as a manual-capture direct charge on the connected business account.
- Checkout expires at the appointment timestamp. There is no additional authorization hour after the appointment.
- A first-time customer must save a reusable payment method during Checkout and create a Vouch account after authorization.
- The completed Checkout and subsequent authenticated claim associate the customer, Stripe payment state, and Vouch account with the Vouch.
- After association, the customer sees the customer version of the Vouch summary, details, status, and confirmation flow.

## Confirmation Protocol

- Confirmation window is one hour before appointment time through one hour after appointment time.
- Codes and confirmation controls are unavailable before the window, become available during the window, and become invalid and non-interactive when the window closes or capture succeeds.
- Each participant confirms by submitting the counterparty's valid code to the server.
- Both merchant and customer confirmations must be received and timestamped by the server inside the confirmation window.
- The second valid confirmation immediately triggers Stripe capture in that request path. Successful capture must not depend on cron or other external input.
- There is no offline or late-confirmation capture contingency for MVP. If confirmations do not reach the server inside the window, Vouch must not capture.
- Missing confirmations lead to Vouch expiration and cancellation or natural expiry of the authorization.
- After the window closes, codes are invalid, controls remain disabled, and the authorization must never become capturable.
- Double capture, double cancel, capture after cancel, and cancel after capture must be prevented by database state checks and Stripe idempotency keys.

## Recovery And Reconciliation

- Stripe webhooks are the primary asynchronous payment-state synchronization mechanism.
- Provider calls, webhook processing, and reconciliation must be idempotent.
- A failed immediate capture may create an operational retry and recovery snapshot.
- A technical capture retry is eligible only when bilateral confirmations were received inside the window and the immediate capture attempt failed.
- Reconciliation is a recovery and stale-state cleanup mechanism only. It must never be required for a normal bilateral confirmation capture.
- During the MVP Hobby deployment, reconciliation runs once daily.
- The daily job may retry eligible technical capture failures and clean up stale expiration or cancellation state, but it must never make an otherwise ineligible Vouch capturable.
- Technical recovery eligibility ends 24 hours after the appointment. After that cutoff, no capture may occur and any remaining authorization must be canceled or allowed to expire.

## Detail And Dashboard State

- Merchant and customer dashboards show role-appropriate Vouch invoice summaries and aggregate statistics.
- The Vouch detail page is the canonical participant view for countdown, status, timeline, amount, appointment, confirmation state, and role-appropriate actions.
- These surfaces must derive from canonical Prisma workflow state synchronized with Stripe payment truth.
- Time-sensitive controls must update automatically and server writes must independently enforce all time boundaries.

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
- No offline confirmation capture.
- No preview deployment environment.
- Development uses Stripe sandbox credentials and production uses Stripe live credentials.
- Stripe live configuration and live payment testing occur only after the complete sandbox lifecycle passes.
