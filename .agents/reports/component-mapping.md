## Assumptions

I’m treating the mockups as **responsive states of canonical routes**, not as separate app routes. For example, “Share this Vouch” is a pending/payer Vouch detail state or post-create state, not a new marketplace-style route. The route tree below follows the source route contract and the page inventory, while keeping `app/` thin and moving orchestration into `features/`.

---

# `/app` Directory Tree

```txt
app/
  layout.tsx
  globals.css
  loading.tsx
  error.tsx
  global-error.tsx
  not-found.tsx

  (public)/
    layout.tsx

    page.tsx
    loading.tsx
    error.tsx

    how-it-works/
      page.tsx

    pricing/
      page.tsx

    faq/
      page.tsx

    legal/
      terms/
        page.tsx
      privacy/
        page.tsx

    vouches/
      invite/
        [token]/
          page.tsx
          loading.tsx
          error.tsx

  (auth)/
    layout.tsx

    sign-in/
      [[...sign-in]]/
        page.tsx

    sign-up/
      [[...sign-up]]/
        page.tsx

    auth/
      callback/
        page.tsx
        loading.tsx
      error/
        page.tsx
      signed-out/
        page.tsx

  (app)/
    layout.tsx
    loading.tsx
    error.tsx
    not-found.tsx

    dashboard/
      page.tsx
      loading.tsx
      error.tsx

    setup/
      page.tsx
      loading.tsx
      error.tsx

    settings/
      page.tsx
      loading.tsx
      error.tsx

      payment/
        page.tsx
        loading.tsx
        error.tsx

      payout/
        page.tsx
        loading.tsx
        error.tsx

      verification/
        page.tsx
        loading.tsx
        error.tsx

    vouches/
      page.tsx
      loading.tsx
      error.tsx

      new/
        page.tsx
        loading.tsx
        error.tsx

      [vouchId]/
        page.tsx
        loading.tsx
        error.tsx
        not-found.tsx

        confirm/
          page.tsx
          loading.tsx
          error.tsx

  (admin)/
    admin/
      layout.tsx
      page.tsx
      loading.tsx
      error.tsx

      vouches/
        page.tsx
        loading.tsx
        error.tsx

        [vouchId]/
          page.tsx
          loading.tsx
          error.tsx
          not-found.tsx

      users/
        page.tsx
        loading.tsx
        error.tsx

        [userId]/
          page.tsx
          loading.tsx
          error.tsx
          not-found.tsx

      payments/
        page.tsx
        loading.tsx
        error.tsx

        [paymentId]/
          page.tsx
          loading.tsx
          error.tsx
          not-found.tsx

      webhooks/
        page.tsx
        loading.tsx
        error.tsx

        [eventId]/
          page.tsx
          loading.tsx
          error.tsx
          not-found.tsx

      audit/
        page.tsx
        loading.tsx
        error.tsx

        [eventId]/
          page.tsx
          loading.tsx
          error.tsx
          not-found.tsx

  api/
    webhooks/
      stripe/
        route.ts
      clerk/
        route.ts
```

## Notes on `/app`

- `/vouches/invite/[token]` stays under the public route group because unauthenticated users can open an invite before auth/setup.
- `/vouches/[vouchId]/confirm` is a focused confirmation route, but confirmation state can also appear inside `/vouches/[vouchId]`.
- Admin webhook event pages are included because the page inventory calls for webhook list/detail views, even though the base route contract only explicitly lists admin audit/payment/user/vouch routes. These should remain **operational-only**, not arbitration tooling.
- Forbidden route concepts remain excluded: `/browse`, `/providers`, `/messages`, `/reviews`, `/categories`, `/disputes`.

---

# `/features` Directory Tree

```txt
features/
  marketing/
    landing-page.tsx
    how-it-works-page.tsx
    pricing-page.tsx
    faq-page.tsx
    legal-page.tsx

    sections/
      marketing-hero.tsx
      vouch-process-panel.tsx
      use-cases-section.tsx
      pricing-summary-section.tsx
      trust-and-neutrality-section.tsx
      faq-section.tsx
      final-cta-section.tsx

  auth/
    sign-in-page.tsx
    sign-up-page.tsx
    auth-callback-page.tsx
    auth-error-page.tsx
    signed-out-page.tsx

  setup/
    setup-page.tsx
    setup-checklist.tsx
    setup-progress-panel.tsx
    setup-blocked-panel.tsx
    setup-return-context-banner.tsx
    terms-acceptance-panel.tsx
    terms-acceptance-dialog.client.tsx

  settings/
    account-settings-page.tsx
    payment-settings-page.tsx
    payout-settings-page.tsx
    verification-settings-page.tsx

    sections/
      profile-basics-section.tsx
      verification-status-section.tsx
      payment-readiness-section.tsx
      payout-readiness-section.tsx
      terms-status-section.tsx
      account-security-section.tsx

  payments/
    payment-setup-page.tsx
    payout-setup-page.tsx
    payment-provider-redirect-state.tsx
    payout-provider-redirect-state.tsx
    payment-method-ready-state.tsx
    payment-method-failed-state.tsx
    payout-ready-state.tsx
    payout-restricted-state.tsx

  dashboard/
    dashboard-page.tsx
    dashboard-content.tsx
    dashboard-empty-state.tsx
    dashboard-loading-state.tsx
    dashboard-error-state.tsx

    sections/
      action-required-section.tsx
      active-vouches-section.tsx
      pending-vouches-section.tsx
      completed-vouches-section.tsx
      expired-refunded-section.tsx
      setup-progress-card.tsx
      how-vouch-works-card.tsx

  vouches/
    list/
      vouch-list-page.tsx
      vouch-list-content.tsx
      vouch-list-filters.client.tsx
      vouch-list-empty-state.tsx
      vouch-list-loading-state.tsx

    create/
      create-vouch-page.tsx
      create-vouch-form.client.tsx
      create-vouch-review.client.tsx
      create-vouch-blocked-state.tsx
      create-vouch-success-state.tsx
      create-vouch-payment-processing-state.tsx
      create-vouch-payment-failed-state.tsx

      steps/
        amount-step.tsx
        meeting-window-step.tsx
        recipient-step.tsx
        details-step.tsx
        review-step.tsx
        fee-breakdown-step.tsx
        terms-acknowledgement-step.tsx

    invite/
      invite-landing-page.tsx
      invite-invalid-state.tsx
      invite-expired-state.tsx
      invite-already-accepted-state.tsx
      accept-vouch-page.tsx
      accept-vouch-review-panel.tsx
      accept-vouch-setup-blocked-state.tsx
      accept-vouch-payout-required-state.tsx
      accept-vouch-terms-required-state.tsx
      accept-vouch-confirmation-dialog.client.tsx
      decline-vouch-dialog.client.tsx
      accept-vouch-success-state.tsx
      decline-vouch-success-state.tsx
      self-acceptance-denied-state.tsx

    detail/
      vouch-detail-page.tsx
      vouch-detail-pending-payer.tsx
      vouch-detail-pending-invite-sent.tsx
      vouch-detail-active-before-window.tsx
      vouch-detail-active-window-open.tsx
      vouch-detail-payer-confirmed.tsx
      vouch-detail-payee-confirmed.tsx
      vouch-detail-processing-release.tsx
      vouch-detail-completed.tsx
      vouch-detail-expired.tsx
      vouch-detail-refunded.tsx
      vouch-detail-failed-payment.tsx
      vouch-detail-failed-release.tsx
      vouch-detail-failed-refund.tsx
      vouch-detail-unauthorized-state.tsx
      vouch-detail-loading-state.tsx

    confirm/
      confirm-presence-page.tsx
      confirm-presence-payer.tsx
      confirm-presence-payee.tsx
      confirm-before-window-state.tsx
      confirm-window-open-state.tsx
      confirm-already-confirmed-state.tsx
      confirm-waiting-for-other-party-state.tsx
      confirm-both-confirmed-success-state.tsx
      confirm-window-closed-state.tsx
      confirm-duplicate-error-state.tsx
      confirm-unauthorized-state.tsx
      confirm-provider-failure-state.tsx

    share/
      share-vouch-panel.tsx
      invite-link-card.tsx
      send-invitation-card.client.tsx
      other-share-methods.tsx
      copy-invite-link.client.tsx

  admin/
    admin-dashboard-page.tsx

    vouches/
      admin-vouch-list-page.tsx
      admin-vouch-detail-page.tsx
      admin-vouch-failure-heavy-state.tsx
      admin-vouch-safe-retry-dialog.client.tsx
      admin-vouch-safe-retry-result-state.tsx

    users/
      admin-users-page.tsx
      admin-user-detail-page.tsx

    payments/
      admin-payments-page.tsx
      admin-payment-detail-page.tsx

    webhooks/
      admin-webhook-events-page.tsx
      admin-webhook-event-detail-page.tsx

    audit/
      admin-audit-log-page.tsx
      admin-audit-event-detail-page.tsx

    states/
      admin-unauthorized-state.tsx

  system/
    global-loading-shell.tsx
    route-loading-skeleton.tsx
    global-error-view.tsx
    protected-route-unauthorized.tsx
    entity-not-found.tsx
    server-action-failure-pattern.tsx
    payment-provider-unavailable.tsx
    degraded-service-banner.tsx
```

## Notes on `/features`

- The feature layer owns page orchestration, Suspense/loading placement, URL/search param parsing handoff, and client form containers. It may call fetchers/actions, but cannot bypass server-side authz or validation.
- Vouch detail and confirmation variants are modeled as feature states because the inventory requires many product states, but they should not become separate URLs unless the route contract explicitly supports it.
- The `share/` feature is intentionally not a top-level route. It renders inside post-create success or pending payer detail.

---

# `/components` Directory Tree

```txt
components/
  ui/
    accordion.tsx
    alert.tsx
    alert-dialog.tsx
    avatar.tsx
    badge.tsx
    button.tsx
    calendar.tsx
    card.tsx
    checkbox.tsx
    collapsible.tsx
    command.tsx
    dialog.tsx
    drawer.tsx
    dropdown-menu.tsx
    form.tsx
    input.tsx
    input-otp.tsx
    label.tsx
    popover.tsx
    progress.tsx
    radio-group.tsx
    scroll-area.tsx
    select.tsx
    separator.tsx
    sheet.tsx
    skeleton.tsx
    sonner.tsx
    switch.tsx
    table.tsx
    tabs.tsx
    textarea.tsx
    toast.tsx
    toggle.tsx
    tooltip.tsx

  brand/
    wordmark.tsx
    verification-mark.tsx
    logo-lockup.tsx

  layout/
    app-shell.tsx
    app-header.tsx
    app-sidebar.tsx
    app-mobile-header.tsx
    app-mobile-bottom-nav.tsx
    public-header.tsx
    public-footer.tsx
    admin-shell.tsx
    page-header.tsx
    page-container.tsx
    split-page-layout.tsx
    two-column-layout.tsx
    back-link.tsx
    help-footer.tsx

  navigation/
    nav-link.tsx
    nav-section.tsx
    user-menu.tsx
    mobile-menu.tsx
    breadcrumb-link.tsx

  feedback/
    status-badge.tsx
    status-dot.tsx
    inline-alert.tsx
    empty-state.tsx
    error-state.tsx
    loading-state.tsx
    toast-message.tsx
    countdown.tsx
    progress-meter.tsx
    step-indicator.tsx

  forms/
    field-group.tsx
    amount-input.tsx
    date-input.tsx
    time-select.tsx
    email-input.tsx
    terms-checkbox.tsx
    submit-button.tsx
    form-error.tsx
    form-section.tsx

  marketing/
    process-step-card.tsx
    metric-tile.tsx
    use-case-card.tsx
    pricing-card.tsx
    faq-item.tsx
    principle-card.tsx

  dashboard/
    dashboard-section.tsx
    dashboard-card.tsx
    action-required-card.tsx
    setup-progress-card.tsx
    vouch-summary-row.tsx

  vouches/
    vouch-card.tsx
    vouch-list-row.tsx
    vouch-status-badge.tsx
    vouch-amount.tsx
    vouch-deadline.tsx
    vouch-id-pill.tsx
    vouch-party-row.tsx
    vouch-window-summary.tsx
    next-action-button.tsx

    detail/
      vouch-detail-header.tsx
      vouch-summary-panel.tsx
      confirmation-status-panel.tsx
      confirmation-window-panel.tsx
      payment-summary-panel.tsx
      timeline-panel.tsx
      what-happens-next-panel.tsx
      share-vouch-actions.tsx

    confirm/
      confirmation-progress.tsx
      confirmation-party-node.tsx
      confirm-presence-panel.tsx
      confirmation-rule-card.tsx

    create/
      create-vouch-summary.tsx
      fee-breakdown.tsx
      recipient-method-selector.tsx
      share-link-toggle-row.tsx
      review-before-commit-card.tsx

    invite/
      invite-summary-card.tsx
      accept-requirements-list.tsx
      decline-action.tsx

  setup/
    setup-checklist-card.tsx
    setup-checklist-item.tsx
    verification-status-card.tsx
    payment-readiness-card.tsx
    payout-readiness-card.tsx
    terms-status-card.tsx
    blocked-requirement-card.tsx

  payments/
    payment-summary.tsx
    payment-status-card.tsx
    payout-status-card.tsx
    provider-redirect-card.tsx
    fee-line-item.tsx
    refund-status-card.tsx

  admin/
    admin-metric-card.tsx
    admin-status-filter.tsx
    admin-vouch-table.tsx
    admin-user-table.tsx
    admin-payment-table.tsx
    admin-webhook-table.tsx
    admin-audit-table.tsx
    admin-timeline.tsx
    safe-retry-button.tsx
    redacted-provider-reference.tsx
```

## Notes on `/components`

- Components stay pure/presentational: no Prisma, no Stripe, no authz enforcement, no domain state transitions.
- Vouch UI needs status badges, cards, confirmation panels, payment summaries, setup checklists, timeline/audit summaries, and admin tables.
- No profile cards, provider cards, rating widgets, messages, review prompts, category chips, or dispute components.

---

# shadcn/ui Primitives Needed

## Required immediately

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
```

## Strongly useful for these mockups

```txt
drawer
radio-group
command
toast
toggle
```

## Primitive-to-screen mapping

| Primitive          | Needed for                                                                        |
| ------------------ | --------------------------------------------------------------------------------- |
| `button`           | Primary CTAs: Create Vouch, Review & commit, Accept, Confirm presence, Copy link  |
| `card`             | Dashboard sections, Vouch cards, setup cards, payment summaries, admin metrics    |
| `input`            | Amount, email, invite link display, label/private note                            |
| `select`           | Time picker, sort dropdowns, admin filters                                        |
| `calendar`         | Date selection for meeting window and confirmation deadline                       |
| `form`             | Create Vouch, setup actions, invite email, settings                               |
| `checkbox`         | Terms acknowledgement, optional confirmations                                     |
| `switch`           | Shareable link toggle                                                             |
| `badge`            | Pending, Active, Authorized, Verified, Refunded, Failed, Requires Setup           |
| `progress`         | Setup progress, confirmation countdown progress, payment/setup readiness          |
| `skeleton`         | Dashboard loading, Vouch detail loading, admin tables                             |
| `alert`            | Setup blocked, payment failed, provider unavailable, confirmation warnings        |
| `alert-dialog`     | Decline Vouch, cancel pending Vouch, safe admin retry                             |
| `dialog`           | Terms modal, confirmation modal, share/send invite modal                          |
| `dropdown-menu`    | User menu, row actions, overflow menu                                             |
| `sheet`            | Mobile nav/menu, mobile detail panels                                             |
| `tabs`             | Vouch list filters, settings sections, admin filters if desired                   |
| `table`            | Admin Vouches, users, payments, webhooks, audit logs                              |
| `accordion`        | Mobile detail sections, FAQ, collapsed payment/timeline panels                    |
| `collapsible`      | Mobile create flow sections and expandable summaries                              |
| `tooltip`          | Payment/provider metadata hints, icon-only actions                                |
| `popover`          | Date/time picker composition                                                      |
| `textarea`         | Optional private note only; do **not** use for marketplace-style descriptions     |
| `avatar`           | User initials in app shell and party rows                                         |
| `sonner` / `toast` | Copy link success, invite sent, action failed, confirmation recorded              |
| `scroll-area`      | Mobile menus, long admin tables, constrained panels                               |
| `drawer`           | Mobile-first confirmation/share panels if preferred over dialog                   |
| `radio-group`      | Recipient method selection: email vs share link                                   |
| `command`          | Optional admin/internal filter combobox only; do **not** build marketplace search |

---

# Implementation Cut

Start with this reduced primitive install set:

```bash
button card input label form select checkbox switch badge separator progress skeleton alert alert-dialog dialog dropdown-menu sheet tabs table accordion collapsible tooltip popover calendar textarea avatar sonner scroll-area radio-group drawer
```

Hold `command` unless you need a combobox-style admin filter. Do **not** use it to create public discovery/search.
