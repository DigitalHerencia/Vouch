# Vouch Stripe Architecture Decision

Date: 2026-04-28

Source references:

- `.agents/stripe/Blue Prints.md`
- `.agents/stripe/stripe-connect-integration.md`
- `.agents/stripe/Disclaimer.md`
- `.agents/stripe/Terms of Service.md`
- `.agents/stripe/User Agreement.md`
- `.agents/contracts/domain-model.yaml`
- `.agents/contracts/acceptance-gates.yaml`

## Decision

Vouch uses Stripe as a provider-backed payment coordination layer. Vouch does not hold funds directly, does not arbitrate disputes, and must not describe itself as escrow or as a marketplace in product copy.

The payment architecture is:

1. Create a Vouch and record the commitment.
2. The invited payee accepts only after payout readiness is verified.
3. Stripe authorization is provider-confirmed before Vouch is treated as payment-backed.
4. If both participants confirm presence inside the confirmation window, the system captures/releases funds through Stripe.
5. If confirmation does not complete in time, the system cancels the authorization, leaves funds uncaptured, or refunds according to provider state.

Release and refund are system resolution operations. They must not be user-award, admin-award, dispute, or manual override flows.

## Stripe Connect Model

Vouch should use Stripe Connect Accounts v2 for payee payout readiness:

- `POST /v2/core/accounts`
- `dashboard: "express"`
- `defaults.responsibilities.fees_collector: "application"`
- `defaults.responsibilities.losses_collector: "application"`
- recipient transfer capability requested under `configuration.recipient.capabilities.stripe_balance.stripe_transfers`
- account links for hosted onboarding
- webhook reconciliation for account requirement and capability changes

Stripe documentation and blueprints may use the word "marketplace" as Connect taxonomy. Vouch product code, routes, UI, and user-facing copy must not adopt marketplace behavior or marketplace language.

## PaymentIntent Timing

The Stripe blueprint shows an immediate Checkout destination-charge example. That example is not directly sufficient for Vouch because Vouch requires conditional release after dual confirmation.

For Vouch, the provider flow must preserve delayed release semantics:

- Use PaymentIntents with `capture_method: "manual"` for payment-backed Vouches.
- Mark local payment `authorized` only after Stripe confirms an authorizable state such as `requires_capture`.
- Do not treat PaymentIntent creation as authorization.
- Do not capture/release funds from participant-callable actions.
- Attach Connect destination and application fee parameters only at Stripe-supported stages for the selected charge flow.

Open implementation decision:

- Preferred sequencing is to create/confirm the manual PaymentIntent after payee acceptance, because the connected account destination is known at that point.
- Creating a platform-only authorization before payee acceptance and transferring later is less aligned with the no-custody posture and needs payment/legal review before use.
- Immediate Checkout destination charges without delayed capture are not acceptable for Vouch's dual-confirmation release rule.

## Fee Model

Vouch fees are server-calculated and immutable per Vouch:

- Platform fee rate: 5%.
- Minimum platform fee: $5.00.
- Store `platformFeeCents` on Vouch and PaymentRecord.
- Show fees before payment commitment.
- Do not accept client-calculated fee values as authoritative.

Where compatible with the selected Connect charge flow, collect the platform fee through Stripe-supported application fee mechanics.

## Refund, Void, And Non-Capture

Resolution must follow provider state:

- Before capture: cancel the manual PaymentIntent or leave funds uncaptured according to Stripe state.
- After capture: create a Stripe refund when provider reversal is required.
- Record the local outcome in PaymentRecord, RefundRecord, AuditEvent, and participant-safe notification events.
- Do not expose admin actions that decide who deserves funds.

## Code Paths

Primary implementation paths:

- `lib/integrations/stripe/client.ts`
- `lib/integrations/stripe/connect.ts`
- `lib/integrations/stripe/identity.ts`
- `lib/integrations/stripe/payment-intents.ts`
- `lib/integrations/stripe/webhooks.ts`
- `lib/payments/adapters/stripe-payment-adapter.ts`
- `lib/actions/paymentActions.ts`
- `lib/actions/vouchActions.ts`
- `lib/payments/webhooks/process-stripe-webhook.ts`
- `lib/verification/webhooks/process-stripe-identity-webhook.ts`
- `lib/jobs/expire-vouches.ts`
- `lib/jobs/reconcile-payments.ts`
- `prisma/schema.prisma`

## Phase 2 Acceptance Criteria

- Stripe readiness is reconciled from provider state, not return URLs.
- Payout readiness is reconciled from Accounts v2 capability/status state.
- Payment authorization is local `authorized` only after Stripe confirms authorization.
- Capture/release is system-only and dual-confirmation gated.
- Cancel/refund is idempotent and provider-state aware.
- Webhook processing is idempotent and writes audit events.
- Vouch copy continues to avoid escrow, dispute, judge, review, rating, marketplace, and broker language.
