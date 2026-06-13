# Vouch Design System

## Purpose

This document is the durable design source of truth for Vouch.

It exists so agents and developers can change UI without creating visual drift, inconsistent spacing, arbitrary colors, duplicated components, or one-off styling decisions.

## Design Principles

Vouch should feel:

- Trustworthy.
- Calm.
- Precise.
- Premium.
- Operational.
- Human.

The interface should communicate that Vouch is a serious financial workflow protocol without feeling cold, generic, or overbuilt.

## Visual Direction

Vouch uses a modern B2B SaaS interface with strong hierarchy, restrained visual effects, readable density, and clear state communication.

The product should prioritize:

- Clear workflow status.
- Fast comprehension.
- Strong action hierarchy.
- Consistent spacing.
- Consistent card anatomy.
- Accessible contrast.
- Token-backed styling.
- Reusable components.

## Token Strategy

Use CSS variables as the foundation for the visual system.

Token categories:

- Color.
- Typography.
- Spacing.
- Radius.
- Shadow/elevation.
- Border.
- Focus.
- Motion.
- Z-index.

Token prefix:

- `--vouch-*`

Semantic tokens are preferred over raw color names. Components should describe intent, not literal color choice.

Example token roles:

- Background.
- Foreground.
- Surface.
- Muted surface.
- Elevated surface.
- Border.
- Strong border.
- Primary.
- Secondary.
- Accent.
- Success.
- Warning.
- Danger.
- Info.
- Focus ring.

## CSS Variable Policy

`app/globals.css` may contain:

- Token definitions.
- Base document styles.
- Base typography defaults.
- Accessibility defaults.
- Focus-visible defaults.
- Selection styles.
- Motion keyframes.
- Document-level background treatments.

`app/globals.css` must not contain:

- Page-specific layout.
- Component-specific one-off styles.
- Feature-specific business state styling.
- Random visual experiments.

## Tailwind Policy

Tailwind utilities are allowed and expected, but reusable components should compose token-backed utilities instead of arbitrary literal design values.

Avoid repeated arbitrary values when they represent design decisions. Promote those decisions into tokens, component variants, or shared components.

## Inline Style Policy

Inline styles are forbidden by default.

Inline styles are allowed only for:

- Dynamic runtime values that cannot reasonably be expressed as a class or CSS variable.
- Setting a CSS variable from a computed runtime value.

When an inline style is necessary and non-obvious, add a short comment explaining why it is not a token/class.

## Component Layers

### `components/ui/`

Primitive shadcn/Base UI components only.

Rules:

- No domain logic.
- No protected fetching.
- No Prisma.
- No Stripe SDK.
- No Clerk server helpers.
- No product truth.

### `components/shared/`

Reusable presentational components shared across features.

Examples:

- Empty states.
- Status badges.
- Generic error pages.
- Shared hero/CTA sections.
- Reusable requirement notices.
- Shared dashboard/status blocks.

### `components/<domain>/`

Domain-presentational components for a specific product area.

Examples:

- `components/vouches/*`
- `components/dashboard/*`
- `components/nav/*`
- `components/public/*`

### `features/`

Feature orchestration. May compose fetcher/action handoff, forms, stateful client components, Suspense boundaries, and role-aware view composition.

## Component Inventory

Reusable components must be tracked here when added or materially changed.

| Component              | Path                                             | Layer     | Purpose                                | Status | Token Dependencies                       | Notes                                                           |
| ---------------------- | ------------------------------------------------ | --------- | -------------------------------------- | ------ | ---------------------------------------- | --------------------------------------------------------------- |
| Button                 | `components/ui/button.tsx`                       | Primitive | Base interactive action                | Active | color, radius, focus, spacing            | Variants should remain semantic.                                |
| Card                   | `components/ui/card.tsx`                         | Primitive | Surface container                      | Active | surface, border, radius, shadow, spacing | Use for dashboard and content grouping.                         |
| Badge                  | `components/ui/badge.tsx`                        | Primitive | Compact status/label                   | Active | color, radius, typography                | Should align with status semantics.                             |
| Alert                  | `components/ui/alert.tsx`                        | Primitive | Inline feedback                        | Active | color, border, spacing                   | Use for warnings/errors/info.                                   |
| EmptyState             | `components/ui/empty-state.tsx`                  | Primitive | Empty state presentation               | Active | typography, spacing, muted, icon         | Prefer over ad hoc empty states.                                |
| StatCard               | `components/ui/statcard.tsx`                     | Primitive | Metric card presentation               | Active | surface, typography, progress, spacing   | Keep dashboard stats visually consistent.                       |
| VouchStatusBadge       | `components/shared/vouch-status-badge.tsx`       | Shared    | Vouch workflow status                  | Active | badge/status colors                      | Must reflect canonical workflow state.                          |
| RequirementNoticeSplit | `components/shared/requirement-notice-split.tsx` | Shared    | Requirement or CTA notice              | Active | surface, warning/info, spacing           | Blocking use only for product-required gates.                   |
| InvoiceSummary         | `components/dashboard/invoice-summary.tsx`       | Domain    | Dashboard Vouch summary row/card       | Active | surface, typography, status              | Should not be disabled by optional account setup.               |
| VouchCreationWizard    | `components/vouches/vouch-creation-wizard.tsx`   | Domain    | Merchant new-Vouch wizard              | Active | progress, card, spacing                  | Connect readiness may block this flow.                          |
| CheckoutSharePanel     | `components/vouches/checkout-share-panel.tsx`    | Domain    | Customer authorization-link sharing UI | Active | border, typography, action hierarchy     | Receives mapped Vouch detail data and uses centralized content. |
| VouchStatusDocument    | `components/vouches/vouch-status-document.tsx`   | Domain    | Vouch detail/status view               | Active | status, timeline, card                   | Canonical participant view.                                     |
| VouchArchiveTable      | `components/archive/vouch-archive-table.tsx`     | Domain    | Archived participant Vouch table       | Active | surface, border, typography, status      | Responsive semantic table with detail links.                    |

When adding a reusable component, update this table or explain why the component is intentionally local and non-reusable.

## State Patterns

### Loading

Use skeletons or loading views that preserve layout shape and reduce shift.

### Empty

Use clear empty-state copy and one appropriate next action where possible.

### Error

Use plain language. Preserve recovery affordances where possible.

### Success

Confirm completion and route the user to the next meaningful product state.

### Warning

Warnings must distinguish between required blockers and optional guidance.

### Locked

Locked states are allowed only when the product workflow truly requires readiness or authorization.

## Dashboard Pattern

Dashboard UI should maintain:

- Clear top-level status.
- Role-appropriate summaries.
- Consistent card padding.
- Consistent stat-card hierarchy.
- Bounded list density.
- Clear empty state.

## Form Pattern

Forms should include:

- Labels.
- Clear helper/error text.
- Field-level validation where possible.
- Strong primary action.
- Obvious review step for payment-bearing actions.
- No hidden provider assumptions.

## CTA Pattern

Each region should have one primary action.

Secondary actions must be visually subordinate.

## Accessibility Baseline

All UI changes must preserve:

- Keyboard access.
- Visible focus states.
- Semantic HTML.
- Accessible names for icon-only controls.
- WCAG AA color contrast target.
- Reduced-motion compatibility.
- Clear disabled-state explanation when a control is genuinely blocked.

## Contribution Rules

Before adding UI:

1. Check for an existing primitive.
2. Check for an existing shared component.
3. Check for an existing domain component.
4. Use token-backed Tailwind classes.
5. Add or update component inventory if reusable.
6. Avoid inline styles.
7. Preserve accessibility and responsive behavior.

Do not introduce a new visual language without updating this document and `.agents/contracts/design.yaml`.
