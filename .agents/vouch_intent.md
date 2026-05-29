# Vouch Intent

Purpose: stable human-readable product doctrine for implementation agents and maintainers.

## Product Identity

Vouch is deterministic payment coordination infrastructure for real-world commitments. It coordinates conditional payment release through authenticated workflow state, Stripe-backed payment state, and bilateral presence confirmation.

Vouch asks one narrow question:

```txt
Did both authenticated participants successfully confirm presence inside the configured confirmation window?
```

If yes, settlement eligibility may proceed through Stripe. If no, funds do not release and provider-backed non-capture, cancellation, expiration, or refund behavior follows Stripe state.

## Core Rule

```txt
Both participants confirm presence inside the confirmation window
-> retrieve current Stripe provider state
-> capture the manual-capture PaymentIntent if provider state permits
-> settlement proceeds through Stripe Connect

Anything else
-> do not capture
-> cancel, expire, non-capture, or refund only according to provider state
```

Code generation alone does not create settlement eligibility. One-sided confirmation does not create settlement eligibility. Customer authorization means funds are held, not released. Merchant creation means protocol access was purchased, not that the customer is bound.

## Product Boundaries

Vouch is not a marketplace, broker, scheduler, messaging app, review platform, dispute-resolution system, evidence-review system, escrow provider, discovery platform, service directory, public profile system, claims product, or support-arbitrated settlement product.

Vouch has participants, not marketplace personas.

## Authority Model

```txt
Clerk owns authentication truth.
Stripe owns payment truth.
Vouch owns workflow truth.
Webhooks reconcile provider truth.
Outcome follows system state.
```

## User and Role Model

Every account starts as a Vouch user after Clerk sign-up and local Neon user sync. Users are not permanently separated into customer-only and merchant-only account types. Capabilities are additive.

A single authenticated user may be a customer on one Vouch and a merchant on another Vouch. Role is scoped to the specific Vouch.

Correct model:

```txt
User
-> customer capability when Stripe Customer/payment readiness is satisfied
-> merchant capability when Stripe Connect/payout readiness is satisfied
-> participant role per Vouch
```

## Capability Gates

Base protected access requires an authenticated Clerk session, local active User row, and current Vouch terms acceptance stored in Vouch DB.

Customer capability requires a Stripe Customer and payment readiness through Stripe-hosted flow. Customer-capable users may authorize payment participation and confirm presence when they are the customer participant. They may not create Vouches, receive payouts, force settlement, force refunds, or rewrite confirmation truth.

Merchant capability requires a Stripe connected account with sufficient onboarding, charge, and payout readiness. Merchant-capable users may create Vouches, pay the protocol fee, share the authorization link, confirm presence as merchant, and receive settlement through Stripe Connect when the protocol succeeds. They may not edit committed Vouches, cancel committed Vouches, force capture, force refund, or choose alternate payout rails.

## Lifecycle Intent

Canonical Vouch lifecycle:

```txt
draft
committed
sent
accepted
authorized
confirmable
completed
expired
```

Provider state, payment state, settlement state, archive state, webhook state, and recovery state are separate axes.

Do not pollute `VouchStatus` with `refunded`, `canceled`, `failed`, `voided`, `settled`, `provider_blocked`, `capture_failed`, `payout_restricted`, `archived`, or `recovery_required`.

## Creation Intent

A draft is local preparation. The merchant enters only amount, appointment date/time, and confirmation window. No customer is bound. No customer authorization exists. Drafts may be abandoned.

Commit is the immutability boundary. Commit occurs only after the merchant protocol fee is provider-confirmed as paid. At commit, Vouch freezes the amount, appointment, confirmation window, fee snapshot, participant role assumptions, and settlement rule version. Vouch writes audit events and recovery state.

After commit, a Vouch cannot be edited, renegotiated, canceled by user, reversed by user, rewritten, unsent, recalled, or altered.

## Authorization Link Intent

The merchant receives or can access a Stripe-hosted authorization link after commit. This is a Stripe Checkout Session URL, not a reusable Stripe Payment Link.

Vouch does not send the link to the customer and does not collect customer name/email at Vouch creation. The merchant distributes the link externally.

Link opens may be logged as safe custody events, but link opens are not invitation acceptance and are not settlement truth.

## Confirmation Intent

Presence confirmation is bilateral, role-aware, deterministic, and window-bound.

Participants physically exchange role codes. The merchant submits the customer code. The customer submits the merchant code. Only successful bilateral verification changes settlement eligibility.

Confirmation cannot be replaced by GPS, screenshots, uploaded evidence, support confirmation, admin confirmation, subjective fallback review, or manual override.

Offline-capable confirmation may exist only if server reconciliation can verify Vouch identity, participant identity, role correctness, confirmation-window membership, time-bucket validity, cryptographic derivation validity, bounded clock skew, and payload integrity.

## Payment Intent

The merchant protocol fee and customer protected authorization are separate Stripe transactions.

The customer-side canonical Stripe object is a manual-capture PaymentIntent. The PaymentIntent is the provider-side payment authorization lifecycle. The Vouch is the workflow-side commitment lifecycle.

Vouch must retrieve current Stripe state before capture, cancel, refund, retry, or provider reconciliation. Browser return URLs, local UI state, and stale database mirrors are not payment truth.

## Audit Intent

Vouch requires an append-only audit ledger for custody reconstruction, provider reconciliation, incident response, technical recovery, operational inspection, and legal defensibility.

Audit is not a participant-facing dispute system, evidence store, accusation store, or support judgment log. Audit events record deterministic system facts with safe, minimal metadata.

## Architecture Intent

The source tree is part of the product. Each file has one primary architectural role.

```txt
app/** selects route surfaces
features/** orchestrates route-level behavior
components/blocks/** assembles reusable presentation sections
components/** renders pure UI
components/ui/** owns primitives only
lib/fetchers/** owns protected reads
lib/actions/** owns user-triggered writes
lib/webhooks/** or lib/processors/** owns provider webhook orchestration
lib/db/selects/** owns minimal persistence read shapes
lib/dto/** or lib/mappers/** maps to DTOs
lib/db/transactions/** owns atomic mutation mechanics
lib/integrations/** owns external provider SDK adaptation
lib/auth/** owns authentication context
lib/authz/** owns permission and capability checks
schemas/** owns Zod validation
types/** owns transport-safe contracts
```

No layer may introduce discretionary settlement.

## Shipping Intent

The launch target is a secure, deterministic, auditable, provider-backed MVP that executes the narrow rule correctly. Everything outside the successful merchant fee, customer authorization, bilateral confirmation, idempotent capture, and audit loop is secondary.

## Final Intent Invariant

No stories. No screenshots. No appeals. No mediation. No subjective judgment. No manual settlement surface. No unilateral action forces release. No provider state is assumed locally. No important transition is unaudited.

Protocol is final. Outcome follows system state.
