# Vouch Design System

## Visual direction

Vouch uses a dark brutalist operational SaaS interface.

The interface should feel:

- deterministic
- protocol-driven
- high-contrast
- dense but intentional
- institutional
- precise
- non-decorative

The visual system must reinforce that Vouch is deterministic payment coordination infrastructure, not a marketplace, social app, dispute platform, or consumer scheduling tool.

## Required style

Use:

- dark foundation
- black/neutral panels
- bordered surfaces
- zero-radius or rounded-none panels
- uppercase display typography
- tight labels
- restrained `#1D4ED8` blue
- neutral text hierarchy
- subtle blur only where useful
- grid/radial backgrounds
- mobile-first layouts
- status text, not color alone

The design language should feel controlled, explicit, and operational.

## Avoid

Do not use:

- soft rounded SaaS cards
- pastel dashboards
- marketplace cards
- profile cards
- review/rating widgets
- chat-style UI
- consumer social patterns
- playful gradients
- ambiguous status colors without text
- trust-and-safety theater UI
- surveillance-style UI
- dispute-resolution UI
- evidence-submission UI
- provider discovery UI
- service listing UI

The interface must not imply that Vouch verifies people, judges behavior, reviews evidence, mediates disputes, guarantees safety, or decides who is right.

## Page structure

Every page should use:

- shell header from layout
- main content container
- page hero/header
- primary page body
- mapped reusable sections/panels/cards
- final callout panel where appropriate
- shell footer from layout

Pages should be scannable, consistent, and narrow.

The route surface must remain intentionally small.

## Shared components

Preferred shared components:

- `components/shared/page-hero.tsx`
- `components/shared/section-intro.tsx`
- `components/shared/callout-panel.tsx`
- `components/shared/card-grid.tsx`
- `components/shared/metric-grid.tsx`
- `components/shared/process-panel.tsx`
- `components/shared/content-section-list.tsx`
- `components/shared/surface.tsx`

Shared components must stay presentational.

They must not own domain rules, protected fetching, provider logic, settlement logic, or authorization logic.

## Vouch cards

The Vouch card is the primary dashboard unit.

A Vouch card displays:

- amount
- appointment date
- confirmation window
- status
- participant role
- next action
- archive state

Clicking a Vouch card opens:

`/vouches/[vouchId]`

A Vouch card must not become a marketplace listing, provider profile card, review card, dispute card, or messaging preview.

## Vouch detail

The Vouch detail page is the canonical action surface.

It owns:

- payment status
- confirmation status
- checkout link sharing
- presence confirmation
- invite acceptance
- archive action
- safe timeline/audit summary
- next action

No route sprawl.

No separate dispute, evidence, messaging, review, settings, or admin settlement surfaces.

The detail page displays what the protocol knows.

It does not invite subjective narrative.

## Status language

Every status must explain:

- what happened
- what happens next
- what cannot happen
- who can act
- what consequence applies

Do not rely on color alone.

Status text must make deterministic consequences clear.

Examples of acceptable status framing:

- “Payment is authorized. Settlement is waiting for bilateral confirmation.”
- “Only one participant confirmed. Settlement cannot occur.”
- “The confirmation window closed. Funds will not release unless provider state requires a different non-capture or refund path.”
- “Both participants confirmed. Vouch is checking provider state before settlement.”

Avoid vague labels like:

- “pending”
- “in review”
- “disputed”
- “claim submitted”
- “awaiting support”
- “under investigation”

## Copy rules

Use Vouch language:

- Outcome follows system state.
- Vouch asks what happened.
- The rule is known before money moves.
- No unilateral action forces settlement.
- No discretion surface exists to exploit.
- Protocol is final.
- Payment coordination, not custody.
- Provider-backed settlement logic.
- Bilateral confirmation.
- Non-discretionary execution.

Avoid marketplace language:

- book a provider
- find services
- hire merchants
- browse listings
- message provider
- review provider
- resolve dispute
- submit evidence
- claim outcome
- open a case
- request an award
- force release

## Legal and product framing in UI

The UI must clearly reflect:

- Vouch does not arrange meetings.
- Vouch does not verify meeting purpose.
- Vouch does not guarantee performance, services, safety, legality, or legitimacy.
- Vouch does not mediate disputes.
- Vouch does not reverse completed outcomes through discretion.
- Users independently arrange all interactions outside the platform.
- Funds release only if the protocol conditions are satisfied.

## Confirmation UI

Confirmation UI must reinforce:

- both participants must confirm
- each participant confirms as their scoped role
- confirmation is only valid inside the confirmation window
- code generation alone does not release funds
- one-sided confirmation does not release funds
- confirmation cannot be rewritten after success
- no support override exists

Do not use UI that implies GPS, screenshots, evidence, messaging, or admin review can substitute for bilateral confirmation.

## Payment UI

Payment UI must reinforce:

- Stripe handles payment authorization and payment method collection
- Vouch stores safe provider references and normalized provider state only
- browser redirects are not payment truth
- provider state determines capture, non-capture, cancellation, expiration, void, or refund behavior
- Vouch checks provider state before settlement-critical operations

Do not create internal fake payment pages or raw card-management pages.

Payment and Connect actions should send users to provider-hosted flows where required.

## Empty states and callouts

Empty states should direct users toward the next valid protocol action.

They must not promote browsing, discovery, service listings, public profiles, messaging, disputes, or reviews.

Callouts should explain the system rule, not soften it.

Good callout direction:

- “The rule is known before money moves.”
- “No unilateral confirmation can force release.”
- “Provider state determines the payment path after protocol failure.”
- “Archived Vouches remain accessible, but read-only.”

## Final design invariant

The interface must make the protocol visible.

The product should feel like deterministic infrastructure, not a social product.

Every screen should answer:

- What state is this in?
- Who can act?
- What rule applies?
- What happens if the rule is satisfied?
- What happens if it is not?

Outcome follows system state.
