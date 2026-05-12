<div align="center">
  <img src="./public/VOUCHdark.png" alt="Vouch" width="560" />

  <br />
  <br />

  <h3>Commitment-backed payment coordination for real-world agreements.</h3>

  <p>
    Create a Vouch. Accept the commitment. Confirm presence.<br />
    Both confirm in time and funds release. Otherwise, refund, void, or non-capture.
  </p>

  <p>
    <a href="#core-rule">Core rule</a>
    ·
    <a href="#how-it-works">How it works</a>
    ·
    <a href="#payment-coordination">Payment coordination</a>
    ·
    <a href="#what-vouch-is-not">Boundaries</a>
    ·
    <a href="#license">License</a>
  </p>

  <p>
    <img alt="MIT License" src="https://img.shields.io/badge/license-MIT-1D4ED8?style=for-the-badge&labelColor=000000" />
    <img alt="Status" src="https://img.shields.io/badge/status-active%20development-1D4ED8?style=for-the-badge&labelColor=000000" />
    <img alt="Product" src="https://img.shields.io/badge/product-payment%20coordination-1D4ED8?style=for-the-badge&labelColor=000000" />
    <img alt="Not Escrow" src="https://img.shields.io/badge/not-escrow-1D4ED8?style=for-the-badge&labelColor=000000" />
    <img alt="Not Marketplace" src="https://img.shields.io/badge/not-marketplace-1D4ED8?style=for-the-badge&labelColor=000000" />
  </p>

  <p>
    <img alt="Next.js" src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" />
    <img alt="React" src="https://img.shields.io/badge/React-000000?style=flat-square&logo=react&logoColor=61DAFB" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-000000?style=flat-square&logo=typescript&logoColor=3178C6" />
    <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-000000?style=flat-square&logo=tailwindcss&logoColor=38BDF8" />
    <img alt="Stripe" src="https://img.shields.io/badge/Stripe-000000?style=flat-square&logo=stripe&logoColor=635BFF" />
    <img alt="Clerk" src="https://img.shields.io/badge/Clerk-000000?style=flat-square&logo=clerk&logoColor=6C47FF" />
    <img alt="Prisma" src="https://img.shields.io/badge/Prisma-000000?style=flat-square&logo=prisma&logoColor=white" />
    <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-000000?style=flat-square&logo=postgresql&logoColor=4169E1" />
    <img alt="Neon" src="https://img.shields.io/badge/Neon-000000?style=flat-square&logo=neon&logoColor=00E599" />
    <img alt="Vercel" src="https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white" />
  </p>
</div>

# Vouch

**Vouch is a commitment-backed payment coordination system for pre-arranged appointments and in-person agreements.**

It is built around one deterministic rule:

> **Both parties confirm presence within the confirmation window -> funds release.**
> **Otherwise -> refund, void, or non-capture.**

Outcome follows system state.

No unilateral action releases funds.
No late confirmation releases funds.
No admin arbitration releases funds.
No manual fund award exists.
No discretionary confirmation rewrite exists.
No dispute, evidence, or appeal surface exists.

---

## Core Rule

```txt
both parties confirm presence within the confirmation window -> funds release
otherwise -> refund, void, or non-capture
```

Vouch does not decide who was right. It checks authenticated state, provider-backed payment state, and the confirmation window.

| Confirmation outcome         | Payment outcome                            |
| ---------------------------- | ------------------------------------------ |
| Both parties confirm in time | Funds release                              |
| Only one party confirms      | Refund, void, or non-capture               |
| Neither party confirms       | Refund, void, or non-capture               |
| Confirmation window expires  | Refund, void, or non-capture               |
| Payment provider fails       | Payment failed, release failed, or refund failed |

One-sided confirmation never releases funds.

---

## How It Works

### 1. Create

The payer creates or funds a Vouch with an amount and confirmation window.

### 2. Accept

The payee reviews the Vouch and accepts only when payout readiness requirements are satisfied.

### 3. Confirm

Both participants independently confirm presence inside the confirmation window.

### 4. Resolve

If both confirmations happen in time and the PaymentIntent is capturable, Vouch releases funds through provider-backed settlement.

Anything else resolves to refund, void, or non-capture according to current provider state.

---

## Payment Coordination

Vouch coordinates payment state through Stripe and Stripe Connect.

Vouch uses manual-capture PaymentIntents:

```txt
amount = customer total amount in cents
capture_method = manual
application_fee_amount = calculated Vouch fee
transfer_data.destination = payee connected account id when destination charge is used
```

Before settlement, Vouch retrieves current provider state. Capture, cancel/void, refund, webhook reconciliation, and operational retries are idempotent.

Vouch does not directly custody funds and does not store raw card data, raw bank data, raw identity documents, full provider payloads, or sensitive KYC details.

---

## Readiness

Payer readiness is required for creating or funding a Vouch:

- authenticated user
- active Vouch account
- required identity/adult readiness
- accepted terms
- Stripe customer/payment method setup
- provider-backed payment readiness stored in Vouch DB

Payee readiness is required for accepting or becoming bound as payee:

- authenticated user
- active Vouch account
- required identity/adult readiness
- accepted terms
- Stripe connected account exists
- Stripe payout capability/readiness is active or sufficient
- provider-backed payout readiness stored in Vouch DB

Payer payment setup and payee payout setup are separate tracks.

---

## Pricing

Fee calculation is server-owned and belongs in `lib/vouch/fees.ts`.

```txt
Vouch fee = max(5% of customer total, 500 cents)
```

Fees are shown before payment commitment.

---

## What Vouch Is Not

Vouch is intentionally narrow.

It is not:

- a marketplace
- a broker
- a scheduler
- a messaging app
- a review system
- a dispute system
- an escrow provider
- a public directory
- a discovery platform

Vouch does not provide public profiles, listings, search, categories, recommendations, featured blocks, ratings, reviews, reputation scores, messaging, dispute workflows, claims, evidence uploads, appeals, manual awards, or force-release controls.

---

## Stack

- Next.js App Router
- React 19
- TypeScript
- Prisma + Neon Postgres
- Clerk
- Stripe + Stripe Connect
- Zod
- React Hook Form
- Tailwind CSS v4
- shadcn/Base UI
- Vitest
- Playwright
- pnpm

---

## Design Language

Vouch uses a dark brutalist operational SaaS interface:

- black-first surfaces
- zero-radius panels
- hard neutral borders
- restrained Vouch blue: `#1D4ED8`
- uppercase display typography
- dense mobile-first layouts
- amount, status, required action, deadline/window, and consequence visible on payment and Vouch screens
- status expressed with text, not color alone

---

## Status

Vouch is in active development.

The public repository exists to build the product openly while preserving the product’s narrow operating boundaries.

---

## License

MIT License.

Made in Nuevo Mexico | 2026 Ivan P. Roman | Digital Herencia
