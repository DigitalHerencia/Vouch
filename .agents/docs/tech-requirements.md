# Vouch Technical Requirements

Source of truth date: 2026-04-30

## Core Requirements

Vouch is a server-authoritative SaaS payment coordination system for pre-arranged appointments and in-person agreements.

The merchant/provider creates a Vouch. The customer/client accepts and pays. The merchant/provider receives the protected amount if the release path succeeds.

Legacy names may remain temporarily:

- `payer` = merchant/provider/creator.
- `payee` = customer/client/paying acceptor.

## Pricing Requirements

Server code must calculate and persist:

- `protectedAmountCents`
- `merchantReceivesCents`
- `vouchServiceFeeCents`
- `processingFeeOffsetCents`
- `applicationFeeAmountCents`
- `customerTotalCents`

Stripe PaymentIntent creation must use:

- `amount = customerTotalCents`
- `application_fee_amount = applicationFeeAmountCents`
- `transfer_data.destination = merchant/provider connected account`

## Architecture Requirements

- `app/` contains route shells and route handlers only.
- `features/` owns page orchestration.
- `components/` are pure UI.
- `lib/**/fetchers` own protected reads.
- `lib/**/actions` own protected mutations.
- `schemas/` own runtime validation.
- `prisma/` owns schema and migrations.

## Security Requirements

Do not trust client-reported role, pricing, payment status, provider account, confirmation eligibility, or lifecycle state.

Do not store raw card data, raw identity documents, full provider payloads, or secrets.

Prevent IDOR, self-acceptance, duplicate confirmation, duplicate webhook processing, unsafe admin operations, and marketplace/arbitration drift.

## Validation Requirements

Run the smallest useful validation first, then broader checks:

- `pnpm validate:contracts`
- `pnpm prisma:validate`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm test:e2e` for E2E-impacting changes
