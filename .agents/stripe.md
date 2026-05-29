Yes. Here are the blueprints to paste into Codex.

## BLUEPRINT 1 — Stripe Connect Architecture Decision Record

Use this as the canonical Stripe architecture decision record.

BEGIN BLUEPRINT

Title: Stripe Connect Architecture for Appointment Deposit Authorization Protocol

Objective:
Implement a Stripe Connect integration where businesses pay the platform a one-time non-refundable protocol fee, then receive a Stripe-powered payment link/session that lets their customer authorize a deposit. The deposit is captured only if the platform’s two-party confirmation protocol determines that the appointment took place. If the protocol does not authorize capture, the customer authorization is canceled or allowed to expire. The customer deposit belongs to the business, not the platform.

Core product model:

- Platform sells a protocol/service to businesses.
- Business is the platform’s customer.
- Business is also the connected Stripe merchant.
- Business is merchant of record for customer deposit payments.
- Customer deposit is paid to the business.
- Platform does not collect or custody the customer deposit.
- Platform fee is paid separately by the business before the deposit authorization link/session is issued.
- Platform does not take Connect application fees from the customer deposit transaction.
- Platform is responsible only for correct protocol execution: no double capture, no incorrect capture, no missed capture when protocol conditions are satisfied.
- Business remains responsible for appointment scheduling, attendance, service quality, follow-up, refunds/disputes tied to the underlying service, and its customer relationship.

Stripe architecture decisions:

- Business model category: SaaS platform.
- Accounts API generation: Accounts v2.
- Connected account configuration: merchant + customer.
- Dashboard access: Full Stripe Dashboard.
- Onboarding surface: Stripe-hosted onboarding.
- Capabilities: card_payments + transfers / Stripe balance payouts as required by Accounts v2 merchant configuration.
- Service agreement: Full service agreement, not recipient-only.
- Charge type for customer deposit: Direct Charges.
- Destination charges: Rejected.
- Separate charges and transfers: Rejected.
- Funds flow: Customer deposit goes directly to the business connected account.
- Merchant of record / statement presentation: Business / connected merchant.
- Platform revenue: Separate one-time non-refundable fee charged to the business.
- Application fee strategy: None for deposit transactions.
- Pricing model: Stripe-owned pricing.
- SaaS billing model: One-time platform fee.
- Payout model: Automatic payouts.
- Verification strategy: Up-front verification.
- Cross-border support: US-only launch.
- Loss / negative-balance responsibility: Connected merchant responsibility wherever Stripe permits this under the selected model; do not configure platform/application responsibility unless required by Stripe or explicitly approved.
- Connected account visibility: Full Stripe Dashboard visibility for merchant payments, balances, payouts, disputes, reporting, and settings.

Stripe documentation facts to preserve:

- Accounts v2 supports one Account object with multiple configurations, including merchant for accepting payments and customer for charging the account. ([Stripe Docs][1])
- Stripe-hosted onboarding redirects connected accounts to Stripe so Stripe handles business and identity verification information with minimal platform effort. ([Stripe Docs][2])
- Direct charges create the payment directly on the connected account; the payment appears as a charge on the connected account, and the connected account balance increases. ([Stripe Docs][3])
- Stripe recommends direct charges for connected accounts that have access to the full Stripe Dashboard. ([Stripe Docs][4])
- Legacy account-type docs map Full Dashboard access to Standard-style accounts and show direct charges as the supported charge type for Standard/full-dashboard accounts. ([Stripe Docs][5])
- Express dashboard is not the intended model here; Stripe says if dashboard is express, losses_collector and fees_collector must both be application. ([Stripe Docs][6])

Implementation guardrails:

- Do not implement destination charges for customer deposits.
- Do not implement separate charges and transfers for customer deposits.
- Do not route customer deposit proceeds through the platform balance.
- Do not set application_fee_amount on customer deposit direct charges unless the product decision changes.
- Do not configure platform/application as losses collector or fees collector unless Stripe requires it for this selected model and the change is explicitly reviewed.
- Do not create a marketplace-style funds flow.
- Do not hide Stripe from businesses.
- Do not build Custom/no-dashboard onboarding.
- Do not collect appointment scheduling, appointment service details, service outcome details, or post-appointment service data unless required for the confirmation protocol.
- Store only the protocol data needed to decide capture/cancel: appointment timestamp, authorization window, confirmation window, merchant confirmation state, customer confirmation state, Stripe connected account ID, PaymentIntent/Checkout Session IDs, capture/cancel state, and audit timestamps.

END BLUEPRINT

---

## BLUEPRINT 2 — Codex Implementation Prompt

Paste this into Codex as the task prompt.

BEGIN CODEX PROMPT

You are working on a Next.js / TypeScript / Stripe integration. Implement or refactor the Stripe Connect integration to match the architecture below. Do not invent a marketplace architecture. Do not use destination charges. Do not use separate charges and transfers. Do not route customer deposit proceeds through the platform.

Canonical Stripe model:

- Accounts v2.
- Connected business account uses merchant + customer configurations.
- Stripe-hosted onboarding.
- Full Stripe Dashboard access.
- Full service agreement.
- Capabilities required for card payments and payouts/transfers.
- Direct Charges for customer deposit authorizations.
- Merchant/business is merchant of record.
- Customer deposit belongs to the connected business.
- Platform charges business a separate one-time non-refundable protocol fee.
- Customer deposit transaction must not include application_fee_amount.
- Platform fee must not be deducted from the customer deposit.
- Automatic payouts.
- Up-front verification.
- US-only launch.
- Stripe-owned pricing.
- Connected merchant responsibility wherever Stripe permits it.

Functional flow:

1. Merchant onboarding

- Create or retrieve an Accounts v2 Account for the business.
- Configure it as merchant + customer.
- Set country to US.
- Use Stripe-hosted onboarding.
- Redirect merchant to Stripe onboarding.
- Store the returned Stripe account ID on the local business/user/tenant record.
- After onboarding return, retrieve the account and check whether the merchant configuration and required capabilities are active.
- Do not proceed to deposit-link creation until the connected account is ready to accept card payments and receive payouts.

2. Merchant platform fee

- Before issuing the customer deposit authorization link/session, charge the business a one-time non-refundable platform/protocol fee.
- This fee is platform revenue.
- This fee is separate from the customer deposit.
- Store platform fee payment status.
- Only allow deposit authorization creation after platform fee payment succeeds.

3. Customer deposit authorization

- Create the customer deposit payment as a Direct Charge on the connected account.
- The PaymentIntent/Checkout Session must be created in the connected account context, using the connected account ID / Stripe-Account scoping.
- Use manual capture.
- Amount equals the customer deposit amount.
- Currency is USD.
- Do not set transfer_data.destination.
- Do not set application_fee_amount.
- Do not create the charge on the platform account.
- Do not transfer funds manually to the business.
- The connected business should be the merchant shown for the transaction.
- Save PaymentIntent ID, Checkout Session ID if used, connected account ID, amount, currency, authorization status, capture status, cancellation status, and audit timestamps.

4. Confirmation protocol

- Deposit authorization may only be created at most 24 hours before the appointment timestamp.
- Confirmation window is one hour before appointment time through one hour after appointment time.
- Capture is allowed only if both merchant and customer independently confirm that the appointment took place within the confirmation window.
- If both confirmations are present and the authorization is still capturable, capture the PaymentIntent on the connected account.
- If confirmation requirements are not satisfied before expiration/cutoff, cancel the PaymentIntent on the connected account if still cancelable.
- Prevent double capture, double cancel, capture-after-cancel, and cancel-after-capture using idempotency keys and database state checks.
- All Stripe API calls for direct charge PaymentIntent retrieval/capture/cancel must be scoped to the connected account.

5. Webhooks

- Handle platform-level events for onboarding/account updates and platform fee payments.
- Handle connected-account events for direct-charge PaymentIntents, charges, refunds, disputes, and payouts as needed.
- For direct charges, remember that PaymentIntent and Charge objects live on the connected account, not the platform account.
- Store enough Stripe IDs and connected account IDs to re-query direct charge objects using the connected account scope.
- Implement idempotent webhook processing.

6. Data model requirements
   Ensure persistence for:

- Local merchant/user/tenant ID.
- Stripe Accounts v2 account ID.
- Account onboarding status.
- Merchant configuration readiness.
- Customer configuration readiness if used for charging platform fee.
- Capability statuses.
- Platform fee payment ID/status.
- Appointment timestamp.
- Deposit amount/currency.
- Deposit authorization PaymentIntent ID.
- Checkout Session ID if Checkout is used.
- Connected account ID for the direct charge.
- Customer confirmation status/timestamp.
- Merchant confirmation status/timestamp.
- Authorization created timestamp.
- Capture deadline.
- Capture/cancel status.
- Stripe webhook event IDs processed.
- Idempotency keys for create/capture/cancel operations.

7. Explicit non-goals

- Do not build scheduling.
- Do not collect service details.
- Do not collect appointment outcome details beyond two-party confirmation.
- Do not mediate service disputes.
- Do not implement marketplace discovery, messaging, reviews, directories, or escrow language.
- Do not implement destination charges.
- Do not implement separate charges and transfers.
- Do not deduct platform revenue from the deposit.
- Do not make platform the merchant of record for the customer deposit.

8. Deliverables

- Update Stripe integration files.
- Add typed helper functions for:
  - createOrRetrieveConnectedAccount
  - createHostedOnboardingLink
  - getConnectedAccountReadiness
  - createPlatformFeeCheckoutOrPayment
  - createDirectChargeDepositAuthorization
  - captureDirectChargeDeposit
  - cancelDirectChargeDeposit
  - handleStripeWebhook

- Add clear comments explaining why direct charges are used.
- Add runtime guards that reject destination-charge parameters such as transfer_data.destination in the deposit authorization flow.
- Add idempotency keys for all Stripe mutation calls.
- Add tests or test stubs for:
  - merchant fee required before deposit link creation
  - direct charge uses connected account scope
  - manual capture is set
  - no application_fee_amount is set
  - no transfer_data.destination is set
  - capture requires both confirmations
  - cancellation happens when confirmations are missing
  - duplicate webhook events are ignored
  - capture/cancel cannot run twice

Use official Stripe docs as the source of truth. Preserve this architecture unless Stripe API constraints force a change. If a constraint is found, document the exact Stripe limitation and propose the smallest compliant alternative.

END CODEX PROMPT

---

## BLUEPRINT 3 — Stripe Configuration Summary for Codex

BEGIN CONFIG SUMMARY

Selected Stripe Connect configuration:

- API generation: Accounts v2
- Account configurations: merchant + customer
- Country: US
- Dashboard: Full Stripe Dashboard
- Onboarding: Stripe-hosted onboarding
- Service agreement: Full
- Capabilities: card_payments + Stripe balance payouts/transfers required for merchant payments
- Charge type: Direct Charges
- Capture method: manual
- Deposit PaymentIntent location: connected account
- Platform PaymentIntent location for merchant fee: platform account, unless using Accounts v2 customer config for business billing
- Application fee on deposit: none
- Transfer data on deposit: none
- Destination charge: no
- Separate charge and transfer: no
- Platform fee: one-time, non-refundable, separate from deposit
- Pricing: Stripe-owned pricing
- Payouts: automatic
- Verification: up-front
- Launch region: US only
- Risk/loss posture: merchant responsibility wherever compatible with Stripe configuration
- Stripe visibility: merchant gets Full Dashboard

Direct charge creation rule:
The customer deposit PaymentIntent or Checkout Session must be created against the connected account using Stripe connected-account scoping. Direct charge objects live on the connected account, not the platform. ([Stripe Docs][7])

Hosted onboarding rule:
Use Stripe-hosted onboarding to collect business and identity verification information; Stripe-hosted onboarding dynamically handles requirements based on capabilities, country, and business type. ([Stripe Docs][2])

Accounts v2 rule:
Use a single Accounts v2 Account object for the business with both merchant and customer configurations where supported. ([Stripe Docs][1])

END CONFIG SUMMARY

[1]: https://docs.stripe.com/connect/accounts-v2?utm_source=chatgpt.com "Connect and the Accounts v2 API"
[2]: https://docs.stripe.com/connect/hosted-onboarding?utm_source=chatgpt.com "Stripe-hosted onboarding"
[3]: https://docs.stripe.com/connect/direct-charges?utm_source=chatgpt.com "Create direct charges"
[4]: https://docs.stripe.com/connect/direct-charges?platform=web&ui=elements&utm_source=chatgpt.com "Create direct charges"
[5]: https://docs.stripe.com/connect/accounts?utm_source=chatgpt.com "Connect account types"
[6]: https://docs.stripe.com/connect/accounts-v2/connected-account-configuration?utm_source=chatgpt.com "Configure the behavior of connected accounts"
[7]: https://docs.stripe.com/connect/direct-charges?locale=en-GB&platform=ios&utm_source=chatgpt.com "Create direct charges"
