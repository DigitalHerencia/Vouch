# Vouch PRD

## Product Summary

Vouch is a B2B SaaS protocol for appointment deposit authorization.

Businesses use Vouch to create commitment-backed appointment deposits. Customers authorize a deposit to the business before the appointment. The deposit can be captured only when the protocol state allows capture.

Vouch sells access to the protocol. Vouch does not collect, hold, route, escrow, or settle customer deposit funds.

## Core Product Model

- Businesses buy access to Vouch.
- Businesses are user-owned connected Stripe merchants.
- The connected business is the merchant of record.
- The connected business is liable for negative balances.
- Customer deposits are authorized to the connected business, not to Vouch.
- Vouch charges the business a separate one-time non-refundable protocol fee before issuing a customer deposit authorization link.
- Customer deposit capture requires bilateral protocol confirmation inside the confirmation window.

## Roles

### User

An authenticated Clerk-backed local user.

### Merchant

A user acting for a connected business that creates Vouches.

A merchant must complete Stripe-hosted Connect onboarding and have required charge and payout capabilities before creating Vouches.

### Customer

A user associated to a Vouch through a Vouch-specific customer authorization Checkout and authenticated claim flow.

A person is a customer because they are participating in a Vouch.

## Required Readiness

### Merchant Readiness

Merchant readiness is mandatory for creating Vouches.

A merchant must have:

- Connected-account onboarding complete.
- Charge capability available.
- Payout capability available.

Until Connect readiness is synchronized into Prisma, the new-Vouch form remains disabled with a connected-account onboarding call to action.

### Customer Participation Readiness

Customer readiness for a specific Vouch comes from:

1. Completing the Vouch-specific customer authorization Checkout.
2. Signing in or creating an account when needed.
3. Claiming the completed Checkout Session into the authenticated Vouch account.

## Payment Flows

There are two separate Stripe flows.

### Merchant Protocol Fee

- Merchant pays Vouch.
- Charge belongs to the platform account.
- Successful payment is required before the customer authorization link is issued.
- Successful payment activates the Vouch and makes the customer authorization link available.

### Customer Deposit Authorization

- Customer authorizes a deposit to the connected business.
- Payment is a Stripe Connect direct charge scoped to the connected account.
- PaymentIntent uses manual capture.
- Customer authorization must complete before the appointment timestamp.
- Deposit transaction must not include `application_fee_amount`.
- Deposit transaction must not include `transfer_data.destination`.
- Customer deposit funds must not route through the platform balance.

Do not collapse these flows into one charge, one PaymentIntent, one Checkout Session, one transfer, or one application fee.

## New Vouch Flow

The merchant-facing new-Vouch flow is a required wizard.

1. Per-Vouch disclaimer
   - Merchant explicitly accepts the disclaimer for each Vouch.
   - Acceptance and timestamp are persisted with the Vouch.
   - This is separate from a one-time account user agreement.

2. Appointment and amount
   - Merchant selects the appointment timestamp and Vouch amount.
   - A Vouch may be created only during the 24 hours immediately before a future appointment timestamp.
   - Confirmation opens one hour before and closes one hour after the appointment.

3. Review and protocol fee
   - Merchant reviews Vouch details and protocol fee.
   - Final action opens Stripe Checkout for the merchant protocol fee.
   - Successful payment routes to the new Vouch detail page and updates dashboard summaries/statistics.

The form remains disabled with a connected-account onboarding call to action until Connect readiness is complete.

## Customer Authorization Flow

After the merchant protocol fee succeeds, the merchant receives a Stripe-hosted customer authorization Checkout link associated with the Vouch public ID.

The merchant is responsible for delivering that link to the intended customer.

Expected customer flow:

1. Merchant sends Vouch authorization link.
2. Customer opens link.
3. Customer completes Stripe-hosted authorization Checkout for the Vouch deposit.
4. If not signed in, customer creates an account or signs in.
5. Customer returns to Checkout success/claim flow.
6. Completed Checkout Session is claimed by the authenticated user.
7. Customer is associated to the Vouch.
8. Vouch appears on the customer's dashboard.
9. Customer can view role-appropriate Vouch details and participate in confirmation.

Guest checkout without account creation is not approved for MVP. It may be reconsidered later, but it requires a separate product and security design.

## Confirmation Protocol

- Confirmation window opens one hour before appointment time and closes one hour after appointment time.
- Codes and confirmation controls are unavailable before the window.
- Codes and controls become available during the window.
- Codes become invalid and controls become non-interactive when the window closes or capture succeeds.
- Each participant confirms by submitting the counterparty's valid code to the server.
- Both merchant and customer confirmations must be received and timestamped by the server inside the confirmation window.
- The second valid confirmation immediately triggers Stripe capture in that request path.
- Successful capture must not depend on cron or other external input.
- There is no offline or late-confirmation capture contingency for MVP.
- Missing confirmations lead to Vouch expiration and cancellation or natural expiry of the authorization.
- Double capture, double cancel, capture after cancel, and cancel after capture must be prevented by database state checks and Stripe idempotency keys.

## Recovery And Reconciliation

Stripe webhooks are the primary asynchronous payment-state synchronization mechanism.

Provider calls, webhook processing, and reconciliation must be idempotent.

A failed immediate capture may create an operational retry and recovery snapshot.

A technical capture retry is eligible only when bilateral confirmations were received inside the window and the immediate capture attempt failed.

Reconciliation is recovery and stale-state cleanup only. It must never make an otherwise ineligible Vouch capturable.

During the MVP Hobby deployment, reconciliation runs once daily.

Technical recovery eligibility ends 24 hours after the appointment. After that cutoff, no capture may occur and any remaining authorization must be canceled or allowed to expire.

## Dashboard And Detail State

Merchant and customer dashboards show role-appropriate Vouch summaries and aggregate statistics.

The Vouch detail page is the canonical participant view for:

- Countdown.
- Status.
- Timeline.
- Amount.
- Appointment.
- Confirmation state.
- Role-appropriate actions.

These surfaces must derive from canonical Prisma workflow state synchronized with Stripe payment truth.

Time-sensitive controls must update automatically in the UI, but server writes independently enforce all time boundaries.

## Product Non-Goals

Do not build:

- Scheduling.
- Marketplace discovery.
- Provider directories.
- Public profiles.
- Messaging.
- Reviews.
- Ratings.
- Reputation.
- Dispute resolution.
- Appeals.
- Evidence uploads.
- Admin fund-award controls.
- Manual release overrides.
- Service outcome investigations.

Vouch owns workflow truth only. Stripe owns payment truth. Clerk owns auth truth.

## Launch Success Criteria

MVP succeeds when:

- A merchant can complete Connect onboarding.
- A merchant can create a Vouch after Connect readiness is synchronized.
- A merchant can pay the separate protocol fee.
- The customer authorization link is issued only after protocol fee success.
- A customer can authorize a Vouch deposit through connected-account direct-charge Checkout.
- A first-time customer can create/sign into an account and claim the Vouch.
- The customer can see the Vouch on their dashboard immediately after authenticated claim.
- Both parties can confirm inside the confirmation window.
- The second valid in-window confirmation triggers immediate capture.
- Missing, late, offline, or one-sided confirmation cannot capture.
- Reconciliation handles stale and recovery cases without granting new capture eligibility.
