export const dashboardContent = {
  hero: {
    eyebrow: "Participant ledger",
    title: "Dashboard",
    body: "Here's what's happening with your Vouches. Amount, status, deadline, and consequence stay visible.",
  },
  readiness: {
    title: "Complete readiness before creating or accepting Vouches.",
    body: "Complete readiness checks so Vouch can coordinate payment state, confirmation windows, and deterministic outcomes.",
    cta: "Return to dashboard",
  },
  metrics: {
    activeVouches: {
      label: "Active",
      body: "Invites created or waiting on the other party.",
    },
    pastVouches: {
      label: "Completed",
      body: "Completed, refunded, expired, or otherwise resolved.",
    },
    actionRequired: {
      label: "Action Required",
      body: "Items waiting on confirmation, provider readiness, or attention.",
    },
  },
  sections: {
    actionRequired: {
      title: "Action required",
      description: "Vouches that need your attention.",
      panelDescription: "The next thing to handle. No ambiguity, no buried state.",
      emptyText: "No Vouches need action right now.",
    },
    active: {
      title: "Active",
      description: "Vouches awaiting acceptance, authorization, or confirmation.",
      panelDescription: "Vouches waiting on acceptance, authorization, or confirmation.",
      emptyText: "No active Vouches.",
    },
    completed: {
      title: "Completed",
      description: "Final Vouches where both parties confirmed.",
      panelDescription: "Outcomes that followed system state.",
      emptyText: "No completed Vouches yet.",
    },
  },
  actions: {
    create: "Create",
    open: "Open",
  },
  cta: {
    title: "Create a Vouch",
    body: "Create the agreement, share the invite, and keep the next action tied to one Vouch object.",
    label: "Create Vouch",
  },
  fallbackDeadline: "No deadline",
} as const
