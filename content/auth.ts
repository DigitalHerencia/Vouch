// content/auth.ts

export const authVerificationContent = {
  sentToEmailHeading: "We sent a verification code to your email address.",
  sentToPhoneHeading: "We sent a verification code to your phone.",
  codeLabel: "Verification code",
  codePlaceholder: "Enter the code you received",
  latestCodeEmail: "Use the latest code sent to your email.",
  latestCodePhone: "Use the latest code sent to your phone.",
  finishSignup: "Confirm your email to finish account creation.",
  verifyCode: "Verify code",
  resendCode: "Resend code",
  startOver: "Start over",
} as const

export const authHeaderContent = {
  homeHref: "/",
  homeLabel: "Home",
  homeAriaLabel: "Go to Vouch home",
} as const

export const authCalloutGridContent = {
  eyebrow: "Authenticated protocol",
  principles: [
    {
      title: "Rule-bound",
      body: "Vouch does not decide who is right. Vouch asks what happened.",
      icon: "shield",
    },
    {
      title: "Both confirm",
      body: "Funds release only when both participants confirm inside the configured window.",
      icon: "check",
    },
    {
      title: "Provider-backed",
      body: "Stripe owns payment truth. Vouch owns workflow truth.",
      icon: "card",
    },
  ],
  steps: [
    {
      label: "01",
      value: "Commit",
    },
    {
      label: "02",
      value: "Confirm",
    },
    {
      label: "03",
      value: "Resolve",
    },
  ],
} as const

export const authPageContent = {
  signIn: {
    eyebrow: "Payment-backed commitments",
    title: "Back your commitment.",
    description:
      "Sign in to manage Vouches, confirm presence, and keep payment-backed commitments on track.",
    footnote:
      "Vouch is not a marketplace, scheduler, escrow provider, or dispute system. Users bring their own agreement; Vouch coordinates the payment outcome.",
  },
  signUp: {
    eyebrow: "Commitment-backed payments",
    title: "Create your account.",
    description:
      "Set up a verified account to create Vouches, accept invites, and confirm real-world presence.",
    footnote:
      "Vouch coordinates deterministic payment outcomes for pre-arranged, in-person commitments. It does not broker services or resolve disputes.",
  },
} as const
