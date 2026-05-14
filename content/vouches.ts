export const vouchPageCopy = {
  create: {
    eyebrow: "Merchant action",
    title: "Create a Vouch",
    blockedTitle: "Finish setup to continue",
    blockedActionLabel: "Return to dashboard",
    detailsHeader: "Vouch details",
  },
  detail: {
    eyebrow: "Participant ledger",
    title: "Vouch",
    heroBody:
      "commitment for {appointmentLabel}. Outcome follows bilateral confirmation inside the window.",
    labels: {
      merchant: "Merchant",
      customer: "Customer",
      amount: "Amount",
      window: "Window",
      appointment: "Appointment",
      opens: "Opens",
      expires: "Expires",
      vouchAmount: "Vouch amount",
      merchantReceives: "Merchant receives",
      customerAuthorizes: "Customer authorizes",
    },
    sections: {
      confirmation: "Confirmation",
      schedule: "Schedule",
      payment: "Payment details",
      timeline: "Timeline",
      rule: "Rule",
    },
    states: {
      bothConfirmed: "Both confirmed",
      waiting: "Waiting",
      confirmed: "Confirmed",
      notConfirmed: "Not confirmed",
      noTimeline: "No participant-safe events recorded yet.",
    },
    oneSidedRule: "One-sided confirmation never releases funds.",
    ruleDescription:
      "Both confirm in time and capture can proceed. Otherwise provider state determines void, refund, or non-capture.",
  },
  confirm: {
    eyebrow: "Presence confirmation",
    body:
      "Confirm that you were present. Both parties must confirm within the window for funds to release.",
    labels: {
      vouchStatus: "Vouch status",
      created: "Created",
      started: "Started",
      deadline: "Deadline",
      payer: "Payer",
      payeeYou: "Payee (You)",
      participant: "participant",
    },
    sections: {
      window: "Confirmation window",
      status: "Confirmation status",
      yourConfirmation: "Your confirmation",
    },
    states: {
      confirmed: "Confirmed",
      notConfirmed: "Not confirmed",
      waiting: "Waiting for the other party if needed.",
    },
    fallbackCreatedAt: "May 24, 2025 at 1:45 PM",
    countdownPlaceholder: "01 : 23 : 47",
    deadlineConsequence:
      "If you don't confirm by the deadline, payment is refunded according to provider state.",
    confirmationBody:
      "By confirming, you state that you were present during the meeting window.",
    confirmAction: "Confirm I was present",
    irreversible: "This action cannot be undone",
  },
  share: {
    eyebrow: "Invite",
    title: "Share this Vouch",
    body:
      "Invite the other party to accept this commitment. They'll need to sign in or create an account.",
    inviteLinkTitle: "Invite link",
    inviteLinkBody: "Anyone with this link can view and accept this Vouch.",
    copyLink: "Copy link",
    sendInvitationTitle: "Send invitation",
    sendInvitationBody: "Send an email invitation directly.",
    sendInvitation: "Send invitation",
    emailPlaceholder: "email@example.com",
    summaryTitle: "Vouch summary",
    pending: "Pending",
    amountCurrency: "USD",
    inviteUrl: "https://vouch.com/invite/abc123xyz789",
    rule:
      "Funds release only after both parties confirm presence within the window.",
    summaryRows: [
      ["From", "jordan@client.com"],
      ["For", "you"],
      ["Label", "Consulting call"],
      ["Meeting window", "May 24, 2025 - 4:00 PM - 6:00 PM"],
    ],
  },
  list: {
    eyebrow: "Participant ledger",
    defaultTitle: "Vouches",
    body: "Participant-scoped Vouches only.",
    create: "Create Vouch",
    emptyTitle: "No Vouches yet.",
    emptyBody:
      "Create a Vouch to back an appointment or in-person agreement with a clear payment commitment. Both parties confirm presence; otherwise refund, void, or non-capture.",
    nextAction: "Next action",
    emptyActionBody:
      "Start with amount, meeting window, confirmation deadline, and recipient.",
  },
  invite: {
    invalidTitle: "This invite is no longer available.",
    eyebrow: "Customer invite",
    title: "You've been invited",
    body:
      "Review the Vouch details below. Finish setup and accept to lock in this commitment.",
    secureTitle: "Secure and neutral",
    secureBody:
      "Payments are processed by Stripe. Vouch does not hold funds and does not judge outcomes.",
    acceptTitle: "Accept this Vouch",
    steps: ["Review", "Setup", "Accept"],
    unsignedNotice: {
      title: "Create your account to continue",
      body: "Your invite is saved. Sign in or create an account before accepting.",
    },
    ineligibleNotice: {
      title: "Complete the steps below to accept",
      body: "You must be verified and ready to receive funds.",
    },
    readyNotice: {
      title: "Ready to accept",
      body: "Both parties must confirm presence after acceptance.",
    },
    readinessItems: ["Identity verification", "18+ verification", "Payout setup", "Terms acceptance"],
    verified: "Verified",
    reviewTerms: "Review terms",
    nextTitle: "What happens next?",
    nextBody:
      "After you accept, both parties must confirm within the window. If both confirm, funds release. If not, the payment is refunded according to provider state.",
    signUp: "Sign up",
    signIn: "Sign in",
    reviewSetup: "Review setup",
    accept: "Accept this Vouch",
    summaryTitle: "Vouch summary",
    amountCurrency: "USD",
    summaryRows: {
      for: "you",
      label: "Consulting call",
    },
    summaryRule: "Both parties must confirm before funds release.",
  },
} as const
