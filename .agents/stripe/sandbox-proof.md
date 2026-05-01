# Stripe Sandbox Proof

Date: 2026-05-01

Stripe account source of truth:

- Live/main account: `Vouch` / `acct_1TQHH2GuFcEUvSe9`
- Sandbox platform account for proof: `Vouch sandbox` / `acct_1TPa46GV5dKxUPtb`
- Sandbox connected test account: `acct_1TQHpNGV5d6axbAJ`

Do not use `acct_1TQHH2GuFcEUvSe9` for sandbox destination PaymentIntent proof.
Do not hard-code the sandbox connected account ID into production code.

## Scope

This proof attempted to validate the manual-capture destination PaymentIntent flow for the current Vouch pricing model:

- `amount = customerTotalCents`
- `application_fee_amount = applicationFeeAmountCents`
- `transfer_data.destination = merchant/provider connected account`
- pricing snapshot metadata present on the PaymentIntent

No secrets are recorded in this document.

## 2026-05-01 Corrected Sandbox Platform Proof

Stripe CLI profile:

- `vouch sandbox`
- Reports account: `Vouch sandbox` / `acct_1TPa46GV5dKxUPtb`

Connected account:

- `acct_1TQHpNGV5d6axbAJ`
- Belongs to sandbox platform `acct_1TPa46GV5dKxUPtb`
- Test/sandbox only.

PaymentIntent created:

- ID: `pi_3TS6IhGV5dKxUPtb2Qm6I8Tx`
- latest charge: `ch_3TS6IhGV5dKxUPtb28Zv19oC`
- livemode: `false`

Verified PaymentIntent shape:

- `amount`: `10845`
- `amount_capturable`: `10845`
- `amount_received`: `0`
- `currency`: `usd`
- `capture_method`: `manual`
- `payment_method_types`: `["card"]`
- `automatic_payment_methods`: `null`
- `application_fee_amount`: `845`
- `transfer_data.destination`: `acct_1TQHpNGV5d6axbAJ`
- `on_behalf_of`: `null`
- `status`: `requires_capture`

Verified metadata:

- `vouch_id`: `sandbox-proof-2026-05-01-capture`
- `protected_amount_cents`: `10000`
- `merchant_receives_cents`: `10000`
- `vouch_service_fee_cents`: `500`
- `processing_fee_offset_cents`: `345`
- `application_fee_amount_cents`: `845`
- `customer_total_cents`: `10845`
- `payment_role`: `customer_commitment`

Stripe CLI command class used:

```txt
stripe -p "vouch sandbox" payment_intents create --amount 10845 --currency usd --capture-method manual -d "payment_method_types[0]=card" -d application_fee_amount=845 -d "transfer_data[destination]=acct_1TQHpNGV5d6axbAJ" -d "metadata[...]=..." -d payment_method=pm_card_visa -d confirm=true
```

Proof status:

- Manual-capture destination PaymentIntent proof: passed.
- `amount = customerTotalCents`: passed.
- `application_fee_amount = applicationFeeAmountCents`: passed.
- `transfer_data.destination = connected account`: passed.
- `status = requires_capture`: passed.
- pricing metadata: passed.

## 2026-05-01 Capture Proof

Captured PaymentIntent:

- ID: `pi_3TS6IhGV5dKxUPtb2Qm6I8Tx`
- latest charge: `ch_3TS6IhGV5dKxUPtb28Zv19oC`
- livemode: `false`

Verified capture result:

- `status`: `succeeded`
- `amount`: `10845`
- `amount_received`: `10845`
- `amount_capturable`: `0`
- `currency`: `usd`
- `capture_method`: `manual`
- `payment_method_types`: `["card"]`
- `application_fee_amount`: `845`
- `transfer_data.destination`: `acct_1TQHpNGV5d6axbAJ`
- `automatic_payment_methods`: `null`

Stripe CLI command class used:

```txt
stripe -p "vouch sandbox" payment_intents capture pi_3TS6IhGV5dKxUPtb2Qm6I8Tx
```

Capture proof status:

- Capture path: passed.
- `succeeded`/captured provider status: passed.
- `amount_received = customerTotalCents`: passed.

## 2026-05-01 Cancel Proof

Separate uncaptured PaymentIntent created for cancel proof:

- ID: `pi_3TS6RbGV5dKxUPtb0e8SXw7l`
- latest charge: `ch_3TS6RbGV5dKxUPtb08fQZH2b`
- livemode: `false`

Verified pre-cancel shape:

- `status`: `requires_capture`
- `amount`: `10845`
- `amount_capturable`: `10845`
- `amount_received`: `0`
- `currency`: `usd`
- `capture_method`: `manual`
- `payment_method_types`: `["card"]`
- `application_fee_amount`: `845`
- `transfer_data.destination`: `acct_1TQHpNGV5d6axbAJ`
- `automatic_payment_methods`: `null`

Verified cancel result:

- `status`: `canceled`
- `amount`: `10845`
- `amount_capturable`: `0`
- `amount_received`: `0`
- `currency`: `usd`
- `capture_method`: `manual`
- `payment_method_types`: `["card"]`
- `application_fee_amount`: `845`
- `transfer_data.destination`: `acct_1TQHpNGV5d6axbAJ`

Stripe CLI command classes used:

```txt
stripe -p "vouch sandbox" payment_intents create --amount 10845 --currency usd --capture-method manual -d "payment_method_types[0]=card" -d application_fee_amount=845 -d "transfer_data[destination]=acct_1TQHpNGV5d6axbAJ" -d "metadata[...]=..." -d payment_method=pm_card_visa -d confirm=true
stripe -p "vouch sandbox" payment_intents cancel pi_3TS6RbGV5dKxUPtb0e8SXw7l
```

Cancel proof status:

- Separate uncaptured PaymentIntent: passed.
- Cancel path: passed.
- `status = canceled`: passed.

Code patch decision:

- Safe to patch stale destination-charge lifecycle code that still assumes connected-account routing must be re-established at release/capture time.

## 2026-05-01 Wrong Platform Attempt

Requested connected account:

- `acct_1TQHpNGV5d6axbAJ`
- Test/sandbox only.
- Must not be hard-coded into production code.

Required first-proof PaymentIntent shape:

- `amount`: `10845`
- `currency`: `usd`
- `capture_method`: `manual`
- `payment_method_types`: `["card"]`
- `application_fee_amount`: `845`
- `transfer_data.destination`: `acct_1TQHpNGV5d6axbAJ`
- `payment_method`: `pm_card_visa`
- `confirm`: `true`
- metadata includes the pricing snapshot and `payment_role = "customer_commitment"`

Stripe CLI command class used:

```txt
stripe payment_intents create --amount 10845 --currency usd --capture-method manual -d "payment_method_types[0]=card" -d application_fee_amount=845 -d "transfer_data[destination]=acct_1TQHpNGV5d6axbAJ" -d "metadata[...]=..." -d payment_method=pm_card_visa -d confirm=true
```

Result:

- PaymentIntent ID: not created
- Stripe result: blocked
- Stripe error code: `resource_missing`
- Stripe error param: `transfer_data[destination]`
- Stripe error summary: `No such destination: 'acct_1TQHpNGV5d6axbAJ'`
- Request log URL account context: `acct_1TQHH2GuFcEUvSe9`

Connected-account verification:

- `stripe config --list` shows the active Stripe CLI project/account as `acct_1TQHH2GuFcEUvSe9` / `Vouch`.
- `stripe accounts list --limit 10` does not include `acct_1TQHpNGV5d6axbAJ`; it only returned `acct_1TS3vvGlBG0RLmL4`.
- `stripe v2 core accounts list --limit 10` does not include `acct_1TQHpNGV5d6axbAJ`; it only returned `acct_1TS3vvGlBG0RLmL4`.
- `stripe v2 core accounts retrieve acct_1TQHpNGV5d6axbAJ ...` returned `forbidden`, indicating this platform API key cannot access that account.

Proof status:

- Manual-capture destination PaymentIntent proof: failed before creation.
- `amount = customerTotalCents`: not provider-proven because no PaymentIntent was created.
- `application_fee_amount = applicationFeeAmountCents`: not provider-proven because no PaymentIntent was created.
- `transfer_data.destination = connected account`: failed; Stripe rejected the requested destination account.
- `status = requires_capture`: not reached.
- pricing metadata: not provider-proven because no PaymentIntent was created.
- capture path: not run.
- cancel path: not run.
- webhook event ID idempotency: not run against a real event from this proof.

Decision:

- This attempt is superseded by the corrected sandbox platform proof above.
- The error was caused by using the live/main account context for a sandbox connected account.

## Expected Pricing Snapshot

Test protected amount:

- `protectedAmountCents`: `10000`
- `merchantReceivesCents`: `10000`
- `vouchServiceFeeCents`: `500`
- `processingFeeOffsetCents`: `345`
- `customerTotalCents`: `10845`
- `applicationFeeAmountCents`: `845`

## Attempt 1: Express Connected Account

Connected account created:

- ID pattern: `acct_...LmL4`
- Type: `express`
- Country: `US`
- `charges_enabled`: `false`
- `payouts_enabled`: `false`
- `card_payments` capability: `inactive`
- `transfers` capability: `inactive`

PaymentIntent creation result:

- PaymentIntent ID: not created
- Expected amount: `10845`
- Expected application fee amount: `845`
- Expected destination: `acct_...LmL4`
- Stripe result: blocked
- Stripe error code: `insufficient_capabilities_for_transfer`
- Stripe error summary: destination account must have an enabled transfer-capable capability.

## Attempt 2: Custom Connected Account With Test Onboarding Fields

Goal:

- Create a test-mode custom connected account with requested `card_payments` and `transfers` capabilities.
- Add test identity, address, bank token, and ToS acceptance fields.
- Use it as the destination for a manual-capture PaymentIntent.

Connected account result:

- Connected account ID: not created
- PaymentIntent ID: not created
- Stripe result: blocked
- Stripe error summary: platform profile requires review of responsibility settings for collecting connected-account requirements.

## Release/Capture Path

Proven.

Reason:

- The corrected sandbox platform successfully created and confirmed a manual-capture destination PaymentIntent with `status = requires_capture`.
- The authorized PaymentIntent was captured successfully and Stripe returned `status = succeeded` with `amount_received = 10845`.

## Provider-Only Release Path

Partially proven.

Reason:

- Destination routing to the provider/merchant connected account is established at authorization time through `transfer_data.destination`.
- Release/capture code should capture the authorized PaymentIntent and should not require a second connected-account routing decision.

## Customer-Only Refund/Void/Non-Capture Path

Cancel/non-capture path proven for an uncaptured PaymentIntent.

Reason:

- A separate manual-capture destination PaymentIntent was created in `requires_capture` and then canceled successfully.

## Neither-Confirmed Refund/Void/Non-Capture Path

Not proven.

Reason:

- Blocked before PaymentIntent authorization.

## Webhook Reconciliation

Not proven.

Reason:

- No PaymentIntent, capture, cancel, or refund event was produced by the blocked destination-charge flow.
- Webhook signature verification and duplicate event idempotency still need a valid Stripe event from an authorized test flow.

## Unresolved Blockers

- Capture, cancel on a separate uncaptured PaymentIntent, and webhook idempotency still need to be run as follow-up proof steps if required for release readiness.
- The wrong-platform attempts remain in this document only as audit history.

## Required Next Step

Use Stripe CLI profile `vouch sandbox` for sandbox proof work. Do not use live/main account `acct_1TQHH2GuFcEUvSe9` for sandbox destination PaymentIntent proof.
