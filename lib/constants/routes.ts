export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  setup: "/setup",
  settings: "/settings",
  vouches: "/vouches",
  newVouch: "/vouches/new",
  admin: "/admin",
} as const

export function vouchDetailPath(vouchId: string) {
  return `/vouches/${vouchId}`
}

export function vouchConfirmPath(vouchId: string) {
  return `/vouches/${vouchId}/confirm`
}

export function invitePath(token: string) {
  return `/vouches/invite/${token}`
}
