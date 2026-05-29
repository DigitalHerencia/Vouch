# .agents Conflict Check

Checked source files:

- `.agents/stripe.md`
- `.agents/clerk.md`
- `.agents/neon.md`
- `.agents/stack.md`

## Findings

No blocking conflict was found in the product redesign direction.

Aligned decisions:

- Vouch is a B2B SaaS protocol, not a marketplace.
- Business is the connected Stripe merchant.
- Customer deposit belongs to the connected business.
- Platform fee is separate platform revenue.
- Customer deposit uses Stripe Connect direct charges.
- Customer deposit uses manual capture.
- Customer deposit must not use destination charges, separate charges and transfers, or application fees.
- Clerk owns identity and sessions.
- Prisma owns product, payment, Stripe ID, confirmation, and webhook state.
- `.agents` is the active governance directory.

## Non-Blocking Issues To Preserve Or Fix During Later Implementation

- `.agents/neon.md` contains a schema typo: `Merchantes` should be `Merchants`.
- `.agents/neon.md` references `MerchantStatus` in the Prisma model but does not define the enum in the pasted schema blueprint.
- `.agents/stack.md` uses `EuaAcceptedAt`; confirm exact casing against the real Prisma schema before implementation.
- `CODE_OF_CONDUCT.md` appears to contain an embedded `CONTRIBUTING.md` block instead of a clean standalone conduct file. This is stale documentation, not active `.agents` governance.

