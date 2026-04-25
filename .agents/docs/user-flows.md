# Vouch User Flows

## 1. Purpose

This document describes the primary human flows in Vouch.

It defines user intent, visible steps, system responses, success states, failure states, and edge cases.

This file does not define implementation logic. Contracts and instructions will later translate these flows into routes, actions, permissions, events, and acceptance gates.

## 2. Flow Principles

Every Vouch flow must be:

- deterministic
- low-friction
- clear about money movement
- explicit about timing
- explicit about confirmation requirements
- free of marketplace behavior
- free of arbitration language

The user should never wonder:

- who needs to act
- whether funds are committed
- whether the Vouch is accepted
- when the window expires
- what happens if nobody confirms
- what happens if only one party confirms
- whether Vouch is judging the situation

## 3. Primary Flow Map

Core flows:

1. New user signs up
2. User completes required setup
3. Payer creates Vouch
4. Payee accepts Vouch
5. Both parties confirm presence
6. System releases funds
7. System refunds/voids when confirmation fails
8. User views dashboard/history
9. Admin inspects operational state

## 4. Flow: New User Signup

### Actor

Any new user.

### User Intent

Create an account to send or receive commitment-backed payments.

### Entry Points

- landing page CTA
- Vouch invite link
- dashboard route
- create Vouch route
- accept Vouch route

### Steps

1. User opens signup.
2. User authenticates through supported provider.
3. System creates or links internal user record.
4. System checks account readiness.
5. System redirects user based on context.

### Contextual Redirects

If user came from create flow:

- redirect to setup requirements
- then return to create Vouch

If user came from invite link:

- preserve invite token
- redirect to setup requirements
- then return to accept Vouch

If user came directly:

- redirect to dashboard

### Success State

User has an authenticated account and can proceed to setup or dashboard.

### Failure States

- auth provider error
- email/phone conflict
- session creation failure
- invite token expired during signup

### Required UX Copy

- "Create your account to continue."
- "Your invite is saved. Finish setup to review the Vouch."
- "We could not complete sign up. Try again."

## 5. Flow: Required Setup / Verification

### Actor

Authenticated user.

### User Intent

Become eligible to create, accept, send, or receive Vouches.

### Entry Points

- dashboard setup banner
- create Vouch flow
- accept Vouch flow
- payment settings
- payout settings

### Steps

1. System checks user readiness.
2. User sees missing requirements.
3. User completes identity/adult verification if required.
4. User adds payment method if creating Vouches.
5. User connects payout account if receiving funds.
6. System updates readiness state.
7. User returns to original task.

### Readiness Categories

- account created
- identity verified
- adult eligibility confirmed
- payment method ready
- payout account ready
- terms accepted

### Success State

User is eligible for the attempted action.

### Failure States

- verification pending
- verification rejected
- payout setup incomplete
- payment method failed
- provider unavailable

### UX Requirements

The screen must clearly distinguish:

- what is required now
- what is optional later
- why each item is required
- which action is blocked

### Required UX Copy

- "Finish setup to use Vouch."
- "This protects both parties and keeps payment outcomes predictable."
- "You can continue once verification is complete."

## 6. Flow: Create Vouch

### Actor

Payer.

### User Intent

Create a commitment-backed payment for an in-person appointment or agreement.

### Entry Points

- dashboard CTA
- landing page CTA
- empty state CTA
- repeat action from past Vouch

### Preconditions

User must:

- be authenticated
- be eligible to create a Vouch
- have payment method readiness
- accept current terms

### Inputs

Required:

- amount
- meeting start time
- expiration time / confirmation deadline
- recipient method or share link choice

Optional:

- short label
- recipient email
- internal note visible only to creator, if allowed later

Do not request:

- service category
- detailed purpose
- public listing details
- open-ended marketplace description

### Steps

1. Payer opens create Vouch.
2. System shows simple explanation.
3. Payer enters amount.
4. Payer selects meeting window.
5. Payer chooses recipient or share link.
6. System calculates fee.
7. Payer reviews release/refund rules.
8. Payer confirms payment commitment.
9. System creates Vouch.
10. System displays invite/share state.

### Success State

A Pending Vouch exists.

Payer can:

- copy invite link
- send invite
- view Vouch detail
- cancel if allowed before acceptance

### Failure States

- user not verified
- amount below minimum
- amount above maximum
- invalid time window
- payment method unavailable
- payment authorization failed
- network/server error

### UX Requirements

Create flow must show:

- amount
- fee
- total charge or committed amount
- recipient state
- time window
- confirmation rule
- refund rule
- no-arbitration rule

### Required UX Copy

- "Both people must confirm during the window for funds to release."
- "If both people do not confirm in time, the payment is refunded or not captured."
- "Vouch does not judge disputes or decide who was right."

## 7. Flow: Share Vouch

### Actor

Payer.

### User Intent

Invite the payee to accept the Vouch.

### Entry Points

- post-create success screen
- Vouch detail page
- dashboard Pending Vouch card

### Steps

1. Payer views Pending Vouch.
2. Payer copies invite link or sends invite.
3. Payee opens link.
4. System validates link.
5. Payee proceeds to accept flow.

### Success State

Payee receives valid access to the Vouch acceptance page.

### Failure States

- invite expired
- Vouch already accepted
- Vouch canceled
- invalid token
- wrong recipient if invite was restricted

### UX Requirements

The share screen must avoid marketplace language.

Do not say:

- "Find clients"
- "Book provider"
- "Browse services"

Use:

- "Share this Vouch"
- "Invite the other party"
- "Send commitment link"

## 8. Flow: Accept Vouch

### Actor

Payee.

### User Intent

Review and accept the commitment-backed payment.

### Entry Points

- invite link
- email notification
- dashboard invitation

### Preconditions

Payee must:

- be authenticated
- be eligible to accept
- complete payout setup if required before acceptance
- accept terms

### Steps

1. Payee opens invite.
2. System validates Vouch status.
3. Payee sees amount, meeting window, payer identity summary, and rules.
4. Payee signs in or signs up if needed.
5. Payee completes required setup.
6. Payee accepts or declines.
7. System records acceptance.
8. Vouch becomes Active.

### Success State

Vouch is Active.

Both parties can view:

- current status
- confirmation window
- required next action
- expiration rules

### Decline State

If payee declines:

- Vouch remains unaccepted or moves to declined/canceled depending on contract
- payer is notified
- payment is refunded/voided if needed

### Failure States

- Vouch already accepted
- Vouch expired before acceptance
- invite invalid
- payee not eligible
- payout setup failed
- payment no longer valid

### UX Requirements

Accept page must answer:

- who created it
- how much is involved
- when confirmation is required
- what happens if I do nothing
- what happens if only one person confirms

### Required UX Copy

- "Accept this Vouch only if you agree to the meeting window and confirmation rules."
- "Funds release only after both parties confirm."
- "If confirmation does not complete, the payment is refunded or not captured."

## 9. Flow: Confirmation Window Opens

### Actor

System, payer, payee.

### User Intent

Know when it is time to confirm presence.

### Trigger

The Vouch reaches its valid confirmation window.

### System Behavior

System may:

- update computed confirmability
- send notification
- show confirmation CTA
- show countdown to expiration

### User-Facing State

Before window:

- "Confirmation opens at [time]."

During window:

- "Confirm presence now."

After window:

- "Confirmation window closed."

### Failure States

- notification not sent
- user opens after expiration
- payment record unavailable
- Vouch not active

### UX Requirements

Countdown and status must be visible on Vouch detail.

## 10. Flow: Payer Confirms Presence

### Actor

Payer.

### User Intent

Confirm that the meeting occurred.

### Preconditions

- user is payer
- Vouch is Active
- confirmation window is open
- payer has not already confirmed
- user is authenticated

### Steps

1. Payer opens Vouch.
2. Payer sees confirmation CTA.
3. Payer confirms presence.
4. System records payer confirmation.
5. System checks whether payee already confirmed.
6. If both confirmed, system resolves Vouch as Completed.
7. If not, system shows waiting state.

### Success State

Payer confirmation is recorded.

### Waiting State

If payee has not confirmed:

- Vouch remains Active
- UI shows "Waiting for other party"
- funds do not release

### Failure States

- outside confirmation window
- Vouch not active
- user is not participant
- duplicate confirmation
- server/payment error

### Required UX Copy

- "Your confirmation is recorded."
- "Funds release after both people confirm."
- "Waiting for the other party."

## 11. Flow: Payee Confirms Presence

### Actor

Payee.

### User Intent

Confirm that the meeting occurred and become eligible for release.

### Preconditions

- user is accepted payee
- Vouch is Active
- confirmation window is open
- payee has not already confirmed
- user is authenticated

### Steps

1. Payee opens Vouch.
2. Payee sees confirmation CTA.
3. Payee confirms presence.
4. System records payee confirmation.
5. System checks whether payer already confirmed.
6. If both confirmed, system resolves Vouch as Completed.
7. If not, system shows waiting state.

### Success State

Payee confirmation is recorded.

### Waiting State

If payer has not confirmed:

- Vouch remains Active
- funds do not release
- UI shows "Waiting for payer confirmation"

### Failure States

- outside confirmation window
- Vouch not active
- user is not payee
- duplicate confirmation
- payout account unavailable
- server/payment error

## 12. Flow: Vouch Completes

### Actor

System.

### Trigger

Both payer and payee confirmed within the valid window.

### System Steps

1. System validates both confirmations.
2. System validates Vouch status.
3. System validates payment state.
4. System initiates release/capture/transfer according to payment architecture.
5. System records payment result.
6. System marks Vouch Completed.
7. System writes audit events.
8. System notifies both parties.

### Success State

- payer sees completed status
- payee sees payout/release status
- Vouch is final unless payment provider reconciliation requires technical update

### Failure States

- provider release fails
- payout account unavailable
- payment record mismatch
- webhook delayed
- database transaction conflict

### UX Requirements

Completed page must show:

- completion timestamp
- confirmation timestamps
- amount
- final state
- payout/refund status where relevant

### Required UX Copy

- "Both parties confirmed. Funds have been released."
- "Payment processing may take time depending on the provider."

## 13. Flow: Vouch Expires

### Actor

System.

### Trigger

Confirmation window closes without both confirmations.

### System Steps

1. System checks expired Active/Pending Vouches.
2. System validates missing confirmation condition.
3. System initiates refund/void/non-capture according to payment architecture.
4. System marks Vouch Expired/Refunded.
5. System writes audit event.
6. System notifies both parties.

### Expiration Cases

- neither party confirmed
- only payer confirmed
- only payee confirmed
- payee never accepted
- payment was authorized but not captured
- payment failed before resolution

### Success State

- payer sees refunded/non-captured status
- payee sees expired status
- funds do not release

### Failure States

- refund provider failure
- webhook delay
- database update failure
- payment already transitioned unexpectedly

### Required UX Copy

- "The confirmation window closed before both people confirmed."
- "The payment was refunded or not captured."
- "Vouch does not manually override this outcome."

## 14. Flow: Dashboard

### Actor

Authenticated user.

### User Intent

See current and past Vouches.

### Entry Points

- post-login
- nav
- post-create
- post-accept
- notification links

### Dashboard Sections

Recommended:

- action required
- upcoming / active
- pending invites
- completed
- expired/refunded

### Vouch Card Must Show

- role: payer or payee
- amount
- status
- other party
- confirmation window
- next action
- final outcome if completed/expired

### Empty State

If no Vouches:

- explain what Vouch does
- provide create CTA
- avoid marketplace/discovery prompts

### Required UX Copy

- "Create your first Vouch."
- "Protect time with a commitment-backed payment."
- "No browsing. No marketplace. Just a commitment link."

## 15. Flow: View Vouch Detail

### Actor

Payer, payee, or admin.

### User Intent

Understand one Vouch's status and next action.

### Required Content

- amount
- platform fee if applicable
- payer
- payee or invitation status
- status
- meeting window
- confirmation window
- confirmation status by party
- payment status
- timeline/audit summary
- available action
- final outcome explanation

### Participant Actions

Depending on role/status:

- copy invite link
- cancel before acceptance if allowed
- accept
- decline
- confirm presence
- view final state

### Admin Actions

Admin may inspect operational details.

Admin must not arbitrate funds.

## 16. Flow: Payment Setup

### Actor

Payer.

### User Intent

Add or confirm payment method readiness.

### Steps

1. User enters payment setup.
2. System redirects or embeds provider setup.
3. Provider handles sensitive payment details.
4. System receives provider status.
5. User returns to Vouch flow.

### Requirements

Vouch must not collect raw card details directly unless using provider-secure components.

## 17. Flow: Payout Setup

### Actor

Payee.

### User Intent

Connect account to receive released funds.

### Steps

1. User enters payout setup.
2. System starts Connect onboarding.
3. User completes provider-hosted onboarding.
4. System receives account readiness.
5. User returns to accept or dashboard.

### Failure States

- account restricted
- missing required fields
- onboarding incomplete
- provider unavailable

## 18. Flow: Admin Operational Review

### Actor

Admin.

### User Intent

Inspect system state and diagnose operational problems.

### Entry Points

- admin dashboard
- failed payment alert
- support request
- monitoring link

### Admin Can View

- Vouch status
- participants
- payment references
- webhook events
- audit timeline
- verification summary
- notification attempts
- failure reason codes

### Admin Must Not

- decide who deserves funds
- manually release funds because one user complained
- edit confirmation truth
- convert Vouch into dispute case

### Admin Action Scope

Allowed:

- retry safe failed technical operation
- mark notification reviewed
- inspect logs
- export audit trail
- disable abusive account if policy allows

Disallowed in MVP:

- manual arbitration
- manual fund reassignment
- reputation scoring
- private user messaging

## 19. Edge Case Matrix

### User Never Accepts

Outcome:

- Vouch expires or can be canceled
- payer receives refund/non-capture
- payee receives no funds

### One User Confirms

Outcome:

- Vouch remains pending confirmation until expiration
- if other user does not confirm, refund/non-capture

### Both Confirm Late

Outcome:

- no release if after expiration
- expired/refunded state remains

### Payment Fails at Creation

Outcome:

- Vouch not created or created as payment failed
- user sees retry path

### Payment Fails at Release

Outcome:

- Vouch enters resolution failed
- ops can inspect technical failure
- no silent success shown

### Payout Account Restricted

Outcome:

- payee cannot accept or release may fail depending on timing
- system prompts setup/remediation

### Invite Link Leaked

Outcome:

- if unrestricted, first eligible accepting user may bind
- if restricted, only intended recipient may accept
- contract must define exact invite model

### User Tries to Access Other Vouch

Outcome:

- not found or unauthorized
- no sensitive data leaked

## 20. UX Completion Rule

Every flow must end with one of these states:

- success
- waiting for other party
- blocked by setup
- expired/refunded
- failed with retry or support path
- unauthorized
- not found

No flow may end with ambiguous silence.
