# Vouch Stripe Connect Agent Instructions

Source of truth date: 2026-05-12

Use these scoped instructions for Vouch implementation work. They replace older account, dashboard, auth, database, public marketing, component, and lifecycle scoped instructions.

## Product Rule

Vouch is a commitment-backed payment coordination system for pre-arranged appointments and in-person agreements.

```txt
both parties confirm presence within the confirmation window -> funds release
otherwise -> refund, void, or non-capture
```

Outcome follows system state. No unilateral action, late confirmation, admin arbitration, manual fund award, confirmation rewrite, dispute, evidence, or appeal surface can release funds.

## Architecture Rules

- Keep `app/**` as route shell only.
- Put reads in `lib/fetchers/*`.
- Put writes in `lib/actions/*`, `lib/db/transactions/*`, and `lib/integrations/*`.
- Keep Stripe SDK calls in `lib/integrations/stripe/*`.
- Keep auth helpers in `lib/auth/*`.
- Keep authz helpers in `lib/authz/*`.
- Keep Vouch state logic in `lib/vouch/*`.
- Keep Zod schemas in `schemas/*`.
- Keep transport-safe DTOs in `types/*`.
- Do not return raw Prisma rows or full Stripe objects.
- Do not place protected fetching or domain mutation in `components/**`.

## Forbidden Files And Routes

Do not create:

```txt
app/api/accounts/create/route.ts
app/api/accounts/session/route.ts
app/api/vouches/create/route.ts
app/api/vouches/confirm/route.ts
app/api/vouches/capture/route.ts
lib/stripe.ts
lib/db.ts
lib/types.ts
components/vouch-form.tsx
components/stripe-connect.tsx
components/confirmation-panel.tsx
```

Do not create marketplace, discovery, messaging, review, rating, dispute, claim, evidence, appeal, manual-award, or force-release surfaces.

## Readiness

Payer readiness gates creating or funding a Vouch:

- authenticated user
- active Vouch account
- required identity/adult readiness
- accepted terms
- Stripe customer/payment method setup
- provider-backed payment readiness stored in Vouch DB

Payee readiness gates accepting or becoming bound as payee:

- authenticated user
- active Vouch account
- required identity/adult readiness
- accepted terms
- Stripe connected account exists
- payout capability/readiness is sufficient
- provider-backed payout readiness stored in Vouch DB

Keep payer payment setup and payee payout setup separate.

## Stripe Rules

- Use manual-capture PaymentIntents.
- Create PaymentIntents only through `lib/integrations/stripe/payment-intents.ts`.
- Create/manage connected accounts only through `lib/integrations/stripe/connect.ts`.
- Retrieve current PaymentIntent state before capture, cancel, void, or refund.
- Use idempotency keys for all durable provider operations.
- Store only safe provider references and provider statuses.
- Do not store raw card data, raw bank data, raw identity documents, full provider payloads, or sensitive KYC details.
- Do not expose refund management, dispute management, evidence submission, capture controls, discretionary payment management, or manual fund movement in embedded Stripe components.

## Action Sequences

`createVouchAction`:

```txt
authenticate
authorize
Zod validate
load setup/payment readiness
calculate fee
create Stripe manual-capture PaymentIntent through integration module
create Vouch + PaymentRecord + Invitation through transaction
write audit event
revalidate affected paths/tags
return typed ActionResult
```

`acceptVouchAction` / `declineVouchAction`:

```txt
authenticate
authorize invitation access
Zod validate
verify invitation state
verify self-acceptance is denied
verify payee readiness
bind payee
transition Vouch state
write audit event
revalidate
return typed ActionResult
```

`confirmPresenceAction`:

```txt
authenticate
authorize active participant
Zod validate
load Vouch with minimal participant/payment/confirmation state
verify Vouch is active
verify confirmation window is open
prevent duplicate confirmation
write PresenceConfirmation transaction
derive updated confirmation truth
if both parties confirmed within window:
  retrieve current Stripe PaymentIntent
  capture with idempotency key
  persist provider-backed capture status
  transition Vouch to release-processing or completed according to provider result
else:
  transition/display waiting state
write audit event
revalidate
return typed ActionResult
```

## UI Rules

Use the dark brutalist operational SaaS design system:

- `rounded-none`
- `border border-neutral-700`
- `bg-black/55`
- `backdrop-blur-[2px]`
- `text-white`
- `text-neutral-400`
- `font-(family-name:--font-display)`
- uppercase labels/buttons/headings
- `bg-[#1D4ED8]` for primary action
- restrained blue accents
- dense mobile-first layouts

Every payment and Vouch screen must show amount, status, required action, deadline/window, and consequence. Status must use text, not color alone.

## Validation

For payment/domain work, run at least:

```bash
pnpm validate:contracts
pnpm prisma:validate
pnpm lint
pnpm typecheck
pnpm test
```

Run `pnpm test:e2e` for E2E-impacting route or UI changes.
