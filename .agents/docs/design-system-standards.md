# Vouch Design System Standards

Source date: 2026-05-16

The supplied mockups define direction, not one-for-one layout. The system is black, dense, operational, square, state-first, and blue-accented.

## Visual Tokens

- Background: black / `black`.
- Panel: black or `black`.
- Text: `white` or white for primary, `neutral-400` for muted.
- Borders: `neutral-700` for visible structure, `neutral-800` for internal rows.
- Accent: blue-600 / Vouch primary only.
- Radius: none.
- Shadow: hard blue offset on major panels and callouts only.

## Layout

- Root layout owns fonts, providers, and sitewide black/blue grid background.
- Route group layouts only establish shells.
- Main page width: `max-w-7xl`.
- Horizontal padding: `px-6 sm:px-10 lg:px-12`.
- Vertical page rhythm: `py-12 lg:py-16`.
- Mobile bottom navigation must be offset with `pb-20 md:pb-0`.
- Do not nest cards inside cards for decorative effect.

## Typography

- H1: Archivo Black, uppercase, tight leading, width-clamped.
- H2/H3/display labels: Bebas Neue, uppercase, tight leading.
- Body: Archivo, readable leading, constrained line length.
- Buttons, nav, captions, labels: uppercase display/mono style.
- Letter spacing must not be negative in new component standards.

## Primitives

Use shadcn/Base UI primitives for structure and behavior:

- Card: major structured panel when header/content/footer anatomy matters.
- Alert: inline consequence, readiness, provider, or status message.
- Badge: compact textual status label.
- Separator: hard division between rows/actions/legal sections.
- Field/Input/Checkbox/Select/Textarea/InputOTP: form controls only.
- Button: explicit user action.
- Drawer/Dialog: secondary Vouch-detail and provider redirect interactions.
- AlertDialog: destructive or consequence-heavy confirmation.
- Sonner: action result notification.
- Skeleton: loading shape matching final layout.
- Progress: time/window/loading indicator.

## Components

Shared components are preferred:

- `PageHero`
- `SectionIntro`
- `ProcessPanel`
- `MetricGrid`
- `CardGrid`
- `ContentSectionList`
- `CalloutPanel`

Specialized Vouch components are justified only for Vouch-specific state:

- Vouch cards and Vouch card groups.
- Vouch detail header and immutable terms summary.
- Lifecycle, payment, confirmation, timeline, and action panels.
- Code exchange, protocol, and provider redirect drawers.

## Forms

Every Vouch form uses React Hook Form, Zod resolver, Field primitives, shadcn controls, Button, Alert for inline errors, and AlertDialog/Drawer for consequence-heavy confirmation.

Create Vouch collects only:

- amount
- appointment date/time
- confirmation window

Confirm create requires per-Vouch disclaimer acceptance and explains merchant fee payment through hosted Stripe checkout.

Forbidden Vouch form fields:

- participant/customer field
- memo/private note
- messaging field
- dispute/evidence field
- service category or public listing metadata

## Stripe-Hosted Contract

- Merchant Vouch creation fee is paid at commit/create time through hosted Stripe checkout.
- Customer payment method and payment authorization are handled through hosted Stripe checkout/payment flow.
- Stripe Connect handles identity, compliance, payout readiness, and account management.
- Browser return state is never payment truth.
- Vouch never hosts card, bank, identity, payout, or payment authorization forms.

## Page Standards

Landing: hero, process panel, metrics, use cases, bottom callout.

Pricing: product-definition surface explaining fee timing, provider rails, and confirmation outcome.

FAQ/terms/privacy: reading-first `PageHero -> ContentSectionList -> CalloutPanel`.

Auth: split desktop, form-focused mobile, no provider collection.

Dashboard: state-grouped Vouch index, not analytics.

Create Vouch: draft form, immutable review, disclaimer, hosted Stripe merchant fee checkout.

Checkout success: provider return context only.

Vouch detail: operational center for terms, lifecycle, payment, confirmation, timeline, and role-aware safe actions.

## Forbidden UI Direction

Do not add marketplace, scheduling, messaging, public provider discovery, review, rating, dispute, evidence, appeal, manual release, force release, support override, or admin settlement surfaces.
