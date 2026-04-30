# Vouch Source Normalization

Source of truth date: 2026-04-30

## Canonical Sentence

Vouch is a commitment-backed payment coordination system where a merchant/provider creates a Vouch for a pre-arranged appointment or in-person agreement, and a customer/client accepts and pays.

## Canonical Actors

- Merchant/provider: creates the Vouch and receives the protected amount if the Vouch releases.
- Customer/client: accepts the Vouch and pays the customer total.
- System: calculates pricing, coordinates provider-backed payment state, resolves lifecycle outcomes, writes audit events, and reconciles webhooks.
- Admin: inspects operational state without arbitration powers.
- Stripe/payment provider: processes authorization, capture, application fee, connected-account transfer, refund, void, and payout state.

## Legacy Mapping

Existing implementation identifiers may remain temporarily during migration:

- `payer` = merchant/provider/creator.
- `payee` = customer/client/paying acceptor.
- `amountCents` = legacy compatibility alias for `protectedAmountCents`.
- `platformFeeCents` = legacy compatibility alias for `vouchServiceFeeCents`.

Do not introduce new product copy that presents the merchant as payer or the customer as payee.

## Canonical Money Fields

- `protectedAmountCents`: amount protected by the Vouch and paid out to the merchant/provider on release.
- `merchantReceivesCents`: equals `protectedAmountCents`.
- `vouchServiceFeeCents`: Vouch service fee, max of 5% or $5.00.
- `processingFeeOffsetCents`: customer-paid offset calculated to cover estimated Stripe processing cost on the final total.
- `applicationFeeAmountCents`: Vouch service fee plus processing offset.
- `customerTotalCents`: full amount charged to the customer/client.

## Forbidden Product Drift

Do not add marketplace, scheduler, broker, escrow, social, review, messaging, or arbitration behavior.
