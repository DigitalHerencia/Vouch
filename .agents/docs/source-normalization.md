# Vouch Source Normalization

## 1. Purpose

This document normalizes the human meaning of Vouch into canonical domain concepts.

It exists so future contracts, instructions, schemas, routes, and implementation tasks use the same language.

This is not a YAML contract. It is the human-readable normalization layer.

## 2. Normalization Rule

Every Vouch domain concept must normalize into:

- entities
- actors
- actions
- states
- permissions
- events
- outcomes
- constraints

No implementation layer should invent new terminology when a canonical term already exists here.

## 3. Core Domain Sentence

A Vouch is a commitment-backed payment agreement between two verified parties where funds release only if both parties confirm presence during a defined time window.

## 4. Canonical Entities

### 4.1 User

A person with an authenticated account.

A User may become a payer, payee, or admin depending on context and permissions.

### 4.2 Vouch

The central agreement object.

A Vouch records:

- payer
- payee or invite state
- amount
- currency
- meeting/confirmation window
- lifecycle status
- payment status
- confirmation status
- audit history

### 4.3 Payer

The participant who creates the Vouch and commits funds.

### 4.4 Payee

The participant who accepts the Vouch and may receive funds if both parties confirm.

### 4.5 Invitation

A shareable or recipient-restricted access mechanism that allows a payee to review and accept a Pending Vouch.

### 4.6 Confirmation

A participant's recorded assertion that they were present for the in-person appointment or agreement.

A Confirmation may be submitted by:

- payer
- payee

A Confirmation alone does not release funds.

### 4.7 Payment Record

A local representation of the payment provider state.

It may reference:

- payment intent
- charge
- transfer
- refund
- connected account
- customer
- provider status

### 4.8 Refund Record

A local representation of a refund, void, non-capture, or equivalent payment-provider outcome.

### 4.9 Connected Account

A payment provider account associated with a payee for receiving released funds.

### 4.10 Verification Profile

A record of user eligibility status.

It may include:

- identity status
- adult eligibility status
- payout readiness
- payment readiness
- provider references

### 4.11 Terms Acceptance

A record showing that a user accepted required product/payment terms.

### 4.12 Audit Event

An immutable record of important system or user actions.

### 4.13 Notification Event

A record of a notification that should be sent or was sent.

### 4.14 Admin

A privileged operational user.

Admin is not a Vouch participant role.

Admin may inspect operational state but must not arbitrate human disputes.

## 5. Canonical Actors

### Payer

Creates and funds the Vouch.

### Payee

Accepts and may receive funds.

### System

Performs deterministic state transitions, payment reconciliation, expiration, notification, and audit recording.

### Admin

Inspects operational state and resolves technical failures within allowed scope.

### Payment Provider

External payment infrastructure that processes payment, refund, payout, and account state.

### Auth Provider

External authentication infrastructure.

### Verification Provider

External identity/adult eligibility infrastructure if separate from payment provider.

## 6. Canonical Actions

### Account Actions

- sign up
- sign in
- sign out
- complete verification
- connect payout account
- add payment method
- accept terms
- update account settings

### Vouch Actions

- create Vouch
- send/share invitation
- view Vouch
- accept Vouch
- decline Vouch
- cancel Vouch
- confirm presence
- complete Vouch
- expire Vouch
- refund Vouch
- mark Vouch failed

### Payment Actions

- initialize payment
- authorize payment
- capture payment
- release funds
- transfer funds
- refund payment
- void payment
- reconcile payment status
- record payment failure

### Admin Actions

- view user
- view Vouch
- view payment status
- view audit timeline
- view webhook event
- retry safe technical operation
- disable account if policy permits

Admin actions must not include:

- decide dispute
- manually award funds based on claim
- alter confirmation truth
- create marketplace moderation judgments

### Notification Actions

- send invite notification
- send accepted notification
- send confirmation reminder
- send confirmation recorded notification
- send completed notification
- send expired/refunded notification
- send payment failure notification

## 7. Canonical States

### 7.1 User States

- unauthenticated
- authenticated
- setup incomplete
- verification pending
- verified
- verification rejected
- payment ready
- payout ready
- disabled

### 7.2 Vouch States

#### Pending

Created but not yet accepted by payee.

#### Active

Accepted and eligible for confirmation/resolution rules.

#### Completed

Both parties confirmed within the window and funds released.

#### Expired

The confirmation or acceptance requirement was not satisfied before the deadline.

#### Refunded

Payment was returned, voided, or not captured.

#### Canceled

The Vouch was intentionally canceled before reaching a final payment-bearing state.

#### Failed

A technical or payment-provider error prevented normal lifecycle resolution.

### 7.3 Invitation States

- created
- sent
- opened
- accepted
- declined
- expired
- invalidated

### 7.4 Confirmation States

Per participant:

- not_confirmed
- confirmed
- ineligible
- window_not_open
- window_closed

Aggregate:

- none_confirmed
- payer_confirmed
- payee_confirmed
- both_confirmed

### 7.5 Payment States

- not_started
- requires_payment_method
- authorized
- captured
- release_pending
- released
- refund_pending
- refunded
- voided
- failed
- disputed_provider_side

Provider-side disputes are payment-provider facts, not Vouch arbitration workflows.

### 7.6 Verification States

- unstarted
- pending
- verified
- rejected
- requires_action
- expired

## 8. Canonical Outcomes

### Completed Outcome

Condition:

- both parties confirmed within valid window
- payment release succeeded or is accepted by provider as processing

Result:

- Vouch is Completed
- payee receives funds according to provider timeline
- payer sees final completed state

### Expired / Refunded Outcome

Condition:

- Vouch did not receive both confirmations before deadline
- or payee did not accept before expiration
- or Vouch was canceled before acceptance where allowed

Result:

- funds do not release
- payment is refunded, voided, or not captured
- final state is expired/refunded/canceled depending on reason

### Failed Outcome

Condition:

- provider or system operation fails in a way that prevents normal resolution

Result:

- Vouch is marked failed or resolution-failed
- audit event is created
- admin can inspect technical issue
- users see safe explanatory copy

## 9. Canonical Permissions

### Payer Permissions

A payer may:

- create Vouch
- view own created Vouch
- share invite
- cancel Pending Vouch if allowed
- confirm presence during window
- view final outcome
- receive refund/non-capture when applicable

A payer may not:

- accept their own Vouch as payee
- confirm as payee
- force release unilaterally
- manually override expiration
- view unrelated Vouches

### Payee Permissions

A payee may:

- view invited Vouch if invite allows
- accept Vouch if eligible
- decline Vouch
- view accepted Vouch
- confirm presence during window
- receive funds after successful completion
- view final outcome

A payee may not:

- accept already accepted Vouch
- force release unilaterally
- confirm as payer
- access unrelated Vouches

### Admin Permissions

An admin may:

- view operational records
- inspect user/Vouch/payment state
- inspect audit events
- retry safe technical operations
- disable abusive accounts if policy allows

An admin may not:

- decide who deserved payment
- manually rewrite confirmation records
- convert Vouch into a dispute workflow
- bypass payment provider requirements
- create marketplace moderation systems in MVP

### System Permissions

The system may:

- transition Vouch states according to rules
- expire Vouches
- initiate release/refund/void operations
- reconcile webhooks
- send notifications
- write audit events

The system may not:

- infer human truth outside deterministic rules
- release funds without both confirmations
- ignore provider failure states
- silently mutate final states without audit

## 10. Canonical Events

### User Events

- user.created
- user.signed_in
- user.verification.started
- user.verification.completed
- user.verification.rejected
- user.payment_method.added
- user.connected_account.created
- user.connected_account.ready
- user.terms.accepted

### Vouch Events

- vouch.created
- vouch.invite.sent
- vouch.invite.opened
- vouch.accepted
- vouch.declined
- vouch.canceled
- vouch.confirmation_window.opened
- vouch.payer_confirmed
- vouch.payee_confirmed
- vouch.completed
- vouch.expired
- vouch.refunded
- vouch.failed

### Payment Events

- payment.initialized
- payment.authorized
- payment.captured
- payment.release_requested
- payment.released
- payment.refund_requested
- payment.refunded
- payment.voided
- payment.failed
- payment.webhook_received
- payment.webhook_processed
- payment.webhook_ignored
- payment.reconciliation_failed

### Notification Events

- notification.invite.queued
- notification.invite.sent
- notification.accepted.sent
- notification.confirmation_window.sent
- notification.confirmation_recorded.sent
- notification.completed.sent
- notification.expired.sent
- notification.failed

### Admin Events

- admin.user.viewed
- admin.vouch.viewed
- admin.payment.viewed
- admin.retry.started
- admin.retry.completed
- admin.account.disabled

## 11. Canonical Constraints

### No Marketplace Constraint

The product must not normalize or introduce:

- provider profiles
- public listings
- searchable categories
- reviews
- ratings
- recommendations
- matching
- public availability calendars

### No Arbitration Constraint

The product must not normalize or introduce:

- dispute claims
- evidence uploads
- user accusations
- judgment workflows
- staff decisions about who is right

### No Custody Constraint

The product must not normalize itself as holding funds directly.

Payment state must reference payment provider infrastructure.

### No Purpose Inspection Constraint

The product should not require detailed information about why users are meeting.

Allowed:

- short label
- appointment reference
- optional private memo if necessary later

Avoid:

- detailed service categories
- restricted activity descriptions
- public descriptions
- searchable purpose fields

### Verification Constraint

Payment-bearing participation requires eligibility.

The exact eligibility checks may differ for payer and payee, but must be explicit in contracts.

### Confirmation Constraint

Funds release only after both parties confirm within the valid window.

One-sided confirmation is not enough.

### Expiration Constraint

Failure to complete required confirmation before expiration results in refund, void, or non-capture.

## 12. Canonical Terms

### Use

- Vouch
- commitment-backed payment
- confirmation
- presence confirmation
- release
- refund
- payer
- payee
- client
- provider
- appointment
- in-person agreement
- confirmation window
- payment coordination

### Avoid

- escrow
- deposit app as primary term
- marketplace
- booking marketplace
- dispute
- claim
- judgment
- review
- rating
- provider listing
- service category
- guaranteed safety

## 13. Domain Boundary

Vouch owns:

- account readiness
- Vouch creation
- Vouch acceptance
- payment commitment tracking
- confirmation tracking
- deterministic release/refund outcome
- audit trail
- notifications related to Vouch lifecycle

Vouch does not own:

- how users met
- what service is being provided
- whether service quality was acceptable
- whether someone lied
- who should win a dispute
- business scheduling calendars
- provider marketing
- client-provider messaging
- public marketplace discovery

## 14. Future Expansion Normalization

Future concepts may be considered only after MVP proves the core.

Potential future normalized concepts:

### Recurring Vouch

A repeating commitment-backed payment for recurring appointments.

### Group Vouch

A multi-party commitment where multiple people must confirm or contribute.

### API Client

A third-party system that creates Vouches programmatically.

### Calendar Integration

A read/write integration that attaches Vouch windows to external calendars without turning Vouch into a scheduler.

These are not MVP concepts.
