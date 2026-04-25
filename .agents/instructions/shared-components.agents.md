# Shared Components Instructions — Vouch UI System

## Issue Type

Implementation Instruction

## Domain

Reusable UI primitives, Vouch components, layout, forms, status indicators, skeletons, and accessibility.

## Source Contracts

- `.agents/docs/design-system.md`
- `.agents/docs/launch-copy.md`
- `.agents/contracts/features.yaml`
- `.agents/contracts/routes.yaml`

## Objective

Build reusable components that express Vouch’s serious, neutral, deterministic product model without introducing marketplace, social, or arbitration patterns.

## Component Architecture

Use:

```txt
components/ui/
components/layout/
components/vouches/
components/payments/
components/verification/
components/setup/
components/admin/
components/forms/
```

Components must be pure.

Components must not:

- call Prisma
- call Stripe
- call Clerk server APIs
- enforce authorization
- fetch protected data
- mutate domain state
- contain hidden business rules

## Required Shared Components

### Layout

- `PublicShell`
- `AppShell`
- `AdminShell`
- `PageHeader`
- `SectionHeader`
- `EmptyState`

### Vouch

- `VouchCard`
- `VouchStatusBadge`
- `VouchDetailHeader`
- `ConfirmationPanel`
- `VouchTimeline`
- `VouchAmountSummary`
- `VouchDeadline`
- `NextActionPanel`

### Payments

- `PaymentSummary`
- `PaymentStatusBadge`
- `RefundStatusBadge`
- `FeeBreakdown`

### Setup

- `SetupChecklist`
- `SetupChecklistItem`
- `VerificationStatusCard`
- `PaymentReadinessCard`
- `PayoutReadinessCard`
- `TermsStatusCard`

### Admin

- `AdminMetricCard`
- `AdminStatusTable`
- `AuditTimeline`
- `WebhookStatusBadge`
- `OperationalFailureBadge`

### Forms

- `FormShell`
- `SubmitButton`
- `FieldError`
- `FormError`
- `MoneyInput`
- `DateTimeInput`
- `TermsCheckbox`

## Design Requirements

Visual style:

- dark neutral foundation
- restrained blue accent
- clear status badges
- strong spacing
- high contrast
- minimal decoration
- serious tone

Use status text, not color alone.

## Vouch Screen Standard

Every Vouch screen must make these obvious:

1. current status
2. amount involved
3. required action
4. deadline
5. outcome if no action occurs
6. whether other party acted
7. whether state is final

## Copy Rules

Use:

- commitment-backed payment
- confirm presence
- release funds
- refund
- appointment
- in-person agreement
- no-show protection
- both parties

Avoid:

- escrow
- trusted provider
- verified service
- guaranteed appointment
- safe meetup
- dispute
- claim
- judge
- marketplace
- review
- rating

## Forbidden Components

Do not create:

- `ProviderCard`
- `PublicProfileCard`
- `ReviewCard`
- `RatingStars`
- `MessageThread`
- `ChatBubble`
- `CategoryFilter`
- `FeaturedProvider`
- `RecommendationCard`
- `DisputeForm`
- `EvidenceUploader`
- `ReputationScore`

## Form Rules

Forms must be:

- accessible
- labeled
- short
- consequence-clear
- server-action compatible

Forms must support:

- pending state
- field errors
- form errors
- disabled unsafe submit
- clear success/failure state

Client form validation is UX only. Server actions remain authoritative.

## Loading States

Use skeletons for:

- dashboard lists
- Vouch cards
- Vouch detail panels
- admin tables
- setup checklist

Avoid generic spinners unless there is no stable layout.

## Accessibility Requirements

Components must support:

- keyboard navigation
- visible focus states
- semantic headings
- accessible labels
- sufficient contrast
- screen-reader-readable errors
- non-color-only status indicators
- accessible dialogs

## Acceptance Criteria

- Components are pure and reusable.
- No component fetches protected data.
- No component enforces authz.
- Status components include text labels.
- Vouch panels satisfy the seven-question standard.
- No forbidden marketplace/social/dispute components exist.
- Forms are accessible and server-action compatible.
- Design matches serious/neutral Vouch tone.

## Required Tests

- status badge rendering
- Vouch card rendering
- confirmation panel states
- setup checklist rendering
- form error rendering
- accessibility smoke where practical

## Required Validation

```bash
pnpm lint
pnpm typecheck
pnpm test
```
