# Vouch Legal and Copy Contract

## Legal positioning

Vouch is a payment coordination platform.

Vouch enables conditional payment release based on mutual confirmation of an in-person meeting.

Vouch does not:

```txt
arrange meetings
facilitate services
act as broker
act as agent
act as intermediary
mediate disputes
investigate claims
reverse completed outcomes through Vouch discretion
endorse users
verify meeting purpose
guarantee safety
guarantee legality
guarantee legitimacy
```

Users independently arrange all interactions outside the platform.

## Account-level agreement

At signup, users must accept:

```txt
User Agreement
Terms of Service
Privacy Policy
```

Account-level agreement must be persisted in Vouch DB.

Do not store terms acceptance only in Clerk metadata.

## Per-Vouch disclaimer

Before creating or accepting a Vouch, users must explicitly accept transaction-specific conditional payment terms.

The per-Vouch disclaimer must state:

```txt
payment is conditional
payment is governed by Vouch automated release rules
funds release only if both parties confirm presence
funds return/non-capture if confirmation fails within the allowed time
Vouch does not verify meeting purpose
Vouch does not guarantee performance, services, or outcomes
Vouch does not mediate disputes
transaction is final once protocol conditions are met
user enters agreement at their own risk
```

## Privacy posture

Vouch collects only what is needed to:

```txt
operate the platform
verify identity where required
process payments
enable confirmation
prevent fraud/abuse
comply with legal obligations
```

Vouch should not collect or store:

```txt
meeting purpose
details of what users are doing
message content
evidence content
screenshots
raw card data
raw bank data
raw identity documents
raw KYC payloads
full provider payloads
```

## Third-party services

Stripe or equivalent providers handle payment processing.

Identity providers may handle KYC/verification.

Clerk handles authentication.

Vouch stores safe provider references and normalized provider state only.

## Copy spine

Use this language consistently:

```txt
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
```

## Core marketing line

```txt
Deterministic trust infrastructure for real-world commitments.
```

## Supporting copy

```txt
At Vouch, we mind our business. Not yours.

We do not pry.
We do not mediate.
We do not build surveillance systems disguised as trust.

Vouch aligns intent, accountability, and outcome by protocol.

Quietly private.
Mutually explicit.
Economically meaningful.
```

## Moat language

```txt
Anyone can copy software.
Copying trust infrastructure is harder.
```

Meaning:

```txt
system design
incentives
operational integrity
deterministic execution
provider-backed payment rails
immutable audit state
```

## Forbidden copy

Do not describe Vouch as:

```txt
escrow
marketplace
broker
scheduler
dating app
service directory
provider search
review platform
messaging platform
dispute platform
arbitration tool
payment guarantee
safety guarantee
```

Prefer:

```txt
payment coordination
commitment-backed workflow
deterministic protocol
provider-backed settlement logic
conditional release
bilateral confirmation
non-discretionary execution
```
