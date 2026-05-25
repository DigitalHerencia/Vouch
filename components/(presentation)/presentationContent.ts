export const presentationContent = {
  page: {
    eyebrow: "Status architecture preview",
    title: "Vouch status block",
    description:
      "Presentation-only preview of the status assembly using server operations, feature orchestration, and isolated client interactivity.",
  },
  wizard: {
    eyebrow: "New Vouch",
    title: "Create status rail",
    helper:
      "UI only: fee math, immutable creation, provider links, idempotency keys, retries, and webhook reconciliation stay on the server.",
    progressHint: "Server state owns outcome",
    steps: [
      { title: "Fee invoice", completeLabel: "OK", pendingLabel: "..." },
      { title: "Paylink window", completeLabel: "OK", pendingLabel: "..." },
      { title: "Immutable create", completeLabel: "OK", pendingLabel: "..." },
    ],
    amountDescription:
      "The application fee and provider fee preview are calculated server-side before the Vouch can be created.",
    cartTitle: "Vouch cart",
    cartDescription:
      "Confirm the server-owned create request, then continue to the hosted fee invoice.",
    immutableAcknowledgement:
      "I understand this Vouch becomes immutable after creation data is issued. Funds release only when merchant and customer confirmations are both recorded inside the confirmation window.",
    protocolTiles: [
      {
        title: "Paylink",
        body: "Merchant receives the hosted payment link after fee payment and immutable create.",
      },
      {
        title: "Idempotent DB",
        body: "The feature layer should write transactionally with retry-aware idempotency keys.",
      },
      {
        title: "Webhook sync",
        body: "Stripe events reconcile payment, authorization, capture, expiration, and refund state.",
      },
    ],
    cartRail: [
      {
        label: "1. Idempotent create",
        value: "Feature server action writes Vouch state transactionally with retry-safe keys.",
      },
      {
        label: "2. Fee invoice",
        value: "Merchant pays application fee and Stripe fee through a hosted one-time invoice.",
      },
      {
        label: "3. Immutable paylink",
        value:
          "After paid webhook reconciliation, the destination PaymentIntent link is issued and the Vouch becomes immutable.",
      },
      {
        label: "4. Bilateral confirmation",
        value:
          "Merchant and customer DB writes inside the window determine capture; otherwise the intent expires or is voided.",
      },
    ],
  },
  protocolTiles: [
    {
      title: "Paylink",
      body: "Merchant receives the hosted payment link after fee payment and immutable create.",
    },
    {
      title: "Idempotent DB",
      body: "The feature layer should write transactionally with retry-aware idempotency keys.",
    },
    {
      title: "Webhook sync",
      body: "Stripe events reconcile payment, authorization, capture, expiration, and refund state.",
    },
  ],
  cartRail: [
    {
      label: "1. Idempotent create",
      value: "Feature server action writes Vouch state transactionally with retry-safe keys.",
    },
    {
      label: "2. Fee invoice",
      value: "Merchant pays application fee and Stripe fee through a hosted one-time invoice.",
    },
    {
      label: "3. Immutable paylink",
      value:
        "After paid webhook reconciliation, the destination PaymentIntent link is issued and the Vouch becomes immutable.",
    },
    {
      label: "4. Bilateral confirmation",
      value:
        "Merchant and customer DB writes inside the window determine capture; otherwise the intent expires or is voided.",
    },
  ],
  processPanel: {
    title: "How Vouch resolves commitment state",
    footer: "Protocol state and provider state determine the outcome.",
    steps: [
      {
        number: "01",
        icon: "file",
        title: "Create immutable terms",
        body: "The merchant defines amount, appointment time, and the confirmation window before commitment.",
      },
      {
        number: "02",
        icon: "users",
        title: "Participants confirm",
        body: "Merchant and customer each confirm presence once inside the configured window.",
      },
      {
        number: "03",
        icon: "check",
        title: "Server checks state",
        body: "The server reads current workflow and provider state before any capture attempt.",
      },
      {
        number: "04",
        icon: "lock",
        title: "Outcome settles",
        body: "Capture only proceeds when both confirmations and provider state allow it.",
      },
    ],
  },
} as const
