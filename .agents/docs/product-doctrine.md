# Vouch Product Doctrine

## Product definition

Vouch is deterministic payment coordination infrastructure for real-world commitments.

Vouch coordinates conditional payment release through authenticated workflow state, Stripe-backed payment state, and bilateral presence confirmation.

Vouch does not determine fault, honesty, service quality, legal correctness, intent, or moral blame.

Vouch determines whether both participants confirmed presence inside the configured confirmation window.

Outcome follows system state.

## Core doctrine

Vouch does not ask who is right.

Vouch asks what happened.

No stories.

No screenshots.

No appeals.

No mediation.

No subjective judgment.

If conditions are met, funds move.

If conditions fail, they do not.

Fraud thrives in ambiguity, exceptions, and manual intervention.

Vouch removes all three.

## Core settlement rule

Both participants successfully confirm inside the confirmation window:

PaymentIntent capture executes.

Settlement proceeds through Stripe Connect.

Anything else:

PaymentIntent non-capture, cancellation, expiration, void, or refund occurs according to provider state.

Code generation alone means nothing.

One-sided confirmation means nothing for settlement.

Only successful bilateral verification changes settlement eligibility.

## What Vouch handles

Vouch handles:

- authenticated workflow state
- Vouch lifecycle state
- appointment metadata
- confirmation windows
- bilateral presence confirmation
- confirmation-code derivation
- settlement eligibility decisions
- capture orchestration
- dashboard state
- archive state
- audit state
- provider reconciliation
- technical recovery state

Vouch does not handle:

- marketplace discovery
- scheduling
- messaging
- reviews
- ratings
- disputes
- evidence review
- arbitration
- manual awards
- support overrides
- manual confirmation rewrites
- public profiles
- service listings

## What Stripe handles

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

Stripe owns payment truth.

Vouch mirrors Stripe payment state and combines provider truth with workflow truth to determine deterministic outcome.

Vouch must retrieve current Stripe provider state before settlement-critical operations.

## What Clerk handles

Clerk handles:

- authentication
- sign-in
- sign-up
- session creation
- session renewal
- session security controls
- account portal account management
- auth provider lifecycle events

Clerk owns authentication truth.

Clerk does not decide workflow truth.

Clerk does not decide payment truth.

Clerk does not decide settlement eligibility.

## Shared user model

Vouch uses one shared user-account model.

Users are not permanently separated into merchant-only or customer-only accounts.

The same authenticated user may:

- authorize payments as a customer
- onboard through Stripe Connect
- create Vouches as a merchant
- receive payouts as a merchant
- participate in different Vouches in different roles

Role is scoped to the Vouch.

A user may be merchant on one Vouch and customer on another.

Vouch has participants, not marketplace personas.

## Merchant readiness

A merchant must complete:

- authentication
- active local Vouch account
- current terms acceptance
- Stripe Connect onboarding
- payout readiness
- identity/compliance requirements required by Stripe

before creating committed Vouches.

The merchant independently arranges the real-world appointment outside Vouch.

The merchant is not discovered through Vouch.

The merchant is not a marketplace provider.

## Customer readiness

A customer must complete:

- authentication
- active local Vouch account
- current terms acceptance
- Stripe customer/payment-method readiness
- billing readiness required by Stripe

before authorizing payment participation.

The customer independently receives the Vouch link through an external communication channel.

The customer is not matched by Vouch.

Vouch does not operate messaging, discovery, negotiation, or scheduling.

## Committed Vouch immutability

After committed creation, a Vouch cannot be:

- edited
- renegotiated
- canceled by user
- reversed by user
- rewritten
- unsent
- recalled
- altered

Once authorized, it becomes inert until settlement eligibility resolves.

Once completed or expired, it is terminal.

The committed Vouch lifecycle is protocol-controlled.

No participant can force settlement.

No participant can force refund.

No support or admin actor can rewrite confirmation truth.

## Confirmation doctrine

Presence confirmation is bilateral, role-aware, and window-bound.

When the confirmation window opens, participants may derive or view short-lived role-specific confirmation codes.

Participants physically exchange codes.

The merchant submits the customer code.

The customer submits the merchant code.

Only bilateral successful verification changes settlement eligibility.

Confirmation must not be replaced by:

- GPS confirmation
- manual support confirmation
- screenshots
- uploaded evidence
- arbitration
- fallback subjective methods
- admin override

After bilateral confirmation succeeds:

- confirmation state locks permanently
- confirmations cannot be reversed
- confirmations cannot be deleted
- confirmations cannot be retried
- confirmations cannot be replaced

There is no undo, appeal, correction flow, or support override.

## Non-capture doctrine

Anything other than successful bilateral confirmation results in non-capture behavior whenever possible.

Examples:

- neither participant confirms
- only one participant confirms
- confirmation occurs outside the confirmation window
- confirmation validation fails
- provider authorization expires
- provider state invalidates settlement eligibility

In these cases:

- capture does not occur
- settlement does not occur
- provider expiration, cancellation, void, or refund behavior proceeds according to Stripe state

Vouch prefers non-capture over refund whenever possible.

Refund is a provider-backed fallback for already-captured funds.

Refund is not a discretionary remedy.

## Recovery doctrine

Committed Vouches create immutable recovery snapshots.

Snapshots contain:

- original terms
- provider references
- fee snapshot
- confirmation window
- participant references
- settlement rules

Recovery is internal-only.

Recovery is non-user-facing.

Recovery is restoration-only.

Recovery does not permit:

- term rewrite
- manual settlement award
- arbitration
- human payout decision
- support override
- confirmation rewrite
- participant replacement
- alternate payment rail

Technical recovery restores original committed state after technical failure.

Technical recovery does not decide who is right.

## Audit doctrine

Every important transition writes an audit event.

Audit is append-only.

Audit is not a dispute system.

Audit records deterministic system facts.

Audit must not store:

- subjective allegations
- evidence content
- screenshots
- message content
- raw provider payloads
- raw Clerk payloads
- raw Stripe objects
- raw identity documents
- raw card data
- raw bank data
- support judgment

Participant-facing timelines receive only participant-safe audit items.

## Final invariant

Stripe owns payment truth.

Clerk owns authentication truth.

Vouch owns workflow truth.

Webhooks reconcile provider truth.

Outcome follows system state.

No unilateral action forces settlement.

No discretion surface exists to exploit.

Protocol is final.
