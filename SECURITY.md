
# Security Policy

## Supported Versions

Security fixes are applied to the active development branch and current production deployment.

| Version            | Supported |
| ------------------ | --------- |
| current production | yes       |
| active main branch | yes       |
| archived branches  | no        |

## Reporting a Vulnerability

Do not open a public GitHub issue for a suspected vulnerability.

Report security concerns to:

* security@example.com

Include:

* affected route, API route, webhook, or provider integration
* reproduction steps
* expected impact
* whether data, payment state, authz, or lifecycle state may be affected
* relevant logs with secrets removed
* whether the issue affects local, preview, or production

## High-Risk Areas

Pay special attention to:

* Clerk session handling
* Clerk webhook verification
* Stripe webhook verification
* Stripe / Connect payment state transitions
* authorization checks for Vouch participants
* admin operational views
* confirmation-window logic
* duplicate confirmation prevention
* invite token hashing
* server actions
* Prisma transaction boundaries
* audit logging
* rate limiting

## Non-Negotiables

The project must not store:

* raw card data
* raw identity documents
* full provider payloads
* secrets
* plaintext invite tokens
* unnecessary payment metadata
* private dispute/evidence artifacts

## Disclosure Expectations

Give maintainers reasonable time to investigate and patch before public disclosure.

## Out of Scope

The following are not security vulnerabilities by themselves:

* missing marketplace features
* lack of public profiles
* lack of messaging
* lack of reviews
* lack of dispute resolution
* lack of manual fund-award controls

Those omissions are intentional product boundaries.