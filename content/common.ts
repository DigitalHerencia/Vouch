export const errorPageContent = {
  global: {
    eyebrow: "Server Error",
    title: "Service Unavailable",
    description: "Vouch could not finish this request. Try again or return home.",
  },
  public: {
    title: "Page unavailable",
    description: "This page could not load. Try again or return home.",
  },
  auth: {
    title: "Authentication view failed",
    description: "Sign-in or sign-up could not load. Try again or return home.",
  },
  tenant: {
    title: "Vouch page unavailable",
    description: "This page could not load. Try again or return to the dashboard.",
  },
  generic: {
    eyebrow: "Error",
    title: "Something went wrong",
    description: "An unexpected error occurred. Please try again later.",
  },
  server: {
    eyebrow: "Application error",
    title: "Vouch is unavailable",
    description: "The application could not finish this request. Try again, or return home.",
    reference: "Reference",
    retry: "Try again",
    home: "Back to home",
    supportPrompt: "Still having issues?",
    supportAction: "Contact support",
  },
  notFound: {
    title: "404",
    heading: "Page Not Found",
    description: "Oops! The page you're looking for doesn't exist or has been moved.",
    searchPlaceholder: "Search for pages...",
    home: "Back to Home",
    back: "Go Back",
  },
} as const

export const checkoutSuccessContent = {
  eyebrow: "Provider return",
  title: "Stripe returned you to Vouch.",
  description:
    "Vouch will use Stripe provider state, webhooks, and live provider retrieval to reconcile payment authorization before any confirmation or settlement outcome is shown as final.",
  notice:
    "This return page does not finalize payment truth. Use the dashboard or Vouch detail page to review the current provider-backed state.",
  createAccount: "Create Vouch account",
  signIn: "Sign in",
  dashboard: "Return to dashboard",
} as const
