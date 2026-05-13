# Vouch Design System

## Visual direction

Vouch uses a dark brutalist operational SaaS interface.

The interface should feel:

```txt
deterministic
protocol-driven
high-contrast
dense but intentional
institutional
precise
non-decorative
```

## Required style

Use:

```txt
dark foundation
black/neutral panels
bordered surfaces
zero-radius or rounded-none panels
uppercase display typography
tight labels
restrained #1D4ED8 blue
neutral text hierarchy
subtle blur only where useful
grid/radial backgrounds
mobile-first layouts
status text, not color alone
```

## Avoid

Do not use:

```txt
soft rounded SaaS cards
pastel dashboards
marketplace cards
profile cards
review/rating widgets
chat-style UI
consumer social patterns
playful gradients
ambiguous status colors without text
```

## Page structure

Every page should use:

```txt
shell header from layout
main content container
page hero/header
primary page body
mapped reusable sections/panels/cards
final callout panel where appropriate
shell footer from layout
```

## Shared components

Preferred shared components:

```txt
components/shared/page-hero.tsx
components/shared/section-intro.tsx
components/shared/callout-panel.tsx
components/shared/card-grid.tsx
components/shared/metric-grid.tsx
components/shared/process-panel.tsx
components/shared/content-section-list.tsx
components/shared/surface.tsx
```

## Vouch cards

The Vouch card is the primary dashboard unit.

A Vouch card displays:

```txt
amount
appointment date
confirmation window
status
participant role
next action
archive state
```

Clicking a Vouch card opens:

```txt
/vouches/[vouchId]
```

## Vouch detail

The Vouch detail page is the canonical action surface.

It owns:

```txt
payment status
confirmation status
checkout link sharing
presence confirmation
invite acceptance
archive action
safe timeline/audit summary
next action
```

No route sprawl.

No separate dispute, evidence, messaging, review, settings, or admin settlement surfaces.

## Status language

Every status must explain:

```txt
what happened
what happens next
what cannot happen
who can act
what consequence applies
```

Do not rely on color alone.

## Copy rules

Use Vouch language:

```txt
Outcome follows system state.
Vouch asks what happened.
The rule is known before money moves.
No unilateral action forces settlement.
No discretion surface exists to exploit.
```

Avoid marketplace language:

```txt
book a provider
find services
hire merchants
browse listings
message provider
review provider
resolve dispute
submit evidence
claim outcome
```
