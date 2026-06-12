export const dashboardContent = {
  hero: {
    eyebrow: "Participant ledger",
    title: "Dashboard",
    body: "Here's what's happening with your Vouches. Amount, status, deadline, and consequence stay visible.",
  },
  readiness: {
    title: "Finish Stripe setup",
    body: "Your business must finish Stripe onboarding before you can create Vouches.",
    cta: "Continue Stripe setup",
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
  labels: {
    metrics: "Dashboard metrics",
    vouches: "Dashboard vouches",
    summary: "Vouch Summary",
    window: "Window",
    expires: "Expires",
    vouchIndex: "Vouch index",
    noRecords: "No records",
    role: "Role",
    amount: "Amount",
    deadline: "Deadline",
  },
  emptyState: {
    title: "No Vouches yet",
    description:
      "Create a Vouch when you are ready to protect an appointment deposit. Your drafts, active Vouches, and completed purchases will appear here.",
  },
  timeline: {
    emptyTitle: "No status events",
    emptyDescription: "Vouch events will appear here when they are recorded.",
  },
  cta: {
    title: "Create a Vouch",
    body: "Set the appointment and protected amount, pay the protocol fee, then share the customer authorization link.",
    label: "Create Vouch",
  },
  fallbackDeadline: "No deadline",
} as const
