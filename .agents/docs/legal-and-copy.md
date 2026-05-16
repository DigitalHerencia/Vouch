# Vouch Legal and Copy Contract

## Legal positioning

Vouch is deterministic payment coordination infrastructure.

Vouch enables conditional payment release based on mutual confirmation of an in-person meeting.

Vouch coordinates protocol-defined payment outcomes through authenticated workflow state, provider-backed payment state, and bilateral presence confirmation.

Vouch does not determine fault, honesty, service quality, legal correctness, intent, or moral blame.

Vouch determines whether both participants confirmed presence inside the configured confirmation window.

Outcome follows system state.

## What Vouch is not

Vouch does not:

- arrange meetings
- facilitate services
- act as broker
- act as agent
- act as intermediary
- act as marketplace
- act as scheduler
- provide discovery
- provide public profiles
- provide messaging
- mediate disputes
- investigate claims
- review evidence
- review screenshots
- arbitrate outcomes
- reverse completed outcomes through Vouch discretion
- manually award funds
- manually rewrite confirmation truth
- provide support overrides
- endorse users
- verify meeting purpose
- guarantee safety
- guarantee legality
- guarantee legitimacy
- guarantee performance
- guarantee services
- guarantee outcomes

Users independently arrange all interactions outside the platform.

## Account-level agreement

At signup, users must accept:

- User Agreement
- Terms of Service
- Privacy Policy

Account-level agreement must be persisted in Vouch DB.

Do not store terms acceptance only in Clerk metadata.

Clerk authentication does not equal Vouch terms acceptance.

Per-Vouch disclaimer acceptance is separate from account-level agreement.

## Per-Vouch disclaimer

Before creating or accepting a Vouch, users must explicitly accept transaction-specific conditional payment terms.

The per-Vouch disclaimer must state:

- payment is conditional
- payment is governed by Vouch automated release rules
- funds release only if both parties confirm presence inside the configured confirmation window
- code generation alone does not release funds
- one-sided confirmation does not release funds
- funds return, are not captured, are canceled, expire, are voided, or are refunded according to provider state if confirmation fails within the allowed time
- Stripe or equivalent provider state determines available payment operations
- Vouch does not verify meeting purpose
- Vouch does not guarantee performance, services, safety, legality, legitimacy, or outcomes
- Vouch does not mediate disputes
- Vouch does not review evidence
- Vouch does not reverse completed outcomes through discretion
- transaction is final once protocol conditions are met
- user enters agreement at their own risk

## Privacy posture

Vouch collects only what is needed to:

- operate the platform
- verify identity where required
- process payments
- enable confirmation
- prevent fraud/abuse
- comply with legal obligations
- reconcile provider state
- maintain audit history

Vouch should not collect or store:

- meeting purpose
- details of what users are doing
- message content
- evidence content
- screenshots
- raw card data
- raw bank data
- raw identity documents
- raw KYC payloads
- full provider payloads
- raw Clerk payloads
- raw Stripe objects

Vouch stores safe provider references and normalized provider state only.

## Third-party services

Stripe or equivalent providers handle payment processing.

Stripe handles:

- Checkout
- payment authorization
- payment method collection
- billing details
- manual-capture PaymentIntents
- application fee processing
- Stripe Customer management
- Stripe Connect onboarding
- KYC/compliance collection
- payout banking collection
- payout execution
- provider payment state
- provider settlement state

Identity providers may handle KYC/verification.

Clerk handles authentication.

Clerk handles:

- sign-in
- sign-up
- session creation
- session renewal
- session security controls
- account portal account management
- auth provider lifecycle events

Vouch does not replace Stripe payment truth or Clerk authentication truth.

## Provider truth language

Use this consistently:

- Stripe owns payment truth.
- Clerk owns authentication truth.
- Vouch owns workflow truth.
- Webhooks reconcile provider truth.
- Outcome follows system state.

Do not imply that browser redirects, UI state, local optimism, or participant claims determine payment truth.

## Copy spine

Use this language consistently:

Vouch doesn’t ask who’s right.

Vouch asks what happened.

No stories.

No screenshots.

No appeals.

No mediation.

No subjective judgment.

Vouch is deterministic payment coordination infrastructure.

Outcome follows system state.

No unilateral action forces settlement.

The rule is known before money moves.

Protocol is final.

## Core marketing line

Deterministic trust infrastructure for real-world commitments.

## Supporting copy

At Vouch, we mind our business. Not yours.

We do not pry.

We do not mediate.

We do not build surveillance systems disguised as trust.

Vouch aligns intent, accountability, and outcome by protocol.

Quietly private.

Mutually explicit.

Economically meaningful.

## Moat language

Anyone can copy software.

Copying trust infrastructure is harder.

Meaning:

- system design
- incentives
- operational integrity
- deterministic execution
- provider-backed payment rails
- immutable audit state

## Forbidden copy

Do not describe Vouch as:

- escrow
- marketplace
- broker
- scheduler
- dating app
- service directory
- provider search
- review platform
- messaging platform
- dispute platform
- arbitration tool
- payment guarantee
- safety guarantee
- fraud investigation tool
- evidence review system
- claim resolution system
- manual payout platform

Prefer:

- payment coordination
- commitment-backed workflow
- deterministic protocol
- provider-backed settlement logic
- conditional release
- bilateral confirmation
- non-discretionary execution
- authenticated workflow state
- protocol-defined outcome
- provider-backed payment state

## Status and consequence copy

Every status must explain:

- what happened
- what happens next
- what cannot happen
- who can act
- what consequence applies

Do not rely on color alone.

Do not use ambiguous terms that imply review, judgment, discretion, or support intervention.

Avoid:

- under review
- claim pending
- dispute opened
- support reviewing
- awaiting decision
- evidence submitted
- payout requested

Prefer:

- waiting for authorization
- payment authorized
- confirmation window open
- merchant confirmed
- customer confirmed
- bilateral confirmation complete
- confirmation incomplete
- provider state prevents capture
- non-capture pending
- completed
- expired
- archived

## Final legal and copy invariant

Vouch language must preserve the product boundary.

No copy may imply that Vouch decides who is right.

No copy may imply that Vouch guarantees safety, performance, legality, legitimacy, or payment outcome beyond protocol rules and provider state.

No copy may imply a manual discretion surface.

The rule is known before money moves.

Outcome follows system state.
