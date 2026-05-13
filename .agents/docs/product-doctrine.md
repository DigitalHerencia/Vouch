# Vouch Product Doctrine

## Product definition

Vouch is deterministic payment coordination infrastructure for real-world commitments.

Vouch coordinates conditional payment release through authenticated workflow state, Stripe-backed payment state, and bilateral presence confirmation.

Vouch does not determine fault, honesty, service quality, legal correctness, intent, or moral blame.

Vouch determines whether both participants confirmed presence inside the configured confirmation window.

Outcome follows system state.

## Core doctrine

```txt
Vouch does not ask who is right.
Vouch asks what happened.

No stories.
No screenshots.
No appeals.
No mediation.
No subjective judgment.

If conditions are met, funds move.
If conditions fail, they do not.
```

Fraud thrives in ambiguity, exceptions, and manual intervention.

Vouch removes all three.

## Core settlement rule

```txt
both participants successfully confirm inside the confirmation window
-> PaymentIntent capture executes
-> settlement proceeds through Stripe Connect

anything else
-> PaymentIntent non-capture, cancellation, expiration, void, or refund according to provider state
```

Code generation alone means nothing.

One-sided confirmation means nothing for settlement.

Only successful bilateral verification changes settlement eligibility.

## What Vouch handles

Vouch handles:

```txt
authenticated workflow state
Vouch lifecycle state
appointment metadata
confirmation windows
bilateral presence confirmation
confirmation-code derivation
settlement eligibility decisions
capture orchestration
dashboard state
archive state
audit state
provider reconciliation
technical recovery state
```

## What Stripe handles

Stripe handles:

```txt
Checkout
payment authorization
payment method collection
billing details
manual-capture PaymentIntents
application fee processing
Stripe Customer management
Stripe Connect onboarding
KYC/compliance collection
payout banking collection
payout execution
provider payment state
provider settlement state
```

## What Clerk handles

Clerk handles:

```txt
authentication
sign-in
sign-up
session creation
session renewal
session security controls
account portal account management
auth provider lifecycle events
```

Clerk does not decide workflow truth.

## Shared user model

Vouch uses one shared user-account model.

Users are not permanently separated into merchant-only or customer-only accounts.

The same authenticated user may:

```txt
authorize payments as a customer
onboard through Stripe Connect
create Vouches as a merchant
receive payouts as a merchant
participate in different Vouches in different roles
```

Role is scoped to the Vouch.

## Merchant readiness

A merchant must complete:

```txt
authentication
active local Vouch account
current terms acceptance
Stripe Connect onboarding
payout readiness
identity/compliance requirements required by Stripe
```

before creating committed Vouches.

## Customer readiness

A customer must complete:

```txt
authentication
active local Vouch account
current terms acceptance
Stripe customer/payment-method readiness
billing readiness required by Stripe
```

before authorizing payment participation.

## Committed Vouch immutability

After committed creation, a Vouch cannot be:

```txt
edited
renegotiated
canceled by user
reversed by user
rewritten
unsent
recalled
altered
```

Once authorized, it becomes inert until settlement eligibility resolves.

Once completed or expired, it is terminal.

## Recovery doctrine

Committed Vouches create immutable recovery snapshots.

Snapshots contain:

```txt
original terms
provider references
fee snapshot
confirmation window
participant references
settlement rules
```

Recovery is internal-only.

Recovery does not permit:

```txt
term rewrite
manual settlement award
arbitration
human payout decision
support override
```

## Final invariant

```txt
Stripe owns payment truth.
Clerk owns authentication truth.
Vouch owns workflow truth.
Webhooks reconcile provider truth.
Outcome follows system state.
```
