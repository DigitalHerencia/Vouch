"use client"

import { FileText, HelpCircle, Home, ShieldCheck } from "lucide-react"

import { MobileBottomNav, type MobileBottomNavItem } from "@/components/nav/mobile-bottom-nav"
import { publicNavigationContent } from "@/content/navigation"

const publicItems = [
  { kind: "link", href: "/", label: publicNavigationContent.links.home, icon: Home },
  { kind: "link", href: "/pricing", label: publicNavigationContent.links.pricing, icon: FileText },
  { kind: "link", href: "/faq", label: publicNavigationContent.links.faq, icon: HelpCircle },
  {
    kind: "link",
    href: "/sign-in",
    label: publicNavigationContent.links.signIn,
    icon: ShieldCheck,
  },
] satisfies readonly MobileBottomNavItem[]

export function PublicMobileBottomNav() {
  return <MobileBottomNav items={publicItems} aria-label={publicNavigationContent.labels.mobile} />
}
