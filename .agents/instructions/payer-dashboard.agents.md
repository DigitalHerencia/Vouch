# Payer Dashboard Instructions — Client Action Queue

## Issue Type

Implementation Instruction

## Domain

Authenticated user dashboard, payer/client action queue, invite-aware state, and Vouch list views.

## Source Contracts

- `.agents/contracts/features.yaml`
- `.agents/contracts/routes.yaml`
- `.agents/contracts/authz.yaml`
- `.agents/docs/user-flows.md`
- `.agents/docs/design-system.md`

## Objective

Build dashboard and inbox-style views that show what the authenticated user needs to do next.

The dashboard must answer:

- What Vouches require action?
- Which Vouches are active?
- Which are pending?
- Which completed?
- Which expired/refunded?
- What is the next action?

## Required Routes

```txt
/dashboard
/vouches
/vouches/[vouchId]
```

## Required Architecture

Use:

```txt
features/dashboard/
features/vouches/list/
features/vouches/detail/
lib/vouches/fetchers/
components/vouches/
components/layout/
```

## Required Sections

Dashboard sections:

- action required
- active
- pending
- completed
- expired/refunded

Each Vouch card must show:

- role: payer or payee
- status
- amount
- other party label
- confirmation window
- deadline
- next action
- final outcome if completed/expired

## Data Scope

Fetch only Vouches where current user is:

- payer
- accepted payee

Invite candidate summaries must be handled by invite route, not dashboard broad queries.

## Required Fetchers

Implement or use:

- `listUserVouches`
- `getDashboardSummary`
- `getVouchDetailForParticipant`
- `getParticipantSafePaymentSummary`
- `getParticipantSafeAuditTimeline`

Every fetcher must authenticate and authorize.

## Required UI

Components:

- `VouchCard`
- `VouchStatusBadge`
- `VouchAmount`
- `VouchDeadline`
- `NextActionButton`
- `EmptyVouchState`
- `DashboardSection`
- `VouchListFilters`

## URL State

Use search params for:

- status filter
- pagination
- sort

Do not use hidden client-only list state for canonical filters.

## Empty State Copy

Use:

> No Vouches yet. Create a Vouch to back an appointment or in-person agreement with a clear payment commitment.

Do not use:

- browse providers
- find services
- discover appointments

## Forbidden Work

Do not build:

- marketplace inbox
- chat inbox
- message threads
- provider recommendations
- booking marketplace cards
- review prompts
- categories
- service search

## Acceptance Criteria

- User sees only participant-scoped Vouches.
- Dashboard shows action-required state clearly.
- Vouch card shows status, amount, deadline, and next action.
- Empty state does not imply marketplace discovery.
- Unauthorized Vouches are hidden or return not found.
- Fetchers enforce authz server-side.
- UI uses status text, not color alone.
- Loading states use skeletons.

## Required Tests

- dashboard fetcher participant scope
- unrelated Vouch access denied
- status filter parsing
- empty state rendering
- Vouch card status rendering
- route auth protection

## Required Validation

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
```
