# Vouch Design System

## 1. Purpose

This document defines the product design direction for Vouch.

Vouch handles money, time, commitment, and attendance. The interface must feel serious, fast, neutral, and trustworthy.

The design system should reduce confusion, not create brand theater.

## 2. Design Thesis

Vouch should feel like infrastructure for real-world commitment.

The visual language should communicate:

- money is involved
- rules are clear
- outcomes are deterministic
- the product is neutral
- the system does not judge disputes
- users can understand status at a glance

## 3. Brand Attributes

### Primary Attributes

- serious
- precise
- neutral
- professional
- calm
- modern
- secure
- direct

### Secondary Attributes

- lightweight
- fast
- minimal
- operational
- high-trust

### Avoid

- playful
- cute
- social
- gamified
- luxury-fintech cliché
- marketplace-heavy
- dating-app-like
- crypto-like
- "escrow bro" energy

## 4. Visual Direction

Recommended visual direction:

- dark-neutral foundation
- high-contrast text
- restrained blue accent
- clean cards
- clear status badges
- strong spacing
- low-noise layouts
- subtle borders
- minimal decorative elements

The interface should look like a serious operational tool, not a social consumer app.

## 5. Color System

### Foundation

Use neutral surfaces as the base.

Recommended Tailwind-style tokens:

- `neutral-950` for deepest backgrounds
- `neutral-900` for primary app backgrounds
- `neutral-850` or custom surface for raised sections
- `neutral-800` for cards and panels
- `neutral-700` for borders
- `neutral-400` for secondary text
- `neutral-100` for primary text

### Accent

Use blue as the primary action/accent color.

Recommended:

- `blue-600` for primary buttons and active state
- `blue-500` for hover/focus accent
- `blue-400` for highlights on dark backgrounds

### Status Colors

Status color must be supportive, not the only indicator.

Recommended semantic categories:

- Pending: neutral / amber
- Active: blue
- Confirmed: sky / blue
- Completed: green
- Expired: neutral / amber
- Refunded: neutral
- Failed: red
- Blocked: amber
- Requires Setup: amber

Every status badge must include text, not color alone.

## 6. Typography

### Style

Typography should be direct and highly legible.

Recommended characteristics:

- strong headings
- concise body copy
- readable line length
- clear numeric emphasis
- tabular numbers where useful
- no overly decorative fonts

### Hierarchy

Use clear hierarchy:

- Page title: explains where the user is
- Page subtitle: explains the current state
- Section headers: group related information
- Status labels: communicate lifecycle
- Helper text: explain consequences

### Voice

The UI copy should be:

- direct
- plain
- legally cautious
- operational
- non-judgmental

Avoid:

- hype
- jokes around payment
- shame language
- accusations
- "trust us" language
- ambiguous fintech slogans

## 7. Layout Principles

### 7.1 Status First

Every Vouch detail screen must lead with status.

The first visible section should answer:

- current state
- amount
- next action
- deadline
- outcome if no action happens

### 7.2 One Primary Action

Each screen should have one obvious primary action.

Examples:

- Create Vouch
- Accept Vouch
- Confirm Presence
- Finish Setup
- Copy Invite Link

Secondary actions should be visually subordinate.

### 7.3 Money Must Be Clear

Amounts must be displayed plainly.

Show:

- Vouch amount
- platform fee
- total charged/committed
- release/refund state

Do not hide fees behind tooltips only.

### 7.4 Time Must Be Clear

Every Active Vouch must display:

- meeting window
- confirmation deadline
- time remaining
- timezone where relevant

Avoid relative-only time.

Use both:

- "Today, 4:00 PM"
- "Closes in 42 minutes"

### 7.5 No Ambiguous Empty States

Empty states should explain what the user can do next.

Bad:

- "Nothing here yet."

Good:

- "No active Vouches. Create one to back an appointment with a clear payment commitment."

## 8. Core Components

### 8.1 App Shell

Required areas:

- top navigation
- authenticated user menu
- dashboard link
- create Vouch CTA
- account/setup status
- optional admin link for admins

Shell must remain minimal.

No marketplace nav.

Do not include:

- browse
- discover
- messages
- reviews
- providers
- categories

### 8.2 Marketing Header

Must include:

- Vouch logo/wordmark
- concise nav
- sign in
- primary CTA

Recommended nav:

- How it works
- Use cases
- Pricing
- FAQ

Avoid nav items implying marketplace behavior.

### 8.3 Vouch Card

A Vouch card must show:

- status badge
- role: payer/payee
- amount
- other party
- time window
- next required action
- deadline
- compact outcome text

### 8.4 Vouch Detail Header

Must show:

- current status
- amount
- role
- other party
- confirmation state
- deadline
- primary action

### 8.5 Confirmation Panel

Must show:

- whether payer confirmed
- whether payee confirmed
- current user's confirmation state
- release/refund rule
- deadline
- primary confirm button when eligible

Copy must make one-sided confirmation clear.

### 8.6 Payment Summary

Must show:

- amount
- fee
- total
- payment status
- release/refund condition
- provider processing note where needed

### 8.7 Setup Checklist

Must show:

- account status
- identity verification
- adult eligibility
- payment method
- payout setup
- terms acceptance

Each item should have:

- status
- reason
- action if incomplete

### 8.8 Status Badge

Status badges must be consistent.

Required statuses:

- Pending
- Active
- Awaiting Confirmation
- Partially Confirmed
- Completed
- Expired
- Refunded
- Failed
- Requires Setup

### 8.9 Timeline / Audit Summary

User-facing timeline should show:

- created
- accepted
- confirmation opened
- payer confirmed
- payee confirmed
- completed/refunded/expired

Admin-facing timeline may show technical events.

### 8.10 Admin Tables

Admin tables should prioritize:

- status
- failure state
- payment provider reference
- created time
- expiration time
- participant IDs
- next operational concern

Admin UI must avoid dispute-resolution framing.

## 9. Page Design Requirements

### 9.1 Landing Page

Goal:

- explain Vouch in less than 10 seconds

Must include:

- hero statement
- concise mechanism
- use cases
- how it works
- pricing
- safety/legal positioning
- CTA

Must avoid:

- edgy meetup positioning
- escrow language
- marketplace visuals
- provider directories

### 9.2 Dashboard

Goal:

- show what requires action

Sections:

- action required
- active
- pending
- history

Primary CTA:

- Create Vouch

### 9.3 Create Vouch

Goal:

- commit funds with confidence

Design:

- step-based or single-page form
- amount first
- time window second
- recipient/share third
- review last

Critical copy:

- both must confirm
- expiration means refund/non-capture
- Vouch does not arbitrate

### 9.4 Accept Vouch

Goal:

- understand and accept commitment

Must show:

- payer
- amount
- window
- rules
- setup requirements
- accept/decline actions

### 9.5 Vouch Detail

Goal:

- status and action clarity

Must show:

- current status
- next action
- confirmation progress
- payment outcome
- timeline

### 9.6 Settings

Goal:

- manage readiness

Sections:

- profile basics
- verification
- payment method
- payout account
- terms/legal
- account security

### 9.7 Admin

Goal:

- inspect operational health

Sections:

- Vouches
- users
- payment failures
- verification failures
- webhook events
- audit logs

## 10. Interaction Patterns

### Primary Button

Use for the next irreversible or major action.

Examples:

- Create Vouch
- Accept Vouch
- Confirm Presence
- Finish Setup

### Destructive / Final Actions

Actions that may cancel, decline, or trigger final state must use confirmation dialogs.

### Loading States

Use skeletons for:

- dashboard lists
- Vouch cards
- detail panels
- admin tables

Use pending button states for:

- form submissions
- confirmation actions
- payment setup redirects

Avoid generic full-screen spinners unless unavoidable.

### Disabled States

Disabled actions must explain why.

Bad:

- disabled button only

Good:

- disabled button plus "Complete payout setup before accepting."

## 11. Forms

Forms must be:

- short
- labeled
- accessible
- clear about consequences

Create Vouch fields:

- amount
- date/time window
- recipient/share method
- optional label
- terms acknowledgment

Do not ask for:

- service category
- service description
- public listing fields
- profile-style marketing details

## 12. Copy Rules

### Use

- "commitment-backed payment"
- "confirm presence"
- "release funds"
- "refund"
- "appointment"
- "in-person agreement"
- "no-show protection"
- "both parties"

### Avoid

- "escrow"
- "deposit app" as primary positioning
- "safe meetup"
- "trusted provider"
- "verified service"
- "guaranteed service"
- "dispute"
- "claim"
- "judge"
- "marketplace"
- "book now" unless carefully scoped

## 13. Accessibility Requirements

All UI must support:

- keyboard navigation
- visible focus states
- semantic headings
- labeled inputs
- status text
- non-color-only state indication
- sufficient contrast
- screen-reader readable error messages
- accessible dialogs

## 14. Responsive Requirements

### Mobile

Mobile is primary for confirmation.

Mobile screens must prioritize:

- status
- amount
- confirm CTA
- countdown
- other party confirmation state

### Desktop

Desktop may show:

- richer timeline
- side-by-side payment summary
- dashboard tables
- admin diagnostics

## 15. Design Anti-Patterns

Do not create:

- profile cards
- public user pages
- star ratings
- "featured providers"
- category chips for services
- chat bubbles
- social proof widgets implying endorsement
- gamified streaks
- leaderboard
- marketplace search
- review prompts
- "recommended" transaction partners

## 16. Design Acceptance Standard

A screen passes if a user can answer within five seconds:

1. What is this Vouch's status?
2. What amount is involved?
3. What do I need to do?
4. When do I need to do it?
5. What happens if I do nothing?
6. Has the other party acted?
7. Is this final?

If the screen fails any of these, redesign it.
