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

Build reusable components that express Vouch’s serious, neutral, deterministic product model.

## Component Architecture

Use:

- `components/ui/`
- `components/layout/`
- `components/vouches/`
- `components/payments/`
- `components/verification/`
- `components/setup/`
- `components/admin/`
- `components/forms/`

Components are pure presentation. Domain reads, writes, auth, authorization, provider SDK calls, and database access belong in the appropriate server modules.

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

Every Vouch screen should make these obvious:

1. current status
2. amount involved
3. required action
4. deadline
5. outcome if no action occurs
6. whether other party acted
7. whether state is final

## Form Rules

Forms should be:

- accessible
- labeled
- short
- consequence-clear
- server-action compatible

Forms should support:

- pending state
- field errors
- form errors
- disabled unsafe submit
- clear success/failure state

Client form validation is UX only. Server actions remain authoritative.

## Loading States

Use stable skeleton layouts for dashboard lists, Vouch cards, Vouch detail panels, admin tables, and setup checklists.

## Accessibility Requirements

Components should support:

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
- Status components include text labels.
- Vouch panels satisfy the seven-question standard.
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

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
