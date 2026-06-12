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
    description: "This page does not exist, has moved, or is not available to your account.",
    searchPlaceholder: "Search for pages...",
    home: "Back to Home",
    back: "Go Back",
  },
} as const

export const checkoutSuccessContent = {
  eyebrow: "Checkout return",
  title: "Checking your Stripe payment status",
  description: "Vouch is checking Stripe before showing the current Vouch status.",
  notice:
    "Returning from Stripe does not by itself confirm payment or authorization. Open the dashboard or Vouch detail page to see the current status and next action.",
  errors: {
    missingSession: "This checkout return is missing the information Vouch needs to continue.",
    authorizationCheckout: "Vouch could not open the customer authorization checkout.",
    verifySession: "Vouch could not verify this Stripe checkout. Try opening the Vouch again.",
  },
  createAccount: "Create Vouch account",
  signIn: "Sign in",
  dashboard: "Return to dashboard",
} as const
