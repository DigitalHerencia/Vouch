export const landingHeroContent = {
  eyebrow: "Put something behind the promise",
  title: "Create. Accept. Meet. Confirm.",
  titleHighlight: "Confirm.",
  body: "Vouch turns a verbal commitment into a financial commitment using clear rules both people accept before the appointment happens.",
} as const

export const landingHeroActionsContent = {
  primaryLabel: "Create a Vouch",
  secondaryLabel: "See how it works",
} as const

export const landingSectionIntroContent = {
  eyebrow: "Put something behind the promise",
  title: "Create. Authorize. Meet. Confirm.",
  body: "Vouch turns a verbal commitment into a financial commitment using clear rules both people accept before the appointment happens.",
} as const

export const landingProcessSteps = [
  {
    number: "1",
    title: "Create a Vouch",
    body: "Choose the protected amount, appointment time, and confirmation window.",
    icon: "file",
  },
  {
    number: "2",
    title: "Share the link",
    body: "The other person securely authorizes the protected amount through Stripe.",
    icon: "users",
  },
  {
    number: "3",
    title: "Meet as planned",
    body: "Vouch does not track location, monitor conversations, or collect evidence.",
    icon: "check",
  },
  {
    number: "4",
    title: "Confirm participation",
    body: "Both people confirm they were present during the agreed confirmation window.",
    icon: "lock",
  },
] as const

export const landingProcessPanelContent = {
  title: "A Protocol for Trust",
  footer: "Let the process handle the rest",
} as const

export const landingSolutionSteps = [
  {
    number: "1",
    title: "Create a Vouch",
    body: "Choose the protected amount, appointment time, and confirmation window.",
  },
  {
    number: "2",
    title: "Share the link",
    body: "The other person securely authorizes the protected amount through Stripe.",
  },
  {
    number: "3",
    title: "Meet as planned",
    body: "Vouch does not track location, monitor conversations, or collect evidence.",
  },
  {
    number: "4",
    title: "Confirm participation",
    body: "Both people confirm they were present during the agreed confirmation window.",
  },
] as const

export const landingMetrics = [
  {
    label: "Confirmations",
    value: "2",
    body: "Both people must confirm before funds release.",
  },
  {
    label: "Override paths",
    value: "0",
    body: "No manual awards, force release, or support override.",
  },
  {
    label: "Window",
    value: "1",
    body: "Confirmation only counts during the appointment window.",
  },
  {
    label: "State based",
    value: "100%",
    body: "What happens determines what happens next.",
  },
] as const

export const landingProofStats = [
  {
    label: "Consultants, coaches, and tutors",
    value: "Protect paid time blocks where preparation and attendance matter",
  },
  {
    label: "Contractors and service providers",
    value: "Turn handshake appointments into accountable commitments.",
  },
  {
    label: "Photographers, creators, and specialists",
    value: "Reduce awkward follow-ups and protect high-value in-person work.",
  },
  {
    label: "Anyone coordinating an important meeting",
    value:
      "Create the agreement, authorize the amount, confirm participation, and let the process handle the rest.",
  },
] as const

export const landingRuleFeatures = [
  {
    label: "Confirmations",
    value: "2",
    body: "Required for release.",
  },
  {
    label: "Override paths",
    value: "0",
    body: "No force-release control.",
  },
  {
    label: "Window",
    value: "1",
    body: "Time-bound outcome.",
  },
  {
    label: "State based",
    value: "100%",
    body: "Provider-backed resolution.",
  },
] as const

export const landingFeatureCards = [
  {
    icon: "rules",
    title: "Clear rules everyone agrees to",
    body: "The agreement is defined before the appointment, not reconstructed afterward.",
    span: "normal",
  },
  {
    icon: "confirmation",
    title: "Both people must confirm",
    body: "One confirmation alone is not enough to release payment.",
    span: "normal",
  },
  {
    icon: "window",
    title: "Confirmation only counts during the appointment window",
    body: "Early, late, duplicate, or invalid confirmations do not create release eligibility.",
    span: "normal",
  },
  {
    icon: "immutable",
    title: "The agreement can't be changed after it's accepted",
    body: "Committed terms are frozen so neither side can rewrite the deal midstream.",
    span: "normal",
  },
  {
    icon: "payment",
    title: "Payment is only released when requirements are met",
    body: "Customer authorization is held until bilateral confirmation and provider capturability align.",
    span: "wide",
  },
] as const

export const landingAudienceFeatures = [
  {
    icon: "calendar",
    title: "Consultants, coaches, and tutors",
    body: "Protect paid time blocks where preparation and attendance matter.",
    span: "normal",
  },
  {
    icon: "money",
    title: "Contractors and service providers",
    body: "Turn handshake appointments into accountable commitments without becoming a scheduler or marketplace.",
    span: "normal",
  },
  {
    icon: "handshake",
    title: "Photographers, creators, and specialists",
    body: "Reduce awkward follow-up and protect high-value in-person work.",
    span: "normal",
  },
  {
    icon: "rules",
    title: "Anyone coordinating an important meeting",
    body: "Create the agreement, authorize the amount, confirm participation, and let the process handle the rest.",
    span: "wide",
  },
] as const

export const landingOutcomeRules = [
  {
    label: "Both confirm",
    value: "Funds release",
  },
  {
    label: "Only one confirms",
    value: "Refund or void",
  },
  {
    label: "Neither confirms",
    value: "No release",
  },
  {
    label: "Window expires",
    value: "Provider state decides",
  },
] as const

export const landingPhilosophyContent = {
  title: "Fair for everyone.",
  body: "Vouch doesn't take sides. Vouch doesn't decide who is right. Vouch simply follows the rules both people agreed to before the appointment.",
  action: "Rule-bound execution",
} as const

export const landingCalloutContent = {
  action: "/sign-up?return_to=/vouches/new",
  label: "Create a Vouch",
  title: "Put money behind the promise.",
  body: "Create agreements where payment is released only when both people confirm they met as planned. No chasing payments. No awkward conversations. No guessing what happened.",
} as const
