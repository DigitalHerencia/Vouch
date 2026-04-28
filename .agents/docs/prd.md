# Vouch Product Requirements Document

## 1. Product Summary

Vouch is a commitment-backed payment coordination system for in-person appointments and agreements.

The product lets one party commit funds before a scheduled meeting, lets the other party accept the commitment, and releases or refunds the funds based on whether both parties confirm the meeting occurred.

## 2. One-Sentence Definition

Vouch ensures that money only moves when both people actually show up.

## 3. Core Thesis

People flake.

Businesses, freelancers, service providers, and individuals lose time and money when someone books time, requests availability, or agrees to meet, then fails to appear.

Vouch solves this by making attendance financially meaningful without becoming a marketplace, broker, scheduler, messaging platform, or dispute-resolution system.

## 4. Product Category

Vouch is a:

- commitment-backed payment layer
- no-show protection tool
- conditional payment coordination system
- presence-confirmed release mechanism

Vouch is not:

- a marketplace
- a booking marketplace
- a social network
- a review platform
- an escrow provider
- a broker
- a service facilitator
- a scheduling suite
- a messaging system
- a dispute-resolution platform

## 5. Target Users

### 5.1 Primary Users

#### Service Providers

Independent professionals who lose money when clients no-show.

Examples:

- consultants
- freelancers
- tattoo artists
- barbers
- photographers
- trainers
- tutors
- home service providers
- appointment-based operators

#### Clients / Payers

People who want to demonstrate serious intent before receiving someone's time, service, or availability.

### 5.2 Secondary Users

#### Individuals

Two people who already arranged an in-person agreement outside Vouch and want a neutral commitment mechanism.

#### Small Businesses

Operators that already manage their own scheduling but need financial commitment without rebuilding payment infrastructure.

## 6. Internal Roles

Vouch has two core transaction roles.

### Payer

The payer:

- creates the Vouch
- commits funds
- defines the amount
- defines the meeting window
- shares or assigns the Vouch
- confirms presence
- may receive refund if confirmation fails

### Payee

The payee:

- receives or opens a Vouch
- accepts the Vouch
- confirms presence
- receives funds when both parties confirm

## 7. External Language

Internal system language may use:

- payer
- payee
- Vouch
- confirmation
- release
- refund

External product language should prefer:

- client
- provider
- appointment
- commitment
- no-show protection
- attendance confirmation
- commitment-backed payment

Avoid language that implies:

- escrow
- deposits held by Vouch
- marketplace matching
- service facilitation
- dispute judgment
- guaranteed safety
- background investigation
- legal arbitration

## 8. Problem Statement

People commit to appointments casually because most appointment systems do not impose meaningful consequences for no-shows.

Existing tools fail in different ways:

### Payment Apps

Payment apps move money but do not enforce conditional release.

### Scheduling Tools

Scheduling tools reserve time but do not meaningfully guarantee attendance.

### Manual Deposits

Manual deposits are inconsistent, operationally messy, and can create trust issues.

### Marketplaces

Marketplaces are too heavy and introduce liability, matching, profiles, reviews, moderation, and category-specific risk.

## 9. Product Goals

### 9.1 Primary Goal

Create a simple, deterministic system for commitment-backed in-person payment release.

### 9.2 Secondary Goals

- reduce appointment no-shows
- reduce last-minute cancellation losses
- eliminate ambiguous deposit arrangements
- avoid human dispute resolution
- keep the product legally and operationally narrow
- make every transaction outcome predictable
- keep users clear on what happens next

## 10. Non-Goals

Vouch must not become a general-purpose marketplace or business operating system.

The MVP must not include:

- user discovery
- public provider profiles
- public client profiles
- search
- categories
- reviews
- ratings
- comments
- in-app messaging
- scheduling calendars
- CRM features
- service listings
- bidding
- recommendations
- boosted placements
- dispute workflows
- manual arbitration
- user reputation scores
- social feeds
- AI matching
- AI negotiation
- open-ended transaction descriptions

If a feature requires Vouch to understand, rank, recommend, categorize, promote, or judge the underlying interaction, it is outside scope.

## 11. Core User Promise

For providers:

> Protect your time with commitment-backed payments.

For clients:

> Show serious intent without relying on informal deposits.

For both parties:

> The result is automatic: both confirm, funds release. Otherwise, funds return.

## 12. Core Mechanism

A Vouch is a conditional payment agreement between two verified adults.

Lifecycle:

1. Payer creates a Vouch.
2. Payer commits payment.
3. Payee accepts the Vouch.
4. Both parties meet during the defined window.
5. Both parties confirm presence.
6. Funds release if both confirmed.
7. Funds refund if confirmation fails or expires.

## 13. MVP Scope

The MVP includes only the minimum system needed to prove the core mechanism.

### Included

- account creation
- authentication
- adult / identity verification workflow
- Stripe Connect onboarding for payout recipients
- Vouch creation
- Vouch sharing or recipient assignment
- Vouch acceptance
- payment authorization or capture flow
- manual dual confirmation
- Vouch detail status page
- automated release/refund resolution
- basic notification emails
- basic admin visibility
- audit/event logging
- deterministic status transitions

### Deferred

- GPS proximity automation
- recurring Vouches
- group Vouches
- API access
- calendar integrations
- provider scheduling tools
- public profile pages
- advanced admin moderation
- manual dispute tooling
- SMS notifications
- native mobile apps

## 14. Functional Requirements

### 14.1 Authentication

Users must be able to:

- sign up
- sign in
- sign out
- manage session state
- access only their own Vouches

The system must:

- enforce authentication server-side
- prevent unauthenticated users from creating, accepting, confirming, releasing, or viewing protected Vouch records

### 14.2 Verification

Users must complete required verification before participating in payment-bearing Vouch flows.

Verification must include:

- identity status
- adult eligibility status
- payout readiness where applicable
- payment method readiness where applicable

The product must clearly show whether the user can:

- create a Vouch
- accept a Vouch
- receive funds
- confirm presence
- resolve a Vouch

### 14.3 Create Vouch

The payer must be able to create a Vouch with:

- amount
- recipient or share link
- meeting start time
- meeting expiration time
- optional short label visible to both parties
- required acceptance of Vouch terms

Creation must result in a Vouch record with a deterministic initial state.

### 14.4 Accept Vouch

The payee must be able to:

- open a Vouch invite
- review amount and meeting window
- sign in or create account
- complete verification if needed
- accept or decline the Vouch

Acceptance must:

- bind the payee to the Vouch
- move the Vouch into an active state
- preserve an audit event
- prevent another user from accepting the same Vouch

### 14.5 Confirm Presence

Both parties must be able to confirm presence during the valid confirmation window.

The MVP confirmation method is manual dual confirmation.

The future confirmation method may include GPS proximity, but GPS must not be required for the MVP.

Rules:

- one-sided confirmation is insufficient
- both confirmations must occur within the valid window
- confirmation after expiration must not release funds
- confirmation must be recorded as an event
- users must see whether the other party has confirmed

### 14.6 Resolve Vouch

Resolution must be deterministic.

If both parties confirm within the window:

- Vouch completes
- funds release to payee
- payer sees completed status
- payee sees payout status

If both parties do not confirm within the window:

- Vouch expires
- funds refund or are not captured
- payer sees refund status
- payee sees expired status

If payment processing fails:

- Vouch enters a payment-failed or resolution-failed state
- user-facing copy explains the next system step
- the system records the failure event

### 14.7 Notifications

MVP notifications should include:

- Vouch invitation sent
- Vouch accepted
- confirmation window opening
- confirmation received
- Vouch completed
- Vouch expired/refunded
- payment failure

Notifications must not include sensitive transaction-purpose language.

### 14.8 Admin Visibility

Admin views may show:

- users
- Vouches
- statuses
- payment references
- verification status summaries
- event history
- error states

Admin views must not become arbitration tooling.

Admins should not manually decide who deserves funds.

## 15. System States

The human-readable domain model uses these core states:

### Pending

Vouch created but not accepted.

### Active

Vouch accepted and awaiting confirmation window or currently confirmable.

### Completed

Both parties confirmed and funds released.

### Expired

Confirmation requirement was not satisfied before expiration.

### Refunded

Funds were returned or capture was not completed after expiration/failure.

### Canceled

A Vouch was canceled before becoming active, if cancellation is allowed by contract.

### Failed

A technical or payment failure prevented normal resolution.

Implementation contracts may split or refine these states, but must preserve the core meaning.

## 16. Business Rules

### 16.1 Dual Confirmation Rule

Funds release only when both parties confirm within the valid window.

### 16.2 Default Refund Rule

If dual confirmation does not happen, the default outcome is refund or non-capture.

### 16.3 No Arbitration Rule

The platform does not decide who is telling the truth.

### 16.4 No Marketplace Rule

The platform does not help users find, rank, choose, review, or message each other.

### 16.5 No Purpose Inspection Rule

The platform does not require the user to describe the underlying meeting purpose.

### 16.6 No Custody Rule

The platform must use payment-provider-supported flows and must not directly custody user funds.

### 16.7 Verified Users Rule

Payment-bearing actions require the relevant user verification state.

## 17. Payment Requirements

Payment infrastructure must:

- use Stripe Connect or equivalent provider-supported flows
- avoid platform custody
- support release/refund outcome logic
- record external payment identifiers
- record payment status
- handle payment failures predictably
- avoid language that implies legal escrow unless reviewed by counsel

The exact Stripe primitive must be selected during technical implementation with compliance review.

Potential approaches include:

- authorization and capture
- destination charges
- separate charges and transfers
- Connect payout orchestration

The docs must not overstate legal status.

## 18. Compliance Requirements

Vouch must be built around conservative positioning.

The product must:

- require verified adults for payment-bearing flows
- preserve terms acceptance
- avoid marketplace behavior
- avoid user-generated service listings
- avoid facilitating restricted categories
- avoid holding itself out as an escrow service
- maintain audit records
- provide clear refund/release terms
- support account deactivation and data handling policies

All payment and regulatory assumptions must be reviewed by qualified counsel before production launch.

## 19. UX Requirements

The interface must feel:

- serious
- clear
- fast
- neutral
- trustworthy
- low-friction

The interface must avoid:

- gamification
- playful financial language
- dark patterns
- hidden status
- ambiguous next steps
- vague release/refund messaging

Every Vouch detail screen must answer:

- who is involved
- what amount is committed
- what state the Vouch is in
- what action is available
- what happens if no action occurs
- when the Vouch expires
- what the final outcome was

## 20. MVP Pages

Required pages:

- marketing landing page
- sign-in / sign-up
- verification required page
- dashboard
- create Vouch
- invite / accept Vouch
- Vouch detail
- confirmation page or confirmation section
- payment setup
- payout setup
- account settings
- admin overview
- admin Vouch detail
- legal pages

## 21. Metrics

Track:

- users created
- users verified
- Vouches created
- Vouches accepted
- Vouches confirmed by payer
- Vouches confirmed by payee
- Vouches completed
- Vouches expired
- Vouches refunded
- payment failures
- average Vouch value
- fee revenue
- completion rate
- refund rate
- time to acceptance
- time to confirmation
- drop-off at verification
- drop-off at payment setup
- support contacts per completed Vouch

## 22. Monetization

Initial monetization model:

- minimum platform fee per Vouch
- percentage-based platform fee per Vouch

Recommended starting model:

- $5 minimum
- 5% platform fee

Fees must be shown clearly before payment commitment.

## 23. Success Criteria

The MVP is successful if:

- users can create and complete Vouches without support
- release/refund outcomes are correct
- users understand the confirmation rules
- no human arbitration is required
- providers understand the no-show protection value
- clients understand the commitment model
- payment failures are rare and recoverable
- verification drop-off does not destroy activation

## 24. Failure Criteria

The product is failing if:

- users ask what happens after each step
- users believe Vouch guarantees safety or service quality
- users think Vouch holds funds directly
- admins must manually judge disputes
- users need messaging, reviews, or profiles to understand the product
- completion/refund logic becomes ambiguous
- payment failures require manual database intervention
- the UI hides expiration or confirmation status

## 25. Product Constraints

Vouch must stay narrow.

Every proposed feature must pass this test:

> Does this feature directly improve commitment-backed payment release without turning Vouch into a marketplace, broker, scheduler, social platform, or arbitrator?

If no, it does not belong in MVP.

## 26. Open Questions

These require resolution before production launch:

- Which exact Stripe Connect flow best satisfies no-custody and release/refund requirements?
- What verification provider or Stripe identity workflow should be used?
- What countries/states are launch-eligible?
- What legal language is required for "commitment-backed payment" without implying escrow?
- What refund timing should users expect after expiration?
- Should payer cancellation be allowed before payee acceptance?
- Should payee decline trigger immediate refund/non-capture?
- What minimum and maximum Vouch amounts should be allowed?
- What confirmation window constraints should be enforced?
