"use client"

import { Archive, Handshake, Home, Shield } from "lucide-react"

import {
  MobileBottomNav,
  type MobileBottomNavItem,
  type TenantStripeAction,
} from "@/components/nav/mobile-bottom-nav"
import { tenantNavigationContent } from "@/content/navigation"
import { vouchPageCopy } from "@/content/vouches"

type TenantMobileBottomNavProps = {
  connectAction?: TenantStripeAction
  connectReady: boolean
}

export function TenantMobileBottomNav({ connectAction, connectReady }: TenantMobileBottomNavProps) {
  const items = [
    {
      kind: "link",
      href: "/dashboard",
      label: tenantNavigationContent.links.dashboard,
      icon: Home,
    },
    {
      kind: "link",
      href: "/vouches/new",
      label: tenantNavigationContent.links.newVouch,
      icon: Handshake,
    },
    {
      kind: "action",
      label: tenantNavigationContent.links.stripe,
      icon: Shield,
      action: connectAction,
      warning: vouchPageCopy.providerRedirects[connectReady ? "connectDashboard" : "connect"],
    },
    {
      kind: "link",
      href: "/vouches/archive",
      label: tenantNavigationContent.links.archive,
      icon: Archive,
    },
  ] satisfies readonly MobileBottomNavItem[]

  return (
    <MobileBottomNav items={items} aria-label={tenantNavigationContent.labels.mobileNavigation} />
  )
}
