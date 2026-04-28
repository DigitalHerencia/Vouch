import "server-only"

type SystemStateInput = {
  route?: string
  entityType?: string
  entityId?: string
  code?: string
  message?: string
  action?: string
}

export async function getGlobalLoadingShellState() {
  return {
    variant: "global_loading",
    title: "Loading Vouch",
    message: "Preparing the current state.",
  }
}

export async function getRouteLoadingSkeletonState(input?: SystemStateInput) {
  return {
    variant: "route_loading",
    route: input?.route ?? null,
    title: "Loading page",
    message: "Fetching the latest server state.",
  }
}

export async function getGlobalErrorState(input?: SystemStateInput) {
  return {
    variant: "global_error",
    code: input?.code ?? "GLOBAL_ERROR",
    title: "Something went wrong",
    message: input?.message ?? "The requested state could not be loaded.",
  }
}

export async function getProtectedRouteUnauthorizedState(input?: SystemStateInput) {
  return {
    variant: "unauthorized",
    route: input?.route ?? null,
    title: "Access required",
    message: input?.message ?? "Sign in with an eligible account to continue.",
  }
}

export async function getEntityNotFoundState(input?: SystemStateInput) {
  return {
    variant: "not_found",
    entityType: input?.entityType ?? "entity",
    entityId: input?.entityId ?? null,
    title: "Not found",
    message: input?.message ?? "The requested item does not exist or is not available to you.",
  }
}

export async function getServerActionFailureState(input?: SystemStateInput) {
  return {
    variant: "server_action_failure",
    action: input?.action ?? null,
    code: input?.code ?? "ACTION_FAILED",
    title: "Action failed",
    message: input?.message ?? "The server could not complete that action.",
  }
}

export async function getPaymentProviderUnavailableState(input?: SystemStateInput) {
  return {
    variant: "payment_provider_unavailable",
    code: input?.code ?? "PAYMENT_PROVIDER_UNAVAILABLE",
    title: "Payment provider unavailable",
    message:
      input?.message ??
      "Payment setup or payment resolution is temporarily unavailable. No manual fund decision was made.",
  }
}

export async function getMaintenanceOrDegradedServiceState(input?: SystemStateInput) {
  return {
    variant: "degraded_service",
    code: input?.code ?? "SERVICE_DEGRADED",
    title: "Service status notice",
    message:
      input?.message ??
      "Some operations may be delayed. Payment outcomes still follow the confirmation rules.",
  }
}
