## Overview

Purpose: route-by-route implementation plan for Vouch pages. Each `app/**/page.tsx` stays a thin route shell. Page-specific orchestration lives in `features/**`. Fetchers/actions are server-side only. Components stay pure. No marketplace, no arbitration, no direct custody.

## Global import conventions

| Layer       | Import pattern                                                                                                                                                            | Rule                                                                                               |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Route shell | `import { XPage } from "@/features/..."`                                                                                                                                  | Route segment, metadata, thin prop handoff only. No Prisma, Stripe, authz, or domain logic.        |
| Feature     | `import { fetcher } from "@/lib/fetcher/..."`; `import { action } from "@/lib/actions/..."`; `import type ... from "@/types/..."`; `import ...Schema from "@/schema/..."` | Page orchestration, search-param normalization, suspense/loading/error composition, action wiring. |
| Components  | `import { Button } from "@/components/ui/button"`; domain components from `@/components/...`                                                                              | Pure UI. No protected data fetching, no Stripe/Clerk server calls, no hidden business rules.       |

---

## `/` — Home / Marketing Landing

| Area                 | Plan                                                                                                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route shell imports  | `LandingPage` from `@/features/marketing/landing-page`; optional `metadata`                                                                                                |
| Feature logic        | Compose hero, mechanism, use cases, pricing, FAQ preview, legal-safe positioning, CTA. Static/revalidated public content only. Track marketing page/CTA events if enabled. |
| Types / schemas      | `MarketingPageID`, `MarketingCtaID`, `MarketingEventInput`; `marketingPageViewedSchema`, `marketingCtaClickedSchema`                                                       |
| Fetchers             | `getLandingPageContent`, `getPublicNavigation`, `getPublicFooterContent`                                                                                                   |
| Actions              | `trackMarketingPageViewed`, `trackMarketingCtaClicked`                                                                                                                     |
| Components           | `PublicShell`, `MarketingHero`, `VouchProcessPanel`, `UseCasesSection`, `PricingSummarySection`, `TrustAndNeutralitySection`, `FaqSection`, `FinalCtaSection`              |
| shadcn/ui primitives | `button`, `card`, `badge`, `separator`, `accordion`                                                                                                                        |
| Notes                | No provider cards, category grids, reviews, ratings, marketplace CTAs, or social-proof implying provider endorsement.                                                      |

## `/how-it-works` — How It Works

| Area                 | Plan                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| Route shell imports  | `HowItWorksPage` from `@/features/marketing/how-it-works-page`                                    |
| Feature logic        | Explain four deterministic steps: create, accept, confirm, release/refund. Public static content. |
| Types / schemas      | `MarketingPageID`, `MarketingCtaEventInput`; `marketingPageIdSchema`                              |
| Fetchers             | `getHowItWorksContent`, `getPublicNavigation`, `getPublicFooterContent`                           |
| Actions              | `trackMarketingPageViewed`, `trackMarketingCtaClicked`                                            |
| Components           | `PublicShell`, `PageHeader`, `VouchProcessPanel`, `TrustAndNeutralitySection`, `FinalCtaSection`  |
| shadcn/ui primitives | `button`, `card`, `badge`, `separator`, `accordion`                                               |
| Notes                | Must frame Vouch as payment coordination, not booking/scheduling software.                        |

## `/pricing` — Pricing

| Area                 | Plan                                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| Route shell imports  | `PricingPage` from `@/features/marketing/pricing-page`                                                      |
| Feature logic        | Explain platform fee, minimum fee, percentage fee, and that fees are shown before commitment.               |
| Types / schemas      | `MarketingPageID`, `MoneyCents`, `PercentageBasisPoints`; `moneyCentsSchema`, `percentageBasisPointsSchema` |
| Fetchers             | `getPricingContent`, `getPublicNavigation`, `getPublicFooterContent`                                        |
| Actions              | `trackMarketingPageViewed`, `trackMarketingCtaClicked`                                                      |
| Components           | `PublicShell`, `PageHeader`, `PricingSummarySection`, `FeeBreakdown`, `FinalCtaSection`                     |
| shadcn/ui primitives | `button`, `card`, `badge`, `separator`, `table`                                                             |
| Notes                | Do not imply escrow or custody. Pricing copy must be conservative.                                          |

## `/faq` — FAQ

| Area                 | Plan                                                                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Route shell imports  | `FaqPage` from `@/features/marketing/faq-page`                                                                                                 |
| Feature logic        | Answer product definition, marketplace denial, custody denial, one-confirmation case, no-confirmation case, no-dispute rule, guarantee denial. |
| Types / schemas      | `MarketingPageID`; `marketingPageIdSchema`                                                                                                     |
| Fetchers             | `getFaqContent`, `getPublicNavigation`, `getPublicFooterContent`                                                                               |
| Actions              | `trackMarketingPageViewed`, `trackMarketingCtaClicked`                                                                                         |
| Components           | `PublicShell`, `PageHeader`, `FaqSection`, `FinalCtaSection`                                                                                   |
| shadcn/ui primitives | `accordion`, `button`, `card`, `separator`                                                                                                     |
| Notes                | Strong place to reinforce: both confirm or refund/non-capture.                                                                                 |

## `/legal/terms` — Terms

| Area                 | Plan                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Route shell imports  | `LegalPage` from `@/features/marketing/legal-page` with `pageId="terms"`                                                                    |
| Feature logic        | Render legal-safe terms content: payment coordination, not marketplace, not arbitration, provider handles payments, dual-confirmation rule. |
| Types / schemas      | `LegalPageID`; `legalPageIdSchema`                                                                                                          |
| Fetchers             | `getTermsPageContent`, `getPublicNavigation`, `getPublicFooterContent`                                                                      |
| Actions              | `trackMarketingPageViewed`                                                                                                                  |
| Components           | `PublicShell`, `PageHeader`, `SectionHeader`                                                                                                |
| shadcn/ui primitives | `card`, `separator`, `accordion`                                                                                                            |
| Notes                | No legal overclaiming; production copy still needs counsel review.                                                                          |

## `/legal/privacy` — Privacy

| Area                 | Plan                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| Route shell imports  | `LegalPage` from `@/features/marketing/legal-page` with `pageId="privacy"`                                   |
| Feature logic        | Explain data minimization, payment references, verification references, audit records, notification records. |
| Types / schemas      | `LegalPageID`; `legalPageIdSchema`                                                                           |
| Fetchers             | `getPrivacyPageContent`, `getPublicNavigation`, `getPublicFooterContent`                                     |
| Actions              | `trackMarketingPageViewed`                                                                                   |
| Components           | `PublicShell`, `PageHeader`, `SectionHeader`                                                                 |
| shadcn/ui primitives | `card`, `separator`, `accordion`                                                                             |
| Notes                | Must explicitly avoid raw card data, raw identity documents, and unnecessary meeting-purpose data.           |

## `/sign-in` — Sign In

| Area                 | Plan                                                                                                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route shell imports  | `SignInPage` from `@/features/auth/sign-in-page`                                                                                                                            |
| Feature logic        | Resolve auth page state, preserve invite/create return context, render Clerk sign-in entry. Redirect authenticated users to validated internal return path or `/dashboard`. |
| Types / schemas      | `AuthEntryContext`, `AuthRedirectState`; `authEntryContextSchema`, `authReturnToSchema`, `internalReturnToPathSchema`                                                       |
| Fetchers             | `getSignInPageState`, `getAuthPageState`, `getInvitePreservedAuthContext`                                                                                                   |
| Actions              | `resolvePostAuthRedirect`, `ensureLocalUserForSession`, `updateLastSignedInAt`                                                                                              |
| Components           | `PublicShell`, `PageHeader`, auth container/state panels                                                                                                                    |
| shadcn/ui primitives | `card`, `button`, `alert`, `separator`                                                                                                                                      |
| Notes                | Clerk handles credential UI. App owns redirect validation and local readiness state.                                                                                        |

## `/sign-up` — Sign Up

| Area                 | Plan                                                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Route shell imports  | `SignUpPage` from `@/features/auth/sign-up-page`                                                                      |
| Feature logic        | Resolve signup state, preserve invite token or create-flow return, render Clerk sign-up, route to setup/dashboard.    |
| Types / schemas      | `AuthEntryContext`, `AuthRedirectState`; `authEntryContextSchema`, `authReturnToSchema`, `internalReturnToPathSchema` |
| Fetchers             | `getSignUpPageState`, `getAuthPageState`, `getInvitePreservedAuthContext`                                             |
| Actions              | `syncClerkUser`, `ensureLocalUserForSession`, `resolvePostAuthRedirect`                                               |
| Components           | `PublicShell`, `PageHeader`, auth context banner                                                                      |
| shadcn/ui primitives | `card`, `button`, `alert`, `separator`                                                                                |
| Notes                | Local `User` and default `VerificationProfile` are created via signed Clerk webhook/idempotent sync.                  |

## `/dashboard` — User Dashboard

| Area                 | Plan                                                                                                                                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route shell imports  | `DashboardPage` from `@/features/dashboard/dashboard-page`                                                                                                                                         |
| Feature logic        | Parse search params, fetch participant-scoped dashboard state, render setup banner and sections: action required, active, pending, completed, expired/refunded.                                    |
| Types / schemas      | `DashboardSearchParams`, `DashboardPageState`, `VouchCardState`; `dashboardSearchParamsSchema`, `vouchStatusFilterSchema`                                                                          |
| Fetchers             | `getDashboardPageState`, `getDashboardSummary`, `getDashboardSetupBanner`, `getActionRequiredVouches`, `getActiveVouches`, `getPendingVouches`, `getCompletedVouches`, `getExpiredRefundedVouches` |
| Actions              | none for MVP; optional `updateDashboardPreferences` later                                                                                                                                          |
| Components           | `AppShell`, `PageHeader`, `DashboardSection`, `VouchCard`, `VouchStatusBadge`, `VouchDeadline`, `NextActionPanel`, `SetupChecklist`, `EmptyState`                                                  |
| shadcn/ui primitives | `card`, `button`, `badge`, `tabs`, `skeleton`, `alert`, `progress`, `dropdown-menu`                                                                                                                |
| Notes                | Dashboard broad queries include only payer and accepted payee Vouches; invite candidates stay on invite route.                                                                                     |

## `/setup` — Setup Checklist

| Area                 | Plan                                                                                                                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route shell imports  | `SetupPage` from `@/features/setup/setup-page`                                                                                                                                           |
| Feature logic        | Validate `return_to`, fetch setup checklist/progress/blockers, preserve invite/create context, render terms acceptance and required setup CTAs.                                          |
| Types / schemas      | `SetupPageState`, `SetupChecklistItemState`, `SetupGateResult`; `setupReturnContextSchema`, `setupActionSchema`, `internalReturnToPathSchema`                                            |
| Fetchers             | `getSetupPageState`, `getSetupChecklist`, `getSetupProgress`, `getSetupBlockersForAction`, `getTermsAcceptanceStatus`, `getSetupReturnContext`, `getAccountReadinessSummary`             |
| Actions              | `acceptTerms`, `refreshSetupStatus`, `continueAfterSetup`, `startRequiredSetupForCreate`, `startRequiredSetupForAccept`, `startRequiredSetupForConfirm`                                  |
| Components           | `AppShell`, `PageHeader`, `SetupChecklist`, `SetupChecklistItem`, `SetupProgressPanel`, `SetupBlockedPanel`, `SetupReturnContextBanner`, `TermsAcceptancePanel`, `TermsAcceptanceDialog` |
| shadcn/ui primitives | `card`, `button`, `checkbox`, `progress`, `alert`, `dialog`, `separator`, `skeleton`                                                                                                     |
| Notes                | No public profile, provider bio, services, portfolio, categories, availability, reviews, or ratings fields.                                                                              |

## `/settings` — Account Settings

| Area                 | Plan                                                                                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route shell imports  | `AccountSettingsPage` from `@/features/settings/account-settings-page`                                                                                                                            |
| Feature logic        | Fetch private account/readiness state, render profile basics, verification, payment, payout, terms, account security.                                                                             |
| Types / schemas      | `SettingsPageState`, `PrivateAccountInfo`, `ReadinessCardState`; `settingsUpdateSchema`, `profileBasicsSchema`                                                                                    |
| Fetchers             | `getAccountSettings`, `getProfileBasics`, `getPrivateAccountInfo`, `getAccountStatusCard`, `getVerificationStatusCard`, `getPaymentReadinessCard`, `getPayoutReadinessCard`, `getTermsStatusCard` |
| Actions              | `updateProfileBasics`, `refreshAccountReadiness`, `startSettingsPaymentSetup`, `startSettingsPayoutSetup`, `startSettingsVerification`, `acceptSettingsTerms`                                     |
| Components           | `AppShell`, `PageHeader`, `SettingsSection`, `AccountStatusCard`, `VerificationStatusCard`, `PaymentReadinessCard`, `PayoutReadinessCard`, `TermsStatusCard`                                      |
| shadcn/ui primitives | `card`, `button`, `input`, `label`, `form`, `badge`, `tabs`, `alert`, `separator`                                                                                                                 |
| Notes                | Private readiness only. Do not create marketplace profile fields.                                                                                                                                 |

## `/settings/payment` — Payment Setup

| Area                 | Plan                                                                                                                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route shell imports  | `PaymentSettingsPage` or `PaymentSetupPage` from `@/features/settings/payment-settings-page` / `@/features/payments/payment-setup-page`                                                        |
| Feature logic        | Fetch payment method readiness, show setup/ready/failed/provider-return states, start Stripe-hosted/provider-secure payment setup.                                                             |
| Types / schemas      | `PaymentReadinessStatus`, `PaymentSettingsPageState`; `paymentSetupSchema`, `paymentProviderReturnSchema`                                                                                      |
| Fetchers             | `getPaymentSettingsPageState`, `getPaymentMethodReadiness`, `getPaymentMethodSetupState`, `getPaymentMethodProviderRedirectState`, `getPaymentMethodReadyState`, `getPaymentMethodFailedState` |
| Actions              | `startPaymentMethodSetup`, `handlePaymentMethodSetupReturn`, `refreshPaymentReadiness`                                                                                                         |
| Components           | `AppShell`, `PageHeader`, `PaymentReadinessCard`, `PaymentSummary`, `PaymentStatusBadge`, provider redirect/ready/failed states                                                                |
| shadcn/ui primitives | `card`, `button`, `badge`, `alert`, `skeleton`, `separator`                                                                                                                                    |
| Notes                | Do not collect raw card data. Store provider references/readiness only.                                                                                                                        |

## `/settings/payout` — Payout Setup

| Area                 | Plan                                                                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route shell imports  | `PayoutSettingsPage` or `PayoutSetupPage` from `@/features/settings/payout-settings-page` / `@/features/payments/payout-setup-page`                                                         |
| Feature logic        | Fetch payout readiness, show onboarding/ready/restricted/failed states, start Stripe Connect onboarding.                                                                                    |
| Types / schemas      | `PayoutReadinessStatus`, `PayoutSettingsPageState`; `payoutSetupSchema`, `payoutProviderReturnSchema`                                                                                       |
| Fetchers             | `getPayoutSettingsPageState`, `getPayoutReadiness`, `getPayoutSetupState`, `getPayoutProviderRedirectState`, `getPayoutReadyState`, `getPayoutRestrictedState`, `getPayoutSetupFailedState` |
| Actions              | `startPayoutOnboarding`, `handlePayoutOnboardingReturn`, `refreshPayoutReadiness`                                                                                                           |
| Components           | `AppShell`, `PageHeader`, `PayoutReadinessCard`, `PaymentSummary`, `PaymentStatusBadge`, payout redirect/ready/restricted/failed states                                                     |
| shadcn/ui primitives | `card`, `button`, `badge`, `alert`, `skeleton`, `separator`                                                                                                                                 |
| Notes                | Payee acceptance requires payout ready. No raw bank details stored locally.                                                                                                                 |

## `/settings/verification` — Verification Setup

| Area                 | Plan                                                                                                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route shell imports  | `VerificationSettingsPage` from `@/features/settings/verification-settings-page`                                                                                                                                    |
| Feature logic        | Fetch identity/adult verification status, show start/return/blocked/requires-action/rejected/verified states.                                                                                                       |
| Types / schemas      | `VerificationStatus`, `VerificationPageState`; `verificationProviderReturnSchema`, `startVerificationSchema`                                                                                                        |
| Fetchers             | `getVerificationStatus`, `getIdentityVerificationState`, `getAdultVerificationState`, `getVerificationProviderReturnState`, `getVerificationBlockedState`, `getVerificationStatusCard`                              |
| Actions              | `startIdentityVerification`, `startAdultVerification`, `handleVerificationProviderReturn`, `reconcileVerificationProfile`, `markVerificationRequiresAction`, `markVerificationRejected`, `markVerificationVerified` |
| Components           | `AppShell`, `PageHeader`, `VerificationStatusCard`, `SetupChecklist`, verification status/blocked panels                                                                                                            |
| shadcn/ui primitives | `card`, `button`, `badge`, `alert`, `progress`, `skeleton`, `separator`                                                                                                                                             |
| Notes                | Do not store raw identity documents or full verification payloads.                                                                                                                                                  |

## `/vouches` — Vouch List

| Area                 | Plan                                                                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route shell imports  | `VouchListPage` from `@/features/vouches/list/vouch-list-page`                                                                                        |
| Feature logic        | Parse `status`, `page`, `sort`, fetch participant-scoped Vouches, render filters/list/empty/loading/error.                                            |
| Types / schemas      | `VouchListSearchParams`, `VouchListPageState`, `VouchCardState`; `vouchListSearchParamsSchema`, `vouchStatusSchema`, `paginationInputSchema`          |
| Fetchers             | `listUserVouches`, `listPayerVouches`, `listPayeeVouches`, `getParticipantSafePaymentSummary`, `getParticipantSafeAuditTimeline`                      |
| Actions              | none for list itself                                                                                                                                  |
| Components           | `AppShell`, `PageHeader`, `VouchListFilters`, `VouchCard`, `VouchStatusBadge`, `VouchAmountSummary`, `VouchDeadline`, `NextActionPanel`, `EmptyState` |
| shadcn/ui primitives | `tabs`, `select`, `card`, `button`, `badge`, `skeleton`, `dropdown-menu`                                                                              |
| Notes                | URL search params are canonical. No marketplace inbox or chat inbox.                                                                                  |

## `/vouches/new` — Create Vouch

| Area                 | Plan                                                                                                                                                                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route shell imports  | `CreateVouchPage` from `@/features/vouches/create/create-vouch-page`                                                                                                                                                                     |
| Feature logic        | Fetch create gate/page state, render blocked or form flow, calculate fee preview, review rules, submit `createVouch`, show success/payment processing/payment failed states.                                                             |
| Types / schemas      | `CreateVouchInput`, `CreateVouchDraft`, `CreateVouchPageState`, `FeePreview`; `createVouchSchema`, `createVouchDraftSchema`, `feePreviewSchema`, `shortLabelSchema`                                                                      |
| Fetchers             | `getCreateVouchPageState`, `getCreateVouchBlockedState`, `getCreateVouchFeePreview`, `getCreateVouchReviewState`, `getCreateVouchSuccessState`, `getCreateVouchPaymentProcessingState`, `getCreateVouchPaymentFailedState`               |
| Actions              | `createVouch`, `validateCreateVouchDraft`, `calculatePlatformFee`, `createVouchInvitation`, `initializeVouchPayment`, `sendVouchInvitation`                                                                                              |
| Components           | `AppShell`, `PageHeader`, `FormShell`, `MoneyInput`, `DateTimeInput`, `TermsCheckbox`, `FeeBreakdown`, `PaymentSummary`, `CreateVouchForm`, `CreateVouchReview`, `CreateVouchBlockedState`, `CreateVouchSuccessState`, `ShareVouchPanel` |
| shadcn/ui primitives | `form`, `input`, `label`, `button`, `card`, `calendar`, `popover`, `radio-group`, `checkbox`, `switch`, `alert`, `dialog`, `separator`, `sonner`                                                                                         |
| Notes                | Do not request service category, listing fields, detailed purpose, or marketplace description.                                                                                                                                           |

## `/vouches/invite/[token]` — Invite / Accept Vouch

| Area                 | Plan                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route shell imports  | `InviteLandingPage` / `AcceptVouchPage` from `@/features/vouches/invite/invite-landing-page`                                                                                                                                                                                                                                                                                              |
| Feature logic        | Hash token lookup, render unauthenticated invite-safe landing or authenticated summary. Validate invite, handle invalid/expired/already accepted/self-accept/setup blocked/payout required/terms required states. Accept/decline actions.                                                                                                                                                 |
| Types / schemas      | `InvitationToken`, `InviteLandingState`, `AcceptVouchInput`, `DeclineVouchInput`; `invitationTokenSchema`, `acceptVouchSchema`, `declineVouchSchema`                                                                                                                                                                                                                                      |
| Fetchers             | `getInviteLandingState`, `getInviteLandingUnauthenticatedState`, `getInviteLandingAuthenticatedState`, `getInviteInvalidState`, `getInviteExpiredState`, `getInviteAlreadyAcceptedState`, `getInvitedVouchSummary`, `getAcceptVouchPageState`, `getAcceptVouchSetupBlockedState`, `getAcceptVouchPayoutRequiredState`, `getAcceptVouchTermsRequiredState`, `getSelfAcceptanceDeniedState` |
| Actions              | `markInviteOpened`, `acceptVouch`, `declineVouch`, `startRequiredSetupForAccept`, `startPayoutOnboarding`, `acceptTerms`                                                                                                                                                                                                                                                                  |
| Components           | `PublicShell` for unauthenticated, `AppShell` for authenticated, `AcceptVouchReviewPanel`, `PaymentSummary`, `VouchDeadline`, `SetupBlockedPanel`, `AcceptVouchConfirmationDialog`, `DeclineVouchDialog`, invite invalid/expired/already accepted/self-acceptance states                                                                                                                  |
| shadcn/ui primitives | `card`, `button`, `badge`, `alert`, `dialog`, `alert-dialog`, `separator`, `progress`, `sonner`                                                                                                                                                                                                                                                                                           |
| Notes                | Invite route stays public for token opening, but acceptance requires auth and setup. Plaintext token is never stored.                                                                                                                                                                                                                                                                     |

## `/vouches/[vouchId]` — Vouch Detail

| Area                 | Plan                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route shell imports  | `VouchDetailPage` from `@/features/vouches/detail/vouch-detail-page`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Feature logic        | Fetch participant-safe detail, select variant by Vouch/payment/confirmation state, render status first: amount, next action, deadline, confirmation state, payment state, timeline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Types / schemas      | `VouchDetailPageState`, `VouchStatus`, `AggregateConfirmationStatus`, `PaymentStatus`, `RefundStatus`; `vouchIdSchema`, `vouchDetailParamsSchema`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Fetchers             | `getVouchDetailForParticipant`, `getVouchDetailPendingPayerState`, `getVouchDetailPendingInviteSentState`, `getVouchDetailActiveBeforeWindowState`, `getVouchDetailActiveWindowOpenState`, `getVouchDetailPayerConfirmedState`, `getVouchDetailPayeeConfirmedState`, `getVouchDetailProcessingReleaseState`, `getVouchDetailCompletedState`, `getVouchDetailExpiredState`, `getVouchDetailRefundedState`, `getVouchDetailFailedPaymentState`, `getVouchDetailFailedReleaseState`, `getVouchDetailFailedRefundState`, `getVouchDetailUnauthorizedOrNotFoundState`, `getVouchConfirmationState`, `getVouchWindowSummary`, `getVouchPaymentSummary`, `getVouchTimeline`, `getWhatHappensNextState` |
| Actions              | `sendVouchInvitation`, `resendVouchInvitation`, `cancelPendingVouch`, `confirmPresence` where inline CTA is used, `retryFailedVouchResolution` only if allowed operationally/server-side                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Components           | `AppShell`, `VouchDetailHeader`, `VouchAmountSummary`, `VouchDeadline`, `ConfirmationPanel`, `PaymentSummary`, `VouchTimeline`, `NextActionPanel`, `ShareVouchPanel`, `PaymentStatusBadge`, `RefundStatusBadge`, state variant components                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| shadcn/ui primitives | `card`, `button`, `badge`, `progress`, `alert`, `alert-dialog`, `dialog`, `accordion`, `skeleton`, `separator`, `dropdown-menu`, `sonner`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Notes                | Must answer the seven Vouch screen questions. Unauthorized unrelated Vouches return not found/denied safely.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

## `/vouches/[vouchId]/confirm` — Confirm Presence

| Area                 | Plan                                                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route shell imports  | `ConfirmPresencePage` from `@/features/vouches/confirm/confirm-presence-page`                                                                                                                                                                                                                                                                                                                               |
| Feature logic        | Fetch confirmability state, render payer/payee variant, handle before-window/window-open/already-confirmed/waiting/both-confirmed/window-closed/duplicate/unauthorized/provider-failure states. Submit `confirmPresence`.                                                                                                                                                                                   |
| Types / schemas      | `ConfirmPresenceInput`, `ConfirmPresencePageState`, `ParticipantRole`, `ConfirmationStatus`; `confirmPresenceSchema`, `vouchIdSchema`                                                                                                                                                                                                                                                                       |
| Fetchers             | `getConfirmPresencePageState`, `getConfirmPresencePayerState`, `getConfirmPresencePayeeState`, `getConfirmBeforeWindowState`, `getConfirmWindowOpenState`, `getConfirmAlreadyConfirmedState`, `getConfirmWaitingForOtherPartyState`, `getConfirmBothConfirmedSuccessState`, `getConfirmWindowClosedState`, `getConfirmDuplicateErrorState`, `getConfirmUnauthorizedState`, `getConfirmProviderFailureState` |
| Actions              | `confirmPresence`, `recordPresenceConfirmation`, `preventDuplicateConfirmation`, `evaluateAggregateConfirmation`, `completeVouchIfBothConfirmed`, `markVouchFailed`                                                                                                                                                                                                                                         |
| Components           | `AppShell`, `PageHeader`, `ConfirmationPanel`, `VouchDeadline`, `PaymentSummary`, `NextActionPanel`, confirm state variants                                                                                                                                                                                                                                                                                 |
| shadcn/ui primitives | `card`, `button`, `badge`, `progress`, `alert`, `dialog`, `skeleton`, `separator`, `sonner`                                                                                                                                                                                                                                                                                                                 |
| Notes                | One-sided confirmation must show waiting state and must not release funds. Confirmations outside the window are blocked.                                                                                                                                                                                                                                                                                    |

## `/admin` — Admin Dashboard

| Area                 | Plan                                                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Route shell imports  | `AdminDashboardPage` from `@/features/admin/admin-dashboard-page`                                                            |
| Feature logic        | Require admin capability, fetch operational summary, show totals/failures/stuck states/webhook failures/verification issues. |
| Types / schemas      | `AdminDashboardState`, `AdminMetric`, `AdminFilterInput`; `adminDashboardSearchParamsSchema`                                 |
| Fetchers             | `getAdminDashboardState`, `getAdminDashboardSummary`, `getAdminFailureHeavyState`                                            |
| Actions              | `recordAdminViewAuditEvent`                                                                                                  |
| Components           | `AdminShell`, `PageHeader`, `AdminMetricCard`, `AdminStatusTable`, `OperationalFailureBadge`                                 |
| shadcn/ui primitives | `card`, `badge`, `table`, `tabs`, `select`, `alert`, `skeleton`, `separator`                                                 |
| Notes                | Operational inspection only. No dispute, award, force-release, or blame language.                                            |

## `/admin/vouches` — Admin Vouch List

| Area                 | Plan                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Route shell imports  | `AdminVouchListPage` from `@/features/admin/vouches/admin-vouch-list-page`                                          |
| Feature logic        | Parse filters: status, payment status, deadline, failure state, page. Fetch admin operational Vouch list.           |
| Types / schemas      | `AdminVouchListState`, `AdminVouchFilters`; `adminVouchFiltersSchema`, `paginationInputSchema`                      |
| Fetchers             | `listAdminVouches`, `getAdminSafeRetryPreview` where row action needs preview                                       |
| Actions              | `recordAdminViewAuditEvent`                                                                                         |
| Components           | `AdminShell`, `PageHeader`, `AdminStatusTable`, `VouchStatusBadge`, `PaymentStatusBadge`, `OperationalFailureBadge` |
| shadcn/ui primitives | `table`, `select`, `tabs`, `badge`, `button`, `dropdown-menu`, `skeleton`, `alert`                                  |
| Notes                | Admin may inspect state; no manual fund decisions.                                                                  |

## `/admin/vouches/[vouchId]` — Admin Vouch Detail

| Area                 | Plan                                                                                                                                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route shell imports  | `AdminVouchDetailPage` from `@/features/admin/vouches/admin-vouch-detail-page`                                                                                                                             |
| Feature logic        | Fetch operational detail: Vouch status, participant IDs, payment/refund status, confirmations, webhook history, audit timeline, notifications, safe retry options.                                         |
| Types / schemas      | `AdminVouchDetailState`, `AdminSafeRetryInput`; `adminVouchDetailParamsSchema`, `adminSafeRetrySchema`                                                                                                     |
| Fetchers             | `getAdminVouchDetail`, `getAdminVouchCompletedState`, `getAdminVouchExpiredRefundedState`, `getAdminVouchPaymentFailedState`, `getAdminSafeRetryPreview`, `listAdminWebhookEvents`, `listAdminAuditEvents` |
| Actions              | `retryNotificationSend`, `retryProviderReconciliation`, `retryWebhookProcessing`, `retryRefundStatusSync`, `recordAdminSafeRetryStarted`, `recordAdminSafeRetryCompleted`, `recordAdminViewAuditEvent`     |
| Components           | `AdminShell`, `VouchDetailHeader`, `PaymentSummary`, `ConfirmationPanel`, `AuditTimeline`, `WebhookStatusBadge`, `OperationalFailureBadge`, `AdminVouchSafeRetryDialog`                                    |
| shadcn/ui primitives | `card`, `table`, `badge`, `alert`, `alert-dialog`, `dialog`, `tabs`, `accordion`, `button`, `separator`, `skeleton`                                                                                        |
| Notes                | Safe retries must be idempotent and cannot change human truth.                                                                                                                                             |

## `/admin/users` — Admin Users

| Area                 | Plan                                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Route shell imports  | `AdminUsersPage` from `@/features/admin/users/admin-users-page`                                                                                  |
| Feature logic        | Require admin, fetch operational user list with verification/payment/payout summary and status.                                                  |
| Types / schemas      | `AdminUserListState`, `AdminUserFilters`; `adminUserFiltersSchema`                                                                               |
| Fetchers             | `listAdminUsers`                                                                                                                                 |
| Actions              | `recordAdminViewAuditEvent`, optional row-level `disableUserAccount` after explicit dialog if policy allows                                      |
| Components           | `AdminShell`, `PageHeader`, `AdminStatusTable`, `VerificationStatusCard`, `PaymentStatusBadge`, `PayoutReadinessCard`, `OperationalFailureBadge` |
| shadcn/ui primitives | `table`, `card`, `badge`, `select`, `button`, `alert-dialog`, `dropdown-menu`, `skeleton`                                                        |
| Notes                | No moderation/reputation layer. Disable user is operational account control only.                                                                |

## `/admin/users/[userId]` — Admin User Detail _(operational extension)_

| Area                 | Plan                                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route shell imports  | `AdminUserDetailPage` from `@/features/admin/users/admin-user-detail-page`                                                                                    |
| Feature logic        | Fetch one user operational snapshot: status, verification, payment customer, connected account, participant Vouches, audit references.                        |
| Types / schemas      | `AdminUserDetailState`; `adminUserDetailParamsSchema`                                                                                                         |
| Fetchers             | `getAdminUserDetail`, `getCurrentUserOperationalSnapshot` if reused internally                                                                                |
| Actions              | `disableUserAccount`, `recordAdminViewAuditEvent`                                                                                                             |
| Components           | `AdminShell`, `PageHeader`, `AccountStatusCard`, `VerificationStatusCard`, `PaymentReadinessCard`, `PayoutReadinessCard`, `AdminStatusTable`, `AuditTimeline` |
| shadcn/ui primitives | `card`, `table`, `badge`, `button`, `alert-dialog`, `tabs`, `skeleton`, `separator`                                                                           |
| Notes                | This route is in page inventory, not base routes contract. Keep if useful, but validate contract before implementing.                                         |

## `/admin/payments` — Admin Payments

| Area                 | Plan                                                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Route shell imports  | `AdminPaymentsPage` from `@/features/admin/payments/admin-payments-page`                                             |
| Feature logic        | Fetch operational payment/refund list with provider refs redacted/safe, statuses, failure codes, timestamps.         |
| Types / schemas      | `AdminPaymentListState`, `AdminPaymentFilters`; `adminPaymentFiltersSchema`                                          |
| Fetchers             | `listAdminPayments`                                                                                                  |
| Actions              | `recordAdminViewAuditEvent`; safe retries only from detail/dialog if implemented                                     |
| Components           | `AdminShell`, `PageHeader`, `AdminStatusTable`, `PaymentStatusBadge`, `RefundStatusBadge`, `OperationalFailureBadge` |
| shadcn/ui primitives | `table`, `card`, `badge`, `select`, `button`, `dropdown-menu`, `skeleton`, `alert`                                   |
| Notes                | Redact provider references where appropriate. Do not expose full provider payloads.                                  |

## `/admin/payments/[paymentId]` — Admin Payment Detail _(operational extension)_

| Area                 | Plan                                                                                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route shell imports  | `AdminPaymentDetailPage` from `@/features/admin/payments/admin-payment-detail-page`                                                                         |
| Feature logic        | Fetch one payment/refund operational record, linked Vouch, provider status, webhook history, audit timeline, safe retry controls.                           |
| Types / schemas      | `AdminPaymentDetailState`, `AdminSafeRetryInput`; `adminPaymentDetailParamsSchema`, `adminSafeRetrySchema`                                                  |
| Fetchers             | `getAdminPaymentDetail`, `listAdminWebhookEvents`, `listAdminAuditEvents`, `getAdminSafeRetryPreview`                                                       |
| Actions              | `retryProviderReconciliation`, `retryRefundStatusSync`, `recordAdminSafeRetryStarted`, `recordAdminSafeRetryCompleted`, `recordAdminViewAuditEvent`         |
| Components           | `AdminShell`, `PageHeader`, `PaymentSummary`, `PaymentStatusBadge`, `RefundStatusBadge`, `WebhookStatusBadge`, `AuditTimeline`, `AdminVouchSafeRetryDialog` |
| shadcn/ui primitives | `card`, `table`, `badge`, `alert-dialog`, `button`, `tabs`, `accordion`, `skeleton`                                                                         |
| Notes                | Operational-only route. Confirm against route contract before committing.                                                                                   |

## `/admin/webhooks` — Admin Webhook Events _(operational extension)_

| Area                 | Plan                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| Route shell imports  | `AdminWebhookEventsPage` from `@/features/admin/webhooks/admin-webhook-events-page`             |
| Feature logic        | Fetch provider webhook event list for diagnostics: received, processed, ignored, failed.        |
| Types / schemas      | `AdminWebhookListState`, `AdminWebhookFilters`; `adminWebhookFiltersSchema`                     |
| Fetchers             | `listAdminWebhookEvents`                                                                        |
| Actions              | `recordAdminViewAuditEvent`                                                                     |
| Components           | `AdminShell`, `PageHeader`, `AdminStatusTable`, `WebhookStatusBadge`, `OperationalFailureBadge` |
| shadcn/ui primitives | `table`, `badge`, `select`, `button`, `skeleton`, `alert`                                       |
| Notes                | This supports webhook idempotency/observability; not a user-facing dispute surface.             |

## `/admin/webhooks/[eventId]` — Admin Webhook Event Detail _(operational extension)_

| Area                 | Plan                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Route shell imports  | `AdminWebhookEventDetailPage` from `@/features/admin/webhooks/admin-webhook-event-detail-page`                            |
| Feature logic        | Fetch one webhook event, redacted metadata, processing status/error, linked payment/Vouch if available, safe retry.       |
| Types / schemas      | `AdminWebhookDetailState`, `AdminSafeRetryInput`; `adminWebhookEventParamsSchema`, `adminSafeRetrySchema`                 |
| Fetchers             | `getAdminWebhookEventDetail`, `getAdminSafeRetryPreview`                                                                  |
| Actions              | `retryWebhookProcessing`, `recordAdminSafeRetryStarted`, `recordAdminSafeRetryCompleted`, `recordAdminViewAuditEvent`     |
| Components           | `AdminShell`, `PageHeader`, `WebhookStatusBadge`, `OperationalFailureBadge`, `AuditTimeline`, `AdminVouchSafeRetryDialog` |
| shadcn/ui primitives | `card`, `table`, `badge`, `alert`, `alert-dialog`, `button`, `skeleton`, `separator`                                      |
| Notes                | Do not display full webhook payloads. Store/process provider event IDs for idempotency.                                   |

## `/admin/audit` — Admin Audit

| Area                 | Plan                                                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Route shell imports  | `AdminAuditPage` from `@/features/admin/audit/admin-audit-page`                                                              |
| Feature logic        | Fetch operational audit log list with filters, safe metadata, actor/entity/timestamp.                                        |
| Types / schemas      | `AuditEventDTO`, `AdminAuditListState`, `AdminAuditFilters`; `adminAuditFiltersSchema`, `auditEventSchema`                   |
| Fetchers             | `listAdminAuditEvents`                                                                                                       |
| Actions              | `recordAdminViewAuditEvent`                                                                                                  |
| Components           | `AdminShell`, `PageHeader`, `AuditTimeline`, `AdminStatusTable`, `OperationalFailureBadge`                                   |
| shadcn/ui primitives | `table`, `badge`, `select`, `card`, `skeleton`, `separator`                                                                  |
| Notes                | Audit is append-only by convention and must exclude raw card data, raw identity docs, secrets, and detailed meeting purpose. |

## `/admin/audit/[eventId]` — Admin Audit Detail _(operational extension)_

| Area                 | Plan                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------- |
| Route shell imports  | `AdminAuditEventDetailPage` from `@/features/admin/audit/admin-audit-event-detail-page` |
| Feature logic        | Fetch one audit event with safe metadata and linked entity references.                  |
| Types / schemas      | `AuditEventDTO`, `AdminAuditEventDetailState`; `adminAuditEventParamsSchema`            |
| Fetchers             | `getAdminAuditEventDetail`                                                              |
| Actions              | `recordAdminViewAuditEvent`                                                             |
| Components           | `AdminShell`, `PageHeader`, `AuditTimeline`, `AdminStatusTable`                         |
| shadcn/ui primitives | `card`, `table`, `badge`, `separator`, `skeleton`                                       |
| Notes                | Operational inspection only. No claim/evidence/dispute semantics.                       |

## `/api/webhooks/stripe` — Stripe Webhook Route Handler

| Area                 | Plan                                                                                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route shell imports  | Route handler delegates to payment action/service: `handleStripeWebhook`                                                                                 |
| Feature logic        | None. API route handler verifies signature and delegates business logic to `lib/payments`.                                                               |
| Types / schemas      | `PaymentWebhookInput`, `PaymentWebhookEventDTO`; `stripeWebhookHeaderSchema` / provider event validation adapter                                         |
| Fetchers             | none                                                                                                                                                     |
| Actions              | `handleStripeWebhook`, `recordPaymentWebhookEvent`, `processPaymentWebhookEvent`, `reconcilePaymentStatus`, `reconcileRefundStatus`, `markPaymentFailed` |
| Components           | none                                                                                                                                                     |
| shadcn/ui primitives | none                                                                                                                                                     |
| Notes                | Must verify signature, persist provider event ID, be idempotent, transactionally update local records, never trust client-reported payment status.       |

## `/api/webhooks/clerk` — Clerk Webhook Route Handler

| Area                 | Plan                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Route shell imports  | Route handler delegates to auth action/service: `handleClerkWebhook`                                             |
| Feature logic        | None. API route handler verifies signature and delegates user sync.                                              |
| Types / schemas      | `AuthProviderWebhookInput`, `UserSyncInput`; `clerkWebhookEventSchema`                                           |
| Fetchers             | none                                                                                                             |
| Actions              | `handleClerkWebhook`, `syncClerkUser`, `upsertUserFromAuthProvider`                                              |
| Components           | none                                                                                                             |
| shadcn/ui primitives | none                                                                                                             |
| Notes                | Subscribe to `user.created`, `user.updated`, `user.deleted` for MVP local sync. Do not store full Clerk payload. |

---

# Cross-route component coverage

| Component group | Components                                                                                                                                           |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout          | `PublicShell`, `AppShell`, `AdminShell`, `PageHeader`, `SectionHeader`, `EmptyState`                                                                 |
| Vouch           | `VouchCard`, `VouchStatusBadge`, `VouchDetailHeader`, `ConfirmationPanel`, `VouchTimeline`, `VouchAmountSummary`, `VouchDeadline`, `NextActionPanel` |
| Payments        | `PaymentSummary`, `PaymentStatusBadge`, `RefundStatusBadge`, `FeeBreakdown`                                                                          |
| Setup           | `SetupChecklist`, `SetupChecklistItem`, `VerificationStatusCard`, `PaymentReadinessCard`, `PayoutReadinessCard`, `TermsStatusCard`                   |
| Admin           | `AdminMetricCard`, `AdminStatusTable`, `AuditTimeline`, `WebhookStatusBadge`, `OperationalFailureBadge`                                              |
| Forms           | `FormShell`, `SubmitButton`, `FieldError`, `FormError`, `MoneyInput`, `DateTimeInput`, `TermsCheckbox`                                               |

# Immediate shadcn/ui install set

```txt
button
card
input
label
form
select
checkbox
switch
badge
separator
progress
skeleton
alert
alert-dialog
dialog
dropdown-menu
sheet
tabs
table
accordion
collapsible
tooltip
popover
calendar
textarea
avatar
sonner
scroll-area
radio-group
```

# Gaps / decisions before coding

| Gap                           | Recommendation                                                                                              |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Admin detail extension routes | Keep in planning, but do not implement until `routes.yaml` is amended or accepted as operational extension. |
| Exact Stripe primitive        | Required before production; MVP sandbox can continue with selected provider-supported flow.                 |
| Verification provider         | Use Stripe Identity or equivalent; confirm before production.                                               |
| Fee bounds                    | Define min/max Vouch amount and final fee formula constants before create flow implementation.              |
| Confirmation window policy    | Define min/max window duration and default open/expire behavior before schema finalization.                 |
